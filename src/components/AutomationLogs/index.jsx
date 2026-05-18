import React, { useState, useEffect } from 'react';
import { agentApi } from '../../services/api';

const AutomationLogs = ({ agentId, onBack }) => {
  const [logs, setLogs] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    loadData();
  }, [agentId]);

  const loadData = async () => {
    const autoList = await agentApi.getAutomationList();
    setAgent(autoList.find(a => a.id === agentId));
    const data = await agentApi.getAutomationLogs(agentId);
    setLogs(data);
  };

  const handleExecute = async () => {
    setExecuting(true);
    const log = await agentApi.executeAutomation(agentId);
    setExecuting(false);
    if (log) {
      setLogs(prev => [log, ...prev]);
    }
  };

  return (
    <div className="ag-logs">
      <div className="ag-logs-header">
        <button className="ag-back-btn" onClick={onBack}>&lsaquo; 返回</button>
        <h3>{agent ? agent.name : '自动化日志'}</h3>
        <button className="btn btn-primary btn-sm" onClick={handleExecute} disabled={executing}>
          {executing ? '执行中...' : '手动执行'}
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="ag-empty">暂无执行记录</div>
      ) : (
        <table className="ag-log-table">
          <thead>
            <tr>
              <th>执行时间</th>
              <th>耗时</th>
              <th>状态</th>
              <th>输出</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.time}</td>
                <td>{(log.duration / 1000).toFixed(1)}s</td>
                <td>
                  <span className={`ag-log-status ${log.status === 'success' ? 'ag-log-ok' : 'ag-log-err'}`}>
                    {log.status === 'success' ? '成功' : '失败'}
                  </span>
                </td>
                <td>{log.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AutomationLogs;
