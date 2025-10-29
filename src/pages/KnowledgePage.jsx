import { useState, useEffect } from 'react';
import { Upload, Trash2, BookOpen, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getKnowledge, uploadKnowledgeFile, deleteKnowledge } from '../services/api';

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const data = await getKnowledge();
      
      // ✅ ตรวจสอบว่า data เป็น array หรือไม่
      if (Array.isArray(data)) {
        setKnowledge(data);
      } else if (data && Array.isArray(data.data)) {
        setKnowledge(data.data);
      } else {
        console.warn('Knowledge data is not an array:', data);
        setKnowledge([]);
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
      setKnowledge([]); // ✅ Set เป็น empty array เมื่อ error
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('ไฟล์ใหญ่เกิน 10MB');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('category', 'general');

    setUploading(true);
    const toastId = toast.loading('กำลังอัพโหลดไฟล์...');

    try {
      await uploadKnowledgeFile(formData);
      toast.success('อัพโหลดสำเร็จ!', { id: toastId });
      fetchKnowledge();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'อัพโหลดไม่สำเร็จ', { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันการลบข้อมูลนี้?')) return;

    const toastId = toast.loading('กำลังลบ...');

    try {
      await deleteKnowledge(id);
      toast.success('ลบสำเร็จ!', { id: toastId });
      fetchKnowledge();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('ลบไม่สำเร็จ', { id: toastId });
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
    <div className="knowledge-page">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>
              <BookOpen size={32} />
              Knowledge Base Management
            </h1>
            <p>จัดการข้อมูล Knowledge Base สำหรับ AI Chatbot</p>
          </div>

          <label className="upload-button">
            <Upload size={20} />
            <span>{uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดไฟล์'}</span>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="knowledge-info">
          <p>
            💡 รองรับไฟล์: PDF, DOCX, TXT | ขนาดไม่เกิน 10MB | จะถูกแบ่งเป็นส่วนย่อย 1-3 ชิ้น
          </p>
        </div>

        <div className="knowledge-grid">
          {knowledge.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} />
              <h3>ยังไม่มีข้อมูล</h3>
              <p>เริ่มต้นโดยการอัพโหลดไฟล์แรกของคุณ</p>
            </div>
          ) : (
            knowledge.map((item) => (
              <div key={item._id} className="knowledge-card">
                <div className="knowledge-card-header">
                  <h3>{item.title}</h3>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="delete-button"
                    title="ลบ"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="knowledge-card-content">
                  <p>{item.content.substring(0, 150)}...</p>
                </div>

                <div className="knowledge-card-footer">
                  <span className="badge">{item.category}</span>
                  <span className="date">
                    <Calendar size={14} />
                    {new Date(item.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}