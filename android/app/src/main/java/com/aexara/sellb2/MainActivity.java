package com.aexara.sellb2;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.MimeTypeMap;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 4101;
    private static final String HOME_URL = "https://estatenova-ten.vercel.app/";
    private static final int BG = Color.rgb(7, 11, 22);

    private FrameLayout root;
    private WebView webView;
    private View splash;
    private ValueCallback<Uri[]> fileChooserCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureSystemBars();

        root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        setContentView(root);

        showSplash();
        startWebView();
    }

    private void startWebView() {
        try {
            WebView w = new WebView(this);
            w.setLayoutParams(new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));
            w.setBackgroundColor(BG);

            w.getSettings().setJavaScriptEnabled(true);
            w.getSettings().setDomStorageEnabled(true);
            w.getSettings().setDatabaseEnabled(true);
            w.getSettings().setAllowFileAccess(true);
            w.getSettings().setAllowContentAccess(true);
            w.getSettings().setSupportMultipleWindows(false);
            w.getSettings().setBuiltInZoomControls(false);
            w.getSettings().setDisplayZoomControls(false);
            w.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
            w.getSettings().setMediaPlaybackRequiresUserGesture(true);
            w.getSettings().setUserAgentString(
                    w.getSettings().getUserAgentString() + " SELLB2-Android/2.0.0");

            CookieManager.getInstance().setAcceptCookie(true);
            CookieManager.getInstance().setAcceptThirdPartyCookies(w, true);

            w.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return handleNavigation(request.getUrl());
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    try {
                        return handleNavigation(Uri.parse(url));
                    } catch (Throwable ignored) {
                        return false;
                    }
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    hideSplash();
                }

                @Override
                public void onReceivedError(WebView view, WebResourceRequest request,
                                            WebResourceError error) {
                    if (request.isForMainFrame()) {
                        hideSplash();
                        showRecoveryMessage();
                    }
                }
            });

            w.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onShowFileChooser(
                        WebView view,
                        ValueCallback<Uri[]> callback,
                        FileChooserParams params) {
                    if (fileChooserCallback != null) {
                        fileChooserCallback.onReceiveValue(null);
                    }

                    fileChooserCallback = callback;
                    try {
                        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType(resolveMimeType(params));

                        boolean multiple = params != null
                                && params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE;
                        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);
                        intent.addFlags(
                                Intent.FLAG_GRANT_READ_URI_PERMISSION
                                        | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);

                        startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                        return true;
                    } catch (Throwable ignored) {
                        fileChooserCallback = null;
                        return false;
                    }
                }

                @Override
                public void onPermissionRequest(PermissionRequest request) {
                    request.deny();
                }
            });

            w.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                            String mimetype, long contentLength) {
                    downloadFile(url, userAgent, contentDisposition, mimetype);
                }
            });

            root.addView(w);
            webView = w;
            w.loadUrl(HOME_URL);
        } catch (Throwable error) {
            showRecoveryMessage();
        }
    }

    private boolean handleNavigation(Uri uri) {
        if (uri == null) return false;

        String scheme = uri.getScheme();
        if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
            return false;
        }

        try {
            Intent intent;
            if ("intent".equalsIgnoreCase(scheme)) {
                intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
            } else {
                intent = new Intent(Intent.ACTION_VIEW, uri);
            }

            if (intent.resolveActivity(getPackageManager()) != null) {
                startActivity(intent);
            }
        } catch (Throwable ignored) {
        }
        return true;
    }

    private void downloadFile(String url, String userAgent, String contentDisposition,
                              String mimetype) {
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            if (mimetype != null && !mimetype.isEmpty()) request.setMimeType(mimetype);
            if (userAgent != null) request.addRequestHeader("User-Agent", userAgent);

            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null) request.addRequestHeader("Cookie", cookies);

            request.setTitle("Sellb2 download");
            request.setDescription("Downloading file");
            request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    guessFileName(url, contentDisposition, mimetype));

            DownloadManager manager =
                    (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (manager != null) manager.enqueue(request);
        } catch (Throwable ignored) {
        }
    }

    private String guessFileName(String url, String contentDisposition, String mimetype) {
        String name = null;

        try {
            if (contentDisposition != null) {
                String marker = "filename=";
                int index = contentDisposition.toLowerCase().indexOf(marker);
                if (index >= 0) {
                    name = contentDisposition.substring(index + marker.length())
                            .replace("\"", "")
                            .trim();
                }
            }
        } catch (Throwable ignored) {
        }

        if (name == null || name.isEmpty()) {
            try {
                String path = Uri.parse(url).getLastPathSegment();
                if (path != null && !path.isEmpty() && !path.contains("?")) name = path;
            } catch (Throwable ignored) {
            }
        }

        if (name == null || name.isEmpty()) {
            String extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimetype);
            name = "sellb2-download" + (extension == null ? "" : "." + extension);
        }

        return name.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private void showSplash() {
        ImageView logo = new ImageView(this);
        logo.setImageResource(com.aexara.sellb2.R.drawable.sellb2_logo);
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        logo.setAdjustViewBounds(true);
        logo.setContentDescription("Sellb2");
        logo.setPadding(dp(24), dp(24), dp(24), dp(24));
        logo.setBackgroundColor(BG);
        logo.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        splash = logo;
        root.addView(logo);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void hideSplash() {
        if (splash != null) splash.setVisibility(View.GONE);
    }

    private void showRecoveryMessage() {
        if (root == null) return;

        if (webView != null) {
            root.removeView(webView);
            try {
                webView.stopLoading();
                webView.destroy();
            } catch (Throwable ignored) {
            }
            webView = null;
        }

        if (splash != null) splash.setVisibility(View.GONE);

        TextView message = new TextView(this);
        message.setText("Sellb2\n\nConnection problem.\nTap anywhere to retry.");
        message.setTextSize(18f);
        message.setGravity(Gravity.CENTER);
        message.setTextColor(Color.WHITE);
        message.setBackgroundColor(BG);
        message.setOnClickListener(v -> {
            root.removeAllViews();
            showSplash();
            startWebView();
        });

        root.addView(message);
    }

    private String resolveMimeType(WebChromeClient.FileChooserParams params) {
        if (params == null || params.getAcceptTypes() == null
                || params.getAcceptTypes().length == 0) {
            return "*/*";
        }

        for (String type : params.getAcceptTypes()) {
            if (type == null) continue;
            String t = type.trim();
            if (t.contains("/")) return t;
        }

        return "*/*";
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

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode != FILE_CHOOSER_REQUEST) return;

        Uri[] result = null;

        if (resultCode == RESULT_OK && data != null) {
            ArrayList<Uri> uris = new ArrayList<>();
            ClipData clip = data.getClipData();

            if (clip != null) {
                for (int i = 0; i < clip.getItemCount(); i++) {
                    Uri uri = clip.getItemAt(i).getUri();
                    if (uri != null) uris.add(uri);
                }
            } else if (data.getData() != null) {
                uris.add(data.getData());
            }

            if (!uris.isEmpty()) result = uris.toArray(new Uri[0]);
        }

        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(result);
        }
        fileChooserCallback = null;
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
        }
        fileChooserCallback = null;

        if (webView != null) {
            try {
                webView.stopLoading();
                webView.setWebChromeClient(null);
                webView.setWebViewClient(null);
                webView.destroy();
            } catch (Throwable ignored) {
            }
            webView = null;
        }

        super.onDestroy();
    }
}