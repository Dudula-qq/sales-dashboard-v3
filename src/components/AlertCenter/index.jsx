import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { alertApi } from '../../services/api';
import { emitDataChange } from '../../services/dataEvents';

const alertTypeConfig = {
  follow_missing: { label: '跟进缺失', color: '#fa8c16' },
  stage_stagnant: { label: '商机停滞', color: '#e8d44d' },
  ppl_insufficient: { label: 'PPL不足', color: '#f5222d' },
  project_abnormal: { label: '项目异常', color: '#722ed1' },
};

const AlertCenter = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [filterType, setFilterType] = useState('');
  const [filterSales, setFilterSales] = useState('');

  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    setLoading(true);
    const params = {};
    if (!isManager && user?.id) {
      params.salesId = user.id;
    }
    const data = await alertApi.getList(params);
    setAlerts(data);
    setLoading(false);
  };

  const pendingAlerts = alerts.filter(a => !a.handled && !a.ignored);
  const handledAlerts = alerts.filter(a => a.handled);

  const salesList = useMemo(() => {
    const names = new Set(alerts.map(a => a.salesName).filter(Boolean));
    return [...names];
  }, [alerts]);

  const displayedAlerts = (tab === 'pending' ? pendingAlerts : handledAlerts)
    .filter(a => !filterType || a.type === filterType)
    .filter(a => !filterSales || a.salesName === filterSales);

  const handleAlert = async (id) => {
    await alertApi.handle(id, user?.name || '未知');
    loadAlerts();
    emitDataChange('alert_changed');
  };

  const ignoreAlert = async (id) => {
    await alertApi.ignore(id);
    loadAlerts();
    emitDataChange('alert_changed');
  };

  // 统计各销售各类型数量
  const salesAlertMap = useMemo(() => {
    const map = {};
    pendingAlerts.forEach(a => {
      if (!map[a.salesName]) map[a.salesName] = { total: 0, types: {} };
      map[a.salesName].total++;
      map[a.salesName].types[a.type] = (map[a.salesName].types[a.type] || 0) + 1;
    });
    return map;
  }, [pendingAlerts]);

  // 不再用饼图，改用横向柱状图确保文字完整显示
  const statsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 40, top: 10, bottom: 10 },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: Object.entries(alertTypeConfig).map(([, cfg]) => cfg.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 14, color: '#333', fontWeight: 500, margin: 14 },
    },
    series: [{
      type: 'bar',
      barWidth: 18,
      barCategoryGap: '60%',
      data: Object.entries(alertTypeConfig).map(([key, cfg]) => ({
        value: pendingAlerts.filter(a => a.type === key).length,
        itemStyle: { color: cfg.color, borderRadius: [0, 8, 8, 0] },
      })),
      label: {
        show: true,
        position: 'right',
        formatter: '{c}条',
        fontSize: 14,
        color: '#333',
        fontWeight: 500,
      },
    }]
  };

  if (loading) return <div className="loading">加载中...</div>;

  const activeFilterCount = (filterType ? 1 : 0) + (filterSales ? 1 : 0);

  return (
    <div className="alert-center">
      {/* 顶部：概览统计 + 筛选 */}
      <div className="ac-overview">
        <div className="ac-overview-left">
          <div className="ac-total">
            <span className="ac-total-num">{pendingAlerts.length}</span>
            <span className="ac-total-label">条待处理告警</span>
          </div>
          <div className="ac-type-pills">
            {Object.entries(alertTypeConfig).map(([key, cfg]) => {
              const cnt = pendingAlerts.filter(a => a.type === key).length;
              return (
                <span
                  key={key}
                  className={`ac-pill ${filterType === key ? 'ac-pill-active' : ''}`}
                  style={filterType === key ? { background: cfg.color, color: '#fff' } : { borderColor: cfg.color, color: cfg.color }}
                  onClick={() => setFilterType(filterType === key ? '' : key)}
                >
                  {cfg.label} {cnt}
                </span>
              );
            })}
          </div>
          {isManager && (
            <div className="ac-sales-pills">
              {salesList.map(s => (
                <span
                  key={s}
                  className={`ac-pill ac-pill-sales ${filterSales === s ? 'ac-pill-active' : ''}`}
                  onClick={() => setFilterSales(filterSales === s ? '' : s)}
                >
                  {s} {salesAlertMap[s]?.total || 0}
                </span>
              ))}
            </div>
          )}
          {activeFilterCount > 0 && (
            <button className="ac-clear" onClick={() => { setFilterType(''); setFilterSales(''); }}>
              清除筛选
            </button>
          )}
        </div>
        <div className="ac-overview-right">
          <ReactECharts option={statsOption} style={{ height: '300px', width: '100%' }} />
        </div>
      </div>

      {/* 管理员：销售告警汇总 */}
      {isManager && Object.keys(salesAlertMap).length > 0 && (
        <div className="ac-sales-summary">
          {Object.entries(salesAlertMap).map(([name, data]) => (
            <div key={name} className="ac-ss-row">
              <div className="ac-ss-name">{name}</div>
              <div className="ac-ss-badges">
                {Object.entries(data.types).map(([type, cnt]) => {
                  const cfg = alertTypeConfig[type] || {};
                  return (
                    <span key={type} className="ac-ss-badge" style={{ background: cfg.color + '18', color: cfg.color, borderColor: cfg.color + '40' }}>
                      {cfg.label} {cnt}
                    </span>
                  );
                })}
              </div>
              <div className="ac-ss-total">{data.total}条待处理</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab */}
      <div className="ac-tabs">
        <button className={`ac-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          待处理 <span className="ac-tab-count">{pendingAlerts.length}</span>
        </button>
        <button className={`ac-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          已处理 <span className="ac-tab-count">{handledAlerts.length}</span>
        </button>
      </div>

      {/* 列表 */}
      <div className="ac-list">
        {displayedAlerts.length === 0 && <div className="empty-state">暂无告警</div>}
        {displayedAlerts.map(alert => {
          const cfg = alertTypeConfig[alert.type] || {};
          return (
            <div key={alert.id} className="ac-item">
              <div className="ac-item-indicator" style={{ background: cfg.color }} />
              <div className="ac-item-body">
                <div className="ac-item-head">
                  <span className="ac-item-type" style={{ color: cfg.color }}>{cfg.label || alert.typeName}</span>
                  {isManager && alert.salesName && <span className="ac-item-sales">{alert.salesName}</span>}
                  <span className="ac-item-time">{alert.time}</span>
                </div>
                <div className="ac-item-desc">{alert.object} — {alert.description}</div>
              </div>
              <div className="ac-item-action">
                {!isManager && tab === 'pending' ? (
                  <div className="ac-item-btns">
                    <button className="ac-btn ac-btn-done" onClick={() => handleAlert(alert.id)}>已处理</button>
                    <button className="ac-btn ac-btn-ignore" onClick={() => ignoreAlert(alert.id)}>忽略</button>
                  </div>
                ) : isManager && tab === 'pending' ? (
                  <span className="ac-badge-waiting">待处理</span>
                ) : (
                  <div className="ac-item-handled">
                    <span>{alert.handledBy}</span>
                    <span className="ac-item-htime">{alert.handledTime}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertCenter;
