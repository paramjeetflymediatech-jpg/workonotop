import { Platform } from 'react-native';

// Production
export const API_BASE_URL = "https://workontap.com";
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCXYDPiTcgW59JVMY9TnFPxMcOVbRE29_g";

// Development (Uncomment to use local backend)
// const DEV_URL = Platform.OS === 'android' ? "http://192.168.1.9:3000" : "http://localhost:3000";
// export const API_BASE_URL = DEV_URL;
