/**
 * TreeMultiPicker —— 多选树自定义表单控件
 * 点击只读 Input → Modal + Tree(checkable) → 确定后 onChange 回填 Form
 */
import { Input, Modal, Tree } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import type { TreeMultiPickerProps } from './types';
import { flattenTree, keysToNodes } from './utils';

const TreeMultiPicker: React.FC<TreeMultiPickerProps> = ({
  value = [],
  onChange,
  treeData,
  placeholder = '请点击选择（多选）',
  modalTitle = '请选择（多选）',
}) => {
  const [open, setOpen] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const flatList = useMemo(() => flattenTree(treeData), [treeData]);

  useEffect(() => {
    if (open) {
      setCheckedKeys(value.map((item) => item.key));
      setExpandedKeys(value.map((item) => item.key));
    }
  }, [open, value]);

  const displayText = value.map((item) => item.title).join('、');

  const handleTreeCheck = (
    checkedKeysValue:
      | React.Key[]
      | { checked: React.Key[]; halfChecked: React.Key[] },
  ) => {
    setCheckedKeys(
      Array.isArray(checkedKeysValue)
        ? checkedKeysValue
        : checkedKeysValue.checked,
    );
  };

  return (
    <>
      <Input
        readOnly
        className="tree-form-picker-input"
        placeholder={placeholder}
        value={displayText}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.preventDefault()}
      />
      <Modal
        title={modalTitle}
        open={open}
        width={480}
        destroyOnHidden
        okText="确定"
        cancelText="取消"
        onCancel={() => setOpen(false)}
        onOk={() => {
          onChange?.(keysToNodes(checkedKeys, flatList));
          setOpen(false);
        }}
      >
        <div className="tree-form-picker-modal-tree">
          <Tree
            checkable
            treeData={treeData}
            checkedKeys={checkedKeys}
            expandedKeys={expandedKeys}
            onCheck={handleTreeCheck}
            onExpand={setExpandedKeys}
          />
        </div>
      </Modal>
    </>
  );
};

export default TreeMultiPicker;
