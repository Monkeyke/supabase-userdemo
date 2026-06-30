'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  is_public: boolean
  updated_at: string
}

function NotesContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const activeTag = searchParams.get('tag')
  const searchQuery = searchParams.get('q')

  const loadNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setLoading(true)

    // 如果有搜索关键词，使用 ilike 模糊搜索
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

  async function handleDelete(id: string) {
    if (!confirm('确定删除这条笔记？')) return
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) { alert('删除失败: ' + error.message); return }
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {activeTag ? `🏷 ${activeTag}` : searchQuery ? `🔍 "${searchQuery}"` : '📋 我的笔记'}
        </h1>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
        >
          ✨ 新建笔记
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-dark-400 py-20">加载中...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-dark-400">
            {activeTag ? `没有「${activeTag}」标签的笔记` : searchQuery ? `没有匹配 "${searchQuery}" 的笔记` : '还没有笔记，点击上方按钮创建第一条'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-dark-800 border border-dark-700 rounded-lg p-4 hover:border-dark-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/edit/${note.id}`} className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                    {note.title}
                  </Link>
                  <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                    {note.content?.slice(0, 200) || '无内容'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {note.tags?.map((tag: string) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded text-xs font-medium bg-dark-700 text-dark-300">{tag}</span>
                    ))}
                    {note.is_public && <span className="text-xs text-green-500">🌐 公开</span>}
                    {note.is_public && (
                      <Link
                        href={`/note/${note.id}`}
                        target="_blank"
                        className="text-xs text-blue-500 hover:text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-dark-500 whitespace-nowrap">
                    {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                  </span>
                  <button onClick={() => handleDelete(note.id)} className="px-2 py-1 rounded text-xs text-dark-400 hover:text-red-400 hover:bg-dark-700 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
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
