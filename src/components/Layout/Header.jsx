import React, { useState, useEffect } from 'react';

const Header = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString('zh-CN', options);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">销售工作进度追踪系统</h1>
      </div>
      <div className="header-right">
        <span className="header-time">{formatTime(currentTime)}</span>
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="user-name">{user?.name || '用户'}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          退出
        </button>
      </div>
    </header>
  );
};

export default Header;
