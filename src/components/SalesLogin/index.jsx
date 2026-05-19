import React, { useState } from 'react';
import { authApi } from '../../services/api';

const SalesLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    const result = await authApi.login(username, password);
    setLoading(false);

    if (result.success) {
      onLogin(result.user);
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-title">
          <h1>销售看板</h1>
          <p>内部AI工作追踪系统</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <div className="login-accounts">
          <p className="login-accounts-title">测试账号</p>
          <div className="login-account-list">
            <div className="login-account-item" onClick={() => { setUsername('admin'); setPassword('123456'); }}>
              <span className="account-name">admin / 123456</span>
              <span className="account-role role-manager">负责人</span>
            </div>
            <div className="login-account-item" onClick={() => { setUsername('salesA'); setPassword('123456'); }}>
              <span className="account-name">salesA / 123456</span>
              <span className="account-role role-sales">销售A</span>
            </div>
            <div className="login-account-item" onClick={() => { setUsername('salesB'); setPassword('123456'); }}>
              <span className="account-name">salesB / 123456</span>
              <span className="account-role role-sales">销售B</span>
            </div>
            <div className="login-account-item" onClick={() => { setUsername('ops01'); setPassword('123456'); }}>
              <span className="account-name">ops01 / 123456</span>
              <span className="account-role role-ops">运营</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesLogin;