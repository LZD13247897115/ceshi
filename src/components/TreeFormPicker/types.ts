/** 树节点选中后存入 Form 的值：key 给后端，title 给展示 */
export interface TreeNodeValue {
  key: React.Key;
  title: string;
}

/** 单选树自定义表单控件 props（value / onChange 由 Form.Item 注入） */
export interface TreeSinglePickerProps {
  value?: TreeNodeValue | null;
  onChange?: (value: TreeNodeValue | null) => void;
  treeData: import('antd').TreeDataNode[];
  placeholder?: string;
  modalTitle?: string;
}

/** 多选树自定义表单控件 props */
export interface TreeMultiPickerProps {
  value?: TreeNodeValue[];
  onChange?: (value: TreeNodeValue[]) => void;
  treeData: import('antd').TreeDataNode[];
  placeholder?: string;
  modalTitle?: string;
}
