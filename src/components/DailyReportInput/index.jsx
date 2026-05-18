import React, { useState, useEffect, useRef } from 'react';
import { dailyReportApi, customerApi, projectApi } from '../../services/api';
import { getProjectStages } from '../../services/api';
import { emitDataChange } from '../../services/dataEvents';
import JSZip from 'jszip';

const COMM_TYPES = [
  { key: 'visit', label: '拜访' },
  { key: 'phone', label: '电话沟通' },
  { key: 'meeting', label: '会议' },
];

const FIVE_ELEMENTS = ['时间', '地点', '人物', '沟通内容', '关键结论'];

const DailyReportInput = ({ user }) => {
  const [inputMode, setInputMode] = useState('form');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reports, setReports] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 表单录入字段
  const [entries, setEntries] = useState([{ id: Date.now() }]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const projectStages = getProjectStages();

  // 文档导入
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // AI对话录入
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '你好！我是日报录入助手。请用自然语言描述你今天的工作，我会帮你提取关键信息并生成日报。例如："今天下午2点在朝阳大厦拜访了张总，讨论了云存储方案，张总对方案很感兴趣，约定下周出报价方案。"' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadCustomers();
    loadProjects();
    loadReports();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadCustomers = async () => {
    const params = {};
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const { data } = await customerApi.getList(params);
    setCustomers(data);
  };

  const loadProjects = async () => {
    const params = user?.role === 'sales' ? { salesId: user.id } : {};
    const { data } = await projectApi.getList(params);
    setProjects(data);
  };

  const loadReports = async () => {
    const data = await dailyReportApi.getList({ userId: user?.id });
    setReports(data);
  };

  // ========== 表单录入 ==========
  const updateEntry = (id, field, value) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { id: Date.now() }]);
  };

  const removeEntry = (id) => {
    if (entries.length <= 1) return;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleFormSubmit = async () => {
    const validEntries = entries.filter(e => e.content || e.location || e.person);
    if (validEntries.length === 0) {
      setMessage('请至少填写一条工作记录');
      return;
    }
    setSaving(true);
    try {
      for (const entry of validEntries) {
        await dailyReportApi.add({
          date,
          workContent: `【${entry.commType || '拜访'}】${entry.companyName ? entry.companyName + ' | ' : ''}${entry.customerStatus ? '阶段:' + entry.customerStatus + ' | ' : ''}${entry.location || ''} - ${entry.person || ''} - ${entry.content || ''}`,
          customers: entry.customer ? [entry.customer] : [],
          nextPlan: entry.conclusion || ''
        }, user);
      }
      setMessage('提交成功！');
      setEntries([{ id: Date.now() }]);
      loadReports();
      emitDataChange('customer_changed');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('提交失败');
    }
    setSaving(false);
  };

  // ========== 昨日日报导入 ==========
  const handleImportYesterday = () => {
    if (reports.length === 0) {
      setMessage('暂无历史日报可导入');
      return;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const yesterdayReports = reports.filter(r => r.date === yStr);
    if (yesterdayReports.length === 0) {
      // 取最近一条
      const latest = reports[0];
      if (latest) {
        setEntries([{ id: Date.now(), content: latest.workContent, conclusion: latest.nextPlan, customer: latest.customers?.[0] || '' }]);
        setMessage('已导入最近一条日报内容');
      } else {
        setMessage('暂无可导入的日报');
      }
    } else {
      const newEntries = yesterdayReports.map(r => ({
        id: Date.now() + Math.random(),
        content: r.workContent,
        conclusion: r.nextPlan,
        customer: r.customers?.[0] || '',
        commType: 'visit'
      }));
      setEntries(newEntries);
      setMessage(`已导入${newEntries.length}条昨日日报`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // ========== 文档导入 ==========
  const parseDocx = async (file) => {
    setUploading(true);
    setUploadMessage('');
    try {
      const zip = new JSZip();
      const content = await file.arrayBuffer();
      const zipContent = await zip.loadAsync(content);
      const docXml = await zipContent.file('word/document.xml').async('string');
      const textContent = docXml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      const dateMatch = textContent.match(/(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/);
      if (dateMatch) {
        setDate(dateMatch[1].replace(/[年月]/g, '-').replace('日', ''));
      }

      const sentences = textContent.split(/[。\n]/).filter(s => s.trim().length > 5);
      if (sentences.length > 0) {
        const parsedEntries = sentences.slice(0, 5).map((s, i) => ({
          id: Date.now() + i,
          content: s.trim(),
          commType: s.includes('电话') ? 'phone' : s.includes('会议') ? 'meeting' : 'visit'
        }));
        setEntries(parsedEntries);
      }

      const matchedCustomers = [];
      customers.forEach(c => {
        if (textContent.includes(c.name)) {
          matchedCustomers.push(c.name);
        }
      });
      if (matchedCustomers.length > 0) {
        setEntries(prev => prev.map((e, i) => i === 0 ? { ...e, customer: matchedCustomers[0] } : e));
      }

      setUploadMessage('文档解析成功！');
      setInputMode('form');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage('');
      }, 1500);
    } catch (error) {
      setUploadMessage('解析文档失败，请确保上传有效的docx文件');
    }
    setUploading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        parseDocx(file);
      } else {
        setUploadMessage('请上传.docx格式文件');
      }
    }
  };

  // ========== AI对话录入 ==========
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatSending(true);

    // 模拟AI解析
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    const input = chatInput;

    // 简单的NLP解析
    const timeMatch = input.match(/(\d{1,2})[点时:：](\d{0,2})/);
    const locationMatch = input.match(/在(.+?)(?:拜访|见|访问|沟通|开会)/);
    const personMatch = input.match(/(?:拜访|见|沟通|联系)了?(\S+?)(?:，|。|讨论|聊|谈|$)/);

    const extracted = {
      time: timeMatch ? `${timeMatch[1]}:${timeMatch[2] || '00'}` : '',
      location: locationMatch ? locationMatch[1].trim() : '',
      person: personMatch ? personMatch[1].trim() : '',
      content: input,
    };

    // 匹配客户
    let matchedCustomer = '';
    customers.forEach(c => {
      if (input.includes(c.name)) matchedCustomer = c.name;
    });

    const missing = [];
    if (!extracted.time) missing.push('时间');
    if (!extracted.location) missing.push('地点');
    if (!extracted.person) missing.push('人物');

    let aiReply = '';
    if (missing.length > 0) {
      aiReply = `我已提取到以下信息：\n${extracted.time ? `- 时间：${extracted.time}\n` : ''}${extracted.location ? `- 地点：${extracted.location}\n` : ''}${extracted.person ? `- 人物：${extracted.person}\n` : ''}${matchedCustomer ? `- 客户：${matchedCustomer}\n` : ''}\n还缺少以下信息：${missing.join('、')}，请补充完整后我将自动生成日报条目。`;
    } else {
      aiReply = `已提取完整信息：\n- 时间：${extracted.time}\n- 地点：${extracted.location}\n- 人物：${extracted.person}\n- 内容：${input.slice(0, 50)}...${matchedCustomer ? `\n- 关联客户：${matchedCustomer}` : ''}\n\n信息已完整，已自动生成日报条目。你可以在"表单录入"中查看和修改。`;

      // 自动填充到表单
      setEntries(prev => [...prev, {
        id: Date.now(),
        commType: input.includes('电话') ? 'phone' : input.includes('会议') ? 'meeting' : 'visit',
        time: extracted.time,
        location: extracted.location,
        person: extracted.person,
        content: input,
        conclusion: '',
        customer: matchedCustomer
      }]);
    }

    setChatMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
    setChatSending(false);
  };

  // ========== 渲染 ==========
  return (
    <div className="daily-report-v3">
      <div className="drv3-header">
        <span className="drv3-title">日报管理</span>
        <span className="drv3-user">{user?.name}</span>
      </div>

      {/* 录入方式切换Tab */}
      <div className="drv3-mode-tabs">
        <button className={`drv3-mode-tab ${inputMode === 'form' ? 'active' : ''}`} onClick={() => setInputMode('form')}>
          表单录入
        </button>
        <button className={`drv3-mode-tab ${inputMode === 'ai' ? 'active' : ''}`} onClick={() => setInputMode('ai')}>
          AI对话录入
        </button>
        <button className={`drv3-mode-tab ${inputMode === 'import' ? 'active' : ''}`} onClick={() => setInputMode('import')}>
          文档导入
        </button>
        <button className="drv3-mode-tab drv3-mode-tab-yesterday" onClick={handleImportYesterday}>
          导入昨日日报
        </button>
      </div>

      {/* 日期选择 */}
      <div className="drv3-date-bar">
        <label>日期：</label>
        <input type="date" className="form-date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {message && (
        <div className={`drv3-msg ${message.includes('成功') || message.includes('导入') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* === 表单录入模式 === */}
      {inputMode === 'form' && (
        <div className="drv3-form-mode">
          <div className="drv3-five-hint">
            <span className="drv3-fh-title">日报五要素</span>
            {FIVE_ELEMENTS.map(el => (
              <span key={el} className="drv3-fh-tag">{el}</span>
            ))}
          </div>

          {entries.map((entry, idx) => (
            <div key={entry.id} className="drv3-entry-card">
              <div className="drv3-entry-head">
                <span className="drv3-entry-num">工作记录 #{idx + 1}</span>
                {entries.length > 1 && (
                  <button className="drv3-entry-del" onClick={() => removeEntry(entry.id)}>删除</button>
                )}
              </div>

              <div className="drv3-entry-row">
                {/* 沟通类型 */}
                <div className="drv3-field drv3-field-ctype">
                  <label>沟通类型</label>
                  <div className="drv3-ctype-group">
                    {COMM_TYPES.map(ct => (
                      <button key={ct.key}
                        className={`drv3-ctype-btn ${entry.commType === ct.key ? 'active' : ''}`}
                        onClick={() => updateEntry(entry.id, 'commType', ct.key)}>
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="drv3-entry-row drv3-entry-row-3">
                <div className="drv3-field">
                  <label>客户公司名称</label>
                  <input className="drv3-input" placeholder="如：某某科技有限公司"
                    value={entry.companyName || ''}
                    onChange={e => updateEntry(entry.id, 'companyName', e.target.value)} />
                </div>
                <div className="drv3-field">
                  <label>项目名称</label>
                  <select className="drv3-select" value={entry.projectName || ''}
                    onChange={e => updateEntry(entry.id, 'projectName', e.target.value)}>
                    <option value="">选择项目（可选）</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="drv3-field">
                  <label>客户当前阶段</label>
                  <select className="drv3-select" value={entry.customerStatus || ''}
                    onChange={e => updateEntry(entry.id, 'customerStatus', e.target.value)}>
                    <option value="">选择阶段（可选）</option>
                    {projectStages.map(s => (
                      <option key={s.code} value={s.name}>{s.code} {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="drv3-entry-row drv3-entry-row-3">
                <div className="drv3-field">
                  <label>时间</label>
                  <input type="time" className="drv3-input" value={entry.time || ''}
                    onChange={e => updateEntry(entry.id, 'time', e.target.value)} />
                </div>
                <div className="drv3-field">
                  <label>地点</label>
                  <input className="drv3-input" placeholder="如：朝阳大厦"
                    value={entry.location || ''}
                    onChange={e => updateEntry(entry.id, 'location', e.target.value)} />
                </div>
                <div className="drv3-field">
                  <label>人物</label>
                  <input className="drv3-input" placeholder="如：张总"
                    value={entry.person || ''}
                    onChange={e => updateEntry(entry.id, 'person', e.target.value)} />
                </div>
              </div>

              <div className="drv3-entry-row">
                <div className="drv3-field drv3-field-full">
                  <label>沟通内容</label>
                  <textarea className="drv3-textarea" placeholder="请描述沟通的具体内容..."
                    value={entry.content || ''}
                    onChange={e => updateEntry(entry.id, 'content', e.target.value)} />
                </div>
              </div>

              <div className="drv3-entry-row">
                <div className="drv3-field drv3-field-full">
                  <label>关键结论 / 下一步</label>
                  <textarea className="drv3-textarea drv3-textarea-sm" placeholder="如：约定下周出报价方案"
                    value={entry.conclusion || ''}
                    onChange={e => updateEntry(entry.id, 'conclusion', e.target.value)} />
                </div>
              </div>

              <div className="drv3-entry-row">
                <div className="drv3-field drv3-field-full">
                  <label>关联客户</label>
                  <select className="drv3-select" value={entry.customer || ''}
                    onChange={e => updateEntry(entry.id, 'customer', e.target.value)}>
                    <option value="">选择关联客户（可选）</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button className="btn btn-primary drv3-add-entry" onClick={addEntry}>
            + 添加工作记录
          </button>

          <div className="drv3-actions">
            <button className="btn btn-primary btn-lg" onClick={handleFormSubmit} disabled={saving}>
              {saving ? '提交中...' : '提交日报'}
            </button>
            <button className="btn btn-default" onClick={() => setShowUploadModal(true)}>
              导入docx文档
            </button>
          </div>
        </div>
      )}

      {/* === AI对话录入模式 === */}
      {inputMode === 'ai' && (
        <div className="drv3-ai-mode">
          <div className="drv3-ai-chat">
            <div className="drv3-chat-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`drv3-chat-msg ${msg.role}`}>
                  <div className="drv3-chat-avatar">{msg.role === 'assistant' ? 'AI' : 'Me'}</div>
                  <div className="drv3-chat-bubble">
                    <pre className="drv3-chat-text">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {chatSending && (
                <div className="drv3-chat-msg assistant">
                  <div className="drv3-chat-avatar">AI</div>
                  <div className="drv3-chat-bubble drv3-typing">
                    <span className="drv3-dot" /><span className="drv3-dot" /><span className="drv3-dot" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="drv3-chat-input-bar">
              <input className="drv3-chat-input" placeholder="用自然语言描述你今天的工作，如：今天下午2点拜访了张总..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && !chatSending && handleChatSend()}
                disabled={chatSending}
              />
              <button className="drv3-chat-send" onClick={handleChatSend} disabled={chatSending || !chatInput.trim()}>
                发送
              </button>
            </div>
          </div>
          <div className="drv3-ai-hint">
            <strong>提示：</strong>AI会自动提取"时间、地点、人物、沟通内容、关键结论"五要素。信息不完整时会主动提醒你补充，补全后自动生成日报条目。
          </div>
        </div>
      )}

      {/* === 文档导入模式 === */}
      {inputMode === 'import' && (
        <div className="drv3-import-mode">
          <div className="drv3-upload-zone" onClick={() => document.getElementById('daily-docx-upload2').click()}>
            <div className="drv3-upload-icon">DOCX</div>
            <div className="drv3-upload-title">点击上传日报文档</div>
            <div className="drv3-upload-sub">仅支持 .docx 格式</div>
            <input id="daily-docx-upload2" type="file" accept=".docx" style={{ display: 'none' }}
              onChange={handleFileSelect} />
          </div>
          <div className="drv3-import-info">
            <h4>文档导入说明</h4>
            <ul>
              <li>上传docx格式日报文档</li>
              <li>系统自动识别日期、工作内容、客户信息</li>
              <li>解析后自动填充到表单，支持修改后提交</li>
              <li>解析完成后自动切换到表单录入模式</li>
            </ul>
          </div>
        </div>
      )}

      {/* 历史日报 */}
      <div className="drv3-history">
        <h3 className="drv3-history-title">我的历史日报</h3>
        {reports.length === 0 ? (
          <div className="empty-state">暂无日报记录</div>
        ) : (
          <div className="drv3-history-list">
            {reports.map(report => (
              <div key={report.id} className="drv3-history-card">
                <div className="drv3-hc-header">
                  <span className="drv3-hc-date">{report.date}</span>
                  {report.importSource === 'docx' && <span className="drv3-hc-tag">文档导入</span>}
                </div>
                <div className="drv3-hc-content">
                  <strong>工作内容：</strong>{report.workContent}
                </div>
                {report.customers?.length > 0 && (
                  <div className="drv3-hc-customers">
                    <strong>跟进客户：</strong>
                    {report.customers.map((c, i) => (
                      <span key={i} className="drv3-customer-chip">{c}</span>
                    ))}
                  </div>
                )}
                {report.nextPlan && (
                  <div className="drv3-hc-plan">
                    <strong>后续计划：</strong>{report.nextPlan}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 上传弹窗（表单模式下使用） */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">导入日报文档</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <div style={{ padding: '20px 0' }}>
              <div className="drv3-upload-zone" onClick={() => document.getElementById('daily-docx-upload-modal').click()}>
                <div className="drv3-upload-icon">DOCX</div>
                <div className="drv3-upload-title">点击或拖拽文件到此区域上传</div>
                <div className="drv3-upload-sub">仅支持 .docx 格式文件</div>
                <input id="daily-docx-upload-modal" type="file" accept=".docx" style={{ display: 'none' }}
                  onChange={handleFileSelect} />
              </div>
              {uploading && <div style={{ textAlign: 'center', marginTop: 16, color: '#1890ff' }}>正在解析文档...</div>}
              {uploadMessage && (
                <div className={`drv3-msg ${uploadMessage.includes('成功') ? 'success' : 'error'}`} style={{ marginTop: 16 }}>
                  {uploadMessage}
                </div>
              )}
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