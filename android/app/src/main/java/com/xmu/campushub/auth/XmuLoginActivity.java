package com.xmu.campushub.auth;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Official XMU login WebView. Credentials are entered only on the school page.
 */
public class XmuLoginActivity extends AppCompatActivity {
    private static final String LOGIN_URL = "https://jw.xmu.edu.cn/login";
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        Button returnButton = new Button(this);
        returnButton.setText("返回 App");
        returnButton.setAllCaps(false);
        returnButton.setOnClickListener(view -> finish());
        root.addView(
            returnButton,
            new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        );

        webView = new WebView(this);
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (isJwSessionUrl(url)) {
                    CookieManager.getInstance().flush();
                    view.postDelayed(XmuLoginActivity.this::finish, 100L);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                WebView view,
                WebResourceRequest request
            ) {
                String scheme = request.getUrl().getScheme();
                return scheme != null
                    && !scheme.equals("http")
                    && !scheme.equals("https");
            }
        });

        LinearLayout.LayoutParams webViewParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0,
            1f
        );
        root.addView(webView, webViewParams);
        setContentView(root);
        webView.loadUrl(LOGIN_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        CookieManager.getInstance().flush();
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private boolean isJwSessionUrl(String url) {
        Uri uri = Uri.parse(url);
        String host = uri.getHost();
        String path = uri.getPath();
        return "jw.xmu.edu.cn".equals(host)
            && path != null
            && (path.equals("/new/index.html")
                || path.startsWith("/gsapp/sys/wdkbapp/"));
    }
}
