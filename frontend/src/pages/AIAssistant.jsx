import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Send, Mic, MicOff, Image as ImageIcon, Bot, User, Plus,
  Volume2, VolumeX, Trash2, ChevronDown, Sparkles, X, Headphones
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
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)
  const isVoiceModeRef = useRef(false)
  const voiceTranscriptRef = useRef('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    voiceTranscriptRef.current = ''
    setLoading(true)

    try {
      const { data } = await api.post('/chat', { message: text, sessionId })
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }])
      
      if (isVoiceModeRef.current) {
        speakMessage(data.message)
      }
    } catch (err) {
      const errMsg = "I'm having trouble connecting right now. Please check your internet connection and try again."
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errMsg,
        timestamp: new Date()
      }])
      if (isVoiceModeRef.current) {
        speakMessage(errMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in your browser')
      setIsVoiceMode(false)
      isVoiceModeRef.current = false
      return
    }

    if (recognitionRef.current) recognitionRef.current.stop()

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = user?.language === 'Hindi' ? 'hi-IN' : user?.language === 'Kannada' ? 'kn-IN' : user?.language === 'Tamil' ? 'ta-IN' : user?.language === 'Telugu' ? 'te-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript
        } else {
          interim += e.results[i][0].transcript
        }
      }
      const text = finalTranscript + interim
      setInput(text)
      voiceTranscriptRef.current = text
    }
    
    recognition.onend = () => {
      setIsListening(false)
      if (isVoiceModeRef.current) {
        const text = voiceTranscriptRef.current.trim()
        if (text) {
          sendMessage(text)
        } else {
          setIsVoiceMode(false)
          isVoiceModeRef.current = false
        }
      }
    }
    
    recognition.onerror = () => {
      setIsListening(false)
      if (isVoiceModeRef.current) {
         setIsVoiceMode(false)
         isVoiceModeRef.current = false
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const toggleManualMic = () => {
    if (isVoiceMode) {
      setIsVoiceMode(false)
      isVoiceModeRef.current = false
      window.speechSynthesis.cancel()
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setInput('')
      voiceTranscriptRef.current = ''
      startListening()
    }
  }

  const toggleVoiceMode = () => {
    const nextMode = !isVoiceMode
    setIsVoiceMode(nextMode)
    isVoiceModeRef.current = nextMode
    
    if (nextMode) {
      setInput('')
      voiceTranscriptRef.current = ''
      window.speechSynthesis.cancel()
      startListening()
    } else {
      if (isListening) recognitionRef.current?.stop()
      window.speechSynthesis.cancel()
    }
  }

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = user?.language === 'Hindi' ? 'hi-IN' : 'en-IN'
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        if (isVoiceModeRef.current) {
           setInput('')
           voiceTranscriptRef.current = ''
           startListening()
        }
      }
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
            <button 
              onClick={toggleVoiceMode} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                isVoiceMode 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Headphones className={`w-4 h-4 ${isVoiceMode ? 'animate-pulse' : ''}`} />
              {isVoiceMode ? 'Voice Mode On' : 'Voice Mode'}
            </button>
            {isSpeaking && !isVoiceMode && (
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
        <div className="bg-white border-t border-gray-100 px-6 py-4">
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
              <button onClick={toggleManualMic} className={`p-1.5 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:text-green-600'}`}>
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
          {isListening && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... speak now
            </p>
          )}
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
