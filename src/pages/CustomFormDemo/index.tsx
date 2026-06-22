/**
 * CustomFormDemo —— 页面入口（仅负责组装，业务逻辑在 hooks / components）
 *
 * 路由：/custom-form（见 .umirc.ts）
 * 访问：http://localhost:8000/custom-form
 *
 * 目录结构：
 *   CustomFormDemo/
 *     index.tsx              页面入口（本文件）
 *     index.less             页面样式
 *     types.ts               类型定义
 *     constants.ts           常量 & 模拟数据
 *     columns.tsx            表格列配置
 *     components/
 *       SearchForm.tsx       上方查询表单
 *       DataTable.tsx        下方数据表格
 *     hooks/
 *       useCustomFormList.ts 表格状态 & 查询逻辑
 *     utils/
 *       filterTableData.ts   表单条件过滤
 *
 *   components/TreeFormPicker/   可复用的树形表单控件（跨页面）
 *     TreeSinglePicker.tsx      表单 Input（点击打开弹窗）
 *     TreeMultiPicker.tsx       表单 Input（点击打开弹窗）
 *     TreePickerModal.tsx       树形选择弹窗（与表单分离）
 *     types.ts / utils.ts
 *
 *   联动：区域（多选）选了 → 部门（单选）才可点击
 */
import { Form, Typography } from 'antd';
import React from 'react';
import DataTable from './components/DataTable';
import SearchForm from './components/SearchForm';
import { useCustomFormList } from './hooks/useCustomFormList';
import './index.less';
import type { FormValues } from './types';

const { Title, Text } = Typography;

const CustomFormDemo: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const {
    tableData,
    loading,
    columns,
    rowSelection,
    handleSubmit,
    handleReset,
  } = useCustomFormList(form);

  return (
    <div className="custom-form-demo-page">
      <div className="custom-form-demo-header">
        <Title level={3}>自定义表单控件 Demo</Title>
        <Text type="secondary">
          路由：/custom-form · 上方查询表单 · 下方数据表格
        </Text>
      </div>

      <SearchForm
        form={form}
        loading={loading}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <DataTable
        loading={loading}
        dataSource={tableData}
        columns={columns}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default CustomFormDemo;
