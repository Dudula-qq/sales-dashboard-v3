// 模拟数据 - 销售看板系统 V2.0

// 商机8+1阶段
export const projectStages = [
  { code: 'S1', name: '机会确认', color: '#e3f2fd' },
  { code: 'S2', name: '建立关系', color: '#e8f5e9' },
  { code: 'S3', name: '提出方案', color: '#fff3e0' },
  { code: 'S4', name: '达成协议/招投标', color: '#fce4ec' },
  { code: 'S5', name: '签署合同', color: '#f3e5f5' },
  { code: 'S6', name: '交付验收', color: '#e0f2f1' },
  { code: 'S7', name: '验收完成', color: '#e8eaf6' },
  { code: 'S8', name: '完成回款', color: '#fff8e1' },
  { code: 'End', name: '商机关闭', color: '#f5f5f5' },
];

// 客户分级
export const customerGrades = [
  { key: 'Committed', label: 'Committed', color: '#52c41a', bgColor: '#f6ffed', desc: '已承诺客户，资源优先保障', followUpReq: '每周至少1次', resourceLevel: '高' },
  { key: 'Upside', label: 'Upside', color: '#1890ff', bgColor: '#e6f7ff', desc: '潜力客户，积极推动转化', followUpReq: '每两周至少1次', resourceLevel: '中' },
  { key: 'Probably', label: 'Probably', color: '#8c8c8c', bgColor: '#fafafa', desc: '可能客户，保持关注', followUpReq: '每月至少1次', resourceLevel: '低' },
];

// 客户数据 - 按销售分组
export const customers = [
  // 销售A的客户
  { id: 1, name: '华为技术有限公司', contact: '张经理', phone: '13800138001', status: '意向', stage: '需求确认', amount: 500000, lastContact: '2026-05-06', salesId: 2, salesName: '销售A', grade: 'Committed', threePhase: '跟踪', fiveElements: { background: true, budget: true, keyPerson: true, stage: true, competition: false } },
  { id: 2, name: '腾讯科技', contact: '李总监', phone: '13800138002', status: '线索', stage: '初次接触', amount: 300000, lastContact: '2026-05-05', salesId: 2, salesName: '销售A', grade: 'Upside', threePhase: '建联', fiveElements: { background: true, budget: false, keyPerson: false, stage: false, competition: false } },
  { id: 3, name: '阿里巴巴集团', contact: '王总', phone: '13800138003', status: '报价', stage: '方案报价', amount: 800000, lastContact: '2026-05-07', salesId: 2, salesName: '销售A', grade: 'Committed', threePhase: '跟踪', fiveElements: { background: true, budget: true, keyPerson: true, stage: true, competition: true } },
  { id: 4, name: '字节跳动', contact: '赵经理', phone: '13800138004', status: '成交', stage: '成交', amount: 1200000, lastContact: '2026-05-04', salesId: 2, salesName: '销售A', grade: 'Committed', threePhase: '跟踪', fiveElements: { background: true, budget: true, keyPerson: true, stage: true, competition: true } },
  // 销售B的客户
  { id: 5, name: '小米科技', contact: '孙总监', phone: '13800138005', status: '意向', stage: '合同谈判', amount: 450000, lastContact: '2026-05-03', salesId: 3, salesName: '销售B', grade: 'Upside', threePhase: '摸底', fiveElements: { background: true, budget: true, keyPerson: false, stage: true, competition: false } },
  { id: 6, name: '京东集团', contact: '周经理', phone: '13800138006', status: '线索', stage: '初次接触', amount: 350000, lastContact: '2026-05-02', salesId: 3, salesName: '销售B', grade: 'Probably', threePhase: '建联', fiveElements: { background: true, budget: false, keyPerson: false, stage: false, competition: false } },
  { id: 7, name: '美团点评', contact: '吴总', phone: '13800138007', status: '报价', stage: '方案报价', amount: 600000, lastContact: '2026-05-06', salesId: 3, salesName: '销售B', grade: 'Upside', threePhase: '摸底', fiveElements: { background: true, budget: true, keyPerson: true, stage: false, competition: false } },
  { id: 8, name: '网易公司', contact: '郑经理', phone: '13800138008', status: '意向', stage: '需求确认', amount: 280000, lastContact: '2026-05-05', salesId: 3, salesName: '销售B', grade: 'Probably', threePhase: '建联', fiveElements: { background: true, budget: false, keyPerson: false, stage: false, competition: false } },
];

