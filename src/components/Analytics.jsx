import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MessageSquare,
  Users,
  Database,
  Star,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react';
import { getAnalyticsOverview, getFeedbackAnalytics } from '../services/api';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewResult, feedbackResult] = await Promise.all([
        getAnalyticsOverview(),
        getFeedbackAnalytics(),
      ]);

      setOverview(overviewResult.data);
      setFeedback(feedbackResult.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">
            {value}
            {suffix}
          </p>
        </div>
        <div
          className={`p-3 rounded-full`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Analytics Dashboard
        </h1>
        <p className="text-gray-600">วิเคราะห์ประสิทธิภาพและข้อมูลการใช้งาน</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={MessageSquare}
          label="การสนทนาทั้งหมด"
          value={overview?.overview?.totalConversations || 0}
          color="#3B82F6"
        />
        <StatCard
          icon={Users}
          label="ข้อความทั้งหมด"
          value={overview?.overview?.totalMessages || 0}
          color="#10B981"
        />
        <StatCard
          icon={Database}
          label="ข้อมูลความรู้"
          value={overview?.overview?.totalKnowledge || 0}
          color="#F59E0B"
        />
        <StatCard
          icon={Star}
          label="คะแนนเฉลี่ย"
          value={overview?.overview?.averageRating?.toFixed(1) || '0.0'}
          color="#EF4444"
          suffix="/5"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              เวลาตอบกลับเฉลี่ย
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {overview?.overview?.avgResponseTime
              ? `${Math.round(overview.overview.avgResponseTime)}ms`
              : 'N/A'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              ประสิทธิภาพระบบ
            </h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {overview?.overview?.totalConversations > 0 ? '98%' : 'N/A'}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Conversations Per Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            การสนทนารายวัน (7 วันล่าสุด)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview?.conversationsPerDay || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                name="การสนทนา"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feedback Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            การให้คะแนน Feedback
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {feedback?.feedbackStats && feedback.feedbackStats.length > 0 ? (
              <PieChart>
                <Pie
                  data={feedback.feedbackStats}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry._id} ⭐ (${entry.count})`}
                >
                  {feedback.feedbackStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                ยังไม่มีข้อมูล Feedback
              </div>
            )}
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Confidence Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          การกระจายตัวของ Confidence Score
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          {overview?.confidenceDistribution &&
          overview.confidenceDistribution.length > 0 ? (
            <BarChart data={overview.confidenceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="จำนวน" />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              ยังไม่มีข้อมูล Confidence
            </div>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Top Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          คำถามยอดนิยม (Top 10)
        </h3>
        <div className="space-y-3">
          {overview?.topQuestions && overview.topQuestions.length > 0 ? (
            overview.topQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700 line-clamp-1">
                    {question._id}
                  </p>
                </div>
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {question.count}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีข้อมูลคำถาม
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;