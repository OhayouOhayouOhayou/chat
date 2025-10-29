import { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAnalytics } from '../services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-container">
        <div className="page-header">
          <h1>
            <BarChart3 size={32} />
            Analytics Dashboard
          </h1>
          <p>สถิติการใช้งาน AI Chatbot</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#6366f1' }}>
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <h3>{analytics?.totalMessages || 0}</h3>
              <p>Total Messages</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{analytics?.totalConversations || 0}</h3>
              <p>Total Conversations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{analytics?.avgResponseTime || 0}ms</h3>
              <p>Avg Response Time</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <h3>{analytics?.totalKnowledge || 0}</h3>
              <p>Knowledge Items</p>
            </div>
          </div>
        </div>

        <div className="analytics-info">
          <p>📊 ข้อมูลอัพเดทเรียลไทม์จากระบบ</p>
        </div>
      </div>
    </div>
  );
}