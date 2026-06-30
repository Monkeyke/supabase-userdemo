import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tech Notes - 个人技术笔记',
  description: 'SSH、Docker、Linux、Git、Vim、Python 等技术指令速查库',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
