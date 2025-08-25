import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import AnnotationWorkspace from '../components/AnnotationWorkspace';
import DataTable from '../components/DataTable';

const AnnotationDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getTask, getTaskStats, exportTaskData } = useTaskContext();
  const [task, setTask] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedDataId, setSelectedDataId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      const taskData = getTask(taskId);
      if (taskData) {
        setTask(taskData);
        setStats(getTaskStats(taskId));
        // 默认选择第一条数据
        if (taskData.data && taskData.data.length > 0) {
          setSelectedDataId(taskData.data[0].id);
        }
      } else {
        navigate('/tasks');
      }
      setLoading(false);
    }
  }, [taskId, getTask, getTaskStats, navigate]);

  // 监听任务数据变化，更新统计信息
  useEffect(() => {
    if (taskId) {
      const interval = setInterval(() => {
        const updatedTask = getTask(taskId);
        const updatedStats = getTaskStats(taskId);
        setTask(updatedTask);
        setStats(updatedStats);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [taskId, getTask, getTaskStats]);

  const handleDataSelect = (dataId) => {
    setSelectedDataId(dataId);
  };

  const handleExport = () => {
    try {
      const exportData = exportTaskData(taskId, 'json');
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task.name}-标注结果.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">任务不存在</p>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回任务列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{task.name}</h1>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 统计信息 */}
              {stats && (
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">进度: {stats.progress}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">合格: {stats.qualified}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">不合格: {stats.unqualified}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>导出结果</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 数据列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">数据列表</h2>
                <p className="text-sm text-gray-500 mt-1">
                  共 {task.data?.length || 0} 条数据
                </p>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <DataTable
                  data={task.data}
                  onRowClick={handleDataSelect}
                  selectedRowId={selectedDataId}
                  showAnnotations={true}
                />
              </div>
            </div>
          </div>

          {/* 标注工作区 */}
          <div className="lg:col-span-2">
            <AnnotationWorkspace
              taskId={taskId}
              selectedDataId={selectedDataId}
              onDataChange={setSelectedDataId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationDetailPage;