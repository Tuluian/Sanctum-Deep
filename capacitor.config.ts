import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sanctumruins.game',
  appName: 'Sanctum Ruins',
  webDir: 'dist',
  server: {
    // Use HTTPS scheme for better security
    iosScheme: 'https',
    androidScheme: 'https',
  },
  ios: {
    // Handle notch and home indicator properly
    contentInset: 'automatic',
    // Optimize for mobile game experience
    preferredContentMode: 'mobile',
    // Prevent white flash on load
    backgroundColor: '#1a1a2e',
  },
  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      launchAutoHide: true,
    },
  },
};

export default config;
