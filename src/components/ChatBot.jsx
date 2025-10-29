import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, X, MessageCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import ChatMessage from './ChatMessage'
import {
  createConversation,
  sendMessage,
  submitFeedback,
} from '../services/api'

const ChatBot = ({ backendStatus }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorLog, setErrorLog] = useState([])
  const messagesEndRef = useRef(null)

  // Log error function
  const logError = (error, context) => {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      error: error.message || error,
      stack: error.stack,
    }
    setErrorLog(prev => [...prev, errorEntry])
    console.error(`[${context}]`, error)
  }

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (backendStatus !== 'connected') {
        console.log('⏳ Waiting for backend connection...')
        return
      }

      try {
        console.log('🚀 Creating conversation...')
        const result = await createConversation({
          userAgent: navigator.userAgent,
          user: 'OhayouOhayouOhayou',
        })
        setConversationId(result.data.conversationId)
        console.log('✅ Conversation created:', result.data.conversationId)

        // Welcome message
        setMessages([
          {
            _id: 'welcome',
            role: 'assistant',
            content: `👋 สวัสดีค่ะคุณ OhayouOhayouOhayou!\n\nฉันคือ AI Assistant ยินดีให้ความช่วยเหลือคุณ มีอะไรให้ช่วยไหมคะ?\n\n📅 ${new Date().toLocaleString('th-TH')}`,
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        logError(error, 'Initialize Conversation')
        toast.error('ไม่สามารถเริ่มการสนทนาได้: ' + error.message)
      }
    }

    if (isOpen && !conversationId && backendStatus === 'connected') {
      initConversation()
    }
  }, [isOpen, conversationId, backendStatus])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    if (backendStatus !== 'connected') {
      toast.error('Backend ไม่พร้อม กรุณาตรวจสอบการเชื่อมต่อ')
      return
    }

    if (!conversationId) {
      toast.error('กรุณารอสักครู่ ระบบกำลังเตรียมพร้อม...')
      return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')

    // Add user message
    const tempUserMessage = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    setIsLoading(true)

    try {
      console.log('📤 Sending message:', userMessage)
      const result = await sendMessage(conversationId, userMessage)
      console.log('📥 Received response:', result)

      // Add assistant message
      const assistantMessage = {
        _id: result.data.messageId,
        role: 'assistant',
        content: result.data.response,
        sources: result.data.sources,
        metadata: result.data.metadata,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      toast.success('ตอบคำถามสำเร็จ')
    } catch (error) {
      logError(error, 'Send Message')
      console.error('❌ Send message error:', error)
      
      toast.error(
        <div>
          <strong>ไม่สามารถส่งข้อความได้</strong>
          <br />
          <small>{error.message}</small>
        </div>,
        { duration: 5000 }
      )

      // Remove temp user message on error
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== tempUserMessage._id)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (messageId, rating, type) => {
    try {
      await submitFeedback(conversationId, messageId, rating, '')
      toast.success(
        type === 'positive'
          ? 'ขอบคุณสำหรับ Feedback! 😊'
          : 'ขอบคุณ เราจะปรับปรุงให้ดีขึ้น 🙏'
      )
    } catch (error) {
      logError(error, 'Submit Feedback')
      console.error('Feedback error:', error)
    }
  }

  const handleOpen = () => {
    if (backendStatus !== 'connected') {
      toast.error(
        <div>
          <strong>Backend ไม่พร้อมใช้งาน</strong>
          <br />
          <small>กรุณาตรวจสอบการเชื่อมต่อ</small>
        </div>,
        { duration: 4000 }
      )
      return
    }
    setIsOpen(true)
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          backgroundColor: backendStatus === 'connected' ? '#3B82F6' : '#9CA3AF',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '28px',
          cursor: backendStatus === 'connected' ? 'pointer' : 'not-allowed',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 50,
        }}
        title={
          backendStatus === 'connected'
            ? 'เปิดแชท'
            : 'Backend ไม่พร้อม'
        }
      >
        {backendStatus === 'connected' ? '💬' : '⚠️'}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '24px',
              width: '400px',
              maxWidth: 'calc(100vw - 48px)',
              height: '600px',
              maxHeight: 'calc(100vh - 150px)',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 50,
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(to right, #3B82F6, #2563EB)',
              color: 'white',
              padding: '16px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  AI Assistant
                </h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                  {backendStatus === 'connected' ? 'ออนไลน์' : 'ออฟไลน์'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#F9FAFB',
              padding: '16px',
            }}>
              {messages.map((message) => (
                <ChatMessage
                  key={message._id}
                  message={message}
                  onFeedback={
                    message.role === 'assistant' ? handleFeedback : null
                  }
                />
              ))}
              {isLoading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  color: '#6B7280',
                }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span style={{ fontSize: '14px' }}>AI กำลังคิด...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '16px',
                borderTop: '1px solid #E5E7EB',
                backgroundColor: 'white',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  disabled={isLoading || !conversationId || backendStatus !== 'connected'}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim() || !conversationId || backendStatus !== 'connected'}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoading || !inputMessage.trim() || !conversationId || backendStatus !== 'connected' ? 0.5 : 1,
                  }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Error Log Button */}
              {errorLog.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    console.table(errorLog)
                    alert(`พบ ${errorLog.length} errors - ดู Console (F12) สำหรับรายละเอียด`)
                  }}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <AlertCircle style={{ display: 'inline', width: '14px', height: '14px', marginRight: '4px' }} />
                  {errorLog.length} Error(s) - คลิกเพื่อดูรายละเอียด
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot