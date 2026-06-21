/**
 * =============================================================================
 * TreeSinglePicker —— 单选树自定义表单控件
 * =============================================================================
 *
 * 【用法】配合 antd Form.Item 使用，Form 会自动注入 value / onChange：
 *
 *   <Form.Item name="department" label="部门">
 *     <TreeSinglePicker treeData={treeData} placeholder="请选择部门" />
 *   </Form.Item>
 *
 * 【交互流程】
 *   点击只读 Input → 打开 Modal → Tree + Radio 选节点 → 点「确定」→ onChange 回填 Form
 *
 * 【自定义表单控件约定】
 *   - value：Form 当前值，类型 TreeNodeValue | null（{ key, title }）
 *   - onChange：选中后调用，通知 Form 更新
 *   - treeData / placeholder / modalTitle：组件自己的业务参数
 *
 * 【为什么有 tempSelected？】
 *   弹窗内先临时选中，点「确定」才写回 Form；点「取消」不影响已保存的值
 * =============================================================================
 */
import type { TreeDataNode } from 'antd';
import { Input, Modal, Radio, Tree } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import type { TreeNodeValue, TreeSinglePickerProps } from './types';

const TreeSinglePicker: React.FC<TreeSinglePickerProps> = ({
  value,
  onChange,
  treeData,
  placeholder = '请点击选择（单选）',
  modalTitle = '请选择',
}) => {
  /** open：弹窗是否可见（组件内部 UI 状态，不由 Form 管理） */
  const [open, setOpen] = useState(false);

  /**
   * tempSelected：弹窗内的「临时选中值」
   * 用户在树里点选时只更新 tempSelected，点「确定」才通过 onChange 写回 Form
   */
  const [tempSelected, setTempSelected] = useState<TreeNodeValue | null>(null);

  /** expandedKeys：控制 Tree 哪些节点处于展开状态 */
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  /**
   * 弹窗打开时，用 Form 当前的 value 恢复选中状态和展开节点
   * 这样用户再次打开弹窗，能看到上次已确认选中的项
   */
  useEffect(() => {
    if (open) {
      setTempSelected(value ?? null);
      setExpandedKeys(value ? [value.key] : []);
    }
  }, [open, value]);

  /** displayText：Input 里显示的文字，来自 Form 注入的 value.title（不是 tempSelected） */
  const displayText = value?.title ?? '';

  /**
   * treeDataWithRadio —— 把原始 treeData 转换成带 Radio 的树数据
   *
   * antd Tree 默认点击节点不会联动 Radio，这里自定义 title 为「Radio + 文字」，
   * 并实现点击整行文字也能选中。
   *
   * useMemo：只有 treeData 或 tempSelected 变化时才重新计算，避免每次 render 都递归整棵树
   */
  const treeDataWithRadio = useMemo(() => {
    /**
     * loop —— 递归遍历树，给每个节点生成带 Radio 的 title
     * @param nodes 当前层节点数组
     */
    const loop = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => {
        const titleStr = String(node.title);

        /** 选中当前节点：只更新弹窗临时值，尚未写回 Form */
        const handleSelectNode = () => {
          setTempSelected({ key: node.key, title: titleStr });
        };

        const title = (
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
          ? { key: node.key, title, children: loop(node.children) }
          : { key: node.key, title };
      });

    return loop(treeData);
  }, [treeData, tempSelected]);

  /** handleOpenModal —— 点击 Input 时打开选择弹窗 */
  const handleOpenModal = () => setOpen(true);

  /** handleCloseModal —— 点「取消」或遮罩关闭，不写回 Form */
  const handleCloseModal = () => setOpen(false);

  /**
   * handleConfirm —— 点「确定」：把 tempSelected 通过 onChange 传给 Form，并关闭弹窗
   * onChange 由 Form.Item 注入，调用后 Form 对应字段（如 department）会更新
   */
  const handleConfirm = () => {
    onChange?.(tempSelected);
    setOpen(false);
  };

  /** handleTreeExpand —— 用户手动展开/收起树节点时更新 expandedKeys */
  const handleTreeExpand = (keys: React.Key[]) => setExpandedKeys(keys);

  return (
    <>
      {/*
        【展示层】只读 Input
        - readOnly：禁止键盘输入，只能通过弹窗选择
        - onClick：点击打开弹窗
        - onKeyDown preventDefault：防止光标进入输入框
      */}
      <Input
        readOnly
        className="tree-form-picker-input"
        placeholder={placeholder}
        value={displayText}
        onClick={handleOpenModal}
        onKeyDown={(e) => e.preventDefault()}
      />

      {/*
        【选择层】Modal + Tree
        - destroyOnHidden：关闭时销毁 DOM，下次打开状态更干净
        - onOk → handleConfirm：确定回填
        - onCancel → handleCloseModal：取消不回填
      */}
      <Modal
        title={modalTitle}
        open={open}
        width={480}
        destroyOnHidden
        okText="确定"
        cancelText="取消"
        onCancel={handleCloseModal}
        onOk={handleConfirm}
      >
        <div className="tree-form-picker-modal-tree">
          <Tree
            treeData={treeDataWithRadio}
            expandedKeys={expandedKeys}
            selectable={false}
            onExpand={handleTreeExpand}
          />
        </div>
      </Modal>
    </>
  );
};

export default TreeSinglePicker;
