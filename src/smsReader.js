import { NativeModules, Platform } from 'react-native';

const { SmsReader } = NativeModules;

if (!SmsReader && Platform.OS === 'android') {
  console.warn('SmsReader native module not found. Make sure to rebuild the app.');
}

export const requestSMSPermission = async () => {
  try {
    if (!SmsReader) {
      console.error('SmsReader module not available');
      return false;
    }
    const granted = await SmsReader.requestPermission();
    return granted;
  } catch (error) {
    console.error('Error requesting SMS permission:', error);
    return false;
  }
};

export const checkSMSPermission = async () => {
  try {
    if (!SmsReader) {
      console.error('SmsReader module not available');
      return false;
    }
    const granted = await SmsReader.checkPermission();
    return granted;
  } catch (error) {
    console.error('Error checking SMS permission:', error);
    return false;
  }
};

export const readSMSMessages = async (maxCount = 500) => {
  try {
    if (!SmsReader) {
      console.error('SmsReader module not available');
      return [];
    }
    const messages = await SmsReader.readSMS(maxCount);
    return messages;
  } catch (error) {
    console.error('Error reading SMS:', error);
    return [];
  }
};

export default {
  requestSMSPermission,
  checkSMSPermission,
  readSMSMessages,
};
