import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import JSZip from 'jszip';

// 从docx提取所有表格数据
const extractTablesFromDocx = async (file) => {
  const zip = new JSZip();
  const content = await file.arrayBuffer();
  const zipContent = await zip.loadAsync(content);
  const docXml = await zipContent.file('word/document.xml').async('string');

  const tables = [];
  const tableRegex = /<w:tbl[ >][\s\S]*?<\/w:tbl>/g;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(docXml)) !== null) {
    const tableXml = tableMatch[0];
    const rows = [];
    const rowRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableXml)) !== null) {
      const cells = [];
      const cellRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
        const texts = [];
        const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let textMatch;
        while ((textMatch = textRegex.exec(cellMatch[0])) !== null) {
          texts.push(textMatch[1]);
        }
        cells.push(texts.join(''));
      }
      rows.push(cells);
    }
    tables.push(rows);
  }

  // 同时提取标题
  const paragraphs = [];
  const paraRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g;
  let paraMatch;
  while ((paraMatch = paraRegex.exec(docXml)) !== null) {
    const texts = [];
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let textMatch;
    while ((textMatch = textRegex.exec(paraMatch[1])) !== null) {
      texts.push(textMatch[1]);
    }
    const line = texts.join('').trim();
    if (line) paragraphs.push(line);
  }

  return { tables, paragraphs };
};

// 拆分"本周进展"与"下周计划"
const splitProgress = function(text) {
  if (!text) return { thisWeek: '', nextWeek: '' };
  // 匹配"下周计划"开头的部分（可能前面有换行或直接连接）
  var match = text.match(/([\s\S]*?)下周计划[：:\s]([\s\S]*)/);
  if (match) {
    return {
      thisWeek: match[1].replace(/^本周进展[：:\s]*/, '').trim(),
      nextWeek: match[2].trim()
    };
  }
  // 只有"本周进展"标记
  return {
    thisWeek: text.replace(/^本周进展[：:\s]*/, '').trim(),
    nextWeek: ''
  };
};

// 将里程碑文本按时间节点拆分为多行
const splitMilestones = function(text) {
  if (!text || text.trim() === '-' || !text.trim()) return [];
  var t = text.trim();
  // 格式1：用"XX时间："分隔，如"立项时间：XX招标时间：XX" — 匹配后直接返回
  if (/[\u4e00-\u9fa5]{2,4}时间[：:]/.test(t)) {
    return t.split(/(?=[\u4e00-\u9fa5]{2,4}时间[：:])/g).filter(function(s) { return s.trim(); }).map(function(s) { return s.trim(); });
  }
  // 格式2：用"XXXX-XX-XX："或"XXXX年XX月XX日"分隔
  var dateParts = t.split(/(?=\d{4}[-年]\d{1,2}[-月]\d{1,2}[日号]?[之前]*[：:]?)/g).filter(function(s) { return s.trim(); });
  if (dateParts.length > 1) return dateParts.map(function(s) { return s.trim(); });
  // 格式3：用"XXXX年QX"或"XX年QX"分隔（季度格式，必须有"年"避免误匹配）
  var qParts = t.split(/(?=\d{2,4}年Q\d)/g).filter(function(s) { return s.trim(); });
  if (qParts.length > 1) return qParts.map(function(s) { return s.trim(); });
  // 无法拆分，原样返回
  return [t];
};

