package com.cashkelli

import android.Manifest
import android.content.ContentResolver
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Telephony
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

class SmsReaderModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), PermissionListener {

    private var permissionPromise: Promise? = null

    override fun getName(): String {
        return "SmsReader"
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        val activity = getCurrentActivity() as? PermissionAwareActivity

        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        permissionPromise = promise

        val permissions = arrayOf(
            Manifest.permission.READ_SMS,
            Manifest.permission.RECEIVE_SMS
        )

        activity.requestPermissions(permissions, 1, this)
    }

    @ReactMethod
    fun checkPermission(promise: Promise) {
        val context = reactApplicationContext
        val permission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_SMS
        )

        promise.resolve(permission == PackageManager.PERMISSION_GRANTED)
    }

    @ReactMethod
    fun readSMS(maxCount: Int, promise: Promise) {
        val context = reactApplicationContext

        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_SMS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            promise.reject("E_PERMISSION_DENIED", "READ_SMS permission not granted")
            return
        }

        try {
            val messages = WritableNativeArray()
            val contentResolver: ContentResolver = context.contentResolver
            val uri = Telephony.Sms.CONTENT_URI
            val projection = arrayOf(
                Telephony.Sms._ID,
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.DATE,
                Telephony.Sms.TYPE
            )

            val cursor = contentResolver.query(
                uri,
                projection,
                null,
                null,
                "${Telephony.Sms.DATE} DESC"
            )

            if (cursor != null) {
                var count = 0
                val idIndex = cursor.getColumnIndex(Telephony.Sms._ID)
                val addressIndex = cursor.getColumnIndex(Telephony.Sms.ADDRESS)
                val bodyIndex = cursor.getColumnIndex(Telephony.Sms.BODY)
                val dateIndex = cursor.getColumnIndex(Telephony.Sms.DATE)
                val typeIndex = cursor.getColumnIndex(Telephony.Sms.TYPE)

                while (cursor.moveToNext() && count < maxCount) {
                    val message = WritableNativeMap()
                    message.putString("id", cursor.getString(idIndex))
                    message.putString("address", cursor.getString(addressIndex))
                    message.putString("body", cursor.getString(bodyIndex))
                    message.putDouble("date", cursor.getLong(dateIndex).toDouble())
                    message.putInt("type", cursor.getInt(typeIndex))

                    messages.pushMap(message)
                    count++
                }

                cursor.close()
            }

            promise.resolve(messages)
        } catch (e: Exception) {
            promise.reject("E_READ_SMS_FAILED", e.message, e)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ): Boolean {
        if (requestCode == 1) {
            val granted = grantResults.isNotEmpty() &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED

            permissionPromise?.resolve(granted)
            permissionPromise = null
            return true
        }
        return false
    }
}
