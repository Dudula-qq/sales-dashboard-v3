import React, { useState, useEffect } from 'react';
import { guideApi } from '../../services/api';

const categoryConfig = {
  '话术': { color: '#1890ff' },
  '行业打法': { color: '#52c41a' },
  '竞对分析': { color: '#f5222d' },
};

const SalesGuide = ({ user }) => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showAIRcommend, setShowAIRecommend] = useState(false);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    const data = await guideApi.getList();
    setGuides(data);
    setFilteredGuides(data);
    setLoading(false);
  };

  useEffect(() => {
    let result = [...guides];
    if (filterCategory) result = result.filter(g => g.category === filterCategory);
    if (searchKeyword) result = result.filter(g => g.title.includes(searchKeyword) || g.summary.includes(searchKeyword));
    setFilteredGuides(result);
  }, [filterCategory, searchKeyword, guides]);

  const handleSearch = async () => {
    if (!searchKeyword) { setFilteredGuides(guides); return; }
    const results = await guideApi.search(searchKeyword);
    setFilteredGuides(results);
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="sales-guide">
      <div className="board-header">
        <h2>销售指引</h2>
        <div className="guide-actions">
          <button className="btn btn-primary" onClick={() => setShowAIRecommend(true)}>AI策略推荐</button>
          <button className="btn btn-secondary">AI方案PPT生成</button>
        </div>
      </div>
      <div className="guide-filters">
        <div className="guide-category-tabs">
          <button className={`category-tab ${!filterCategory ? 'active' : ''}`} onClick={() => setFilterCategory('')}>全部</button>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <button
              key={key}
              className={`category-tab ${filterCategory === key ? 'active' : ''}`}
              onClick={() => setFilterCategory(key)}
              style={filterCategory === key ? { borderColor: cfg.color, color: cfg.color } : {}}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="guide-search">
          <input
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索指引..."
          />
          <button className="btn btn-sm btn-primary" onClick={handleSearch}>搜索</button>
        </div>
      </div>
      <div className="guide-list">
        {filteredGuides.length === 0 && <div className="empty-state">暂无匹配的指引</div>}
        {filteredGuides.map(guide => {
          const cfg = categoryConfig[guide.category] || {};
          return (
            <div key={guide.id} className="guide-card" onClick={() => setSelectedGuide(guide)} style={{ borderLeftColor: cfg.color }}>
              <div className="guide-card-header">
                <span className="guide-category-tag" style={{ backgroundColor: cfg.color + '20', color: cfg.color, borderColor: cfg.color }}>
                  {guide.category}
                </span>
              </div>
              <div className="guide-card-title">{guide.title}</div>
              <div className="guide-card-summary">{guide.summary}</div>
            </div>
          );
        })}
      </div>

      {selectedGuide && (
        <div className="modal-overlay" onClick={() => setSelectedGuide(null)}>
          <div className="modal-content guide-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedGuide.title}</h3>
              <button className="modal-close" onClick={() => setSelectedGuide(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="guide-detail-category">
                {selectedGuide.category}
              </div>
              <div className="guide-detail-summary">{selectedGuide.summary}</div>
              <div className="guide-detail-content">
                {selectedGuide.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAIRcommend && (
        <div className="modal-overlay" onClick={() => setShowAIRecommend(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>AI策略推荐</h3>
              <button className="modal-close" onClick={() => setShowAIRecommend(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="ai-recommend-content">
                <div className="ai-item">
                  <h4>推荐策略 1: 加速华为项目推进</h4>
                  <p>华为云存储项目当前处于S3(提出方案)阶段已12天，建议尽快安排技术评审会议，推动进入招投标阶段。可参考《金融行业打法手册》中的关键人突破策略。</p>
                </div>
                <div className="ai-item">
                  <h4>推荐策略 2: 京东项目跟进强化</h4>
                  <p>京东物流项目在S1阶段停留时间过长，建议尽快完成需求确认，推进到S2建立关系阶段。参考《初次接触客户话术模板》提升首次沟通效果。</p>
                </div>
                <div className="ai-item">
                  <h4>推荐策略 3: 美团数据仓库提案优化</h4>
                  <p>根据竞对分析，建议在方案中突出小文件性能优势，与竞品B形成差异化竞争。参考《某厂商B产品对比分析》制定针对性方案。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesGuide;