// 项目(商机)数据 - 按销售分组
export const projects = [
  // 销售A的项目
  { id: 1, name: '华为云存储系统', customer: '华为技术有限公司', stage: 'S3', progress: 45, amount: 500000, expectedAmount: 550000, actualAmount: null, startDate: '2026-04-15', expectedClose: '2026-06-30', stageEnterDate: '2026-05-01', description: '企业级云存储解决方案', salesId: 2, salesName: '销售A', milestones: [{stage: 'S1', date: '2026-04-15', note: '客户需求确认'}, {stage: 'S2', date: '2026-04-25', note: '与张经理建立联系'}, {stage: 'S3', date: '2026-05-01', note: '提交初步方案'}] },
  { id: 2, name: '腾讯数据中台项目', customer: '腾讯科技', stage: 'S1', progress: 15, amount: 300000, expectedAmount: 350000, actualAmount: null, startDate: '2026-05-01', expectedClose: '2026-07-15', stageEnterDate: '2026-05-01', description: '数据中台建设', salesId: 2, salesName: '销售A', milestones: [{stage: 'S1', date: '2026-05-01', note: '初次接触，确认需求方向'}] },
  { id: 3, name: '阿里云灾备系统', customer: '阿里巴巴集团', stage: 'S4', progress: 70, amount: 800000, expectedAmount: 880000, actualAmount: null, startDate: '2026-03-20', expectedClose: '2026-05-20', stageEnterDate: '2026-04-28', description: '双活灾备架构设计', salesId: 2, salesName: '销售A', milestones: [{stage: 'S1', date: '2026-03-20', note: '机会确认'}, {stage: 'S2', date: '2026-03-28', note: '建立关系'}, {stage: 'S3', date: '2026-04-10', note: '方案提交'}, {stage: 'S4', date: '2026-04-28', note: '进入招投标阶段'}] },
  { id: 4, name: '字节AI存储平台', customer: '字节跳动', stage: 'S8', progress: 100, amount: 1200000, expectedAmount: 1200000, actualAmount: 1200000, startDate: '2026-02-01', expectedClose: '2026-04-30', stageEnterDate: '2026-04-25', description: 'AI训练数据存储平台', salesId: 2, salesName: '销售A', milestones: [{stage: 'S1', date: '2026-02-01', note: '机会确认'}, {stage: 'S2', date: '2026-02-10', note: '关系建立'}, {stage: 'S3', date: '2026-02-20', note: '方案提交'}, {stage: 'S4', date: '2026-03-05', note: '中标'}, {stage: 'S5', date: '2026-03-15', note: '签署合同'}, {stage: 'S6', date: '2026-04-10', note: '交付验收中'}, {stage: 'S7', date: '2026-04-20', note: '验收完成'}, {stage: 'S8', date: '2026-04-25', note: '回款完成'}] },
  // 销售B的项目
  { id: 5, name: '小米IoT存储方案', customer: '小米科技', stage: 'S5', progress: 85, amount: 450000, expectedAmount: 450000, actualAmount: null, startDate: '2026-04-01', expectedClose: '2026-05-15', stageEnterDate: '2026-05-08', description: 'IoT数据存储方案', salesId: 3, salesName: '销售B', milestones: [{stage: 'S1', date: '2026-04-01', note: '机会确认'}, {stage: 'S2', date: '2026-04-08', note: '关系建立'}, {stage: 'S3', date: '2026-04-15', note: '方案提交'}, {stage: 'S4', date: '2026-04-28', note: '谈判完成'}, {stage: 'S5', date: '2026-05-08', note: '合同签署中'}] },
  { id: 6, name: '京东物流系统', customer: '京东集团', stage: 'S1', progress: 10, amount: 350000, expectedAmount: 400000, actualAmount: null, startDate: '2026-05-05', expectedClose: '2026-08-01', stageEnterDate: '2026-05-05', description: '物流追踪系统', salesId: 3, salesName: '销售B', milestones: [{stage: 'S1', date: '2026-05-05', note: '首次接触，了解需求'}] },
  { id: 7, name: '美团数据仓库', customer: '美团点评', stage: 'S3', progress: 60, amount: 600000, expectedAmount: 650000, actualAmount: null, startDate: '2026-04-10', expectedClose: '2026-06-15', stageEnterDate: '2026-05-03', description: '数据仓库建设', salesId: 3, salesName: '销售B', milestones: [{stage: 'S1', date: '2026-04-10', note: '机会确认'}, {stage: 'S2', date: '2026-04-20', note: '建立联系'}, {stage: 'S3', date: '2026-05-03', note: '提交方案'}] },
  { id: 8, name: '网易游戏存储', customer: '网易公司', stage: 'S2', progress: 35, amount: 280000, expectedAmount: 300000, actualAmount: null, startDate: '2026-04-25', expectedClose: '2026-07-01', stageEnterDate: '2026-05-06', description: '游戏数据存储系统', salesId: 3, salesName: '销售B', milestones: [{stage: 'S1', date: '2026-04-25', note: '机会确认'}, {stage: 'S2', date: '2026-05-06', note: '建立关系'}] },
];

