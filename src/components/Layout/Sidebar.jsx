import React from 'react';

const allMenuItems = [
  { key: 'dashboard', label: '内容概览' },
  { key: 'daily', label: '工作汇报' },
  { key: 'opportunity', label: '商机及客户管理' },
  { key: 'alert-calendar', label: '风险告警' },
  { key: 'ppl', label: 'PPL管理', roles: ['manager'] },
  { key: 'agent', label: 'AI助手' },
];

const Sidebar = ({ collapsed, activeMenu, onMenuClick, onToggle, user }) => {
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