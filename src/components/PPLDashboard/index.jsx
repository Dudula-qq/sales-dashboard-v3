import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { pplApi } from '../../services/api';
import { emitDataChange, onDataChange } from '../../services/dataEvents';

const PPLDashboard = ({ user }) => {
  const [health, setHealth] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
    const off = onDataChange('ppl_changed', loadData);
    return off;
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [h, t] = await Promise.all([pplApi.getHealth(), pplApi.getTrend()]);
    setHealth(h);
    setTrend(t);
    setLoading(false);
  };

  const formatMoney = (v) => {
    if (v >= 10000) return (v / 10000).toFixed(0) + '万';
    return v.toLocaleString();
  };

  const startEdit = () => {
    setEditForm({
      currentPPL: health?.currentPPL || 0,
      kpiTarget: health?.kpiTarget || 0,
      kpiProbability: health?.kpiProbability || 0,
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    await pplApi.updateHealth(editForm);
    emitDataChange('ppl_changed');
    await loadData();
    setEditing(false);
  };

  const trendOption = trend ? {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PPL', 'KPI目标'] },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: trend.monthlyTrend.map(m => m.month) },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v / 10000) + '万' } },
    series: [
      { name: 'PPL', type: 'line', data: trend.monthlyTrend.map(m => m.ppl), smooth: true, itemStyle: { color: '#1890ff' }, areaStyle: { color: 'rgba(24,144,255,0.1)' } },
      { name: 'KPI目标', type: 'line', data: trend.monthlyTrend.map(m => m.kpi), itemStyle: { color: '#f5222d' }, lineStyle: { type: 'dashed' } },
    ]
  } : null;

  const salesOption = trend ? {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PPL', 'KPI'] },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: trend.bySales.map(s => s.name) },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v / 10000) + '万' } },
    series: [
      { name: 'PPL', type: 'bar', data: trend.bySales.map(s => s.ppl), itemStyle: { color: '#1890ff' } },
      { name: 'KPI', type: 'bar', data: trend.bySales.map(s => s.kpi), itemStyle: { color: '#f5222d' } },
    ]
  } : null;

  const stageOption = trend ? {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: trend.byStage.filter(s => s.value > 0).map(s => ({ name: s.name, value: s.value })),
      label: { formatter: '{b}\n{d}%' },
    }]
  } : null;

  if (loading) return <div className="loading">加载中...</div>;

  const isHealthy = health?.healthRatio >= 3;

  return (
    <div className="ppl-dashboard">
      <div className="board-header">
        <h2>PPL管理</h2>
      </div>
      <div className="ppl-indicators">
        {editing ? (
          <>
            <div className="ppl-indicator-card">
              <div className="pic-label">当前PPL总额</div>
              <input className="ppl-edit-input" type="number" value={editForm.currentPPL}
                onChange={e => setEditForm({...editForm, currentPPL: Number(e.target.value)})} />
            </div>
            <div className="ppl-indicator-card">
              <div className="pic-label">KPI目标</div>
              <input className="ppl-edit-input" type="number" value={editForm.kpiTarget}
                onChange={e => setEditForm({...editForm, kpiTarget: Number(e.target.value)})} />
            </div>
            <div className="ppl-indicator-card">
              <div className="pic-label">KPI达成概率(%)</div>
              <input className="ppl-edit-input" type="number" value={editForm.kpiProbability}
                onChange={e => setEditForm({...editForm, kpiProbability: Number(e.target.value)})} />
            </div>
            <div className="ppl-indicator-card ppl-edit-actions-card">
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>保存</button>
              <button className="btn btn-default btn-sm" onClick={() => setEditing(false)}>取消</button>
            </div>
          </>
        ) : (
          <>
            <div className="ppl-indicator-card">
              <div className="pic-label">当前PPL总额</div>
              <div className="pic-value">¥{formatMoney(health?.currentPPL || 0)}</div>
            </div>
            <div className="ppl-indicator-card">
              <div className="pic-label">KPI目标</div>
              <div className="pic-value">¥{formatMoney(health?.kpiTarget || 0)}</div>
            </div>
            <div className="ppl-indicator-card">
              <div className="pic-label">PPL/KPI倍数</div>
              <div className={`pic-value ${isHealthy ? 'text-success' : 'text-danger'}`}>{health?.healthRatio?.toFixed(2)}x</div>
              {!isHealthy && <div className="pic-alert">PPL不足3倍KPI，请关注！</div>}
            </div>
            <div className="ppl-indicator-card">
              <div className="pic-label">KPI达成概率</div>
              <div className="pic-value">{health?.kpiProbability}%</div>
              <div className="pic-sub">AI预测</div>
            </div>
            <div className="ppl-indicator-card ppl-edit-actions-card">
              <button className="btn btn-primary btn-sm" onClick={startEdit}>编辑数据</button>
            </div>
          </>
        )}
      </div>
      {!isHealthy && (
        <div className="ppl-alert-banner">
          <span className="alert-icon">!</span>
          <span>PPL总额不足3倍KPI目标，建议加大商机拓展力度！当前倍数：{health?.healthRatio?.toFixed(2)}x</span>
        </div>
      )}
      <div className="ppl-charts-row">
        <div className="ppl-chart-card">
          <h4>PPL趋势</h4>
          {trendOption && <ReactECharts option={trendOption} style={{ height: 300 }} />}
        </div>
        <div className="ppl-chart-card">
          <h4>各销售PPL</h4>
          {salesOption && <ReactECharts option={salesOption} style={{ height: 300 }} />}
        </div>
      </div>
      <div className="ppl-charts-row">
        <div className="ppl-chart-card">
          <h4>PPL阶段分布</h4>
          {stageOption && <ReactECharts option={stageOption} style={{ height: 300 }} />}
        </div>
      </div>
    </div>
  );
};

export default PPLDashboard;
