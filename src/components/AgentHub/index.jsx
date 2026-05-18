import React, { useState, useEffect } from 'react';
import { agentApi } from '../../services/api';

const AgentHub = ({ onChatOpen, onLogsOpen, onCreateOpen }) => {
  const [tab, setTab] = useState('conversational');
  const [convList, setConvList] = useState([]);
  const [autoList, setAutoList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [conv, auto] = await Promise.all([
      agentApi.getConversationalList(),
      agentApi.getAutomationList(),
    ]);
    setConvList(conv);
    setAutoList(auto);
  };

  const handleToggle = async (id, enabled) => {
    await agentApi.toggleAutomation(id, enabled);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除该智能体吗？')) return;
    await agentApi.deleteAgent(id);
    loadData();
  };

  return (
    <div className="ag-hub">
      <div className="ag-hub-header">
        <h2>智能体中心</h2>
        <button className="btn btn-primary" onClick={() => onCreateOpen(tab)}>
          {tab === 'conversational' ? '+ 创建新智能体' : '+ 创建自动化规则'}
        </button>
      </div>

      <div className="ag-tabs">
        <button className={`ag-tab ${tab === 'conversational' ? 'active' : ''}`} onClick={() => setTab('conversational')}>
          对话型智能体
        </button>
        <button className={`ag-tab ${tab === 'automation' ? 'active' : ''}`} onClick={() => setTab('automation')}>
          自动化智能体
        </button>
      </div>

      {tab === 'conversational' ? (
        <div className="ag-card-grid">
          {convList.map(agent => (
            <div key={agent.id} className="ag-card" onClick={() => onChatOpen(agent.id)}>
              <div className="ag-card-head">
                <span className="ag-type-badge ag-type-conv">对话型</span>
                <button className="ag-card-del" onClick={e => { e.stopPropagation(); handleDelete(agent.id); }}>&times;</button>
              </div>
              <h3 className="ag-card-name">{agent.name}</h3>
              <p className="ag-card-desc">{agent.description}</p>
              <div className="ag-card-meta">
                <span className="ag-card-role">{agent.role}</span>
                <span className="ag-card-date">{agent.createdAt}</span>
              </div>
              <div className="ag-card-tools">
                {agent.tools.map(tid => {
                  const t = agentApi.getAgentTools().find(x => x.id === tid);
                  return t ? <span key={tid} className="ag-tool-tag">{t.name}</span> : null;
                })}
              </div>
            </div>
          ))}
          {convList.length === 0 && <div className="ag-empty">暂无对话型智能体，点击上方按钮创建</div>}
        </div>
      ) : (
        <div className="ag-auto-list">
          {autoList.map(agent => {
            const evt = agentApi.getAutomationEvents().find(e => e.id === agent.trigger.eventId);
            const act = agentApi.getAutomationActions().find(a => a.id === agent.action.type);
            return (
              <div key={agent.id} className="ag-auto-row">
                <div className="ag-auto-left">
                  <div className="ag-auto-head">
                    <span className="ag-type-badge ag-type-auto">自动化</span>
                    <h3 className="ag-auto-name">{agent.name}</h3>
                    <span className={`ag-status-dot ${agent.enabled ? 'ag-status-on' : 'ag-status-off'}`} />
                  </div>
                  <p className="ag-auto-desc">{agent.description}</p>
                  <div className="ag-auto-meta">
                    <span>触发: {evt ? evt.name : (agent.trigger.expression || '自定义')}</span>
                    <span>动作: {act ? act.name : agent.action.type}</span>
                    {agent.lastExecTime && <span>上次执行: {agent.lastExecTime}</span>}
                    <span>累计执行: {agent.execCount}次</span>
                  </div>
                </div>
                <div className="ag-auto-right">
                  <label className="ag-switch">
                    <input type="checkbox" checked={agent.enabled} onChange={e => handleToggle(agent.id, e.target.checked)} />
                    <span className="ag-switch-slider" />
                  </label>
                  <button className="btn btn-sm btn-secondary" onClick={() => onLogsOpen(agent.id)}>查看日志</button>
                  <button className="ag-card-del" onClick={() => handleDelete(agent.id)}>&times;</button>
                </div>
              </div>
            );
          })}
          {autoList.length === 0 && <div className="ag-empty">暂无自动化规则，点击上方按钮创建</div>}
        </div>
      )}
    </div>
  );
};

export default AgentHub;
