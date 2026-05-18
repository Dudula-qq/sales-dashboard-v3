import React, { useEffect, useState } from 'react';
import { customerApi } from '../../services/api';
import { onDataChange } from '../../services/dataEvents';

const CustomerStatusBoard = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadCustomers();
    const off = onDataChange('customer_changed', loadCustomers);
    return off;
  }, [statusFilter, user]);

  const loadCustomers = async () => {
    setLoading(true);
    // 非管理员只能看自己的客户
    const params = { status: statusFilter, keyword };
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const { data } = await customerApi.getList(params);
    setCustomers(data);
    setLoading(false);
  };

  const handleSearch = () => {
    loadCustomers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatAmount = (amount) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount;
  };

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
      <div className="card-title">
        <span>客户状态看板</span>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索客户名称或联系人..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">全部状态</option>
          <option value="线索">线索</option>
          <option value="意向">意向</option>
          <option value="报价">报价</option>
          <option value="成交">成交</option>
        </select>
        <button className="btn btn-primary" onClick={handleSearch}>
          搜索
        </button>
      </div>

      {loading ? (
        <div className="empty-state">加载中...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>客户名称</th>
              <th>联系人</th>
              <th>状态</th>
              <th>阶段</th>
              <th>金额</th>
              <th>最近联系</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.contact}</td>
                <td>
                  <span className={`status-tag ${customer.status}`}>
                    {customer.status}
                  </span>
                </td>
                <td>{customer.stage}</td>
                <td style={{ color: '#1890ff', fontWeight: '500' }}>
                  ¥{formatAmount(customer.amount)}
                </td>
                <td style={{ color: '#999' }}>{customer.lastContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && customers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#bfbfbf' }}>—</div>
          <div>暂无客户数据</div>
        </div>
      )}
    </div>
  );
};

export default CustomerStatusBoard;
