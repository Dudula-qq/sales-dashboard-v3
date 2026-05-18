import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import CustomerFunnel from './components/CustomerFunnel';
import CustomerStatusBoard from './components/CustomerStatusBoard';
import OpportunityBoard from './components/OpportunityBoard';
import CustomerGradeBoard from './components/CustomerGradeBoard';
import PPLDashboard from './components/PPLDashboard';
import AlertCenter from './components/AlertCenter';
import FollowUpCalendar from './components/FollowUpCalendar';
import TeamManagement from './components/TeamManagement';
import DailyReportInput from './components/DailyReportInput';
import DailyReportSummary from './components/DailyReportSummary';
import WeeklyReportDashboard from './components/WeeklyReportDashboard';
import TodoReminder from './components/TodoReminder';
import SalesLogin from './components/SalesLogin';
import AgentHub from './components/AgentHub';
import AgentChat from './components/AgentChat';
import AgentCreateModal from './components/AgentCreateModal';
import AutomationLogs from './components/AutomationLogs';
import { pplApi, alertApi, calendarApi, customerApi } from './services/api';
import { onDataChange } from './services/dataEvents';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pplHealth, setPplHealth] = useState(null);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [calendarSummary, setCalendarSummary] = useState(0);
  const [alertCalendarTab, setAlertCalendarTab] = useState('alerts');
  const [weeklyTab, setWeeklyTab] = useState('weekly');
  const [alertDetail, setAlertDetail] = useState(null);
  const [agentTab, setAgentTab] = useState('conversational');
  const [chatAgentId, setChatAgentId] = useState(null);
  const [logsAgentId, setLogsAgentId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isManager = currentUser?.role === 'manager';

  useEffect(() => {
    const savedUser = localStorage.getItem('salesUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const off1 = onDataChange('ppl_changed', loadDashboardData);
    const off2 = onDataChange('customer_changed', loadDashboardData);
    const off3 = onDataChange('project_changed', loadDashboardData);
    const off4 = onDataChange('alert_changed', loadDashboardData);
    return function() { off1(); off2(); off3(); off4(); };
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    const [health, alerts, calData] = await Promise.all([
      pplApi.getHealth(),
      alertApi.getList({ handled: false }),
      calendarApi.getMonthData(new Date().getFullYear(), new Date().getMonth() + 1),
    ]);
    setPplHealth(health);
    setPendingAlerts(alerts.filter(a => !a.ignored));
    const totalPlans = Object.values(calData).reduce((sum, plans) => sum + plans.length, 0);
    setCalendarSummary(totalPlans);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('salesUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('salesUser');
    setActiveMenu('dashboard');
  };

  if (!isLoggedIn) {
    return <SalesLogin onLogin={handleLogin} />;
  }

  const formatMoney = (v) => {
    if (v >= 10000) return (v / 10000).toFixed(0) + '万';
    return v.toLocaleString();
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="dashboard-row">
              <div className="dashboard-card">
                <CustomerFunnel user={currentUser} />
              </div>
              <div className="dashboard-card dash-ppl-card">
                {pplHealth ? (
                  <div className="dp-wrap">
                    <div className="dp-top">
                      <span className="dp-label">PPL健康度</span>
                      <span className={`dp-status ${pplHealth.healthRatio >= 3 ? 'dp-ok' : 'dp-warn'}`}>
                        {pplHealth.healthRatio >= 3 ? '健康' : '需关注'}
                      </span>
                    </div>
                    <div className="dp-bar-section">
                      <div className="dp-bar-track">
                        <div className="dp-bar-kpi" />
                        <div
                          className={`dp-bar-fill ${pplHealth.healthRatio >= 3 ? 'dp-fill-ok' : 'dp-fill-warn'}`}
                          style={{ width: `${Math.min(pplHealth.healthRatio / 6, 1) * 100}%` }}
                        />
                        <div className="dp-bar-3x-mark" />
                      </div>
                      <div className="dp-bar-labels">
                        <span>0</span>
                        <span className="dp-3x-label">3x KPI</span>
                        <span>6x</span>
                      </div>
                    </div>
                    <div className="dp-metrics">
                      <div className="dp-m-item">
                        <div className="dp-m-num">¥{formatMoney(pplHealth.currentPPL)}</div>
                        <div className="dp-m-desc">当前PPL</div>
                      </div>
                      <div className="dp-m-divider" />
                      <div className="dp-m-item">
                        <div className="dp-m-num">¥{formatMoney(pplHealth.kpiTarget)}</div>
                        <div className="dp-m-desc">KPI目标</div>
                      </div>
                      <div className="dp-m-divider" />
                      <div className="dp-m-item">
                        <div className={`dp-m-num ${pplHealth.kpiProbability >= 70 ? 'dp-m-ok' : 'dp-m-bad'}`}>{pplHealth.kpiProbability}%</div>
                        <div className="dp-m-desc">达成概率</div>
                      </div>
                      <div className="dp-m-divider" />
                      <div className="dp-m-item">
                        <div className={`dp-m-num ${pplHealth.healthRatio >= 3 ? 'dp-m-ok' : 'dp-m-bad'}`}>{pplHealth.healthRatio.toFixed(1)}x</div>
                        <div className="dp-m-desc">PPL/KPI</div>
                      </div>
                    </div>
                    <div className="dp-alert-section">
                      <div className="dp-alert-head">
                        <span className="dp-alert-title">风险告警</span>
                        {pendingAlerts.length > 0 && <span className="dp-alert-badge">{pendingAlerts.length}</span>}
                        <button className="dp-alert-more" onClick={() => { setActiveMenu('alert-calendar'); setAlertCalendarTab('alerts'); }}>全部 &rsaquo;</button>
                      </div>
                      {pendingAlerts.length > 0 ? (
                        <div className="dp-alert-list">
                          {pendingAlerts.map(a => (
                            <div key={a.id} className="dp-alert-row" onClick={() => setAlertDetail(a)}>
                              <span className="dp-alert-chip" style={{
                                color: { red: '#f5222d', orange: '#fa8c16', yellow: '#d4b106', purple: '#722ed1' }[a.severity] || '#fa8c16',
                                background: { red: '#fff1f0', orange: '#fff7e6', yellow: '#fcffe6', purple: '#f9f0ff' }[a.severity] || '#fff7e6'
                              }}>{a.typeName}</span>
                              <span className="dp-alert-text">{a.object} - {a.description}</span>
                              <span className="dp-alert-arrow">&rsaquo;</span>
                            </div>
                          ))}
                        </div>
                      ) : <div className="dp-alert-empty">暂无告警</div>}
                    </div>
                  </div>
                ) : <div className="loading">加载中...</div>}
              </div>
            </div>
            <div className="dashboard-row">
              <div className="dashboard-card">
                <h3>客户分级概览</h3>
                <CustomerGradeOverview />
              </div>
              <div className="dashboard-card calendar-summary-card">
                <h3>跟进日历摘要</h3>
                <div className="calendar-summary-content">
                  <div className="csc-count">本月 <strong>{calendarSummary}</strong> 个跟进计划</div>
                  <button className="btn btn-primary btn-sm" onClick={() => { setActiveMenu('alert-calendar'); setAlertCalendarTab('calendar'); }}>查看日历</button>
                </div>
              </div>
            </div>
            <div className="dashboard-row">
              <div className="dashboard-card dash-todo-card">
                <TodoReminder user={currentUser} />
              </div>
              {currentUser?.role === 'manager' && (
                <div className="dashboard-card dash-report-card">
                  <DailyReportSummary />
                </div>
              )}
            </div>
          </div>
        );
      case 'alert-calendar':
        return (
          <div>
            <div className="tm-tabs" style={{ marginBottom: 20 }}>
              <button className={`tm-tab ${alertCalendarTab === 'alerts' ? 'active' : ''}`} onClick={() => setAlertCalendarTab('alerts')}>风险告警</button>
              <button className={`tm-tab ${alertCalendarTab === 'calendar' ? 'active' : ''}`} onClick={() => setAlertCalendarTab('calendar')}>跟进日历</button>
            </div>
            {alertCalendarTab === 'alerts' ? <AlertCenter user={currentUser} /> : <FollowUpCalendar user={currentUser} />}
          </div>
        );
      case 'customer-grade':
        return <CustomerGradeBoard user={currentUser} />;
      case 'ppl':
        return <PPLDashboard user={currentUser} />;
      case 'daily':
        return <DailyReportInput user={currentUser} />;
      case 'weekly':
        return (
          <div>
            <div className="tm-tabs" style={{ marginBottom: 20 }}>
              <button className={`tm-tab ${weeklyTab === 'weekly' ? 'active' : ''}`} onClick={() => setWeeklyTab('weekly')}>周报汇总</button>
              <button className={`tm-tab ${weeklyTab === 'team' ? 'active' : ''}`} onClick={() => setWeeklyTab('team')}>团队管理</button>
            </div>
            {weeklyTab === 'weekly' ? <WeeklyReportDashboard /> : <TeamManagement user={currentUser} />}
          </div>
        );
      case 'agent':
        if (logsAgentId) {
          return <AutomationLogs agentId={logsAgentId} onBack={() => setLogsAgentId(null)} />;
        }
        if (chatAgentId) {
          return <AgentChat agentId={chatAgentId} onBack={() => setChatAgentId(null)} onNavigate={(key) => { setChatAgentId(null); setActiveMenu(key); }} />;
        }
        return (
          <AgentHub
            onChatOpen={(id) => setChatAgentId(id)}
            onLogsOpen={(id) => setLogsAgentId(id)}
            onCreateOpen={(tab) => { setAgentTab(tab); setShowCreateModal(true); }}
          />
        );
      default:
        return <CustomerFunnel user={currentUser} />;
    }
  };

  return (
    <>
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
    {alertDetail && (
      <div className="modal-overlay" onClick={() => setAlertDetail(null)}>
        <div className="modal-content da-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>告警详情</h3>
            <button className="modal-close" onClick={() => setAlertDetail(null)}>&times;</button>
          </div>
          <div className="da-detail-body">
            <div className="da-detail-row">
              <span className="da-detail-label">告警类型</span>
              <span className="da-type-chip" style={{
                color: { red: '#f5222d', orange: '#fa8c16', yellow: '#d4b106', purple: '#722ed1' }[alertDetail.severity] || '#fa8c16',
                background: { red: '#fff1f0', orange: '#fff7e6', yellow: '#fcffe6', purple: '#f9f0ff' }[alertDetail.severity] || '#fff7e6'
              }}>{alertDetail.typeName}</span>
            </div>
            <div className="da-detail-row">
              <span className="da-detail-label">告警对象</span>
              <span className="da-detail-value">{alertDetail.object}</span>
            </div>
            <div className="da-detail-row">
              <span className="da-detail-label">告警描述</span>
              <span className="da-detail-value">{alertDetail.description}</span>
            </div>
            <div className="da-detail-row">
              <span className="da-detail-label">告警时间</span>
              <span className="da-detail-value">{alertDetail.time}</span>
            </div>
            {isManager && alertDetail.salesName && (
              <div className="da-detail-row">
                <span className="da-detail-label">所属销售</span>
                <span className="da-detail-value">{alertDetail.salesName}</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setAlertDetail(null)}>关闭</button>
          </div>
        </div>
      </div>
    )}
    <AgentCreateModal
      visible={showCreateModal}
      defaultTab={agentTab}
      onClose={() => setShowCreateModal(false)}
      onCreated={() => setShowCreateModal(false)}
    />
    </>
  );
}

// Customer grade overview for dashboard
const CustomerGradeOverview = () => {
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    customerApi.getList().then(res => setCustomers(res.data));
  }, []);

  const gradeStats = [
    { key: 'Committed', label: 'Committed', color: '#52c41a', count: customers.filter(c => c.grade === 'Committed').length },
    { key: 'Upside', label: 'Upside', color: '#1890ff', count: customers.filter(c => c.grade === 'Upside').length },
    { key: 'Probably', label: 'Probably', color: '#8c8c8c', count: customers.filter(c => c.grade === 'Probably').length },
  ];

  return (
    <div className="cgo-row">
      {gradeStats.map(g => (
        <div key={g.key} className="cgo-item" style={{ borderColor: g.color }}>
          <span className="cgo-count" style={{ color: g.color }}>{g.count}</span>
          <span className="cgo-label">{g.label}</span>
        </div>
      ))}
    </div>
  );
};

export default App;
