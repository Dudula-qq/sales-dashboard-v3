import React, { useState, useEffect, useRef } from 'react';
import { agentApi } from '../../services/api';

const LeadCard = ({ data, onNavigate }) => {
  const { extracted, actions } = data;

  const moduleIcons = {
    '客户管理': '👤',
    '沟通记录': '💬',
    '商机看板': '📊',
    'PPL数据': '💰',
    '跟进日历': '📅',
    '告警中心': '⚠️',
  };

  return (
    <div className="ag-lead-card">
      <div className="ag-lead-title">线索解析结果</div>
      <div className="ag-lead-info">
        {extracted.customerName && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">客户</span>
            <span className="ag-lead-value">{extracted.customerName}{extracted.customerExists ? '（已有）' : '（新建）'}</span>
          </div>
        )}
        {extracted.contact && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">联系人</span>
            <span className="ag-lead-value">{extracted.contact}</span>
          </div>
        )}
        {extracted.threePhase && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">拓客阶段</span>
            <span className="ag-lead-value">{extracted.threePhase}</span>
          </div>
        )}
        {extracted.stageCode && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">商机阶段</span>
            <span className="ag-lead-value">{extracted.stageCode}</span>
          </div>
        )}
        {extracted.amount && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">金额</span>
            <span className="ag-lead-value">¥{(extracted.amount / 10000).toFixed(0)}万</span>
          </div>
        )}
        {extracted.fiveElements && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">5要素</span>
            <span className="ag-lead-value">
              {{ background: '背景', budget: '预算', keyPerson: '关键人', stage: '阶段', competition: '竞争' } &&
                Object.keys(extracted.fiveElements).map(k => ({ background: '背景', budget: '预算', keyPerson: '关键人', stage: '阶段', competition: '竞争' }[k])).filter(Boolean).join('、')
              }
            </span>
          </div>
        )}
        {extracted.nextStep && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">下一步</span>
            <span className="ag-lead-value">{extracted.nextStep}</span>
          </div>
        )}
        {extracted.risks && (
          <div className="ag-lead-row">
            <span className="ag-lead-label">风险信号</span>
            <span className="ag-lead-value ag-lead-risk">{extracted.risks.join('、')}</span>
          </div>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="ag-lead-actions">
          <div className="ag-lead-actions-title">模块同步</div>
          {actions.map((a, i) => (
            <div key={i} className="ag-lead-action-item">
              <span className="ag-lead-action-icon">{moduleIcons[a.module] || '📌'}</span>
              <span className="ag-lead-action-module">{a.module}</span>
              <span className="ag-lead-action-desc">{a.action}</span>
              {a.link && onNavigate && (
                <button className="ag-lead-action-btn" onClick={() => onNavigate(a.link)}>查看</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AgentChat = ({ agentId, onBack, onNavigate }) => {
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    loadAgent();
    loadHistory();
  }, [agentId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const loadAgent = async () => {
    const convs = await agentApi.getConversationalList();
    const a = convs.find(c => c.id === agentId);
    setAgent(a);
  };

  const loadHistory = async () => {
    const history = await agentApi.getChatHistory(agentId);
    setMessages(history);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    setMessages(prev => [...prev, { id: 'u' + Date.now(), role: 'user', content: text, time: new Date().toLocaleString('zh-CN') }]);
    setThinking(true);
    const reply = await agentApi.sendMessage(agentId, text);
    setThinking(false);
    if (reply) {
      setMessages(prev => [...prev, reply]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    const startIdx = content.indexOf('__LEAD_RESULT__');
    const endIdx = content.indexOf('__END_LEAD_RESULT__');
    if (startIdx === -1 || endIdx === -1) return content;

    const textPart = content.substring(0, startIdx).trim();
    const jsonStr = content.substring(startIdx + '__LEAD_RESULT__'.length, endIdx).trim();
    let leadData = null;
    try { leadData = JSON.parse(jsonStr); } catch (e) { /* ignore parse error */ }

    return (
      <>
        {textPart && <div className="ag-lead-text">{textPart}</div>}
        {leadData && <LeadCard data={leadData} onNavigate={onNavigate} />}
      </>
    );
  };

  if (!agent) return <div className="ag-chat-loading">加载中...</div>;

  const tools = agentApi.getAgentTools().filter(t => agent.tools.includes(t.id));

  return (
    <div className="ag-chat">
      <div className="ag-chat-header">
        <button className="ag-back-btn" onClick={onBack}>&lsaquo; 返回</button>
        <div className="ag-chat-info">
          <h3>{agent.name}</h3>
          <span className="ag-type-badge ag-type-conv">{agent.role}</span>
        </div>
      </div>

      <div className="ag-chat-messages" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`ag-msg ${m.role === 'agent' ? 'ag-msg-agent' : 'ag-msg-user'}`}>
            <div className="ag-msg-bubble">{renderMessageContent(m.content)}</div>
            <div className="ag-msg-time">{m.time}</div>
          </div>
        ))}
        {thinking && (
          <div className="ag-msg ag-msg-agent">
            <div className="ag-msg-bubble ag-thinking">
              <span className="ag-dot" /><span className="ag-dot" /><span className="ag-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="ag-chat-footer">
        {tools.length > 0 && (
          <div className="ag-chat-tools">
            {tools.map(t => <span key={t.id} className="ag-tool-tag">{t.name}</span>)}
          </div>
        )}
        <div className="ag-chat-input-row">
          <textarea
            className="ag-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="输入消息..."
            rows={1}
          />
          <button className="ag-send-btn" onClick={handleSend} disabled={thinking || !input.trim()}>
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
