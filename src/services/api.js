// API 服务 - 模拟后端接口 V2.0

import {
  customers,
  projects,
  funnelData,
  todos,
  communications,
  dailyReports,
  weeklyReports,
  users,
  pplData,
  alertsData,
  followUpCalendarData,
  salesGuideData,
  teamData,
  projectStages,
  customerGrades,
  agentTools,
  automationEvents,
  automationActions,
  conversationalAgents,
  automationAgents,
  agentChatHistory,
  automationLogs,
} from '../data/mockData';

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 客户相关API
export const customerApi = {
  async getList(params = {}) {
    await delay(200);
    let result = [...customers];

    if (params.status) {
      result = result.filter(c => c.status === params.status);
    }
    if (params.keyword) {
      result = result.filter(c =>
        c.name.includes(params.keyword) ||
        c.contact.includes(params.keyword)
      );
    }
    if (params.salesId) {
      result = result.filter(c => c.salesId === params.salesId);
    }
    if (params.grade) {
      result = result.filter(c => c.grade === params.grade);
    }
    return { data: result, total: result.length };
  },

  async getById(id) {
    await delay(100);
    const customer = customers.find(c => c.id === id);
    return customer || null;
  },

  async update(id, data) {
    await delay(100);
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...data };
      return customers[index];
    }
    return null;
  }
};

// 项目相关API
export const projectApi = {
  async getList(params = {}) {
    await delay(200);
    let result = [...projects];

    if (params.stage) {
      result = result.filter(p => p.stage === params.stage);
    }
    if (params.stageCode) {
      result = result.filter(p => p.stage === params.stageCode);
    }
    if (params.salesId) {
      result = result.filter(p => p.salesId === params.salesId);
    }
    if (params.grade) {
      result = result.filter(p => {
        const customer = customers.find(c => c.name === p.customer);
        return customer && customer.grade === params.grade;
      });
    }
    return { data: result, total: result.length };
  },

  async getById(id) {
    await delay(100);
    const project = projects.find(p => p.id === id);
    return project || null;
  },

  async updateStage(id, stage) {
    await delay(100);
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index].stage = stage;
      return projects[index];
    }
    return null;
  }
};

// 漏斗数据API
export const funnelApi = {
  async getData() {
    await delay(100);
    return funnelData;
  }
};

// 待办事项API
export const todoApi = {
  async getList(params = {}) {
    await delay(100);
    let result = [...todos];
    if (params.salesId) {
      result = result.filter(t => t.salesId === params.salesId);
    }
    return result;
  },

  async add(todo, user) {
    await delay(100);
    const newTodo = {
      id: Date.now(),
      ...todo,
      salesId: user?.id,
      completed: false
    };
    todos.push(newTodo);
    return newTodo;
  },

  async toggle(id) {
    await delay(100);
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      return todo;
    }
    return null;
  },

  async delete(id) {
    await delay(100);
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      return true;
    }
    return false;
  }
};

// 沟通记录API
export const communicationApi = {
  async getList(customerId) {
    await delay(100);
    if (customerId) {
      return communications.filter(c => c.customerId === customerId);
    }
    return communications;
  },

  async add(record) {
    await delay(100);
    const newRecord = {
      id: Date.now(),
      ...record,
      date: new Date().toLocaleString('zh-CN')
    };
    communications.unshift(newRecord);
    return newRecord;
  }
};

// 日报API
export const dailyReportApi = {
  async getList(params = {}) {
    await delay(100);
    let result = [...dailyReports];

    if (params.userId) {
      result = result.filter(r => r.userId === params.userId);
    }
    if (params.date) {
      result = result.filter(r => r.date === params.date);
    }

    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    return result;
  },

  async add(report, user) {
    await delay(100);
    const newReport = {
      id: Date.now(),
      ...report,
      userId: user.id,
      userName: user.name,
      date: report.date || new Date().toISOString().split('T')[0]
    };
    dailyReports.unshift(newReport);
    extractCustomerSuggestions(newReport, user);
    return newReport;
  },

  async getSummary() {
    await delay(100);
    const userMap = {};

    dailyReports.forEach(report => {
      if (!userMap[report.userId]) {
        userMap[report.userId] = {
          userId: report.userId,
          userName: report.userName,
          reports: [],
          totalReports: 0
        };
      }
      userMap[report.userId].reports.push(report);
      userMap[report.userId].totalReports++;
    });

    return Object.values(userMap);
  }
};

