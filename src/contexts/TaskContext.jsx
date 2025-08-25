import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

// LocalStorage 键名
const STORAGE_KEY = 'llm-eval-tasks';
const FIELD_MAPPING_STORAGE_KEY = 'llm-eval-field-mappings';

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 任务状态枚举
export const TASK_STATUS = {
  PENDING_UPLOAD: '待上传',
  ANNOTATING: '标注中',
  COMPLETED: '已完成'
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldMappings, setFieldMappings] = useState({});

  // 从 LocalStorage 加载任务和字段映射
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      
      const storedMappings = localStorage.getItem(FIELD_MAPPING_STORAGE_KEY);
      if (storedMappings) {
        setFieldMappings(JSON.parse(storedMappings));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存任务到 LocalStorage
  const saveTasks = (newTasks) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('保存任务失败:', error);
      throw error;
    }
  };

  // 保存字段映射到 LocalStorage
  const saveFieldMappingsToStorage = (mappings) => {
    try {
      localStorage.setItem(FIELD_MAPPING_STORAGE_KEY, JSON.stringify(mappings));
      setFieldMappings(mappings);
    } catch (error) {
      console.error('保存字段映射失败:', error);
      throw error;
    }
  };

  // 添加任务
  const addTask = (taskData) => {
    const newTask = {
      taskId: generateId(),
      ...taskData,
      status: TASK_STATUS.PENDING_UPLOAD,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: []
    };
    
    const newTasks = [...tasks, newTask];
    saveTasks(newTasks);
    return newTask.taskId;
  };

  // 获取任务
  const getTask = (taskId) => {
    return tasks.find(task => task.taskId === taskId);
  };

  // 更新任务
  const updateTask = (taskId, updates) => {
    const newTasks = tasks.map(task => 
      task.taskId === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    saveTasks(newTasks);
  };

  // 删除任务
  const deleteTask = (taskId) => {
    const newTasks = tasks.filter(task => task.taskId !== taskId);
    saveTasks(newTasks);
  };

  // 上传任务数据
  const uploadTaskData = (taskId, data) => {
    const task = getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    // 为每条数据添加唯一ID
    const dataWithIds = data.map((item, index) => ({
      ...item,
      id: `${taskId}-${index}`,
      annotation: null,
      remark: ''
    }));

    updateTask(taskId, {
      data: dataWithIds,
      status: TASK_STATUS.ANNOTATING
    });
  };

  // 更新标注
  const updateAnnotation = (taskId, dataId, annotationData) => {
    const task = getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    const updatedData = task.data.map(item => 
      item.id === dataId 
        ? { ...item, ...annotationData }
        : item
    );

    // 检查是否所有数据都已标注
    const allAnnotated = updatedData.every(item => item.annotation !== null);
    const newStatus = allAnnotated ? TASK_STATUS.COMPLETED : TASK_STATUS.ANNOTATING;

    updateTask(taskId, {
      data: updatedData,
      status: newStatus
    });
  };

  // 获取任务统计信息
  const getTaskStats = (taskId) => {
    const task = getTask(taskId);
    if (!task || !task.data) {
      return {
        total: 0,
        annotated: 0,
        qualified: 0,
        unqualified: 0,
        progress: 0
      };
    }

    const total = task.data.length;
    const annotated = task.data.filter(item => item.annotation !== null).length;
    const qualified = task.data.filter(item => item.annotation === 'qualified').length;
    const unqualified = task.data.filter(item => item.annotation === 'unqualified').length;
    const progress = total > 0 ? Math.round((annotated / total) * 100) : 0;

    return {
      total,
      annotated,
      qualified,
      unqualified,
      progress
    };
  };

  // 导出任务数据
  const exportTaskData = (taskId, format = 'json') => {
    const task = getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    const exportData = {
      task: {
        taskId: task.taskId,
        name: task.name,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      },
      data: task.data,
      stats: getTaskStats(taskId)
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  };

  // 字段映射相关方法
  const saveFieldMapping = (name, mapping) => {
    const newMappings = {
      ...fieldMappings,
      [name]: {
        ...mapping,
        createdAt: new Date().toISOString()
      }
    };
    saveFieldMappingsToStorage(newMappings);
  };

  const getFieldMapping = (name) => {
    return fieldMappings[name];
  };

  const getAllFieldMappings = () => {
    return Object.keys(fieldMappings).map(name => ({
      name,
      ...fieldMappings[name]
    }));
  };

  const deleteFieldMapping = (name) => {
    const newMappings = { ...fieldMappings };
    delete newMappings[name];
    saveFieldMappingsToStorage(newMappings);
  };

  const value = {
    tasks,
    loading,
    addTask,
    getTask,
    updateTask,
    deleteTask,
    uploadTaskData,
    updateAnnotation,
    getTaskStats,
    exportTaskData,
    saveFieldMapping,
    getFieldMapping,
    getAllFieldMappings,
    deleteFieldMapping
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const useTaskContext = useTask;
export default TaskContext;