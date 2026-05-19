import React from 'react';

const allMenuItems = [
  // ===== 负责人视角 =====
  { key: 'dashboard', label: '内容概览', roles: ['manager'] },
  { key: 'daily', label: '工作汇报', roles: ['manager'] },
  { key: 'opportunity', label: '商机及客户管理', roles: ['manager'] },
  { key: 'alert-calendar', label: '风险告警', roles: ['manager'] },
  { key: 'ppl', label: 'PPL管理', roles: ['manager'] },
  { key: 'agent', label: 'AI助手', roles: ['manager'] },

  // ===== 销售视角 =====
  { key: 'sales-dashboard', label: '我的概览', roles: ['sales'] },
  { key: 'sales-daily', label: '工作汇报', roles: ['sales'] },
  { key: 'sales-opportunity', label: '商机及客户管理', roles: ['sales'] },
  { key: 'sales-alert', label: '风险告警', roles: ['sales'] },
  { key: 'agent', label: 'AI助手', roles: ['sales'] },

  // ===== 运营视角 =====
  { key: 'ops-dashboard', label: '运营概览', roles: ['ops'] },
  { key: 'ops-report', label: '汇报管理', roles: ['ops'] },
  { key: 'ops-project', label: '项目跟进', roles: ['ops'] },
  { key: 'ops-alert', label: '风险监控', roles: ['ops'] },
  { key: 'agent', label: 'AI助手', roles: ['ops'] },
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
      <div className="sidebar-role-tag">
        {user?.role === 'manager' ? '负责人视角' : user?.role === 'ops' ? '运营视角' : '销售视角'}
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