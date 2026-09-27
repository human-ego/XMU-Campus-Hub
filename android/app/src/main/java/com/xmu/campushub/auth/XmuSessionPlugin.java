package com.xmu.campushub.auth;

import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.webkit.CookieManager;
import android.webkit.WebView;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebViewClient;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Minimal XMU auth/session bridge.
 *
 * It intentionally exposes only fixed auth/session/schedule operations. It has no arbitrary
 * URL request API and never returns cookies, tokens, or page bodies to JS.
 */
@CapacitorPlugin(name = "XmuSession")
public class XmuSessionPlugin extends Plugin {
    private static final String PROBE_URL =
        "https://jw.xmu.edu.cn/gsapp/sys/wdkbapp/*default/index.do?EMAP_LANG=zh&THEME=cherry";
    private static final long PROBE_TIMEOUT_MS = 20_000L;

    private Handler handler;
    private WebView probeWebView;
    private PluginCall pendingProbeCall;
    private boolean probeResolved;

    private final Runnable probeTimeout = () -> resolveProbe(
        "error",
        "无法访问厦大教务系统"
    );

    @Override
    public void load() {
        handler = new Handler(Looper.getMainLooper());
    }

    @PluginMethod
    public void openXmuOfficialLogin(PluginCall call) {
        try {
            Intent intent = new Intent(getActivity(), XmuLoginActivity.class);
            getActivity().startActivity(intent);
            JSObject result = new JSObject();
            result.put("status", "opened");
            call.resolve(result);
        } catch (Exception exception) {
            resolveActionError(call, "无法打开厦大官方登录页面");
        }
    }

    @PluginMethod
    public void probeXmuJwSession(PluginCall call) {
        getBridge().executeOnMainThread(() -> startProbe(call));
    }


    @PluginMethod
    public void fetchXmuSchedule(PluginCall call) {
        String studentNumber = call.getString("studentNumber", "").trim();
        if (studentNumber.isEmpty()) {
            resolveActionError(call, "请输入本人学号");
            return;
        }

        new Thread(() -> {
            try {
                XmuScheduleClient.Result result =
                    XmuScheduleClient.fetch(studentNumber);
                JSObject data = new JSObject();
                data.put("success", true);
                data.put("status", "success");
                data.put("semesterCode", result.semesterCode);
                data.put("periods", result.periods);
                data.put("courseRows", result.courseRows);
                resolveOnMainThread(call, data);
            } catch (XmuScheduleClient.LoginRequiredException exception) {
                JSObject data = new JSObject();
                data.put("success", false);
                data.put("status", "login-required");
                data.put("message", "教务 Session 已失效，请重新登录");
                resolveOnMainThread(call, data);
            } catch (Exception exception) {
                JSObject data = new JSObject();
                data.put("success", false);
                data.put("status", "error");
                data.put("message", "无法读取厦大课表数据");
                resolveOnMainThread(call, data);
            }
        }).start();
    }

    @PluginMethod
    public void clearXmuSession(PluginCall call) {
        getBridge().executeOnMainThread(() -> clearSession(call));
    }

    private void startProbe(PluginCall call) {
        if (pendingProbeCall != null) {
            resolveActionError(call, "已有 Session 验证正在进行");
            return;
        }

        pendingProbeCall = call;
        probeResolved = false;

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);

        WebView webView = new WebView(getActivity());
        cookieManager.setAcceptThirdPartyCookies(webView, true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setMixedContentMode(
            android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        );
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (isIdsLoginUrl(url)) {
                    resolveProbe(
                        "login-required",
                        "登录成功，但教务系统 Session 验证失败"
                    );
                    return;
                }

                if (isJwProbeUrl(url)) {
                    resolveProbe(
                        "verified",
                        "厦大账号认证成功，教务 Session 可访问"
                    );
                    return;
                }

                resolveProbe("error", "教务系统返回了非预期地址");
            }

            @Override
            public void onReceivedError(
                WebView view,
                WebResourceRequest request,
                WebResourceError error
            ) {
                if (request.isForMainFrame()) {
                    resolveProbe("error", "无法访问厦大教务系统");
                }
            }

            @Override
            public void onReceivedHttpError(
                WebView view,
                WebResourceRequest request,
                WebResourceResponse errorResponse
            ) {
                if (request.isForMainFrame() && errorResponse.getStatusCode() >= 400) {
                    resolveProbe("error", "教务系统返回了异常响应");
                }
            }
        });

        probeWebView = webView;
        handler.postDelayed(probeTimeout, PROBE_TIMEOUT_MS);
        webView.loadUrl(PROBE_URL);
    }

    private void clearSession(PluginCall call) {
        try {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.removeAllCookies(removed -> {
                cookieManager.flush();

                WebView appWebView = getBridge().getWebView();
                if (appWebView != null) {
                    appWebView.clearCache(true);
                }

                JSObject result = new JSObject();
                result.put("status", "cleared");
                getBridge().executeOnMainThread(() -> call.resolve(result));
            });
        } catch (Exception exception) {
            resolveActionError(call, "无法清理厦大认证 Session");
        }
    }

    private void resolveProbe(String status, String message) {
        if (probeResolved || pendingProbeCall == null) {
            return;
        }

        probeResolved = true;
        handler.removeCallbacks(probeTimeout);

        PluginCall call = pendingProbeCall;
        pendingProbeCall = null;

        JSObject result = new JSObject();
        result.put("status", status);
        result.put("message", message);
        call.resolve(result);
        destroyProbeWebView();
    }

    private void destroyProbeWebView() {
        if (probeWebView == null) {
            return;
        }

        probeWebView.stopLoading();
        probeWebView.setWebViewClient(null);
        probeWebView.destroy();
        probeWebView = null;
    }

    private boolean isIdsLoginUrl(String url) {
        Uri uri = Uri.parse(url);
        String host = uri.getHost();
        String path = uri.getPath();
        return "ids.xmu.edu.cn".equals(host)
            && path != null
            && path.startsWith("/authserver/login");
    }

    private boolean isJwProbeUrl(String url) {
        Uri uri = Uri.parse(url);
        return "jw.xmu.edu.cn".equals(uri.getHost())
            && uri.getPath() != null
            && uri.getPath().startsWith("/gsapp/sys/wdkbapp/");
    }


    private void resolveOnMainThread(PluginCall call, JSObject result) {
        getBridge().executeOnMainThread(() -> call.resolve(result));
    }

    private void resolveActionError(PluginCall call, String message) {
        JSObject result = new JSObject();
        result.put("status", "error");
        result.put("message", message);
        call.resolve(result);
    }
}






