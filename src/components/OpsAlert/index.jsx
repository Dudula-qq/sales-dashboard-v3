import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { alertApi } from '../../services/api';

const OpsAlert = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await alertApi.getList();
    setAlerts(data);
    setLoading(false);
  };

  if (loading) return <div className="loading">加载中...</div>;

  const filteredAlerts = filterType ? alerts.filter(a => a.typeName === filterType) : alerts;
  const pending = filteredAlerts.filter(a => !a.handled && !a.ignored);
  const handled = filteredAlerts.filter(a => a.handled);
  const ignored = filteredAlerts.filter(a => a.ignored);

  const typeStats = (() => {
    const map = {};
    alerts.forEach(a => {
      map[a.typeName] = (map[a.typeName] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const severityStats = [
    { name: '紧急', value: alerts.filter(a => a.severity === 'red').length, color: '#f5222d' },
    { name: '重要', value: alerts.filter(a => a.severity === 'orange').length, color: '#fa8c16' },
    { name: '一般', value: alerts.filter(a => a.severity === 'yellow').length, color: '#d4b106' },
    { name: '提示', value: alerts.filter(a => a.severity === 'purple').length, color: '#722ed1' },
  ].filter(s => s.value > 0);

  const types = [...new Set(alerts.map(a => a.typeName))];

  return (
    <div className="ops-alert">
      <div className="ops-dash-header">
        <h2>风险监控</h2>
        <span className="ops-count">待处理 {pending.length} 条</span>
      </div>

      {/* 严重度概览 */}
      <div className="ops-severity-row">
        {severityStats.map(s => (
          <div key={s.name} className="ops-sev-card" style={{ borderLeftColor: s.color }}>
            <div className="ops-sev-num" style={{ color: s.color }}>{s.value}</div>
            <div className="ops-sev-label">{s.name}</div>
          </div>
        ))}
      </div>

      <div className="ops-charts-row">
        <div className="ops-chart-card">
          <h3 className="ops-section-title">告警类型分布</h3>
          {typeStats.length > 0 ? (
            <ReactECharts option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c}条 ({d}%)' },
              series: [{
                type: 'pie', radius: ['35%', '65%'],
                data: typeStats,
                label: { formatter: '{b}\n{c}条', fontSize: 11 },
                color: ['#f5222d', '#fa8c16', '#d4b106', '#722ed1', '#1890ff'],
              }],
            }} style={{ height: 220 }} />
          ) : <div className="ops-empty-chart">暂无数据</div>}
        </div>
        <div className="ops-chart-card">
          <h3 className="ops-section-title">处理状态</h3>
          <div className="ops-status-grid">
            <div className="ops-status-item">
              <div className="ops-status-num pending-num">{pending.length}</div>
              <div className="ops-status-label">待处理</div>
            </div>
            <div className="ops-status-item">
              <div className="ops-status-num handled-num">{handled.length}</div>
              <div className="ops-status-label">已处理</div>
            </div>
            <div className="ops-status-item">
              <div className="ops-status-num ignored-num">{ignored.length}</div>
              <div className="ops-status-label">已忽略</div>
            </div>
          </div>
        </div>
      </div>

      {/* 告警列表 */}
      <div className="ops-section">
        <div className="ops-section-header">
          <h3 className="ops-section-title">告警明细</h3>
          <div className="ops-filter-pills">
            <button className={`ops-pill ${!filterType ? 'active' : ''}`} onClick={() => setFilterType('')}>全部</button>
            {types.map(t => (
              <button key={t} className={`ops-pill ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="ops-alert-list">
          {filteredAlerts.map(a => (
            <div key={a.id} className={`ops-alert-item severity-${a.severity}`}>
              <div className="ops-ai-header">
                <span className="ops-ai-type" style={{
                  color: { red: '#f5222d', orange: '#fa8c16', yellow: '#d4b106', purple: '#722ed1' }[a.severity],
                  background: { red: '#fff1f0', orange: '#fff7e6', yellow: '#fcffe6', purple: '#f9f0ff' }[a.severity]
                }}>{a.typeName}</span>
                <span className="ops-ai-object">{a.object}</span>
                {a.salesName && <span className="ops-ai-sales">{a.salesName}</span>}
                <span className={`ops-ai-status ${a.handled ? 'handled' : a.ignored ? 'ignored' : 'pending'}`}>
                  {a.handled ? '已处理' : a.ignored ? '已忽略' : '待处理'}
                </span>
              </div>
              <div className="ops-ai-desc">{a.description}</div>
              <div className="ops-ai-time">{a.time}</div>
            </div>
          ))}
          {filteredAlerts.length === 0 && <div className="ops-empty">暂无告警数据</div>}
        </div>
      </div>
    </div>
  );
};

export default OpsAlert;