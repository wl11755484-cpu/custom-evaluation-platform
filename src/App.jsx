import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import TaskListPage from './pages/TaskListPage';
import AnnotationPage from './pages/AnnotationPage';
import AnnotationDetailPage from './pages/AnnotationDetailPage';
import TaskRedirect from './components/TaskRedirect';
import './App.css';

function App() {
  return (
    <TaskProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<TaskListPage />} />
            <Route path="/annotation/:taskId" element={<AnnotationPage />} />
            <Route path="/annotation/:taskId/:dataIndex" element={<AnnotationDetailPage />} />
            <Route path="/tasks/:taskId" element={<TaskRedirect />} />
          </Routes>
        </div>
      </Router>
    </TaskProvider>
  );
}

export default App;
