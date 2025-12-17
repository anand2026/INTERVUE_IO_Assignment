import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleSelection } from './pages/RoleSelection';
import { StudentNameInput } from './pages/StudentNameInput';
import { StudentView } from './pages/StudentView';
import { TeacherDashboard } from './pages/TeacherDashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/student/name" element={<StudentNameInput />} />
        <Route path="/student/poll" element={<StudentView />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
