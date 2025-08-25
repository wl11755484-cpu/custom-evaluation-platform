import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import Papa from 'papaparse';
import FieldMappingModal from './FieldMappingModal';

const FileUpload = ({ onDataUploaded, taskId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [fieldMapping, setFieldMapping] = useState({ input: '', output: '' });
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('请选择CSV格式的文件');
      setUploadStatus('error');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      setUploadStatus('error');
      return;
    }

    setUploadedFile(file);
    setError('');
    setUploadStatus('uploading');

    // 解析CSV文件
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('CSV文件解析失败: ' + results.errors[0].message);
          setUploadStatus('error');
          return;
        }

        if (results.data.length === 0) {
          setError('CSV文件为空或格式不正确');
          setUploadStatus('error');
          return;
        }

        // 获取列名
        const columns = Object.keys(results.data[0]);
        
        // 检查是否需要字段映射
        const hasInputField = columns.some(col => 
          ['input', 'question', 'prompt', 'query'].includes(col.toLowerCase())
        );
        const hasOutputField = columns.some(col => 
          ['output', 'answer', 'response', 'result'].includes(col.toLowerCase())
        );

        setPreviewData({
          columns,
          data: results.data.slice(0, 5), // 预览前5行
          totalRows: results.data.length,
          fullData: results.data
        });

        if (!hasInputField || !hasOutputField) {
          // 需要手动配置字段映射
          setShowFieldMapping(true);
          setUploadStatus('success');
        } else {
          // 自动检测字段映射
          const inputField = columns.find(col => 
            ['input', 'question', 'prompt', 'query'].includes(col.toLowerCase())
          );
          const outputField = columns.find(col => 
            ['output', 'answer', 'response', 'result'].includes(col.toLowerCase())
          );
          
          setFieldMapping({ input: inputField, output: outputField });
          setUploadStatus('success');
        }
      },
      error: (error) => {
        setError('文件读取失败: ' + error.message);
        setUploadStatus('error');
      }
    });
  };

  const handleFieldMappingSave = (mapping) => {
    setFieldMapping(mapping);
    setShowFieldMapping(false);
  };

  const handleConfirmUpload = () => {
    if (!previewData || !fieldMapping.input || !fieldMapping.output) {
      setError('请先配置字段映射');
      return;
    }

    // 验证字段是否存在
    if (!previewData.columns.includes(fieldMapping.input)) {
      setError(`输入字段 "${fieldMapping.input}" 在CSV文件中不存在`);
      return;
    }
    if (!previewData.columns.includes(fieldMapping.output)) {
      setError(`输出字段 "${fieldMapping.output}" 在CSV文件中不存在`);
      return;
    }

    // 转换数据格式
    const transformedData = previewData.fullData.map((row, index) => ({
      id: `${taskId}-${index}`,
      input: row[fieldMapping.input] || '',
      output: row[fieldMapping.output] || '',
      annotation: null,
      remark: ''
    }));

    // 过滤掉输入或输出为空的数据
    const validData = transformedData.filter(item => 
      item.input.trim() && item.output.trim()
    );

    if (validData.length === 0) {
      setError('没有找到有效的数据行');
      return;
    }

    if (onDataUploaded) {
      onDataUploaded(validData);
    }

    // 重置状态
    resetUpload();
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setFieldMapping({ input: '', output: '' });
    setUploadStatus('idle');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    resetUpload();
  };

  return (
    <div className="space-y-4">
      {/* 文件上传区域 */}
      {uploadStatus === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            上传CSV数据文件
          </h3>
          <p className="text-gray-500 mb-4">
            拖拽文件到此处，或者
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              点击选择文件
            </button>
          </p>
          <p className="text-sm text-gray-400">
            支持CSV格式，文件大小不超过10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* 上传中状态 */}
      {uploadStatus === 'uploading' && (
        <div className="border border-gray-300 rounded-lg p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">正在解析文件...</p>
        </div>
      )}

      {/* 错误状态 */}
      {uploadStatus === 'error' && (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">上传失败</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={resetUpload}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新上传
          </button>
        </div>
      )}

      {/* 成功状态 - 显示预览 */}
      {uploadStatus === 'success' && previewData && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">文件解析成功</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">文件信息</h4>
              <button
                onClick={() => setShowFieldMapping(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>配置字段映射</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">文件名:</span>
                <span className="ml-2 font-mono">{uploadedFile?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">数据行数:</span>
                <span className="ml-2 font-medium">{previewData.totalRows}</span>
              </div>
              <div>
                <span className="text-gray-500">输入字段:</span>
                <span className="ml-2 font-mono text-blue-600">
                  {fieldMapping.input || '未配置'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">输出字段:</span>
                <span className="ml-2 font-mono text-blue-600">
                  {fieldMapping.output || '未配置'}
                </span>
              </div>
            </div>
          </div>

          {/* 数据预览 */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">数据预览（前5行）</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {previewData.columns.map((column) => (
                      <th key={column} className="text-left py-2 px-3 font-medium text-gray-700">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.data.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {previewData.columns.map((column) => (
                        <td key={column} className="py-2 px-3 text-gray-600 max-w-xs truncate">
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 确认按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleRemoveFile}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={!fieldMapping.input || !fieldMapping.output}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认上传
            </button>
          </div>
        </div>
      )}

      {/* 字段映射模态框 */}
      <FieldMappingModal
        isOpen={showFieldMapping}
        onClose={() => setShowFieldMapping(false)}
        onSave={handleFieldMappingSave}
        initialMapping={fieldMapping}
      />
    </div>
  );
};

export default FileUpload;