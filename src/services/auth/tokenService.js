// src/services/auth/tokenService.js
const tokenService = {
  // Token management
  getToken: () => localStorage.getItem('access_token'),
  
  setToken: (token) => localStorage.setItem('access_token', token),
  
  removeToken: () => localStorage.removeItem('access_token'),
  
  // User info management
  getUserInfo: () => {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  setUserInfo: (userInfo) => {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  },
  
  removeUserInfo: () => {
    localStorage.removeItem('user_info');
  },
  
  // Clear all auth data
  clearAllAuthData: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('rememberedEmail');
  }
};

export { tokenService };
