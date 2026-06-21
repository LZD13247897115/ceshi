import type { TreeDataNode } from 'antd';
import type { TreeNodeValue } from './types';

/**
 * flattenTree —— 递归拍平树，用于 key → title 反查
 */
export function flattenTree(nodes: TreeDataNode[]): TreeNodeValue[] {
  const result: TreeNodeValue[] = [];

  const walk = (list: TreeDataNode[]) => {
    list.forEach((node) => {
      result.push({ key: node.key, title: String(node.title) });
      if (node.children) walk(node.children);
    });
  };

  walk(nodes);
  return result;
}

/**
 * keysToNodes —— 把 Tree 的 checkedKeys 转成 Form 需要的 TreeNodeValue[]
 */
export function keysToNodes(
  keys: React.Key[],
  flatList: TreeNodeValue[],
): TreeNodeValue[] {
  return keys.map((key) => {
    const found = flatList.find((item) => item.key === key);
    return { key, title: found?.title ?? String(key) };
  });
}
