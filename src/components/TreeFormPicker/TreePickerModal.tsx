/**
 * TreePickerModal —— 树形选择弹窗（与表单 Input 分离）
 *
 * 只负责：Modal + Tree 交互
 * TreeSinglePicker / TreeMultiPicker 只负责 Input 展示，点击后打开本弹窗
 */
import type { TreeDataNode } from 'antd';
import { Modal, Radio, Tree } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import type { TreeNodeValue, TreePickerModalProps } from './types';
import { flattenTree, keysToNodes } from './utils';

/** 避免 default [] 每次 render 是新引用，导致 useEffect 反复重置选中态 */
const EMPTY_NODES: TreeNodeValue[] = [];

const TreePickerModal: React.FC<TreePickerModalProps> = ({
  open,
  mode,
  title,
  treeData,
  singleValue = null,
  multiValue = EMPTY_NODES,
  onConfirm,
  onCancel,
}) => {
  const [tempSelected, setTempSelected] = useState<TreeNodeValue | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const flatList = useMemo(() => flattenTree(treeData), [treeData]);

  /** 弹窗打开时，用 Form 当前值恢复选中状态（仅 open 变化时同步，避免选中后被重置） */
  useEffect(() => {
    if (!open) return;

    if (mode === 'single') {
      setTempSelected(singleValue ?? null);
      setExpandedKeys(singleValue ? [singleValue.key] : []);
      return;
    }

    setCheckedKeys(multiValue.map((item) => item.key));
    setExpandedKeys(multiValue.map((item) => item.key));
  }, [open, mode, singleValue, multiValue]);

  const treeDataWithRadio = useMemo(() => {
    if (mode !== 'single') return treeData;

    const loop = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => {
        const titleStr = String(node.title);
        const handleSelectNode = () => {
          setTempSelected({ key: node.key, title: titleStr });
        };

        const nodeTitle = (
          <span
            className="tree-form-picker-node-row"
            onClick={handleSelectNode}
          >
            <Radio
              checked={tempSelected?.key === node.key}
              onClick={(e) => e.stopPropagation()}
              onChange={handleSelectNode}
            />
            <span style={{ marginLeft: 8 }}>{titleStr}</span>
          </span>
        );

        return node.children
          ? { key: node.key, title: nodeTitle, children: loop(node.children) }
          : { key: node.key, title: nodeTitle };
      });

    return loop(treeData);
  }, [mode, treeData, tempSelected]);

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

  const handleOk = () => {
    if (mode === 'single') {
      onConfirm(tempSelected);
      return;
    }
    onConfirm(keysToNodes(checkedKeys, flatList));
  };

  return (
    <Modal
      title={title}
      open={open}
      width={480}
      destroyOnHidden
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <div className="tree-form-picker-modal-tree">
        {mode === 'single' ? (
          <Tree
            treeData={treeDataWithRadio}
            expandedKeys={expandedKeys}
            selectable={false}
            onExpand={setExpandedKeys}
          />
        ) : (
          <Tree
            checkable
            treeData={treeData}
            checkedKeys={checkedKeys}
            expandedKeys={expandedKeys}
            onCheck={handleTreeCheck}
            onExpand={setExpandedKeys}
          />
        )}
      </div>
    </Modal>
  );
};

export default TreePickerModal;
