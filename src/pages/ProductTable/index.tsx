import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';

// 模拟产品数据类型
export interface ProductType {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'online' | 'offline' | 'soldout';
  createTime: string;
  description?: string;
}

const ProductTable: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<ProductType>();
  const [selectedRows, setSelectedRows] = useState<ProductType[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const actionRef = useRef<ActionType>();

  // 模拟数据请求
  const fetchProductList = async (params: any) => {
    const { current = 1, pageSize = 10 } = params;
    const categories = ['手机', '电脑', '耳机', '配件'];
    const statuses: ProductType['status'][] = ['online', 'offline', 'soldout'];
    const productNames = ['iPhone 15 Pro', 'MacBook Pro', 'AirPods Pro'];

    const allData: ProductType[] = Array.from({ length: 35 }, (_, index) => ({
      id: String(index + 1),
      name:
        productNames[index % productNames.length] +
        (index >= productNames.length ? ` ${index + 1}` : ''),
      category: categories[index % categories.length],
      price: 1999 + index * 500,
      stock: index % 5 === 0 ? 0 : 20 + index * 3,
      status: statuses[index % statuses.length],
      createTime: `2024-0${(index % 9) + 1}-15 10:30:00`,
      description: '模拟产品数据',
    }));

    const start = (current - 1) * pageSize;
    const data = allData.slice(start, start + pageSize);

    return {
      data,
      success: true,
      total: allData.length,
    };
  };

  // 添加产品
  const handleAdd = async (values: ProductType) => {
    const hide = message.loading('正在添加...');
    try {
      // 调用添加 API
      console.log('添加产品:', values);
      hide();
      message.success('添加成功');
      setCreateModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('添加失败，请重试');
      return false;
    }
  };

  // 更新产品
  const handleUpdate = async (values: ProductType) => {
    const hide = message.loading('正在更新...');
    try {
      // 调用更新 API
      console.log('更新产品:', values);
      hide();
      message.success('更新成功');
      setUpdateModalVisible(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('更新失败，请重试');
      return false;
    }
  };

  // 删除产品
  const handleDelete = async (record: ProductType) => {
    const hide = message.loading('正在删除...');
    try {
      // 调用删除 API
      console.log('删除产品:', record.id);
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    const hide = message.loading('正在删除...');
    try {
      console.log(
        '批量删除:',
        selectedRows.map((row) => row.id),
      );
      hide();
      message.success('批量删除成功');
      setSelectedRows([]);
      actionRef.current?.reload();
    } catch (error) {
      hide();
      message.error('批量删除失败，请重试');
    }
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 表格列配置
  const columns: ProColumns<ProductType>[] = [
    {
      title: '产品ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true, message: '产品名称为必填项' }],
      },
    },
    {
      title: '产品编码',
      dataIndex: 'code',
      width: 120,
      hideInTable: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      valueType: 'select',
      valueEnum: {
        手机: { text: '手机' },
        电脑: { text: '电脑' },
        耳机: { text: '耳机' },
        配件: { text: '配件' },
      },
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      width: 100,
      valueType: 'select',
      valueEnum: {
        苹果: { text: '苹果' },
        华为: { text: '华为' },
        小米: { text: '小米' },
        三星: { text: '三星' },
      },
      hideInTable: true,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      width: 120,
      hideInTable: true,
    },
    {
      title: '产地',
      dataIndex: 'origin',
      width: 100,
      valueType: 'select',
      valueEnum: {
        中国: { text: '中国' },
        美国: { text: '美国' },
        日本: { text: '日本' },
        韩国: { text: '韩国' },
      },
      hideInTable: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 120,
      valueType: 'money',
      search: false,
      sorter: true,
      render: (_, record) => `¥${record.price.toLocaleString()}`,
    },
    {
      title: '最低价格',
      dataIndex: 'minPrice',
      width: 120,
      valueType: 'digit',
      hideInTable: true,
      fieldProps: {
        placeholder: '最低价格',
      },
    },
    {
      title: '最高价格',
      dataIndex: 'maxPrice',
      width: 120,
      valueType: 'digit',
      hideInTable: true,
      fieldProps: {
        placeholder: '最高价格',
      },
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => {
        const color =
          record.stock > 50 ? 'green' : record.stock > 0 ? 'orange' : 'red';
        return <Tag color={color}>{record.stock}</Tag>;
      },
    },
    {
      title: '最低库存',
      dataIndex: 'minStock',
      width: 120,
      valueType: 'digit',
      hideInTable: true,
      fieldProps: {
        placeholder: '最低库存',
      },
    },
    {
      title: '最高库存',
      dataIndex: 'maxStock',
      width: 120,
      valueType: 'digit',
      hideInTable: true,
      fieldProps: {
        placeholder: '最高库存',
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        online: { text: '在售', status: 'Success' },
        offline: { text: '下架', status: 'Default' },
        soldout: { text: '售罄', status: 'Error' },
      },
    },
    {
      title: '销售区域',
      dataIndex: 'region',
      width: 120,
      valueType: 'select',
      valueEnum: {
        华东: { text: '华东' },
        华南: { text: '华南' },
        华北: { text: '华北' },
        西南: { text: '西南' },
      },
      hideInTable: true,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      width: 120,
      valueType: 'select',
      valueEnum: {
        北京仓: { text: '北京仓' },
        上海仓: { text: '上海仓' },
        广州仓: { text: '广州仓' },
        深圳仓: { text: '深圳仓' },
      },
      hideInTable: true,
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      width: 100,
      hideInTable: true,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 120,
      hideInTable: true,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 100,
      hideInTable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '创建日期范围',
      dataIndex: 'createTimeRange',
      width: 200,
      valueType: 'dateRange',
      hideInTable: true,
      fieldProps: {
        placeholder: ['开始日期', '结束日期'],
      },
    },
    {
      title: '更新人',
      dataIndex: 'updater',
      width: 100,
      hideInTable: true,
    },
    {
      title: '更新时间范围',
      dataIndex: 'updateTimeRange',
      width: 200,
      valueType: 'dateRange',
      hideInTable: true,
      fieldProps: {
        placeholder: ['开始日期', '结束日期'],
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 120,
      valueType: 'select',
      valueEnum: {
        热销: { text: '热销' },
        新品: { text: '新品' },
        促销: { text: '促销' },
        推荐: { text: '推荐' },
      },
      hideInTable: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      hideInTable: true,
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalVisible(true);
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确定要删除这个产品吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
          <a>详情</a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<ProductType>
        headerTitle="产品列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          span: 4,
          collapsed,
          onCollapse: setCollapsed,
          defaultFormItemsNumber: 11,
          layout: 'vertical',
          searchGutter: 16,
          collapseRender: (isCollapsed) => {
            return isCollapsed ? '展开' : '收起';
          },
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建产品
          </Button>,
        ]}
        request={fetchProductList}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: {
            goButton: '跳转',
          },
        }}
        scroll={{ x: 1200 }}
      />

      {/* 批量操作工具栏 */}
      {selectedRows?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> 项
            </div>
          }
        >
          <Button onClick={() => setSelectedRows([])}>取消选择</Button>
          <Popconfirm
            title={`确定要删除选中的 ${selectedRows.length} 个产品吗？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>批量删除</Button>
          </Popconfirm>
          <Button type="primary">批量上架</Button>
        </FooterToolbar>
      )}

      {/* 创建弹窗 */}
      <CreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleAdd}
      />

      {/* 更新弹窗 */}
      {currentRow && (
        <UpdateModal
          visible={updateModalVisible}
          onCancel={() => {
            setUpdateModalVisible(false);
            setCurrentRow(undefined);
          }}
          onSubmit={handleUpdate}
          initialValues={currentRow}
        />
      )}
    </PageContainer>
  );
};

export default ProductTable;
