import { TreeMultiPicker, TreeSinglePicker } from '@/components/TreeFormPicker';
import { Button, Card, Form, Input, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React from 'react';
import { demoTreeData } from '../constants';
import type { FormValues } from '../types';

interface SearchFormProps {
  form: FormInstance<FormValues>;
  loading: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

/**
 * SearchForm —— 上方查询表单
 * 包含：普通 Input + 单选树 + 多选树 + 查询/重置按钮
 */
const SearchForm: React.FC<SearchFormProps> = ({
  form,
  loading,
  onSubmit,
  onReset,
}) => {
  return (
    <Card title="查询条件" size="small">
      <Form form={form} layout="inline" initialValues={{ regions: [] }}>
        <Form.Item label="用户名" name="username">
          <Input placeholder="请输入用户名" allowClear style={{ width: 160 }} />
        </Form.Item>

        <Form.Item label="部门（单选树）" name="department">
          <TreeSinglePicker
            treeData={demoTreeData}
            placeholder="点击选择部门"
            modalTitle="选择部门（单选）"
          />
        </Form.Item>

        <Form.Item label="区域（多选树）" name="regions">
          <TreeMultiPicker
            treeData={demoTreeData}
            placeholder="点击多选区域"
            modalTitle="选择区域（多选）"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              查询
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SearchForm;
