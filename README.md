# 自定义评估平台

基于React和Vite的任务管理和数据标注系统

## 功能特性

- 📊 **任务管理**: 创建、管理和跟踪评估任务
- 📝 **数据标注**: 支持多种数据格式的标注功能
- 📁 **文件上传**: 支持CSV、Excel等格式的数据导入
- 🔄 **字段映射**: 灵活的数据字段映射配置
- 📤 **数据导出**: 支持标注结果的导出功能
- 🎨 **现代UI**: 基于TailwindCSS的响应式界面

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式框架**: TailwindCSS
- **路由管理**: React Router
- **状态管理**: React Context
- **图标库**: Lucide React
- **文件处理**: XLSX, File-saver
- **Markdown渲染**: React Markdown

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── AnnotationWorkspace.jsx
│   ├── CreateTaskModal.jsx
│   ├── DataTable.jsx
│   ├── FieldMappingModal.jsx
│   ├── FileUpload.jsx
│   └── MarkdownRenderer.jsx
├── contexts/           # React Context
│   └── TaskContext.jsx
├── pages/             # 页面组件
│   ├── AnnotationDetailPage.jsx
│   ├── AnnotationPage.jsx
│   └── TaskListPage.jsx
├── App.jsx            # 主应用组件
├── main.jsx          # 应用入口
└── index.css         # 全局样式
```

## 使用说明

1. **创建任务**: 在首页点击"创建新任务"按钮
2. **上传数据**: 选择CSV或Excel文件上传数据
3. **字段映射**: 配置数据字段与系统字段的映射关系
4. **开始标注**: 进入标注界面进行数据标注
5. **导出结果**: 完成标注后导出结果文件

## 开发文档

详细的开发文档请查看 `docs/` 目录：

- [项目概览](docs/01-项目概览/)
- [架构设计](docs/02-架构设计/)
- [开发实施](docs/03-开发实施/)
- [管理维护](docs/04-管理维护/)

## 许可证

MIT License