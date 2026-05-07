// 模拟数据 - 销售看板系统

// 客户数据 - 按销售分组
export const customers = [
  // 销售A的客户
  { id: 1, name: '华为技术有限公司', contact: '张经理', phone: '13800138001', status: '意向', stage: '需求确认', amount: 500000, lastContact: '2026-05-06', salesId: 2, salesName: '销售A' },
  { id: 2, name: '腾讯科技', contact: '李总监', phone: '13800138002', status: '线索', stage: '初次接触', amount: 300000, lastContact: '2026-05-05', salesId: 2, salesName: '销售A' },
  { id: 3, name: '阿里巴巴集团', contact: '王总', phone: '13800138003', status: '报价', stage: '方案报价', amount: 800000, lastContact: '2026-05-07', salesId: 2, salesName: '销售A' },
  { id: 4, name: '字节跳动', contact: '赵经理', phone: '13800138004', status: '成交', stage: '成交', amount: 1200000, lastContact: '2026-05-04', salesId: 2, salesName: '销售A' },
  // 销售B的客户
  { id: 5, name: '小米科技', contact: '孙总监', phone: '13800138005', status: '意向', stage: '合同谈判', amount: 450000, lastContact: '2026-05-03', salesId: 3, salesName: '销售B' },
  { id: 6, name: '京东集团', contact: '周经理', phone: '13800138006', status: '线索', stage: '初次接触', amount: 350000, lastContact: '2026-05-02', salesId: 3, salesName: '销售B' },
  { id: 7, name: '美团点评', contact: '吴总', phone: '13800138007', status: '报价', stage: '方案报价', amount: 600000, lastContact: '2026-05-06', salesId: 3, salesName: '销售B' },
  { id: 8, name: '网易公司', contact: '郑经理', phone: '13800138008', status: '意向', stage: '需求确认', amount: 280000, lastContact: '2026-05-05', salesId: 3, salesName: '销售B' },
];

// 项目数据 - 按销售分组
export const projects = [
  // 销售A的项目
  { id: 1, name: '华为云存储系统', customer: '华为技术有限公司', stage: '需求确认', progress: 45, amount: 500000, startDate: '2026-04-15', expectedClose: '2026-06-30', description: '企业级云存储解决方案', salesId: 2 },
  { id: 2, name: '腾讯数据中台项目', customer: '腾讯科技', stage: '初次接触', progress: 15, amount: 300000, startDate: '2026-05-01', expectedClose: '2026-07-15', description: '数据中台建设', salesId: 2 },
  { id: 3, name: '阿里云灾备系统', customer: '阿里巴巴集团', stage: '方案报价', progress: 70, amount: 800000, startDate: '2026-03-20', expectedClose: '2026-05-20', description: '双活灾备架构设计', salesId: 2 },
  { id: 4, name: '字节AI存储平台', customer: '字节跳动', stage: '成交', progress: 100, amount: 1200000, startDate: '2026-02-01', expectedClose: '2026-04-30', description: 'AI训练数据存储平台', salesId: 2 },
  // 销售B的项目
  { id: 5, name: '小米IoT存储方案', customer: '小米科技', stage: '合同谈判', progress: 85, amount: 450000, startDate: '2026-04-01', expectedClose: '2026-05-15', description: 'IoT数据存储方案', salesId: 3 },
  { id: 6, name: '京东物流系统', customer: '京东集团', stage: '初次接触', progress: 10, amount: 350000, startDate: '2026-05-05', expectedClose: '2026-08-01', description: '物流追踪系统', salesId: 3 },
  { id: 7, name: '美团数据仓库', customer: '美团点评', stage: '方案报价', progress: 60, amount: 600000, startDate: '2026-04-10', expectedClose: '2026-06-15', description: '数据仓库建设', salesId: 3 },
  { id: 8, name: '网易游戏存储', customer: '网易公司', stage: '需求确认', progress: 35, amount: 280000, startDate: '2026-04-25', expectedClose: '2026-07-01', description: '游戏数据存储系统', salesId: 3 },
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
  // 销售A的待办
  { id: 1, title: '跟进华为项目报价', priority: 'high', deadline: '2026-05-08', completed: false, customerId: 1, salesId: 2 },
  { id: 2, title: '准备腾讯技术方案', priority: 'medium', deadline: '2026-05-10', completed: false, customerId: 2, salesId: 2 },
  { id: 4, title: '回访阿里客户', priority: 'low', deadline: '2026-05-12', completed: true, customerId: 3, salesId: 2 },
  // 销售B的待办
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

// 日报数据 - 按用户分组
export const dailyReports = [
  // 销售A的日报
  { id: 1, date: '2026-05-07', userId: 2, userName: '销售A', workContent: '跟进华为项目，发送技术方案文档', customers: ['华为技术有限公司'], nextPlan: '等待客户反馈' },
  { id: 2, date: '2026-05-06', userId: 2, userName: '销售A', workContent: '拜访阿里客户，演示灾备方案', customers: ['阿里巴巴集团'], nextPlan: '准备正式报价' },
  { id: 3, date: '2026-05-05', userId: 2, userName: '销售A', workContent: '整理小米项目合同文档', customers: ['小米科技'], nextPlan: '推进合同签署' },
  // 销售B的日报
  { id: 4, date: '2026-05-07', userId: 3, userName: '销售B', workContent: '跟进腾讯项目，准备技术方案', customers: ['腾讯科技'], nextPlan: '下周安排演示' },
  { id: 5, date: '2026-05-06', userId: 3, userName: '销售B', workContent: '回访京东客户，了解需求', customers: ['京东集团'], nextPlan: '整理需求文档' },
  { id: 6, date: '2026-05-05', userId: 3, userName: '销售B', workContent: '美团项目报价确认', customers: ['美团点评'], nextPlan: '跟进报价审批' },
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

// 项目阶段列表
export const projectStages = ['初次接触', '需求确认', '方案报价', '合同谈判', '成交'];

// 客户状态列表
export const customerStatuses = ['线索', '意向', '报价', '成交'];

// 用户数据
export const users = [
  { id: 1, username: 'admin', password: '123456', name: '管理员', role: 'manager' },
  { id: 2, username: 'salesA', password: '123456', name: '销售A', role: 'sales' },
  { id: 3, username: 'salesB', password: '123456', name: '销售B', role: 'sales' }
];
