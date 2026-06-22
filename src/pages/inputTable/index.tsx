// import { useEffect, useState } from "react";
// import { Input } from "antd";
// import { DashOutlined } from "@ant-design/icons";
// import type { OrgLevelBean } from "@portal-web/swagger-service-lib/contract-service";
// import { SelectOrgModal } from "./selectOrganizeModal/selectOrgModal";

// type TChannelSelectProps = {
//     value?: string[];
//     // 选择了后的回调
//     onChange: (channelValue: string[] | null) => void;
// };

// const ChannelSelect: React.FC<TChannelSelectProps> = (props) => {
//     const { onChange } = props;

//     const [selectChannelVisible, setSelectChannelVisible] = useState<boolean>(false);
//     // 渠道查询的弹窗选择的数据
//     const [treeData, setTreeData] = useState<OrgLevelBean[]>([]);
//     // 展开的数据
//     const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

//     // 下拉框的值
//     const [inputValue, setInputValue] = useState("");

//     // 渠道选择后的
//     useEffect(() => {
//         const leafNodes: OrgLevelBean[] = [];
//         const traverse = (nodes: OrgLevelBean[]) => {
//             nodes.forEach((node) => {
//                 if (!node.subOrgList || node.subOrgList.length === 0) {
//                     leafNodes.push(node);
//                 } else {
//                     traverse(node.subOrgList);
//                 }
//             });
//         };
//         if (treeData && treeData.length > 0) {
//             traverse(treeData as OrgLevelBean[]);
//         }
//         const orgIdArray = leafNodes.map((item) => item.orgId).filter((orgId) => orgId !== undefined);
//         const orgNameArray = leafNodes.map((item) => item?.orgName).filter((orgName) => orgName !== undefined);
//         setInputValue(orgNameArray.join(","));
//         setExpandedKeys(orgIdArray);
//         onChange(orgIdArray);
//     }, [treeData]);

//     return (
//         <>
//             <Input
//                 placeholder="请选择"
//                 readOnly
//                 value={inputValue}
//                 allowClear={false}
//                 onClick={() => setSelectChannelVisible(true)}
//                 suffix={<DashOutlined onClick={() => setSelectChannelVisible(true)} />}
//             />
//             {/* 渠道选择 */}
//             {selectChannelVisible && (
//                 <SelectOrgModal
//                     visible={selectChannelVisible}
//                     value={expandedKeys}
//                     onOk={(treeData) => {
//                         setSelectChannelVisible(false);
//                         setTreeData(treeData);
//                     }}
//                     onCancel={() => {
//                         setSelectChannelVisible(false);
//                     }}
//                 />
//             )}
//         </>
//     );
// };

// export default ChannelSelect;

// import React, { useCallback, useEffect, useState } from "react";
// import { useRequest } from "ahooks";
// import { Tree } from "antd";
// import type { EventDataNode } from "antd/es/tree";
// import classNames from "classnames";
// import { FolderOpenOutlined } from "@ant-design/icons";
// import { Modal, Search } from "@hw-gd/esop-central-web-ui-component-v1";
// import { useOperatorRoleHook } from "@portal-web/contract-app/pages/electronicSignOrderQuery/hooks/useOperatorRoleHook";
// import type { OrgLevelBean } from "@portal-web/swagger-service-lib/contract-service";
// import { Api } from "@portal-web/swagger-service-lib/contract-service";
// import { Empty } from "@portal-web/ui-lib";
// import { Operator } from "@portal-web/util-lib";
// import styles from "./selectOrgModal.module.less";

// // 根据选中的 key 列表，从原始树中构建新的树（保留祖先路径）
// const buildTreeByKeys = (treeData: OrgLevelBean[], selectedKeys: string[]): OrgLevelBean[] => {
//     const buildTree = (nodes: OrgLevelBean[]): OrgLevelBean[] => {
//         return nodes
//             .map((node) => {
//                 // 递归处理子节点
//                 const filteredChildren = node.subOrgList ? buildTree(node.subOrgList) : [];
//                 // 当前节点是否应该保留
//                 const isSelected = node.orgId && selectedKeys.includes(node.orgId);
//                 const hasSelectedDescendant = filteredChildren.length > 0;
//                 if (isSelected || hasSelectedDescendant) {
//                     const newNode = { ...node };
//                     // 只在有子节点时设置 subOrgList
//                     if (filteredChildren.length > 0) {
//                         newNode.subOrgList = filteredChildren;
//                     } else {
//                         // 如果没有需要保留的子节点，删除 children 属性
//                         delete newNode.subOrgList;
//                     }
//                     return newNode;
//                 }
//                 return null;
//             })
//             .filter(Boolean) as OrgLevelBean[];
//     };
//     return buildTree(treeData);
// };

