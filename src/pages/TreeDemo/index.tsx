/**
 * =============================================================================
 * 【页面说明】TreeDemo —— 树形选择 Demo
 * =============================================================================
 *
 * 访问地址：http://localhost:8000/tree
 *
 * 功能清单：
 *   1. 两个「像 Input 但不能输入」的选择框，点击弹出 Modal
 *   2. Modal A：可搜索树 + 单选 Radio，点文字即可选中
 *   3. Modal B：可搜索树 + 多选 Checkbox，点文字即可勾选
 *   4. 选好后回填 Input；再次打开 Modal 恢复上次选中
 *   5. 「查询」在页面展示选中值，「重置」清空
 *
 * 纯 antd，不用 pro-components
 * =============================================================================
 */

import type { TreeDataNode } from 'antd';
import {
  Button,
  Card,
  Input,
  Modal,
  Radio,
  Space,
  Tree,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

// =============================================================================
// 第一部分：构造树形数据（模拟 antd 文档里的 0-0、0-1-0 这种结构）
// =============================================================================

/** CHILD_COUNT：每个节点下有几个子节点 */
const CHILD_COUNT = 3;

/** CHILD_WITH_SUB：前几个子节点还会继续有下级（形成多层树） */
const CHILD_WITH_SUB = 2;

/** TREE_DEPTH：树有几层（越大节点越多） */
const TREE_DEPTH = 3;

/** treeSource：整棵树的根数据，Tree 组件直接用它 */
const treeSource: TreeDataNode[] = [];

/**
 * buildTree —— 递归生成树节点
 * @param level 还剩几层要生成
 * @param parentKey 父节点 key，如 '0'、'0-1'
 * @param nodes 当前要往哪个数组里 push 节点
 */
const buildTree = (
  level: number,
  parentKey = '0',
  nodes: TreeDataNode[] = treeSource,
) => {
  const childKeys: React.Key[] = [];
  for (let i = 0; i < CHILD_COUNT; i += 1) {
    const key = `${parentKey}-${i}`;
    nodes.push({ title: key, key });
    if (i < CHILD_WITH_SUB) childKeys.push(key);
  }
  if (level <= 0) return;
  childKeys.forEach((key, index) => {
    nodes[index].children = [];
    buildTree(level - 1, key as string, nodes[index].children);
  });
};

buildTree(TREE_DEPTH);

/** flatNodeList：把所有节点拍平成一维数组，搜索时用来找「父节点」 */
const flatNodeList: { key: React.Key; title: string }[] = [];

/**
 * flattenTree —— 递归拍平树
 * @param nodes 当前层节点数组
 */
const flattenTree = (nodes: TreeDataNode[]) => {
  nodes.forEach((node) => {
    flatNodeList.push({ key: node.key, title: String(node.title) });
    if (node.children) flattenTree(node.children);
  });
};
flattenTree(treeSource);

/**
 * findParentKey —— 根据子节点 key 找到它的父节点 key
 * 搜索时要展开父节点，用户才能看到匹配到的子节点
 *
 * @param key 子节点 key
 * @param nodes 从哪棵子树开始找
 * @returns 父节点 key，找不到返回 null
 */
const findParentKey = (
  key: React.Key,
  nodes: TreeDataNode[],
): React.Key | null => {
  for (const node of nodes) {
    if (node.children?.some((child) => child.key === key)) return node.key;
    if (node.children) {
      const found = findParentKey(key, node.children);
      if (found) return found;
    }
  }
  return null;
};

/** TreeNodeValue —— 树节点选中后的数据结构（key + 显示文字） */
interface TreeNodeValue {
  key: React.Key;
  title: string;
}

/**
 * findTreeNode —— 在树数据里根据 key 找到对应节点
 */
function findTreeNode(
  nodes: TreeDataNode[],
  key: React.Key,
): TreeDataNode | null {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findTreeNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

/**
 * collectNodeAndDescendantKeys —— 收集某节点 + 所有子孙节点的 key
 * 勾选父节点时要全选子节点，就靠这个函数
 */
function collectNodeAndDescendantKeys(node: TreeDataNode): React.Key[] {
  const keys: React.Key[] = [node.key];
  node.children?.forEach((child) => {
    keys.push(...collectNodeAndDescendantKeys(child));
  });
  return keys;
}

/**
 * toggleCheckedWithCascade —— 点击节点文字时，带父子联动的勾选/取消
 * @param key 被点的节点 key
 * @param currentKeys 当前已勾选的 key 列表
 */
function toggleCheckedWithCascade(
  key: React.Key,
  currentKeys: React.Key[],
): React.Key[] {
  const node = findTreeNode(treeSource, key);
  if (!node) return currentKeys;
  const relatedKeys = collectNodeAndDescendantKeys(node);
  const allChecked = relatedKeys.every((k) => currentKeys.includes(k));
  if (allChecked) {
    return currentKeys.filter((k) => !relatedKeys.includes(k));
  }
  return [...new Set([...currentKeys, ...relatedKeys])];
}

/** keysToNodes —— 把 key 数组转成带 title 的对象数组（回填 Input / 查询用） */
function keysToNodes(keys: React.Key[]): TreeNodeValue[] {
  return keys.map((key) => {
    const item = flatNodeList.find((f) => f.key === key);
    return { key, title: item?.title ?? String(key) };
  });
}

// =============================================================================
// 第二部分：只读 Input（点击弹窗，不能键盘输入）
// =============================================================================

/** PickerInputProps —— 只读选择框的参数 */
interface PickerInputProps {
  placeholder: string;
  value: string;
  onOpen: () => void;
}

/**
 * PickerInput —— 看起来像 Input，但 readOnly，点击触发 onOpen 打开弹窗
 */
const PickerInput: React.FC<PickerInputProps> = ({
  placeholder,
  value,
  onOpen,
}) => (
  <Input
    readOnly
    placeholder={placeholder}
    value={value}
    className="tree-demo-picker-input"
    onClick={onOpen}
    onKeyDown={(e) => e.preventDefault()}
  />
);

// =============================================================================
// 第三部分：单选树弹窗（Radio）
// =============================================================================

/** SingleTreeModalProps —— 单选弹窗的参数 */
interface SingleTreeModalProps {
  open: boolean;
  value: TreeNodeValue | null;
  onCancel: () => void;
  onConfirm: (node: TreeNodeValue | null) => void;
}

const SingleTreeModal: React.FC<SingleTreeModalProps> = ({
  open,
  value,
  onCancel,
  onConfirm,
}) => {
  /** searchValue：搜索框输入的关键词 */
  const [searchValue, setSearchValue] = useState('');

  /** expandedKeys：当前展开的节点 key 列表 */
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  /** autoExpandParent：搜索时是否自动展开父节点 */
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  /** tempSelected：弹窗内临时选中（点「确定」才回填到页面 Input） */
  const [tempSelected, setTempSelected] = useState<TreeNodeValue | null>(null);

  /** 弹窗打开时，用页面已选的 value 恢复树的选中状态 */
  useEffect(() => {
    if (open) {
      setTempSelected(value);
      setSearchValue('');
      setExpandedKeys(value ? [value.key] : []);
      setAutoExpandParent(true);
    }
  }, [open, value]);

  /**
   * onSearch —— 搜索框内容变化
   * 匹配到的节点会自动展开其父节点
   */
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    const keys = flatNodeList
      .filter((item) => item.title.includes(keyword))
      .map((item) => findParentKey(item.key, treeSource))
      .filter((k, i, arr): k is React.Key => !!k && arr.indexOf(k) === i);

    setExpandedKeys(keys);
    setSearchValue(keyword);
    setAutoExpandParent(true);
  };

  /**
   * selectNode —— 选中某个节点（单选）
   * @param key 节点 key
   * @param title 节点显示文字
   */
  const selectNode = (key: React.Key, title: string) => {
    setTempSelected({ key, title });
  };

  /**
   * treeData —— 传给 Tree 组件的数据（带 Radio 和高亮）
   * useMemo：只有 searchValue 或 tempSelected 变时才重新计算，提高性能
   */
  const treeData = useMemo(() => {
    const loop = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => {
        const titleStr = String(node.title);
        const idx = titleStr.indexOf(searchValue);
        const label =
          idx > -1 ? (
            <span>
              {titleStr.slice(0, idx)}
              <span className="tree-demo-search-hit">{searchValue}</span>
              {titleStr.slice(idx + searchValue.length)}
            </span>
          ) : (
            titleStr
          );

        const title = (
          <span
            className="tree-demo-node-row"
            onClick={() => selectNode(node.key, titleStr)}
          >
            <Radio
              checked={tempSelected?.key === node.key}
              onClick={(e) => e.stopPropagation()}
              onChange={() => selectNode(node.key, titleStr)}
            />
            <span className="tree-demo-node-text">{label}</span>
          </span>
        );

        return node.children
          ? { key: node.key, title, children: loop(node.children) }
          : { key: node.key, title };
      });

    return loop(treeSource);
  }, [searchValue, tempSelected]);

  return (
    <Modal
      title="单选树（点击文字或 Radio 选中）"
      open={open}
      width={520}
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => onConfirm(tempSelected)}
      okText="确定"
      cancelText="取消"
    >
      <Search
        placeholder="Search"
        allowClear
        value={searchValue}
        onChange={onSearch}
        style={{ marginBottom: 12 }}
      />
      <div className="tree-demo-modal-tree">
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          selectable={false}
          showLine={false}
          onExpand={(keys) => {
            setExpandedKeys(keys);
            setAutoExpandParent(false);
          }}
        />
      </div>
    </Modal>
  );
};

