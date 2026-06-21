/**
 * =============================================================================
 * useCustomFormList —— CustomFormDemo 列表页核心业务 Hook
 * =============================================================================
 *
 * 【作用】
 *   把列表页的「状态 + 方法」从 index.tsx 抽出来，页面只负责拼 UI。
 *
 * 【入参】
 *   form —— 来自 Form.useForm()，用于读取查询条件、重置表单
 *
 * 【返回值】交给 index.tsx / DataTable / SearchForm 使用：
 *   tableData      表格当前展示的数据
 *   loading        查询 loading
 *   columns        表格列配置（含操作列）
 *   rowSelection   行勾选配置
 *   handleSubmit   点「查询」
 *   handleReset    点「重置」
 *
 * 【为什么用 useCallback / useMemo？】
 *   避免每次 render 都创建新函数/新对象，减少子组件无意义重渲染
 * =============================================================================
 */
import { message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useCallback, useMemo, useState } from 'react';
import { getTableColumns } from '../columns';
import { mockTableData, QUERY_DELAY_MS } from '../constants';
import type { FormValues, TableRecord } from '../types';
import { filterTableData } from '../utils/filterTableData';

export function useCustomFormList(form: FormInstance<FormValues>) {
  /**
   * tableData —— 表格 dataSource
   * 初始为 mockTableData 全量；查询后为过滤结果；重置后恢复全量
   */
  const [tableData, setTableData] = useState<TableRecord[]>(mockTableData);

  /**
   * selectedRowKeys —— 表格左侧勾选的行 key 列表
   * 用于批量操作（本 Demo 暂未做批量按钮，但结构已预留）
   */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** loading —— 查询请求进行中，同时驱动「查询」按钮和表格 loading */
  const [loading, setLoading] = useState(false);

  /**
   * handleSubmit —— 点击「查询」按钮
   *
   * 流程：
   *   1. form.validateFields() 收集并校验表单（username / department / regions）
   *   2. setLoading(true) 显示 loading
   *   3. setTimeout 模拟接口延迟 QUERY_DELAY_MS
   *   4. filterTableData(values) 按条件过滤 mock 数据
   *   5. 更新 tableData、清空勾选、关闭 loading、提示条数
   *
   * useCallback 依赖 [form]：form 实例稳定，函数引用不会每次 render 都变
   */
  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    setLoading(true);

    setTimeout(() => {
      const filtered = filterTableData(values);
      setTableData(filtered);
      setSelectedRowKeys([]);
      setLoading(false);
      message.success(`查询完成，共 ${filtered.length} 条`);
      console.log('【CustomFormDemo】查询条件：', values);
    }, QUERY_DELAY_MS);
  }, [form]);

  /**
   * handleReset —— 点击「重置」按钮
   *
   * 流程：
   *   1. form.resetFields() 清空查询表单
   *   2. tableData 恢复 mockTableData 全量
   *   3. 清空行勾选
   */
  const handleReset = useCallback(() => {
    form.resetFields();
    setTableData(mockTableData);
    setSelectedRowKeys([]);
  }, [form]);

  /**
   * handleView —— 操作列「查看」
   * 实际项目常见：history.push(`/xxx/detail/${record.key}`) 跳详情页
   */
  const handleView = useCallback((record: TableRecord) => {
    message.info(`查看 ${record.username}`);
  }, []);

  /**
   * handleEdit —— 操作列「编辑」
   * 实际项目常见：打开 Modal / Drawer，form.setFieldsValue(record) 回填
   */
  const handleEdit = useCallback((record: TableRecord) => {
    message.info(`编辑 ${record.username}`);
  }, []);

  /**
   * handleDelete —— 操作列「删除」确认后执行
   * 本 Demo 从 tableData 本地过滤掉该行；真实项目应调 DELETE 接口后刷新列表
   */
  const handleDelete = useCallback((record: TableRecord) => {
    setTableData((prev) => prev.filter((item) => item.key !== record.key));
    message.success(`已删除 ${record.username}`);
  }, []);

  /**
   * columns —— 表格列定义
   *
   * 通过 getTableColumns 传入三个操作回调，操作列按钮点击时调用
   * useMemo 依赖三个 handler：handler 不变时 columns 引用不变，Table 少重渲染
   */
  const columns = useMemo(
    () =>
      getTableColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleView, handleEdit, handleDelete],
  );

  /**
   * rowSelection —— 传给 Table 的 rowSelection 属性
   *
   * selectedRowKeys：当前勾选的 key
   * onChange：勾选变化时更新 selectedRowKeys
   */
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: setSelectedRowKeys,
    }),
    [selectedRowKeys],
  );

  /** 统一导出给页面组件使用 */
  return {
    tableData,
    loading,
    columns,
    rowSelection,
    handleSubmit,
    handleReset,
  };
}
