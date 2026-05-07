import React, { useState, useEffect } from 'react';
import { dailyReportApi, customerApi } from '../../services/api';
import JSZip from 'jszip';

const DailyReportInput = ({ user }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workContent, setWorkContent] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [nextPlan, setNextPlan] = useState('');
  const [reports, setReports] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    loadCustomers();
    loadReports();
  }, []);

  const loadCustomers = async () => {
    const params = {};
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const { data } = await customerApi.getList(params);
    setCustomers(data);
  };

  const loadReports = async () => {
    // 只加载当前用户的日报
    const data = await dailyReportApi.getList({ userId: user?.id });
    setReports(data);
  };

  const handleCustomerToggle = (customerName) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerName)) {
        return prev.filter(c => c !== customerName);
      }
      return [...prev, customerName];
    });
  };

  const handleSubmit = async () => {
    if (!workContent.trim()) {
      setMessage('请输入工作内容');
      return;
    }

    setSaving(true);
    try {
      await dailyReportApi.add({
        date,
        workContent,
        customers: selectedCustomers,
        nextPlan
      }, user);
      setMessage('保存成功');
      setWorkContent('');
      setSelectedCustomers([]);
      setNextPlan('');
      loadReports();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('保存失败');
    }
    setSaving(false);
  };

  // 解析docx文件
  const parseDocx = async (file) => {
    setUploading(true);
    setUploadMessage('');

    try {
      const zip = new JSZip();
      const content = await file.arrayBuffer();
      const zipContent = await zip.loadAsync(content);

      // 读取word/document.xml
      const docXml = await zipContent.file('word/document.xml').async('string');

      // 提取纯文本内容
      const textContent = docXml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // 解析日报内容
      parseDailyReportContent(textContent);

      setUploadMessage('文档解析成功！');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage('');
      }, 1500);
    } catch (error) {
      console.error('解析文档失败:', error);
      setUploadMessage('解析文档失败，请确保上传的是有效的docx文件');
    }

    setUploading(false);
  };

  // 解析日报内容
  const parseDailyReportContent = (content) => {
    // 提取日期
    const dateMatch = content.match(/(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/);
    if (dateMatch) {
      const dateStr = dateMatch[1].replace(/[年月]/g, '-').replace('日', '');
      setDate(dateStr);
    }

    // 提取工作内容
    const workMatch = content.match(/工作内容[：:]\s*([^\n。]+。?[^\n。]*。?)/);
    if (workMatch) {
      setWorkContent(workMatch[1].trim());
    } else {
      // 尝试智能提取主要内容
      const sentences = content.split(/[。\n]/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        setWorkContent(sentences.slice(0, 3).join('。'));
      }
    }

    // 提取明日计划
    const planMatch = content.match(/明日计划|下周计划|后续计划[：:]\s*([^\n。]+。?[^\n。]*。?)/);
    if (planMatch) {
      setNextPlan(planMatch[1].trim());
    }

    // 提取跟进客户
    const matchedCustomers = [];
    customers.forEach(c => {
      if (content.includes(c.name)) {
        matchedCustomers.push(c.name);
      }
    });
    if (matchedCustomers.length > 0) {
      setSelectedCustomers(matchedCustomers);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        parseDocx(file);
      } else {
        setUploadMessage('请上传.docx格式的文件');
      }
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
      <div className="card-title">
        <span>日报录入 - {user?.name}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
          导入文档
        </button>
      </div>

      <div className="form-section">
        <label className="form-section-title">日期</label>
        <input
          type="date"
          className="form-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="form-section-title">工作内容</label>
        <textarea
          className="form-textarea"
          placeholder="请输入今日工作内容..."
          value={workContent}
          onChange={(e) => setWorkContent(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="form-section-title">跟进客户</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {customers.map(customer => (
            <label
              key={customer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: selectedCustomers.includes(customer.name) ? '#e6f7ff' : '#f5f5f5',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <input
                type="checkbox"
                checked={selectedCustomers.includes(customer.name)}
                onChange={() => handleCustomerToggle(customer.name)}
              />
              {customer.name}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="form-section-title">明日计划</label>
        <textarea
          className="form-textarea"
          placeholder="请输入明日工作计划..."
          value={nextPlan}
          onChange={(e) => setNextPlan(e.target.value)}
          style={{ minHeight: '80px' }}
        />
      </div>

      {message && (
        <div style={{
          padding: '12px',
          background: message.includes('成功') ? '#f6ffed' : '#fff1f0',
          borderRadius: '4px',
          marginBottom: '16px',
          color: message.includes('成功') ? '#52c41a' : '#f5222d'
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? '保存中...' : '提交日报'}
        </button>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div className="form-section-title">我的历史日报</div>
        {reports.map(report => (
          <div
            key={report.id}
            style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: '500' }}>{report.date}</span>
            </div>
            <div style={{ marginBottom: '8px', color: '#666' }}>
              <strong>工作内容:</strong> {report.workContent}
            </div>
            {report.customers.length > 0 && (
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
      </div>

      {/* 上传弹窗 */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">导入日报文档</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>

            <div style={{ padding: '20px 0' }}>
              <div
                style={{
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: '#fafafa'
                }}
                onClick={() => document.getElementById('daily-docx-upload').click()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <div style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>点击或拖拽文件到此区域上传</div>
                <div style={{ fontSize: '13px', color: '#999' }}>仅支持 .docx 格式文件</div>
                <input
                  id="daily-docx-upload"
                  type="file"
                  accept=".docx"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>

              {uploading && (
                <div style={{ textAlign: 'center', marginTop: '16px', color: '#1890ff' }}>
                  正在解析文档...
                </div>
              )}

              {uploadMessage && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '16px',
                  padding: '12px',
                  background: uploadMessage.includes('成功') ? '#f6ffed' : '#fff1f0',
                  borderRadius: '4px',
                  color: uploadMessage.includes('成功') ? '#52c41a' : '#f5222d'
                }}>
                  {uploadMessage}
                </div>
              )}

              <div style={{ marginTop: '16px', padding: '12px', background: '#e6f7ff', borderRadius: '4px', fontSize: '13px', color: '#666' }}>
                <strong>提示：</strong>系统会自动识别文档中的日期、工作内容、跟进客户和明日计划，并填充到表单中。
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowUploadModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportInput;
