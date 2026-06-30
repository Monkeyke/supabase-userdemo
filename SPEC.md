# 项目：个人技术笔记 / 指令速查库

## 技术栈
- 前端：Next.js 14 (App Router) + Tailwind CSS
- 后端/数据库：Supabase (PostgreSQL + Auth + RLS)
- 部署：Vercel

## 功能需求

### 认证
- 使用 Supabase Auth，支持邮箱+密码登录/注册
- 登录后才能进入笔记管理页面
- 未登录用户只能访问公开分享的笔记页面

### 笔记 CRUD
- 创建笔记：标题、内容（Markdown 支持）、标签（多选）、是否公开
- 编辑 / 删除自己的笔记
- 笔记列表页：显示所有自己的笔记，按更新时间倒序

### 标签分类
- 内置标签：ssh、docker、linux、git、vim、python、其他
- 支持自定义标签
- 侧边栏按标签筛选笔记

### 搜索
- 搜索框输入关键词，实时查询 Supabase（标题 + 内容全文搜索）
- 使用 Supabase 的 .ilike() 或 全文搜索 to_tsvector

### 公开分享
- 每条笔记有一个唯一的公开链接：/note/[id]
- 公开笔记无需登录即可访问
- 私有笔记访问公开链接时返回 404

## 数据库表结构（Supabase）

### profiles 表
- id: uuid (references auth.users)
- username: text
- created_at: timestamp

### notes 表
- id: uuid (primary key, default gen_random_uuid())
- user_id: uuid (references auth.users)
- title: text (not null)
- content: text
- tags: text[] (数组)
- is_public: boolean (default false)
- created_at: timestamp
- updated_at: timestamp

### Row Level Security (RLS) 策略
- 用户只能读写自己的笔记（user_id = auth.uid()）
- is_public = true 的笔记，任何人（包括匿名）可以读取

## 页面结构
- / → 首页（未登录显示介绍+登录按钮，已登录跳转 /dashboard）
- /login → 登录/注册页
- /dashboard → 笔记列表（需登录）
- /dashboard/new → 新建笔记（需登录）
- /dashboard/edit/[id] → 编辑笔记（需登录，只能编辑自己的）
- /note/[id] → 公开笔记页（无需登录，仅 is_public=true 可访问）

## UI 风格
- 简洁暗色主题（dark mode 为主）
- 侧边栏显示标签列表 + 搜索框
- 笔记内容支持 Markdown 渲染（使用 react-markdown）
- 代码块支持语法高亮（使用 rehype-highlight 或 prism）

## 环境变量
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key

## 额外要求
- 使用 @supabase/ssr 做服务端认证（Next.js App Router 推荐方式）
- 笔记列表页搜索时直接调用 Supabase query，不走缓存，确保每次搜索都触发 DB 查询（保活用）
- 代码结构清晰，每个文件职责单一