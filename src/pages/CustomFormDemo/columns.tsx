import { Button, Popconfirm, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableActions, TableRecord } from './types';

/**
 * getTableColumns —— 生成表格列配置
 * 操作列通过 actions 注入回调，避免 columns 文件里直接依赖页面 state
 */
export function getTableColumns(
  actions: TableActions,
): ColumnsType<TableRecord> {
  return [
    { title: '用户名', dataIndex: 'username', width: 100 },
    { title: '部门', dataIndex: 'departmentTitle', width: 120 },
    { title: '区域', dataIndex: 'regionTitles', width: 160 },
    { title: '年龄', dataIndex: 'age', width: 80 },
    { title: '地址', dataIndex: 'address' },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => actions.onView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => actions.onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除?"
            description={`确定要删除 ${record.username} 吗？`}
            onConfirm={() => actions.onDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
