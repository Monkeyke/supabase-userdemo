'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        alert('注册成功！如果未启用邮件验证，可直接登录。')
        setIsRegister(false)
        setLoading(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">
          📝 Tech Notes
        </h1>
        <p className="text-center text-dark-400 mb-8">
          {isRegister ? '创建新账号' : '登录以管理笔记'}
        </p>

        <div className="flex rounded-lg bg-dark-800 p-1 mb-6">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              !isRegister ? 'bg-dark-700 text-white' : 'text-dark-400'
            }`}
            onClick={() => setIsRegister(false)}
          >
            登录
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              isRegister ? 'bg-dark-700 text-white' : 'text-dark-400'
            }`}
            onClick={() => setIsRegister(true)}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-100 placeholder-dark-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-100 placeholder-dark-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder={isRegister ? '至少6位密码' : '输入密码'}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading ? '处理中...' : isRegister ? '注 册' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  )
}
