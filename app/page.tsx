'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const QUICK_COMMANDS = [
  { label: 'Git 撤销 commit', cmd: 'git reset --soft HEAD~1', tag: 'git' },
  { label: 'Docker 清理所有容器', cmd: 'docker rm -f $(docker ps -aq)', tag: 'docker' },
  { label: 'SSH 免密登录', cmd: 'ssh-copy-id user@host', tag: 'ssh' },
  { label: '查找大文件', cmd: 'find . -type f -size +100M', tag: 'linux' },
  { label: 'Python 虚拟环境', cmd: 'python -m venv .venv && source .venv/bin/activate', tag: 'python' },
  { label: 'Git 查看历史', cmd: 'git log --oneline --graph --all', tag: 'git' },
]

const TAG_STYLES: Record<string, string> = {
  git: 'bg-red-500/15 text-red-400',
  docker: 'bg-blue-500/15 text-blue-400',
  ssh: 'bg-orange-500/15 text-orange-400',
  linux: 'bg-yellow-500/15 text-yellow-400',
  python: 'bg-purple-500/15 text-purple-400',
}

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [searchQuery, router])

  const copyCmd = useCallback(async (cmd: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1800)
    } catch { /* fallback */ }
  }, [])

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* 顶部辉光装饰 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* 标题区 */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow leading-tight">
            📝 Tech Notes
          </h1>
          <p className="text-lg text-dark-300 mb-2">
            个人技术笔记 / 指令速查库
          </p>
          <p className="text-sm text-dark-500">
            SSH · Docker · Linux · Git · Vim · Python
          </p>
        </div>

        {/* 全局搜索栏 */}
        <form onSubmit={handleSearch} className="animate-fade-in-up stagger-1 mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative flex items-center bg-dark-800 border border-dark-600 rounded-xl focus-within:border-blue-500/50 focus-within:bg-dark-800/80 transition-all shadow-lg shadow-black/10">
              <span className="pl-4 text-dark-400 text-lg">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索指令或笔记…"
                className="flex-1 bg-transparent px-3 py-3.5 text-dark-100 placeholder-dark-500 outline-none text-base"
              />
              <kbd className="hidden sm:inline-flex items-center mr-3 px-2 py-1 rounded-md bg-dark-700 text-dark-400 text-xs font-mono border border-dark-600">
                ⌘K
              </kbd>
              <button
                type="submit"
                className="hidden sm:block mr-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                搜索
              </button>
            </div>
          </div>
        </form>

        {/* 快速操作按钮 */}
        <div className="flex gap-4 justify-center animate-fade-in-up stagger-2 mb-14">
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            🚀 开始使用
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-xl border border-dark-600 hover:border-dark-400 text-dark-300 hover:text-dark-100 font-semibold transition-all hover:-translate-y-0.5"
          >
            📚 我的笔记
          </Link>
        </div>

        {/* 快速指令卡片 */}
        <div className="animate-fade-in-up stagger-3">
          <p className="text-xs text-dark-500 uppercase tracking-widest mb-3 text-center">⚡ 常用指令速查</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_COMMANDS.map((item, idx) => (
              <div
                key={item.label}
                className="group relative bg-dark-800/60 border border-dark-700 rounded-xl p-4 hover:border-dark-500 hover:bg-dark-800 transition-all hover:-translate-y-0.5"
                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-dark-400 truncate">{item.label}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TAG_STYLES[item.tag] || 'bg-dark-700 text-dark-400'}`}>
                        {item.tag}
                      </span>
                    </div>
                    <code className="text-sm text-dark-200 font-mono break-all leading-relaxed block">
                      {item.cmd}
                    </code>
                  </div>
                  <button
                    onClick={() => copyCmd(item.cmd, idx)}
                    className="shrink-0 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-dark-200 transition-all opacity-0 group-hover:opacity-100"
                    title="复制指令"
                  >
                    {copiedIdx === idx ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : (
                      <span className="text-sm">📋</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-dark-600 mt-12 animate-fade-in-up stagger-5">
          按下 <kbd className="px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700 text-dark-400 font-mono">Ctrl+K</kbd> 随时全局搜索笔记
        </p>
      </div>
    </div>
  )
}
