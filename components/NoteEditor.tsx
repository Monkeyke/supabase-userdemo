'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface NoteEditorProps {
  initialTitle?: string
  initialContent?: string
  initialTags?: string[]
  initialIsPublic?: boolean
  onSubmit: (data: { title: string; content: string; tags: string[]; isPublic: boolean }) => Promise<void>
  submitLabel?: string
}

const TAG_OPTIONS = ['ssh', 'docker', 'linux', 'git', 'vim', 'python', '其他']

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
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-3 p-4 border-b border-dark-700 bg-dark-900 shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="flex-1 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:border-blue-500 focus:outline-none text-lg font-semibold"
          required
        />
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            preview ? 'bg-blue-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'
          }`}
        >
          {preview ? '✏️ 编辑' : '👁 预览'}
        </button>
        <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
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
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
        >
          {saving ? '保存中...' : submitLabel}
        </button>
      </div>

      {/* 标签选择 */}
      <div className="px-4 py-3 border-b border-dark-700 bg-dark-900/50 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                tags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
          <span className="text-dark-600 mx-1">|</span>
          {tags
            .filter((t) => !TAG_OPTIONS.includes(t))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 hover:bg-red-900 hover:text-red-300 transition-colors"
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
            className="px-2 py-1 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 w-28 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 编辑器 / 预览 */}
      <div className="flex-1 flex overflow-hidden">
        {preview ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-4">{title || '未命名笔记'}</h1>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="使用 Markdown 编写笔记内容...&#10;&#10;## 示例&#10;```bash&#10;docker run -d -p 80:80 nginx&#10;```"
            className="flex-1 p-6 bg-transparent text-dark-100 placeholder-dark-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>
    </form>
  )
}
