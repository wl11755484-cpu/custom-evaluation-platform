# 自定义评估平台部署指南

## 概述

本指南将帮助您完成自定义评估平台的完整部署，包括 Vercel 部署、Supabase 数据库配置和环境变量设置。

## 前提条件

- [x] GitHub 账户
- [x] Vercel 账户
- [ ] Supabase 账户
- [x] 项目代码已推送到 GitHub

## 部署步骤

### 1. Supabase 数据库设置

#### 1.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New Project"
3. 选择组织并填写项目信息：
   - **Name**: `custom-evaluation-platform`
   - **Database Password**: 设置一个强密码（请记住此密码）
   - **Region**: 选择离您最近的区域
4. 点击 "Create new project"
5. 等待项目创建完成（通常需要 2-3 分钟）

#### 1.2 执行数据库架构

1. 在 Supabase 项目仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `database/schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL 脚本
6. 确认所有表都已成功创建

#### 1.3 配置行级安全 (RLS)

1. 在 Supabase 仪表板中，点击 "Authentication" > "Policies"
2. 为每个表启用 RLS（如果尚未启用）
3. 创建基本的访问策略（详见 `database/README.md`）

#### 1.4 获取 API 密钥

1. 在 Supabase 项目仪表板中，点击左侧的 "Settings" > "API"
2. 复制以下信息：
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Vercel 环境变量配置

#### 2.1 访问 Vercel 项目设置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的 `custom-evaluation-platform` 项目
3. 点击项目名称进入项目详情
4. 点击 "Settings" 标签
5. 在左侧菜单中选择 "Environment Variables"

#### 2.2 添加环境变量

添加以下环境变量：

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | 您的 Supabase Project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 您的 Supabase anon key | Production, Preview, Development |

**重要提示**：
- 确保为所有环境（Production, Preview, Development）都添加这些变量
- 不要在变量值前后添加引号
- 保存后需要重新部署项目以使变量生效

#### 2.3 触发重新部署

1. 在 Vercel 项目页面，点击 "Deployments" 标签
2. 点击最新部署右侧的三个点菜单
3. 选择 "Redeploy"
4. 确认重新部署

### 3. 本地开发环境配置

#### 3.1 更新本地环境变量

1. 打开项目根目录下的 `.env.local` 文件
2. 将 Supabase 配置信息替换为实际值：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
```

#### 3.2 测试数据库连接

1. 在项目根目录运行测试脚本：

```bash
node test-db-connection.js
```

2. 如果连接成功，您应该看到类似以下的输出：

```
✅ Supabase 连接测试成功
✅ 环境变量配置正确
✅ 所有数据库表都存在
✅ 任务操作测试通过
```

#### 3.3 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 测试应用功能。

## 验证部署

### 功能测试清单

- [ ] 访问生产环境 URL（Vercel 提供的域名）
- [ ] 测试数据上传功能
- [ ] 创建新的标注任务
- [ ] 执行数据标注
- [ ] 导出标注结果
- [ ] 检查数据是否正确保存到 Supabase

### 常见问题排查

#### 1. "Failed to fetch" 错误

**原因**：通常是环境变量配置错误或 Supabase 项目未正确设置。

**解决方案**：
1. 检查 Vercel 环境变量是否正确设置
2. 确认 Supabase 项目 URL 和 API 密钥正确
3. 检查 Supabase 项目是否处于活跃状态

#### 2. 数据库连接失败

**原因**：数据库架构未正确执行或 RLS 策略配置问题。

**解决方案**：
1. 重新执行 `database/schema.sql`
2. 检查 Supabase 表是否正确创建
3. 验证 RLS 策略配置

#### 3. 部署后页面空白

**原因**：JavaScript 错误或环境变量未生效。

**解决方案**：
1. 检查浏览器开发者工具的控制台错误
2. 确认环境变量已添加到所有环境
3. 触发 Vercel 重新部署

## 后续维护

### 数据库备份

建议定期备份 Supabase 数据库：

1. 在 Supabase 仪表板中，访问 "Settings" > "Database"
2. 使用 "Backup" 功能创建数据库快照
3. 或使用 `pg_dump` 命令行工具

### 监控和日志

- **Vercel**: 在项目仪表板查看部署日志和性能指标
- **Supabase**: 在项目仪表板查看数据库使用情况和 API 调用统计

### 扩展功能

项目架构支持以下扩展：

- 用户认证和权限管理
- 实时协作标注
- 高级数据分析和可视化
- API 集成和自动化工作流

## 支持

如果在部署过程中遇到问题，请：

1. 查看本文档的常见问题排查部分
2. 检查 `database/README.md` 中的详细数据库配置说明
3. 运行 `test-db-connection.js` 进行诊断
4. 查看 Vercel 和 Supabase 的官方文档

---

**部署完成后，您的自定义评估平台就可以投入使用了！** 🎉