import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';

const ChatMessage = ({ message, onFeedback }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 p-4 ${isUser ? 'bg-blue-50' : 'bg-white'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-green-500'
        }`}
      >
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600">
              แหล่งข้อมูลอ้างอิง:
            </p>
            {message.sources.map((source, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-2 rounded text-xs border-l-2 border-blue-400"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">{source.title}</p>
                    <p className="text-gray-600 mt-1">{source.content}</p>
                  </div>
                  <span className="text-blue-600 font-medium">
                    {Math.round(source.score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {message.metadata && !isUser && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>⏱️ {message.metadata.responseTime}ms</span>
            <span>
              🎯 Confidence: {Math.round(message.metadata.confidence * 100)}%
            </span>
          </div>
        )}

        {/* Feedback Buttons */}
        {!isUser && onFeedback && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onFeedback(message._id, 5, 'positive')}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
            >
              <ThumbsUp className="w-3 h-3" />
              มีประโยชน์
            </button>
            <button
              onClick={() => onFeedback(message._id, 1, 'negative')}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
            >
              <ThumbsDown className="w-3 h-3" />
              ไม่มีประโยชน์
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;