// 周报API
export const weeklyReportApi = {
  async getLatest() {
    await delay(100);
    return weeklyReports[0] || null;
  },

  async getList() {
    await delay(100);
    return weeklyReports;
  },

  async update(report) {
    await delay(100);
    const index = weeklyReports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      weeklyReports[index] = { ...weeklyReports[index], ...report };
      return weeklyReports[index];
    } else {
      weeklyReports.unshift(report);
      return report;
    }
  }
};

// PPL管理API
export const pplApi = {
  async getHealth() {
    await delay(100);
    return {
      currentPPL: pplData.currentPPL,
      kpiTarget: pplData.kpiTarget,
      healthRatio: pplData.healthRatio,
      kpiProbability: pplData.kpiProbability,
    };
  },

  async updateHealth(data) {
    await delay(50);
    var oldPPL = pplData.currentPPL;
    var oldKPI = pplData.kpiTarget;
    var pplRatio = oldPPL > 0 ? data.currentPPL / oldPPL : 1;
    var kpiRatio = oldKPI > 0 ? data.kpiTarget / oldKPI : 1;
    pplData.currentPPL = data.currentPPL;
    pplData.kpiTarget = data.kpiTarget;
    pplData.healthRatio = data.kpiTarget > 0 ? data.currentPPL / data.kpiTarget : 0;
    pplData.kpiProbability = data.kpiProbability;
    // 更新趋势数据：保持6个月滚动窗口
    if (pplData.monthlyTrend) {
      var now = new Date();
      var curMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      var lastMonth = pplData.monthlyTrend[pplData.monthlyTrend.length - 1].month;
      // 如果当前月比最后一个趋势月更新，追加新月
      if (curMonth > lastMonth) {
        pplData.monthlyTrend.push({ month: curMonth, ppl: data.currentPPL, kpi: data.kpiTarget });
      } else {
        // 当前月已存在，更新值
        pplData.monthlyTrend[pplData.monthlyTrend.length - 1].ppl = data.currentPPL;
        pplData.monthlyTrend[pplData.monthlyTrend.length - 1].kpi = data.kpiTarget;
      }
      // 按比例缩放历史月份数据
      pplData.monthlyTrend.forEach(function(m) {
        if (m.month !== curMonth) {
          m.ppl = Math.round(m.ppl * pplRatio);
          m.kpi = Math.round(m.kpi * kpiRatio);
        }
      });
      // 只保留最近6个月
      while (pplData.monthlyTrend.length > 6) {
        pplData.monthlyTrend.shift();
      }
    }
    if (pplData.bySales) {
      pplData.bySales.forEach(function(s) {
        s.ppl = Math.round(s.ppl * pplRatio);
        s.kpi = Math.round(s.kpi * kpiRatio);
      });
    }
    if (pplData.byStage) {
      pplData.byStage.forEach(function(s) {
        s.value = Math.round(s.value * pplRatio);
      });
    }
    return { success: true };
  },

  async getTrend() {
    await delay(100);
    return {
      monthlyTrend: pplData.monthlyTrend,
      bySales: pplData.bySales,
      byStage: pplData.byStage,
    };
  },

  async adjust(salesId, amount) {
    await delay(100);
    return { success: true, message: 'PPL调整已提交' };
  }
};

// 风险告警API
export const alertApi = {
  async getList(params = {}) {
    await delay(100);
    let result = [...alertsData];
    if (params.type) {
      result = result.filter(a => a.type === params.type);
    }
    if (params.handled !== undefined) {
      result = result.filter(a => a.handled === params.handled);
    }
    if (params.salesId) {
      result = result.filter(a => a.salesId === params.salesId);
    }
    return result;
  },

  async handle(id, handlerName) {
    await delay(100);
    const alert = alertsData.find(a => a.id === id);
    if (alert) {
      alert.handled = true;
      alert.handledBy = handlerName;
      alert.handledTime = new Date().toLocaleString('zh-CN');
      return alert;
    }
    return null;
  },

  async ignore(id) {
    await delay(100);
    const alert = alertsData.find(a => a.id === id);
    if (alert) {
      alert.ignored = true;
      return alert;
    }
    return null;
  },

  async getHistory() {
    await delay(100);
    return alertsData.filter(a => a.handled);
  }
};

