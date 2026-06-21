import { mockTableData } from '../constants';
import type { FormValues, TableRecord } from '../types';

/**
 * filterTableData —— 根据表单条件过滤表格数据
 * 某条件为空则跳过该条件的过滤
 */
export function filterTableData(values: FormValues): TableRecord[] {
  return mockTableData.filter((row) => {
    const matchUsername =
      !values.username || row.username.includes(values.username.trim());

    const matchDepartment =
      !values.department || row.departmentKey === values.department.key;

    const matchRegions =
      !values.regions?.length ||
      values.regions.some((region) => row.regionKeys.includes(region.key));

    return matchUsername && matchDepartment && matchRegions;
  });
}
