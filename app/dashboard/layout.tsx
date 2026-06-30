'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const BUILTIN_TAGS = ['ssh', 'docker', 'linux', 'git', 'vim', 'python', '其他']
const TAG_COLORS: Record<string, string> = {
  ssh: 'bg-orange-900 text-orange-300',
  docker: 'bg-blue-900 text-blue-300',
  linux: 'bg-yellow-900 text-yellow-300',
  git: 'bg-red-900 text-red-300',
  vim: 'bg-green-900 text-green-300',
  python: 'bg-purple-900 text-purple-300',
}

function SidebarInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const activeTag = searchParams.get('tag')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '')
    })
  }, [supabase])

  useEffect(() => {
    async function loadTags() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notes')
        .select('tags')
        .eq('user_id', user.id)
      if (!data) return
      const tagSet = new Set<string>()
      data.forEach((n) => n.tags?.forEach((t: string) => tagSet.add(t)))
      setCustomTags(Array.from(tagSet).filter((t) => !BUILTIN_TAGS.includes(t)))
    }
    loadTags()
  }, [supabase])

  const allTags = [...BUILTIN_TAGS, ...customTags]

  function setTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    params.delete('q')
    setSearchInput('')
    router.push(`/dashboard?${params.toString()}`)
  }

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) {
      params.set('q', searchInput.trim())
      params.delete('tag')
    } else {
      params.delete('q')
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col shrink-0">
        <div className="p-4 border-b border-dark-700">
          <h2 className="text-lg font-bold text-white">📝 Tech Notes</h2>
          <p className="text-xs text-dark-400 mt-1 truncate">{email}</p>
        </div>

        <div className="p-3">
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="🔍 搜索笔记..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              className="flex-1 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-100 placeholder-dark-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider px-2 mb-2">
            标签
          </p>
          <button
            onClick={() => setTag(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              !activeTag ? 'bg-blue-600/20 text-blue-400' : 'text-dark-300 hover:bg-dark-800'
            }`}
          >
            📋 全部笔记
          </button>
          {allTags.map((tag) => {
            const colorClass = TAG_COLORS[tag] || 'bg-dark-700 text-dark-300'
            return (
              <button
                key={tag}
                onClick={() => setTag(tag)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-2 ${
                  activeTag === tag ? 'bg-blue-600/20 text-blue-400' : 'text-dark-300 hover:bg-dark-800'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                  {tag}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-dark-700">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg text-sm text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
          >
            🚪 退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-dark-400">加载中...</div>}>
      <SidebarInner>{children}</SidebarInner>
    </Suspense>
  )
}