// 跟进日历API
export const calendarApi = {
  async getMonthData(year, month, salesId) {
    await delay(100);
    const result = {};
    Object.entries(followUpCalendarData).forEach(([date, plans]) => {
      const d = new Date(date);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        const filtered = salesId ? plans.filter(p => p.salesId === salesId) : plans;
        if (filtered.length > 0) result[date] = filtered;
      }
    });
    return result;
  },

  async addPlan(plan, user) {
    await delay(100);
    const newPlan = {
      id: Date.now(),
      ...plan,
      completed: false,
      salesId: user?.id,
      salesName: user?.name,
    };
    const dateKey = plan.date;
    if (!followUpCalendarData[dateKey]) {
      followUpCalendarData[dateKey] = [];
    }
    followUpCalendarData[dateKey].push(newPlan);
    return newPlan;
  },

  async completePlan(dateKey, planId) {
    await delay(100);
    const plans = followUpCalendarData[dateKey];
    if (plans) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        plan.completed = true;
        return plan;
      }
    }
    return null;
  }
};

// 销售指引API
export const guideApi = {
  async getList(params = {}) {
    await delay(100);
    let result = [...salesGuideData];
    if (params.category) {
      result = result.filter(g => g.category === params.category);
    }
    if (params.keyword) {
      result = result.filter(g =>
        g.title.includes(params.keyword) || g.summary.includes(params.keyword)
      );
    }
    return result;
  },

  async search(keyword) {
    await delay(200);
    return salesGuideData.filter(g =>
      g.title.includes(keyword) || g.summary.includes(keyword) || g.content.includes(keyword)
    );
  }
};

// 团队管理API
export const teamApi = {
  async getAttendance() {
    await delay(100);
    return teamData.attendance;
  },

  async getPerformance() {
    await delay(100);
    return teamData.performance;
  },

  async getBudget() {
    await delay(100);
    return teamData.budget;
  },

  async getMembers() {
    await delay(100);
    return teamData.members;
  }
};

// 日报提交后自动提取的客户信息建议更新
export const customerSuggestions = [];

// 关键词匹配规则
const threePhaseKeywords = {
  '建联': ['初次', '拜访', '认识', '接触', '首次', '见面', '介绍'],
  '摸底': ['需求', '方案', '预算', '了解', '调研', '摸底', '评估', '规划'],
  '跟踪': ['跟进', '报价', '谈判', '合同', '推进', '签单', '落实'],
};

const fiveElementKeywords = {
  background: ['背景', '公司', '行业', '业务', '规模', '成立'],
  budget: ['预算', '金额', '投资', '费用', '资金', '采购额'],
  keyPerson: ['关键人', '决策', '负责人', '拍板', '决策者', '领导'],
  stage: ['阶段', '流程', '时间表', '节点', '进度', '计划'],
  competition: ['竞对', '竞争', '对手', '友商', '竞标', '竞品'],
};