// 漏斗数据
export const funnelData = [
  { name: '线索', value: 120 },
  { name: '意向', value: 85 },
  { name: '报价', value: 45 },
  { name: '成交', value: 28 },
];

// 待办事项 - 按销售分组
export const todos = [
  { id: 1, title: '跟进华为项目报价', priority: 'high', deadline: '2026-05-08', completed: false, customerId: 1, salesId: 2 },
  { id: 2, title: '准备腾讯技术方案', priority: 'medium', deadline: '2026-05-10', completed: false, customerId: 2, salesId: 2 },
  { id: 4, title: '回访阿里客户', priority: 'low', deadline: '2026-05-12', completed: true, customerId: 3, salesId: 2 },
  { id: 3, title: '签订小米合同', priority: 'high', deadline: '2026-05-09', completed: false, customerId: 5, salesId: 3 },
  { id: 5, title: '整理周报数据', priority: 'medium', deadline: '2026-05-07', completed: false, customerId: null, salesId: 3 },
  { id: 6, title: '跟进美团报价', priority: 'high', deadline: '2026-05-08', completed: false, customerId: 7, salesId: 3 },
];

// 沟通记录
export const communications = [
  { id: 1, customerId: 1, customerName: '华为技术有限公司', date: '2026-05-06 14:30', type: '电话', content: '讨论了技术方案细节，客户对存储性能有较高要求', contact: '张经理' },
  { id: 2, customerId: 3, customerName: '阿里巴巴集团', date: '2026-05-06 10:00', type: '会议', content: '现场演示灾备方案，客户反馈良好，进入报价阶段', contact: '王总' },
  { id: 3, customerId: 5, customerName: '小米科技', date: '2026-05-05 16:00', type: '邮件', content: '发送最终报价单，等待客户确认', contact: '孙总监' },
  { id: 4, customerId: 7, customerName: '美团点评', date: '2026-05-05 09:30', type: '电话', content: '确认数据仓库技术架构方案', contact: '吴总' },
  { id: 5, customerId: 2, customerName: '腾讯科技', date: '2026-05-04 15:00', type: '拜访', content: '首次拜访，介绍公司产品和服务', contact: '李总监' },
  { id: 6, customerId: 4, customerName: '字节跳动', date: '2026-05-04 11:00', type: '会议', content: '项目验收会议，顺利通过验收', contact: '赵经理' },
];

