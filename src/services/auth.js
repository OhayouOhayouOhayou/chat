import api from './api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'admin_token';
    this.USER_KEY = 'admin_user';
  }

  // Login
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // เก็บ token และ user info ใน localStorage
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        
        // ตั้งค่า default header สำหรับ axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { success: true, user };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  }

  // ตรวจสอบว่า login แล้วหรือไม่
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // ดึง token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ดึงข้อมูล user
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // ตรวจสอบว่าเป็น admin หรือไม่
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  // ตั้งค่า token ใน axios header
  setupAxiosInterceptors() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Interceptor สำหรับจัดการ 401 (Unauthorized)
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token หมดอายุหรือไม่ถูกต้อง
          this.logout();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }
}

export default new AuthService();