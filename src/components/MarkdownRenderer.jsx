import React from 'react';

const MarkdownRenderer = ({ content }) => {
  if (!content) {
    return null;
  }

  // 简单的 Markdown 解析器
  const parseMarkdown = (text) => {
    let html = text;
    
    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mb-3 mt-6">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mb-4 mt-8">$1</h1>');
    
    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // 斜体
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic text-gray-700">$1</em>');
    
    // 代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono text-gray-800">$1</code></pre>');
    
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>');
    
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // 无序列表
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>');
    
    // 有序列表
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>');
    
    // 包装列表项
    html = html.replace(/(<li[^>]*>.*<\/li>)/gs, '<ul class="my-2">$1</ul>');
    
    // 段落
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul')) {
        return p;
      }
      return `<p class="mb-4 text-gray-700 leading-relaxed">${p}</p>`;
    }).join('\n');
    
    // 换行
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;