// 识别表格并映射到section
const classifyTables = (tables, paragraphs) => {
  const result = {
    title: paragraphs[0] || '',
    bizProjects: [],
    wpsProjects: [],
    wpsDeptReports: [],
    feishuProjects: [],
    shulijuProjects: [],
    juicefsProjects: [],
    loongsonProjects: [],
    newBizProjects: [],
    newBizMeetings: [],
    deliveryProjects: [],
    rdProjects: [],
    rdWorkItems: [],
    pocProjects: [],
    inspectionSummary: '',
    pocSummary: '',
  };

  // 用表头精确匹配，按table顺序依次分配
  let bizAssigned = false, shulijuAssigned = false, juicefsAssigned = false;
  let wpsProjAssigned = false, wpsDeptAssigned = false;

  for (const rows of tables) {
    if (rows.length < 2) continue;
    const header = rows[0].map(h => h.trim());
    const hStr = header.join(',');

    // 5列: 项目名称,销售/SA,项目状态,本周进展/下周计划,备注
    if (header.length === 5 && header.includes('项目名称') && header.includes('销售/SA') && header.includes('项目状态') && header.includes('本周进展') && header.includes('备注')) {
      if (!bizAssigned) {
        result.bizProjects = rows.slice(1).map(function(r) {
          var sp = splitProgress(r[3] || '');
          return { name: r[0]||'', sales: r[1]||'', status: r[2]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek, remark: r[4]||'' };
        });
        bizAssigned = true;
      } else if (!shulijuAssigned) {
        result.shulijuProjects = rows.slice(1).map(function(r) {
          var sp = splitProgress(r[3] || '');
          return { name: r[0]||'', sales: r[1]||'', status: r[2]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek, remark: r[4]||'' };
        });
        shulijuAssigned = true;
      } else if (!juicefsAssigned) {
        result.juicefsProjects = rows.slice(1).map(function(r) {
          var sp = splitProgress(r[3] || '');
          return { name: r[0]||'', sales: r[1]||'', status: r[2]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek, remark: r[4]||'' };
        });
        juicefsAssigned = true;
      }
      continue;
    }

    // 5列含WPS部门: WPS项目表 (列0空，列1=项目名称，列2=销售，列3=WPS部门，列4=项目情况)
    if (header.length === 5 && header.includes('项目名称') && header.includes('WPS部门') && header.includes('项目情况')) {
      if (!wpsProjAssigned) {
        result.wpsProjects = rows.slice(1).filter(function(r) { return r[1] && r[1].trim(); }).map(function(r) {
          var raw = r[1].trim();
          // 从项目名称中提取规模和金额
          var amount = '';
          var scale = '';
          var amountMatch = raw.match(/([\d.]+万[\/月预付]*)/);
          if (amountMatch) amount = amountMatch[1];
          var scaleMatch = raw.match(/([\d.]+\s*(?:TB|PB|GB))/i);
          if (scaleMatch) scale = scaleMatch[1];
          // 纯项目名（去掉规模和金额）
          var name = raw.replace(/[\d.]+\s*(TB|PB|GB)/gi, '').replace(/[\d.]+万[\/月预付]*/g, '').replace(/纯软[，,]?\s*\d{2,4}Q\d?/g, '').replace(/文档中心\+私有化存储/g, '').trim();

          return {
            name: name,
            scale: scale,
            amount: amount,
            sales: (r[2] || '').replace(/@/g, '').trim(),
            wpsDept: (r[3] || '').trim(),
            thisWeek: splitProgress(r[4] || '').thisWeek,
            nextWeek: splitProgress(r[4] || '').nextWeek
          };
        });
        wpsProjAssigned = true;
      }
      continue;
    }

    // 3列: WPS部门, WPS人员, 本周进展及下周计划 (部门周报，独立展示)
    if (header.length === 3 && header.includes('WPS部门') && header.includes('WPS人员')) {
      if (!wpsDeptAssigned) {
        result.wpsDeptReports = rows.slice(1).map(function(r) {
          var sp = splitProgress(r[2] || '');
          return {
            dept: (r[0] || '').trim(),
            members: (r[1] || '').trim(),
            thisWeek: sp.thisWeek,
            nextWeek: sp.nextWeek
          };
        });
        wpsDeptAssigned = true;
      }
      continue;
    }

    // 5列: 飞书线 - 项目来源, 项目名称, 项目状态, 本周进展与下周计划, 里程碑
    if (header.length === 5 && header.includes('项目来源') && header.includes('里程碑')) {
      result.feishuProjects = rows.slice(1).map(function(r) {
        var sp = splitProgress(r[3] || '');
        return { source: r[0]||'', name: r[1]||'', status: r[2]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek, milestones: splitMilestones(r[4]) };
      });
      continue;
    }

    // 3列: 龙芯渠道 - 项目名称, 项目情况, 备注
    if (header.length === 3 && header.includes('项目名称') && header.includes('项目情况') && !header.includes('分类')) {
      result.loongsonProjects = rows.slice(1).map(function(r) {
        var sp = splitProgress(r[1] || '');
        return { name: r[0]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek, remark: r[2]||'' };
      });
      continue;
    }

    // 3列: 新商机Token/存储 - 项目名称, 分类, 项目情况
    if (header.length === 3 && header.includes('项目名称') && header.includes('分类') && header.includes('项目情况')) {
      result.newBizProjects = rows.slice(1).map(function(r) {
        var sp = splitProgress(r[2] || '');
        return { name: r[0]||'', category: r[1]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek };
      });
      continue;
    }

    // 7列: 新商机客户拜访 - 客户名称, 销售/SA, 行业, 合作性质, 商机, 状态, 会议内容
    if (header.length === 7 && header.includes('客户名称') && header.includes('行业') && header.includes('合作性质') && header.includes('状态')) {
      if (result.newBizMeetings.length === 0) {
        result.newBizMeetings = rows.slice(1).map(r => ({
          name: r[0]||'', sales: r[1]||'', industry: r[2]||'',
          cooperation: r[3]||'', opportunity: r[4]||'',
          status: r[5]||'', content: r[6]||''
        }));
      }
      continue;
    }

    // 2列: 交付项目 - 项目, 近期状况
    if (header.length === 2 && (header.includes('项目') || hStr.includes('项目,近期状况') || hStr.includes('项目, 近期状况'))) {
      result.deliveryProjects = rows.slice(1).map(r => ({
        name: r[0]||'', status: r[1]||''
      }));
      continue;
    }

    // 3列: 研发重点项目 - 项目名称, 本周进展, 下周计划
    if (header.length === 3 && header.includes('项目名称') && header.includes('本周进展') && header.includes('下周计划') && !header.includes('里程碑')) {
      result.rdProjects = rows.slice(1).map(function(r) {
        var sp = splitProgress(r[1] || '');
        return { name: r[0]||'', thisWeek: sp.thisWeek || (r[1]||''), nextWeek: sp.nextWeek || (r[2]||'') };
      });
      continue;
    }

    // 3列: 研发工作项 - 项目名称, 本周进展与下周计划, 里程碑
    if (header.length === 3 && header.includes('项目名称') && header.includes('本周进展与下周计划') && header.includes('里程碑')) {
      result.rdWorkItems = rows.slice(1).map(function(r) {
        var sp = splitProgress(r[1] || '');
        return { name: r[0]||'', thisWeek: sp.thisWeek, nextWeek: sp.nextWeek, milestones: splitMilestones(r[2]) };
      });
      continue;
    }
  }

  // 从段落中提取巡检和POC汇总
  var allText = paragraphs.join('\n');
  var inspMatch = allText.match(/巡检情况汇总[：:\s]*([\s\S]{10,400}?)(?=\n\n|\nPOC|3\.\s|研发|$)/);
  if (inspMatch) result.inspectionSummary = inspMatch[1].trim();
  var pocMatch = allText.match(/POC项目汇总[：:\s]*([\s\S]{10,500}?)(?=\n\n|3\.\s|研发|$)/);
  if (pocMatch) result.pocSummary = pocMatch[1].trim();

  // 从段落中提取POC项目列表
  for (var line of paragraphs) {
    var pocLine = line.match(/^POC\s+(.+)/);
    if (pocLine) {
      var status = /已完成/.test(pocLine[1]) ? '已完成' : '持续关注';
      var name = pocLine[1].replace(/已完成|持续关注|测试中|进行中/g, '').trim();
      result.pocProjects.push({ name: name, status: status });
    }
  }

  return result;
};

