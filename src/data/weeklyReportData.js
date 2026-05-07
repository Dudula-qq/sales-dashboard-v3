// 创新业务部周报数据 - 2026-04-30

// 项目阶段统计
export const projectStageData = [
  { name: '方案阶段', value: 12 },
  { name: 'POC测试', value: 8 },
  { name: '报价阶段', value: 6 },
  { name: '合同签署', value: 5 },
  { name: '交付实施', value: 4 },
  { name: '续保/扩容', value: 3 },
];

// 业务线项目数量
export const businessLineData = [
  { name: '事业部项目', count: 8, amount: 350 },
  { name: 'WPS客户项目', count: 18, amount: 280 },
  { name: '飞书线项目', count: 5, amount: 45 },
  { name: '数力聚线', count: 6, amount: 120 },
  { name: 'Juicefs线', count: 2, amount: 110 },
  { name: '龙芯渠道线', count: 4, amount: 60 },
  { name: '新商机拓展', count: 35, amount: 200 },
];

// 商机状态分布
export const opportunityStatusData = [
  { name: 'Upside', value: 45, color: '#52c41a' },
  { name: 'Probable', value: 18, color: '#1890ff' },
  { name: 'POC测试中', value: 12, color: '#faad14' },
  { name: '合同签署中', value: 8, color: '#722ed1' },
  { name: '已交付', value: 14, color: '#13c2c2' },
];

// 重点项目列表
export const keyProjects = [
  { name: '恒扬数据', amount: '100PB+30PB', stage: '方案交流', owner: '唐雯秋/韩炜' },
  { name: '珠海影像云', amount: '150TB-1500TB', stage: '方案报价', owner: '谢勇/肖天鹤' },
  { name: '中云星图二期', amount: '117万', stage: '询价阶段', owner: '谢勇/李伟/颜旭州' },
  { name: '中石化广州工程', amount: '450TB/14.4万', stage: '合同审核', owner: '夏超雄/张水沅/谢勇' },
  { name: '上期所项目', amount: '19.5万', stage: '采购流程', owner: '飞书渠道' },
  { name: '五粮液续保', amount: '9.6万', stage: '合同签署', owner: '飞书渠道' },
  { name: '拓荆科技', amount: '73万', stage: '报价阶段', owner: '田英凯' },
  { name: '中科院信工所', amount: '88万', stage: '方案阶段', owner: '谢勇/曲浩' },
];

// 研发进展
export const rdProgress = [
  { name: 'OBS V7.2版本', progress: 60, status: '开发中' },
  { name: 'OBS文件网关FSG V2.0', progress: 30, status: '方案设计' },
  { name: 'OBS V6.9稳定性测试', progress: 80, status: '测试中' },
  { name: '运维平台OMP V1.1', progress: 50, status: '开发中' },
];

// POC项目汇总
export const pocProjects = [
  { name: '中石油渤海-WPS私有化', status: '已完成' },
  { name: '宁波国资委-WPS混合云', status: '已完成' },
  { name: '珠海影像云', status: '持续关注' },
  { name: '中海油湛江-WPS私有化', status: '已完成' },
  { name: '华安证券-WPS混合云', status: '已完成' },
  { name: '恒扬大数据', status: '已完成' },
];

// 交付巡检统计
export const deliveryStats = {
  total: 14,
  inspected: 14,
  pending: 0,
  issues: 0
};

// 行业分布
export const industryDistribution = [
  { name: '金融', value: 15 },
  { name: '政务', value: 12 },
  { name: '制造', value: 10 },
  { name: '能源', value: 8 },
  { name: '医疗', value: 6 },
  { name: '教育', value: 5 },
  { name: '互联网', value: 10 },
];

// Token商机
export const tokenOpportunities = [
  { name: '香港仟聚', stage: '测试中', amount: '30万/月' },
  { name: '北京云聚', stage: '测试中', amount: '5万/月' },
  { name: '光宇出行', stage: '测试中', amount: '2万/月' },
  { name: '智泽创达', stage: '测试中', amount: '10万预付' },
  { name: '博成', stage: '测试中', amount: '75万M/token' },
  { name: '竞技世界', stage: '对接中', amount: '待评估' },
];

// 周报基本信息
export const weeklyReportInfo = {
  weekStart: '2026-04-28',
  weekEnd: '2026-04-30',
  department: '创新业务部',
  totalProjects: 88,
  totalAmount: 1165,
  newOpportunities: 15,
  pocCompleted: 6,
};
