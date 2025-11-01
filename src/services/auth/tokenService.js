// src/services/auth/tokenService.js - CORRECTED VERSION
class TokenService {
  constructor() {
    this.tokenKey = 'procurement_access_token';
    this.refreshTokenKey = 'procurement_refresh_token';
    this.tokenExpiryKey = 'procurement_token_expiry';
    this.userDataKey = 'userData'; // ✅ ADDED: Consistent user data key
    this.refreshInterval = null;
  }

  // Get token from storage
  getToken = () => {
    try {
      const token = localStorage.getItem(this.tokenKey);
      console.log('🔐 TokenService - Get token:', token ? `${token.substring(0, 20)}...` : 'No token');
      return token;
    } catch (error) {
      console.error('🔐 TokenService - Get token error:', error);
      return null;
    }
  };

  // Set token in storage
  setToken = (token) => {
    try {
      console.log('🔐 TokenService - Setting token:', token ? `${token.substring(0, 20)}...` : 'No token');
      localStorage.setItem(this.tokenKey, token);
      
      // ✅ FIXED: Handle both JWT tokens and mock tokens
      if (token) {
        // Check if it's a mock token
        if (token.startsWith('mock-') || token === 'mock-token') {
          console.log('🔐 TokenService - Mock token detected, setting default expiry');
          // Set expiry to 24 hours from now for mock tokens
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
          localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
        } else {
          // Try to decode as JWT token
          const payload = this.decodeToken(token);
          if (payload && payload.exp) {
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
            console.log('🔐 TokenService - JWT token expiry set:', new Date(expiryTime).toISOString());
          } else {
            console.warn('🔐 TokenService - Could not decode JWT token or no expiry found');
          }
        }
      }
    } catch (error) {
      console.error('🔐 TokenService - Set token error:', error);
    }
  };

