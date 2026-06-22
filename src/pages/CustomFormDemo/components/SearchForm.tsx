import { TreeMultiPicker, TreeSinglePicker } from '@/components/TreeFormPicker';
import { Button, Card, Form, Input, Space, Typography } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React, { useEffect } from 'react';
import { demoTreeData } from '../constants';
import type { FormValues } from '../types';

const { Text } = Typography;

interface SearchFormProps {
  form: FormInstance<FormValues>;
  loading: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

/**
 * 联动：区域（多选）选了并确定 → 部门（单选）才可点击
 * 默认部门单选 disabled，regions.length > 0 才解锁
 */
const SearchForm: React.FC<SearchFormProps> = ({
  form,
  loading,
  onSubmit,
  onReset,
}) => {
  const regions = Form.useWatch('regions', form) ?? [];
  const regionSelected = regions.length > 0;

  useEffect(() => {
    if (!regionSelected) {
      form.setFieldValue('department', null);
    }
  }, [regionSelected, form]);

  return (
    <Card title="查询条件" size="small">
      <Form
        form={form}
        layout="inline"
        initialValues={{ regions: [], department: null }}
      >
        <Form.Item label="用户名" name="username">
          <Input placeholder="请输入用户名" allowClear style={{ width: 160 }} />
        </Form.Item>

        {/* 先选多选 */}
        <Form.Item label="区域（多选树）" name="regions">
          <TreeMultiPicker
            treeData={demoTreeData}
            placeholder="点击多选区域"
            modalTitle="选择区域（多选）"
          />
        </Form.Item>

        {/* 默认禁用，多选有值才解锁 */}
        <Form.Item label="部门（单选树）" name="department">
          <TreeSinglePicker
            treeData={demoTreeData}
            disabled={!regionSelected}
            disabledTip="请先选择区域（多选），点确定后再选部门"
            placeholder={regionSelected ? '点击选择部门' : '请先选择区域'}
            modalTitle="选择部门（单选）"
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

      <Text type="secondary" style={{ fontSize: 12 }}>
        {regionSelected
          ? `✓ 区域已选 ${regions.length} 项，部门单选已解锁`
          : '✗ 请先完成「区域（多选树）」并点确定，才能选部门'}
      </Text>
    </Card>
  );
};

export default SearchForm;