// =============================================================================
// 第四部分：多选树弹窗（Checkbox）
// =============================================================================

interface MultiTreeModalProps {
  open: boolean;
  value: TreeNodeValue[];
  onCancel: () => void;
  onConfirm: (nodes: TreeNodeValue[]) => void;
}

const MultiTreeModal: React.FC<MultiTreeModalProps> = ({
  open,
  value,
  onCancel,
  onConfirm,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  /**
   * checkedKeys：当前勾选的节点 key 列表
   * 使用 Tree 自带的 checkable + 父子联动（checkStrictly 默认 false）
   * 勾选父节点会自动勾选所有子节点
   */
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (open) {
      setCheckedKeys(value.map((item) => item.key));
      setSearchValue('');
      setExpandedKeys(value.map((item) => item.key));
      setAutoExpandParent(true);
    }
  }, [open, value]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    const keys = flatNodeList
      .filter((item) => item.title.includes(keyword))
      .map((item) => findParentKey(item.key, treeSource))
      .filter((k, i, arr): k is React.Key => !!k && arr.indexOf(k) === i);

    setExpandedKeys(keys);
    setSearchValue(keyword);
    setAutoExpandParent(true);
  };

  /**
   * treeData —— 树数据（搜索高亮 + 点击文字也能勾选）
   * 勾选框用 Tree 自带的 checkable，不再自己画 Checkbox
   */
  const treeData = useMemo(() => {
    const loop = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => {
        const titleStr = String(node.title);
        const idx = titleStr.indexOf(searchValue);
        const label =
          idx > -1 ? (
            <span>
              {titleStr.slice(0, idx)}
              <span className="tree-demo-search-hit">{searchValue}</span>
              {titleStr.slice(idx + searchValue.length)}
            </span>
          ) : (
            titleStr
          );

        const title = (
          <span
            className="tree-demo-node-text"
            onClick={() =>
              setCheckedKeys((prev) => toggleCheckedWithCascade(node.key, prev))
            }
          >
            {label}
          </span>
        );

        return node.children
          ? { key: node.key, title, children: loop(node.children) }
          : { key: node.key, title };
      });

    return loop(treeSource);
  }, [searchValue]);

  return (
    <Modal
      title="多选树（点击文字或 Checkbox 勾选）"
      open={open}
      width={520}
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => onConfirm(keysToNodes(checkedKeys))}
      okText="确定"
      cancelText="取消"
    >
      <Search
        placeholder="Search"
        allowClear
        value={searchValue}
        onChange={onSearch}
        style={{ marginBottom: 12 }}
      />
      <div className="tree-demo-modal-tree">
        <Tree
          checkable
          treeData={treeData}
          checkedKeys={checkedKeys}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          selectable={false}
          showLine={false}
          onCheck={(checkedKeysValue) => {
            const keys = Array.isArray(checkedKeysValue)
              ? checkedKeysValue
              : checkedKeysValue.checked;
            setCheckedKeys(keys);
          }}
          onExpand={(keys) => {
            setExpandedKeys(keys);
            setAutoExpandParent(false);
          }}
        />
      </div>
    </Modal>
  );
};

