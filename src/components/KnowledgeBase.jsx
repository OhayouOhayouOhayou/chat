import React, { useState, useEffect } from 'react'
import { Upload, Plus, FileText, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getKnowledge, createKnowledge, deleteKnowledge, uploadKnowledgeFile } from '../services/api'

const KnowledgeManager = ({ backendStatus }) => {
  const [knowledge, setKnowledge] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (backendStatus === 'connected') {
      fetchKnowledge()
    }
  }, [backendStatus])

  const fetchKnowledge = async () => {
    try {
      setIsLoading(true)
      const result = await getKnowledge()
      setKnowledge(result.data.knowledge || [])
    } catch (error) {
      console.error('Error fetching knowledge:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('category', 'general')

    setIsUploading(true)
    const toastId = toast.loading('กำลังอัพโหลดไฟล์...')

    try {
      await uploadKnowledgeFile(formData)
      toast.success('อัพโหลดไฟล์สำเร็จ!', { id: toastId })
      fetchKnowledge()
    } catch (error) {
      toast.error('ไม่สามารถอัพโหลดไฟล์ได้: ' + error.message, { id: toastId })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) return

    try {
      await deleteKnowledge(id)
      toast.success('ลบข้อมูลสำเร็จ!')
      fetchKnowledge()
    } catch (error) {
      toast.error('ไม่สามารถลบข้อมูลได้')
    }
  }

  if (backendStatus !== 'connected') {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#EF4444', fontSize: '18px' }}>
          ⚠️ ไม่สามารถเชื่อมต่อ Backend
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              📚 Knowledge Base Management
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              จัดการข้อมูลความรู้สำหรับ AI Chatbot ({knowledge.length} รายการ)
            </p>
          </div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#10B981',
            color: 'white',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: isUploading ? 0.6 : 1
          }}>
            {isUploading ? (
              <>
                <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                กำลังอัพโหลด...
              </>
            ) : (
              <>
                <Upload style={{ width: '20px', height: '20px' }} />
                อัพโหลดไฟล์
              </>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#3B82F6', margin: '0 auto' }} />
          <p style={{ color: '#6b7280', marginTop: '16px' }}>กำลังโหลดข้อมูล...</p>
        </div>
      ) : knowledge.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <FileText style={{ width: '64px', height: '64px', color: '#D1D5DB', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            ยังไม่มีข้อมูลในระบบ
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {knowledge.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    📄 {item.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                    {item.content.substring(0, 200)}...
                  </p>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    📅 {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    {item.createdBy && ` | 👤 ${item.createdBy}`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#FEE2E2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    height: 'fit-content'
                  }}
                >
                  <Trash2 style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default KnowledgeManager