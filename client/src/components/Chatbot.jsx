import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import api from '../api/axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm FoodLink AI 🌱 I can help you navigate the platform — how to donate, receive, or deliver food. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send history excluding the last user message (already in `message`)
      const history = newMessages.slice(0, -1);
      const { data } = await api.post('/ai/chat', {
        message: trimmed,
        history,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please check your Gemini API key in the server .env file.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    'How do I donate food?',
    'How do receivers claim food?',
    'What do volunteers do?',
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center transition-all"
        title="FoodLink AI"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={26} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={26} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute w-full h-full rounded-full bg-green-400 opacity-30 animate-ping" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed bottom-28 right-6 z-50 w-[360px] max-h-[580px] flex flex-col bg-white rounded-3xl shadow-2xl shadow-gray-300/60 border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-extrabold text-base leading-tight">FoodLink AI</p>
                <p className="text-green-100 text-xs font-medium">Always here to help</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50" style={{ minHeight: 0 }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-green-500' : 'bg-emerald-100 border border-emerald-200'}`}>
                    {msg.role === 'user'
                      ? <User size={14} className="text-white" />
                      : <Bot size={14} className="text-emerald-600" />}
                  </div>
                  <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${msg.role === 'user'
                      ? 'bg-green-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <Bot size={14} className="text-emerald-600" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100 shadow-sm">
                    <Loader2 size={16} className="text-green-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies — shown only at start */}
            {messages.length <= 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50); }}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl font-semibold transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none text-sm font-medium text-gray-800 placeholder-gray-400 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shadow-md shadow-green-500/20 active:scale-95 transition-all flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
