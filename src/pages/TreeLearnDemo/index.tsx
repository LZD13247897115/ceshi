/**
 * =============================================================================
 * 【页面说明】TreeLearnDemo —— antd Tree 组件入门学习 Demo
 * =============================================================================
 *
 * 【路由】.umirc.ts → path: '/tree-learn' → component: './TreeLearnDemo'
 * 【访问】http://localhost:8000/tree-learn
 *
 * 【本页目标】
 *   从零学会 Tree 的 treeData 结构，以及展开、选中、勾选等常用 API
 *
 * 【和 /tree 的区别】
 *   /tree（TreeDemo）     业务场景：弹窗选树回填表单
 *   /tree-learn（本页）   基础教学：逐个 API 演示 + 实时看 state 变化
 * =============================================================================
 */
import { Card, Col, Row, Space, Switch, Tree, Typography } from 'antd';
import React, { useState } from 'react';
import { basicTreeData, defaultExpandedKeys, TREE_API_TIPS } from './constants';
import './index.less';

const { Title, Text, Paragraph } = Typography;

/** 把 key 数组格式化成可读字符串，展示在面板里 */
function formatKeys(keys: React.Key[]) {
  return keys.length ? keys.join(', ') : '（空）';
}

const TreeLearnDemo: React.FC = () => {
  // ---------------------------------------------------------------------------
  // Demo 2：受控展开 expandedKeys + onExpand
  // ---------------------------------------------------------------------------
  const [expandedKeys, setExpandedKeys] =
    useState<React.Key[]>(defaultExpandedKeys);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // ---------------------------------------------------------------------------
  // Demo 3：选中 selectedKeys + onSelect
  // ---------------------------------------------------------------------------
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // ---------------------------------------------------------------------------
  // Demo 4：勾选 checkedKeys + onCheck
  // ---------------------------------------------------------------------------
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [checkStrictly, setCheckStrictly] = useState(false);

  // ---------------------------------------------------------------------------
  // Demo 5：样式开关
  // ---------------------------------------------------------------------------
  const [showLine, setShowLine] = useState(true);
  const [blockNode, setBlockNode] = useState(true);

  /** onExpand —— 用户点击展开/收起图标时触发，参数为当前所有展开的 key */
  const handleExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys);
    setAutoExpandParent(false);
  };

  /** onSelect —— 用户点击节点文字选中时触发（需 selectable，默认 true） */
  const handleSelect = (keys: React.Key[]) => {
    setSelectedKeys(keys);
  };

  /**
   * onCheck —— 勾选 Checkbox 时触发（需 checkable）
   * checkStrictly=false 时返回 key 数组
   * checkStrictly=true 时返回 { checked, halfChecked }
   */
  const handleCheck = (
    checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
  ) => {
    if (Array.isArray(checked)) {
      setCheckedKeys(checked);
    } else {
      setCheckedKeys(checked.checked);
    }
  };

  return (
    <div className="tree-learn-demo-page">
      <Title level={3}>antd Tree 组件入门</Title>
      <Text type="secondary">
        路由：/tree-learn · 下方每个 Card 对应一组 API
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Demo 1：最基础用法 */}
        <Col xs={24} lg={12}>
          <Card title="① 最基础：只传 treeData" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              只传 <Text code>treeData</Text>，默认全部收起，点击箭头展开。
            </Paragraph>
            <div className="tree-learn-demo-tree-box">
              <Tree treeData={basicTreeData} />
            </div>
          </Card>
        </Col>

        {/* Demo 1b：defaultExpandAll */}
        <Col xs={24} lg={12}>
          <Card title="② 默认全展开：defaultExpandAll" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              <Text code>defaultExpandAll</Text> 仅<strong>首次渲染</strong>
              生效，之后用户手动收起不会再被强制展开。
            </Paragraph>
            <div className="tree-learn-demo-tree-box">
              <Tree treeData={basicTreeData} defaultExpandAll />
            </div>
          </Card>
        </Col>

        {/* Demo 1c：defaultExpandedKeys */}
        <Col xs={24} lg={12}>
          <Card title="③ 默认展开指定节点：defaultExpandedKeys" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              只展开指定的 key：
              <Text code>{formatKeys(defaultExpandedKeys)}</Text>
            </Paragraph>
            <div className="tree-learn-demo-tree-box">
              <Tree
                treeData={basicTreeData}
                defaultExpandedKeys={defaultExpandedKeys}
              />
            </div>
          </Card>
        </Col>

        {/* Demo 2：受控展开 */}
        <Col xs={24} lg={12}>
          <Card title="④ 受控展开：expandedKeys + onExpand" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              用 state 自己管展开，适合搜索后自动展开匹配节点等场景。
            </Paragraph>
            <Space style={{ marginBottom: 8 }}>
              <Text>autoExpandParent：</Text>
              <Switch
                checked={autoExpandParent}
                onChange={setAutoExpandParent}
              />
            </Space>
            <div className="tree-learn-demo-tree-box">
              <Tree
                treeData={basicTreeData}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onExpand={handleExpand}
              />
            </div>
            <div className="tree-learn-demo-panel">
              expandedKeys：{formatKeys(expandedKeys)}
            </div>
          </Card>
        </Col>

        {/* Demo 3：选中 */}
        <Col xs={24} lg={12}>
          <Card title="⑤ 点击选中：selectedKeys + onSelect" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              <Text code>selectable</Text> 默认 true。点击节点会高亮，类似单选。
            </Paragraph>
            <div className="tree-learn-demo-tree-box">
              <Tree
                treeData={basicTreeData}
                defaultExpandAll
                selectedKeys={selectedKeys}
                onSelect={handleSelect}
              />
            </div>
            <div className="tree-learn-demo-panel">
              selectedKeys：{formatKeys(selectedKeys)}
            </div>
          </Card>
        </Col>

        {/* Demo 4：勾选 */}
        <Col xs={24} lg={12}>
          <Card title="⑥ 勾选：checkable + checkedKeys + onCheck" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              加 <Text code>checkable</Text> 后节点前出现
              Checkbox，表单多选常用。
            </Paragraph>
            <Space style={{ marginBottom: 8 }}>
              <Text>checkStrictly（父子不联动）：</Text>
              <Switch checked={checkStrictly} onChange={setCheckStrictly} />
            </Space>
            <div className="tree-learn-demo-tree-box">
              <Tree
                checkable
                checkStrictly={checkStrictly}
                treeData={basicTreeData}
                defaultExpandAll
                checkedKeys={checkedKeys}
                onCheck={handleCheck}
              />
            </div>
            <div className="tree-learn-demo-panel">
              checkedKeys：{formatKeys(checkedKeys)}
            </div>
          </Card>
        </Col>

        {/* Demo 5：综合 playground */}
        <Col span={24}>
          <Card title="⑦ 综合练习：展开 + 选中 + 勾选 + 样式" size="small">
            <Space wrap style={{ marginBottom: 12 }}>
              <Space>
                <Text>showLine：</Text>
                <Switch checked={showLine} onChange={setShowLine} />
              </Space>
              <Space>
                <Text>blockNode：</Text>
                <Switch checked={blockNode} onChange={setBlockNode} />
              </Space>
            </Space>
            <div className="tree-learn-demo-tree-box">
              <Tree
                showLine={showLine}
                blockNode={blockNode}
                checkable
                treeData={basicTreeData}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                autoExpandParent={autoExpandParent}
                onExpand={handleExpand}
                onSelect={handleSelect}
                onCheck={handleCheck}
              />
            </div>
            <div className="tree-learn-demo-panel">
              expandedKeys：{formatKeys(expandedKeys)}
              <br />
              selectedKeys：{formatKeys(selectedKeys)}
              <br />
              checkedKeys：{formatKeys(checkedKeys)}
            </div>
          </Card>
        </Col>

        {/* API 速查 */}
        <Col span={24}>
          <Card title="API 速查表" size="small">
            <ul className="tree-learn-demo-tip-list">
              {TREE_API_TIPS.map((item) => (
                <li key={item.title}>
                  <Text code>{item.title}</Text> — {item.desc}
                </li>
              ))}
            </ul>
            <Paragraph
              type="secondary"
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              官方文档：
              <a
                href="https://ant.design/components/tree-cn"
                target="_blank"
                rel="noreferrer"
              >
                antd Tree 组件
              </a>
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TreeLearnDemo;
