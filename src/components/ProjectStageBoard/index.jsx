import React, { useEffect, useState } from 'react';
import { projectApi } from '../../services/api';
import { projectStages } from '../../data/mockData';

const stageColors = {
  '初次接触': '#1890ff',
  '需求确认': '#13c2c2',
  '方案报价': '#faad14',
  '合同谈判': '#722ed1',
  '成交': '#52c41a'
};

const ProjectStageBoard = ({ user, standalone }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    const params = {};
    // 非管理员只能看自己的项目
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const { data } = await projectApi.getList(params);
    setProjects(data);
  };

  const handleCardClick = (project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const formatAmount = (amount) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount;
  };

  const getProjectsByStage = (stage) => {
    return projects.filter(p => p.stage === stage);
  };

  return (
    <div style={{ background: standalone ? '#fff' : 'transparent', borderRadius: '8px', padding: standalone ? '24px' : '0' }}>
      {standalone && <div className="card-title">项目阶段看板</div>}

      <div className="kanban-board">
        {projectStages.map(stage => {
          const stageProjects = getProjectsByStage(stage);
          return (
            <div key={stage} className="kanban-column">
              <div
                className="kanban-column-header"
                style={{ borderColor: stageColors[stage] }}
              >
                <span className="kanban-column-title" style={{ color: stageColors[stage] }}>
                  {stage}
                </span>
                <span className="kanban-column-count">{stageProjects.length}</span>
              </div>
              <div className="kanban-cards">
                {stageProjects.map(project => (
                  <div
                    key={project.id}
                    className="kanban-card"
                    onClick={() => handleCardClick(project)}
                  >
                    <div className="card-header">{project.name}</div>
                    <div className="card-customer">{project.customer}</div>
                    <div className="card-footer">
                      <span className="card-amount">¥{formatAmount(project.amount)}</span>
                      <span style={{ color: '#999' }}>{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedProject.name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>客户:</span>
                <span>{selectedProject.customer}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>阶段:</span>
                <span className={`status-tag ${selectedProject.stage}`}>{selectedProject.stage}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>金额:</span>
                <span style={{ color: '#1890ff', fontWeight: '500' }}>¥{formatAmount(selectedProject.amount)}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>进度:</span>
                <div style={{ display: 'inline-block', width: '200px' }}>
                  <div className="progress-bar" style={{ width: '100%' }}>
                    <div className="progress-fill" style={{ width: `${selectedProject.progress}%` }}></div>
                  </div>
                  <span style={{ marginLeft: '8px' }}>{selectedProject.progress}%</span>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>开始日期:</span>
                <span>{selectedProject.startDate}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>预计结单:</span>
                <span>{selectedProject.expectedClose}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#666', marginRight: '12px' }}>项目描述:</span>
                <span>{selectedProject.description}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStageBoard;
