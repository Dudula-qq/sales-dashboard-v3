import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import CustomerFunnel from './components/CustomerFunnel';
import CustomerStatusBoard from './components/CustomerStatusBoard';
import ProjectStageBoard from './components/ProjectStageBoard';
import ProjectProgress from './components/ProjectProgress';
import DailyReportInput from './components/DailyReportInput';
import DailyReportSummary from './components/DailyReportSummary';
import WeeklyReportDashboard from './components/WeeklyReportDashboard';
import TodoReminder from './components/TodoReminder';
import SalesLogin from './components/SalesLogin';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('salesUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 登录处理
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('salesUser', JSON.stringify(user));
  };

  // 登出处理
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('salesUser');
    setActiveMenu('dashboard');
  };

  // 未登录显示登录页面
  if (!isLoggedIn) {
    return <SalesLogin onLogin={handleLogin} />;
  }

  // 渲染主内容区
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="dashboard-row">
              <div className="dashboard-card">
                <CustomerFunnel user={currentUser} />
              </div>
              <div className="dashboard-card">
                <TodoReminder user={currentUser} />
              </div>
            </div>
            <div className="dashboard-row">
              <div className="dashboard-card full-width">
                <ProjectStageBoard user={currentUser} />
              </div>
            </div>
            <div className="dashboard-row">
              <div className="dashboard-card full-width">
                <CustomerStatusBoard user={currentUser} />
              </div>
            </div>
            {/* 管理员显示日报汇总 */}
            {currentUser?.role === 'manager' && (
              <div className="dashboard-row">
                <div className="dashboard-card full-width">
                  <DailyReportSummary />
                </div>
              </div>
            )}
          </div>
        );
      case 'projects':
        return <ProjectProgress user={currentUser} />;
      case 'daily':
        return <DailyReportInput user={currentUser} />;
      case 'weekly':
        return <WeeklyReportDashboard />;
      default:
        return <CustomerFunnel user={currentUser} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        collapsed={sidebarCollapsed}
        activeMenu={activeMenu}
        onMenuClick={setActiveMenu}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={currentUser}
      />
      <div className={`main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          user={currentUser}
          onLogout={handleLogout}
        />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
