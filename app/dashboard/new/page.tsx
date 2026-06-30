'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NoteEditor from '@/components/NoteEditor'

export default function NewNotePage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(data: {
    title: string
    content: string
    tags: string[]
    isPublic: boolean
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: data.title,
      content: data.content,
      tags: data.tags,
      is_public: data.isPublic,
    })

    if (error) {
      alert('创建失败: ' + error.message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return <NoteEditor onSubmit={handleSubmit} submitLabel="💾 创建笔记" />
}