// 从日报内容中提取客户信息建议
function extractCustomerSuggestions(report, user) {
  const content = report.workContent || '';
  const customerNames = report.customers || [];
  const today = new Date().toISOString().split('T')[0];

  customerNames.forEach(name => {
    const customer = customers.find(c => c.name === name);
    if (!customer) return;

    // 建议更新最后联系日期
    const suggestion = {
      id: Date.now() + Math.random(),
      customerId: customer.id,
      customerName: customer.name,
      salesId: user?.id,
      salesName: user?.name,
      reportId: report.id,
      reportDate: report.date,
      updates: [],
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    if (customer.lastContact !== today) {
      suggestion.updates.push({
        field: 'lastContact',
        label: '最后联系日期',
        oldValue: customer.lastContact || '无',
        newValue: today,
      });
    }

    // 推断三阶段
    let suggestedPhase = null;
    for (const [phase, keywords] of Object.entries(threePhaseKeywords)) {
      if (keywords.some(kw => content.includes(kw))) {
        suggestedPhase = phase;
        break;
      }
    }
    if (suggestedPhase && customer.threePhase !== suggestedPhase) {
      suggestion.updates.push({
        field: 'threePhase',
        label: '拓客三阶段',
        oldValue: customer.threePhase || '无',
        newValue: suggestedPhase,
      });
    }

    // 推断5要素
    const fe = customer.fiveElements || {};
    for (const [elem, keywords] of Object.entries(fiveElementKeywords)) {
      if (!fe[elem] && keywords.some(kw => content.includes(kw))) {
        suggestion.updates.push({
          field: `fiveElements.${elem}`,
          label: `5要素-${({background:'背景', budget:'预算', keyPerson:'关键人', stage:'阶段', competition:'竞争'})[elem]}`,
          oldValue: '未完成',
          newValue: '已完成',
        });
      }
    }

    if (suggestion.updates.length > 0) {
      customerSuggestions.push(suggestion);
    }
  });
}

// 客户信息建议API
export const suggestionApi = {
  async getList(params = {}) {
    await delay(50);
    let result = [...customerSuggestions];
    if (params.salesId) {
      result = result.filter(s => s.salesId === params.salesId);
    }
    return result;
  },

  async apply(suggestionId) {
    await delay(50);
    const idx = customerSuggestions.findIndex(s => s.id === suggestionId);
    if (idx === -1) return null;
    const suggestion = customerSuggestions[idx];
    const customer = customers.find(c => c.id === suggestion.customerId);
    if (!customer) return null;

    suggestion.updates.forEach(u => {
      if (u.field.startsWith('fiveElements.')) {
        const elemKey = u.field.replace('fiveElements.', '');
        if (!customer.fiveElements) customer.fiveElements = {};
        customer.fiveElements[elemKey] = true;
      } else {
        customer[u.field] = u.newValue;
      }
    });

    customerSuggestions.splice(idx, 1);
    return { success: true };
  },

  async dismiss(suggestionId) {
    await delay(50);
    const idx = customerSuggestions.findIndex(s => s.id === suggestionId);
    if (idx !== -1) {
      customerSuggestions.splice(idx, 1);
      return { success: true };
    }
    return null;
  }
};

// 用户认证API
export const authApi = {
  async login(username, password) {
    await delay(300);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...userInfo } = user;
      return { success: true, user: userInfo };
    }
    return { success: false, message: '用户名或密码错误' };
  },

  async logout() {
    await delay(100);
    return { success: true };
  }
};

// 获取阶段配置
export const getProjectStages = () => projectStages;
export const getCustomerGrades = () => customerGrades;

