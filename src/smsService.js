import * as SMS from 'expo-sms';
import { createTransaction, isSMSProcessed, markSMSProcessed, getCategories } from './database';
import { format } from 'date-fns';

// SMS parsing patterns for different banks and M-Pesa
const SMS_PATTERNS = {
  MPESA: {
    received: /([A-Z0-9]+)\s+Confirmed\..*?You have received\s+Ksh([\d,]+\.\d{2})\s+from\s+(.*?)\s+on/i,
    sent: /([A-Z0-9]+)\s+Confirmed\..*?Ksh([\d,]+\.\d{2})\s+sent to\s+(.*?)\s+on/i,
    withdraw: /([A-Z0-9]+)\s+Confirmed\..*?Ksh([\d,]+\.\d{2})\s+withdrawn from/i,
    airtime: /([A-Z0-9]+)\s+Confirmed\..*?You bought\s+Ksh([\d,]+\.\d{2})\s+of airtime/i,
    balance: /balance.*?Ksh([\d,]+\.\d{2})/i,
  },
  BANK: {
    debit: /(?:Acc|Account|A\/C).*?(?:debited|withdrawn|debit).*?(?:KES|Ksh|KSH)?\s*([\d,]+\.?\d*)/i,
    credit: /(?:Acc|Account|A\/C).*?(?:credited|deposited|credit).*?(?:KES|Ksh|KSH)?\s*([\d,]+\.?\d*)/i,
    balance: /(?:balance|bal|available).*?(?:KES|Ksh|KSH)?\s*([\d,]+\.?\d*)/i,
  },
};

// Category keywords for auto-categorization
const CATEGORY_KEYWORDS = {
  'Airtime & Data': ['airtime', 'data bundle', 'bundles', 'safaricom', 'airtel'],
  'Food & Dining': ['restaurant', 'food', 'cafe', 'coffee', 'dinner', 'lunch', 'breakfast', 'pizza', 'burger'],
  'Transportation': ['uber', 'bolt', 'taxi', 'fuel', 'petrol', 'parking', 'matatu'],
  'Shopping': ['shop', 'store', 'market', 'mall', 'purchase', 'buy'],
  'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert'],
  'Bills & Utilities': ['electricity', 'water', 'kplc', 'zuku', 'internet', 'rent', 'bill'],
  'Health & Fitness': ['hospital', 'pharmacy', 'doctor', 'gym', 'medical', 'clinic'],
  'Bank Charges': ['bank charges', 'transaction fee', 'service charge', 'withdrawal fee'],
  'Transfer': ['transfer', 'send money', 'sent to'],
};

export const parseSMSMessage = (message, sender) => {
  const result = {
    type: null,
    amount: null,
    description: '',
    source: sender,
    transactionId: null,
    needsCategorization: false,
    suggestedCategory: null,
  };

  // M-Pesa patterns
  if (sender.toLowerCase().includes('mpesa') || message.includes('M-PESA')) {
    // Received money (income)
    let match = message.match(SMS_PATTERNS.MPESA.received);
    if (match) {
      result.transactionId = match[1];
      result.amount = parseFloat(match[2].replace(/,/g, ''));
      result.type = 'income';
      result.description = `Received from ${match[3]}`;
      result.suggestedCategory = 'Other Income';
      return result;
    }

    // Sent money (expense)
    match = message.match(SMS_PATTERNS.MPESA.sent);
    if (match) {
      result.transactionId = match[1];
      result.amount = parseFloat(match[2].replace(/,/g, ''));
      result.type = 'expense';
      result.description = `Sent to ${match[3]}`;
      result.suggestedCategory = 'Transfer';
      return result;
    }

    // Airtime purchase
    match = message.match(SMS_PATTERNS.MPESA.airtime);
    if (match) {
      result.transactionId = match[1];
      result.amount = parseFloat(match[2].replace(/,/g, ''));
      result.type = 'expense';
      result.description = 'Airtime purchase';
      result.suggestedCategory = 'Airtime & Data';
      return result;
    }

    // Withdraw
    match = message.match(SMS_PATTERNS.MPESA.withdraw);
    if (match) {
      result.transactionId = match[1];
      result.amount = parseFloat(match[2].replace(/,/g, ''));
      result.type = 'expense';
      result.description = 'Cash withdrawal';
      result.suggestedCategory = 'Transfer';
      return result;
    }
  }

  // Bank SMS patterns
  // Credit (income)
  let match = message.match(SMS_PATTERNS.BANK.credit);
  if (match) {
    result.amount = parseFloat(match[1].replace(/,/g, ''));
    result.type = 'income';
    result.description = `Bank deposit from ${sender}`;
    result.suggestedCategory = 'Other Income';
    return result;
  }

  // Debit (expense)
  match = message.match(SMS_PATTERNS.BANK.debit);
  if (match) {
    result.amount = parseFloat(match[1].replace(/,/g, ''));
    result.type = 'expense';
    result.description = `Bank transaction`;
    result.needsCategorization = true;
    return result;
  }

  return null; // Not a financial SMS
};

export const categorizeTransaction = (description, categories) => {
  const lowerDesc = description.toLowerCase();
  
  // Try to match with keywords
  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        const category = categories.find(c => c.name === categoryName);
        if (category) {
          return category.id;
        }
      }
    }
  }
  
  return null;
};

export const processSMSMessages = async (userId, messages) => {
  const categories = await getCategories(userId);
  const processedTransactions = [];

  for (const msg of messages) {
    try {
      // Check if already processed
      const messageId = `${msg.address}_${msg.date}`;
      const isProcessed = await isSMSProcessed(userId, messageId);
      
      if (isProcessed) {
        continue;
      }

      // Parse the message
      const parsed = parseSMSMessage(msg.body, msg.address);
      
      if (parsed && parsed.amount) {
        // Auto-categorize
        let categoryId = null;
        let needsCategorization = false;

        if (parsed.suggestedCategory) {
          const category = categories.find(c => c.name === parsed.suggestedCategory);
          if (category) {
            categoryId = category.id;
          }
        }

        if (!categoryId) {
          categoryId = categorizeTransaction(parsed.description, categories);
        }

        // If still no category, assign to "Other" category
        if (!categoryId) {
          const otherCategory = categories.find(c => 
            c.name === (parsed.type === 'income' ? 'Other Income' : 'Other Expenses')
          );
          if (otherCategory) {
            categoryId = otherCategory.id;
          } else {
            // If "Other" category doesn't exist, flag for categorization
            needsCategorization = true;
          }
        }

        // Create transaction
        const transactionId = await createTransaction(
          userId,
          categoryId,
          parsed.amount,
          parsed.type,
          parsed.description,
          msg.body,
          format(new Date(msg.date), 'yyyy-MM-dd'),
          categoryId !== null,
          needsCategorization
        );

        // Mark SMS as processed
        await markSMSProcessed(userId, messageId, msg.address, msg.body);

        processedTransactions.push({
          id: transactionId,
          ...parsed,
          categoryId,
          needsCategorization,
        });
      }
    } catch (error) {
      console.error('Error processing SMS:', error);
    }
  }

  return processedTransactions;
};

export const checkSMSPermission = async () => {
  try {
    const { status } = await SMS.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking SMS permission:', error);
    return false;
  }
};
