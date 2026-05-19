import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { projectApi, customerApi } from '../../services/api';

const OpsProject = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projRes, custRes] = await Promise.all([
      projectApi.getList(),
      customerApi.getList(),
    ]);
    setProjects(projRes.data);
    setCustomers(custRes.data);
    setLoading(false);
  };

  if (loading) return <div className="loading">加载中...</div>;

  const filteredProjects = projects.filter(p => {
    if (filterStage && p.stage !== filterStage) return false;
    if (keyword && !p.name.includes(keyword) && !p.customer.includes(keyword)) return false;
    return true;
  });

  // 统计数据
  const totalProjects = filteredProjects.length;
  const totalAmount = filteredProjects.reduce((s, p) => s + (p.amount || 0), 0);
  const stageStats = [
    { code: 'S1', name: '机会确认' },
    { code: 'S2', name: '建立关系' },
    { code: 'S3', name: '提出方案' },
    { code: 'S4', name: '达成协议' },
    { code: 'S5', name: '签署合同' },
    { code: 'S6+', name: '交付验收' },
  ].map(s => ({
    ...s,
    count: s.code === 'S6+' ? filteredProjects.filter(p => ['S6','S7','S8'].includes(p.stage)).length : filteredProjects.filter(p => p.stage === s.code).length,
    amount: s.code === 'S6+' ? filteredProjects.filter(p => ['S6','S7','S8'].includes(p.stage)).reduce((s,p) => s + (p.amount||0), 0) : filteredProjects.filter(p => p.stage === s.code).reduce((s,p) => s + (p.amount||0), 0),
  }));

  // 按销售统计
  const salesStats = (() => {
    const map = {};
    filteredProjects.forEach(p => {
      if (!map[p.salesName]) map[p.salesName] = { count: 0, amount: 0, customers: new Set() };
      map[p.salesName].count += 1;
      map[p.salesName].amount += (p.amount || 0);
      map[p.salesName].customers.add(p.customer);
    });
    return Object.entries(map).map(([name, d]) => ({ name, count: d.count, amount: d.amount, customers: d.customers.size }));
  })();

  const stages = [
    { code: 'S1', name: '机会确认', color: '#e3f2fd' },
    { code: 'S2', name: '建立关系', color: '#e8f5e9' },
    { code: 'S3', name: '提出方案', color: '#fff3e0' },
    { code: 'S4', name: '达成协议', color: '#fce4ec' },
    { code: 'S5', name: '签署合同', color: '#f3e5f5' },
    { code: 'S6', name: '交付验收', color: '#e0f2f1' },
    { code: 'S7', name: '验收完成', color: '#e8eaf6' },
    { code: 'S8', name: '完成回款', color: '#fce4ec' },
  ];

  return (
    <div className="ops-project">
      <div className="ops-dash-header">
        <h2>项目跟进</h2>
        <span className="ops-count">共 {totalProjects} 个项目 | 总金额 ¥{(totalAmount / 10000).toFixed(0)}万</span>
      </div>

      {/* 筛选 */}
      <div className="toolbar">
        <input type="text" className="search-input" placeholder="搜索项目或客户..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <select className="filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="">全部阶段</option>
          {stages.map(s => <option key={s.code} value={s.code}>{s.code} {s.name}</option>)}
        </select>
      </div>

      {/* 阶段分布柱状图 */}
      <div className="ops-section">
        <h3 className="ops-section-title">各阶段项目分布</h3>
        <ReactECharts option={{
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: stageStats.map(s => s.code + ' ' + s.name), axisLabel: { fontSize: 11 } },
          yAxis: [
            { type: 'value', name: '项目数', position: 'left' },
            { type: 'value', name: '金额(万)', position: 'right' },
          ],
          series: [
            { name: '项目数', type: 'bar', data: stageStats.map(s => s.count), itemStyle: { color: '#1890ff', borderRadius: [4,4,0,0] } },
            { name: '金额', type: 'bar', yAxisIndex: 1, data: stageStats.map(s => (s.amount / 10000).toFixed(0)), itemStyle: { color: '#52c41a', borderRadius: [4,4,0,0] } },
          ],
          grid: { left: 60, right: 60, bottom: 30, top: 40 },
        }} style={{ height: 280 }} />
      </div>

      {/* 销售工作量 */}
      <div className="ops-section">
        <h3 className="ops-section-title">销售人员工作量</h3>
        <div className="ops-workload-table">
          <div className="ops-wl-header">
            <span>销售</span><span>商机数</span><span>客户数</span><span>金额</span>
          </div>
          {salesStats.map(s => (
            <div key={s.name} className="ops-wl-row">
              <span className="ops-wl-name">{s.name}</span>
              <span>{s.count}</span>
              <span>{s.customers}</span>
              <span className="ops-wl-amount">¥{(s.amount / 10000).toFixed(0)}万</span>
            </div>
          ))}
        </div>
      </div>

      {/* 项目列表 */}
      <div className="ops-section">
        <h3 className="ops-section-title">项目明细</h3>
        <div className="ops-project-list">
          {filteredProjects.map(p => {
            const stage = stages.find(s => s.code === p.stage);
            const customer = customers.find(c => c.name === p.customer);
            return (
              <div key={p.id} className="ops-project-card" style={{ borderLeftColor: stage ? stage.color.replace('#', '#333') : '#d9d9d9' }}>
                <div className="ops-pc-row1">
                  <span className="ops-pc-name">{p.name}</span>
                  <span className="ops-pc-stage" style={{ background: stage?.color || '#f5f5f5' }}>{p.stage}</span>
                  {customer?.grade && <span className="ops-pc-grade">{customer.grade}</span>}
                </div>
                <div className="ops-pc-row2">
                  <span>{p.customer}</span>
                  <span className="ops-pc-amount">¥{((p.amount || 0) / 10000).toFixed(0)}万</span>
                  <span>{p.salesName}</span>
                  {p.expectedClose && <span className="ops-pc-close">预计{p.expectedClose}</span>}
                </div>
              </div>
            );
          })}
          {filteredProjects.length === 0 && <div className="ops-empty">暂无项目数据</div>}
        </div>
      </div>
    </div>
  );
};

export default OpsProject;