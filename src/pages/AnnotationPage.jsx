import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import FileUpload from '../components/FileUpload';
import DataTable from '../components/DataTable';

const AnnotationPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getTask, uploadTaskData } = useTaskContext();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (taskId) {
      const taskData = getTask(taskId);
      if (taskData) {
        setTask(taskData);
        // 如果任务已有数据，直接跳转到标注详情页
        if (taskData.data && taskData.data.length > 0) {
          navigate(`/tasks/${taskId}/annotation`);
        }
      } else {
        navigate('/tasks');
      }
      setLoading(false);
    }
  }, [taskId, getTask, navigate]);

  const handleDataUploaded = async (data) => {
    try {
      await uploadTaskData(taskId, data);
      setUploadSuccess(true);
      
      // 延迟跳转到标注详情页
      setTimeout(() => {
        navigate(`/tasks/${taskId}/annotation`);
      }, 1500);
    } catch (error) {
      console.error('上传数据失败:', error);
      alert('上传数据失败，请重试');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {uploadSuccess ? (
          /* 上传成功状态 */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">数据上传成功！</h2>
            <p className="text-gray-600 mb-6">正在跳转到标注页面...</p>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          /* 上传界面 */
          <div className="space-y-8">
            {/* 说明卡片 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">上传数据文件</h3>
                  <div className="text-blue-800 space-y-2">
                    <p>请上传包含待标注数据的CSV文件，文件应包含以下内容：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>输入内容列（如：question, prompt, input等）</li>
                      <li>输出内容列（如：answer, response, output等）</li>
                      <li>每行代表一条待标注的数据</li>
                    </ul>
                    <p className="mt-3 text-sm">
                      <strong>注意：</strong>系统会自动识别常见的字段名，如果无法自动识别，您可以手动配置字段映射。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 文件上传组件 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">选择数据文件</h2>
              <FileUpload
                onDataUploaded={handleDataUploaded}
                taskId={taskId}
              />
            </div>

            {/* 示例数据格式 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">CSV文件格式示例</h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">question</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-600">什么是人工智能？</td>
                      <td className="py-2 px-3 text-gray-600">人工智能是计算机科学的一个分支...</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-600">机器学习的主要类型有哪些？</td>
                      <td className="py-2 px-3 text-gray-600">机器学习主要分为监督学习、无监督学习...</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-gray-600">深度学习与传统机器学习的区别？</td>
                      <td className="py-2 px-3 text-gray-600">深度学习使用多层神经网络...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                您的CSV文件可以使用不同的列名，系统会自动识别或允许您手动配置字段映射。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationPage;