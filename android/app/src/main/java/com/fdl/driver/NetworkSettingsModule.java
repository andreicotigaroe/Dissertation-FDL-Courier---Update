package com.fdl.driver;

import android.content.Context;
import android.net.ConnectivityManager;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.HashMap;

public class NetworkSettingsModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    NetworkSettingsModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "NetworkSettings";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public Boolean isMobileDataEnabled(){
        ConnectivityManager cm = (ConnectivityManager) reactContext.getSystemService(ReactApplicationContext.CONNECTIVITY_SERVICE);

        try {
            Class<?> c = Class.forName(cm.getClass().getName());
            Method m = c.getDeclaredMethod("getMobileDataEnabled");
            m.setAccessible(true);
            return (Boolean)m.invoke(cm);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
