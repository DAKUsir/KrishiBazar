import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle, Heart, Share2, Plus, Filter, Search,
  Image as ImageIcon, Send, ChevronDown, Sparkles, X, Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { formatRelativeTime, getSeverityColor } from '../lib/utils'

function PostCard({ post, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const { user } = useAuth()

  const isLiked = post.likes?.some(id => id === user?._id || (id && id._id === user?._id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card overflow-hidden"
    >
      {/* Author */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.author?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${post.author?.name}`}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-green-100"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{post.author?.name}</p>
            <p className="text-xs text-gray-400">
              {post.author?.farmDetails?.state} · {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        {post.isAIGenerated && (
          <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
            <Sparkles className="w-3 h-3" /> AI Generated
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-gray-900 mb-2 leading-tight">{post.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{post.description}</p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-1 mb-3 mx-4 ${post.images.length > 1 ? 'grid-cols-2' : ''}`}>
          {post.images.slice(0, 2).map((img, i) => (
            <img key={i} src={img} alt="post" className="w-full h-40 object-cover rounded-xl" />
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        {post.cropType && <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-lg">🌱 {post.cropType}</span>}
        {post.disease && <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg">🦠 {post.disease}</span>}
        {post.state && <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg">📍 {post.state}</span>}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments?.length || 0}
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
              {post.comments?.map(c => (
                <div key={c._id} className="flex gap-3">
                  <img
                    src={c.author?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${c.author?.name}`}
                    alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-gray-700">{c.author?.name}</p>
                    <p className="text-sm text-gray-600">{c.text}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <img
                  src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
                  alt="" className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
                  />
                  <button
                    onClick={() => { onComment(post._id, comment); setComment('') }}
                    disabled={!comment.trim()}
                    className="p-2 bg-green-600 text-white rounded-xl disabled:opacity-50 hover:bg-green-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CreatePostModal({ onClose }) {
  const [form, setForm] = useState({ title: '', description: '', cropType: '', disease: '', state: '', language: 'English' })
  const [posting, setPosting] = useState(false)
  const qc = useQueryClient()
  const { user } = useAuth()

  const handlePost = async () => {
    setPosting(true)
    try {
      await api.post('/community/posts', form)
      qc.invalidateQueries(['community-posts'])
      onClose()
    } finally {
      setPosting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-bold text-gray-900 font-display text-lg">Create Post</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`} alt="" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.farmDetails?.state || 'India'}</p>
            </div>
          </div>

          <input
            placeholder="Post title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
          />
          <textarea
            placeholder="Describe your farming problem or experience..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Crop type" value={form.cropType} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
            <input placeholder="Disease (optional)" value={form.disease} onChange={e => setForm(f => ({ ...f, disease: e.target.value }))}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <button
            onClick={handlePost}
            disabled={posting || !form.title || !form.description}
            className="w-full btn-primary disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Share with Community'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Community() {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [filters, setFilters] = useState({})
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['community-posts', filters],
    queryFn: () => api.get('/community', { params: filters }).then(r => r.data),
  })

  const likeMutation = useMutation({
    mutationFn: (postId) => api.post(`/community/posts/${postId}/like`),
    onSuccess: () => qc.invalidateQueries(['community-posts']),
  })

  const commentMutation = useMutation({
    mutationFn: ({ postId, text }) => api.post(`/community/posts/${postId}/comment`, { text }),
    onSuccess: () => qc.invalidateQueries(['community-posts']),
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search discussions..."
              className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white shadow-sm w-72"
            />
          </div>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', 'Tomato', 'Rice', 'Wheat', 'Disease Help', 'Market'].map(tag => (
          <button
            key={tag}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${tag === 'All' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Posts */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
            </div>
          ) : data?.posts?.length ? (
            data.posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onLike={(id) => likeMutation.mutate(id)}
                onComment={(postId, text) => commentMutation.mutate({ postId, text })}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="dashboard-card p-5">
            <h3 className="font-bold text-gray-900 font-display mb-4">Trending Topics</h3>
            <div className="space-y-2">
              {['#TomatoEarlyBlight', '#MonsoonfarmingTips', '#RiceBlast', '#OrganicFarming', '#SmartIrrigation'].map((tag, i) => (
                <div key={tag} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-green-700 font-medium text-sm">{tag}</span>
                  <span className="text-xs text-gray-400">{Math.floor(Math.random() * 200 + 50)} posts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-5">
            <h3 className="font-bold text-gray-900 font-display mb-4">Expert Corner</h3>
            <p className="text-sm text-gray-500 mb-3">Ask verified agricultural experts</p>
            <button className="w-full btn-secondary text-sm">Ask an Expert →</button>
          </div>
        </div>
      </div>

      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
    </div>
  )
}
