import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 任务相关的数据库操作
export const taskOperations = {
  // 创建新任务
  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 获取所有任务
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 获取单个任务
  async getTask(taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()
    
    if (error) throw error
    return data
  },

  // 更新任务状态
  async updateTaskStatus(taskId, status) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 删除任务
  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
  }
}

// 数据记录相关的数据库操作
export const dataRecordOperations = {
  // 创建数据记录
  async createDataRecord(recordData) {
    const { data, error } = await supabase
      .from('data_records')
      .insert(recordData)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 获取任务的所有数据记录
  async getDataRecords(taskId) {
    const { data, error } = await supabase
      .from('data_records')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // 获取单个数据记录
  async getDataRecord(recordId) {
    const { data, error } = await supabase
      .from('data_records')
      .select('*')
      .eq('id', recordId)
      .single()
    
    if (error) throw error
    return data
  },

  // 更新数据记录的标注状态
  async updateAnnotationStatus(recordId, status, annotationData = null) {
    const updateData = {
      annotation_status: status,
      updated_at: new Date().toISOString()
    }
    
    if (annotationData) {
      updateData.annotation_data = annotationData
    }
    
    const { data, error } = await supabase
      .from('data_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// 标注历史相关的数据库操作
export const annotationHistoryOperations = {
  // 创建标注历史记录
  async createAnnotationHistory(historyData) {
    const { data, error } = await supabase
      .from('annotation_history')
      .insert(historyData)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 获取数据记录的标注历史
  async getAnnotationHistory(recordId) {
    const { data, error } = await supabase
      .from('annotation_history')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// 导出默认客户端
export default supabase