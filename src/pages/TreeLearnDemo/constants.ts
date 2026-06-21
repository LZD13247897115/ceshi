import type { TreeDataNode } from 'antd';

/**
 * treeData —— Tree 组件的数据源
 *
 * 每个节点最少需要：
 *   title  显示文字（可以是 string 或 ReactNode）
 *   key    唯一标识（必填，展开/选中/勾选都靠它）
 *
 * 可选字段：
 *   children   子节点数组
 *   disabled   是否禁用
 *   selectable 该节点是否可选中（默认 true）
 *   isLeaf     是否是叶子节点（异步加载时常用）
 */
export const basicTreeData: TreeDataNode[] = [
  {
    title: '研发部',
    key: 'dept-dev',
    children: [
      { title: '前端组', key: 'dept-dev-fe' },
      { title: '后端组', key: 'dept-dev-be' },
      {
        title: '测试组',
        key: 'dept-dev-qa',
        children: [
          { title: '自动化测试', key: 'dept-dev-qa-auto' },
          { title: '手工测试', key: 'dept-dev-qa-manual' },
        ],
      },
    ],
  },
  {
    title: '市场部',
    key: 'dept-market',
    children: [
      { title: '华东区', key: 'dept-market-east' },
      { title: '华南区', key: 'dept-market-south' },
    ],
  },
  {
    title: '人事部（禁用示例）',
    key: 'dept-hr',
    disabled: true,
    children: [{ title: '招聘组', key: 'dept-hr-recruit' }],
  },
];

/** 默认展开的 key（配合 defaultExpandedKeys 或 expandedKeys 初始值） */
export const defaultExpandedKeys: React.Key[] = ['dept-dev', 'dept-dev-qa'];

/** API 说明卡片内容 */
export const TREE_API_TIPS = [
  {
    title: 'treeData',
    desc: '树的数据，节点需有 title + key，子节点放 children 里',
  },
  {
    title: 'defaultExpandAll',
    desc: 'boolean，默认展开所有节点（仅首次渲染生效，非受控）',
  },
  {
    title: 'defaultExpandedKeys',
    desc: '默认展开的 key 数组（仅首次渲染生效，非受控）',
  },
  {
    title: 'expandedKeys + onExpand',
    desc: '受控展开：自己用 state 存 expandedKeys，onExpand 里更新',
  },
  {
    title: 'autoExpandParent',
    desc: '展开子节点时是否自动展开父节点，搜索场景常设为 true',
  },
  {
    title: 'selectable + selectedKeys + onSelect',
    desc: '点击节点高亮选中（单选/多选由 multiple 控制）',
  },
  {
    title: 'checkable + checkedKeys + onCheck',
    desc: '节点前显示 Checkbox，用于多选勾选',
  },
  {
    title: 'checkStrictly',
    desc: 'true 时父子勾选不联动；false（默认）时勾选父节点会勾上所有子节点',
  },
  {
    title: 'showLine',
    desc: '是否显示连接线',
  },
  {
    title: 'blockNode',
    desc: '节点占据整行，点击区域更大',
  },
];
