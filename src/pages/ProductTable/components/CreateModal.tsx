import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import React from 'react';
import { ProductType } from '../index';

interface CreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductType) => Promise<boolean>;
}

const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  return (
    <ModalForm<ProductType>
      title="新建产品"
      open={visible}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      onFinish={async (values) => {
        const success = await onSubmit({
          ...values,
          id: Date.now().toString(),
          createTime: new Date().toLocaleString(),
        } as ProductType);
        return success;
      }}
      width={600}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProFormText
        name="name"
        label="产品名称"
        placeholder="请输入产品名称"
        rules={[{ required: true, message: '请输入产品名称' }]}
      />

      <ProFormSelect
        name="category"
        label="产品分类"
        placeholder="请选择产品分类"
        options={[
          { label: '手机', value: '手机' },
          { label: '电脑', value: '电脑' },
          { label: '耳机', value: '耳机' },
          { label: '配件', value: '配件' },
        ]}
        rules={[{ required: true, message: '请选择产品分类' }]}
      />

      <ProFormDigit
        name="price"
        label="产品价格"
        placeholder="请输入产品价格"
        min={0}
        fieldProps={{
          precision: 2,
          prefix: '¥',
        }}
        rules={[{ required: true, message: '请输入产品价格' }]}
      />

      <ProFormDigit
        name="stock"
        label="库存数量"
        placeholder="请输入库存数量"
        min={0}
        fieldProps={{
          precision: 0,
        }}
        rules={[{ required: true, message: '请输入库存数量' }]}
      />

      <ProFormSelect
        name="status"
        label="产品状态"
        placeholder="请选择产品状态"
        options={[
          { label: '在售', value: 'online' },
          { label: '下架', value: 'offline' },
          { label: '售罄', value: 'soldout' },
        ]}
        initialValue="online"
        rules={[{ required: true, message: '请选择产品状态' }]}
      />

      <ProFormTextArea
        name="description"
        label="产品描述"
        placeholder="请输入产品描述"
        fieldProps={{
          rows: 4,
          maxLength: 200,
          showCount: true,
        }}
      />
    </ModalForm>
  );
};

export default CreateModal;
