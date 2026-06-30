'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NoteEditor from '@/components/NoteEditor'

export default function EditNotePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [initialData, setInitialData] = useState<{
    title: string
    content: string
    tags: string[]
    isPublic: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const noteId = params.id as string

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setInitialData({
        title: data.title,
        content: data.content || '',
        tags: data.tags || [],
        isPublic: data.is_public || false,
      })
      setLoading(false)
    }
    load()
  }, [noteId, supabase])

  async function handleSubmit(data: {
    title: string
    content: string
    tags: string[]
    isPublic: boolean
  }) {
    const { error } = await supabase
      .from('notes')
      .update({
        title: data.title,
        content: data.content,
        tags: data.tags,
        is_public: data.isPublic,
      })
      .eq('id', noteId)

    if (error) {
      alert('保存失败: ' + error.message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  if (loading) {
    return <div className="p-6 text-dark-400">加载中...</div>
  }

  if (notFound) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-dark-400">笔记不存在或无权访问</p>
      </div>
    )
  }

  return (
    <NoteEditor
      initialTitle={initialData!.title}
      initialContent={initialData!.content}
      initialTags={initialData!.tags}
      initialIsPublic={initialData!.isPublic}
      onSubmit={handleSubmit}
      submitLabel="💾 保存修改"
    />
  )
}
