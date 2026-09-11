package com.aexara.sellb2;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.CookieManager;
import android.webkit.RenderProcessGoneDetail;
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
    private WebView webView;
    private ValueCallback<Uri[]> fileChooserCallback;
    private View splash;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureSystemBars();
        WebView.setWebContentsDebuggingEnabled(false);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        setContentView(root);

        try {
            webView = new WebView(this);
            webView.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            webView.setBackgroundColor(BG);
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setDatabaseEnabled(true);
            webView.getSettings().setAllowFileAccess(true);
            webView.getSettings().setAllowContentAccess(true);
            webView.getSettings().setMediaPlaybackRequiresUserGesture(true);
            webView.getSettings().setSupportMultipleWindows(false);
            webView.getSettings().setBuiltInZoomControls(false);
            webView.getSettings().setDisplayZoomControls(false);
            webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
            webView.getSettings().setUserAgentString(webView.getSettings().getUserAgentString() + " SELLB2-Android/1.7");
            CookieManager.getInstance().setAcceptCookie(true);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

            webView.setWebViewClient(new WebViewClient() {
                @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String scheme = request.getUrl().getScheme();
                    if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) return false;
                    try { startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl())); } catch (Exception ignored) { }
                    return true;
                }
                @Override public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    hideSplash();
                }
                @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                    if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                    fileChooserCallback = null;
                    showRendererRecovery();
                    return true;
                }
            });

            webView.setWebChromeClient(new WebChromeClient() {
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
                    } catch (Exception e) {
                        fileChooserCallback = null;
                        return false;
                    }
                }
            });

            root.addView(webView);
            createSplash(root);
            if (savedInstanceState == null) webView.loadUrl(HOME_URL);
            else { webView.restoreState(savedInstanceState); hideSplash(); }
        } catch (Throwable fatal) {
            showStartupRecovery(root);
        }
    }

    private void createSplash(FrameLayout root) {
        TextView logo = new TextView(this);
        logo.setText("SELLB2");
        logo.setTextSize(42f);
        logo.setTypeface(android.graphics.Typeface.create("sans-serif", android.graphics.Typeface.BOLD));
        logo.setGravity(android.view.Gravity.CENTER);
        logo.setTextColor(Color.rgb(201, 203, 214));
        logo.setBackgroundColor(BG);
        logo.setContentDescription("SELLB2");
        logo.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        splash = logo;
        root.addView(logo);
    }

    private void hideSplash() {
        if (splash == null) return;
        splash.animate().alpha(0f).setDuration(160).withEndAction(() -> {
            if (splash != null) splash.setVisibility(View.GONE);
        }).start();
    }

    private void showRendererRecovery() {
        if (splash != null) splash.setVisibility(View.GONE);
        if (webView != null) webView.setVisibility(View.GONE);
        TextView recovery = new TextView(this);
        recovery.setText("SELLB2\n\nThe web engine restarted.\nTap to reload.");
        recovery.setTextSize(18f);
        recovery.setTextColor(Color.WHITE);
        recovery.setGravity(android.view.Gravity.CENTER);
        recovery.setBackgroundColor(BG);
        recovery.setOnClickListener(v -> recreate());
        addContentView(recovery, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private void showStartupRecovery(FrameLayout root) {
        root.removeAllViews();
        TextView recovery = new TextView(this);
        recovery.setText("SELLB2\n\nUnable to start the app engine.\nTap to retry.");
        recovery.setTextSize(18f);
        recovery.setTextColor(Color.WHITE);
        recovery.setGravity(android.view.Gravity.CENTER);
        recovery.setBackgroundColor(BG);
        recovery.setOnClickListener(v -> recreate());
        root.addView(recovery);
    }

    private String resolveMimeType(WebChromeClient.FileChooserParams params) {
        if (params == null || params.getAcceptTypes() == null || params.getAcceptTypes().length == 0) return "image/*";
        for (String type : params.getAcceptTypes()) {
            if (type == null) continue;
            String t = type.trim();
            if (t.contains("/")) return t;
            if (t.equalsIgnoreCase("image")) return "image/*";
        }
        return "image/*";
    }

    private void configureSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(BG);
        window.setNavigationBarColor(BG);
        if (Build.VERSION.SDK_INT >= 29) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            ArrayList<Uri> uris = new ArrayList<>();
            ClipData clipData = data.getClipData();
            if (clipData != null) {
                for (int i = 0; i < clipData.getItemCount(); i++) if (clipData.getItemAt(i).getUri() != null) uris.add(clipData.getItemAt(i).getUri());
            } else if (data.getData() != null) uris.add(data.getData());
            if (!uris.isEmpty()) {
                result = uris.toArray(new Uri[0]);
                for (Uri uri : result) try { getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (Exception ignored) { }
            }
        }
        if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(result);
        fileChooserCallback = null;
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }
    @Override protected void onDestroy() {
        if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
        fileChooserCallback = null;
        if (webView != null) { webView.stopLoading(); webView.destroy(); }
        super.onDestroy();
    }
}
