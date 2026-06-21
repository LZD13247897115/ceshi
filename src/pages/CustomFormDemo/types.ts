import type { TreeNodeValue } from '@/components/TreeFormPicker';

/** 查询表单字段类型 */
export interface FormValues {
  username: string;
  department: TreeNodeValue | null;
  regions: TreeNodeValue[];
}

/** 表格行数据类型 */
export interface TableRecord {
  key: React.Key;
  username: string;
  departmentKey: React.Key;
  departmentTitle: string;
  regionKeys: React.Key[];
  regionTitles: string;
  age: number;
  address: string;
}

/** 表格操作回调，供 columns 和操作按钮使用 */
export interface TableActions {
  onView: (record: TableRecord) => void;
  onEdit: (record: TableRecord) => void;
  onDelete: (record: TableRecord) => void;
}
