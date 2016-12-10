package com.android.raefox.raefox;

import android.content.res.Configuration;
import android.os.Build;
import android.os.Handler;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.ViewManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ImageView;


import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    // Set the duration of the splash screen
    private static final long SPLASH_SCREEN_DELAY = 2000;
    private static final long WEBVIEW_LOAD_DELAY = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        Runnable mLoadView;
        Handler mHandlerLoadView = new Handler();

        mLoadView = new Runnable() {

            @Override
            public void run() {
                WebView wv = (WebView) findViewById(R.id.webView);
                //wv.setWebViewClient(new WebViewClient());
                wv.setWebChromeClient(new WebChromeClient());

                WebSettings settings = wv.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setAllowFileAccessFromFileURLs(true);
                settings.setAllowUniversalAccessFromFileURLs(true);
                settings.setUserAgentString(Locale.getDefault().getLanguage());
                settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
                settings.setLoadsImagesAutomatically(true);

                /*
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    wv.setWebContentsDebuggingEnabled(true);
                }
                */

                wv.loadUrl("file:///android_asset/index.html#panel1");

            }
        };
        mHandlerLoadView.postDelayed(mLoadView, WEBVIEW_LOAD_DELAY);



        Runnable mRunnable;
        Handler mHandler = new Handler();

        mRunnable = new Runnable() {

            @Override
            public void run() {
                ImageView imageView = (ImageView) findViewById(R.id.splash);
                //imageView.setVisibility(View.GONE);
                ((ViewManager)imageView.getParent()).removeView(imageView);
            }
        };
        mHandler.postDelayed(mRunnable, SPLASH_SCREEN_DELAY);
    }

    // To not destroy the view in orientation changes
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

}
