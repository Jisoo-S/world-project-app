import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vercel.mytravelarchive',
  appName: 'My Travel Archive',
  webDir: 'build',
  server: {
    hostname: 'mytravel-archive.vercel.app',
    iosScheme: 'https'
  }
};  

export default config;
