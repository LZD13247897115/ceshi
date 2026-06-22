/** 树节点选中后存入 Form 的值：key 给后端，title 给展示 */
export interface TreeNodeValue {
  key: React.Key;
  title: string;
}

/** 树形选择弹窗 props（Modal 与 Input 分离） */
export interface TreePickerModalProps {
  open: boolean;
  mode: 'single' | 'multiple';
  title: string;
  treeData: import('antd').TreeDataNode[];
  singleValue?: TreeNodeValue | null;
  multiValue?: TreeNodeValue[];
  onConfirm: (value: TreeNodeValue | null | TreeNodeValue[]) => void;
  onCancel: () => void;
}

/** 单选树自定义表单控件 props（value / onChange 由 Form.Item 注入） */
export interface TreeSinglePickerProps {
  value?: TreeNodeValue | null;
  onChange?: (value: TreeNodeValue | null) => void;
  treeData: import('antd').TreeDataNode[];
  placeholder?: string;
  modalTitle?: string;
  /** 为 true 时不可点击打开弹窗（如：需先完成多选） */
  disabled?: boolean;
  /** 禁用时点击的提示文案 */
  disabledTip?: string;
}

/** 多选树自定义表单控件 props */
export interface TreeMultiPickerProps {
  value?: TreeNodeValue[];
  onChange?: (value: TreeNodeValue[]) => void;
  treeData: import('antd').TreeDataNode[];
  placeholder?: string;
  modalTitle?: string;
  /** 为 true 时不可点击打开弹窗 */
  disabled?: boolean;
  /** 禁用时点击的提示文案 */
  disabledTip?: string;
}
