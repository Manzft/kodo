package com.manzft.kodo;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        new Thread(() -> {
            if (!Python.isStarted()) {
                Python.start(new AndroidPlatform(this));
            }
            Python py = Python.getInstance();
            py.getModule("kodo_server").callAttr("start");

            runOnUiThread(() -> {
                WebView wv = getBridge().getWebView();
                if (wv != null) {
                    wv.loadUrl("http://127.0.0.1:5000");
                }
            });
        }).start();
    }
}