// 线索解析：从沟通记录中提取关键信息并联动各模块
function parseLeadMessage(text) {
  const extracted = {};
  const actions = [];

  // 1. 提取客户名称：先匹配已有客户，再从模式提取
  let customer = customers.find(c => text.includes(c.name));
  if (customer) {
    extracted.customerName = customer.name;
    extracted.customerExists = true;
  } else {
    const companyMatch = text.match(/([\u4e00-\u9fa5]{2,6}(?:公司|集团|科技|技术|网络|信息技术|互联网|软件|电子|通信|通讯))/);
    if (companyMatch) {
      extracted.customerName = companyMatch[1];
      extracted.customerExists = false;
    }
  }

  // 2. 提取联系人
  const contactMatch = text.match(/([\u4e00-\u9fa5]{1,2}(?:经理|总|总监|主管|主任|部长))/);
  if (contactMatch) {
    extracted.contact = contactMatch[1];
  }

  // 3. 提取商机阶段（三阶段）
  for (const [phase, keywords] of Object.entries(threePhaseKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      extracted.threePhase = phase;
      break;
    }
  }

  // 提取商机阶段（8阶段 S1-S8）
  const stageMatch = text.match(/(S[1-8])/);
  if (stageMatch) {
    extracted.stageCode = stageMatch[1];
  }

  // 4. 提取金额
  const amountMatch = text.match(/[¥￥]?\s?(\d+(?:\.\d+)?)\s*万/);
  if (amountMatch) {
    extracted.amount = parseFloat(amountMatch[1]) * 10000;
  }

  // 5. 提取需求关键词（5要素）
  const fe = {};
  for (const [elem, keywords] of Object.entries(fiveElementKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      fe[elem] = true;
    }
  }
  if (Object.keys(fe).length > 0) {
    extracted.fiveElements = fe;
  }

  // 6. 提取下一步计划/时间
  const nextStepMatch = text.match(/(?:下周|明天|后续|安排|计划|预定)(.{2,20})/);
  if (nextStepMatch) {
    extracted.nextStep = nextStepMatch[0];
  }

  // 提取具体日期（下周X/周X/明天）
  const weekDayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '天': 7 };
  let planDate = null;
  const weekMatch = text.match(/(下周|本周)?(?:周|星期)([一二三四五六七天日])/);
  if (weekMatch) {
    const dayNum = weekDayMap[weekMatch[2]];
    if (dayNum) {
      const d = new Date();
      const currentDay = d.getDay() || 7;
      let diff = dayNum - currentDay;
      if (weekMatch[1] === '下周') diff += 7;
      if (diff < 0) diff += 7;
      d.setDate(d.getDate() + diff);
      planDate = d.toISOString().split('T')[0];
      extracted.planDate = planDate;
    }
  }
  const tomorrowMatch = text.match(/明天/);
  if (tomorrowMatch && !planDate) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    planDate = d.toISOString().split('T')[0];
    extracted.planDate = planDate;
  }

  // 7. 风险信号检测
  const riskKeywords = ['竞对介入', '客户犹豫', '预算缩减', '暂停', '取消', '推迟', '友商', '竞品'];
  const detectedRisks = riskKeywords.filter(kw => text.includes(kw));
  if (detectedRisks.length > 0) {
    extracted.risks = detectedRisks;
  }

  // === 自动连接模块 ===

  // 客户管理：更新或新建
  if (customer) {
    const today = new Date().toISOString().split('T')[0];
    customer.lastContact = today;
    if (extracted.threePhase) customer.threePhase = extracted.threePhase;
    if (extracted.fiveElements) {
      if (!customer.fiveElements) customer.fiveElements = {};
      Object.assign(customer.fiveElements, extracted.fiveElements);
    }
    actions.push({ module: '客户管理', action: '已更新联系日期和阶段信息', link: 'customer-grade' });
  } else if (extracted.customerName) {
    const newCustomer = {
      id: Date.now(),
      name: extracted.customerName,
      contact: extracted.contact || '',
      phone: '',
      status: '线索',
      stage: '初次接触',
      amount: extracted.amount || 0,
      lastContact: new Date().toISOString().split('T')[0],
      salesId: 2,
      salesName: '销售A',
      grade: 'Probably',
      threePhase: extracted.threePhase || '建联',
      fiveElements: extracted.fiveElements || { background: false, budget: false, keyPerson: false, stage: false, competition: false },
    };
    customers.push(newCustomer);
    actions.push({ module: '客户管理', action: '已新建客户记录', link: 'customer-grade' });
  }

  // 沟通记录：新增
  if (extracted.customerName) {
    communications.unshift({
      id: Date.now() + 1,
      customerId: customer ? customer.id : customers[customers.length - 1]?.id,
      customerName: extracted.customerName,
      date: new Date().toLocaleString('zh-CN'),
      type: '拜访',
      content: text.substring(0, 100),
      contact: extracted.contact || '',
    });
    actions.push({ module: '沟通记录', action: '已添加沟通记录', link: 'customer-grade' });
  }

  // 商机/项目：更新或新建
  if (customer) {
    const project = projects.find(p => p.customer === customer.name);
    if (project && extracted.stageCode) {
      project.stage = extracted.stageCode;
      actions.push({ module: '商机看板', action: '已更新商机阶段', link: 'ppl' });
    }
  } else if (extracted.customerName && extracted.amount) {
    projects.push({
      id: Date.now() + 2,
      name: extracted.customerName + '项目',
      customer: extracted.customerName,
      stage: extracted.stageCode || 'S1',
      progress: 10,
      amount: extracted.amount,
      expectedAmount: extracted.amount,
      actualAmount: null,
      startDate: new Date().toISOString().split('T')[0],
      expectedClose: '',
      stageEnterDate: new Date().toISOString().split('T')[0],
      description: '',
      salesId: 2,
      salesName: '销售A',
      milestones: [{ stage: extracted.stageCode || 'S1', date: new Date().toISOString().split('T')[0], note: '线索解析自动创建' }],
    });
    actions.push({ module: '商机看板', action: '已新建商机', link: 'ppl' });
  }

  // 跟进日历：如提取到时间线索，创建跟进计划
  if (planDate && extracted.customerName) {
    const dateKey = planDate;
    const newPlan = {
      id: Date.now() + 3,
      customerName: extracted.customerName,
      content: extracted.nextStep || '跟进计划',
      completed: false,
      salesId: 2,
      salesName: '销售A',
    };
    if (!followUpCalendarData[dateKey]) {
      followUpCalendarData[dateKey] = [];
    }
    followUpCalendarData[dateKey].push(newPlan);
    actions.push({ module: '跟进日历', action: '已创建跟进计划 (' + planDate + ')', link: 'alert-calendar' });
  }

  // PPL数据：如金额变化，更新
  if (extracted.amount) {
    pplData.currentPPL += extracted.amount;
    pplData.healthRatio = pplData.kpiTarget > 0 ? pplData.currentPPL / pplData.kpiTarget : 0;
    actions.push({ module: 'PPL数据', action: '已更新PPL金额', link: 'ppl' });
  }

  // 告警中心：如检测到风险信号，生成告警
  if (detectedRisks.length > 0 && extracted.customerName) {
    alertsData.unshift({
      id: Date.now() + 4,
      type: 'project_abnormal',
      typeName: '项目异常',
      severity: 'purple',
      object: extracted.customerName,
      description: '检测到风险信号: ' + detectedRisks.join('、'),
      time: new Date().toLocaleString('zh-CN'),
      handled: false,
      ignored: false,
      salesId: 2,
      salesName: '销售A',
    });
    actions.push({ module: '告警中心', action: '已生成风险告警', link: 'alert-calendar' });
  }

  // Build structured result
  const leadResult = { extracted, actions };

  // Generate human-readable summary
  let summary = '已解析线索记录，提取到以下信息：\n';
  if (extracted.customerName) summary += `- 客户: ${extracted.customerName}${extracted.customerExists ? '（已有）' : '（新建）'}\n`;
  if (extracted.contact) summary += `- 联系人: ${extracted.contact}\n`;
  if (extracted.threePhase) summary += `- 拓客阶段: ${extracted.threePhase}\n`;
  if (extracted.stageCode) summary += `- 商机阶段: ${extracted.stageCode}\n`;
  if (extracted.amount) summary += `- 金额: ¥${(extracted.amount / 10000).toFixed(0)}万\n`;
  if (extracted.fiveElements) {
    const labels = { background: '背景', budget: '预算', keyPerson: '关键人', stage: '阶段', competition: '竞争' };
    const matched = Object.keys(extracted.fiveElements).map(k => labels[k]).join('、');
    summary += `- 5要素: ${matched}\n`;
  }
  if (extracted.nextStep) summary += `- 下一步: ${extracted.nextStep}\n`;
  if (detectedRisks.length > 0) summary += `- ⚠️ 风险信号: ${detectedRisks.join('、')}\n`;

  if (actions.length > 0) {
    summary += '\n已自动同步以下模块：\n';
    actions.forEach(a => { summary += `- ${a.module}: ${a.action}\n`; });
  }

  return summary + '\n__LEAD_RESULT__\n' + JSON.stringify(leadResult) + '\n__END_LEAD_RESULT__';
}

