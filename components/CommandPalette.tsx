'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  title: string
  content: string
  tags: string[]
}

export default function CommandPalette() {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(false)

  // 全局快捷键
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery('')
        setSelectedIdx(0)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // 自动聚焦
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // 搜索
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const { data: { user } } = await supabaseRef.current.auth.getUser()
    if (!user) { setLoading(false); return }

    const pattern = `%${q}%`
    const { data } = await supabaseRef.current
      .from('notes')
      .select('id, title, content, tags')
      .eq('user_id', user.id)
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .order('updated_at', { ascending: false })
      .limit(10)

    setResults((data || []) as SearchResult[])
    setSelectedIdx(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 150)
    return () => clearTimeout(t)
  }, [query, search])

  // 键盘导航
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      goTo(results[selectedIdx])
    }
  }

  function goTo(r: SearchResult) {
    setOpen(false)
    router.push(`/dashboard/edit/${r.id}`)
  }

  const TAG_COLORS: Record<string, string> = {
    ssh: 'bg-orange-900/60 text-orange-300',
    docker: 'bg-blue-900/60 text-blue-300',
    linux: 'bg-yellow-900/60 text-yellow-300',
    git: 'bg-red-900/60 text-red-300',
    vim: 'bg-green-900/60 text-green-300',
    python: 'bg-purple-900/60 text-purple-300',
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] animate-overlay-in"
      onClick={() => setOpen(false)}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 面板 */}
      <div
        className="relative w-full max-w-xl mx-4 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索栏 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-700">
          <span className="text-dark-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="搜索笔记标题或内容..."
            className="flex-1 bg-transparent text-dark-100 placeholder-dark-500 outline-none text-base"
          />
          <kbd className="px-2 py-0.5 rounded-md bg-dark-700 text-dark-400 text-xs font-mono border border-dark-600">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div className="max-h-72 overflow-y-auto">
          {loading && (
            <div className="px-5 py-8 text-center text-dark-400 text-sm">搜索中...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="px-5 py-8 text-center text-dark-400 text-sm">
              没有找到匹配的笔记
            </div>
          )}

          {!query && !loading && (
            <div className="px-5 py-8 text-center text-dark-500 text-sm">
              输入关键词搜索你的笔记
              <div className="mt-2 text-xs">
                打开快捷键 <kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 font-mono text-xs">Ctrl+K</kbd>
              </div>
            </div>
          )}

          {results.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => goTo(r)}
              className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors ${
                idx === selectedIdx
                  ? 'bg-blue-600/15 border-l-2 border-blue-500'
                  : 'border-l-2 border-transparent hover:bg-dark-700/50'
              }`}
              onMouseEnter={() => setSelectedIdx(idx)}
            >
              <span className="text-dark-400 mt-0.5 shrink-0">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-100 truncate">{r.title}</p>
                <p className="text-xs text-dark-400 mt-0.5 truncate">
                  {r.content?.slice(0, 80) || '无内容'}
                </p>
                {r.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {r.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          TAG_COLORS[tag] || 'bg-dark-700 text-dark-400'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-dark-700 text-[10px] text-dark-500">
          <span><kbd className="px-1 py-0.5 rounded bg-dark-700 text-dark-400 font-mono">↑↓</kbd> 导航</span>
          <span><kbd className="px-1 py-0.5 rounded bg-dark-700 text-dark-400 font-mono">Enter</kbd> 打开</span>
          <span><kbd className="px-1 py-0.5 rounded bg-dark-700 text-dark-400 font-mono">Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  )
}
