'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SEED_COMMANDS } from '@/lib/seed-commands'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  is_public: boolean
  updated_at: string
}

const TAG_STYLES: Record<string, string> = {
  ssh: 'bg-orange-500/15 text-orange-400',
  docker: 'bg-blue-500/15 text-blue-400',
  linux: 'bg-yellow-500/15 text-yellow-400',
  git: 'bg-red-500/15 text-red-400',
  vim: 'bg-green-500/15 text-green-400',
  python: 'bg-purple-500/15 text-purple-400',
}

function usePinned() {
  const [pinned, setPinned] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('pinned_notes') || '[]')
    } catch { return [] }
  })

  const togglePin = useCallback((id: string) => {
    setPinned((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev]
      localStorage.setItem('pinned_notes', JSON.stringify(next))
      return next
    })
  }, [])

  return { pinned, togglePin }
}

function NotesContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const { pinned, togglePin } = usePinned()

  const activeTag = searchParams.get('tag')
  const searchQuery = searchParams.get('q')

  const loadNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setLoading(true)

    if (searchQuery) {
      const pattern = `%${searchQuery}%`
      const { data } = await supabase
        .from('notes')
        .select('id, title, content, tags, is_public, updated_at')
        .eq('user_id', user.id)
        .or(`title.ilike.${pattern},content.ilike.${pattern}`)
        .order('updated_at', { ascending: false })

      setNotes(data || [])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, tags, is_public, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) console.error('加载笔记失败:', error.message)
    setNotes(data || [])
    setLoading(false)
  }, [supabase, searchQuery])

  useEffect(() => { loadNotes() }, [loadNotes])

  const filteredNotes = activeTag
    ? notes.filter((n) => n.tags?.includes(activeTag))
    : notes

  // Pinned 优先
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const aP = pinned.includes(a.id) ? 1 : 0
    const bP = pinned.includes(b.id) ? 1 : 0
    return bP - aP
  })

  async function handleDelete(id: string) {
    if (!confirm('确定删除这条笔记？')) return
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) { alert('删除失败: ' + error.message); return }
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleSeed() {
    setSeeding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSeeding(false); return }

    const rows = SEED_COMMANDS.map((cmd) => ({
      user_id: user.id,
      title: cmd.title,
      content: cmd.content,
      tags: cmd.tags,
      is_public: false,
    }))

    // 分批插入 (Supabase 单次限制)
    const BATCH = 35
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH)
      const { error } = await supabase.from('notes').insert(batch)
      if (error) {
        console.error('初始化命令库失败:', error.message)
        alert('初始化失败: ' + error.message)
        setSeeding(false)
        return
      }
    }

    await loadNotes()
    setSeeding(false)
  }

  async function copyContent(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch { /* fallback */ }
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const isShortContent = (content: string) => {
    return content && content.length < 300 && !content.includes('\n')
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {activeTag ? <span className={`px-2 py-1 rounded text-sm ${TAG_STYLES[activeTag] || 'bg-dark-700 text-dark-300'}`}>🏷 {activeTag}</span>
          : searchQuery ? <span>🔍 &ldquo;{searchQuery}&rdquo;</span>
          : '📋 我的笔记'}
          {!loading && <span className="text-sm font-normal text-dark-500 ml-2">{sortedNotes.length}</span>}
        </h1>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          ✨ 新建笔记
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-dark-400 py-20">
          <div className="inline-block w-6 h-6 border-2 border-dark-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-3">加载中...</p>
        </div>
      ) : sortedNotes.length === 0 && !activeTag && !searchQuery ? (
        /* 新用户空态 */
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🚀</p>
          <p className="text-dark-100 text-lg font-semibold mb-2">欢迎使用 Tech Notes</p>
          <p className="text-dark-400 mb-8 max-w-md mx-auto leading-relaxed">
            你还没有任何笔记。点击下方按钮一键导入 <span className="text-blue-400 font-medium">70 条</span> 常用命令作为速查库，也可以自己逐条创建。
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              {seeding ? '⏳ 初始化中...' : '📦 一键初始化命令库 (70条)'}
            </button>
            <Link
              href="/dashboard/new"
              className="px-6 py-3 rounded-xl border border-dark-600 hover:border-dark-400 text-dark-300 hover:text-dark-100 font-semibold text-sm transition-all"
            >
              ✨ 自己创建
            </Link>
          </div>
        </div>
      ) : sortedNotes.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-dark-400 text-lg">
            {activeTag ? `没有「${activeTag}」标签的笔记` : searchQuery ? `没有匹配 "${searchQuery}" 的笔记` : '还没有笔记，创建第一条吧'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedNotes.map((note, idx) => {
            const isPinned = pinned.includes(note.id)
            const shortCmd = isShortContent(note.content)
            return (
              <div
                key={note.id}
                className={`group card-hover bg-dark-800 border rounded-xl p-5 transition-all ${
                  isPinned ? 'border-blue-500/40 ring-1 ring-blue-500/10' : 'border-dark-700 hover:border-dark-500'
                }`}
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* 标题行 */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {isPinned && <span className="text-xs shrink-0">📌</span>}
                      <Link
                        href={`/dashboard/edit/${note.id}`}
                        className="text-lg font-semibold text-white hover:text-blue-400 transition-colors truncate"
                      >
                        {note.title}
                      </Link>
                      {note.is_public && (
                        <Link href={`/note/${note.id}`} target="_blank" className="text-xs text-green-500 shrink-0 ml-1">
                          🌐
                        </Link>
                      )}
                    </div>

                    {/* 内容预览 */}
                    <p className="text-sm text-dark-400 line-clamp-2 leading-relaxed mb-3">
                      {note.content?.slice(0, 200) || '无内容'}
                    </p>

                    {/* 底栏：标签 + 时间 + 操作 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {note.tags?.map((tag: string) => (
                        <Link
                          key={tag}
                          href={`/dashboard?tag=${tag}`}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                            TAG_STYLES[tag] || 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                          }`}
                        >
                          {tag}
                        </Link>
                      ))}
                      <span className="text-[11px] text-dark-500 ml-auto">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* 右侧操作按钮 */}
                  <div className="flex flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePin(note.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPinned ? 'text-blue-400 bg-blue-500/10' : 'text-dark-500 hover:text-dark-300 hover:bg-dark-700'
                      }`}
                      title={isPinned ? '取消置顶' : '置顶'}
                    >
                      📌
                    </button>
                    {shortCmd && (
                      <button
                        onClick={() => copyContent(note.id, note.content)}
                        className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-700 transition-colors"
                        title="复制指令"
                      >
                        {copiedId === note.id ? '✓' : '📋'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="删除"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* 短指令：显示可复制代码块 */}
                {shortCmd && (
                  <div className="mt-3 pt-3 border-t border-dark-700">
                    <div className="flex items-center justify-between gap-2">
                      <code className="flex-1 text-sm text-dark-200 font-mono truncate">
                        {note.content}
                      </code>
                      <button
                        onClick={() => copyContent(note.id, note.content)}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-dark-200 text-xs font-medium transition-all"
                      >
                        {copiedId === note.id ? '✅ 已复制' : '📋 复制'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-dark-400">加载中...</div>}>
      <NotesContent />
    </Suspense>
  )
}
