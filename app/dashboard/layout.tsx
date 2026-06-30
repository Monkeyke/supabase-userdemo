'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const BUILTIN_TAGS = ['ssh', 'docker', 'linux', 'git', 'vim', 'python', '其他']
const TAG_COLORS: Record<string, string> = {
  ssh: 'bg-orange-500/15 text-orange-400',
  docker: 'bg-blue-500/15 text-blue-400',
  linux: 'bg-yellow-500/15 text-yellow-400',
  git: 'bg-red-500/15 text-red-400',
  vim: 'bg-green-500/15 text-green-400',
  python: 'bg-purple-500/15 text-purple-400',
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
      {/* 侧栏 */}
      <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col shrink-0">
        {/* 品牌区 */}
        <div className="p-5 border-b border-dark-700/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">📝</span> Tech Notes
          </h2>
          <p className="text-xs text-dark-500 mt-1 truncate">{email || '未登录'}</p>
        </div>

        {/* 搜索 */}
        <div className="p-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-sm text-dark-100 placeholder-dark-500 focus:border-blue-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* 标签导航 */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-[11px] font-semibold text-dark-500 uppercase tracking-widest px-3 mb-2">
            标签
          </p>
          <button
            onClick={() => setTag(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 transition-all ${
              !activeTag
                ? 'bg-blue-600/15 text-blue-400 font-medium'
                : 'text-dark-300 hover:bg-dark-800/60'
            }`}
          >
            📋 全部笔记
          </button>
          {allTags.map((tag) => {
            const colorClass = TAG_COLORS[tag] || 'bg-dark-700 text-dark-400'
            return (
              <button
                key={tag}
                onClick={() => setTag(tag)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 transition-all flex items-center gap-2.5 ${
                  activeTag === tag
                    ? 'bg-blue-600/15 text-blue-400 font-medium'
                    : 'text-dark-300 hover:bg-dark-800/60'
                }`}
              >
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${colorClass}`}>
                  {tag}
                </span>
              </button>
            )
          })}
        </nav>

        {/* 底部 */}
        <div className="p-3 border-t border-dark-700/50">
          <div className="flex items-center gap-2 mb-2 px-2">
            <kbd className="px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700 text-dark-500 text-[10px] font-mono">Ctrl+K</kbd>
            <span className="text-[10px] text-dark-500">全局搜索</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            🚪 退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-dark-950/50">
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
