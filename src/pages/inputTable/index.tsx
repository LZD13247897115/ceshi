import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import { useState } from 'react';

const InputTable: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);

    setSelectedRowKeys(newSelectedRowKeys);
  };

  interface DataType {
    key: React.Key;

    name: string;

    age: number;

    address: string;
  }

  // 编辑

  const handleEdit = (record: DataType) => {
    console.log('编辑', record);

    message.info(`编辑 ${record.name}`);
  };

  // 删除

  const handleDelete = (record: DataType) => {
    console.log('删除', record);

    message.success(`已删除 ${record.name}`);
  };

  // 查看详情

  const handleView = (record: DataType) => {
    console.log('查看', record);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',

      dataIndex: 'name',
    },

    {
      title: 'Age',

      dataIndex: 'age',
    },

    {
      title: 'Address',

      dataIndex: 'address',
    },

    {
      title: '操作',

      key: 'action',

      fixed: 'right', // 固定在最右侧

      width: 200,

      render: (_, record) => {
        return (
          <Space size="middle">
            <Button type="link" size="small" onClick={() => handleView(record)}>
              查看
            </Button>

            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>

            <Popconfirm
              title="确认删除?"
              description={`确定要删除 ${record.name} 吗？`}
              onConfirm={() => handleDelete(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const data: DataType[] = [];

  for (let i = 0; i < 46; i++) {
    data.push({
      key: i,

      name: `Edward King ${i}`,

      age: 32,

      address: `London, Park Lane no. ${i}`,
    });
  }

  const rowSelection = {
    selectedRowKeys,

    onChange: onSelectChange,
  };

  return (
    <>
      <Card>
        <Form>
          <Row>
            <Col>
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
        />
      </Card>
    </>
  );
};

export default InputTable;
