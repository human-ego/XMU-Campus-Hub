package com.xmu.campushub.auth;

import android.webkit.CookieManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Fixed XMU schedule request client.
 *
 * It uses only the authenticated Android WebView CookieManager and the three
 * known wdkbapp endpoints. Raw response bodies and cookies never leave this
 * class; only sanitized course rows and period DTOs are returned to the plugin.
 */
final class XmuScheduleClient {
    private static final String JW_BASE = "https://jw.xmu.edu.cn";
    private static final String APP_ENTRY_URL =
        JW_BASE + "/gsapp/sys/wdkbapp/*default/index.do?EMAP_LANG=zh&THEME=cherry";
    private static final String TERM_URL =
        JW_BASE + "/gsapp/sys/wdkbapp/modules/xskcb/kfdxnxqcx.do";
    private static final String COURSE_URL =
        JW_BASE + "/gsapp/sys/wdkbapp/wdkcb/queryXspkjg.do";
    private static final String PERIOD_URL =
        JW_BASE + "/gsapp/sys/wdkbapp/wdkcb/queryXsskjc.do";
    private static final String REFERER = JW_BASE + "/new/index.html";
    private static final String USER_AGENT =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            + "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
    private static final int TIMEOUT_MS = 20_000;

    static final class Result {
        final String semesterCode;
        final JSArray periods;
        final JSArray courseRows;

        Result(String semesterCode, JSArray periods, JSArray courseRows) {
            this.semesterCode = semesterCode;
            this.periods = periods;
            this.courseRows = courseRows;
        }
    }

    static final class LoginRequiredException extends Exception {
        LoginRequiredException() {
            super("教务 Session 已失效");
        }
    }

    private static final class HttpResult {
        final int status;
        final String body;
        final String finalUrl;

        HttpResult(int status, String body, String finalUrl) {
            this.status = status;
            this.body = body;
            this.finalUrl = finalUrl;
        }
    }

    private XmuScheduleClient() {}

    static Result fetch(String studentNumber) throws Exception {
        request("GET", APP_ENTRY_URL, null, appHeaders());

        String termBody = request("POST", TERM_URL, "", apiHeaders()).body;
        String semesterCode = parseSemesterCode(termBody);

        String form =
            "XH=" + URLEncoder.encode(studentNumber, "UTF-8")
                + "&XNXQDM=" + URLEncoder.encode(semesterCode, "UTF-8");

        String courseBody = request("POST", COURSE_URL, form, apiHeaders()).body;
        JSArray courseRows = parseCourseRows(courseBody);

        String periodBody = request("POST", PERIOD_URL, form, apiHeaders()).body;
        JSArray periods = parsePeriods(periodBody);

        return new Result(semesterCode, periods, courseRows);
    }

    private static Map<String, String> appHeaders() {
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Accept", "*/*");
        return headers;
    }

    private static Map<String, String> apiHeaders() {
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put(
            "Content-Type",
            "application/x-www-form-urlencoded; charset=UTF-8"
        );
        headers.put("X-Requested-With", "XMLHttpRequest");
        headers.put("Referer", REFERER);
        headers.put("Origin", JW_BASE);
        return headers;
    }

    private static HttpResult request(
        String method,
        String url,
        String body,
        Map<String, String> headers
    ) throws Exception {
        String currentUrl = url;
        String currentMethod = method;
        String currentBody = body;

        for (int hop = 0; hop < 8; hop++) {
            HttpURLConnection connection =
                (HttpURLConnection) new URL(currentUrl).openConnection();
            connection.setConnectTimeout(TIMEOUT_MS);
            connection.setReadTimeout(TIMEOUT_MS);
            connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod(currentMethod);
            connection.setRequestProperty("User-Agent", USER_AGENT);
            connection.setRequestProperty("Accept", "*/*");
            connection.setRequestProperty(
                "Accept-Language",
                "zh-CN,zh;q=0.9,en;q=0.8"
            );

            String cookie = CookieManager.getInstance().getCookie(currentUrl);
            if (cookie != null && !cookie.trim().isEmpty()) {
                connection.setRequestProperty("Cookie", cookie);
            }
            for (Map.Entry<String, String> header : headers.entrySet()) {
                connection.setRequestProperty(header.getKey(), header.getValue());
            }

            if ("POST".equals(currentMethod) && currentBody != null) {
                connection.setDoOutput(true);
                byte[] bytes = currentBody.getBytes(StandardCharsets.UTF_8);
                try (OutputStream output = connection.getOutputStream()) {
                    output.write(bytes);
                }
            }

            int status;
            try {
                status = connection.getResponseCode();
            } finally {
                captureCookies(currentUrl, connection);
            }

            String location = connection.getHeaderField("Location");
            if (status >= 300 && status < 400 && location != null) {
                String nextUrl = new URL(new URL(currentUrl), location).toString();
                if (isIdsUrl(nextUrl)) {
                    connection.disconnect();
                    throw new LoginRequiredException();
                }

                if (status != 307 && status != 308) {
                    currentMethod = "GET";
                    currentBody = null;
                }
                currentUrl = nextUrl;
                connection.disconnect();
                continue;
            }

            String responseBody = readBody(connection, status);
            connection.disconnect();

            if (status == 401 || status == 403) {
                throw new LoginRequiredException();
            }
            if (status >= 400) {
                throw new IOException("教务系统返回 HTTP " + status);
            }
            if (isIdsUrl(currentUrl) || looksLikeLoginPage(responseBody)) {
                throw new LoginRequiredException();
            }

            return new HttpResult(status, responseBody, currentUrl);
        }

