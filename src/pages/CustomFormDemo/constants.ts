import type { TreeDataNode } from 'antd';
import type { TableRecord } from './types';

/** 模拟组织架构树，实际项目来自 GET /api/dept/tree */
export const demoTreeData: TreeDataNode[] = [
  {
    title: '研发部',
    key: 'dev',
    children: [
      { title: '前端组', key: 'dev-fe' },
      { title: '后端组', key: 'dev-be' },
      { title: '测试组', key: 'dev-qa' },
    ],
  },
  {
    title: '市场部',
    key: 'market',
    children: [
      { title: '华东区', key: 'market-east' },
      { title: '华南区', key: 'market-south' },
    ],
  },
  {
    title: '人事部',
    key: 'hr',
  },
];

/** 模拟表格全量数据，实际项目来自 GET /api/user/list */
export const mockTableData: TableRecord[] = [
  {
    key: 1,
    username: '张三',
    departmentKey: 'dev-fe',
    departmentTitle: '前端组',
    regionKeys: ['market-east'],
    regionTitles: '华东区',
    age: 28,
    address: '上海',
  },
  {
    key: 2,
    username: '李四',
    departmentKey: 'dev-be',
    departmentTitle: '后端组',
    regionKeys: ['market-south'],
    regionTitles: '华南区',
    age: 30,
    address: '深圳',
  },
  {
    key: 3,
    username: '王五',
    departmentKey: 'dev-qa',
    departmentTitle: '测试组',
    regionKeys: ['market-east', 'market-south'],
    regionTitles: '华东区、华南区',
    age: 26,
    address: '杭州',
  },
  {
    key: 4,
    username: '赵六',
    departmentKey: 'hr',
    departmentTitle: '人事部',
    regionKeys: ['market-east'],
    regionTitles: '华东区',
    age: 32,
    address: '南京',
  },
  {
    key: 5,
    username: '小明',
    departmentKey: 'dev-fe',
    departmentTitle: '前端组',
    regionKeys: ['market-south'],
    regionTitles: '华南区',
    age: 24,
    address: '广州',
  },
];

/** 模拟查询接口延迟（毫秒） */
export const QUERY_DELAY_MS = 400;
