'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSeedCommandsByTag } from '@/lib/seed-commands'

interface CheatNote {
  id: string
  title: string
  content: string
  tags: string[]
}

const ALL_TAGS = ['ssh', 'docker', 'linux', 'git', 'vim', 'python', '其他']
const TAG_STYLES: Record<string, string> = {
  ssh: 'bg-orange-500/15 text-orange-400',
  docker: 'bg-blue-500/15 text-blue-400',
  linux: 'bg-yellow-500/15 text-yellow-400',
  git: 'bg-red-500/15 text-red-400',
  vim: 'bg-green-500/15 text-green-400',
  python: 'bg-purple-500/15 text-purple-400',
  其他: 'bg-gray-500/15 text-gray-400',
}

const TAG_ICONS: Record<string, string> = {
  ssh: '🔐',
  docker: '🐳',
  linux: '🐧',
  git: '🔀',
  vim: '✍️',
  python: '🐍',
  其他: '📦',
}

export default function CheatSheet() {
  const [notes, setNotes] = useState<CheatNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState<string>('ssh')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [seedingTag, setSeedingTag] = useState<string | null>(null)

  const loadNotes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('notes')
      .select('id, title, content, tags')
      .eq('user_id', user.id)
      .order('title', { ascending: true })
    setNotes((data || []) as CheatNote[])
    setLoading(false)
  }, [])

  useEffect(() => { loadNotes() }, [loadNotes])

  async function handleSeedTag(tag: string) {
    setSeedingTag(tag)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSeedingTag(null); return }

    const cmds = getSeedCommandsByTag(tag)
    // 查询已有标题，避免重复
    const { data: existing } = await supabase
      .from('notes')
      .select('title')
      .eq('user_id', user.id)
      .contains('tags', [tag])
    const existingTitles = new Set((existing || []).map((n: any) => n.title))
    const newCmds = cmds.filter((cmd) => !existingTitles.has(cmd.title))
    if (newCmds.length === 0) {
      alert(`「${tag}」标签的命令已全部导入，无需补充`)
      setSeedingTag(null)
      return
    }

    const rows = newCmds.map((cmd) => ({
      user_id: user.id,
      title: cmd.title,
      content: cmd.content,
      tags: cmd.tags,
      is_public: false,
    }))

    const { error } = await supabase.from('notes').insert(rows)
    if (error) {
      alert('初始化失败: ' + error.message)
      setSeedingTag(null)
      return
    }
    await loadNotes()
    setSeedingTag(null)
  }

  const filtered = notes.filter((n) => n.tags?.includes(activeTag))

  const copyCmd = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch { /* noop */ }
  }, [])

  const isMultiLine = (c: string) => c.includes('\n') && c.length > 80

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-6 h-6 border-2 border-dark-600 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          📋 命令速查表
        </h1>
        <p className="text-sm text-dark-500 mt-1">
          按标签分类浏览，点击 📋 一键复制命令
        </p>
      </div>

      {/* 标签 Tab */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {ALL_TAGS.map((tag) => {
          const count = notes.filter((n) => n.tags?.includes(tag)).length
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-700'
              }`}
            >
              <span>{TAG_ICONS[tag]}</span>
              <span>{tag}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-dark-700 text-dark-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 速查表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-dark-400 mb-4">
            该标签下还没有命令
          </p>
          <button
            onClick={() => handleSeedTag(activeTag)}
            disabled={seedingTag === activeTag}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            {seedingTag === activeTag ? '⏳ 导入中...' : `📦 导入「${activeTag}」命令 (${getSeedCommandsByTag(activeTag).length} 条)`}
          </button>
        </div>
      ) : (
        <>
          {/* 补充按钮：种子命令数 > 已有数时显示 */}
          {(() => {
            const seedCount = getSeedCommandsByTag(activeTag).length
            if (seedCount > filtered.length) {
              return (
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs text-dark-500">
                    已导入 {filtered.length}/{seedCount} 条，还剩 {seedCount - filtered.length} 条可补充
                  </span>
                  <button
                    onClick={() => handleSeedTag(activeTag)}
                    disabled={seedingTag === activeTag}
                    className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-60 text-dark-200 text-xs font-medium transition-all border border-dark-600 hover:border-dark-500"
                  >
                    {seedingTag === activeTag ? '⏳' : `📦 补充 ${seedCount - filtered.length} 条`}
                  </button>
                </div>
              )
            }
            return null
          })()}
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl overflow-hidden">
          {/* 表头 */}
          <div className="grid grid-cols-[1fr_2fr_80px] gap-4 px-5 py-3 bg-dark-800 border-b border-dark-700 text-xs font-semibold text-dark-400 uppercase tracking-wider">
            <span>命令名称</span>
            <span>命令内容</span>
            <span className="text-right">操作</span>
          </div>

          {/* 表体 */}
          {filtered.map((note, idx) => {
            const isExpanded = expandedId === note.id
            const showExpand = isMultiLine(note.content)
            return (
              <div
                key={note.id}
                className={`grid grid-cols-[1fr_2fr_80px] gap-4 px-5 py-3 border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors items-start ${
                  idx === filtered.length - 1 ? 'border-b-0' : ''
                }`}
              >
                {/* 名称 */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dark-100 truncate">{note.title}</p>
                  {note.tags?.filter((t) => t !== activeTag).slice(0, 2).map((t) => (
                    <span key={t} className={`inline-block mt-1 mr-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${TAG_STYLES[t] || 'bg-dark-700 text-dark-400'}`}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* 内容 */}
                <div className="min-w-0">
                  <code
                    className={`text-sm text-dark-300 font-mono leading-relaxed whitespace-pre-wrap break-all block ${
                      showExpand && !isExpanded ? 'line-clamp-2' : ''
                    }`}
                  >
                    {note.content}
                  </code>
                  {showExpand && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : note.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
                    >
                      {isExpanded ? '收起 ▲' : '展开 ▼'}
                    </button>
                  )}
                </div>

                {/* 复制 */}
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => copyCmd(note.id, note.content)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      copiedId === note.id
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-dark-200'
                    }`}
                    title="复制命令"
                  >
                    {copiedId === note.id ? '✅' : '📋'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </>
      )}

      {/* 统计底栏 */}
      <div className="mt-8 flex items-center justify-between text-xs text-dark-600">
        <span>共 {notes.length} 条命令</span>
        <span>点击 📋 一键复制到剪贴板</span>
      </div>
    </div>
  )
}
