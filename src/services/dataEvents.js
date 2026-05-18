// 全局数据变更通知 - 当数据被修改时触发，其他组件监听并刷新
const listeners = {};

const DataEvents = {
  CUSTOMER_CHANGED: 'customer_changed',
  PROJECT_CHANGED: 'project_changed',
  PPL_CHANGED: 'ppl_changed',
  ALERT_CHANGED: 'alert_changed',
};

// 触发数据变更事件
export function emitDataChange(eventType) {
  if (listeners[eventType]) {
    listeners[eventType].forEach(fn => fn());
  }
}

// 监听数据变更
export function onDataChange(eventType, callback) {
  if (!listeners[eventType]) {
    listeners[eventType] = [];
  }
  listeners[eventType].push(callback);
  // 返回取消监听函数
  return function off() {
    listeners[eventType] = listeners[eventType].filter(fn => fn !== callback);
  };
}

export default DataEvents;
