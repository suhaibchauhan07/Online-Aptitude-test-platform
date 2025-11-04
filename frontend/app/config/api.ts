// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : process.env.NEXT_PUBLIC_API_URL || 'https://online-aptitude-test-platform-2.onrender.com/api';

export default API_BASE_URL;
