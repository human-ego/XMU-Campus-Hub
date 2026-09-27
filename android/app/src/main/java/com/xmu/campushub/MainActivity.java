package com.xmu.campushub;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.xmu.campushub.auth.XmuSessionPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        initialPlugins.add(XmuSessionPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
