import React, { useState, useEffect, useMemo } from 'react';
import { projectApi, customerApi, suggestionApi } from '../../services/api';
import { getProjectStages } from '../../services/api';
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

const OpportunityCustomer = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // 商机详情弹窗
  const [selectedProject, setSelectedProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  // 客户等级变更
  const [gradeChangeModal, setGradeChangeModal] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [changeReason, setChangeReason] = useState('');

  // 联系人编辑
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ contact: '', contactPhone: '' });

  // 展开详情
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const stages = getProjectStages();

  useEffect(() => {
    loadData();
    const off1 = onDataChange('project_changed', loadData);
    const off2 = onDataChange('customer_changed', loadData);
    return function() { off1(); off2(); };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const params = user?.role === 'sales' ? { salesId: user.id } : {};
    const [projRes, custRes, sugList] = await Promise.all([
      projectApi.getList(params),
      customerApi.getList(params),
      suggestionApi.getList(user?.role === 'sales' ? { salesId: user.id } : {}),
    ]);
    setProjects(projRes.data);
    setCustomers(custRes.data);
    setSuggestions(sugList);
    setLoading(false);
  };

  // ========== 商机看板 ==========
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (filterSales) result = result.filter(p => p.salesName === filterSales);
    if (keyword) result = result.filter(p => p.name.includes(keyword) || p.customer.includes(keyword));
    return result;
  }, [projects, filterSales, keyword]);

  const projectsByStage = useMemo(() => {
    const map = {};
    stages.forEach(s => { map[s.code] = []; });
    filteredProjects.forEach(p => {
      if (map[p.stage]) map[p.stage].push(p);
    });
    return map;
  }, [filteredProjects, stages]);

  const getDaysInStage = (project) => {
    if (!project.stageEnterDate) return '-';
    const enter = new Date(project.stageEnterDate);
    const now = new Date();
    return Math.floor((now - enter) / (1000 * 60 * 60 * 24));
  };

  const salesNames = [...new Set(projects.map(p => p.salesName))];

  const startEdit = () => {
    setEditForm({
      name: selectedProject.name,
      customer: selectedProject.customer,
      amount: selectedProject.amount || 0,
      expectedAmount: selectedProject.expectedAmount || 0,
      salesName: selectedProject.salesName,
      expectedClose: selectedProject.expectedClose || '',
      stage: selectedProject.stage,
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    const idx = projects.findIndex(p => p.id === selectedProject.id);
    if (idx !== -1) {
      const updated = [...projects];
      updated[idx] = { ...updated[idx], ...editForm };
      setProjects(updated);
      await projectApi.updateStage(selectedProject.id, editForm.stage);
      emitDataChange('project_changed');
      setSelectedProject(updated[idx]);
    }
    setEditMode(false);
  };

  // ========== 客户分级 ==========
  const formatAmount = (amount) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万`;
    return amount;
  };

  const getFiveElementsCompletion = (fe) => {
    if (!fe) return 0;
    const done = fiveElementsLabels.filter(e => fe[e.key]).length;
    return Math.round((done / fiveElementsLabels.length) * 100);
  };

  const getFilteredCustomers = () => {
    const s4PlusCustomerNames = new Set();
    projects.forEach(p => {
      const stageNum = parseInt(p.stage?.replace('S', ''));
      if (!isNaN(stageNum) && stageNum >= 4) s4PlusCustomerNames.add(p.customer);
      if (p.stage === 'End') s4PlusCustomerNames.add(p.customer);
    });
    return customers.filter(c => s4PlusCustomerNames.has(c.name));
  };

  const groupedByGrade = () => {
    const filtered = getFilteredCustomers();
    const groups = {};
    GRADE_ORDER.forEach(g => { groups[g] = []; });
    filtered.forEach(c => {
      if (groups[c.grade]) groups[c.grade].push(c);
      else groups['Probably'].push(c);
    });
    return groups;
  };

  const getCustomerProject = (customerName) => {
    return projects.find(p => p.customer === customerName && parseInt(p.stage?.replace('S', '')) >= 4);
  };

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

  const handleApplySuggestion = async (sugId) => { await suggestionApi.apply(sugId); loadData(); };
  const handleDismissSuggestion = async (sugId) => { await suggestionApi.dismiss(sugId); setSuggestions(prev => prev.filter(s => s.id !== sugId)); };
  const toggleExpand = (id) => { setExpandedCustomer(prev => prev === id ? null : id); };

  if (loading) return <div className="loading">加载中...</div>;

  const groups = groupedByGrade();
  const filteredTotal = getFilteredCustomers().length;

  return (
    <div className="opportunity-customer">
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

      {/* ========== 商机看板 ========== */}
      <section className="oc-section">
        <div className="oc-section-header">
          <h2>商机看板</h2>
          <div className="board-filters">
            <input type="text" className="search-input" placeholder="搜索项目或客户..."
              value={keyword} onChange={e => setKeyword(e.target.value)}
              onKeyPress={e => e.key === 'Enter'} />
            <select value={filterSales} onChange={e => setFilterSales(e.target.value)}>
              <option value="">全部销售</option>
              {salesNames.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="kanban-board eight-stage">
          {stages.map(stage => (
            <div key={stage.code} className="kanban-column" style={{ backgroundColor: stage.color }}>
              <div className="kanban-column-header">
                <span className="stage-code">{stage.code}</span>
                <span className="stage-name">{stage.name}</span>
                <span className="stage-count">{projectsByStage[stage.code]?.length || 0}</span>
              </div>
              <div className="kanban-cards">
                {(projectsByStage[stage.code] || []).map(project => {
                  const days = getDaysInStage(project);
                  return (
                    <div key={project.id} className="opportunity-card" onClick={() => setSelectedProject(project)}>
                      <div className="opp-card-name">{project.name}</div>
                      <div className="opp-card-customer">{project.customer}</div>
                      <div className="opp-card-amount">¥{(project.amount || 0).toLocaleString()}</div>
                      <div className="opp-card-meta">
                        <span className="days-tag">停留{days}天</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 客户分级 ========== */}
      <section className="oc-section" style={{ marginTop: 32 }}>
        <div className="oc-section-header">
          <h2>客户分级</h2>
          <span className="cm-count">S4阶段以后客户共 {filteredTotal} 个</span>
        </div>
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

                          {project && (
                            <div className="cm-card-project">
                              <span className="cm-project-name">{project.name}</span>
                              <span className="cm-project-stage" style={{ color: gradeConf.color }}>{project.stage}</span>
                              <span className="cm-project-amount">¥{formatAmount(project.amount)}</span>
                              {project.expectedClose && <span className="cm-project-close">预计{project.expectedClose}</span>}
                            </div>
                          )}

                          <div className="cm-card-phase">
                            {threePhaseOrder.map(phase => (
                              <span key={phase}
                                className={`cm-phase-tag ${customer.threePhase === phase ? 'active' : ''}`}
                                onClick={() => toggleThreePhase(customer)}>
                                {phase}
                              </span>
                            ))}
                          </div>

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

                          <div className="cm-card-actions">
                            {customer.grade !== 'Committed' && (
                              <button className="cm-grade-btn cm-grade-up" onClick={() => handleGradeChangeClick(customer, 'Committed')}
                                style={{ color: '#52c41a', borderColor: '#52c41a' }}>升级</button>
                            )}
                            {customer.grade !== 'Probably' && (
                              <button className="cm-grade-btn cm-grade-down" onClick={() => handleGradeChangeClick(customer, 'Probably')}
                                style={{ color: '#8c8c8c', borderColor: '#8c8c8c' }}>降级</button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="cm-card-detail">
                            <div className="cm-detail-section">
                              <span className="cm-detail-label">拓客三阶段</span>
                              <div className="cm-three-phase">
                                {threePhaseOrder.map(phase => (
                                  <span key={phase}
                                    className={`cm-phase-tag ${customer.threePhase === phase ? 'active' : ''}`}
                                    onClick={() => toggleThreePhase(customer)}>{phase}</span>
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
                                    onClick={() => toggleFiveElement(customer, el.key)}>{el.label}</span>
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
      </section>

      {/* 商机详情弹窗 */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => { setSelectedProject(null); setEditMode(false); }}>
          <div className="modal-content opp-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProject.name}</h3>
              <button className="modal-close" onClick={() => { setSelectedProject(null); setEditMode(false); }}>&times;</button>
            </div>
            <div className="modal-body">
              {editMode ? (
                <div className="detail-edit-form">
                  <div className="detail-item">
                    <label>项目名称</label>
                    <input className="opp-edit-input" value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="detail-item">
                    <label>客户</label>
                    <input className="opp-edit-input" value={editForm.customer}
                      onChange={e => setEditForm({...editForm, customer: e.target.value})} />
                  </div>
                  <div className="detail-item">
                    <label>商机金额</label>
                    <input className="opp-edit-input" type="number" value={editForm.amount}
                      onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} />
                  </div>
                  <div className="detail-item">
                    <label>预期金额</label>
                    <input className="opp-edit-input" type="number" value={editForm.expectedAmount}
                      onChange={e => setEditForm({...editForm, expectedAmount: Number(e.target.value)})} />
                  </div>
                  <div className="detail-item">
                    <label>当前阶段</label>
                    <select className="opp-edit-input" value={editForm.stage}
                      onChange={e => setEditForm({...editForm, stage: e.target.value})}>
                      {stages.map(s => <option key={s.code} value={s.code}>{s.code} {s.name}</option>)}
                    </select>
                  </div>
                  <div className="detail-item">
                    <label>销售</label>
                    <input className="opp-edit-input" value={editForm.salesName}
                      onChange={e => setEditForm({...editForm, salesName: e.target.value})} />
                  </div>
                  <div className="detail-item">
                    <label>预计关闭</label>
                    <input className="opp-edit-input" type="date" value={editForm.expectedClose}
                      onChange={e => setEditForm({...editForm, expectedClose: e.target.value})} />
                  </div>
                  <div className="detail-edit-actions">
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>保存</button>
                    <button className="btn btn-default btn-sm" onClick={() => setEditMode(false)}>取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="detail-info-grid">
                    <div className="detail-item"><label>客户</label><span>{selectedProject.customer}</span></div>
                    <div className="detail-item"><label>当前阶段</label><span>{stages.find(s => s.code === selectedProject.stage)?.name}</span></div>
                    <div className="detail-item"><label>商机金额</label><span>¥{(selectedProject.amount || 0).toLocaleString()}</span></div>
                    <div className="detail-item"><label>预期金额</label><span>¥{(selectedProject.expectedAmount || 0).toLocaleString()}</span></div>
                    <div className="detail-item"><label>销售</label><span>{selectedProject.salesName}</span></div>
                    <div className="detail-item"><label>预计关闭</label><span>{selectedProject.expectedClose}</span></div>
                    {selectedProject.actualAmount && (
                      <div className="detail-item"><label>实际金额</label><span>¥{selectedProject.actualAmount.toLocaleString()}</span></div>
                    )}
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={startEdit}>编辑</button>
                </>
              )}
              {!editMode && selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div className="milestone-section" style={{ marginTop: 12 }}>
                  <h4>阶段里程碑</h4>
                  <div className="milestone-list">
                    {selectedProject.milestones.map((m, i) => (
                      <div key={i} className="milestone-item">
                        <span className="milestone-stage">{m.stage}</span>
                        <span className="milestone-date">{m.date}</span>
                        <span className="milestone-note">{m.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
                <span className="gcm-grade-text" style={{ color: GRADE_CONFIG[gradeChangeModal.grade]?.color || '#8c8c8c' }}>{gradeChangeModal.grade}</span>
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
                <span className="gcm-grade-text" style={{ color: GRADE_CONFIG[newGrade]?.color || '#8c8c8c' }}>{newGrade}</span>
                <span className="gcm-grade-sub">目标等级</span>
              </div>
            </div>
            <div className="gcm-field">
              <label className="gcm-label">变更理由 <span className="required">*</span></label>
              <textarea className="gcm-textarea" value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="请输入等级变更理由..." rows={4} />
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

export default OpportunityCustomer;