// 智能体API
export const agentApi = {
  async getConversationalList() {
    await delay(150);
    return [...conversationalAgents];
  },

  async getAutomationList() {
    await delay(150);
    return [...automationAgents];
  },

  async createConversational(data) {
    await delay(200);
    const newAgent = {
      id: 'conv-' + Date.now(),
      type: 'conversational',
      ...data,
      createdBy: 'manager',
      createdAt: new Date().toISOString().split('T')[0],
    };
    conversationalAgents.push(newAgent);
    agentChatHistory[newAgent.id] = [
      { id: 'm1', role: 'agent', content: data.greeting || '你好！有什么可以帮你的？', time: new Date().toLocaleString('zh-CN') },
    ];
    return newAgent;
  },

  async createAutomation(data) {
    await delay(200);
    const newAgent = {
      id: 'auto-' + Date.now(),
      type: 'automation',
      ...data,
      enabled: true,
      lastExecTime: null,
      execCount: 0,
      createdBy: 'manager',
      createdAt: new Date().toISOString().split('T')[0],
    };
    automationAgents.push(newAgent);
    automationLogs[newAgent.id] = [];
    return newAgent;
  },

  async deleteAgent(id) {
    await delay(100);
    const convIdx = conversationalAgents.findIndex(a => a.id === id);
    if (convIdx !== -1) {
      conversationalAgents.splice(convIdx, 1);
      delete agentChatHistory[id];
      return true;
    }
    const autoIdx = automationAgents.findIndex(a => a.id === id);
    if (autoIdx !== -1) {
      automationAgents.splice(autoIdx, 1);
      delete automationLogs[id];
      return true;
    }
    return false;
  },

  async sendMessage(agentId, message) {
    await delay(800 + Math.random() * 1200);
    const agent = conversationalAgents.find(a => a.id === agentId);
    if (!agent) return null;

    const now = new Date().toLocaleString('zh-CN');
    const userMsg = { id: 'm' + Date.now(), role: 'user', content: message, time: now };
    if (!agentChatHistory[agentId]) agentChatHistory[agentId] = [];
    agentChatHistory[agentId].push(userMsg);

    let reply = '';

    // lead_parse tool: extract info from communication record and sync to modules
    if (agent.tools.includes('lead_parse')) {
      reply = parseLeadMessage(message);
    }

    if (agent.tools.includes('crm_query') && !reply) {
      const keyword = message.replace(/帮我|分析|查看|了解一下|的|情况|跟进/g, '').trim();
      const found = customers.find(c => c.name.includes(keyword));
      if (found) {
        const project = projects.find(p => p.customer === found.name);
        reply = `根据CRM数据分析，${found.name}当前状态为"${found.status}"，${project ? `处于${project.stage}阶段，` : ''}上次跟进时间为${found.lastContact}。客户联系人为${found.contact}，商机金额¥${(found.amount / 10000).toFixed(0)}万。`;
        if (found.lastContact && new Date() - new Date(found.lastContact) > 3 * 86400000) {
          reply += '\n⚠️ 注意：该客户已超过3天未跟进，建议尽快安排跟进。';
        }
      } else if (message.includes('所有') || message.includes('概览') || message.includes('总览')) {
        reply = `当前共有${customers.length}个客户，其中Committed ${customers.filter(c => c.grade === 'Committed').length}个，Upside ${customers.filter(c => c.grade === 'Upside').length}个，Probably ${customers.filter(c => c.grade === 'Probably').length}个。活跃商机${projects.length}个，总PPL金额¥${(pplData.currentPPL / 10000).toFixed(0)}万。`;
      } else {
        reply = `未找到与"${keyword}"相关的客户数据，请尝试输入更准确的客户名称。`;
      }
    }

    if (agent.tools.includes('followup_advice') && !reply) {
      const advices = [
        '建议按照"建联-摸底-跟踪"三阶段推进，当前应聚焦需求确认和关系建立。',
        '根据历史数据分析，建议每周至少跟进1次Committed客户，2周1次Upside客户。',
        '该客户的关键人尚未完全确认，建议优先完成5要素中的关键人识别。',
        '建议结合竞对分析，突出我们在服务响应速度上的优势，差异化竞争。',
      ];
      reply = advices[Math.floor(Math.random() * advices.length)];
    }

    if (!reply) {
      reply = `作为${agent.role}，我理解您的问题。请提供更多具体信息，我可以帮您分析数据或提供建议。`;
    }

    const agentMsg = { id: 'm' + (Date.now() + 1), role: 'agent', content: reply, time: new Date().toLocaleString('zh-CN') };
    agentChatHistory[agentId].push(agentMsg);
    return agentMsg;
  },

  async getChatHistory(agentId) {
    await delay(100);
    return agentChatHistory[agentId] || [];
  },

  async toggleAutomation(id, enabled) {
    await delay(100);
    const agent = automationAgents.find(a => a.id === id);
    if (agent) {
      agent.enabled = enabled;
      return agent;
    }
    return null;
  },

  async executeAutomation(id) {
    await delay(1500 + Math.random() * 1000);
    const agent = automationAgents.find(a => a.id === id);
    if (!agent) return null;

    const now = new Date().toLocaleString('zh-CN');
    const duration = 800 + Math.floor(Math.random() * 2000);
    agent.lastExecTime = now;
    agent.execCount += 1;

    const outputs = {
      send_notification: '通知已成功发送',
      gen_report: '报告已成功生成',
      create_follow_plan: '跟进计划已创建',
      update_grade: '客户分级已更新',
    };
    const output = outputs[agent.action.type] || '执行完成';

    const log = {
      id: 'l' + Date.now(),
      time: now,
      duration,
      status: Math.random() > 0.1 ? 'success' : 'error',
      output,
    };
    if (!automationLogs[id]) automationLogs[id] = [];
    automationLogs[id].unshift(log);
    return log;
  },

  async getAutomationLogs(id) {
    await delay(100);
    return automationLogs[id] || [];
  },

  getAgentTools() { return agentTools; },
  getAutomationEvents() { return automationEvents; },
  getAutomationActions() { return automationActions; },
};