// =============================================================================
// 第五部分：页面入口 TreeDemo
// =============================================================================

/** QueryResult —— 点击「查询」后展示在页面上的数据结构 */
interface QueryResult {
  single: TreeNodeValue | null;
  multi: TreeNodeValue[];
}

const TreeDemo: React.FC = () => {
  /** singleValue：单选已确认的值（回填到单选 Input） */
  const [singleValue, setSingleValue] = useState<TreeNodeValue | null>(null);

  /** multiValue：多选已确认的值数组（回填到多选 Input） */
  const [multiValue, setMultiValue] = useState<TreeNodeValue[]>([]);

  /** singleModalOpen：单选弹窗是否打开 */
  const [singleModalOpen, setSingleModalOpen] = useState(false);

  /** multiModalOpen：多选弹窗是否打开 */
  const [multiModalOpen, setMultiModalOpen] = useState(false);

  /** queryResult：查询结果，null 表示还没点过查询 */
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  /** singleInputText：显示在单选 Input 里的文字 */
  const singleInputText = singleValue ? singleValue.title : '';

  /** multiInputText：显示在多选 Input 里的文字（多个用顿号连接） */
  const multiInputText = multiValue.length
    ? multiValue.map((item) => item.title).join('、')
    : '';

  /** handleQuery —— 点击「查询」：把当前选中值展示到页面 */
  const handleQuery = () => {
    setQueryResult({
      single: singleValue,
      multi: multiValue,
    });
  };

  /** handleReset —— 点击「重置」：清空所有状态和查询结果 */
  const handleReset = () => {
    setSingleValue(null);
    setMultiValue([]);
    setQueryResult(null);
    setSingleModalOpen(false);
    setMultiModalOpen(false);
  };

  return (
    <div className="tree-demo-page">
      <div className="tree-demo-page-header">
        <Title level={3} style={{ marginBottom: 4 }}>
          树形选择 Demo
        </Title>
        <Text type="secondary">
          点击 Input 弹窗选树 · 单选 / 多选 · 查询与重置
        </Text>
      </div>

      <Card title="选择项" size="small">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>单选（Radio 树）：</Text>
            <PickerInput
              placeholder="请点击选择（单选）"
              value={singleInputText}
              onOpen={() => setSingleModalOpen(true)}
            />
          </div>

          <div>
            <Text strong>多选（Checkbox 树）：</Text>
            <PickerInput
              placeholder="请点击选择（多选）"
              value={multiInputText}
              onOpen={() => setMultiModalOpen(true)}
            />
          </div>

          <Space>
            <Button type="primary" onClick={handleQuery}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Space>
      </Card>

      {queryResult && (
        <Card title="查询结果" size="small" style={{ marginTop: 16 }}>
          <Paragraph>
            <Text strong>单选值：</Text>
            {queryResult.single ? (
              <>
                title = <Text code>{queryResult.single.title}</Text>，key ={' '}
                <Text code>{String(queryResult.single.key)}</Text>
              </>
            ) : (
              <Text type="secondary">未选择</Text>
            )}
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            <Text strong>多选值：</Text>
            {queryResult.multi.length ? (
              <ul className="tree-demo-result-list">
                {queryResult.multi.map((item) => (
                  <li key={String(item.key)}>
                    title = <Text code>{item.title}</Text>，key ={' '}
                    <Text code>{String(item.key)}</Text>
                  </li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">未选择</Text>
            )}
          </Paragraph>
        </Card>
      )}

      <SingleTreeModal
        open={singleModalOpen}
        value={singleValue}
        onCancel={() => setSingleModalOpen(false)}
        onConfirm={(node) => {
          setSingleValue(node);
          setSingleModalOpen(false);
        }}
      />

      <MultiTreeModal
        open={multiModalOpen}
        value={multiValue}
        onCancel={() => setMultiModalOpen(false)}
        onConfirm={(nodes) => {
          setMultiValue(nodes);
          setMultiModalOpen(false);
        }}
      />
    </div>
  );
};

export default TreeDemo;
