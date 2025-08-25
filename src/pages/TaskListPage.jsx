import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Play, Trash2, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import CreateTaskModal from '../components/CreateTaskModal';

const TaskListPage = () => {
  const navigate = useNavigate();
  const { tasks, deleteTask, getTaskStats, exportTaskData } = useTaskContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // 过滤和搜索任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // 排序任务
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleTaskCreated = (taskId) => {
    // 跳转到任务上传页面
    navigate(`/tasks/${taskId}`);
  };

  const handleTaskClick = (task) => {
    if (task.status === '待上传') {
      navigate(`/tasks/${task.taskId}`);
    } else {
      navigate(`/tasks/${task.taskId}/annotation`);
    }
  };

  const handleDeleteTask = (taskId, taskName) => {
    if (window.confirm(`确定要删除任务 "${taskName}" 吗？此操作不可撤销。`)) {
      deleteTask(taskId);
    }
  };

  const handleExportTask = (taskId, taskName) => {
    try {
      const exportData = exportTaskData(taskId, 'json');
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${taskName}-标注结果.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '待上传':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case '标注中':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case '已完成':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '待上传':
        return 'bg-yellow-100 text-yellow-800';
      case '标注中':
        return 'bg-blue-100 text-blue-800';
      case '已完成':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
              <p className="text-sm text-gray-500">管理您的标注任务</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>创建任务</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 工具栏 */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* 搜索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 过滤器和排序 */}
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="待上传">待上传</option>
                <option value="标注中">标注中</option>
                <option value="已完成">已完成</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="updatedAt-desc">最近更新</option>
                <option value="createdAt-desc">创建时间（新到旧）</option>
                <option value="createdAt-asc">创建时间（旧到新）</option>
                <option value="name-asc">名称（A-Z）</option>
                <option value="name-desc">名称（Z-A）</option>
              </select>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        {sortedTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? '没有找到匹配的任务' : '还没有任务'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? '尝试调整搜索条件或过滤器' 
                : '创建您的第一个标注任务开始使用'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建任务
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => {
              const stats = getTaskStats(task.taskId);
              return (
                <div
                  key={task.taskId}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="p-6">
                    {/* 任务头部 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {task.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {task.description}
                        </p>
                      </div>
                      
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === task.taskId ? null : task.taskId);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {activeDropdown === task.taskId && (
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Play className="w-4 h-4" />
                              <span>{task.status === '待上传' ? '上传数据' : '继续标注'}</span>
                            </button>
                            
                            {task.status !== '待上传' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportTask(task.taskId, task.name);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Download className="w-4 h-4" />
                                <span>导出结果</span>
                              </button>
                            )}
                            
                            <hr className="my-1" />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.taskId, task.name);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>删除任务</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 状态和统计 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        
                        {stats.total > 0 && (
                          <div className="text-sm text-gray-500">
                            {stats.annotated}/{stats.total} 已标注
                          </div>
                        )}
                      </div>

                      {/* 进度条 */}
                      {stats.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>进度</span>
                            <span>{stats.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stats.progress}%` }}
                            ></div>
                          </div>
                          
                          {stats.annotated > 0 && (
                            <div className="flex justify-between text-xs text-gray-500">
                              <span className="text-green-600">合格: {stats.qualified}</span>
                              <span className="text-red-600">不合格: {stats.unqualified}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 时间信息 */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>创建: {formatDate(task.createdAt)}</span>
                        <span>更新: {formatDate(task.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 创建任务模态框 */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default TaskListPage;