        throw new IOException("教务系统跳转次数过多");
    }

    private static void captureCookies(String url, HttpURLConnection connection) {
        List<String> cookies = new ArrayList<>();
        List<String> values = connection.getHeaderFields().get("Set-Cookie");
        if (values != null) {
            cookies.addAll(values);
        }
        values = connection.getHeaderFields().get("set-cookie");
        if (values != null) {
            cookies.addAll(values);
        }

        CookieManager cookieManager = CookieManager.getInstance();
        for (String cookie : cookies) {
            cookieManager.setCookie(url, cookie);
        }
        if (!cookies.isEmpty()) {
            cookieManager.flush();
        }
    }

    private static String readBody(HttpURLConnection connection, int status)
        throws IOException {
        InputStream stream =
            status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        if (stream == null) {
            return "";
        }

        try (
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(stream, StandardCharsets.UTF_8)
            )
        ) {
            StringBuilder builder = new StringBuilder();
            char[] buffer = new char[4096];
            int count;
            while ((count = reader.read(buffer)) != -1) {
                builder.append(buffer, 0, count);
            }
            return builder.toString();
        }
    }

    private static boolean isIdsUrl(String url) {
        try {
            java.net.URL parsed = new URL(url);
            return "ids.xmu.edu.cn".equals(parsed.getHost());
        } catch (Exception ignored) {
            return url.contains("ids.xmu.edu.cn");
        }
    }

    private static boolean looksLikeLoginPage(String body) {
        String value = body == null ? "" : body.trim();
        return value.startsWith("<")
            && value.contains("ids.xmu.edu.cn/authserver/login");
    }

    private static String parseSemesterCode(String body) throws Exception {
        JSONObject root = new JSONObject(body);
        JSONObject datas = root.optJSONObject("datas");
        JSONObject rowsObject =
            datas == null ? null : datas.optJSONObject("kfdxnxqcx");
        JSONArray rows =
            rowsObject == null ? null : rowsObject.optJSONArray("rows");
        if (rows == null || rows.length() == 0) {
            throw new IOException("教务系统未返回当前学期");
        }

        String semesterCode =
            rows.getJSONObject(0).optString("XNXQDM", "").trim();
        if (semesterCode.isEmpty()) {
            throw new IOException("当前学期代码为空");
        }
        return semesterCode;
    }

    private static JSArray parseCourseRows(String body) throws Exception {
        JSONObject root = new JSONObject(body);
        JSONArray rows = root.optJSONArray("pkjgList");
        if (rows == null) {
            JSONObject datas = root.optJSONObject("datas");
            rows = datas == null ? null : datas.optJSONArray("pkjgList");
        }
        if (rows == null) {
            throw new IOException("教务系统未返回课程数据");
        }

        JSArray output = new JSArray();
        for (int index = 0; index < rows.length(); index++) {
            JSONObject row = rows.optJSONObject(index);
            if (row == null) {
                continue;
            }

            JSObject dto = new JSObject();
            copyText(dto, row, "KCDM");
            copyText(dto, row, "KCMC");
            copyText(dto, row, "KCYWMC");
            copyText(dto, row, "BJMC");
            copyText(dto, row, "BJDM");
            copyText(dto, row, "JSXM");
            copyText(dto, row, "JASMC");
            copyInt(dto, row, "XQ");
            copyInt(dto, row, "KSJCDM");
            copyInt(dto, row, "JSJCDM");
            copyText(dto, row, "ZCBH");
            copyText(dto, row, "ZCMC");
            output.put(dto);
        }
        return output;
    }

    private static void copyText(JSObject output, JSONObject row, String key) {
        String value = row.optString(key, "").trim();
        if (!value.isEmpty()) {
            output.put(key, value);
        }
    }

    private static void copyInt(JSObject output, JSONObject row, String key) {
        Object value = row.opt(key);
        if (value instanceof Number) {
            output.put(key, ((Number) value).intValue());
            return;
        }

        String text = value == null ? "" : String.valueOf(value).trim();
        try {
            if (!text.isEmpty()) {
                output.put(key, Integer.parseInt(text));
            }
        } catch (NumberFormatException ignored) {
            // Invalid rows are left without this field and filtered by the parser.
        }
    }

    private static JSArray parsePeriods(String body) throws Exception {
        JSONObject root = new JSONObject(body);
        JSONArray rows = root.optJSONArray("data");
        if (rows == null) {
            rows = root.optJSONArray("rows");
        }

        JSArray output = new JSArray();
        if (rows != null) {
            for (int index = 0; index < rows.length(); index++) {
                JSONObject row = rows.optJSONObject(index);
                if (row == null) {
                    continue;
                }

                int period = row.optInt("DM", -1);
                String start = formatTime(row.opt("KSSJ"));
                String end = formatTime(row.opt("JSSJ"));
                if (period >= 1 && start != null && end != null) {
                    JSObject dto = new JSObject();
                    dto.put("period", period);
                    dto.put("start", start);
                    dto.put("end", end);
                    output.put(dto);
                }
            }
        }

        if (output.length() == 0) {
            return fallbackPeriods();
        }
        return output;
    }

    private static JSArray fallbackPeriods() {
        String[][] values = {
            {"1", "08:00", "08:45"},
            {"2", "08:55", "09:40"},
            {"3", "10:10", "10:55"},
            {"4", "11:05", "11:50"},
            {"5", "14:30", "15:15"},
            {"6", "15:25", "16:10"},
            {"7", "16:40", "17:25"},
            {"8", "17:35", "18:20"},
            {"9", "19:10", "19:55"},
            {"10", "20:05", "20:50"},
            {"11", "21:00", "21:45"},
        };

        JSArray output = new JSArray();
        for (String[] value : values) {
            JSObject dto = new JSObject();
            dto.put("period", Integer.parseInt(value[0]));
            dto.put("start", value[1]);
            dto.put("end", value[2]);
            output.put(dto);
        }
        return output;
    }

    private static String formatTime(Object value) {
        if (value == null || value == JSONObject.NULL) {
            return null;
        }

        if (value instanceof Number) {
            int number = ((Number) value).intValue();
            return String.format(
                Locale.US,
                "%02d:%02d",
                number / 100,
                number % 100
            );
        }

        String text = String.valueOf(value).trim();
        try {
            if (text.contains(":")) {
                String[] parts = text.split(":");
                if (parts.length >= 2) {
                    return String.format(
                        Locale.US,
                        "%02d:%02d",
                        Integer.parseInt(parts[0]),
                        Integer.parseInt(parts[1])
                    );
                }
            }

            String digits = text.replaceAll("\\D", "");
            if (digits.length() == 3 || digits.length() == 4) {
                int number = Integer.parseInt(digits);
                return String.format(
                    Locale.US,
                    "%02d:%02d",
                    number / 100,
                    number % 100
                );
            }
        } catch (NumberFormatException ignored) {
            return null;
        }
        return null;
    }
}

