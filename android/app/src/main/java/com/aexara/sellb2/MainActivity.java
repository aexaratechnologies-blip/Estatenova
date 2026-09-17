package com.aexara.sellb2;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

import java.util.ArrayList;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 4101;
    private static final String HOME_URL = "https://estatenova-ten.vercel.app/";
    private static final int BG = Color.rgb(7, 11, 22);
    private FrameLayout root;
    private WebView webView;
    private TextView splash;
    private ValueCallback<Uri[]> fileChooserCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureSystemBars();
        WebView.setWebContentsDebuggingEnabled(false);
        root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        setContentView(root);
        showSplash();
        try { startWebView(); } catch (Throwable ignored) { showRecoveryMessage(); }
    }

    private void startWebView() {
        WebView w = new WebView(this);
        w.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        w.setBackgroundColor(BG);
        w.getSettings().setJavaScriptEnabled(true);
        w.getSettings().setDomStorageEnabled(true);
        w.getSettings().setAllowFileAccess(true);
        w.getSettings().setAllowContentAccess(true);
        w.getSettings().setSupportMultipleWindows(false);
        w.getSettings().setBuiltInZoomControls(false);
        w.getSettings().setDisplayZoomControls(false);
        w.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        w.getSettings().setMediaPlaybackRequiresUserGesture(true);
        w.getSettings().setUserAgentString(w.getSettings().getUserAgentString() + " SELLB2-Android/2.1");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(w, true);
        w.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String scheme = request.getUrl().getScheme();
                return !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme));
            }
            @Override public void onPageFinished(WebView view, String url) { hideSplash(); }
        });
        w.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                fileChooserCallback = callback;
                try {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType(resolveMimeType(params));
                    boolean multiple = params != null && params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE;
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Throwable ignored) { fileChooserCallback = null; return false; }
            }
        });
        root.addView(w);
        webView = w;
        w.loadUrl(HOME_URL);
    }

    private void showSplash() {
        splash = new TextView(this);
        splash.setText("SELLB2");
        splash.setTextSize(42f);
        splash.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        splash.setGravity(Gravity.CENTER);
        splash.setTextColor(Color.rgb(241, 243, 248));
        splash.setBackgroundColor(BG);
        splash.setContentDescription("SELLB2");
        splash.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        root.addView(splash);
    }

    private void hideSplash() { if (splash != null) splash.setVisibility(View.GONE); }

    private void showRecoveryMessage() {
        if (root == null) return;
        root.removeAllViews();
        TextView message = new TextView(this);
        message.setText("SELLB2\n\nUnable to start.\nTap to retry.");
        message.setTextSize(18f);
        message.setGravity(Gravity.CENTER);
        message.setTextColor(Color.WHITE);
        message.setBackgroundColor(BG);
        message.setOnClickListener(v -> {
            root.removeAllViews(); showSplash();
            try { startWebView(); } catch (Throwable ignored) { showRecoveryMessage(); }
        });
        root.addView(message);
    }

    private String resolveMimeType(WebChromeClient.FileChooserParams params) {
        if (params == null || params.getAcceptTypes() == null || params.getAcceptTypes().length == 0) return "image/*";
        for (String type : params.getAcceptTypes()) {
            if (type == null) continue;
            String t = type.trim();
            if (t.contains("/")) return t;
            if ("image".equalsIgnoreCase(t)) return "image/*";
        }
        return "image/*";
    }

    private void configureSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(BG);
        window.setNavigationBarColor(BG);
        if (android.os.Build.VERSION.SDK_INT >= 29) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            ArrayList<Uri> uris = new ArrayList<>();
            ClipData clip = data.getClipData();
            if (clip != null) {
                for (int i = 0; i < clip.getItemCount(); i++) if (clip.getItemAt(i).getUri() != null) uris.add(clip.getItemAt(i).getUri());
            } else if (data.getData() != null) uris.add(data.getData());
            if (!uris.isEmpty()) result = uris.toArray(new Uri[0]);
        }
        if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(result);
        fileChooserCallback = null;
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
        fileChooserCallback = null;
        if (webView != null) {
            try { webView.stopLoading(); webView.setWebChromeClient(null); webView.setWebViewClient(null); webView.destroy(); } catch (Throwable ignored) { }
            webView = null;
        }
        super.onDestroy();
    }
}
