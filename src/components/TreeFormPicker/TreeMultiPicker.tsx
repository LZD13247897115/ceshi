/**
 * TreeMultiPicker —— 多选树表单控件（仅 Input，弹窗在 TreePickerModal）
 */
import { Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';
import TreePickerModal from './TreePickerModal';
import type { TreeMultiPickerProps, TreeNodeValue } from './types';

const EMPTY_VALUE: TreeNodeValue[] = [];

const TreeMultiPicker: React.FC<TreeMultiPickerProps> = ({
  value = EMPTY_VALUE,
  onChange,
  treeData,
  placeholder = '请点击选择（多选）',
  modalTitle = '请选择（多选）',
  disabled = false,
  disabledTip = '请先完成上一步选择',
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const handleOpenModal = () => {
    if (disabled) {
      message.warning(disabledTip);
      return;
    }
    setOpen(true);
  };

  const handleConfirm = (selected: TreeNodeValue | null | TreeNodeValue[]) => {
    onChange?.(selected as TreeNodeValue[]);
    setOpen(false);
  };

  return (
    <div
      className={
        disabled ? 'tree-form-picker-wrap is-disabled' : 'tree-form-picker-wrap'
      }
      onClick={disabled ? () => message.warning(disabledTip) : undefined}
    >
      <Input
        readOnly
        disabled={disabled}
        className="tree-form-picker-input"
        placeholder={placeholder}
        value={value.map((item) => item.title).join('、')}
        onClick={disabled ? undefined : handleOpenModal}
        onKeyDown={(e) => e.preventDefault()}
      />

      <TreePickerModal
        open={open && !disabled}
        mode="multiple"
        title={modalTitle}
        treeData={treeData}
        multiValue={value}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};

export default TreeMultiPicker;
