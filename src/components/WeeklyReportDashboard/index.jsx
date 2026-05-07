import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import JSZip from 'jszip';
import {
  projectStageData,
  businessLineData,
  opportunityStatusData,
  keyProjects,
  rdProgress,
  pocProjects,
  industryDistribution,
  tokenOpportunities,
  weeklyReportInfo
} from '../../data/weeklyReportData';

const WeeklyReportDashboard = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [reportData, setReportData] = useState({
    totalProjects: weeklyReportInfo.totalProjects,
    totalAmount: weeklyReportInfo.totalAmount,
    newOpportunities: weeklyReportInfo.newOpportunities,
    pocCompleted: weeklyReportInfo.pocCompleted,
    summary: '本周重点跟进恒扬数据、珠海影像云等大客户项目，多个项目进入报价阶段。WPS渠道项目进展顺利，中石化项目合同正在审核中。Token业务新增多个商机，正在测试验证中。',
    nextPlan: '下周重点推进中云星图合同签署，跟进上期所采购流程，继续跟进Token商机测试进展。',
    weekEnd: weeklyReportInfo.weekEnd,
    rawContent: ''
  });

  // 解析docx文件
  const parseDocx = async (file) => {
    setUploading(true);
    setUploadMessage('');

    try {
      const zip = new JSZip();
      const content = await file.arrayBuffer();
      const zipContent = await zip.loadAsync(content);

      // 读取word/document.xml
      const docXml = await zipContent.file('word/document.xml').async('string');

      // 提取纯文本内容
      const textContent = docXml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // 解析关键数据
      const parsedData = parseReportContent(textContent);

      setReportData({
        ...reportData,
        ...parsedData,
        rawContent: textContent.substring(0, 2000) + '...'
      });

      setUploadMessage('文档解析成功！');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage('');
      }, 1500);
    } catch (error) {
      console.error('解析文档失败:', error);
      setUploadMessage('解析文档失败，请确保上传的是有效的docx文件');
    }

    setUploading(false);
  };

  // 解析报告内容
  const parseReportContent = (content) => {
    const result = {
      totalProjects: 88,
      totalAmount: 1165,
      newOpportunities: 15,
      pocCompleted: 6,
      summary: '',
      nextPlan: ''
    };

    // 提取项目数量
    const projectMatch = content.match(/总项目数[：:]\s*(\d+)/);
    if (projectMatch) result.totalProjects = parseInt(projectMatch[1]);

    // 提取金额
    const amountMatch = content.match(/总金额[：:]\s*(\d+)/);
    if (amountMatch) result.totalAmount = parseInt(amountMatch[1]);

    // 提取新增商机
    const oppMatch = content.match(/新增商机[：:]\s*(\d+)/);
    if (oppMatch) result.newOpportunities = parseInt(oppMatch[1]);

    // 提取POC完成数
    const pocMatch = content.match(/POC完成[：:]\s*(\d+)/);
    if (pocMatch) result.pocCompleted = parseInt(pocMatch[1]);

    // 提取周报日期
    const dateMatch = content.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    if (dateMatch) result.weekEnd = dateMatch[1];

    // 提取本周总结（简单提取）
    const summaryMatch = content.match(/本周工作总结[：:]\s*([^\n。]+。?)/);
    if (summaryMatch) result.summary = summaryMatch[1].trim();

    // 提取下周计划
    const planMatch = content.match(/下周工作计划[：:]\s*([^\n。]+。?)/);
    if (planMatch) result.nextPlan = planMatch[1].trim();

    // 如果没有匹配到，使用智能提取
    if (!result.summary) {
      const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 20);
      if (sentences.length > 0) {
        result.summary = sentences.slice(0, 3).join('。');
      }
    }

    if (!result.nextPlan) {
      const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 10);
      if (sentences.length > 3) {
        result.nextPlan = sentences.slice(-3).join('。');
      }
    }

    return result;
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        parseDocx(file);
      } else {
        setUploadMessage('请上传.docx格式的文件');
      }
    }
  };

  // 项目阶段饼图
  const getStageOption = () => ({
    title: { text: '项目阶段分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: projectStageData.map((item, index) => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#f5222d'][index] }
      }))
    }]
  });

  // 业务线柱状图
  const getBusinessLineOption = () => ({
    title: { text: '各业务线项目统计', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['项目数', '金额(万)'], top: 30 },
    xAxis: { type: 'category', data: businessLineData.map(d => d.name), axisLabel: { interval: 0, rotate: 30, fontSize: 10 } },
    yAxis: [
      { type: 'value', name: '项目数', position: 'left' },
      { type: 'value', name: '金额(万)', position: 'right' }
    ],
    series: [
      { name: '项目数', type: 'bar', data: businessLineData.map(d => d.count), itemStyle: { color: '#1890ff' } },
      { name: '金额(万)', type: 'line', yAxisIndex: 1, data: businessLineData.map(d => d.amount), itemStyle: { color: '#52c41a' } }
    ]
  });

  // 商机状态环形图
  const getStatusOption = () => ({
    title: { text: '商机状态分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c}个' },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '55%'],
      data: opportunityStatusData.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: item.color }
      })),
      label: { formatter: '{b}\n{c}个' }
    }]
  });

  // 行业分布饼图
  const getIndustryOption = () => ({
    title: { text: '客户行业分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
    series: [{
      type: 'pie',
      radius: '65%',
      center: ['50%', '55%'],
      data: industryDistribution,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  });

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>创新业务部周报 - {reportData.weekEnd}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#999' }}>业务拓展周报</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
            更新周报文档
          </button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', color: '#fff' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reportData.totalProjects}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>总项目数</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '8px', color: '#fff' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reportData.totalAmount}万</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>总金额</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '20px', borderRadius: '8px', color: '#fff' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reportData.newOpportunities}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>新增商机</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '20px', borderRadius: '8px', color: '#fff' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reportData.pocCompleted}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>POC完成</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#fafafa', borderRadius: '8px', padding: '16px' }}>
          <ReactECharts option={getStageOption()} style={{ height: '280px' }} />
        </div>
        <div style={{ background: '#fafafa', borderRadius: '8px', padding: '16px' }}>
          <ReactECharts option={getBusinessLineOption()} style={{ height: '280px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#fafafa', borderRadius: '8px', padding: '16px' }}>
          <ReactECharts option={getStatusOption()} style={{ height: '280px' }} />
        </div>
        <div style={{ background: '#fafafa', borderRadius: '8px', padding: '16px' }}>
          <ReactECharts option={getIndustryOption()} style={{ height: '280px' }} />
        </div>
      </div>

      {/* 重点项目表格 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#333' }}>重点项目跟踪</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>项目名称</th>
              <th>金额/规模</th>
              <th>阶段</th>
              <th>负责人</th>
            </tr>
          </thead>
          <tbody>
            {keyProjects.map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: '500' }}>{p.name}</td>
                <td style={{ color: '#1890ff' }}>{p.amount}</td>
                <td><span className={`status-tag ${p.stage}`}>{p.stage}</span></td>
                <td style={{ color: '#666' }}>{p.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Token商机 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#333' }}>Token商机跟踪</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {tokenOpportunities.map((t, i) => (
            <div key={i} style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #722ed1' }}>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{t.name}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>状态: {t.stage}</div>
              <div style={{ fontSize: '14px', color: '#1890ff', marginTop: '4px' }}>{t.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 研发进展 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#333' }}>研发进展</h3>
        {rdProgress.map((r, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>{r.name}</span>
              <span style={{ color: r.progress >= 70 ? '#52c41a' : r.progress >= 40 ? '#1890ff' : '#faad14' }}>{r.progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${r.progress}%`, background: r.progress >= 70 ? '#52c41a' : r.progress >= 40 ? '#1890ff' : '#faad14' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* POC项目 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#333' }}>POC项目汇总</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {pocProjects.map((p, i) => (
            <div key={i} style={{ background: p.status === '已完成' ? '#f6ffed' : '#fffbe6', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{p.name}</span>
              <span style={{ color: p.status === '已完成' ? '#52c41a' : '#faad14', fontSize: '12px' }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 周报总结 */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#333' }}>本周工作总结</h3>
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', lineHeight: '1.8', color: '#666' }}>
          {reportData.summary || '暂无内容'}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#333' }}>下周工作计划</h3>
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', lineHeight: '1.8', color: '#666' }}>
          {reportData.nextPlan || '暂无内容'}
        </div>
      </div>

      {/* 上传弹窗 */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">更新周报文档</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>

            <div style={{ padding: '20px 0' }}>
              <div
                style={{
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: '#fafafa'
                }}
                onClick={() => document.getElementById('docx-upload').click()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <div style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>点击或拖拽文件到此区域上传</div>
                <div style={{ fontSize: '13px', color: '#999' }}>仅支持 .docx 格式文件</div>
                <input
                  id="docx-upload"
                  type="file"
                  accept=".docx"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>

              {uploading && (
                <div style={{ textAlign: 'center', marginTop: '16px', color: '#1890ff' }}>
                  正在解析文档...
                </div>
              )}

              {uploadMessage && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '16px',
                  padding: '12px',
                  background: uploadMessage.includes('成功') ? '#f6ffed' : '#fff1f0',
                  borderRadius: '4px',
                  color: uploadMessage.includes('成功') ? '#52c41a' : '#f5222d'
                }}>
                  {uploadMessage}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowUploadModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportDashboard;
