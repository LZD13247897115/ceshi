import { Card, Table } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import React from 'react';
import type { TableRecord } from '../types';

interface DataTableProps {
  loading: boolean;
  dataSource: TableRecord[];
  columns: ColumnsType<TableRecord>;
  rowSelection: TableRowSelection<TableRecord>;
}

/**
 * DataTable —— 下方数据表格
 */
const DataTable: React.FC<DataTableProps> = ({
  loading,
  dataSource,
  columns,
  rowSelection,
}) => {
  return (
    <Card title="数据列表" size="small" style={{ marginTop: 16 }}>
      <Table<TableRecord>
        rowKey="key"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
      />
    </Card>
  );
};

export default DataTable;
