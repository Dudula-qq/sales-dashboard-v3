import React, { useEffect, useState } from 'react';
import { dailyReportApi } from '../../services/api';

const DailyReportSummary = () => {
  const [summaries, setSummaries] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const summaryData = await dailyReportApi.getSummary();
    const reports = await dailyReportApi.getList();
    setSummaries(summaryData);
    setAllReports(reports);
    setLoading(false);
  };

  if (loading) {
    return <div className="empty-state">加载中...</div>;
  }

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
      <div className="card-title">
        <span>销售日报汇总</span>
      </div>

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {summaries.map(summary => (
          <div
            key={summary.userId}
            onClick={() => setSelectedUser(selectedUser === summary.userId ? null : summary.userId)}
            style={{
              background: selectedUser === summary.userId ? '#e6f7ff' : '#f9fafb',
              border: selectedUser === summary.userId ? '2px solid #1890ff' : '2px solid transparent',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: summary.userId === 2 ? '#1890ff' : '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {summary.userName.charAt(summary.userName.length - 1)}
              </div>
              <div>
                <div style={{ fontWeight: '500', fontSize: '16px' }}>{summary.userName}</div>
                <div style={{ color: '#999', fontSize: '13px' }}>日报数: {summary.totalReports}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 日报列表 */}
      <div style={{ marginTop: '24px' }}>
        <div className="form-section-title" style={{ marginBottom: '16px' }}>
          {selectedUser ? `${summaries.find(s => s.userId === selectedUser)?.userName} 的日报记录` : '全部日报记录'}
        </div>

        {(selectedUser ? allReports.filter(r => r.userId === selectedUser) : allReports).map(report => (
          <div
            key={report.id}
            style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              borderLeft: `4px solid ${report.userId === 2 ? '#1890ff' : '#52c41a'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  background: report.userId === 2 ? '#e6f7ff' : '#f6ffed',
                  color: report.userId === 2 ? '#1890ff' : '#52c41a',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {report.userName}
                </span>
                <span style={{ fontWeight: '500' }}>{report.date}</span>
              </div>
            </div>
            <div style={{ marginBottom: '8px', color: '#666' }}>
              <strong>工作内容:</strong> {report.workContent}
            </div>
            {report.customers && report.customers.length > 0 && (
              <div style={{ marginBottom: '8px', color: '#666' }}>
                <strong>跟进客户:</strong> {report.customers.join(', ')}
              </div>
            )}
            {report.nextPlan && (
              <div style={{ color: '#666' }}>
                <strong>后续计划:</strong> {report.nextPlan}
              </div>
            )}
          </div>
        ))}

        {(selectedUser ? allReports.filter(r => r.userId === selectedUser) : allReports).length === 0 && (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <div>暂无日报记录</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportSummary;
