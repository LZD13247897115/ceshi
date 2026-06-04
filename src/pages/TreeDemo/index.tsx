import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { TreeDataNode } from 'antd';
import { Button, Card, Input, message, Radio, Space, Tree } from 'antd';
import React, { useMemo, useState } from 'react';

const { Search } = Input;

// 配置：每个节点的子节点数量
const x = 3; // 每个节点的子节点数
const y = 2; // 前几个节点有子节点
const z = 3; // 树的层级深度（0表示只有根节点，1表示2层，以此类推）

const defaultData: TreeDataNode[] = [];

// 生成树形数据
const generateData = (
  _level: number,
  _preKey?: React.Key,
  _tns?: TreeDataNode[],
) => {
  const preKey = _preKey || '0';
  const tns = _tns || defaultData;
  const children: React.Key[] = [];

  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }

  if (_level < 0) {
    return tns;
  }

  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    generateData(level, key, tns[index].children);
  });
};

generateData(z);

// 生成扁平化的数据列表，用于搜索
const dataList: { key: React.Key; title: string }[] = [];
const generateList = (data: TreeDataNode[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: key as string });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(defaultData);

// 获取父节点的 key
const getParentKey = (key: React.Key, tree: TreeDataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const TreeDemo: React.FC = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // 展开/收起节点
  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  // 搜索框变化
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.includes(value)) {
          return getParentKey(item.key, defaultData);
        }
        return null;
      })
      .filter(
        (item, i, self): item is React.Key =>
          !!(item && self.indexOf(item) === i),
      );

    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  // 单选框变化
  const handleRadioChange = (key: React.Key, title: string) => {
    setSelectedKey(key);
    setSelectedNode({ key, title });
    console.log('选择的节点:', { key, title });
  };

  // 高亮搜索关键词并添加单选框
  const treeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);

        const titleText =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50', fontWeight: 'bold' }}>
                {searchValue}
              </span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );

        // 在标题前添加单选框
        const title = (
          <span key={item.key}>
            <Radio
              checked={selectedKey === item.key}
              onChange={() => handleRadioChange(item.key, strTitle)}
              style={{ marginRight: 8 }}
            />
            {titleText}
          </span>
        );

        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,
        };
      });

    return loop(defaultData);
  }, [searchValue, selectedKey]);

  // 确定按钮点击
  const handleConfirm = () => {
    if (selectedNode) {
      message.success(
        `选中的节点: ${selectedNode.title} (key: ${selectedNode.key})`,
      );
      console.log('确认选择:', selectedNode);
    } else {
      message.warning('请先选择一个节点');
    }
  };

  // 重置
  const handleReset = () => {
    setSelectedKey(null);
    setSelectedNode(null);
    setSearchValue('');
    setExpandedKeys([]);
    message.info('已重置');
  };

  return (
    <PageContainer>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 搜索框 */}
          <Search
            style={{ marginBottom: 8 }}
            placeholder="搜索节点"
            onChange={onChange}
            allowClear
            value={searchValue}
          />

          {/* 树形组件 */}
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              padding: 16,
              minHeight: 400,
              maxHeight: 600,
              overflow: 'auto',
            }}
          >
            <Tree
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              treeData={treeData}
              showLine={false}
              selectable={false}
              switcherIcon={(props: any) => {
                if (props.isLeaf) {
                  return null;
                }
                return props.expanded ? (
                  <CaretDownOutlined style={{ fontSize: 12 }} />
                ) : (
                  <CaretRightOutlined style={{ fontSize: 12 }} />
                );
              }}
            />
          </div>

          {/* 选中信息显示 */}
          {selectedNode && (
            <Card
              size="small"
              title="当前选中"
              style={{ background: '#f5f5f5' }}
            >
              <p>
                <strong>节点名称:</strong> {selectedNode.title}
              </p>
              <p>
                <strong>节点Key:</strong> {selectedNode.key}
              </p>
            </Card>
          )}

          {/* 操作按钮 */}
          <Space>
            <Button type="primary" onClick={handleConfirm}>
              确定
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default TreeDemo;