  // Remove token from storage
  removeToken = () => {
    try {
      console.log('🔐 TokenService - Removing token');
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.tokenExpiryKey);
    } catch (error) {
      console.error('🔐 TokenService - Remove token error:', error);
    }
  };

  // Get refresh token from storage
  getRefreshToken = () => {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      console.log('🔐 TokenService - Get refresh token:', !!refreshToken);
      return refreshToken;
    } catch (error) {
      console.error('🔐 TokenService - Get refresh token error:', error);
      return null;
    }
  };

  // Set refresh token in storage
  setRefreshToken = (refreshToken) => {
    try {
      console.log('🔐 TokenService - Setting refresh token');
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
      console.error('🔐 TokenService - Set refresh token error:', error);
    }
  };

  // Remove refresh token from storage
  removeRefreshToken = () => {
    try {
      console.log('🔐 TokenService - Removing refresh token');
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error('🔐 TokenService - Remove refresh token error:', error);
    }
  };

  // Clear all tokens
  clearAllTokens = () => {
    console.log('🔐 TokenService - Clearing all tokens');
    this.removeToken();
    this.removeRefreshToken();
  };

  // ✅ FIXED: Decode JWT token with proper error handling for mock tokens
  decodeToken = (token) => {
    try {
      if (!token) {
        console.log('🔐 TokenService - No token provided for decoding');
        return null;
      }

      // ✅ FIXED: Handle mock tokens
      if (token.startsWith('mock-') || token === 'mock-token') {
        console.log('🔐 TokenService - Mock token detected, returning mock payload');
        return {
          sub: '1',
          userId: 1,
          email: 'user@example.com',
          name: 'Mock User',
          role: 'user',
          permissions: ['read', 'write'],
          exp: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000), // 24 hours from now
          iat: Math.floor(Date.now() / 1000)
        };
      }

      // Try to decode as JWT token
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('🔐 TokenService - Invalid JWT format, expected 3 parts');
        return null;
      }

      const base64Url = parts[1];
      if (!base64Url) {
        console.warn('🔐 TokenService - Invalid JWT format, no payload found');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      console.log('🔐 TokenService - JWT token decoded successfully');
      return payload;
    } catch (error) {
      console.error('🔐 TokenService - Decode token error:', error);
      return null;
    }
  };

  // Get token payload
  getTokenPayload = () => {
    const token = this.getToken();
    const payload = this.decodeToken(token);
    console.log('🔐 TokenService - Get token payload:', payload);
    return payload;
  };

  // ✅ FIXED: Check if token is expired with mock token support
  isTokenExpired = (token = null) => {
    try {
      const tokenToCheck = token || this.getToken();
      if (!tokenToCheck) {
        console.log('🔐 TokenService - No token to check for expiry');
        return true;
      }

      // ✅ FIXED: Handle mock tokens
      if (tokenToCheck.startsWith('mock-') || tokenToCheck === 'mock-token') {
        console.log('🔐 TokenService - Mock token, checking stored expiry');
        // Check stored expiry time for mock tokens
        const storedExpiry = localStorage.getItem(this.tokenExpiryKey);
        if (storedExpiry) {
          const expiryTime = parseInt(storedExpiry, 10);
          const currentTime = Date.now();
          const isExpired = currentTime >= expiryTime;
          console.log(`🔐 TokenService - Mock token expiry check: ${isExpired}`, {
            expiryTime: new Date(expiryTime).toISOString(),
            currentTime: new Date(currentTime).toISOString()
          });
          return isExpired;
        }
        // If no expiry stored for mock token, treat as not expired
        console.log('🔐 TokenService - No expiry stored for mock token, treating as valid');
        return false;
      }

      // Check stored expiry time first for JWT tokens
      const storedExpiry = localStorage.getItem(this.tokenExpiryKey);
      if (storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const currentTime = Date.now();
        const isExpired = currentTime >= expiryTime;
        console.log(`🔐 TokenService - JWT token expiry check (stored): ${isExpired}`);
        return isExpired;
      }

      // Fallback to decoding token for JWT tokens
      const payload = this.decodeToken(tokenToCheck);
      if (!payload || !payload.exp) {
        console.log('🔐 TokenService - No expiry in payload, treating as expired');
        return true;
      }

      const currentTime = Date.now() / 1000; // Convert to seconds
      const isExpired = payload.exp < currentTime;
      console.log(`🔐 TokenService - JWT token expiry check (decoded): ${isExpired}`, {
        expiry: new Date(payload.exp * 1000).toISOString(),
        current: new Date(currentTime * 1000).toISOString()
      });
      return isExpired;
    } catch (error) {
      console.error('🔐 TokenService - Check token expiry error:', error);
      return true;
    }
  };

  // Get token expiry time
  getTokenExpiry = () => {
    try {
      const storedExpiry = localStorage.getItem(this.tokenExpiryKey);
      if (storedExpiry) {
        const expiry = parseInt(storedExpiry, 10);
        console.log('🔐 TokenService - Get token expiry (stored):', new Date(expiry).toISOString());
        return expiry;
      }

      const payload = this.getTokenPayload();
      if (payload && payload.exp) {
        const expiry = payload.exp * 1000; // Convert to milliseconds
        console.log('🔐 TokenService - Get token expiry (decoded):', new Date(expiry).toISOString());
        return expiry;
      }

      console.log('🔐 TokenService - No token expiry found');
      return null;
    } catch (error) {
      console.error('🔐 TokenService - Get token expiry error:', error);
      return null;
    }
  };

  // Get time until token expiry (in milliseconds)
  getTimeUntilExpiry = () => {
    const expiryTime = this.getTokenExpiry();
    if (!expiryTime) {
      console.log('🔐 TokenService - No expiry time, returning 0');
      return 0;
    }

    const currentTime = Date.now();
    const timeUntilExpiry = Math.max(0, expiryTime - currentTime);
    console.log('🔐 TokenService - Time until expiry:', {
      milliseconds: timeUntilExpiry,
      minutes: Math.round(timeUntilExpiry / 60000)
    });
    return timeUntilExpiry;
  };

  // Check if token will expire soon (within threshold)
  isTokenExpiringSoon = (thresholdMinutes = 5) => {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    const thresholdMs = thresholdMinutes * 60 * 1000;
    const isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry <= thresholdMs;
    
    console.log('🔐 TokenService - Token expiring soon check:', {
      timeUntilExpiry: Math.round(timeUntilExpiry / 60000) + ' minutes',
      threshold: thresholdMinutes + ' minutes',
      isExpiringSoon
    });
    
    return isExpiringSoon;
  };

  // ✅ FIXED: Get user ID from token with mock token support
  getUserId = () => {
    const payload = this.getTokenPayload();
    const userId = payload?.sub || payload?.userId || '1'; // Default for mock tokens
    console.log('🔐 TokenService - Get user ID:', userId);
    return userId;
  };

  // ✅ FIXED: Get user role from token with mock token support
  getUserRole = () => {
    const payload = this.getTokenPayload();
    const role = payload?.role || 'user'; // Default for mock tokens
    console.log('🔐 TokenService - Get user role:', role);
    return role;
  };

  // ✅ FIXED: Get user permissions from token with mock token support
  getUserPermissions = () => {
    const payload = this.getTokenPayload();
    const permissions = payload?.permissions || payload?.scope || ['read', 'write']; // Default for mock tokens
    console.log('🔐 TokenService - Get user permissions:', permissions);
    return permissions;
  };

  // ✅ FIXED: Validate token structure with mock token support
  isValidToken = (token) => {
    if (!token || typeof token !== 'string') {
      console.log('🔐 TokenService - Token validation failed: invalid token type');
      return false;
    }
    
    // Mock tokens are always valid
    if (token.startsWith('mock-') || token === 'mock-token') {
      console.log('🔐 TokenService - Mock token validation: valid');
      return true;
    }
    
    // Check JWT structure
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('🔐 TokenService - JWT validation failed: invalid structure');
      return false;
    }
    
    try {
      const payload = this.decodeToken(token);
      const isValid = !!(payload && payload.exp);
      console.log('🔐 TokenService - JWT token validation:', isValid);
      return isValid;
    } catch (error) {
      console.log('🔐 TokenService - JWT validation failed:', error);
      return false;
    }
  };

  // Store token with additional metadata
  setTokenWithMetadata = (token, metadata = {}) => {
    console.log('🔐 TokenService - Setting token with metadata:', metadata);
    this.setToken(token);
    
    // Store additional metadata
    if (metadata.refreshToken) {
      this.setRefreshToken(metadata.refreshToken);
    }
    
    if (metadata.userId) {
      localStorage.setItem('user_id', metadata.userId);
    }
    
    if (metadata.issuedAt) {
      localStorage.setItem('token_issued_at', metadata.issuedAt.toString());
    }
  };

  // Get token metadata
  getTokenMetadata = () => {
    const metadata = {
      userId: localStorage.getItem('user_id') || this.getUserId(),
      issuedAt: localStorage.getItem('token_issued_at'),
      expiry: this.getTokenExpiry(),
      role: this.getUserRole(),
      permissions: this.getUserPermissions()
    };
    console.log('🔐 TokenService - Get token metadata:', metadata);
    return metadata;
  };

  // Clear all token-related data
  clearAllTokenData = () => {
    console.log('🔐 TokenService - Clearing all token data');
    this.clearAllTokens();
    localStorage.removeItem('user_id');
    localStorage.removeItem('token_issued_at');
    localStorage.removeItem(this.userDataKey); // ✅ ADDED: Clear user data
  };

  // Check if tokens exist
  hasTokens = () => {
    const hasTokens = !!(this.getToken() && this.getRefreshToken());
    console.log('🔐 TokenService - Has tokens:', hasTokens);
    return hasTokens;
  };

  // Get token storage information
  getTokenInfo = () => {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    const payload = this.getTokenPayload();
    const tokenInfo = {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      isExpired: this.isTokenExpired(),
      expiryTime: this.getTokenExpiry(),
      timeUntilExpiry: this.getTimeUntilExpiry(),
      userId: this.getUserId(),
      userRole: this.getUserRole(),
      userPermissions: this.getUserPermissions(),
      tokenLength: token ? token.length : 0,
      payload: payload,
      isMockToken: token ? (token.startsWith('mock-') || token === 'mock-token') : false
    };
    
    console.log('🔐 TokenService - Get token info:', tokenInfo);
    return tokenInfo;
  };

  // Secure token storage with encryption (basic example)
  setEncryptedToken = (token, key = 'default_key') => {
    try {
      console.log('🔐 TokenService - Setting encrypted token');
      // Basic obfuscation - in production, use proper encryption
      const encryptedToken = btoa(token + key);
      localStorage.setItem(this.tokenKey, encryptedToken);
      
      // Store expiry
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        localStorage.setItem(this.tokenExpiryKey, (payload.exp * 1000).toString());
      }
    } catch (error) {
      console.error('🔐 TokenService - Set encrypted token error:', error);
    }
  };

  // Get and decrypt token
  getDecryptedToken = (key = 'default_key') => {
    try {
      const encryptedToken = localStorage.getItem(this.tokenKey);
      if (!encryptedToken) {
        console.log('🔐 TokenService - No encrypted token found');
        return null;
      }
      
      // Basic de-obfuscation
      const decryptedToken = atob(encryptedToken);
      const token = decryptedToken.replace(key, '');
      console.log('🔐 TokenService - Decrypted token:', token ? `${token.substring(0, 20)}...` : 'No token');
      return token;
    } catch (error) {
      console.error('🔐 TokenService - Get decrypted token error:', error);
      return null;
    }
  };

  // Token refresh coordination
  startTokenRefresh = (refreshCallback, checkInterval = 60000) => {
    console.log('🔐 TokenService - Starting token refresh coordination');
    this.stopTokenRefresh(); // Clear any existing interval
    
    this.refreshInterval = setInterval(() => {
      if (this.isTokenExpiringSoon(10)) { // Refresh if expiring in 10 minutes
        console.log('🔐 TokenService - Token expiring soon, triggering refresh');
        refreshCallback();
      }
    }, checkInterval);
  };

  // Stop token refresh coordination
  stopTokenRefresh = () => {
    if (this.refreshInterval) {
      console.log('🔐 TokenService - Stopping token refresh coordination');
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  };

  // Check token validity and auto-refresh if needed
  ensureValidToken = async (refreshCallback) => {
    console.log('🔐 TokenService - Ensuring valid token');
    
    if (this.isTokenExpired()) {
      console.log('🔐 TokenService - Token expired, attempting refresh');
      // Token is expired, try to refresh
      if (this.getRefreshToken()) {
        await refreshCallback();
      } else {
        // No refresh token available, clear everything
        console.log('🔐 TokenService - No refresh token available, clearing data');
        this.clearAllTokenData();
        throw new Error('Token expired and no refresh token available');
      }
    } else if (this.isTokenExpiringSoon(5)) {
      // Token is expiring soon, refresh proactively
      console.log('🔐 TokenService - Token expiring soon, refreshing proactively');
      await refreshCallback();
    } else {
      console.log('🔐 TokenService - Token is valid, no refresh needed');
    }
    
    return this.getToken();
  };

  // ✅ NEW: Simple method to check if user is authenticated
  isAuthenticated = () => {
    const token = this.getToken();
    if (!token) {
      console.log('🔐 TokenService - No token, not authenticated');
      return false;
    }
    
    const isAuthenticated = !this.isTokenExpired(token);
    console.log('🔐 TokenService - Authentication check:', isAuthenticated);
    return isAuthenticated;
  };

  // ✅ NEW: Get user info for AuthContext (COMPATIBILITY METHOD)
  getUserInfo = () => {
    const token = this.getToken();
    if (!token) {
      console.log('🔐 TokenService - No token, cannot get user info');
      return null;
    }

    try {
      // Try to get from localStorage first (for mock tokens and AuthService compatibility)
      const userData = localStorage.getItem(this.userDataKey) || localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔐 TokenService - User info from localStorage:', user);
        return user;
      }

      // Fallback to token payload
      const payload = this.getTokenPayload();
      if (payload) {
        const userFromToken = {
          id: payload.userId || payload.sub,
          email: payload.email,
          name: payload.name || 'User',
          role: payload.role,
          permissions: payload.permissions || []
        };
        console.log('🔐 TokenService - User info from token:', userFromToken);
        return userFromToken;
      }

      console.log('🔐 TokenService - No user info found');
      return null;
    } catch (error) {
      console.error('🔐 TokenService - Get user info error:', error);
      return null;
    }
  };

  // ✅ NEW: Set user info for AuthContext compatibility
  setUserInfo = (userData) => {
    try {
      console.log('🔐 TokenService - Setting user info:', userData);
      localStorage.setItem(this.userDataKey, JSON.stringify(userData));
    } catch (error) {
      console.error('🔐 TokenService - Set user info error:', error);
    }
  };

  // ✅ NEW: Clear user info
  clearUserInfo = () => {
    try {
      console.log('🔐 TokenService - Clearing user info');
      localStorage.removeItem(this.userDataKey);
      localStorage.removeItem('user'); // Also clear the AuthService user data
    } catch (error) {
      console.error('🔐 TokenService - Clear user info error:', error);
    }
  };

  // ✅ NEW: Comprehensive clear all authentication data
  clearAllAuthData = () => {
    console.log('🔐 TokenService - Clearing all authentication data');
    this.clearAllTokenData();
    this.clearUserInfo();
    this.stopTokenRefresh();
  };

  // ✅ NEW: Check if we have a valid session
  hasValidSession = () => {
    const isAuth = this.isAuthenticated();
    const userInfo = this.getUserInfo();
    const hasUser = !!userInfo;
    
    console.log('🔐 TokenService - Valid session check:', {
      isAuthenticated: isAuth,
      hasUserInfo: hasUser,
      userEmail: userInfo?.email
    });
    
    return isAuth && hasUser;
  };

  // ✅ NEW: Get session information for debugging
  getSessionInfo = () => {
    return {
      token: this.getTokenInfo(),
      user: this.getUserInfo(),
      isAuthenticated: this.isAuthenticated(),
      hasValidSession: this.hasValidSession(),
      storage: {
        hasToken: !!localStorage.getItem(this.tokenKey),
        hasUserData: !!localStorage.getItem(this.userDataKey),
        hasRefreshToken: !!localStorage.getItem(this.refreshTokenKey)
      }
    };
  };
}

// Create singleton instance
export const tokenService = new TokenService();
export default tokenService;