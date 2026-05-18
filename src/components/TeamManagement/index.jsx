import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { teamApi } from '../../services/api';

const TeamManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendance, setAttendance] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [budget, setBudget] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [att, perf, bgt, mem] = await Promise.all([
      teamApi.getAttendance(),
      teamApi.getPerformance(),
      teamApi.getBudget(),
      teamApi.getMembers(),
    ]);
    setAttendance(att);
    setPerformance(perf);
    setBudget(bgt);
    setMembers(mem);
    setLoading(false);
  };

  const tabs = [
    { key: 'attendance', label: '考勤工时' },
    { key: 'performance', label: '绩效管理' },
    { key: 'budget', label: '预算管理' },
    { key: 'personnel', label: '人员管理' },
  ];

  const budgetChartOption = budget ? {
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: budget.items.map(i => i.name) },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v / 10000) + '万' } },
    series: [
      { name: '预算', type: 'bar', data: budget.items.map(i => i.budget), itemStyle: { color: '#1890ff' } },
      { name: '已用', type: 'bar', data: budget.items.map(i => i.used), itemStyle: { color: '#52c41a' } },
    ]
  } : null;

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="team-management">
      <div className="board-header">
        <h2>团队管理</h2>
      </div>
      <div className="tm-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tm-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tm-content">
        {activeTab === 'attendance' && attendance && (
          <div className="tm-attendance">
            <div className="tm-stat-cards">
              <div className="tm-stat-card">
                <div className="tmsc-label">月出勤率</div>
                <div className="tmsc-value">{attendance.monthRate}%</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>姓名</th><th>应出勤</th><th>实际出勤</th><th>请假天数</th><th>加班天数</th><th>出勤率</th>
                </tr>
              </thead>
              <tbody>
                {attendance.members.map((m, i) => (
                  <tr key={i}>
                    <td>{m.name}</td><td>{m.workDays}</td><td>{m.actualDays}</td>
                    <td>{m.leaveDays}</td><td>{m.overtimeDays}</td>
                    <td><span className={`status-tag ${m.rate >= 98 ? 'tag-success' : m.rate >= 95 ? 'tag-warning' : 'tag-danger'}`}>{m.rate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'performance' && performance && (
          <div className="tm-performance">
            <div className="tm-perf-weights">
              <span>营收权重: {performance.revenueWeight * 100}%</span>
              <span>过程管理权重: {performance.processWeight * 100}%</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>排名</th><th>姓名</th><th>营收(万)</th><th>营收得分</th><th>过程得分</th><th>综合得分</th>
                </tr>
              </thead>
              <tbody>
                {performance.members.map((m, i) => (
                  <tr key={i}>
                    <td><span className={`rank-badge rank-${m.rank}`}>{m.rank}</span></td>
                    <td>{m.name}</td>
                    <td>{(m.revenue / 10000).toFixed(0)}</td>
                    <td>{m.revenueScore}</td>
                    <td>{m.processScore}</td>
                    <td><strong>{m.totalScore}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'budget' && budget && (
          <div className="tm-budget">
            <div className="tm-stat-cards">
              <div className="tm-stat-card">
                <div className="tmsc-label">总预算</div>
                <div className="tmsc-value">¥{(budget.totalBudget / 10000).toFixed(0)}万</div>
              </div>
              <div className="tm-stat-card">
                <div className="tmsc-label">已使用</div>
                <div className="tmsc-value">¥{(budget.usedBudget / 10000).toFixed(0)}万</div>
              </div>
              <div className="tm-stat-card">
                <div className="tmsc-label">执行率</div>
                <div className="tmsc-value">{((budget.usedBudget / budget.totalBudget) * 100).toFixed(1)}%</div>
              </div>
            </div>
            {budgetChartOption && <ReactECharts option={budgetChartOption} style={{ height: 280 }} />}
            <table className="data-table">
              <thead>
                <tr><th>项目</th><th>预算(万)</th><th>已用(万)</th><th>执行率</th></tr>
              </thead>
              <tbody>
                {budget.items.map((item, i) => {
                  const rate = ((item.used / item.budget) * 100).toFixed(1);
                  return (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{(item.budget / 10000).toFixed(0)}</td>
                      <td>{(item.used / 10000).toFixed(0)}</td>
                      <td>
                        <div className="budget-progress">
                          <div className="budget-progress-bar" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: rate > 90 ? '#f5222d' : rate > 70 ? '#faad14' : '#52c41a' }}></div>
                          <span>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'personnel' && (
          <div className="tm-personnel">
            <div className="org-tree">
              <div className="org-node org-root">销售经理</div>
              <div className="org-children">
                {members.filter(m => m.role === 'sales').map(m => (
                  <div key={m.id} className="org-node org-leaf">
                    <div className="org-name">{m.name}</div>
                    <div className="org-role">{m.roleName}</div>
                  </div>
                ))}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>姓名</th><th>角色</th><th>电话</th><th>入职日期</th><th>状态</th></tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.roleName}</td>
                    <td>{m.phone}</td>
                    <td>{m.joinDate}</td>
                    <td><span className="status-tag tag-success">{m.status === 'active' ? '在职' : m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
