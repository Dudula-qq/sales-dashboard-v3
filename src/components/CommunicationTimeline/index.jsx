import React, { useEffect, useState } from 'react';
import { communicationApi } from '../../services/api';

const CommunicationTimeline = ({ standalone }) => {
  const [communications, setCommunications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    customerName: '',
    type: '电话',
    content: '',
    contact: ''
  });

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    const data = await communicationApi.getList();
    setCommunications(data);
  };

  const handleAdd = async () => {
    if (!newRecord.customerName.trim() || !newRecord.content.trim()) return;
    await communicationApi.add({
      ...newRecord,
      customerId: 0 // 模拟新客户ID
    });
    setNewRecord({ customerName: '', type: '电话', content: '', contact: '' });
    setShowAddForm(false);
    loadCommunications();
  };

  const typeColors = {
    '电话': '#1890ff',
    '邮件': '#52c41a',
    '会议': '#722ed1',
    '拜访': '#fa8c16'
  };

  return (
    <div style={{ background: standalone ? '#fff' : 'transparent', borderRadius: '8px', padding: standalone ? '24px' : '0' }}>
      <div className="card-title">
        <span>沟通记录</span>
        <button className="btn btn-sm btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          + 添加
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="客户名称..."
            value={newRecord.customerName}
            onChange={(e) => setNewRecord({ ...newRecord, customerName: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <select
              value={newRecord.type}
              onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
              style={{ padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px' }}
            >
              <option value="电话">电话</option>
              <option value="邮件">邮件</option>
              <option value="会议">会议</option>
              <option value="拜访">拜访</option>
            </select>
            <input
              type="text"
              placeholder="联系人..."
              value={newRecord.contact}
              onChange={(e) => setNewRecord({ ...newRecord, contact: e.target.value })}
              style={{ flex: 1, padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px' }}
            />
          </div>
          <textarea
            placeholder="沟通内容..."
            value={newRecord.content}
            onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              minHeight: '80px',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>保存</button>
            <button className="btn btn-default btn-sm" onClick={() => setShowAddForm(false)}>取消</button>
          </div>
        </div>
      )}

      <div className="timeline">
        {communications.slice(0, standalone ? 100 : 5).map(record => (
          <div key={record.id} className="timeline-item">
            <div className="timeline-date">{record.date}</div>
            <div className="timeline-content">
              <div className="timeline-customer">
                <span
                  className="timeline-type"
                  style={{ background: typeColors[record.type] || '#1890ff' }}
                >
                  {record.type}
                </span>
                {record.customerName}
                <span style={{ color: '#999', marginLeft: '8px' }}>{record.contact}</span>
              </div>
              <div className="timeline-desc">{record.content}</div>
            </div>
          </div>
        ))}

        {communications.length === 0 && (
          <div className="empty-state" style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <div>暂无沟通记录</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationTimeline;
