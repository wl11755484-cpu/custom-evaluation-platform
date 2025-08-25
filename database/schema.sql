-- 自定义评估平台数据库表结构
-- 创建时间: 2024年
-- 描述: 用于存储任务、数据记录和标注历史的数据库表

-- 1. 任务表 (tasks)
-- 存储评估任务的基本信息
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL, -- 'classification', 'regression', 'text_analysis', etc.
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    config JSONB, -- 任务配置信息（如标注规则、选项等）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255), -- 创建者标识
    total_records INTEGER DEFAULT 0, -- 总记录数
    completed_records INTEGER DEFAULT 0, -- 已完成标注的记录数
    progress DECIMAL(5,2) DEFAULT 0.00 -- 完成进度百分比
);

-- 2. 数据记录表 (data_records)
-- 存储需要标注的原始数据
CREATE TABLE IF NOT EXISTS data_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    original_data JSONB NOT NULL, -- 原始数据（文本、图片URL、音频URL等）
    data_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'audio', 'video', 'json'
    annotation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
    annotation_data JSONB, -- 标注结果数据
    annotator VARCHAR(255), -- 标注者标识
    annotation_time TIMESTAMP WITH TIME ZONE, -- 标注完成时间
    quality_score DECIMAL(3,2), -- 标注质量评分 (0.00-1.00)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- 额外的元数据信息
);

-- 3. 标注历史表 (annotation_history)
-- 记录标注的历史变更，支持版本控制和审计
CREATE TABLE IF NOT EXISTS annotation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID NOT NULL REFERENCES data_records(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    annotation_data JSONB NOT NULL, -- 历史标注数据
    annotator VARCHAR(255) NOT NULL, -- 标注者标识
    action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete', 'review'
    version INTEGER NOT NULL DEFAULT 1, -- 版本号
    notes TEXT, -- 标注说明或备注
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quality_score DECIMAL(3,2) -- 该版本的质量评分
);

-- 4. 用户会话表 (user_sessions) - 可选
-- 用于跟踪用户标注会话（如果需要用户管理）
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_identifier VARCHAR(255), -- 用户标识（可以是邮箱、用户名等）
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB -- 会话相关的元数据
);

-- 创建索引以提高查询性能

-- 任务表索引
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- 数据记录表索引
CREATE INDEX IF NOT EXISTS idx_data_records_task_id ON data_records(task_id);
CREATE INDEX IF NOT EXISTS idx_data_records_status ON data_records(annotation_status);
CREATE INDEX IF NOT EXISTS idx_data_records_annotator ON data_records(annotator);
CREATE INDEX IF NOT EXISTS idx_data_records_created_at ON data_records(created_at);

-- 标注历史表索引
CREATE INDEX IF NOT EXISTS idx_annotation_history_record_id ON annotation_history(record_id);
CREATE INDEX IF NOT EXISTS idx_annotation_history_task_id ON annotation_history(task_id);
CREATE INDEX IF NOT EXISTS idx_annotation_history_annotator ON annotation_history(annotator);
CREATE INDEX IF NOT EXISTS idx_annotation_history_created_at ON annotation_history(created_at);

-- 用户会话表索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_task_id ON user_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- 创建触发器以自动更新 updated_at 字段

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_records_updated_at BEFORE UPDATE ON data_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建视图以便于查询

-- 任务进度视图
CREATE OR REPLACE VIEW task_progress_view AS
SELECT 
    t.id,
    t.name,
    t.description,
    t.task_type,
    t.status,
    t.created_at,
    t.updated_at,
    COUNT(dr.id) as total_records,
    COUNT(CASE WHEN dr.annotation_status = 'completed' THEN 1 END) as completed_records,
    CASE 
        WHEN COUNT(dr.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN dr.annotation_status = 'completed' THEN 1 END)::DECIMAL / COUNT(dr.id)) * 100, 2)
        ELSE 0
    END as progress_percentage
FROM tasks t
LEFT JOIN data_records dr ON t.id = dr.task_id
GROUP BY t.id, t.name, t.description, t.task_type, t.status, t.created_at, t.updated_at;

-- 标注统计视图
CREATE OR REPLACE VIEW annotation_stats_view AS
SELECT 
    dr.task_id,
    dr.annotator,
    COUNT(*) as total_annotations,
    COUNT(CASE WHEN dr.annotation_status = 'completed' THEN 1 END) as completed_annotations,
    AVG(dr.quality_score) as avg_quality_score,
    MIN(dr.created_at) as first_annotation,
    MAX(dr.updated_at) as last_annotation
FROM data_records dr
WHERE dr.annotator IS NOT NULL
GROUP BY dr.task_id, dr.annotator;

-- 插入示例数据（可选，用于测试）
/*
-- 示例任务
INSERT INTO tasks (name, description, task_type, config) VALUES 
('文本情感分析', '对产品评论进行情感分析标注', 'classification', 
 '{"labels": ["positive", "negative", "neutral"], "instructions": "请根据文本内容判断情感倾向"}');

-- 示例数据记录
INSERT INTO data_records (task_id, original_data, data_type) 
SELECT 
    t.id,
    '{"text": "这个产品质量很好，我很满意！"}',
    'text'
FROM tasks t WHERE t.name = '文本情感分析';
*/

-- 数据库表结构创建完成
-- 请在 Supabase Dashboard 中执行此 SQL 脚本来创建表结构