// // 模糊匹配查找节点
// const fuzzySearchNodes = (nodes: OrgLevelBean[], searchName: string): string[] => {
//     const matchedKeys: string[] = [];

//     const traverse = (nodeList: OrgLevelBean[]) => {
//         nodeList.forEach((node) => {
//             // 检查当前节点名称是否包含搜索内容
//             if (node.orgName && node.orgName.includes(searchName)) {
//                 matchedKeys.push(node.orgId as string);
//             }
//             // 递归检查子节点
//             if (node.subOrgList && node.subOrgList.length > 0) {
//                 traverse(node.subOrgList);
//             }
//         });
//     };

//     traverse(nodes);
//     return matchedKeys;
// };

// // 获取节点的完整路径
// const getNodePath = (nodes: OrgLevelBean[], targetNode: OrgLevelBean): string[] => {
//     const path: string[] = [];
//     const traverse = (nodeList: OrgLevelBean[], targetId: string): boolean => {
//         for (const node of nodeList) {
//             path.push(node.orgId as string);
//             if (node.orgId === targetId) {
//                 return true;
//             }
//             if (node.subOrgList && node.subOrgList.length > 0 && traverse(node.subOrgList, targetId)) {
//                 return true;
//             }
//             path.pop();
//         }
//         return false;
//     };
//     traverse(nodes, targetNode.orgId as string);
//     return path;
// };

// // 获取第一层节点
// const getSecondLevelKeys = (nodes: OrgLevelBean[]): string[] => {
//     const secondLevelKeys: string[] = [];
//     nodes.forEach((firstLevelNode) => {
//         if (firstLevelNode.orgId) {
//             secondLevelKeys.push(firstLevelNode.orgId);
//         }
//     });
//     return secondLevelKeys;
// };

// type TProps = {
//     visible: boolean;
//     value?: string[]; // 用于回填选中的节点ID列表
//     onOk: (treeData: OrgLevelBean[]) => void;
//     onCancel: () => void;
// };

// type TTreeData = OrgLevelBean & { disabled?: boolean };

// export const SelectOrgModal: React.FC<TProps> = ({ visible, onOk, onCancel, value }) => {
//     // 组织层级树数据
//     const [orgLevelTreeData, setOrgLevelTreeData] = useState<TTreeData[]>([]);
//     // 新的树数据
//     const [newTreeData, setNewTreeData] = useState<TTreeData[]>([]);
//     // 已选中的节点ID列表
//     const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
//     // 已展开的节点ID列表
//     const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
//     // 搜索框的值
//     const [searchValue, setSearchValue] = useState<string>("");
//     // 高亮显示的节点ID列表
//     const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
//     const { roleType } = useOperatorRoleHook();
//     const operator = new Operator();

//     // 查询组织层级配置
//     const queryAllOrgLevel = async () => {
//         const {
//             data: { body: { orgLevelBean } = {} },
//         } = await new Api().system.queryOrgData({
//             body: {
//                 region: operator.region,
//                 operId: operator.operId,
//                 roleType,
//             },
//         });
//         if (orgLevelBean) {
//             setOrgLevelTreeData([{ ...orgLevelBean, disabled: true }]);
//         }
//     };
//     const { run: getOrgLevel } = useRequest(queryAllOrgLevel, { manual: true });

//     // 初始化回填逻辑
//     useEffect(() => {
//         if (value && orgLevelTreeData.length > 0) {
//             setCheckedKeys(value);
//         }
//     }, [value, orgLevelTreeData]);

//     useEffect(() => {
//         setNewTreeData(buildTreeByKeys(orgLevelTreeData, checkedKeys));
//     }, [checkedKeys, orgLevelTreeData]);

//     useEffect(() => {
//         if (!roleType) {
//             return;
//         }
//         getOrgLevel();
//     }, [roleType]);

//     useEffect(() => {
//         if (orgLevelTreeData.length > 0) {
//             const secondLevelKeys = getSecondLevelKeys(orgLevelTreeData);
//             setExpandedKeys(secondLevelKeys);
//         }
//     }, [orgLevelTreeData]);

//     const handleSearch = useCallback(
//         (value: string) => {
//             setSearchValue(value);
//             if (!value.trim()) {
//                 setExpandedKeys([]);
//                 setHighlightedKeys([]);
//                 return;
//             }

