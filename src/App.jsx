import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/InterviewPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import MainLayout from './components/MainLayout';
import QuestionPage from './pages/QuestionPage';
import InterviewList from './pages/InterviewList';
import CandidateList from './pages/CandidateList';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/question" element={<ProtectedRoute><MainLayout><QuestionPage /></MainLayout></ProtectedRoute>}/>
      <Route path="/interviewList" element={<ProtectedRoute><MainLayout><InterviewList/></MainLayout></ProtectedRoute>}/>
      <Route path="/candidateList" element={<ProtectedRoute><MainLayout><CandidateList/></MainLayout></ProtectedRoute>}/>
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/interview/:interviewId" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
      <Route path="/result/:sessionId" element={<ProtectedRoute><MainLayout><ResultPage /></MainLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><MainLayout><HistoryPage /></MainLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6c63ff',
          colorBgBase: '#0a0a0f',
          fontFamily: 'DM Sans, sans-serif',
          borderRadius: 10,
          colorBorder: '#2a2a3a',
        }
      }}
    >
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}