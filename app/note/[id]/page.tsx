import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

export default async function PublicNotePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: note } = await supabase
    .from('notes')
    .select('title, content, tags, updated_at')
    .eq('id', params.id)
    .eq('is_public', true)
    .maybeSingle()

  if (!note) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="text-sm text-dark-400 hover:text-dark-200 transition-colors mb-8 inline-block"
        >
          ← 返回首页
        </Link>
        <article>
          <h1 className="text-4xl font-bold text-white mb-4">{note.title}</h1>
          <div className="flex items-center gap-3 mb-8">
            {note.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs font-medium bg-dark-800 text-dark-300 border border-dark-700"
              >
                {tag}
              </span>
            ))}
            <span className="text-xs text-dark-500">
              {new Date(note.updated_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content || '*暂无内容*'}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  )
}
