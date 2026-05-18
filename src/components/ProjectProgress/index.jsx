import React, { useEffect, useState } from 'react';
import { projectApi } from '../../services/api';

const ProjectProgress = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    loadProjects();
  }, [stageFilter, user]);

  const loadProjects = async () => {
    setLoading(true);
    const params = { stage: stageFilter };
    // 非管理员只能看自己的项目
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const { data } = await projectApi.getList(params);
    setProjects(data);
    setLoading(false);
  };

  const formatAmount = (amount) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#1890ff';
    if (progress >= 30) return '#faad14';
    return '#f5222d';
  };

  const getDaysRemaining = (expectedClose) => {
    const today = new Date();
    const closeDate = new Date(expectedClose);
    const diff = Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
      <div className="card-title">
        <span>项目进度详情</span>
      </div>

      <div className="toolbar">
        <select
          className="filter-select"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">全部阶段</option>
          <option value="初次接触">初次接触</option>
          <option value="需求确认">需求确认</option>
          <option value="方案报价">方案报价</option>
          <option value="合同谈判">合同谈判</option>
          <option value="成交">成交</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">加载中...</div>
      ) : (
        <div>
          {projects.map(project => {
            const daysRemaining = getDaysRemaining(project.expectedClose);
            return (
              <div
                key={project.id}
                style={{
                  background: '#fafafa',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '15px', marginBottom: '4px' }}>
                      {project.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '13px' }}>
                      {project.customer}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#1890ff', fontWeight: '500', fontSize: '16px' }}>
                      ¥{formatAmount(project.amount)}
                    </div>
                    <div style={{ fontSize: '12px', color: daysRemaining < 7 ? '#f5222d' : '#999' }}>
                      剩余 {daysRemaining} 天
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>进度: {project.progress}%</span>
                    <span className={`status-tag ${project.stage}`}>{project.stage}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${project.progress}%`,
                        background: getProgressColor(project.progress)
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                  <span>开始: {project.startDate}</span>
                  <span>预计结单: {project.expectedClose}</span>
                </div>

                <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                  {project.description}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#bfbfbf' }}>—</div>
          <div>暂无项目数据</div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;
