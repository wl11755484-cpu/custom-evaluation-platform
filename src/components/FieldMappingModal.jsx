import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

const FieldMappingModal = ({ isOpen, onClose, onSave, initialMapping = null }) => {
  const { getAllFieldMappings, saveFieldMapping, deleteFieldMapping } = useTaskContext();
  const [mappingName, setMappingName] = useState('');
  const [fieldMapping, setFieldMapping] = useState({
    input: '',
    output: ''
  });
  const [savedMappings, setSavedMappings] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载已保存的映射
  useEffect(() => {
    if (isOpen) {
      setSavedMappings(getAllFieldMappings());
    }
  }, [isOpen, getAllFieldMappings]);

  // 初始化映射数据
  useEffect(() => {
    if (initialMapping) {
      setMappingName(initialMapping.name || '');
      setFieldMapping({
        input: initialMapping.input || '',
        output: initialMapping.output || ''
      });
    } else {
      setMappingName('');
      setFieldMapping({
        input: '',
        output: ''
      });
    }
    setErrors({});
  }, [initialMapping, isOpen]);

  const handleFieldChange = (field, value) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMappingNameChange = (value) => {
    setMappingName(value);
    if (errors.name) {
      setErrors(prev => ({
        ...prev,
        name: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!fieldMapping.input.trim()) {
      newErrors.input = '输入字段不能为空';
    }
    
    if (!fieldMapping.output.trim()) {
      newErrors.output = '输出字段不能为空';
    }
    
    if (mappingName.trim() && mappingName.trim().length < 2) {
      newErrors.name = '映射名称至少需要2个字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const mappingData = {
        input: fieldMapping.input.trim(),
        output: fieldMapping.output.trim()
      };
      
      // 如果有映射名称，保存到本地存储
      if (mappingName.trim()) {
        saveFieldMapping(mappingName.trim(), mappingData);
        setSavedMappings(getAllFieldMappings());
      }
      
      // 调用父组件的保存回调
      if (onSave) {
        onSave(mappingData);
      }
      
      onClose();
    } catch (error) {
      console.error('保存字段映射失败:', error);
      setErrors({ submit: '保存失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMapping = (mapping) => {
    setFieldMapping({
      input: mapping.input,
      output: mapping.output
    });
    setMappingName(mapping.name);
    setErrors({});
  };

  const handleDeleteMapping = (mappingName) => {
    if (window.confirm(`确定要删除映射 "${mappingName}" 吗？`)) {
      deleteFieldMapping(mappingName);
      setSavedMappings(getAllFieldMappings());
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMappingName('');
      setFieldMapping({
        input: '',
        output: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">字段映射配置</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* 已保存的映射 */}
          {savedMappings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">已保存的映射</h3>
              <div className="space-y-2">
                {savedMappings.map((mapping) => (
                  <div
                    key={mapping.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{mapping.name}</div>
                      <div className="text-sm text-gray-500">
                        输入: {mapping.input} → 输出: {mapping.output}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLoadMapping(mapping)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        使用
                      </button>
                      <button
                        onClick={() => handleDeleteMapping(mapping.name)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 映射配置表单 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                映射名称（可选）
              </label>
              <input
                type="text"
                value={mappingName}
                onChange={(e) => handleMappingNameChange(e.target.value)}
                placeholder="为这个映射起个名字，方便以后使用"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入字段名 *
              </label>
              <input
                type="text"
                value={fieldMapping.input}
                onChange={(e) => handleFieldChange('input', e.target.value)}
                placeholder="例如: question, prompt, input"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.input ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.input && (
                <p className="mt-1 text-sm text-red-600">{errors.input}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                CSV文件中包含输入内容的列名
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输出字段名 *
              </label>
              <input
                type="text"
                value={fieldMapping.output}
                onChange={(e) => handleFieldChange('output', e.target.value)}
                placeholder="例如: answer, response, output"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.output ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.output && (
                <p className="mt-1 text-sm text-red-600">{errors.output}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                CSV文件中包含输出内容的列名
              </p>
            </div>
          </div>

          {/* 提交错误 */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? '保存中...' : '确定'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldMappingModal;