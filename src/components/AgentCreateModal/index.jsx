import React, { useState } from 'react';
import { agentApi } from '../../services/api';

const AgentCreateModal = ({ visible, defaultTab, onClose, onCreated }) => {
  const [formType, setFormType] = useState(defaultTab === 'automation' ? 'automation' : 'conversational');

  const [convForm, setConvForm] = useState({
    name: '', description: '', role: '', instructions: '', tools: [], greeting: '',
  });
  const [autoForm, setAutoForm] = useState({
    name: '', description: '',
    trigger: { type: 'event', eventId: '', expression: '' },
    action: { type: '', config: {} },
  });

  const tools = agentApi.getAgentTools();
  const events = agentApi.getAutomationEvents();
  const actions = agentApi.getAutomationActions();

  if (!visible) return null;

  const handleConvToolToggle = (tid) => {
    setConvForm(f => ({
      ...f,
      tools: f.tools.includes(tid) ? f.tools.filter(t => t !== tid) : [...f.tools, tid],
    }));
  };

  const handleConvSubmit = async () => {
    if (!convForm.name || !convForm.role) return;
    await agentApi.createConversational(convForm);
    resetForms();
    onCreated();
    onClose();
  };

  const handleAutoSubmit = async () => {
    if (!autoForm.name) return;
    await agentApi.createAutomation(autoForm);
    resetForms();
    onCreated();
    onClose();
  };

  const resetForms = () => {
    setConvForm({ name: '', description: '', role: '', instructions: '', tools: [], greeting: '' });
    setAutoForm({ name: '', description: '', trigger: { type: 'event', eventId: '', expression: '' }, action: { type: '', config: {} } });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ag-create-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>创建智能体</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="ag-create-tabs">
          <button className={`ag-tab ${formType === 'conversational' ? 'active' : ''}`} onClick={() => setFormType('conversational')}>对话型</button>
          <button className={`ag-tab ${formType === 'automation' ? 'active' : ''}`} onClick={() => setFormType('automation')}>自动化</button>
        </div>

        <div className="ag-create-body">
          {formType === 'conversational' ? (
            <div className="ag-form">
              <div className="ag-form-row">
                <label>名称 *</label>
                <input value={convForm.name} onChange={e => setConvForm(f => ({ ...f, name: e.target.value }))} placeholder="如：销售助手小智" />
              </div>
              <div className="ag-form-row">
                <label>描述</label>
                <input value={convForm.description} onChange={e => setConvForm(f => ({ ...f, description: e.target.value }))} placeholder="简要描述智能体功能" />
              </div>
              <div className="ag-form-row">
                <label>角色 *</label>
                <input value={convForm.role} onChange={e => setConvForm(f => ({ ...f, role: e.target.value }))} placeholder="如：销售顾问、客户成功经理" />
              </div>
              <div className="ag-form-row">
                <label>指令</label>
                <textarea value={convForm.instructions} onChange={e => setConvForm(f => ({ ...f, instructions: e.target.value }))} placeholder="描述智能体的行为规则和回答风格" rows={3} />
              </div>
              <div className="ag-form-row">
                <label>可用工具</label>
                <div className="ag-tool-checks">
                  {tools.map(t => (
                    <label key={t.id} className="ag-tool-check">
                      <input type="checkbox" checked={convForm.tools.includes(t.id)} onChange={() => handleConvToolToggle(t.id)} />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="ag-form-row">
                <label>开场白</label>
                <input value={convForm.greeting} onChange={e => setConvForm(f => ({ ...f, greeting: e.target.value }))} placeholder="用户首次打开时的问候语" />
              </div>
            </div>
          ) : (
            <div className="ag-form">
              <div className="ag-form-row">
                <label>名称 *</label>
                <input value={autoForm.name} onChange={e => setAutoForm(f => ({ ...f, name: e.target.value }))} placeholder="如：跟进缺失提醒" />
              </div>
              <div className="ag-form-row">
                <label>描述</label>
                <input value={autoForm.description} onChange={e => setAutoForm(f => ({ ...f, description: e.target.value }))} placeholder="简要描述自动化规则" />
              </div>
              <div className="ag-form-row">
                <label>触发类型</label>
                <div className="ag-radio-group">
                  <label className="ag-radio"><input type="radio" name="triggerType" checked={autoForm.trigger.type === 'event'} onChange={() => setAutoForm(f => ({ ...f, trigger: { ...f.trigger, type: 'event' } }))} />事件触发</label>
                  <label className="ag-radio"><input type="radio" name="triggerType" checked={autoForm.trigger.type === 'schedule'} onChange={() => setAutoForm(f => ({ ...f, trigger: { ...f.trigger, type: 'schedule' } }))} />定时触发</label>
                </div>
              </div>
              <div className="ag-form-row">
                <label>{autoForm.trigger.type === 'event' ? '触发事件' : 'Cron表达式'}</label>
                {autoForm.trigger.type === 'event' ? (
                  <select value={autoForm.trigger.eventId} onChange={e => setAutoForm(f => ({ ...f, trigger: { ...f.trigger, eventId: e.target.value } }))}>
                    <option value="">请选择事件</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                ) : (
                  <input value={autoForm.trigger.expression} onChange={e => setAutoForm(f => ({ ...f, trigger: { ...f.trigger, expression: e.target.value } }))} placeholder="如：0 17 * * 5 (每周五17:00)" />
                )}
              </div>
              <div className="ag-form-row">
                <label>执行动作</label>
                <select value={autoForm.action.type} onChange={e => setAutoForm(f => ({ ...f, action: { ...f.action, type: e.target.value } }))}>
                  <option value="">请选择动作</option>
                  {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={formType === 'conversational' ? handleConvSubmit : handleAutoSubmit}>
            创建
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCreateModal;
