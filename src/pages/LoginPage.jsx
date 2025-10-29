import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminLogin } from '../services/api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);

    try {
      const data = await adminLogin(username, password);
      
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);
      
      toast.success(`ยินดีต้อนรับ ${data.username}!`);
      onLogin(data.username);
      navigate('/knowledge');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <Lock size={48} />
          </div>
          <h1>Admin Login</h1>
          <p>เข้าสู่ระบบจัดการ Knowledge Base</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>
              <User size={18} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="login-button-submit">
            {loading ? (
              <>กำลังเข้าสู่ระบบ...</>
            ) : (
              <>
                <LogIn size={20} />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>ติดต่อผู้ดูแลระบบหากลืมรหัสผ่าน</p>
        </div>
      </div>
    </div>
  );
}