// 日报数据
export const dailyReports = [
  { id: 1, date: '2026-05-07', userId: 2, userName: '销售A', workContent: '跟进华为项目，发送技术方案文档', customers: ['华为技术有限公司'], nextPlan: '等待客户反馈', followRecords: [{ customerName: '华为技术有限公司', contact: '张经理', type: '电话', summary: '发送技术方案文档，等待反馈', threePhase: '跟踪', fiveElements: { background: true, budget: true, keyPerson: true, stage: true, competition: false }, stageCode: '', amount: null, nextFollowUp: '' }], newLeads: [], risks: [] },
  { id: 2, date: '2026-05-06', userId: 2, userName: '销售A', workContent: '拜访阿里客户，演示灾备方案', customers: ['阿里巴巴集团'], nextPlan: '准备正式报价', followRecords: [{ customerName: '阿里巴巴集团', contact: '王总', type: '拜访', summary: '现场演示灾备方案，客户反馈良好', threePhase: '跟踪', fiveElements: { background: true, budget: true, keyPerson: true, stage: true, competition: true }, stageCode: 'S4', amount: 80, nextFollowUp: '本周五确认报价' }], newLeads: [], risks: [] },
  { id: 3, date: '2026-05-05', userId: 2, userName: '销售A', workContent: '整理小米项目合同文档', customers: ['小米科技'], nextPlan: '推进合同签署', followRecords: [{ customerName: '小米科技', contact: '孙总监', type: '邮件', summary: '整理合同文档并发送确认', threePhase: '摸底', fiveElements: { background: true, budget: true, keyPerson: false, stage: true, competition: false }, stageCode: 'S5', amount: 45, nextFollowUp: '跟进合同签署' }], newLeads: [], risks: [] },
  { id: 4, date: '2026-05-07', userId: 3, userName: '销售B', workContent: '跟进腾讯项目，准备技术方案', customers: ['腾讯科技'], nextPlan: '下周安排演示', followRecords: [{ customerName: '腾讯科技', contact: '李总监', type: '电话', summary: '讨论技术方案需求，准备方案', threePhase: '建联', fiveElements: { background: true, budget: false, keyPerson: false, stage: false, competition: false }, stageCode: 'S1', amount: null, nextFollowUp: '下周安排技术演示' }], newLeads: [], risks: [] },
  { id: 5, date: '2026-05-06', userId: 3, userName: '销售B', workContent: '回访京东客户，了解需求', customers: ['京东集团'], nextPlan: '整理需求文档', followRecords: [{ customerName: '京东集团', contact: '周经理', type: '拜访', summary: '了解物流系统需求，客户对方案感兴趣', threePhase: '建联', fiveElements: { background: true, budget: false, keyPerson: false, stage: false, competition: false }, stageCode: 'S1', amount: 35, nextFollowUp: '整理需求文档' }], newLeads: [], risks: [] },
  { id: 6, date: '2026-05-05', userId: 3, userName: '销售B', workContent: '美团项目报价确认', customers: ['美团点评'], nextPlan: '跟进报价审批', followRecords: [{ customerName: '美团点评', contact: '吴总', type: '会议', summary: '确认数据仓库报价细节', threePhase: '摸底', fiveElements: { background: true, budget: true, keyPerson: true, stage: false, competition: false }, stageCode: 'S3', amount: 60, nextFollowUp: '跟进报价审批' }], newLeads: [], risks: [] },
];

// 周报数据
export const weeklyReports = [
  {
    id: 1,
    weekStart: '2026-05-05',
    weekEnd: '2026-05-11',
    summary: '本周重点跟进华为、阿里两个大客户项目，华为项目进入需求确认阶段，阿里项目已完成方案演示等待报价确认。小米项目合同谈判进展顺利。',
    keyMetrics: {
      newCustomers: 3,
      followUpCount: 12,
      dealAmount: 450000,
      conversionRate: 23.5
    },
    nextWeekPlan: '重点推进华为项目报价，完成小米合同签署，准备腾讯项目技术方案'
  }
];

// 客户状态列表
export const customerStatuses = ['线索', '意向', '报价', '成交'];

// 用户数据
export const users = [
  { id: 1, username: 'admin', password: '123456', name: '管理员', role: 'manager' },
  { id: 2, username: 'salesA', password: '123456', name: '销售A', role: 'sales' },
  { id: 3, username: 'salesB', password: '123456', name: '销售B', role: 'sales' }
];

// ============ V2.0 新增数据 ============

// PPL数据
export const pplData = {
  kpiTarget: 3000000,
  currentPPL: 8450000,
  healthRatio: 2.82,
  kpiProbability: 68.5,
  monthlyTrend: (function() {
    var now = new Date();
    var months = [];
    var basePPL = 5200000;
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var label = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      var ppl = basePPL + Math.round((5 - i) * 650000 * (0.9 + Math.random() * 0.2));
      months.push({ month: label, ppl: ppl, kpi: 3000000 });
    }
    // 最后一个月用当前PPL值
    months[5].ppl = 8450000;
    return months;
  })(),
  bySales: [
    { name: '销售A', ppl: 4600000, kpi: 1500000 },
    { name: '销售B', ppl: 3850000, kpi: 1500000 },
  ],
  byStage: [
    { name: 'S1机会确认', value: 700000 },
    { name: 'S2建立关系', value: 580000 },
    { name: 'S3提出方案', value: 1100000 },
    { name: 'S4达成协议', value: 800000 },
    { name: 'S5签署合同', value: 450000 },
    { name: 'S6交付验收', value: 0 },
    { name: 'S7验收完成', value: 0 },
    { name: 'S8完成回款', value: 1200000 },
    { name: 'End商机关闭', value: 0 },
  ],
};

