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
    try {
      const result = await authApi.login(username, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('登录失败，请重试');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-title">
          <h1>销售工作进度追踪系统</h1>
          <p>请登录以继续</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
          <p style={{ marginBottom: '12px', color: '#999' }}>测试账号</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: '#f5f5f5', padding: '8px 16px', borderRadius: '4px' }}>
              <strong style={{ color: '#1890ff' }}>管理员:</strong> admin / 123456
            </div>
            <div style={{ background: '#f5f5f5', padding: '8px 16px', borderRadius: '4px' }}>
              <strong style={{ color: '#52c41a' }}>销售A:</strong> salesA / 123456
            </div>
            <div style={{ background: '#f5f5f5', padding: '8px 16px', borderRadius: '4px' }}>
              <strong style={{ color: '#fa8c16' }}>销售B:</strong> salesB / 123456
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesLogin;
