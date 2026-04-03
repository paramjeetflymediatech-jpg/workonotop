import { Platform } from 'react-native';

// Deelopment (local testing)
// Host IP: 192.168.1.146 (from Ethernet adapter)
const DEV_URL = Platform.OS === 'android' ? "http://10.0.2.2:3000" : "http://192.168.1.22:3000";

export const API_BASE_URL = DEV_URL;

// Production
// export const API_BASE_URL = "https://workontap.com";