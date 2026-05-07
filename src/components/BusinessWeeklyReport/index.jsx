import React, { useEffect, useState } from 'react';
import { weeklyReportApi } from '../../services/api';

const BusinessWeeklyReport = ({ standalone }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    summary: '',
    nextWeekPlan: '',
    newCustomers: 0,
    followUpCount: 0,
    dealAmount: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    const data = await weeklyReportApi.getLatest();
    setReport(data);
    if (data) {
      setEditForm({
        summary: data.summary || '',
        nextWeekPlan: data.nextWeekPlan || '',
        newCustomers: data.keyMetrics?.newCustomers || 0,
        followUpCount: data.keyMetrics?.followUpCount || 0,
        dealAmount: data.keyMetrics?.dealAmount || 0,
        conversionRate: data.keyMetrics?.conversionRate || 0
      });
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSave = async () => {
    const updatedReport = {
      ...report,
      summary: editForm.summary,
      nextWeekPlan: editForm.nextWeekPlan,
      keyMetrics: {
        newCustomers: editForm.newCustomers,
        followUpCount: editForm.followUpCount,
        dealAmount: editForm.dealAmount,
        conversionRate: editForm.conversionRate
      }
    };
    await weeklyReportApi.update(updatedReport);
    setReport(updatedReport);
    setShowEditModal(false);
  };

  if (loading) {
    return <div className="empty-state">加载中...</div>;
  }

  if (!report) {
    return (
      <div style={{ background: standalone ? '#fff' : 'transparent', borderRadius: '8px', padding: standalone ? '24px' : '0' }}>
        {standalone && <div className="card-title">周报汇总</div>}
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div>暂无周报数据</div>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => {
            setReport({
              id: Date.now(),
              weekStart: getWeekStart(),
              weekEnd: getWeekEnd(),
              summary: '',
              keyMetrics: { newCustomers: 0, followUpCount: 0, dealAmount: 0, conversionRate: 0 },
              nextWeekPlan: ''
            });
            setShowEditModal(true);
          }}>
            创建周报
          </button>
        </div>
      </div>
    );
  }

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    return monday.toISOString().split('T')[0];
  };

  const getWeekEnd = () => {
    const now = new Date();
    const day = now.getDay() || 7;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day + 7);
    return sunday.toISOString().split('T')[0];
  };

  return (
    <div style={{ background: standalone ? '#fff' : 'transparent', borderRadius: '8px', padding: standalone ? '24px' : '0' }}>
      <div className="card-title" style={{ marginBottom: '16px' }}>
        <span>周报汇总</span>
        <button className="btn btn-primary btn-sm" onClick={handleEdit}>
          更新周报文档
        </button>
      </div>

      <div className="report-header" style={{ marginBottom: '16px' }}>
        <span style={{ fontWeight: '500' }}>本周工作汇报</span>
        <span className="report-date">{report.weekStart} ~ {report.weekEnd}</span>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: standalone ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '16px' }}>
          <div className="metric-value" style={{ fontSize: '24px' }}>{report.keyMetrics.newCustomers}</div>
          <div className="metric-label">新增客户</div>
        </div>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '16px' }}>
          <div className="metric-value" style={{ fontSize: '24px' }}>{report.keyMetrics.followUpCount}</div>
          <div className="metric-label">跟进次数</div>
        </div>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '16px' }}>
          <div className="metric-value" style={{ fontSize: '24px' }}>{(report.keyMetrics.dealAmount / 10000).toFixed(1)}万</div>
          <div className="metric-label">成交金额</div>
        </div>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '16px' }}>
          <div className="metric-value" style={{ fontSize: '24px' }}>{report.keyMetrics.conversionRate}%</div>
          <div className="metric-label">转化率</div>
        </div>
      </div>

      <div className="report-section" style={{ marginBottom: '12px' }}>
        <div className="report-section-title">本周工作总结</div>
        <div className="report-content" style={{ padding: '12px' }}>
          {report.summary || '暂无内容'}
        </div>
      </div>

      <div className="report-section">
        <div className="report-section-title">下周工作计划</div>
        <div className="report-content" style={{ padding: '12px' }}>
          {report.nextWeekPlan || '暂无内容'}
        </div>
      </div>

      {/* 编辑弹窗 */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">更新周报文档</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>关键指标</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#666' }}>新增客户</label>
                  <input
                    type="number"
                    value={editForm.newCustomers}
                    onChange={(e) => setEditForm({ ...editForm, newCustomers: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#666' }}>跟进次数</label>
                  <input
                    type="number"
                    value={editForm.followUpCount}
                    onChange={(e) => setEditForm({ ...editForm, followUpCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#666' }}>成交金额（元）</label>
                  <input
                    type="number"
                    value={editForm.dealAmount}
                    onChange={(e) => setEditForm({ ...editForm, dealAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#666' }}>转化率（%）</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.conversionRate}
                    onChange={(e) => setEditForm({ ...editForm, conversionRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>本周工作总结</label>
              <textarea
                value={editForm.summary}
                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                placeholder="请输入本周工作总结..."
                style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>下周工作计划</label>
              <textarea
                value={editForm.nextWeekPlan}
                onChange={(e) => setEditForm({ ...editForm, nextWeekPlan: e.target.value })}
                placeholder="请输入下周工作计划..."
                style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowEditModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessWeeklyReport;
