import React, { useState, useEffect } from 'react';
import { customerApi, suggestionApi } from '../../services/api';
import { getCustomerGrades } from '../../services/api';
import { emitDataChange, onDataChange } from '../../services/dataEvents';

const CustomerGradeBoard = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [grades] = useState(getCustomerGrades());
  const [loading, setLoading] = useState(true);
  const [gradeChangeModal, setGradeChangeModal] = useState(null);
  const [changeReason, setChangeReason] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ contact: '', phone: '' });

  useEffect(() => {
    loadData();
    const off = onDataChange('customer_changed', loadData);
    return off;
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const params = user?.role === 'sales' ? { salesId: user.id } : {};
    const [custRes, sugList] = await Promise.all([
      customerApi.getList(params),
      suggestionApi.getList(user?.role === 'sales' ? { salesId: user.id } : {}),
    ]);
    setCustomers(custRes.data);
    setSuggestions(sugList);
    setLoading(false);
  };

  const handleApplySuggestion = async (sugId) => {
    await suggestionApi.apply(sugId);
    loadData();
  };

  const handleDismissSuggestion = async (sugId) => {
    await suggestionApi.dismiss(sugId);
    setSuggestions(prev => prev.filter(s => s.id !== sugId));
  };

  const customersByGrade = (gradeKey) => customers.filter(c => c.grade === gradeKey);

  const fiveElementsLabels = [
    { key: 'background', label: '背景' },
    { key: 'budget', label: '预算' },
    { key: 'keyPerson', label: '关键人' },
    { key: 'stage', label: '阶段' },
    { key: 'competition', label: '竞争' },
  ];

  const getFiveElementsCompletion = (fe) => {
    if (!fe) return 0;
    const total = fiveElementsLabels.length;
    const done = fiveElementsLabels.filter(e => fe[e.key]).length;
    return Math.round((done / total) * 100);
  };

  const threePhaseLabels = { '建联': '建联', '摸底': '摸底', '跟踪': '跟踪' };
  const threePhaseOrder = ['建联', '摸底', '跟踪'];

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
      const newFe = { ...fe, [elemKey]: newVal };
      updated[idx] = { ...updated[idx], fiveElements: newFe };
      setCustomers(updated);
      await customerApi.update(customer.id, { fiveElements: newFe });
      emitDataChange('customer_changed');
    }
  };

  const startEditContact = (customer) => {
    setEditingContact(customer.id);
    setContactForm({ contact: customer.contact || '', phone: customer.phone || '' });
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

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="customer-grade-board">
      <div className="board-header">
        <h2>客户分级管理</h2>
      </div>

      {suggestions.length > 0 && (
        <div className="cgb-suggestions">
          <div className="cgb-sug-title">日报提取的客户信息建议更新</div>
          {suggestions.map(sug => (
            <div key={sug.id} className="cgb-sug-item">
              <div className="cgb-sug-header">
                <span className="cgb-sug-customer">{sug.customerName}</span>
                <span className="cgb-sug-source">来源: {sug.reportDate} 日报</span>
              </div>
              <div className="cgb-sug-updates">
                {sug.updates.map((u, i) => (
                  <div key={i} className="cgb-sug-update">
                    <span className="cgb-sug-field">{u.label}:</span>
                    <span className="cgb-sug-old">{u.oldValue}</span>
                    <span className="cgb-sug-arrow">&rarr;</span>
                    <span className="cgb-sug-new">{u.newValue}</span>
                  </div>
                ))}
              </div>
              <div className="cgb-sug-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleApplySuggestion(sug.id)}>确认更新</button>
                <button className="btn btn-default btn-sm" onClick={() => handleDismissSuggestion(sug.id)}>忽略</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grade-columns">
        {grades.map(grade => (
          <div key={grade.key} className="grade-column" style={{ borderColor: grade.color }}>
            <div className="grade-column-header" style={{ backgroundColor: grade.bgColor, borderBottomColor: grade.color }}>
              <span className="grade-label" style={{ color: grade.color }}>{grade.label}</span>
              <span className="grade-count">{customersByGrade(grade.key).length}</span>
            </div>
            <div className="grade-desc">{grade.desc}</div>
            <div className="grade-meta">
              <span>跟进要求: {grade.followUpReq}</span>
              <span>资源投入: {grade.resourceLevel}</span>
            </div>
            <div className="grade-cards">
              {customersByGrade(grade.key).map(customer => {
                const completion = getFiveElementsCompletion(customer.fiveElements);
                const isEditing = editingContact === customer.id;
                return (
                  <div key={customer.id} className="grade-customer-card" style={{ borderLeftColor: grade.color }}>
                    <div className="gcc-name">{customer.name}</div>
                    {isEditing ? (
                      <div className="gcc-contact-edit">
                        <input className="gcc-edit-input" value={contactForm.contact}
                          onChange={e => setContactForm({...contactForm, contact: e.target.value})}
                          placeholder="联系人" />
                        <input className="gcc-edit-input" value={contactForm.phone}
                          onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                          placeholder="电话" />
                        <button className="btn btn-primary btn-sm" onClick={() => saveEditContact(customer)}>保存</button>
                        <button className="btn btn-default btn-sm" onClick={() => setEditingContact(null)}>取消</button>
                      </div>
                    ) : (
                      <div className="gcc-contact" onClick={() => startEditContact(customer)} title="点击编辑">
                        {customer.contact} | {customer.phone}
                        <span className="gcc-edit-hint">&#9998;</span>
                      </div>
                    )}
                    <div className="gcc-phase">
                      <span className="three-phase-tag clickable" data-phase={customer.threePhase}
                        onClick={() => toggleThreePhase(customer)} title="点击切换">
                        {threePhaseLabels[customer.threePhase] || customer.threePhase}
                      </span>
                    </div>
                    <div className="gcc-five-elements">
                      <div className="five-elems-label">摸底5要素</div>
                      <div className="five-elems-progress">
                        <div className="five-elems-bar" style={{ width: `${completion}%`, backgroundColor: grade.color }}></div>
                      </div>
                      <span className="five-elems-pct">{completion}%</span>
                    </div>
                    <div className="gcc-five-elements-detail">
                      {fiveElementsLabels.map(el => (
                        <span key={el.key} className={`fe-tag ${customer.fiveElements?.[el.key] ? 'fe-done' : 'fe-pending'} clickable`}
                          onClick={() => toggleFiveElement(customer, el.key)} title="点击切换">
                          {el.label}
                        </span>
                      ))}
                    </div>
                    <div className="gcc-actions">
                      {grade.key !== 'Committed' && (
                        <button className="btn-grade-up" onClick={() => handleGradeChangeClick(customer, 'Committed')} style={{ color: '#52c41a', borderColor: '#52c41a' }}>升级Committed</button>
                      )}
                      {grade.key !== 'Probably' && (
                        <button className="btn-grade-down" onClick={() => handleGradeChangeClick(customer, 'Probably')} style={{ color: '#8c8c8c', borderColor: '#8c8c8c' }}>降级Probably</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {gradeChangeModal && (
        <div className="modal-overlay" onClick={() => setGradeChangeModal(null)}>
          <div className="modal-content gc-change-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setGradeChangeModal(null)}>&times;</button>

            <div className="gcm-title">变更客户等级</div>
            <div className="gcm-customer">{gradeChangeModal.name}</div>

            <div className="gcm-grade-flow">
              <div className="gcm-grade-box" style={{
                borderColor: grades.find(g => g.key === gradeChangeModal.grade)?.color || '#8c8c8c',
                background: grades.find(g => g.key === gradeChangeModal.grade)?.bgColor || '#fafafa'
              }}>
                <span className="gcm-grade-text" style={{ color: grades.find(g => g.key === gradeChangeModal.grade)?.color || '#8c8c8c' }}>
                  {gradeChangeModal.grade}
                </span>
                <span className="gcm-grade-sub">当前等级</span>
              </div>
              <div className="gcm-arrow-wrap">
                <span className="gcm-arrow-line" />
                <span className="gcm-arrow-head" />
              </div>
              <div className="gcm-grade-box" style={{
                borderColor: grades.find(g => g.key === newGrade)?.color || '#8c8c8c',
                background: grades.find(g => g.key === newGrade)?.bgColor || '#fafafa'
              }}>
                <span className="gcm-grade-text" style={{ color: grades.find(g => g.key === newGrade)?.color || '#8c8c8c' }}>
                  {newGrade}
                </span>
                <span className="gcm-grade-sub">目标等级</span>
              </div>
            </div>

            <div className="gcm-field">
              <label className="gcm-label">变更理由 <span className="required">*</span></label>
              <textarea
                className="gcm-textarea"
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="请输入等级变更理由，例如：客户已签署意向书，项目推进顺利..."
                rows={4}
              />
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

export default CustomerGradeBoard;
