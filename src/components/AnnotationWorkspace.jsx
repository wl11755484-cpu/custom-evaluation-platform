import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, RotateCcw, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

const AnnotationWorkspace = ({ taskId, selectedDataId, onDataChange }) => {
  const { tasks, updateAnnotation } = useTaskContext();
  const [currentData, setCurrentData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotation, setAnnotation] = useState(null);
  const [remark, setRemark] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const task = tasks.find(t => t.id === taskId);
  const taskData = task?.data || [];

  // 找到当前数据项和索引
  useEffect(() => {
    if (selectedDataId && taskData.length > 0) {
      const index = taskData.findIndex(item => item.id === selectedDataId);
      if (index !== -1) {
        setCurrentIndex(index);
        const data = taskData[index];
        setCurrentData(data);
        setAnnotation(data.annotation);
        setRemark(data.remark || '');
        setHasChanges(false);
      }
    }
  }, [selectedDataId, taskData]);

  // 监听标注内容变化
  useEffect(() => {
    if (currentData) {
      const hasAnnotationChange = annotation !== currentData.annotation;
      const hasRemarkChange = remark !== (currentData.remark || '');
      setHasChanges(hasAnnotationChange || hasRemarkChange);
    }
  }, [annotation, remark, currentData]);

  const navigateToData = (direction) => {
    if (taskData.length === 0) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : taskData.length - 1;
    } else {
      newIndex = currentIndex < taskData.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newData = taskData[newIndex];
    if (newData && onDataChange) {
      onDataChange(newData.id);
    }
  };

  const handleSave = async () => {
    if (!currentData || !hasChanges) return;
    
    setIsLoading(true);
    try {
      await updateAnnotation(taskId, currentData.id, {
        annotation,
        remark: remark.trim()
      });
      setHasChanges(false);
    } catch (error) {
      console.error('保存标注失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (currentData) {
      setAnnotation(currentData.annotation);
      setRemark(currentData.remark || '');
      setHasChanges(false);
    }
  };

  const handleAnnotationChange = (value) => {
    setAnnotation(value);
  };

  const handleRemarkChange = (e) => {
    setRemark(e.target.value);
  };

  if (!currentData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>请选择一条数据开始标注</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateToData('prev')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一条</span>
          </button>
          
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {taskData.length}
          </span>
          
          <button
            onClick={() => navigateToData('next')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>下一条</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置</span>
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? '保存中...' : '保存'}</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 数据ID */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">数据ID</h3>
            <p className="text-gray-900 font-mono">{currentData.id}</p>
          </div>

          {/* 输入内容 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">输入内容</h3>
            <div className="text-gray-900 whitespace-pre-wrap break-words">
              {currentData.input}
            </div>
          </div>

          {/* 输出内容 */}
          {currentData.output && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">输出内容</h3>
              <div className="text-gray-900 whitespace-pre-wrap break-words">
                {currentData.output}
              </div>
            </div>
          )}

          {/* 标注区域 */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">标注</h3>
            
            {/* 标注选项 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">质量评估</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAnnotationChange('qualified')}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      annotation === 'qualified'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>合格</span>
                  </button>
                  
                  <button
                    onClick={() => handleAnnotationChange('unqualified')}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      annotation === 'unqualified'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>不合格</span>
                  </button>
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注</label>
                <textarea
                  value={remark}
                  onChange={handleRemarkChange}
                  placeholder="请输入备注信息（可选）"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationWorkspace;