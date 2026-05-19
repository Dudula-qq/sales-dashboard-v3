import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { projectApi, customerApi, alertApi, dailyReportApi, pplApi } from '../../services/api';

const OpsDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [pplData, setPplData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projRes, custRes, alertRes, reportRes, pplRes] = await Promise.all([
      projectApi.getList(),
      customerApi.getList(),
      alertApi.getList({ handled: false }),
      dailyReportApi.getList(),
      pplApi.getHealth(),
    ]);
    setProjects(projRes.data);
    setCustomers(custRes.data);
    setAlerts(alertRes.filter(a => !a.ignored));
    setReports(reportRes);
    setPplData(pplRes);
    setLoading(false);
  };

  if (loading) return <div className="loading">加载中...</div>;

  // 运营数据统计
  const totalProjects = projects.length;
  const totalCustomers = customers.length;
  const totalAmount = projects.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingAlerts = alerts.length;
  const todayReports = reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length;

  const committedCount = customers.filter(c => c.grade === 'Committed').length;
  const upsideCount = customers.filter(c => c.grade === 'Upside').length;
  const probablyCount = customers.filter(c => c.grade === 'Probably').length;

  const stageDistribution = [
    { name: 'S1 机会确认', value: projects.filter(p => p.stage === 'S1').length },
    { name: 'S2 建立关系', value: projects.filter(p => p.stage === 'S2').length },
    { name: 'S3 提出方案', value: projects.filter(p => p.stage === 'S3').length },
    { name: 'S4 达成协议', value: projects.filter(p => p.stage === 'S4').length },
    { name: 'S5 签署合同', value: projects.filter(p => p.stage === 'S5').length },
    { name: 'S6+ 交付验收', value: projects.filter(p => ['S6','S7','S8'].includes(p.stage)).length },
  ].filter(d => d.value > 0);

  const alertTypeDistribution = (() => {
    const typeMap = {};
    alerts.forEach(a => {
      typeMap[a.typeName] = (typeMap[a.typeName] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  })();

  const salesWorkload = (() => {
    const map = {};
    projects.forEach(p => {
      if (!map[p.salesName]) map[p.salesName] = { projects: 0, amount: 0, customers: new Set() };
      map[p.salesName].projects += 1;
      map[p.salesName].amount += (p.amount || 0);
      map[p.salesName].customers.add(p.customer);
    });
    return Object.entries(map).map(([name, d]) => ({
      name,
      projects: d.projects,
      amount: d.amount,
      customers: d.customers.size,
    }));
  })();

  const recentReports = reports.slice(0, 10);

  return (
    <div className="ops-dashboard">
      <div className="ops-dash-header">
        <h2>运营概览</h2>
      </div>

      {/* 核心指标卡片 */}
      <div className="ops-metrics-row">
        <div className="ops-metric-card" style={{ borderLeftColor: '#1890ff' }}>
          <div className="ops-metric-num">{totalProjects}</div>
          <div className="ops-metric-label">商机总数</div>
        </div>
        <div className="ops-metric-card" style={{ borderLeftColor: '#52c41a' }}>
          <div className="ops-metric-num">{totalCustomers}</div>
          <div className="ops-metric-label">客户总数</div>
        </div>
        <div className="ops-metric-card" style={{ borderLeftColor: '#722ed1' }}>
          <div className="ops-metric-num">¥{(totalAmount / 10000).toFixed(0)}万</div>
          <div className="ops-metric-label">商机总金额</div>
        </div>
        <div className="ops-metric-card" style={{ borderLeftColor: '#f5222d' }}>
          <div className="ops-metric-num">{pendingAlerts}</div>
          <div className="ops-metric-label">待处理告警</div>
        </div>
        <div className="ops-metric-card" style={{ borderLeftColor: '#fa8c16' }}>
          <div className="ops-metric-num">{todayReports}</div>
          <div className="ops-metric-label">今日日报</div>
        </div>
      </div>

      {/* 客户分级概览 */}
      <div className="ops-section">
        <h3 className="ops-section-title">客户分级分布</h3>
        <div className="ops-grade-row">
          <div className="ops-grade-item" style={{ borderColor: '#52c41a' }}>
            <div className="ops-grade-num" style={{ color: '#52c41a' }}>{committedCount}</div>
            <div className="ops-grade-label">Committed</div>
            <div className="ops-grade-sub">高确定性</div>
          </div>
          <div className="ops-grade-item" style={{ borderColor: '#1890ff' }}>
            <div className="ops-grade-num" style={{ color: '#1890ff' }}>{upsideCount}</div>
            <div className="ops-grade-label">Upside</div>
            <div className="ops-grade-sub">有潜力</div>
          </div>
          <div className="ops-grade-item" style={{ borderColor: '#8c8c8c' }}>
            <div className="ops-grade-num" style={{ color: '#8c8c8c' }}>{probablyCount}</div>
            <div className="ops-grade-label">Probably</div>
            <div className="ops-grade-sub">初步接触</div>
          </div>
        </div>
      </div>

      {/* 图表区 */}
      <div className="ops-charts-row">
        <div className="ops-chart-card">
          <h3 className="ops-section-title">商机阶段分布</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            series: [{
              type: 'pie', radius: ['40%', '70%'],
              data: stageDistribution,
              label: { formatter: '{b}\n{c}个', fontSize: 11 },
              itemStyle: { borderRadius: 4 },
              color: ['#e3f2fd', '#e8f5e9', '#fff3e0', '#fce4ec', '#f3e5f5', '#e0f2f1'],
            }],
          }} style={{ height: 260 }} />
        </div>
        <div className="ops-chart-card">
          <h3 className="ops-section-title">告警类型分布</h3>
          {alertTypeDistribution.length > 0 ? (
            <ReactECharts option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{
                type: 'pie', radius: ['40%', '70%'],
                data: alertTypeDistribution,
                label: { formatter: '{b}\n{c}条', fontSize: 11 },
                color: ['#f5222d', '#fa8c16', '#d4b106', '#722ed1'],
              }],
            }} style={{ height: 260 }} />
          ) : <div className="ops-empty-chart">暂无告警数据</div>}
        </div>
      </div>

      {/* PPL健康度 */}
      {pplData && (
        <div className="ops-section">
          <h3 className="ops-section-title">PPL健康度</h3>
          <div className="ops-ppl-bar">
            <div className="ops-ppl-label">
              <span>PPL/KPI = {pplData.healthRatio?.toFixed(1)}x</span>
              <span className={`ops-ppl-status ${pplData.healthRatio >= 3 ? 'ok' : 'warn'}`}>
                {pplData.healthRatio >= 3 ? '健康' : '需关注'}
              </span>
            </div>
            <div className="ops-ppl-track">
              <div className="ops-ppl-3x-mark" />
              <div className={`ops-ppl-fill ${pplData.healthRatio >= 3 ? 'ok' : 'warn'}`}
                style={{ width: `${Math.min(pplData.healthRatio / 6, 1) * 100}%` }} />
            </div>
            <div className="ops-ppl-metrics">
              <span>当前PPL: ¥{pplData.currentPPL ? (pplData.currentPPL / 10000).toFixed(0) : 0}万</span>
              <span>KPI目标: ¥{pplData.kpiTarget ? (pplData.kpiTarget / 10000).toFixed(0) : 0}万</span>
              <span>达成概率: {pplData.kpiProbability || 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 团队工作量 */}
      <div className="ops-section">
        <h3 className="ops-section-title">团队工作量概览</h3>
        <div className="ops-workload-table">
          <div className="ops-wl-header">
            <span>销售</span><span>商机数</span><span>客户数</span><span>商机金额</span>
          </div>
          {salesWorkload.map(s => (
            <div key={s.name} className="ops-wl-row">
              <span className="ops-wl-name">{s.name}</span>
              <span>{s.projects}</span>
              <span>{s.customers}</span>
              <span className="ops-wl-amount">¥{(s.amount / 10000).toFixed(0)}万</span>
            </div>
          ))}
        </div>
      </div>

      {/* 最近日报 */}
      <div className="ops-section">
        <h3 className="ops-section-title">最近日报动态</h3>
        <div className="ops-recent-reports">
          {recentReports.map(r => (
            <div key={r.id} className="ops-report-item">
              <div className="ops-report-meta">
                <span className="ops-report-user">{r.userName}</span>
                <span className="ops-report-date">{r.date}</span>
                {r.importSource === 'docx' && <span className="ops-report-tag">文档导入</span>}
              </div>
              <div className="ops-report-content">{r.workContent?.slice(0, 80)}{r.workContent?.length > 80 ? '...' : ''}</div>
            </div>
          ))}
          {recentReports.length === 0 && <div className="ops-empty">暂无日报数据</div>}
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;