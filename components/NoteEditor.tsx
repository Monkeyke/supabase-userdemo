'use client'

import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface NoteEditorProps {
  initialTitle?: string
  initialContent?: string
  initialTags?: string[]
  initialIsPublic?: boolean
  onSubmit: (data: { title: string; content: string; tags: string[]; isPublic: boolean }) => Promise<void>
  submitLabel?: string
}

const TAG_OPTIONS = ['ssh', 'docker', 'linux', 'git', 'vim', 'python', '其他']

type EditorMode = 'edit' | 'split' | 'preview'

const TOOLBAR_ITEMS = [
  { icon: 'B', label: '加粗', action: 'bold' },
  { icon: '_', label: '斜体', action: 'italic' },
  { icon: '`', label: '行内代码', action: 'code' },
  { icon: '```', label: '代码块', action: 'codeblock' },
  { icon: '>', label: '引用', action: 'quote' },
  { icon: '🔗', label: '链接', action: 'link' },
  { icon: '•', label: '无序列表', action: 'ul' },
  { icon: '1.', label: '有序列表', action: 'ol' },
  { icon: '==', label: '高亮', action: 'highlight' },
]

export default function NoteEditor({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialIsPublic = false,
  onSubmit,
  submitLabel = '保存',
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [customTag, setCustomTag] = useState('')
  const [mode, setMode] = useState<EditorMode>('edit')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setCustomTag('')
  }

  // ===== Markdown 工具栏 =====
  const insertMarkdown = useCallback((action: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = content.substring(start, end)
    const before = content.substring(0, start)
    const after = content.substring(end)

    let inserted = ''
    let cursorOffset = 0

    switch (action) {
      case 'bold':
        inserted = `**${sel || '粗体文本'}**`
        cursorOffset = sel ? inserted.length : 2
        break
      case 'italic':
        inserted = `_${sel || '斜体文本'}_`
        cursorOffset = sel ? inserted.length : 1
        break
      case 'code':
        inserted = `\`${sel || '代码'}\``
        cursorOffset = sel ? inserted.length : 1
        break
      case 'codeblock':
        inserted = `\n\`\`\`\n${sel || '在此输入代码...'}\n\`\`\`\n`
        cursorOffset = sel ? 4 : 4
        break
      case 'quote':
        inserted = `\n> ${sel || '引用文本'}\n`
        cursorOffset = 0
        break
      case 'link':
        inserted = `[${sel || '链接文本'}](url)`
        cursorOffset = sel ? inserted.length : 1
        break
      case 'ul':
        inserted = `\n- ${sel || '列表项'}\n`
        cursorOffset = 0
        break
      case 'ol':
        inserted = `\n1. ${sel || '列表项'}\n`
        cursorOffset = 0
        break
      case 'highlight':
        inserted = `==${sel || '高亮文本'}==`
        cursorOffset = sel ? inserted.length : 2
        break
      default:
        return
    }

    const newContent = before + inserted + after
    setContent(newContent)
    // 恢复焦点并设置光标位置
    requestAnimationFrame(() => {
      ta.focus()
      const newPos = start + (sel ? inserted.length : cursorOffset)
      ta.setSelectionRange(newPos, newPos)
    })
  }, [content])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), content, tags, isPublic })
    } finally {
      setSaving(false)
    }
  }

  const modeTabs: { mode: EditorMode; icon: string; label: string }[] = [
    { mode: 'edit', icon: '✏️', label: '编辑' },
    { mode: 'split', icon: '◫', label: '双栏' },
    { mode: 'preview', icon: '👁', label: '预览' },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-3 p-4 border-b border-dark-700 bg-dark-900 shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="flex-1 px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:border-blue-500/50 focus:outline-none text-lg font-semibold transition-colors"
          required
        />

        {/* 模式切换 */}
        <div className="flex bg-dark-800 rounded-xl border border-dark-700 p-0.5">
          {modeTabs.map(({ mode: m, icon, label }) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
              title={label}
            >
              {icon} <span className="hidden sm:inline ml-1">{label}</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded bg-dark-800 border-dark-600"
          />
          🌐 公开
        </label>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
        >
          {saving ? '⏳ 保存中...' : submitLabel}
        </button>
      </div>

      {/* 标签选择 */}
      <div className="px-4 py-2.5 border-b border-dark-700/50 bg-dark-900/30 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                tags.includes(tag)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700'
              }`}
            >
              {tag}
            </button>
          ))}
          <span className="text-dark-600 text-xs">|</span>
          {tags
            .filter((t) => !TAG_OPTIONS.includes(t))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
                title="点击移除"
              >
                {tag} ✕
              </button>
            ))}
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addCustomTag() }
            }}
            placeholder="+ 自定义标签"
            className="px-2.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 w-28 focus:border-blue-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Markdown 工具栏 (仅编辑 / 双栏模式显示) */}
      {mode !== 'preview' && (
        <div className="flex items-center gap-0.5 px-4 py-2 border-b border-dark-700/50 bg-dark-900/20 shrink-0 overflow-x-auto">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => insertMarkdown(item.action)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors whitespace-nowrap"
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
          <span className="text-dark-700 text-xs ml-3 shrink-0">Markdown</span>
        </div>
      )}

      {/* 编辑区 — 三种模式 */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Edit 模式 / Split 左侧 */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              mode === 'split'
                ? '## Markdown 内容...'
                : `使用 Markdown 编写笔记内容...\n\n## 标题\n\`\`\`bash\ndocker run -d -p 80:80 nginx\n\`\`\`\n\n> 引用文本`
            }
            className={`flex-1 p-5 bg-transparent text-dark-100 placeholder-dark-600 resize-none focus:outline-none font-mono text-sm leading-relaxed ${
              mode === 'split' ? 'border-r border-dark-700/50' : ''
            }`}
            spellCheck={false}
          />
        )}

        {/* Split 右侧 / Preview 模式 */}
        {(mode === 'split' || mode === 'preview') && (
          <div className={`flex-1 p-5 overflow-y-auto bg-dark-950/30 ${mode === 'split' ? '' : ''}`}>
            {title && (
              <h1 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-dark-700">
                {title}
              </h1>
            )}
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content || '*暂无内容...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