// 风险告警数据
export const alertsData = [
  { id: 1, type: 'follow_missing', typeName: '跟进缺失', severity: 'orange', object: '京东集团', description: '超过7天未跟进', time: '2026-05-09 09:00', handled: false, ignored: false, salesId: 3, salesName: '销售B' },
  { id: 2, type: 'stage_stagnant', typeName: '商机停滞', severity: 'yellow', object: '网易游戏存储', description: 'S2阶段停留超过14天', time: '2026-05-08 10:30', handled: false, ignored: false, salesId: 3, salesName: '销售B' },
  { id: 3, type: 'ppl_insufficient', typeName: 'PPL不足', severity: 'red', object: '销售B', description: 'PPL/KPI倍数低于3倍', time: '2026-05-07 08:00', handled: false, ignored: false, salesId: 3, salesName: '销售B' },
  { id: 4, type: 'project_abnormal', typeName: '项目异常', severity: 'purple', object: '阿里云灾备系统', description: '合同金额与预期偏差超过20%', time: '2026-05-06 14:00', handled: false, ignored: false, salesId: 2, salesName: '销售A' },
  { id: 5, type: 'follow_missing', typeName: '跟进缺失', severity: 'orange', object: '网易公司', description: '超过5天未跟进', time: '2026-05-05 16:00', handled: true, handledBy: '销售B', handledTime: '2026-05-05 17:00', salesId: 3, salesName: '销售B' },
  { id: 6, type: 'stage_stagnant', typeName: '商机停滞', severity: 'yellow', object: '腾讯数据中台项目', description: 'S1阶段停留超过10天', time: '2026-05-04 11:00', handled: true, handledBy: '销售A', handledTime: '2026-05-04 14:00', salesId: 2, salesName: '销售A' },
  { id: 7, type: 'follow_missing', typeName: '跟进缺失', severity: 'orange', object: '腾讯科技', description: '超过6天未跟进', time: '2026-05-10 09:00', handled: false, ignored: false, salesId: 2, salesName: '销售A' },
  { id: 8, type: 'project_abnormal', typeName: '项目异常', severity: 'purple', object: '小米IoT存储方案', description: '合同签署延迟超过预期', time: '2026-05-09 14:00', handled: false, ignored: false, salesId: 3, salesName: '销售B' },
];

// 跟进日历数据
export const followUpCalendarData = {
  '2026-05-08': [
    { id: 1, customerName: '华为技术有限公司', content: '跟进技术方案反馈', completed: true, salesId: 2, salesName: '销售A' },
    { id: 2, customerName: '美团点评', content: '确认报价细节', completed: true, salesId: 3, salesName: '销售B' },
  ],
  '2026-05-09': [
    { id: 3, customerName: '小米科技', content: '合同签署跟进', completed: true, salesId: 3, salesName: '销售B' },
  ],
  '2026-05-12': [
    { id: 4, customerName: '阿里巴巴集团', content: '回访方案演示反馈', completed: false, salesId: 2, salesName: '销售A' },
    { id: 5, customerName: '腾讯科技', content: '安排技术演示时间', completed: false, salesId: 2, salesName: '销售A' },
  ],
  '2026-05-13': [
    { id: 6, customerName: '京东集团', content: '了解物流系统需求', completed: false, salesId: 3, salesName: '销售B' },
  ],
  '2026-05-15': [
    { id: 7, customerName: '网易公司', content: '跟进存储方案沟通', completed: false, salesId: 3, salesName: '销售B' },
  ],
  '2026-05-20': [
    { id: 8, customerName: '华为技术有限公司', content: '确认合同条款', completed: false, salesId: 2, salesName: '销售A' },
    { id: 9, customerName: '美团点评', content: '数据仓库二期需求', completed: false, salesId: 3, salesName: '销售B' },
  ],
};

