import React from 'react';

const allMenuItems = [
  { key: 'dashboard', icon: '📊', label: '销售工作追踪汇总' },
  { key: 'projects', icon: '📁', label: '项目进度' },
  { key: 'daily', icon: '📝', label: '日报录入', roles: ['sales'] },
  { key: 'weekly', icon: '📅', label: '周报汇总', roles: ['manager'] },
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
        <span className="sidebar-logo">{collapsed ? '📊' : '销售看板'}</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`menu-item ${activeMenu === item.key ? 'active' : ''}`}
            onClick={() => onMenuClick(item.key)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? '▶' : '◀'}
      </div>
    </aside>
  );
};

export default Sidebar;
