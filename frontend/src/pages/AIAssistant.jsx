import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Send, Mic, MicOff, Image as ImageIcon, Bot, User, Plus,
  Volume2, VolumeX, Trash2, ChevronDown, Sparkles, X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { formatRelativeTime } from '../lib/utils'

const SUGGESTED_QUESTIONS = [
  "Will rain affect my tomato crop?",
  "How much fertilizer should I use?",
  "Should I sell my produce now?",
  "What diseases to watch for this season?",
  "Best irrigation schedule for my crops?",
  "How to prevent pest attacks?",
]

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-green-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt="uploaded" className="w-full max-w-xs rounded-xl mb-2 object-cover" />
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        {msg.timestamp && (
          <p className={`text-xs mt-1.5 ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
            {formatRelativeTime(msg.timestamp)}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="chat-bubble-ai">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste ${user?.name?.split(' ')[0]}! 🌱 I'm Krishi AI, your personal farming assistant. I know you grow ${user?.crops?.length ? user.crops.slice(0, 3).join(', ') : 'various crops'} in ${user?.farmDetails?.state || 'India'}.\n\nAsk me anything about crop diseases, weather, market prices, or farming best practices!`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => Math.random().toString(36).substring(2))
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    console.log("VITE_GEMINI_API present in frontend bundle:", !!import.meta.env.VITE_GEMINI_API);
  }, [])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API;
      if (apiKey) {
        // Build customized system instruction using active farmer profile details
        const crops = user?.crops?.join(', ') || 'various crops';
        const farmDetails = user?.farmDetails || {};
        const state = farmDetails.state || 'India';
        const soil = farmDetails.soilType || 'Mixed';
        const area = farmDetails.farmArea || 'unknown';
        const language = user?.language || 'English';
        const name = user?.name || 'Farmer';

        const systemPrompt = `You are Krishi AI, a highly specialized and personalized AI farming assistant for Indian farmers.

FARMER PROFILE:
- Name: ${name}
- Location: ${state}, India
- Crops: ${crops}
- Farm Area: ${area} acres
- Soil Type: ${soil}
- Preferred Language: ${language}

YOUR ROLE:
- Provide hyper-personalized farming advice based on this specific farmer's profile
- Answer questions about crop diseases, treatments, weather impact, market prices, and farming practices
- Give practical, actionable advice using locally available products and methods
- Use Indian agricultural context, local crop varieties, and regional farming practices
- Reference ICAR, state agricultural universities, and proven Indian farming methods
- Keep responses concise, practical, and easy to understand for farmers
- If the farmer asks in Hindi or regional language, respond in that language
- Speak politely and offer guidance with empathy as a knowledgeable agri-expert.`;

        // Format conversation history for Gemini (alternating roles user/model)
        const historyForGemini = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Add current user message
        historyForGemini.push({
          role: 'user',
          parts: [{ text: text }]
        });

        // Query the Gemini 2.5 Flash model directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: historyForGemini,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP error ${response.status}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I encountered an issue generating a response. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: responseText, timestamp: new Date() }]);
      } else {
        // Fallback to local server
        const { data } = await api.post('/chat', { message: text, sessionId })
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }])
      }
    } catch (err) {
      console.error('Chat error:', err);
      try {
        console.warn('Gemini failed, trying local fallback...');
        const { data } = await api.post('/chat', { message: text, sessionId })
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }])
      } catch (fallbackErr) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'm having trouble connecting right now. (Error: ${err.message})`,
          timestamp: new Date()
        }])
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    const langMap = {
      'Hindi': 'hi-IN',
      'Kannada': 'kn-IN',
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'English': 'en-IN'
    }
    recognition.lang = langMap[user?.language] || 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      setInput((finalTranscript + interimTranscript).trim())
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = user?.language === 'Hindi' ? 'hi-IN' : 'en-IN'
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared. Namaste ${user?.name?.split(' ')[0]}! How can I help with your farm today?`,
      timestamp: new Date(),
    }])
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-display">Krishi AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">Active · Knows your farm</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isSpeaking && (
              <button onClick={() => window.speechSynthesis.cancel()} className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <VolumeX className="w-5 h-5" />
              </button>
            )}
            <button onClick={clearChat} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className="group relative">
              <ChatMessage msg={msg} />
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakMessage(msg.content)}
                  className="absolute top-0 right-0 p-1.5 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-400 font-medium mb-2">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:border-green-400 hover:text-green-700 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 relative">
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                className="mb-4 p-4 bg-[#EEF3E8] border border-[#DDE8DC] rounded-2xl flex items-center justify-between shadow-xs relative overflow-hidden"
              >
                {/* Subtle gradient glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 pointer-events-none" />
                
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-md shadow-green-600/20">
                    <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black tracking-widest text-[#2D6A47] uppercase block">
                      Active Voice Telemetry
                    </span>
                    <p className="text-xs text-[#111D14] font-semibold italic mt-0.5 max-w-[240px] sm:max-w-md truncate">
                      {input || 'Listening for your voice...'}
                    </p>
                  </div>
                </div>

                {/* Simulated bouncing frequency wave */}
                <div className="flex gap-1 items-end h-6 pr-2 relative z-10 flex-shrink-0">
                  <span className="w-0.5 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-0.5 h-5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="w-0.5 h-4 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-0.5 h-6 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <span className="w-0.5 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-end gap-2 px-4 py-3 focus-within:border-green-400 focus-within:bg-white transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                placeholder={`Ask about your ${user?.crops?.[0] || 'crops'}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-32"
                style={{ minHeight: '24px' }}
              />
              <button onClick={toggleVoiceInput} className={`p-1.5 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:text-green-600'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Context panel */}
      <div className="w-72 bg-white border-l border-gray-100 p-5 hidden xl:block overflow-y-auto custom-scrollbar">
        <h4 className="font-bold text-gray-900 font-display mb-4">Your Farm Context</h4>
        <div className="space-y-3">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-600 font-semibold mb-1">Crops</p>
            <div className="flex flex-wrap gap-1.5">
              {(user?.crops || ['No crops added']).map(c => (
                <span key={c} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-600 font-semibold mb-1">Location</p>
            <p className="text-sm font-medium text-gray-900">
              {user?.farmDetails?.district && `${user.farmDetails.district}, `}{user?.farmDetails?.state || 'Not set'}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs text-orange-600 font-semibold mb-1">Farm Size</p>
            <p className="text-sm font-medium text-gray-900">{user?.farmDetails?.farmArea || '?'} acres</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs text-purple-600 font-semibold mb-1">Soil Type</p>
            <p className="text-sm font-medium text-gray-900">{user?.farmDetails?.soilType || 'Not set'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 font-semibold mb-1">Language</p>
            <p className="text-sm font-medium text-gray-900">{user?.language || 'English'}</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-bold text-gray-900 font-display mb-3">Capabilities</h4>
          <div className="space-y-2">
            {[
              { emoji: '🦠', label: 'Disease diagnosis' },
              { emoji: '🌤️', label: 'Weather advice' },
              { emoji: '💰', label: 'Market prices' },
              { emoji: '💊', label: 'Treatment plans' },
              { emoji: '🎤', label: 'Voice input' },
              { emoji: '🔊', label: 'Text to speech' },
            ].map(cap => (
              <div key={cap.label} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{cap.emoji}</span> {cap.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
