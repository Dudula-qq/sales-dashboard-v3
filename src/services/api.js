// API 服务 - 模拟后端接口

import {
  customers,
  projects,
  funnelData,
  todos,
  communications,
  dailyReports,
  weeklyReports,
  users
} from '../data/mockData';

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 客户相关API
export const customerApi = {
  // 获取客户列表
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
    // 按销售ID过滤（非管理员只能看自己的客户）
    if (params.salesId) {
      result = result.filter(c => c.salesId === params.salesId);
    }
    return { data: result, total: result.length };
  },

  // 获取单个客户
  async getById(id) {
    await delay(100);
    const customer = customers.find(c => c.id === id);
    return customer || null;
  },

  // 更新客户
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
  // 获取项目列表
  async getList(params = {}) {
    await delay(200);
    let result = [...projects];

    if (params.stage) {
      result = result.filter(p => p.stage === params.stage);
    }
    // 按销售ID过滤（非管理员只能看自己的项目）
    if (params.salesId) {
      result = result.filter(p => p.salesId === params.salesId);
    }
    return { data: result, total: result.length };
  },

  // 获取单个项目
  async getById(id) {
    await delay(100);
    const project = projects.find(p => p.id === id);
    return project || null;
  },

  // 更新项目阶段
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
    // 按销售ID过滤（非管理员只能看自己的待办）
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

    // 按日期倒序
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
      date: new Date().toISOString().split('T')[0]
    };
    dailyReports.unshift(newReport);
    return newReport;
  },

  // 获取按用户分组的日报统计
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
      // 如果不存在，添加新的周报
      weeklyReports.unshift(report);
      return report;
    }
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
