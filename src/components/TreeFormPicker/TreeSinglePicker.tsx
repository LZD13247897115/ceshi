/**
 * TreeSinglePicker —— 单选树表单控件（仅 Input，弹窗在 TreePickerModal）
 *
 * disabled=true 时：不能打开弹窗，点击会提示 disabledTip
 */
import { Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';
import TreePickerModal from './TreePickerModal';
import type { TreeNodeValue, TreeSinglePickerProps } from './types';

const TreeSinglePicker: React.FC<TreeSinglePickerProps> = ({
  value,
  onChange,
  treeData,
  placeholder = '请点击选择（单选）',
  modalTitle = '请选择',
  disabled = false,
  disabledTip = '请先完成上一步选择',
}) => {
  const [open, setOpen] = useState(false);

  /** 被禁用时强制关闭弹窗，防止多选清空后单选弹窗还开着 */
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
    onChange?.(selected as TreeNodeValue | null);
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
        value={value?.title ?? ''}
        onClick={disabled ? undefined : handleOpenModal}
        onKeyDown={(e) => e.preventDefault()}
      />

      <TreePickerModal
        open={open && !disabled}
        mode="single"
        title={modalTitle}
        treeData={treeData}
        singleValue={value}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};

export default TreeSinglePicker;
