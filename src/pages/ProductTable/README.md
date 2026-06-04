# 产品管理高阶表格示例

这是一个基于 Ant Design Pro 的高阶表格示例，展示了常见的 CRUD 操作和高级功能。

## 功能特性

### 1. 基础功能

- ✅ 数据展示：支持多列数据展示
- ✅ 分页：支持分页、每页条数切换、快速跳转
- ✅ 搜索：支持多字段搜索过滤
- ✅ 排序：支持价格、库存、时间等字段排序

### 2. CRUD 操作

- ✅ 新建：通过模态框新建产品
- ✅ 编辑：点击编辑按钮修改产品信息
- ✅ 删除：单个删除（带确认提示）
- ✅ 批量删除：支持多选批量删除

### 3. 高级功能

- ✅ 行选择：支持单选和多选
- ✅ 批量操作工具栏：选中数据后显示底部操作栏
- ✅ 数据导出：导出表格数据（功能预留）
- ✅ 状态标签：不同状态用不同颜色标识
- ✅ 库存预警：库存不足时颜色提示
- ✅ 固定列：操作列固定在右侧
- ✅ 响应式：支持横向滚动

### 4. 表单验证

- ✅ 必填项验证
- ✅ 数字格式验证
- ✅ 字符长度限制
- ✅ 实时错误提示

## 使用方法

### 1. 添加路由配置

在 `.umirc.ts` 中添加路由：

\`\`\`typescript routes: [ { path: '/product', name: '产品管理', icon: 'table', component: './ProductTable', }, ] \`\`\`

### 2. 访问页面

启动项目后访问：`http://localhost:8000/product`

### 3. 连接真实 API

修改 `src/pages/ProductTable/index.tsx` 中的 `fetchProductList` 函数：

\`\`\`typescript const fetchProductList = async (params: any) => { // 替换为真实的 API 调用 const response = await request('/api/products', { method: 'GET', params, }); return response; }; \`\`\`

## 核心代码说明

### ProTable 配置

\`\`\`typescript <ProTable<ProductType> headerTitle="产品列表" actionRef={actionRef} // 表格操作引用 rowKey="id" // 行唯一标识 search={{              // 搜索配置
    labelWidth: 120,
  }} request={fetchProductList} // 数据请求 columns={columns} // 列配置 rowSelection={{             // 行选择
    onChange: (_, selectedRows) => setSelectedRows(selectedRows),
  }} /> \`\`\`

### 列配置示例

\`\`\`typescript { title: '价格', dataIndex: 'price', valueType: 'money', // 金额类型 search: false, // 不在搜索表单中显示 sorter: true, // 支持排序 render: (\_, record) => \`¥\${record.price.toLocaleString()}\`, } \`\`\`

### 操作列配置

\`\`\`typescript { title: '操作', valueType: 'option', fixed: 'right', // 固定在右侧 render: (\_, record) => ( <Space> <a onClick={() => handleEdit(record)}>编辑</a> <Popconfirm onConfirm={() => handleDelete(record)}> <a>删除</a> </Popconfirm> </Space> ), } \`\`\`

## 扩展建议

1. **详情页面**：点击详情跳转到产品详情页
2. **图片上传**：添加产品图片上传功能
3. **批量导入**：支持 Excel 批量导入产品
4. **数据统计**：添加产品统计图表
5. **权限控制**：根据用户角色显示不同操作按钮

## 相关文档

- [ProTable 文档](https://procomponents.ant.design/components/table)
- [ProForm 文档](https://procomponents.ant.design/components/form)
- [Ant Design 文档](https://ant.design/)
