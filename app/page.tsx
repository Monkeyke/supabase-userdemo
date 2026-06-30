import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📝 Tech Notes
        </h1>
        <p className="text-xl text-dark-300 mb-2">
          个人技术笔记 / 指令速查库
        </p>
        <p className="text-dark-400 mb-8">
          SSH · Docker · Linux · Git · Vim · Python
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            开始使用
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-lg border border-dark-600 hover:border-dark-400 text-dark-300 hover:text-dark-100 font-semibold transition-colors"
          >
            我的笔记
          </Link>
        </div>
      </div>
    </div>
  )
}