// 销售指引数据
export const salesGuideData = [
  { id: 1, category: '话术', title: '初次接触客户话术模板', summary: '适用于首次联系客户的标准话术，涵盖自我介绍、产品介绍、需求挖掘等环节。', content: '1. 自我介绍：您好，我是XX公司的客户经理XXX...\n2. 产品介绍：我们公司专注于企业级存储解决方案...\n3. 需求挖掘：请问贵公司在数据存储方面目前面临哪些挑战？\n4. 预约下次沟通：能否安排一个时间，让我们的技术专家为您做一个详细的方案介绍？' },
  { id: 2, category: '话术', title: '报价谈判话术指南', summary: '报价阶段的谈判技巧和话术，帮助销售应对客户压价。', content: '1. 价值引导：我们的方案不仅是产品本身，更包含了...\n2. 差异化对比：与竞品相比，我们在...方面有明显优势\n3. 分层报价：为您提供三个不同配置的方案...\n4. 限时策略：该优惠价格有效至月底...' },
  { id: 3, category: '行业打法', title: '金融行业打法手册', summary: '金融行业客户的开拓策略和解决方案要点。', content: '1. 行业痛点：数据安全合规、灾备要求高、数据量大\n2. 解决方案：双活灾备架构、对象存储合规方案\n3. 关键决策人：CTO、运维总监、信息安全负责人\n4. 成功案例：XX银行、XX证券' },
  { id: 4, category: '行业打法', title: '政务行业打法手册', summary: '政务行业客户开拓策略，信创适配要点。', content: '1. 行业痛点：信创要求、数据国产化、等保合规\n2. 解决方案：信创适配存储、国产化替代方案\n3. 关键决策人：信息中心主任、采购负责人\n4. 成功案例：XX省政府、XX税务局' },
  { id: 5, category: '竞对分析', title: '某厂商A产品对比分析', summary: '与竞品A的详细对比分析，涵盖功能、性能、价格、服务等维度。', content: '1. 功能对比：我方优势在...，对方优势在...\n2. 性能对比：我方IOPS是对方的X倍\n3. 价格对比：同配置下我方价格优惠约X%\n4. 服务对比：我方提供7×24小时，对方为5×8小时' },
  { id: 6, category: '竞对分析', title: '某厂商B产品对比分析', summary: '与竞品B的详细对比分析，差异化竞争策略。', content: '1. 功能对比：我方在分布式存储领域有显著优势\n2. 性能对比：小文件读写性能明显优于对方\n3. 生态对比：与WPS/飞书等生态深度集成\n4. 服务对比：本地化服务团队覆盖更广' },
];

// 团队管理数据
export const teamData = {
  attendance: {
    monthRate: 96.5,
    members: [
      { name: '销售A', workDays: 22, actualDays: 21, leaveDays: 1, overtimeDays: 3, rate: 95.5 },
      { name: '销售B', workDays: 22, actualDays: 22, leaveDays: 0, overtimeDays: 2, rate: 100 },
    ]
  },
  performance: {
    revenueWeight: 0.6,
    processWeight: 0.4,
    members: [
      { name: '销售A', revenue: 2800000, revenueScore: 85, processScore: 78, totalScore: 82.2, rank: 1 },
      { name: '销售B', revenue: 1630000, revenueScore: 70, processScore: 82, totalScore: 75.8, rank: 2 },
    ]
  },
  budget: {
    totalBudget: 500000,
    usedBudget: 320000,
    items: [
      { name: '差旅费', budget: 200000, used: 135000 },
      { name: '招待费', budget: 100000, used: 72000 },
      { name: '市场活动', budget: 120000, used: 68000 },
      { name: '培训费', budget: 50000, used: 28000 },
      { name: '其他', budget: 30000, used: 17000 },
    ]
  },
  members: [
    { id: 1, name: '管理员', role: 'manager', roleName: '销售经理', phone: '13900139001', joinDate: '2025-01-15', status: 'active' },
    { id: 2, name: '销售A', role: 'sales', roleName: '高级销售', phone: '13900139002', joinDate: '2025-03-01', status: 'active' },
    { id: 3, name: '销售B', role: 'sales', roleName: '销售', phone: '13900139003', joinDate: '2025-06-15', status: 'active' },
  ]
};

