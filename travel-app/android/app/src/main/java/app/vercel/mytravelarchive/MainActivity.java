package app.vercel.mytravelarchive;

import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // 상태바를 투명하게 설정
        window.setStatusBarColor(android.graphics.Color.TRANSPARENT);
        
        // Edge-to-Edge 모드 활성화
        WindowCompat.setDecorFitsSystemWindows(window, false);
        
        // 초기 방향에 따라 상태바 처리
        updateSystemBars();
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        
        // 화면 방향이 변경될 때 상태바 처리
        updateSystemBars();
    }
    
    private void updateSystemBars() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        
        int orientation = getResources().getConfiguration().orientation;
        
        if (orientation == Configuration.ORIENTATION_LANDSCAPE) {
            // 가로모드: 상태바 완전히 숨기기 (Immersive Mode)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = window.getInsetsController();
                if (controller != null) {
                    controller.hide(WindowInsets.Type.statusBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            } else {
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );
            }
        } else {
            // 세로모드: 상태바 표시, 투명하게
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = window.getInsetsController();
                if (controller != null) {
                    controller.show(WindowInsets.Type.statusBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_DEFAULT);
                }
            } else {
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                );
            }
            
            // 상태바 아이콘을 밝게 (어두운 배경용)
            WindowInsetsControllerCompat controllerCompat = WindowCompat.getInsetsController(window, decorView);
            if (controllerCompat != null) {
                controllerCompat.setAppearanceLightStatusBars(false);
            }
        }
    }
}
