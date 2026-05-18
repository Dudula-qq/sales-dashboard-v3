import React, { useState, useEffect } from 'react';
import { calendarApi } from '../../services/api';

const FollowUpCalendar = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ customerName: '', content: '' });

  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadMonthData();
  }, [currentDate, user]);

  const loadMonthData = async () => {
    const salesId = isManager ? undefined : user?.id;
    const data = await calendarApi.getMonthData(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      salesId
    );
    setMonthData(data);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPlansForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthData[dateStr] || [];
  };

  const hasOverdue = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const plans = monthData[dateStr] || [];
    return plans.some(p => !p.completed && new Date(dateStr) < new Date(todayStr));
  };

  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleAddPlan = async () => {
    if (!newPlan.customerName || !newPlan.content) return;
    await calendarApi.addPlan({
      date: selectedDate,
      customerName: newPlan.customerName,
      content: newPlan.content,
    }, user);
    setNewPlan({ customerName: '', content: '' });
    setShowAddForm(false);
    loadMonthData();
  };

  const handleComplete = async (planId) => {
    await calendarApi.completePlan(selectedDate, planId);
    loadMonthData();
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedPlans = selectedDate ? (monthData[selectedDate] || []) : [];

  // 管理员：按销售汇总当月统计
  const salesStats = isManager ? (() => {
    const map = {};
    Object.values(monthData).forEach(plans => {
      plans.forEach(p => {
        if (!map[p.salesName]) map[p.salesName] = { total: 0, completed: 0, overdue: 0 };
        map[p.salesName].total++;
        if (p.completed) map[p.salesName].completed++;
        const dateStr = Object.keys(monthData).find(d => monthData[d].includes(p));
        if (!p.completed && dateStr && new Date(dateStr) < new Date(todayStr)) {
          map[p.salesName].overdue++;
        }
      });
    });
    return map;
  })() : null;

  return (
    <div className="follow-up-calendar">
      <div className="board-header">
        <h2>跟进日历{isManager ? '（查看模式）' : ''}</h2>
      </div>

      {/* 管理员：销售跟进统计 */}
      {isManager && salesStats && (
        <div className="calendar-sales-stats">
          {Object.entries(salesStats).map(([name, stat]) => (
            <div key={name} className="css-card">
              <div className="css-name">{name}</div>
              <div className="css-nums">
                <span className="css-num">计划 <strong>{stat.total}</strong></span>
                <span className="css-num css-done">完成 <strong>{stat.completed}</strong></span>
                {stat.overdue > 0 && <span className="css-num css-over">逾期 <strong>{stat.overdue}</strong></span>}
              </div>
              <div className="css-bar-wrap">
                <div className="css-bar" style={{ width: stat.total > 0 ? `${(stat.completed / stat.total * 100).toFixed(0)}%` : '0%' }}></div>
                <span className="css-pct">{stat.total > 0 ? `${(stat.completed / stat.total * 100).toFixed(0)}%` : '0%'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-nav">
          <button className="btn btn-secondary" onClick={prevMonth}>&lsaquo; 上月</button>
          <span className="calendar-title">{year}年{month + 1}月</span>
          <button className="btn btn-secondary" onClick={nextMonth}>下月 &rsaquo;</button>
        </div>
        <div className="calendar-grid">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="calendar-day empty" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const plans = getPlansForDate(day);
            const isToday = dateStr === todayStr;
            const isOverdue = hasOverdue(day);
            const isSelected = dateStr === selectedDate;
            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <span className="day-number">{day}</span>
                {plans.length > 0 && (
                  <span className={`day-dot ${isOverdue ? 'dot-overdue' : 'dot-planned'}`}>&#8226;</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="calendar-day-detail">
          <div className="cdd-header">
            <h4>{selectedDate} 跟进计划</h4>
            {!isManager && (
              <button className="btn btn-sm btn-primary" onClick={() => setShowAddForm(true)}>+ 新增计划</button>
            )}
          </div>
          {selectedPlans.length === 0 && <div className="empty-state">该日暂无跟进计划</div>}
          <div className="cdd-plans">
            {selectedPlans.map(plan => (
              <div key={plan.id} className={`cdd-plan-item ${plan.completed ? 'completed' : ''}`}>
                <div className="cdd-plan-info">
                  <span className="cdd-plan-customer">{plan.customerName}</span>
                  <span className="cdd-plan-content">{plan.content}</span>
                  {isManager && plan.salesName && <span className="cdd-plan-sales">({plan.salesName})</span>}
                </div>
                {!isManager && !plan.completed && (
                  <button className="btn btn-sm btn-success" onClick={() => handleComplete(plan.id)}>&#10003; 完成</button>
                )}
                {plan.completed && <span className="cdd-done-mark">&#10003; 已完成</span>}
              </div>
            ))}
          </div>

          {!isManager && showAddForm && (
            <div className="cdd-add-form">
              <h5>新增跟进计划</h5>
              <div className="form-group">
                <label>客户名称</label>
                <input value={newPlan.customerName} onChange={e => setNewPlan({ ...newPlan, customerName: e.target.value })} placeholder="输入客户名称" />
              </div>
              <div className="form-group">
                <label>跟进内容</label>
                <input value={newPlan.content} onChange={e => setNewPlan({ ...newPlan, content: e.target.value })} placeholder="输入跟进内容" />
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>取消</button>
                <button className="btn btn-primary" onClick={handleAddPlan}>确认添加</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowUpCalendar;
