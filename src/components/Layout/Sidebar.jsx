import React from 'react';

const allMenuItems = [
  { key: 'dashboard', label: '销售工作追踪汇总' },
  { key: 'customer-grade', label: '客户分级管理' },
  { key: 'ppl', label: 'PPL管理', roles: ['manager'] },
  { key: 'alert-calendar', label: '告警与日历' },
  { key: 'daily', label: '日报录入', roles: ['sales'] },
  { key: 'weekly', label: '周报汇总', roles: ['manager'] },
  { key: 'agent', label: '智能体' },
];

const Sidebar = ({ collapsed, activeMenu, onMenuClick, onToggle, user }) => {
  // 根据用户角色过滤菜单
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">{collapsed ? 'S' : '销售看板'}</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`menu-item ${activeMenu === item.key ? 'active' : ''}`}
            onClick={() => onMenuClick(item.key)}
          >
            <span className="menu-text">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? '\u203A' : '\u2039'}
      </div>
    </aside>
  );
};

export default Sidebar;
