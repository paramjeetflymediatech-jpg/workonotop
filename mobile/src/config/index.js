import { Platform } from 'react-native';

// Deelopment (local testing)
// Host IP: 192.168.1.146 (from Ethernet adapter)
// const DEV_URL = Platform.OS === 'android' ? "http://192.168.1.146:3000" : "http://[IP_ADDRESS]";
// console.log(DEV_URL, '-api')
// export const API_BASE_URL = DEV_URL;

// Production
// export const API_BASE_URL = "https://workontap.com";


const DEV_URL = "http://192.168.1.14:3000";
console.log(DEV_URL, '-api');
export const API_BASE_URL = DEV_URL;