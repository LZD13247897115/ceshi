import type { TreeNodeValue } from '@/components/TreeFormPicker';

/** 查询表单字段类型 */
export interface FormValues {
  username: string;
  /** 区域多选（必须先选） */
  regions: TreeNodeValue[];
  /** 部门单选（regions 有值后才能选） */
  department: TreeNodeValue | null;
}
