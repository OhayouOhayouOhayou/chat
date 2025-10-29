import React, { useState, useEffect } from 'react'
import { Upload, Plus, FileText, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getKnowledge, createKnowledge, deleteKnowledge, uploadKnowledgeFile } from '../services/api'

const KnowledgeManager = ({ backendStatus }) => {
  const [knowledge, setKnowledge] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('') // 'uploading', 'processing', 'done'

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

    // ตรวจสอบขนาดไฟล์ (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('ไฟล์ใหญ่เกิน 10MB กรุณาเลือกไฟล์ขนาดเล็กกว่า')
      e.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('category', 'general')

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')

    const toastId = toast.loading('กำลังอัพโหลดไฟล์... 0%')

    try {
      await uploadKnowledgeFile(formData, (progress) => {
        setUploadProgress(progress)
        if (progress < 100) {
          setUploadStatus('uploading')
          toast.loading(`กำลังอัพโหลดไฟล์... ${progress}%`, { id: toastId })
        } else {
          setUploadStatus('processing')
          toast.loading('กำลังประมวลผล... กรุณารอสักครู่', { id: toastId })
        }
      })
      
      setUploadStatus('done')
      toast.success('✅ อัพโหลดและประมวลผลสำเร็จ!', { id: toastId })
      fetchKnowledge()
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('')
      
      let errorMsg = 'ไม่สามารถอัพโหลดไฟล์ได้'
      if (error.message.includes('timeout')) {
        errorMsg = '⏰ การประมวลผลใช้เวลานานเกินไป กรุณาลองใหม่หรือใช้ไฟล์ที่เล็กกว่า'
      } else if (error.userMessage) {
        errorMsg = error.userMessage
      }
      
      toast.error(errorMsg, { id: toastId, duration: 5000 })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setUploadStatus('')
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
        <AlertCircle style={{ width: '64px', height: '64px', color: '#EF4444', margin: '0 auto 16px' }} />
        <p style={{ color: '#EF4444', fontSize: '18px', marginBottom: '8px' }}>
          ⚠️ ไม่สามารถเชื่อมต่อ Backend
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          กรุณาตรวจสอบการเชื่อมต่อ Backend Server
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
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
            backgroundColor: isUploading ? '#9CA3AF' : '#10B981',
            color: 'white',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}>
            {isUploading ? (
              <>
                <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                {uploadStatus === 'uploading' ? `อัพโหลด ${uploadProgress}%` : 'กำลังประมวลผล...'}
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

        {/* Upload Progress Bar */}
        {isUploading && (
          <div style={{ marginTop: '16px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: uploadStatus === 'processing' ? '#F59E0B' : '#10B981',
                transition: 'width 0.3s ease',
              }}></div>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
              {uploadStatus === 'uploading' && `อัพโหลดไฟล์... ${uploadProgress}%`}
              {uploadStatus === 'processing' && '⚙️ กำลังประมวลผล: Extract text → Generate embeddings → Save to DB...'}
              {uploadStatus === 'done' && '✅ เสร็จสมบูรณ์!'}
            </p>
          </div>
        )}

        {/* File Size Info */}
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1E40AF'
        }}>
          💡 <strong>คำแนะนำ:</strong> รองรับไฟล์ PDF, DOCX, TXT ขนาดไม่เกิน 10MB | 
          ไฟล์ใหญ่อาจใช้เวลาประมวลผล 1-3 นาที
        </div>
      </div>

      {/* Knowledge List */}
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
          <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '8px' }}>
            ยังไม่มีข้อมูลในระบบ
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
            เริ่มต้นด้วยการอัพโหลดไฟล์ PDF, DOCX หรือ TXT
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <FileText style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {item.title}
                    </h3>
                    {item.source === 'file' && (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        FILE
                      </span>
                    )}
                  </div>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.content}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9CA3AF' }}>
                    <span>📅 {new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                    {item.createdBy && <span>👤 {item.createdBy}</span>}
                    {item.category && <span>🏷️ {item.category}</span>}
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
                  title="ลบ"
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