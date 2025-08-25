# 获取公网 URL 部署指南

本指南提供多种方式来获取您项目的可分享公网 URL。

## 方案一：Vercel 部署（推荐）

### 1. 通过 Vercel 网站部署

**步骤：**
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择您的 GitHub 仓库：`wl11755484-cpu/custom-evaluation-platform`
5. Vercel 会自动检测到这是一个 Vite 项目
6. 配置环境变量（重要）：
   - `VITE_SUPABASE_URL`: 您的 Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥
7. 点击 "Deploy"

**部署后您将获得：**
- 生产环境 URL：`https://your-project-name.vercel.app`
- 预览 URL：每次 Git 推送都会生成新的预览 URL

### 2. 通过 Vercel CLI 部署

```bash
# 登录 Vercel（会打开浏览器进行授权）
npx vercel login

# 部署到生产环境
npx vercel --prod

# 查看部署状态
npx vercel ls
```

## 方案二：GitHub Pages 部署

### 1. 配置 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 2. 配置 GitHub Pages

1. 进入 GitHub 仓库设置
2. 找到 "Pages" 选项
3. Source 选择 "GitHub Actions"
4. 在 "Secrets and variables" → "Actions" 中添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**部署后 URL：**
`https://wl11755484-cpu.github.io/custom-evaluation-platform/`

## 方案三：Netlify 部署

### 1. 通过 Netlify 网站

1. 访问 [netlify.com](https://netlify.com)
2. 使用 GitHub 账号登录
3. 点击 "New site from Git"
4. 选择您的 GitHub 仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 添加环境变量
7. 点击 "Deploy site"

**部署后 URL：**
`https://random-name-123456.netlify.app`（可自定义域名）

## 方案四：其他免费托管服务

### 1. Railway
- 网址：[railway.app](https://railway.app)
- 支持 GitHub 集成
- 免费额度充足

### 2. Render
- 网址：[render.com](https://render.com)
- 静态网站免费托管
- 自动 SSL 证书

### 3. Surge.sh
- 网址：[surge.sh](https://surge.sh)
- 命令行部署
- 免费自定义域名

```bash
# 安装 Surge CLI
npm install -g surge

# 构建项目
npm run build

# 部署
cd dist
surge
```

## 推荐方案对比

| 服务 | 优点 | 缺点 | URL 格式 |
|------|------|------|----------|
| **Vercel** | 最佳性能、自动优化、简单配置 | 免费版有带宽限制 | `project.vercel.app` |
| **GitHub Pages** | 完全免费、与 GitHub 集成 | 仅支持静态网站 | `username.github.io/repo` |
| **Netlify** | 功能丰富、表单处理 | 构建时间限制 | `random-name.netlify.app` |

## 快速开始（推荐 Vercel）

1. **立即部署到 Vercel：**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wl11755484-cpu/custom-evaluation-platform)

2. **配置环境变量：**
   - 在 Vercel Dashboard 中添加 Supabase 配置
   - 重新部署项目

3. **获取 URL：**
   - 部署完成后，Vercel 会提供公网 URL
   - 可以在 Vercel Dashboard 中查看和管理

## 注意事项

⚠️ **重要提醒：**
- 部署前确保已配置正确的环境变量
- Supabase 数据库需要先完成设置
- 建议先在本地测试完整功能后再部署
- 部署后需要在 Supabase 中配置正确的域名白名单

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖已正确安装
   - 查看构建日志中的错误信息

2. **环境变量未生效**
   - 确认变量名以 `VITE_` 开头
   - 重新部署项目
   - 检查变量值是否正确

3. **数据库连接失败**
   - 验证 Supabase URL 和密钥
   - 检查 Supabase 项目状态
   - 确认域名已添加到 Supabase 白名单

## 下一步

部署完成后，您可以：
- 分享公网 URL 给其他用户
- 配置自定义域名
- 设置 SSL 证书（大多数服务自动提供）
- 监控网站性能和访问统计

---

如需帮助，请查看各平台的官方文档或联系技术支持。