// ============ 智能体(Agent)数据 ============

// 可用工具列表
export const agentTools = [
  { id: 'crm_query', name: 'CRM数据查询', desc: '查询客户、商机、跟进记录等CRM数据' },
  { id: 'email_send', name: '邮件发送', desc: '通过邮件发送消息或报告' },
  { id: 'report_gen', name: '报告生成', desc: '自动生成日报/周报/月报' },
  { id: 'followup_advice', name: '跟进建议', desc: '基于客户数据提供跟进策略建议' },
  { id: 'calendar_manage', name: '日历管理', desc: '创建和管理跟进计划' },
  { id: 'alert_notify', name: '告警通知', desc: '发送风险告警和提醒' },
  { id: 'lead_parse', name: '线索解析', desc: '解析线索沟通记录，自动提取客户/商机/跟进信息并写入各模块' },
  { id: 'work_summary', name: '工作汇总分析', desc: '汇总分析所有销售工作数据，输出全维度工作汇总报告' },
];

// 预设触发事件
export const automationEvents = [
  { id: 'no_followup_3d', name: '客户3天未跟进' },
  { id: 'opportunity_stuck_7d', name: '商机7天未推进' },
  { id: 'ppl_below_3x', name: 'PPL低于3倍KPI' },
  { id: 'deal_amount_over_50w', name: '商机金额超50万' },
  { id: 'new_customer_created', name: '新建客户' },
  { id: 'weekly_report_due', name: '周报到期(每周五)' },
];

// 预设执行动作
export const automationActions = [
  { id: 'send_notification', name: '发送通知', configFields: ['channel', 'template'] },
  { id: 'gen_report', name: '生成报告', configFields: ['reportType', 'scope'] },
  { id: 'create_follow_plan', name: '创建跟进计划', configFields: ['planContent'] },
  { id: 'update_grade', name: '更新客户分级', configFields: ['newGrade', 'reason'] },
];

// 对话型Agent示例数据
export const conversationalAgents = [
  {
    id: 'conv-001',
    name: '销售助手小智',
    type: 'conversational',
    description: '帮助分析客户数据，提供跟进建议',
    role: '销售顾问',
    instructions: '你是一位经验丰富的销售顾问，擅长分析客户需求并提供跟进策略建议。回答要专业、简洁、有针对性。',
    tools: ['crm_query', 'followup_advice'],
    greeting: '你好！我是销售助手小智，可以帮你分析客户数据和制定跟进策略。请问有什么可以帮你的？',
    createdBy: 'manager',
    createdAt: '2026-05-10',
  },
  {
    id: 'conv-002',
    name: '客户成功顾问',
    type: 'conversational',
    description: '专注于客户满意度和续约管理',
    role: '客户成功经理',
    instructions: '你是一位客户成功专家，专注于提升客户满意度、推动续约和增购。关注客户健康度指标。',
    tools: ['crm_query', 'email_send'],
    greeting: '您好！我是客户成功顾问，专注于客户满意度和续约管理，请问需要什么帮助？',
    createdBy: 'manager',
    createdAt: '2026-05-12',
  },
  {
    id: 'conv-003',
    name: '线索记录助手',
    type: 'conversational',
    description: '上传一条线索沟通记录，自动解析客户信息、商机进展、跟进计划，并同步到客户管理、商机看板、沟通记录、跟进日历等模块',
    role: '线索记录专员',
    instructions: '你是一位专业的线索记录专员，擅长从非结构化的沟通记录中提取关键信息，包括客户名称、联系人、需求、商机阶段、金额、竞对信息、下一步计划等，并自动将信息写入对应模块。',
    tools: ['lead_parse', 'crm_query'],
    greeting: '你好！我是线索记录助手，只需粘贴一段客户沟通记录，我就能帮你自动提取信息并同步到各个模块。请直接粘贴你的沟通记录内容。',
    createdBy: 'manager',
    createdAt: '2026-05-12',
  },
  {
    id: 'conv-004',
    name: '工作汇总分析师',
    type: 'conversational',
    description: '汇总分析所有销售工作数据，输出日报/周报/月度汇总，包含项目进展、客户跟进、商机阶段、风险预警、PPL健康度等全维度分析',
    role: '数据分析专家',
    instructions: '你是一位数据分析专家，擅长从多维度汇总分析销售工作数据，输出结构化的工作汇总报告。覆盖项目进展、客户跟进、商机阶段分布、风险预警、PPL健康度等，用数据和图表说话，为管理层提供决策依据。',
    tools: ['work_summary', 'crm_query'],
    greeting: '你好！我是工作汇总分析师，可以帮你汇总分析所有销售工作数据，输出日报/周报/月度汇总。请告诉我你需要什么维度的分析，或直接说"生成今日汇总"。',
    createdBy: 'manager',
    createdAt: '2026-05-18',
  },
];

