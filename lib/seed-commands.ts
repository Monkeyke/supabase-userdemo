/**
 * 种子命令数据 — 新用户一键初始化命令库
 * 按 7 个标签分类，共 70 条常用/基础命令
 */

export interface SeedCommand {
  title: string
  content: string
  tags: string[]
  is_public: false
}

export const SEED_COMMANDS: SeedCommand[] = [
  // ==================== SSH ====================
  { title: 'SSH 免密登录',     content: 'ssh-copy-id user@host',                                   tags: ['ssh'], is_public: false },
  { title: 'SSH 密钥生成',     content: 'ssh-keygen -t ed25519 -C "your_email@example.com"',       tags: ['ssh'], is_public: false },
  { title: 'SSH 本地端口转发', content: 'ssh -L 8080:localhost:80 user@host',                       tags: ['ssh'], is_public: false },
  { title: 'SSH 远程端口转发', content: 'ssh -R 9090:localhost:3000 user@host',                    tags: ['ssh'], is_public: false },
  { title: 'SSH 动态转发(SOCKS)', content: 'ssh -D 1080 user@host',                                 tags: ['ssh'], is_public: false },
  { title: 'SSH Config 多主机', content: `Host myserver\n  HostName 192.168.1.100\n  User root\n  Port 22\n  IdentityFile ~/.ssh/id_ed25519`, tags: ['ssh'], is_public: false },
  { title: 'SCP 远程拷贝',     content: 'scp -r local_folder user@host:/remote/path',               tags: ['ssh'], is_public: false },
  { title: 'rsync 增量同步',  content: 'rsync -avz -e ssh ./local user@host:/remote',               tags: ['ssh'], is_public: false },
  { title: 'SSH Agent 添加密钥', content: 'eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519',    tags: ['ssh'], is_public: false },
  { title: 'SSH 保持连接不断开', content: `Host *\n  ServerAliveInterval 60\n  ServerAliveCountMax 5`, tags: ['ssh'], is_public: false },

  // ==================== Docker ====================
  { title: 'Docker 运行容器',   content: 'docker run -d --name myapp -p 8080:80 -v $(pwd):/app myimage:latest', tags: ['docker'], is_public: false },
  { title: 'Docker 进入容器',   content: 'docker exec -it container_name /bin/bash',                  tags: ['docker'], is_public: false },
  { title: 'Docker 查看日志',   content: 'docker logs -f --tail 100 container_name',                 tags: ['docker'], is_public: false },
  { title: 'Docker 构建镜像',   content: 'docker build -t myapp:v1.0 .',                             tags: ['docker'], is_public: false },
  { title: 'Docker Compose 启动', content: 'docker compose up -d --build',                            tags: ['docker'], is_public: false },
  { title: 'Docker 清理所有资源', content: 'docker system prune -a --volumes',                        tags: ['docker'], is_public: false },
  { title: 'Docker 查看资源使用', content: 'docker stats --no-stream',                               tags: ['docker'], is_public: false },
  { title: 'Docker 镜像导出/导入', content: 'docker save -o myapp.tar myapp && docker load -i myapp.tar', tags: ['docker'], is_public: false },
  { title: 'Docker 网络创建',   content: 'docker network create --driver bridge mynet',               tags: ['docker'], is_public: false },
  { title: 'Docker Volume 管理', content: 'docker volume create mydata && docker run -v mydata:/data ...', tags: ['docker'], is_public: false },

  // ==================== Linux ====================
  { title: '查找大文件 (>100MB)', content: 'find . -type f -size +100M -exec ls -lh {} \\;',          tags: ['linux'], is_public: false },
  { title: '批量替换文本',      content: "grep -rl 'old_str' . | xargs sed -i 's/old_str/new_str/g'",  tags: ['linux'], is_public: false },
  { title: '查看端口占用',      content: 'lsof -i :8080          # 或 ss -tlnp | grep 8080',          tags: ['linux'], is_public: false },
  { title: '磁盘使用分析',      content: 'df -h && du -sh /* 2>/dev/null | sort -rh | head -10',      tags: ['linux'], is_public: false },
  { title: '进程树查看',        content: 'ps auxf --sort=-%mem | head -20',                           tags: ['linux'], is_public: false },
  { title: '压缩/解压 tar',     content: 'tar -czvf archive.tar.gz folder/    # 解压: tar -xzvf archive.tar.gz', tags: ['linux'], is_public: false },
  { title: 'systemd 服务管理',  content: 'systemctl status|start|stop|restart|enable|disable service_name', tags: ['linux'], is_public: false },
  { title: 'crontab 定时任务',  content: '# 编辑: crontab -e\n# 每天 3 点执行: 0 3 * * * /path/to/script.sh', tags: ['linux'], is_public: false },
  { title: 'iptables 防火墙',   content: '# 开放端口\niptables -A INPUT -p tcp --dport 80 -j ACCEPT\n# 查看规则\niptables -L -n -v', tags: ['linux'], is_public: false },
  { title: 'strace 系统调用调试', content: 'strace -f -o trace.log -p <pid>',                          tags: ['linux'], is_public: false },

  // ==================== Git ====================
  { title: 'Git 撤销 commit',    content: 'git reset --soft HEAD~1        # 保留修改\n# 或: git reset --hard HEAD~1 (丢弃修改)', tags: ['git'], is_public: false },
  { title: 'Git stash 暂存',    content: 'git stash push -m "WIP"\ngit stash pop        # 恢复最近\n# pop 优先用 apply 更安全', tags: ['git'], is_public: false },
  { title: 'Git reflog 恢复',   content: 'git reflog\n# 找到丢失的 commit hash\ngit reset --hard <hash>', tags: ['git'], is_public: false },
  { title: 'Git rebase 整理提交', content: 'git rebase -i HEAD~4\n# pick/squash/fixup/drop 交互式编排', tags: ['git'], is_public: false },
  { title: 'Git cherry-pick',   content: 'git cherry-pick <commit-hash>\n# 多 commit: git cherry-pick A..B', tags: ['git'], is_public: false },
  { title: 'Git bisect 二分调试', content: 'git bisect start\ngit bisect bad HEAD\ngit bisect good v1.0\n# 找到引入 bug 的 commit', tags: ['git'], is_public: false },
  { title: 'Git blame 逐行溯源', content: 'git blame -L 10,30 filename',                                 tags: ['git'], is_public: false },
  { title: 'Git diff 对比',     content: 'git diff HEAD~3..HEAD         # 最近 3 次\ngit diff --stat               # 仅统计\ngit diff branchA..branchB', tags: ['git'], is_public: false },
  { title: 'Git 清理远程分支引用', content: 'git remote prune origin\ngit fetch -p                     # fetch 时自动清理', tags: ['git'], is_public: false },
  { title: 'Git submodule 管理', content: 'git submodule add <url> <path>\ngit submodule update --init --recursive', tags: ['git'], is_public: false },

  // ==================== Vim ====================
  { title: 'Vim 基本操作速查',   content: 'i → 插入 | Esc → 正常 | :w → 保存 | :q → 退出 | :wq → 保存退出\nu → 撤销 | Ctrl+r → 重做 | dd → 删行 | yy → 复制行 | p → 粘贴', tags: ['vim'], is_public: false },
  { title: 'Vim 搜索替换',      content: '/pattern        # 搜索\nn/N             # 下一个/上一个\n:%s/old/new/g   # 全局替换\n:%s/old/new/gc  # 带确认替换', tags: ['vim'], is_public: false },
  { title: 'Vim 窗口分割',      content: ':sp filename    # 水平分割\n:vsp filename   # 垂直分割\nCtrl+w h/j/k/l  # 窗口切换\nCtrl+w q        # 关闭窗口', tags: ['vim'], is_public: false },
  { title: 'Vim 宏录制',        content: 'qa              # 开始录制宏到寄存器 a\n...操作...\nq               # 停止录制\n@a              # 执行宏\n10@a            # 执行 10 次', tags: ['vim'], is_public: false },
  { title: 'Vim 寄存器',        content: ':reg            # 查看所有寄存器\n"ayy            # 复制到寄存器 a\n"ap             # 粘贴寄存器 a\n"+y / "+p       # 系统剪贴板', tags: ['vim'], is_public: false },
  { title: 'Vim 批量缩进',      content: '>> / <<         # 行缩进\n3>>             # 3 行缩进\nV 选中后 >       # 可视模式缩进\n==              # 自动格式化', tags: ['vim'], is_public: false },
  { title: 'Vim buffer 管理',   content: ':ls             # 列出所有 buffer\n:bnext / :bprev # 切换\n:bd             # 关闭 buffer\n:e filename     # 打开文件', tags: ['vim'], is_public: false },
  { title: 'Vim 快速跳转',      content: 'gg              # 文件首\nG               # 文件尾\n:42             # 到第 42 行\n%               # 匹配括号\nCtrl+o/i        # 前进/后退', tags: ['vim'], is_public: false },

  // ==================== Python ====================
  { title: 'Python 虚拟环境',    content: 'python -m venv .venv\nsource .venv/bin/activate   # Linux/macOS\n.venv\\Scripts\\activate      # Windows', tags: ['python'], is_public: false },
  { title: 'Python pip 管理',    content: 'pip install -r requirements.txt\npip freeze > requirements.txt\npip list --outdated          # 查看过期包', tags: ['python'], is_public: false },
  { title: 'Python f-string 格式化', content: 'name = "World"\nprint(f"Hello {name}!")    # Hello World!\nprint(f"{3.14159:.2f}")    # 3.14', tags: ['python'], is_public: false },
  { title: 'Python 列表推导式',  content: 'squares = [x**2 for x in range(10)]\nevens = [x for x in nums if x % 2 == 0]\nmatrix = [[i*j for j in range(3)] for i in range(4)]', tags: ['python'], is_public: false },
  { title: 'Python 装饰器',      content: 'def timer(func):\n    import time\n    def wrapper(*a, **kw):\n        t0 = time.time(); r = func(*a, **kw)\n        print(f"{func.__name__}: {time.time()-t0:.3f}s")\n        return r\n    return wrapper', tags: ['python'], is_public: false },
  { title: 'Python 生成器',      content: 'def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b', tags: ['python'], is_public: false },
  { title: 'Python argparse CLI', content: 'import argparse\np = argparse.ArgumentParser()\np.add_argument("-n", "--name", required=True)\nargs = p.parse_args()\nprint(args.name)', tags: ['python'], is_public: false },
  { title: 'Python async/await',  content: 'import asyncio\nasync def fetch(url):\n    async with aiohttp.ClientSession() as s:\n        async with s.get(url) as r:\n            return await r.json()', tags: ['python'], is_public: false },
  { title: 'Python dataclass',    content: 'from dataclasses import dataclass\n@dataclass\nclass Point:\n    x: float\n    y: float\n    def dist(self): return (self.x**2 + self.y**2)**0.5', tags: ['python'], is_public: false },
  { title: 'Python collections',  content: 'from collections import defaultdict, Counter, deque\nc = Counter(["a","b","a"]); # {\'a\':2, \'b\':1}\nd = deque(maxlen=5)         # 定长队列', tags: ['python'], is_public: false },

  // ==================== 其他 ====================
  { title: 'curl API 调试',      content: 'curl -X POST https://api.example.com/data \\\n  -H "Content-Type: application/json" \\\n  -d \'{"key": "value"}\' \\\n  -v', tags: ['其他'], is_public: false },
  { title: 'jq JSON 处理',      content: 'cat data.json | jq \'.items[] | {name: .name, price: .price}\'\n# 过滤: jq \'.[] | select(.status=="active")\'\n# 统计: jq \'group_by(.type) | map({type: .[0].type, count: length})\'', tags: ['其他'], is_public: false },
  { title: 'tmux 终端复用',     content: 'tmux new -s mysession       # 新建会话\ntmux attach -t mysession     # 重新接入\ntmux ls                      # 列出所有会话\nCtrl+b % → 左右分屏\nCtrl+b " → 上下分屏', tags: ['其他'], is_public: false },
  { title: 'netstat/ss 网络检查', content: 'ss -tlnp                      # 监听端口\nss -s                         # 统计\nnetstat -i                    # 网卡流量', tags: ['其他'], is_public: false },
  { title: 'tcpdump 抓包',      content: 'tcpdump -i eth0 port 80 -w capture.pcap\n# 查看: tcpdump -r capture.pcap -A\n# 过滤: tcpdump -i any \'host 10.0.0.1 and port 443\'', tags: ['其他'], is_public: false },
  { title: 'ffmpeg 视频处理',   content: 'ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4\n# 截取: -ss 00:01:00 -t 30\n# 转 GIF: -vf "fps=10,scale=480:-1" output.gif', tags: ['其他'], is_public: false },
  { title: 'nc (netcat) 端口测试', content: 'nc -zv host 22                 # 端口连通性\nnc -l -p 8080                 # 临时监听\n# 文件传输: nc -l -p 8080 > file (接收端)\n# nc host 8080 < file (发送端)', tags: ['其他'], is_public: false },
  { title: 'NGINX 反向代理配置', content: `server {\n  listen 80;\n  server_name example.com;\n  location / {\n    proxy_pass http://localhost:3000;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n}`, tags: ['其他'], is_public: false },
  { title: 'systemd timer 替代 cron', content: `# /etc/systemd/system/mytask.timer\n[Timer]\nOnCalendar=*-*-* 03:00:00\nPersistent=true\n[Install]\nWantedBy=timers.target`, tags: ['其他'], is_public: false },
  { title: '常用环境变量设置',    content: 'export PATH="$HOME/bin:$PATH"\nexport EDITOR=vim\nexport LANG=en_US.UTF-8\n# 写入 ~/.bashrc 或 ~/.zshrc 永久生效', tags: ['其他'], is_public: false },
]

/** 按标签统计 */
export function getSeedCountByTag(): Record<string, number> {
  const count: Record<string, number> = {}
  SEED_COMMANDS.forEach((cmd) => {
    cmd.tags.forEach((tag) => {
      count[tag] = (count[tag] || 0) + 1
    })
  })
  return count
}

/** 获取所有种子命令的标签 */
export const SEED_TAGS = ['ssh', 'docker', 'linux', 'git', 'vim', 'python', '其他'] as const

/** 按标签获取种子命令 */
export function getSeedCommandsByTag(tag: string): SeedCommand[] {
  return SEED_COMMANDS.filter((cmd) => cmd.tags.includes(tag))
}