// section标签
const sectionLabels = {
  bizProjects: '事业部项目',
  wpsProjects: 'WPS客户',
  feishuProjects: '飞书线',
  shulijuProjects: '数力聚线',
  juicefsProjects: 'JuiceFS线',
  loongsonProjects: '龙芯渠道线',
  newBizProjects: '新商机-Token/存储',
  newBizMeetings: '新商机-客户拜访',
};

const sectionColors = {
  bizProjects: '#1890ff',
  wpsProjects: '#52c41a',
  feishuProjects: '#faad14',
  shulijuProjects: '#722ed1',
  juicefsProjects: '#13c2c2',
  loongsonProjects: '#f5222d',
  newBizProjects: '#eb2f96',
  newBizMeetings: '#fa541c',
};

const WeeklyReportDashboard = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [activeSection, setActiveSection] = useState('bizProjects');
  const [report, setReport] = useState(null);

  const parseDocx = async (file) => {
    setUploading(true);
    setUploadMessage('');

    try {
      const { tables, paragraphs } = await extractTablesFromDocx(file);
      const parsed = classifyTables(tables, paragraphs);
      setReport(parsed);
      setUploadMessage('文档解析成功！');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage('');
      }, 1200);
    } catch (error) {
      console.error('解析文档失败:', error);
      setUploadMessage('解析文档失败，请确保上传的是有效的docx文件');
    }

    setUploading(false);
  };

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

  // 统计各section的项目数
  const getSectionCounts = () => {
    if (!report) return {};
    const counts = {};
    for (const [key, label] of Object.entries(sectionLabels)) {
      if (key === 'wpsProjects') {
        counts[key] = (report.wpsProjects?.length || 0) + (report.wpsDeptReports?.length || 0);
      } else {
        counts[key] = report[key]?.length || 0;
      }
    }
    return counts;
  };

  const sectionCounts = getSectionCounts();
  const sectionKeys = report
    ? Object.keys(sectionLabels).filter(k => sectionCounts[k] > 0)
    : [];

  // 业务线项目分布饼图
  const getBizLinePieOption = () => {
    const data = sectionKeys.map(key => ({
      name: sectionLabels[key],
      value: sectionCounts[key],
      itemStyle: { color: sectionColors[key] }
    }));
    return {
      title: { text: '各业务线项目分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}个', fontSize: 12, lineHeight: 16 },
        labelLine: { show: true, length: 10, length2: 6, smooth: true },
        emphasis: { label: { fontSize: 14, fontWeight: 'bold' } },
        data
      }]
    };
  };

  // 项目状态分布饼图
  const getStatusPieOption = () => {
    if (!report) return {};
    // 统计所有项目的状态
    var statusMap = {};
    var allProjects = [].concat(
      report.bizProjects || [],
      report.feishuProjects || [],
      report.shulijuProjects || [],
      report.juicefsProjects || [],
      report.newBizMeetings || []
    );
    allProjects.forEach(function(p) {
      var s = p.status || '未知';
      // 归一化状态名称
      if (/方案|报价|询价/.test(s)) s = '方案/报价阶段';
      else if (/POC|测试/.test(s)) s = 'POC/测试';
      else if (/签署|中标|合同/.test(s)) s = '合同签署';
      else if (/交付|部署|实施/.test(s)) s = '交付实施';
      else if (/前期|交流|建联/.test(s)) s = '前期交流';
      else if (/Upside/.test(s)) s = 'Upside';
      else if (/Probable/.test(s)) s = 'Probable';
      else if (/立项/.test(s)) s = '立项中';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    var colorMap = {
      '前期交流': '#8c8c8c',
      '方案/报价阶段': '#1890ff',
      'POC/测试': '#faad14',
      '立项中': '#13c2c2',
      '合同签署': '#722ed1',
      '交付实施': '#52c41a',
      'Upside': '#52c41a',
      'Probable': '#faad14',
      '未知': '#d9d9d9'
    };
    var data = Object.entries(statusMap).map(function(e) {
      return { name: e[0], value: e[1], itemStyle: { color: colorMap[e[0]] || '#1890ff' } };
    }).sort(function(a, b) { return b.value - a.value; });
    return {
      title: { text: '项目状态分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}个', fontSize: 12, lineHeight: 16 },
        labelLine: { show: true, length: 10, length2: 6, smooth: true },
        emphasis: { label: { fontSize: 14, fontWeight: 'bold' } },
        data
      }]
    };
  };

  // 渲染项目表格
  const renderProjectTable = () => {
    if (!report) return null;

    // WPS客户专属渲染
    if (activeSection === 'wpsProjects') {
      return renderWpsSection();
    }

    const data = report[activeSection] || [];
    if (data.length === 0) return <div className="wrd-empty">暂无数据</div>;

    const firstItem = data[0];
    const headers = Object.keys(firstItem);

    const headerLabels = {
      name: '项目名称', sales: '销售/SA', status: '项目状态',
      thisWeek: '本周进展', nextWeek: '下周计划', remark: '备注',
      wpsDept: 'WPS部门', source: '项目来源', milestones: '里程碑',
      category: '分类', industry: '行业', cooperation: '合作性质',
      opportunity: '商机', content: '会议内容',
    };

    // 列宽配置：key对应字段名，值为CSS宽度
    const colWidths = {
      name: '12%', sales: '8%', status: '8%',
      thisWeek: '25%', nextWeek: '20%', remark: '7%',
      wpsDept: '8%', source: '8%', milestones: '15%',
      category: '8%', industry: '8%', cooperation: '8%',
      opportunity: '8%', content: '25%',
    };

    return (
      <div className="wrd-table-wrap">
        <table className="data-table wrd-table">
          <colgroup>
            {headers.map(h => <col key={h} style={{ width: colWidths[h] || 'auto' }} />)}
          </colgroup>
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{headerLabels[h] || h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri}>
                {headers.map((h, ci) => {
                  const val = row[h] || '';
                  const isName = h === 'name';
                  const isStatus = h === 'status';
                  const statusColor =
                    /完成|签署|中标/.test(val) ? '#52c41a' :
                    /方案|报价|测试|询价|立项/.test(val) ? '#1890ff' :
                    /前期|取消|搁置/.test(val) ? '#8c8c8c' :
                    /Upside/.test(val) ? '#52c41a' :
                    /Probable/.test(val) ? '#faad14' : '#1890ff';

                  if (h === 'thisWeek') {
                    return (
                      <td key={ci} className="wrd-td-progress">
                        {val ? <div className="wrd-progress-segment wrd-progress-this">{val}</div> : '-'}
                      </td>
                    );
                  }
                  if (h === 'nextWeek') {
                    return (
                      <td key={ci} className="wrd-td-progress">
                        {val ? <div className="wrd-progress-segment wrd-progress-next">{val}</div> : '-'}
                      </td>
                    );
                  }
                  if (h === 'milestones') {
                    var ms = row.milestones || [];
                    return (
                      <td key={ci} className="wrd-td-milestone">
                        {ms.length > 0 ? ms.map(function(m, mi) {
                          return <div key={mi} className="wrd-milestone-line">{m}</div>;
                        }) : '-'}
                      </td>
                    );
                  }

                  return (
                    <td key={ci} className={isName ? 'wrd-td-name' : ''}>
                      {isStatus ? (
                        <span className="wrd-status-tag" style={{ color: statusColor, borderColor: statusColor }}>{val}</span>
                      ) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // WPS客户专属渲染
  const renderWpsSection = () => {
    const projects = report.wpsProjects || [];
    const deptReports = report.wpsDeptReports || [];

    return (
      <div className="wrd-wps-wrap">
        {/* 项目卡片列表 */}
        {projects.length > 0 && (
          <div className="wrd-wps-projects">
            <div className="wrd-wps-subtitle">项目跟踪 ({projects.length})</div>
            <div className="wrd-wps-grid">
              {projects.map((p, i) => {
                var statusType = 'active';
                if (/取消|搁置/.test(p.thisWeek) || /取消|搁置/.test(p.nextWeek)) statusType = 'cancelled';
                else if (/签署|中标|验收/.test(p.thisWeek) || /签署|中标|验收/.test(p.nextWeek)) statusType = 'success';
                else if (/POC|测试/.test(p.thisWeek) || /POC|测试/.test(p.nextWeek)) statusType = 'testing';
                else if (/报价|方案|立项/.test(p.thisWeek) || /报价|方案|立项/.test(p.nextWeek)) statusType = 'proposal';

                return (
                  <div key={i} className={`wrd-wps-card wrd-wps-card-${statusType}`}>
                    <div className="wrd-wps-card-head">
                      <span className="wrd-wps-card-name">{p.name}</span>
                      {p.scale && <span className="wrd-wps-card-scale">{p.scale}</span>}
                    </div>
                    {p.amount && <div className="wrd-wps-card-amount">{p.amount}</div>}
                    <div className="wrd-wps-card-meta">
                      {p.sales && <span className="wrd-wps-card-sales">{p.sales}</span>}
                      {p.wpsDept && <span className="wrd-wps-card-dept">{p.wpsDept}</span>}
                    </div>
                    {p.thisWeek && (
                      <div className="wrd-progress-segment wrd-progress-this">
                        <span className="wrd-progress-label">本周进展</span>{p.thisWeek}
                      </div>
                    )}
                    {p.nextWeek && (
                      <div className="wrd-progress-segment wrd-progress-next">
                        <span className="wrd-progress-label">下周计划</span>{p.nextWeek}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 部门周报 */}
        {deptReports.length > 0 && (
          <div className="wrd-wps-depts" style={{ marginTop: 24 }}>
            <div className="wrd-wps-subtitle">部门周报 ({deptReports.length})</div>
            {deptReports.map((d, i) => (
              <div key={i} className="wrd-wps-dept-card">
                <div className="wrd-wps-dept-head">
                  <span className="wrd-wps-dept-name">{d.dept}</span>
                  {d.members && <span className="wrd-wps-dept-members">{d.members}</span>}
                </div>
                {d.thisWeek && (
                  <div className="wrd-progress-segment wrd-progress-this">
                    <span className="wrd-progress-label">本周进展</span>{d.thisWeek}
                  </div>
                )}
                {d.nextWeek && (
                  <div className="wrd-progress-segment wrd-progress-next">
                    <span className="wrd-progress-label">下周计划</span>{d.nextWeek}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && deptReports.length === 0 && (
          <div className="wrd-empty">暂无数据</div>
        )}
      </div>
    );
  };

  // 无数据初始展示
  if (!report) {
    return (
      <div className="wrd-container">
        <div className="wrd-header">
          <h2>周报汇总</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
            上传周报文档
          </button>
        </div>
        <div className="wrd-empty-state">
          <div className="wrd-empty-icon">&#128203;</div>
          <div className="wrd-empty-text">请上传周报文档以查看汇总数据</div>
          <div className="wrd-empty-hint">支持 .docx 格式，解析后自动更新各业务线项目数据</div>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            上传文档
          </button>
        </div>
        {renderUploadModal()}
      </div>
    );
  }

  return (
    <div className="wrd-container">
      <div className="wrd-header">
        <h2>{report.title || '周报汇总'}</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
          更新周报文档
        </button>
      </div>

      {/* 项目统计概览 */}
      <div className="wrd-stats">
        {sectionKeys.map(key => (
          <div key={key} className="wrd-stat-card" style={{ borderLeftColor: sectionColors[key] }}>
            <div className="wrd-stat-num" style={{ color: sectionColors[key] }}>{sectionCounts[key]}</div>
            <div className="wrd-stat-label">{sectionLabels[key]}</div>
          </div>
        ))}
        {report.deliveryProjects.length > 0 && (
          <div className="wrd-stat-card" style={{ borderLeftColor: '#1890ff' }}>
            <div className="wrd-stat-num" style={{ color: '#1890ff' }}>{report.deliveryProjects.length}</div>
            <div className="wrd-stat-label">交付项目</div>
          </div>
        )}
        {report.rdProjects.length > 0 && (
          <div className="wrd-stat-card" style={{ borderLeftColor: '#722ed1' }}>
            <div className="wrd-stat-num" style={{ color: '#722ed1' }}>{report.rdProjects.length}</div>
            <div className="wrd-stat-label">研发项目</div>
          </div>
        )}
      </div>

      {/* 统计图表 */}
      <div className="wrd-charts-row">
        <div className="wrd-chart-card">
          <ReactECharts option={getBizLinePieOption()} style={{ height: '280px' }} />
        </div>
        <div className="wrd-chart-card">
          <ReactECharts option={getStatusPieOption()} style={{ height: '280px' }} />
        </div>
      </div>

      {/* 业务线Tab导航 */}
      <div className="wrd-tabs">
        {sectionKeys.map(key => (
          <button
            key={key}
            className={`wrd-tab ${activeSection === key ? 'wrd-tab-active' : ''}`}
            style={activeSection === key ? { borderColor: sectionColors[key], color: sectionColors[key] } : {}}
            onClick={() => setActiveSection(key)}
          >
            {sectionLabels[key] || key}
            <span className="wrd-tab-count" style={activeSection === key ? { background: sectionColors[key] } : {}}>
              {sectionCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* 项目表格 */}
      <div className="wrd-section">
        {renderProjectTable()}
      </div>

      {/* 运维交付 */}
      {report.deliveryProjects.length > 0 && (
        <div className="wrd-section">
          <h3 className="wrd-section-title">解决方案及运维交付</h3>

          {report.inspectionSummary && (
            <div className="wrd-summary-box">
              <div className="wrd-sub-title">巡检情况汇总</div>
              <div className="wrd-summary-text">{report.inspectionSummary}</div>
            </div>
          )}

          {report.pocSummary && (
            <div className="wrd-summary-box">
              <div className="wrd-sub-title">POC项目汇总</div>
              <div className="wrd-summary-text">{report.pocSummary}</div>
            </div>
          )}

          <div className="wrd-sub-title" style={{ marginTop: 16 }}>交付项目状况</div>
          <div className="wrd-delivery-grid">
            {report.deliveryProjects.filter(p => !/巡检/.test(p.name)).map((p, i) => (
              <div key={i} className="wrd-delivery-card">
                <div className="wrd-delivery-name">{p.name}</div>
                <div className="wrd-delivery-status">{p.status}</div>
              </div>
            ))}
          </div>

          {report.pocProjects.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="wrd-sub-title">POC项目</div>
              <div className="wrd-poc-grid">
                {report.pocProjects.map((p, i) => (
                  <div key={i} className={`wrd-poc-chip ${p.status === '已完成' ? 'wrd-poc-done' : 'wrd-poc-ongoing'}`}>
                    <span>{p.name}</span>
                    <span className="wrd-poc-status">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 研发进展 */}
      {(report.rdProjects.length > 0 || report.rdWorkItems.length > 0) && (
        <div className="wrd-section">
          <h3 className="wrd-section-title">研发进展</h3>
          <div className="wrd-rd-list">
            {report.rdProjects.map((p, i) => (
              <div key={i} className="wrd-rd-card">
                <div className="wrd-rd-name">{p.name}</div>
                {p.thisWeek && (
                  <div className="wrd-progress-segment wrd-progress-this">
                    <span className="wrd-progress-label">本周进展</span>{p.thisWeek}
                  </div>
                )}
                {p.nextWeek && (
                  <div className="wrd-progress-segment wrd-progress-next">
                    <span className="wrd-progress-label">下周计划</span>{p.nextWeek}
                  </div>
                )}
              </div>
            ))}
            {report.rdWorkItems.map((p, i) => (
              <div key={`w${i}`} className="wrd-rd-card">
                <div className="wrd-rd-name">{p.name}</div>
                {p.thisWeek && (
                  <div className="wrd-progress-segment wrd-progress-this">
                    <span className="wrd-progress-label">本周进展</span>{p.thisWeek}
                  </div>
                )}
                {p.nextWeek && (
                  <div className="wrd-progress-segment wrd-progress-next">
                    <span className="wrd-progress-label">下周计划</span>{p.nextWeek}
                  </div>
                )}
                {p.milestones && p.milestones.length > 0 && (
                  <div className="wrd-progress-segment wrd-progress-milestone">
                    <span className="wrd-progress-label">里程碑</span>
                    {p.milestones.map(function(m, mi) {
                      return <div key={mi} className="wrd-milestone-line">{m}</div>;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {renderUploadModal()}
    </div>
  );

  function renderUploadModal() {
    return showUploadModal && (
      <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
        <div className="modal-content wrd-upload-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">上传周报文档</h3>
            <button className="modal-close" onClick={() => setShowUploadModal(false)}>&times;</button>
          </div>
          <div style={{ padding: '20px 0' }}>
            <div className="wrd-drop-zone" onClick={() => document.getElementById('wrd-docx-upload').click()}>
              <div className="wrd-drop-icon">&#9997;</div>
              <div className="wrd-drop-main">点击选择文件上传</div>
              <div className="wrd-drop-hint">仅支持 .docx 格式</div>
              <input id="wrd-docx-upload" type="file" accept=".docx" style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>
            {uploading && <div className="wrd-upload-status">正在解析文档...</div>}
            {uploadMessage && (
              <div className={`wrd-upload-msg ${uploadMessage.includes('成功') ? 'wrd-msg-ok' : 'wrd-msg-err'}`}>
                {uploadMessage}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-default" onClick={() => setShowUploadModal(false)}>关闭</button>
          </div>
        </div>
      </div>
    );
  }
};

export default WeeklyReportDashboard;
