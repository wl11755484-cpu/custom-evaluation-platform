import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, Eye } from 'lucide-react';

const DataTable = ({ data, onRowClick, selectedRowId, showAnnotations = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 过滤和搜索数据
  const filteredData = useMemo(() => {
    let filtered = data || [];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchableText = [
          item.id,
          item.input,
          item.output,
          item.remark
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      });
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        if (filterStatus === 'annotated') {
          return item.annotation !== null;
        } else if (filterStatus === 'unannotated') {
          return item.annotation === null;
        } else if (filterStatus === 'qualified') {
          return item.annotation === 'qualified';
        } else if (filterStatus === 'unqualified') {
          return item.annotation === 'unqualified';
        }
        return true;
      });
    }

    return filtered;
  }, [data, searchTerm, filterStatus]);

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // 总页数
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // 处理排序
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 处理页面变化
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // 重置分页当数据变化时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // 获取状态显示
  const getStatusDisplay = (annotation) => {
    if (annotation === null) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">未标注</span>;
    } else if (annotation === 'qualified') {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">合格</span>;
    } else if (annotation === 'unqualified') {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">不合格</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">未知</span>;
  };

  // 截断文本
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">暂无数据</p>
          <p className="text-sm">请先上传数据文件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 工具栏 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* 搜索 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索数据..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 过滤器和操作 */}
          <div className="flex items-center space-x-3">
            {showAnnotations && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="annotated">已标注</option>
                <option value="unannotated">未标注</option>
                <option value="qualified">合格</option>
                <option value="unqualified">不合格</option>
              </select>
            )}
            
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10条/页</option>
              <option value={25}>25条/页</option>
              <option value={50}>50条/页</option>
              <option value={100}>100条/页</option>
            </select>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                输入内容
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                输出内容
              </th>
              {showAnnotations && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标注状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    备注
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRowId === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onRowClick && onRowClick(item.id)}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {item.id}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {truncateText(item.input)}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {truncateText(item.output)}
                  </div>
                </td>
                {showAnnotations && (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusDisplay(item.annotation)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        {truncateText(item.remark, 50)}
                      </div>
                    </td>
                  </>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick && onRowClick(item.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            显示 {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} 到{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} 条，共 {sortedData.length} 条
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一页
            </button>
            
            <span className="text-sm text-gray-700">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;