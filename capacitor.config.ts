import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'de.marienico.wirzwei',
  appName: 'Wir Zwei',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0f0f0f',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0f0f',
    },
  },
}

export default config
