# SPA 路由问题解决方案

## 问题描述

在 Vercel 部署的单页应用 (SPA) 中，直接访问子路由或刷新页面时出现 404 错误，这是因为服务器没有正确配置路由重写规则。

## 解决方案

### 1. 更新 Vercel 配置

我们已经更新了 `vercel.json` 文件中的重写规则：

```json
{
  "rewrites": [
    {
      "source": "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
      "destination": "/index.html"
    }
  ]
}
```

**说明：**
- 使用负向前瞻正则表达式排除静态资源
- 确保所有非静态资源的路由都指向 `index.html`
- 让 React Router 处理客户端路由

### 2. 部署状态检查

配置更新后，Vercel 会自动触发重新部署。你可以：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 查看部署状态和日志
3. 等待部署完成（通常需要 1-3 分钟）

### 3. 测试路由功能

部署完成后，测试以下场景：

- ✅ 直接访问根路径：`https://your-app.vercel.app/`
- ✅ 直接访问子路由：`https://your-app.vercel.app/annotation/123`
- ✅ 在应用内导航
- ✅ 刷新页面

## 常见问题排查

### 问题 1：仍然出现 404 错误

**可能原因：**
- 部署尚未完成
- 浏览器缓存
- 配置未生效

**解决方法：**
```bash
# 1. 强制刷新浏览器缓存
Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)

# 2. 检查部署状态
# 访问 Vercel Dashboard 确认部署完成

# 3. 清除浏览器缓存
# 开发者工具 > Application > Storage > Clear site data
```

### 问题 2：静态资源加载失败

**检查方法：**
```bash
# 打开浏览器开发者工具
# Network 标签页查看失败的请求
# 确保 CSS/JS 文件正常加载
```

**解决方法：**
- 确保 `assets` 目录在重写规则中被排除
- 检查构建输出目录配置

### 问题 3：API 请求被重定向

如果你的应用有 API 路由，确保在重写规则中排除：

```json
{
  "source": "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  "destination": "/index.html"
}
```

## 替代解决方案

### 方案 1：使用 HashRouter

如果重写规则仍有问题，可以临时使用 HashRouter：

```jsx
// src/App.jsx
import { HashRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      {/* 路由配置 */}
    </Router>
  );
}
```

**优缺点：**
- ✅ 无需服务器配置
- ❌ URL 包含 # 符号
- ❌ SEO 不友好

### 方案 2：添加 _redirects 文件

在 `public` 目录创建 `_redirects` 文件：

```
/*    /index.html   200
```

### 方案 3：使用 404.html

在 `public` 目录创建 `404.html`，内容与 `index.html` 相同。

## 验证步骤

1. **等待部署完成**
   - 检查 Vercel Dashboard
   - 确认最新提交已部署

2. **清除缓存**
   ```bash
   # 硬刷新
   Ctrl+F5 或 Cmd+Shift+R
   ```

3. **测试路由**
   - 直接访问子路由 URL
   - 在页面间导航
   - 刷新页面

4. **检查控制台**
   - 确保无 JavaScript 错误
   - 确认路由正常工作

## 监控和维护

### 性能监控

```bash
# 使用 Lighthouse 检查性能
# Chrome DevTools > Lighthouse > Generate report
```

### 错误监控

考虑集成错误监控服务：
- Sentry
- LogRocket
- Bugsnag

## 相关文档

- [Vercel SPA 配置文档](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [React Router 文档](https://reactrouter.com/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

---

**注意：** 如果问题持续存在，请检查浏览器开发者工具的 Network 和 Console 标签页，获取更详细的错误信息。