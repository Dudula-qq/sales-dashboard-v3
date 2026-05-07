import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { funnelApi, customerApi } from '../../services/api';

const CustomerFunnel = ({ user }) => {
  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    // 获取客户数据来计算漏斗
    const params = {};
    if (user?.role !== 'manager') {
      params.salesId = user?.id;
    }
    const { data: customers } = await customerApi.getList(params);

    // 根据客户状态计算漏斗数据
    const funnel = [
      { name: '线索', value: customers.filter(c => c.status === '线索').length || 0 },
      { name: '意向', value: customers.filter(c => c.status === '意向').length || 0 },
      { name: '报价', value: customers.filter(c => c.status === '报价').length || 0 },
      { name: '成交', value: customers.filter(c => c.status === '成交').length || 0 },
    ];

    // 如果没有数据，显示模拟数据
    if (funnel.every(f => f.value === 0)) {
      const baseData = await funnelApi.getData();
      setFunnelData(baseData);
    } else {
      setFunnelData(funnel);
    }
  };

  const getOption = () => {
    return {
      title: {
        text: '客户转化漏斗',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const total = funnelData[0]?.value || 1;
          const rate = ((params.value / total) * 100).toFixed(1);
          return `${params.name}<br/>数量: ${params.value}<br/>转化率: ${rate}%`;
        }
      },
      series: [
        {
          name: '客户漏斗',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 20,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '20%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}: {c}',
            color: '#fff',
            fontSize: 12
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 14
            }
          },
          data: funnelData.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: ['#1890ff', '#52c41a', '#faad14', '#722ed1'][index]
            }
          }))
        }
      ]
    };
  };

  return (
    <div>
      <div className="card-title">客户转化漏斗</div>
      <ReactECharts
        option={getOption()}
        style={{ height: '320px' }}
        notMerge={true}
      />
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
        {funnelData.map((item, index) => {
          const total = funnelData[0]?.value || 1;
          const rate = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: ['#1890ff', '#52c41a', '#faad14', '#722ed1'][index] }}>
                {item.value}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>转化率 {rate}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerFunnel;