//             // 模糊匹配所有节点
//             const matchedKeys = fuzzySearchNodes(orgLevelTreeData, value.trim());
//             setHighlightedKeys(matchedKeys);

//             // 如果有匹配的节点，展开所有匹配节点的路径
//             if (matchedKeys.length > 0) {
//                 // 收集所有匹配节点的路径
//                 const uniqueExpandedKeys = new Set<string>();

//                 matchedKeys.forEach((key) => {
//                     // 获取每个匹配节点的路径
//                     const matchedNode = findNodeById(orgLevelTreeData, key);
//                     if (matchedNode) {
//                         const path = getNodePath(orgLevelTreeData, matchedNode);
//                         // 将路径中的所有节点ID添加到展开集合中
//                         path.forEach((pathKey) => {
//                             uniqueExpandedKeys.add(pathKey);
//                         });
//                     }
//                 });

//                 // 设置所有需要展开的节点
//                 setExpandedKeys([...uniqueExpandedKeys]);
//             } else {
//                 setExpandedKeys([]);
//             }
//         },
//         [orgLevelTreeData]
//     );

//     // 根据ID查找节点
//     const findNodeById = (nodes: OrgLevelBean[], id: string): OrgLevelBean | null => {
//         for (const node of nodes) {
//             if (node.orgId === id) {
//                 return node;
//             }
//             if (node.subOrgList && node.subOrgList.length > 0) {
//                 const found = findNodeById(node.subOrgList, id);
//                 if (found) {
//                     return found;
//                 }
//             }
//         }
//         return null;
//     };

//     // 自定义节点标题渲染函数，用于高亮显示
//     const renderTreeNodeTitle = (treeNode: EventDataNode<OrgLevelBean>) => {
//         const isHighlighted = highlightedKeys.includes(treeNode.orgId as string);

//         return (
//             <span className={isHighlighted ? styles.highlightedNode : ""}>
//                 <FolderOpenOutlined className={styles.titleIcon} />
//                 {treeNode.orgName}
//             </span>
//         );
//     };

//     return (
//         <Modal
//             open={visible}
//             title="选择渠道"
//             okText="确定"
//             cancelText="取消"
//             onOk={() => {
//                 if (newTreeData && newTreeData.length > 0) {
//                     onOk(newTreeData);
//                 } else {
//                     Modal.warn({
//                         title: "请至少选择一个渠道",
//                         okText: "确认",
//                         centered: true,
//                     });
//                 }
//             }}
//             onCancel={onCancel}
//             bodyStyle={{ height: 550, padding: "16px 16px 16px 36px" }}
//         >
//             <Search
//                 placeholder="请输入组织渠道名称"
//                 onChange={(event) => handleSearch(event.target.value)}
//                 style={{ width: 300, marginBottom: 16 }}
//                 value={searchValue}
//             />
//             <div className={styles.titleWrap}>组织渠道</div>
//             {orgLevelTreeData.length > 0 ? (
//                 <div className={classNames(styles.treeWrap)}>
//                     <Tree
//                         checkable
//                         checkStrictly
//                         expandedKeys={expandedKeys}
//                         onExpand={(keys) => setExpandedKeys(keys as string[])}
//                         treeData={orgLevelTreeData as EventDataNode<OrgLevelBean>[]}
//                         fieldNames={{ key: "orgId", title: "orgName", children: "subOrgList" }}
//                         titleRender={renderTreeNodeTitle}
//                         checkedKeys={checkedKeys}
//                         onCheck={(info) => setCheckedKeys((info as { checked: string[] }).checked)}
//                     />
//                 </div>
//             ) : (
//                 <Empty style={{ marginTop: "30%" }} />
//             )}
//         </Modal>
//     );
// };

// .titleWrap {
//     display: flex;
//     align-items: center;
//     color: @dark-text;
//     font-weight: @mobile-font-weight-700;

//     &::before {
//         display: block;
//         width: 4px;
//         height: 18px;
//         margin-right: @space-small;
//         background: @title-vertical-bar-color;
//         border-radius: 0 @border-radius-4 @border-radius-4 0;
//         content: "";
//     }
// }

// .treeWrap {
//     padding: @space-normal;

//     .titleIcon {
//         margin-right: @space-small;
//         font-size: @font-size-title;
//     }
// }

// .highlightedNode {
//     padding: 2px 4px;
//     color: #f6f4f0 !important;
//     font-weight: bold;
//     background-color: #1d91fa !important;
//     border-radius: 4px;
// }

export default function InputTable() {
  return <div>InputTable</div>;
}
