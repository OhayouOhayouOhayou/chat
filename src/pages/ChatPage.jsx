import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createConversation, sendMessage } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // สร้าง conversation ตอนเริ่มต้น
  useEffect(() => {
    initConversation();
  }, []);

  const initConversation = async () => {
    try {
      const data = await createConversation();
      setConversationId(data.conversationId);
      
      // ข้อความต้อนรับ
      setMessages([
        {
          role: 'assistant',
          content: 'สวัสดีครับ! ผมคือ AI Assistant พร้อมช่วยตอบคำถามเกี่ยวกับบริษัทของเรา มีอะไรให้ช่วยไหมครับ?',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('ไม่สามารถเริ่มการสนทนาได้');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !conversationId) return;

    const userMessage = input.trim();
    setInput('');

    // เพิ่มข้อความของ user
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setLoading(true);

    try {
      const data = await sendMessage(conversationId, userMessage);

      // เพิ่มข้อความตอบกลับจาก AI
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        metadata: data.metadata || {},
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
      
      // เพิ่มข้อความ error
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'ขอโทษครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      {/* Messages Container */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <User size={24} />
              ) : (
                <Bot size={24} />
              )}
            </div>
            
            <div className="message-content">
              <div className="message-text">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              
             
              {/* Metadata */}
              {message.metadata && (
                <div className="message-metadata">
                  {message.metadata.confidence && (
                    <span className="metadata-item">
                      🎯 {(message.metadata.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {message.metadata.responseTime && (
                    <span className="metadata-item">
                      ⏱️ {message.metadata.responseTime}ms
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-avatar">
              <Bot size={24} />
            </div>
            <div className="message-content">
              <div className="message-loading">
                <Loader2 className="animate-spin" size={20} />
                <span>กำลังคิดคำตอบ...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์คำถามของคุณที่นี่... (Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
            disabled={loading || !conversationId}
            rows={1}
            className="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !conversationId}
            className="chat-send-button"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}