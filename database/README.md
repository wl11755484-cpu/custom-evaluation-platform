# 数据库设置指南

本文档说明如何设置和配置 Supabase 数据库。

## 📋 前提条件

1. 已通过 Vercel Storage 创建了 Supabase 项目
2. 已获取 Supabase 项目的 URL 和 API 密钥
3. 已配置环境变量

## 🗄️ 数据库表结构

### 核心表

1. **tasks** - 任务表
   - 存储评估任务的基本信息
   - 包含任务类型、状态、配置等

2. **data_records** - 数据记录表
   - 存储需要标注的原始数据
   - 支持文本、图片、音频等多种数据类型

3. **annotation_history** - 标注历史表
   - 记录标注的历史变更
   - 支持版本控制和审计

4. **user_sessions** - 用户会话表（可选）
   - 跟踪用户标注会话

### 视图

- **task_progress_view** - 任务进度视图
- **annotation_stats_view** - 标注统计视图

## 🚀 设置步骤

### 步骤 1: 访问 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择通过 Vercel 创建的项目

### 步骤 2: 执行 SQL 脚本

1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query" 创建新查询
3. 复制 `schema.sql` 文件的全部内容
4. 粘贴到查询编辑器中
5. 点击 "Run" 执行脚本

### 步骤 3: 验证表创建

1. 点击左侧菜单的 "Table Editor"
2. 确认以下表已创建：
   - `tasks`
   - `data_records`
   - `annotation_history`
   - `user_sessions`

### 步骤 4: 配置行级安全 (RLS)

为了数据安全，建议启用行级安全：

```sql
-- 启用 RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略（允许所有操作，可根据需要调整）
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON data_records FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON annotation_history FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON user_sessions FOR ALL USING (true);
```

### 步骤 5: 更新环境变量

确保 `.env.local` 文件中的环境变量已正确配置：

```env
VITE_SUPABASE_URL=你的_supabase_项目_url
VITE_SUPABASE_ANON_KEY=你的_supabase_匿名_密钥
```

## 🧪 测试数据库连接

创建一个测试文件来验证数据库连接：

```javascript
// test-db-connection.js
import { supabase } from './src/lib/supabase.js'

async function testConnection() {
  try {
    // 测试连接
    const { data, error } = await supabase
      .from('tasks')
      .select('count', { count: 'exact' })
    
    if (error) {
      console.error('数据库连接失败:', error)
    } else {
      console.log('数据库连接成功！当前任务数量:', data)
    }
  } catch (err) {
    console.error('连接测试出错:', err)
  }
}

testConnection()
```

## 📊 示例数据

如需插入测试数据，可以在 SQL Editor 中执行：

```sql
-- 插入示例任务
INSERT INTO tasks (name, description, task_type, config) VALUES 
('文本情感分析', '对产品评论进行情感分析标注', 'classification', 
 '{"labels": ["positive", "negative", "neutral"], "instructions": "请根据文本内容判断情感倾向"}');

-- 插入示例数据记录
INSERT INTO data_records (task_id, original_data, data_type) 
SELECT 
    t.id,
    '{"text": "这个产品质量很好，我很满意！"}',
    'text'
FROM tasks t WHERE t.name = '文本情感分析';
```

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 检查环境变量是否正确
   - 确认 Supabase 项目状态正常

2. **表创建失败**
   - 检查 SQL 语法
   - 确认有足够的权限

3. **RLS 策略问题**
   - 检查策略配置
   - 确认用户权限

### 获取帮助

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase 社区](https://github.com/supabase/supabase/discussions)

## 📝 注意事项

1. 生产环境中请根据实际需求调整 RLS 策略
2. 定期备份数据库
3. 监控数据库性能和使用情况
4. 根据业务需求调整表结构和索引