// 自动化Agent示例数据
export const automationAgents = [
  {
    id: 'auto-001',
    name: '跟进缺失提醒',
    type: 'automation',
    description: '当客户3天未被跟随时，自动发送提醒通知',
    trigger: { type: 'event', eventId: 'no_followup_3d' },
    action: { type: 'send_notification', config: { channel: 'in_app', template: 'followup_reminder' } },
    enabled: true,
    lastExecTime: '2026-05-14 09:00',
    execCount: 42,
    createdBy: 'manager',
    createdAt: '2026-04-01',
  },
  {
    id: 'auto-002',
    name: '每周周报自动生成',
    type: 'automation',
    description: '每周五下午5点自动生成本周销售周报',
    trigger: { type: 'schedule', expression: '0 17 * * 5' },
    action: { type: 'gen_report', config: { reportType: 'weekly', scope: 'team' } },
    enabled: true,
    lastExecTime: '2026-05-10 17:00',
    execCount: 18,
    createdBy: 'manager',
    createdAt: '2026-01-10',
  },
  {
    id: 'auto-003',
    name: '大商机告警',
    type: 'automation',
    description: '金额超50万的商机创建时自动通知管理层',
    trigger: { type: 'event', eventId: 'deal_amount_over_50w' },
    action: { type: 'send_notification', config: { channel: 'email', template: 'big_deal_alert' } },
    enabled: false,
    lastExecTime: null,
    execCount: 0,
    createdBy: 'manager',
    createdAt: '2026-05-08',
  },
];

// Agent对话记录
export const agentChatHistory = {
  'conv-001': [
    { id: 'm1', role: 'agent', content: '你好！我是销售助手小智，可以帮你分析客户数据和制定跟进策略。请问有什么可以帮你的？', time: '2026-05-14 10:00' },
    { id: 'm2', role: 'user', content: '帮我分析一下华为的跟进情况', time: '2026-05-14 10:01' },
    { id: 'm3', role: 'agent', content: '根据CRM数据分析，华为技术有限公司当前状态为"意向"，处于S3提出方案阶段。上次跟进时间为2026-05-06，距今已8天未跟进。建议尽快安排一次方案讨论会，推进到S4达成协议阶段。客户张经理对方案有较大兴趣，可以重点围绕技术方案优势进行沟通。', time: '2026-05-14 10:01' },
  ],
  'conv-003': [
    { id: 'mg1', role: 'agent', content: '你好！我是线索记录助手，只需粘贴一段客户沟通记录，我就能帮你自动提取信息并同步到各个模块。请直接粘贴你的沟通记录内容。', time: '2026-05-18 09:00' },
  ],
};

// 自动化执行日志
export const automationLogs = {
  'auto-001': [
    { id: 'l1', time: '2026-05-14 09:00', duration: 1200, status: 'success', output: '检测到3个客户未跟进，已发送提醒通知' },
    { id: 'l2', time: '2026-05-13 09:00', duration: 980, status: 'success', output: '检测到2个客户未跟进，已发送提醒通知' },
    { id: 'l3', time: '2026-05-12 09:00', duration: 1100, status: 'success', output: '检测到4个客户未跟进，已发送提醒通知' },
  ],
  'auto-002': [
    { id: 'l1', time: '2026-05-10 17:00', duration: 3500, status: 'success', output: '本周销售周报已生成，2个商机推进，1个新客户建立联系' },
    { id: 'l2', time: '2026-05-03 17:00', duration: 2800, status: 'success', output: '本周销售周报已生成，1个商机签约，3个跟进计划完成' },
  ],
};
