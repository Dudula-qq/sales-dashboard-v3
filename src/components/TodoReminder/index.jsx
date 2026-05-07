import React, { useEffect, useState } from 'react';
import { todoApi } from '../../services/api';

const TodoReminder = ({ user, standalone }) => {
  const [todos, setTodos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    priority: 'medium',
    deadline: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTodos();
  }, [user]);

  const loadTodos = async () => {
    const params = {};
    // 非管理员只能看自己的待办
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const data = await todoApi.getList(params);
    setTodos(data);
  };

  const handleToggle = async (id) => {
    await todoApi.toggle(id);
    loadTodos();
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除此待办事项？')) {
      await todoApi.delete(id);
      loadTodos();
    }
  };

  const handleAdd = async () => {
    if (!newTodo.title.trim()) return;
    await todoApi.add(newTodo, user);
    setNewTodo({ title: '', priority: 'medium', deadline: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
    loadTodos();
  };

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div style={{ background: standalone ? '#fff' : 'transparent', borderRadius: '8px', padding: standalone ? '24px' : '0' }}>
      <div className="card-title">
        <span>待办事项</span>
        <button className="btn btn-sm btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          + 添加
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="待办事项内容..."
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
              style={{ padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px' }}
            >
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
            <input
              type="date"
              value={newTodo.deadline}
              onChange={(e) => setNewTodo({ ...newTodo, deadline: e.target.value })}
              style={{ padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>保存</button>
            <button className="btn btn-default btn-sm" onClick={() => setShowAddForm(false)}>取消</button>
          </div>
        </div>
      )}

      <div className="todo-list">
        {incompleteTodos.length === 0 && completedTodos.length === 0 && (
          <div className="empty-state" style={{ padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div>暂无待办事项</div>
          </div>
        )}

        {incompleteTodos.map(todo => (
          <div key={todo.id} className="todo-item">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <div className="todo-content">
              <div className="todo-text">{todo.title}</div>
              <div className="todo-meta">
                <span className={`priority-tag ${todo.priority}`}>
                  {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}优先级
                </span>
                <span>截止: {todo.deadline}</span>
              </div>
            </div>
            <div className="todo-actions">
              <span className="todo-delete" onClick={() => handleDelete(todo.id)}>🗑</span>
            </div>
          </div>
        ))}

        {completedTodos.length > 0 && (
          <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '12px', color: '#999' }}>
            已完成 ({completedTodos.length})
          </div>
        )}

        {completedTodos.map(todo => (
          <div key={todo.id} className="todo-item completed">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <div className="todo-content">
              <div className="todo-text">{todo.title}</div>
              <div className="todo-meta">
                <span>已完成</span>
              </div>
            </div>
            <div className="todo-actions">
              <span className="todo-delete" onClick={() => handleDelete(todo.id)}>🗑</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoReminder;
