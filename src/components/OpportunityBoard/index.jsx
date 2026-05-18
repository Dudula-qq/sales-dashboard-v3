import React, { useState, useEffect, useMemo } from 'react';
import { projectApi } from '../../services/api';
import { getProjectStages } from '../../services/api';
import { emitDataChange, onDataChange } from '../../services/dataEvents';

const OpportunityBoard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [stages] = useState(getProjectStages());
  const [filterSales, setFilterSales] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
    const off1 = onDataChange('project_changed', loadData);
    const off2 = onDataChange('customer_changed', loadData);
    return function() { off1(); off2(); };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const params = user?.role === 'sales' ? { salesId: user.id } : {};
    const projRes = await projectApi.getList(params);
    setProjects(projRes.data);
    setLoading(false);
  };

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

  const cancelEdit = () => {
    setEditMode(false);
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (filterSales) {
      result = result.filter(p => p.salesName === filterSales);
    }
    return result;
  }, [projects, filterSales]);

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

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="opportunity-board">
      <div className="board-header">
        <h2>商机看板</h2>
        <div className="board-filters">
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
                  <div
                    key={project.id}
                    className="opportunity-card"
                    onClick={() => setSelectedProject(project)}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', project.id)}
                  >
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
                    <button className="btn btn-default btn-sm" onClick={cancelEdit}>取消</button>
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
    </div>
  );
};

export default OpportunityBoard;
