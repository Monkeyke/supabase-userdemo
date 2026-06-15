# AGENTS.md

## 项目概述

这是一个 Supabase RBAC（基于角色的访问控制）演示项目，单文件 HTML 应用（`supabase-demo.html`），无需构建工具。

GitHub: https://github.com/Monkeyke/supabase-userdemo

## 技术栈

- **Supabase JS SDK v2** — 通过 importmap 从 `esm.sh` 加载
- **Supabase Auth** — 邮箱/密码认证
- **Supabase Database** — 用户资料、签到、积分系统
- **Supabase Storage** — 头像上传（`avatars` bucket）
- **Supabase Realtime** — `postgres_changes` 监听个人资料更新
- **RLS + SECURITY DEFINER RPC** — 安全数据访问模式

## 关键约定

- 所有业务逻辑内嵌在单个 HTML 文件中（CSS + JS 均为内联）
- 用户资料表：`user_info`，含 `id`, `username`, `avatar_url`, `bio`, `points`, `role`, `status`, `created_at`
- 角色分为 `admin` 和 `user`，通过 `role` 字段区分
- 排行榜通过定时轮询（5 秒）RPC 函数实现，而非直接 Realtime 广播
- RPC 函数：`get_leaderboard`, `get_my_ranking`, `search_users`, `daily_checkin`, `get_today_checkin_status`, `award_profile_completion`, `admin_adjust_points`
- 头像存储路径格式：`{user_id}/{timestamp}.{ext}`
- 用户搜索有 300ms 防抖
- `PGRST116` 错误码表示 0 行，用于处理触发器延迟（最多重试 5 次，间隔 1 秒）

## 本地运行

直接用浏览器打开 `supabase-demo.html` 即可，无需本地服务器。
