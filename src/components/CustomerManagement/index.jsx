import React, { useState, useEffect } from 'react';
import { customerApi, projectApi, suggestionApi } from '../../services/api';
import { emitDataChange, onDataChange } from '../../services/dataEvents';

const GRADE_CONFIG = {
  Committed: { label: 'Committed', color: '#52c41a', bgColor: '#f6ffed', desc: '高确定性客户，有明确预算和时间规划', followUp: '每周至少1次', resource: '优先投入' },
  Upside: { label: 'Upside', color: '#1890ff', bgColor: '#e6f7ff', desc: '有潜力但存在不确定性', followUp: '每2周至少1次', resource: '适度投入' },
  Probably: { label: 'Probably', color: '#8c8c8c', bgColor: '#fafafa', desc: '初步接触，确定性低', followUp: '每月至少1次', resource: '最低资源' },
};

const GRADE_ORDER = ['Committed', 'Upside', 'Probably'];

const threePhaseOrder = ['建联', '摸底', '跟踪'];
const fiveElementsLabels = [
  { key: 'background', label: '背景' },
  { key: 'budget', label: '预算' },
  { key: 'keyPerson', label: '关键人' },
  { key: 'stage', label: '阶段' },
  { key: 'competition', label: '竞争' },
];

const CustomerManagement = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // 等级变更
  const [gradeChangeModal, setGradeChangeModal] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [changeReason, setChangeReason] = useState('');

  // 联系人编辑
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ contact: '', contactPhone: '' });

  // 展开详情
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
    loadData();
    const off = onDataChange('customer_changed', loadData);
    return off;
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const params = {};
    if (user?.role !== 'manager') params.salesId = user?.id;
    if (keyword) params.keyword = keyword;

    const [custRes, projRes, sugList] = await Promise.all([
      customerApi.getList(params),
      projectApi.getList(user?.role !== 'manager' ? { salesId: user?.id } : {}),
      suggestionApi.getList(user?.role === 'sales' ? { salesId: user.id } : {}),
    ]);
    setCustomers(custRes.data);
    setProjects(projRes.data || []);
    setSuggestions(sugList);
    setLoading(false);
  };

  const handleSearch = () => loadData();

  const formatAmount = (amount) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万`;
    return amount;
  };

  const getFiveElementsCompletion = (fe) => {
    if (!fe) return 0;
    const done = fiveElementsLabels.filter(e => fe[e.key]).length;
    return Math.round((done / fiveElementsLabels.length) * 100);
  };

  // 核心过滤：只保留有关联项目且项目阶段 >= S4 的客户
  const getFilteredCustomers = () => {
    // 找出所有S4+阶段的客户名
    const s4PlusCustomerNames = new Set();
    projects.forEach(p => {
      const stageNum = parseInt(p.stage?.replace('S', ''));
      if (!isNaN(stageNum) && stageNum >= 4) {
        s4PlusCustomerNames.add(p.customer);
      }
      if (p.stage === 'End') {
        s4PlusCustomerNames.add(p.customer);
      }
    });

    // 过滤客户
    return customers.filter(c => s4PlusCustomerNames.has(c.name));
  };

  // 按等级分组
  const groupedByGrade = () => {
    const filtered = getFilteredCustomers();
    const groups = {};
    GRADE_ORDER.forEach(g => { groups[g] = []; });
    filtered.forEach(c => {
      if (groups[c.grade]) {
        groups[c.grade].push(c);
      } else {
        groups['Probably'].push(c);
      }
    });
    return groups;
  };

  // 获取客户关联的S4+项目
  const getCustomerProject = (customerName) => {
    return projects.find(p => p.customer === customerName && parseInt(p.stage?.replace('S', '')) >= 4);
  };

  // 等级变更
  const handleGradeChangeClick = (customer, targetGrade) => {
    setGradeChangeModal(customer);
    setNewGrade(targetGrade);
    setChangeReason('');
  };

  const submitGradeChange = () => {
    if (!changeReason.trim()) return;
    const idx = customers.findIndex(c => c.id === gradeChangeModal.id);
    if (idx !== -1) {
      const updated = [...customers];
      updated[idx] = { ...updated[idx], grade: newGrade };
      setCustomers(updated);
      customerApi.update(gradeChangeModal.id, { grade: newGrade });
      emitDataChange('customer_changed');
    }
    setGradeChangeModal(null);
  };

  // 三阶段切换
  const toggleThreePhase = async (customer) => {
    const curIdx = threePhaseOrder.indexOf(customer.threePhase);
    const next = threePhaseOrder[(curIdx + 1) % threePhaseOrder.length];
    const idx = customers.findIndex(c => c.id === customer.id);
    if (idx !== -1) {
      const updated = [...customers];
      updated[idx] = { ...updated[idx], threePhase: next };
      setCustomers(updated);
      await customerApi.update(customer.id, { threePhase: next });
      emitDataChange('customer_changed');
    }
  };

  // 五要素切换
  const toggleFiveElement = async (customer, elemKey) => {
    const fe = customer.fiveElements || {};
    const newVal = !fe[elemKey];
    const idx = customers.findIndex(c => c.id === customer.id);
    if (idx !== -1) {
      const updated = [...customers];
      updated[idx] = { ...updated[idx], fiveElements: { ...fe, [elemKey]: newVal } };
      setCustomers(updated);
      await customerApi.update(customer.id, { fiveElements: { ...fe, [elemKey]: newVal } });
      emitDataChange('customer_changed');
    }
  };

  // 联系人编辑
  const startEditContact = (customer) => {
    setEditingContact(customer.id);
    setContactForm({ contact: customer.contact || '', contactPhone: customer.contactPhone || '' });
  };

  const saveEditContact = async (customer) => {
    const idx = customers.findIndex(c => c.id === customer.id);
    if (idx !== -1) {
      const updated = [...customers];
      updated[idx] = { ...updated[idx], ...contactForm };
      setCustomers(updated);
      await customerApi.update(customer.id, contactForm);
      emitDataChange('customer_changed');
    }
    setEditingContact(null);
  };

  // 建议操作
  const handleApplySuggestion = async (sugId) => {
    await suggestionApi.apply(sugId);
    loadData();
  };

  const handleDismissSuggestion = async (sugId) => {
    await suggestionApi.dismiss(sugId);
    setSuggestions(prev => prev.filter(s => s.id !== sugId));
  };

  const toggleExpand = (id) => {
    setExpandedCustomer(prev => prev === id ? null : id);
  };

  if (loading) return <div className="loading">加载中...</div>;

  const groups = groupedByGrade();
  const filteredTotal = getFilteredCustomers().length;

  return (
    <div className="customer-management">
      <div className="cm-header">
        <h2>客户管理</h2>
        <span className="cm-count">S4阶段以后客户共 {filteredTotal} 个</span>
      </div>

      {/* 建议更新提示 */}
      {suggestions.length > 0 && (
        <div className="cm-suggestions">
          <div className="cm-sug-title">日报提取的客户信息建议更新</div>
          {suggestions.map(sug => (
            <div key={sug.id} className="cm-sug-item">
              <div className="cm-sug-header">
                <span className="cm-sug-customer">{sug.customerName}</span>
                <span className="cm-sug-source">来源: {sug.reportDate} 日报</span>
              </div>
              <div className="cm-sug-updates">
                {sug.updates.map((u, i) => (
                  <div key={i} className="cm-sug-update">
                    <span className="cm-sug-field">{u.label}:</span>
                    <span className="cm-sug-old">{u.oldValue}</span>
                    <span className="cm-sug-arrow">&rarr;</span>
                    <span className="cm-sug-new">{u.newValue}</span>
                  </div>
                ))}
              </div>
              <div className="cm-sug-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleApplySuggestion(sug.id)}>确认更新</button>
                <button className="btn btn-default btn-sm" onClick={() => handleDismissSuggestion(sug.id)}>忽略</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 搜索栏 */}
      <div className="toolbar">
        <input type="text" className="search-input" placeholder="搜索客户名称或联系人..."
          value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-primary" onClick={handleSearch}>搜索</button>
      </div>

      {/* 按等级三列分组 */}
      <div className="cm-grade-columns">
        {GRADE_ORDER.map(gradeKey => {
          const gradeConf = GRADE_CONFIG[gradeKey];
          const list = groups[gradeKey] || [];

          return (
            <div key={gradeKey} className="cm-grade-column" style={{ borderColor: gradeConf.color }}>
              <div className="cm-grade-col-header" style={{ backgroundColor: gradeConf.bgColor, borderBottomColor: gradeConf.color }}>
                <span className="cm-grade-col-label" style={{ color: gradeConf.color }}>{gradeConf.label}</span>
                <span className="cm-grade-col-count">{list.length}</span>
              </div>
              <div className="cm-grade-col-desc">{gradeConf.desc}</div>
              <div className="cm-grade-col-meta">
                <span>跟进: {gradeConf.followUp}</span>
                <span>资源: {gradeConf.resource}</span>
              </div>
              <div className="cm-grade-cards">
                {list.map(customer => {
                  const completion = getFiveElementsCompletion(customer.fiveElements);
                  const isExpanded = expandedCustomer === customer.id;
                  const project = getCustomerProject(customer.name);

                  return (
                    <div key={customer.id} className="cm-card" style={{ borderLeftColor: gradeConf.color }}>
                      <div className="cm-card-main">
                        <div className="cm-card-name" onClick={() => toggleExpand(customer.id)}>{customer.name}</div>

                        {/* 联系人 */}
                        {editingContact === customer.id ? (
                          <div className="cm-contact-edit">
                            <input className="cm-edit-input" value={contactForm.contact}
                              onChange={e => setContactForm({...contactForm, contact: e.target.value})} placeholder="联系人" />
                            <input className="cm-edit-input" value={contactForm.contactPhone}
                              onChange={e => setContactForm({...contactForm, contactPhone: e.target.value})} placeholder="电话" />
                            <button className="btn btn-primary btn-sm" onClick={() => saveEditContact(customer)}>保存</button>
                            <button className="btn btn-default btn-sm" onClick={() => setEditingContact(null)}>取消</button>
                          </div>
                        ) : (
                          <div className="cm-card-contact" onClick={() => startEditContact(customer)} title="点击编辑">
                            {customer.contact} {customer.contactPhone && `| ${customer.contactPhone}`}
                            <span className="cm-edit-hint">编辑</span>
                          </div>
                        )}

                        {/* 关联项目信息 */}
                        {project && (
                          <div className="cm-card-project">
                            <span className="cm-project-name">{project.name}</span>
                            <span className="cm-project-stage" style={{ color: gradeConf.color }}>{project.stage}</span>
                            <span className="cm-project-amount">¥{formatAmount(project.amount)}</span>
                            {project.expectedClose && <span className="cm-project-close">预计{project.expectedClose}</span>}
                          </div>
                        )}

                        {/* 三阶段 */}
                        <div className="cm-card-phase">
                          {threePhaseOrder.map(phase => (
                            <span key={phase}
                              className={`cm-phase-tag ${customer.threePhase === phase ? 'active' : ''}`}
                              onClick={() => toggleThreePhase(customer)}>
                              {phase}
                            </span>
                          ))}
                        </div>

                        {/* 五要素进度 */}
                        <div className="cm-card-five">
                          <div className="cm-fe-progress">
                            <div className="cm-fe-bar" style={{ width: `${completion}%`, backgroundColor: gradeConf.color }} />
                          </div>
                          <span className="cm-fe-pct">{completion}%</span>
                        </div>
                        <div className="cm-fe-tags">
                          {fiveElementsLabels.map(el => (
                            <span key={el.key}
                              className={`cm-fe-tag ${customer.fiveElements?.[el.key] ? 'done' : 'pending'}`}
                              onClick={() => toggleFiveElement(customer, el.key)}>
                              {el.label}
                            </span>
                          ))}
                        </div>

                        {/* 升降级 */}
                        <div className="cm-card-actions">
                          {customer.grade !== 'Committed' && (
                            <button className="cm-grade-btn cm-grade-up" onClick={() => handleGradeChangeClick(customer, 'Committed')}
                              style={{ color: '#52c41a', borderColor: '#52c41a' }}>
                              升级
                            </button>
                          )}
                          {customer.grade !== 'Probably' && (
                            <button className="cm-grade-btn cm-grade-down" onClick={() => handleGradeChangeClick(customer, 'Probably')}
                        style={{ color: '#8c8c8c', borderColor: '#8c8c8c' }}>
                              降级
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 展开详情 */}
                      {isExpanded && (
                        <div className="cm-card-detail">
                          <div className="cm-detail-section">
                            <span className="cm-detail-label">拓客三阶段</span>
                            <div className="cm-three-phase">
                              {threePhaseOrder.map(phase => (
                                <span key={phase}
                                  className={`cm-phase-tag ${customer.threePhase === phase ? 'active' : ''}`}
                                  onClick={() => toggleThreePhase(customer)}>
                                  {phase}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="cm-detail-section">
                            <span className="cm-detail-label">摸底5要素</span>
                            <div className="cm-five-elems">
                              <div className="cm-fe-progress">
                                <div className="cm-fe-bar" style={{ width: `${completion}%`, backgroundColor: gradeConf.color }} />
                              </div>
                              <span className="cm-fe-pct">{completion}%</span>
                            </div>
                            <div className="cm-fe-tags">
                              {fiveElementsLabels.map(el => (
                                <span key={el.key}
                                  className={`cm-fe-tag ${customer.fiveElements?.[el.key] ? 'done' : 'pending'}`}
                                  onClick={() => toggleFiveElement(customer, el.key)}>
                                  {el.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="cm-detail-section">
                            <span className="cm-detail-label">跟进要求</span>
                            <span className="cm-detail-value">{gradeConf.followUp}</span>
                          </div>
                          <div className="cm-detail-section">
                            <span className="cm-detail-label">资源投入</span>
                            <span className="cm-detail-value">{gradeConf.resource}</span>
                          </div>
                          {customer.lastContact && (
                            <div className="cm-detail-section">
                              <span className="cm-detail-label">最近联系</span>
                              <span className="cm-detail-value">{customer.lastContact}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTotal === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#bfbfbf' }}>--</div>
          <div>暂无S4阶段以后的客户数据</div>
        </div>
      )}

      {/* 等级变更弹窗 */}
      {gradeChangeModal && (
        <div className="modal-overlay" onClick={() => setGradeChangeModal(null)}>
          <div className="modal-content gc-change-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setGradeChangeModal(null)}>&times;</button>
            <div className="gcm-title">变更客户等级</div>
            <div className="gcm-customer">{gradeChangeModal.name}</div>
            <div className="gcm-grade-flow">
              <div className="gcm-grade-box" style={{
                borderColor: GRADE_CONFIG[gradeChangeModal.grade]?.color || '#8c8c8c',
                background: GRADE_CONFIG[gradeChangeModal.grade]?.bgColor || '#fafafa'
              }}>
                <span className="gcm-grade-text" style={{ color: GRADE_CONFIG[gradeChangeModal.grade]?.color || '#8c8c8c' }}>
                  {gradeChangeModal.grade}
                </span>
                <span className="gcm-grade-sub">当前等级</span>
              </div>
              <div className="gcm-arrow-wrap">
                <span className="gcm-arrow-line" />
                <span className="gcm-arrow-head" />
              </div>
              <div className="gcm-grade-box" style={{
                borderColor: GRADE_CONFIG[newGrade]?.color || '#8c8c8c',
                background: GRADE_CONFIG[newGrade]?.bgColor || '#fafafa'
              }}>
                <span className="gcm-grade-text" style={{ color: GRADE_CONFIG[newGrade]?.color || '#8c8c8c' }}>
                  {newGrade}
                </span>
                <span className="gcm-grade-sub">目标等级</span>
              </div>
            </div>
            <div className="gcm-field">
              <label className="gcm-label">变更理由 <span className="required">*</span></label>
              <textarea className="gcm-textarea" value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="请输入等级变更理由，例如：客户已签署意向书，项目推进顺利..." rows={4} />
            </div>
            <div className="gcm-footer">
              <button className="gcm-btn gcm-btn-cancel" onClick={() => setGradeChangeModal(null)}>取消</button>
              <button className="gcm-btn gcm-btn-confirm" onClick={submitGradeChange} disabled={!changeReason.trim()}>确认变更</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;