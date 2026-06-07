# 前端 Demo 使用教程（面向小白）

> 本文档教你读懂、会用、会改项目里的三个 Demo：  
> **文件预览（pdf.js 版）**、**文件预览（iframe 版）**、**树形选择**。
>
> **重要说明：这三个 Demo 全部使用 Ant Design（antd）原生组件，没有使用 `@ant-design/pro-components`（pro）。**

---

## 目录

1. [先认识项目结构](#1-先认识项目结构)
2. [文件预览 Demo（pdf.js 版）](#2-文件预览-demopdfjs-版)
3. [文件预览 Demo（iframe 版）](#3-文件预览-demoiframe-版)
4. [两个 PDF Demo 的对比](#4-两个-pdf-demo-的对比)
5. [树形选择 Demo（重点：回填与联动）](#5-树形选择-demo重点回填与联动)
6. [常见问题 FAQ](#6-常见问题-faq)

---

## 1. 先认识项目结构

### 1.1 怎么启动

```bash
npm run dev
```

浏览器一般打开：`http://localhost:8000`

### 1.2 路由在哪里配置

文件：`.umirc.ts`

| 菜单名称 | 访问路径 | 页面文件 |
| --- | --- | --- |
| 文件预览 pdf.js | `/file-preview` | `src/pages/FilePreviewDemo/index.tsx` |
| 文件预览 iframe | `/file-preview-iframe` | `src/pages/FilePreviewIframeDemo/index.tsx` |
| 树形选择 | `/tree` | `src/pages/TreeDemo/index.tsx` |

### 1.3 技术栈（你只需要知道这些）

| 技术                  | 作用                                       |
| --------------------- | ------------------------------------------ |
| React                 | 写页面和组件                               |
| Ant Design (antd)     | UI 组件库（Button、Input、Tree、Modal 等） |
| Umi Max               | 项目框架，负责路由、构建                   |
| pdf.js (`pdfjs-dist`) | 仅 pdf.js 版 PDF 预览用到                  |

**没有用 pro-components**：页面里不会出现 `PageContainer`、`ProForm` 等 pro 组件。

---

## 2. 文件预览 Demo（pdf.js 版）

### 2.1 这个 Demo 是干什么的？

一个组件同时支持：

- 预览 **图片**（`type="fileImage"`）
- 预览 **PDF**（`type="filePdf"`，用 pdf.js 画到 Canvas 上）

并且带 5 个操作按钮：**左转、右转、放大、缩小、全屏**。

### 2.2 怎么访问、怎么用

1. 启动项目后打开：`http://localhost:8000/file-preview`
2. 页面上可以：
   - 用 Radio 切换 `fileImage` / `filePdf`
   - 点按钮加载示例图片、示例 PDF（Base64 或链接）
   - 上传本地文件
   - 粘贴地址后点「应用」
3. 下方预览区会自动更新，工具栏可以旋转缩放

### 2.3 核心用法（复制到你的业务页面）

```tsx
import FilePreview from '@/components/FilePreview';

// 预览图片
<FilePreview type="fileImage" src={图片地址} />

// 预览 PDF（pdf.js 方式）
<FilePreview type="filePdf" src={pdf地址} pdfMode="pdfjs" initialScale={1.2} />
```

**参数说明：**

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `type` | `'fileImage' \| 'filePdf'` | 预览图片还是 PDF |
| `src` | `string` | 文件地址：http 链接、Base64、或 `data:...` URL |
| `pdfMode` | `'pdfjs' \| 'iframe'` | PDF 渲染方式，本 Demo 用 `pdfjs` |
| `initialScale` | `number` | 初始缩放，1 = 100% |

### 2.4 文件路径（建议按这个顺序读代码）

```
src/
├── components/FilePreview/          ← 核心组件（最重要）
│   ├── index.tsx                    ← 总入口：根据 type 分发到不同子组件
│   ├── types.ts                     ← 类型定义（type、src 等）
│   ├── utils.ts                     ← 工具函数（Base64 处理、全屏等）
│   ├── usePreviewControls.ts        ← 工具栏状态（缩放、旋转、全屏）
│   ├── PreviewToolbar.tsx           ← 五个按钮 UI
│   ├── ImageContent.tsx             ← 图片怎么展示
│   ├── PdfJsContent.tsx             ← pdf.js 怎么展示 PDF
│   ├── PdfIframeContent.tsx         ← iframe 怎么展示 PDF
│   └── index.less                   ← 样式
│
└── pages/FilePreviewDemo/
    ├── index.tsx                    ← Demo 页面（演示怎么调用 FilePreview）
    └── index.less                   ← 页面布局样式
```

另外还有配置文件：

```
.umirc.ts                            ← 路由 + pdf.js Worker 文件复制配置
```

### 2.5 整体思路（用大白话）

可以把 `FilePreview` 想象成一个「预览盒子」：

```
┌─────────────────────────────────────┐
│  PreviewToolbar（工具栏）            │  ← 左转右转放大缩小全屏
├─────────────────────────────────────┤
│                                     │
│   根据 type 显示不同内容：           │
│   - fileImage → ImageContent        │
│   - filePdf   → PdfJsContent        │
│                                     │
└─────────────────────────────────────┘
```

**数据流：**

```
页面设置 src、type
       ↓
FilePreview 接收 props
       ↓
usePreviewControls 管理 scale、rotation
       ↓
子组件根据 type 渲染图片或 PDF
       ↓
工具栏按钮改变 scale/rotation，子组件重新渲染或 CSS 变换
```

### 2.6 pdf.js 版 PDF 的逻辑（分步）

#### 第一步：加载 PDF

文件：`PdfJsContent.tsx`

1. `src` 变化时，`useEffect` 触发
2. 判断 `src` 是 **http 链接** 还是 **Base64**
3. 调用 `pdfjs-dist` 的 `getDocument()` 解析 PDF
4. 解析成功后得到 `pdfDoc` 和总页数 `numPages`

#### 第二步：渲染到 Canvas

1. 每一页 PDF 对应一个 `<canvas>` 元素
2. `pdf.js` 把 PDF 页面「画」到 canvas 上
3. 缩放、旋转变化时，重新调用 `page.render()` 重绘

#### 第三步：Worker 是什么？

pdf.js 解析 PDF 很重，放在 **Web Worker** 后台线程里跑，避免页面卡死。

- Worker 文件：`node_modules/pdfjs-dist/build/pdf.worker.min.mjs`
- 构建时复制到：`/pdf.worker.min.mjs`（在 `.umirc.ts` 的 `copy` 里配置）
- 代码里引用：`utils.ts` 的 `PDF_WORKER_URL = '/pdf.worker.min.mjs'`

#### 第四步：工具栏怎么控制 PDF？

| 操作      | pdf.js 模式怎么实现                         |
| --------- | ------------------------------------------- |
| 放大/缩小 | 改变 `scale`，pdf.js 按新 scale 重绘 canvas |
| 左转/右转 | 改变 `rotation`，pdf.js 按新角度重绘        |
| 全屏      | 把整个预览区 `div` 调用浏览器全屏 API       |

### 2.7 Demo 页面在做什么

文件：`src/pages/FilePreviewDemo/index.tsx`

Demo 页面**不负责**预览逻辑，只负责：

1. 用 `useState` 存 `type` 和 `src`
2. 提供按钮让你切换数据源
3. 把 `type`、`src` 传给 `<FilePreview />`

```tsx
<FilePreview type={type} src={src} pdfMode="pdfjs" initialScale={1.2} />
```

**就这一行是核心。**

---

## 3. 文件预览 Demo（iframe 版）

### 3.1 和 pdf.js 版有什么区别？

| 对比项       | pdf.js 版                  | iframe 版                |
| ------------ | -------------------------- | ------------------------ |
| 路径         | `/file-preview`            | `/file-preview-iframe`   |
| PDF 实现     | pdf.js 画到 Canvas         | `<iframe src="pdf地址">` |
| 依赖         | 需要 `pdfjs-dist` + Worker | 不需要 pdf.js            |
| 浏览器工具栏 | 无（完全自定义）           | 尽量隐藏（`#toolbar=0`） |
| 推荐场景     | 要精细控制、多页 PDF       | 快速接入、PDF 简单       |

**图片预览**：两个 Demo 完全一样，都用 `ImageContent`。

### 3.2 怎么用

```tsx
<FilePreview type={type} src={src} pdfMode="iframe" />
```

### 3.3 iframe 版的思路

文件：`PdfIframeContent.tsx`

```
PDF 地址
   ↓
buildIframePdfSrc() 追加 #toolbar=0&navpanes=0 隐藏浏览器自带工具栏
   ↓
<iframe src={处理后的地址} />
   ↓
外层 div 用 CSS transform 做旋转和缩放
```

**为什么旋转/缩放用 CSS 而不是改 iframe 内部？**

iframe 里是浏览器自己的 PDF 查看器，我们改不了它内部。只能对整个 iframe 外层做 `transform: rotate() scale()`。

### 3.4 文件路径

```
src/pages/FilePreviewIframeDemo/
├── index.tsx       ← Demo 页面，唯一区别是 pdfMode="iframe"
└── index.less
```

组件还是共用 `src/components/FilePreview/`，不需要复制一份。

---

## 4. 两个 PDF Demo 的对比

### 4.1 共用部分（不用写两遍）

这些文件两个 Demo **共用**：

- `FilePreview/index.tsx` — 总调度
- `PreviewToolbar.tsx` — 工具栏
- `usePreviewControls.ts` — 状态管理
- `ImageContent.tsx` — 图片
- `utils.ts`、`types.ts` — 工具和类型

### 4.2 仅 PDF 不同的部分

```
pdfMode="pdfjs"   → 走 PdfJsContent.tsx
pdfMode="iframe"  → 走 PdfIframeContent.tsx
```

在 `FilePreview/index.tsx` 里用 `if/else` 判断：

```tsx
{type === 'fileImage' ? (
  <ImageContent ... />
) : pdfMode === 'iframe' ? (
  <PdfIframeContent ... />
) : (
  <PdfJsContent ... />
)}
```

### 4.3 图片预览的逻辑（两个 Demo 相同）

文件：`ImageContent.tsx`

1. `normalizeImageSrc(src)` 把各种格式统一成 img 能用的地址
2. `<img src={...} />` 显示图片
3. 外层 `div` 加 `transform: rotate() scale()` 实现旋转缩放

---

## 5. 树形选择 Demo（重点：回填与联动）

### 5.1 这个 Demo 是干什么的？

页面上有：

1. **单选 Input** — 点击弹出 Modal，树里用 Radio 单选
2. **多选 Input** — 点击弹出 Modal，树里用 Checkbox 多选（父子联动）
3. **查询按钮** — 把选中值展示在页面下方
4. **重置按钮** — 清空所有选择

**全部是 antd 组件**：`Input`、`Modal`、`Tree`、`Radio`、`Button`、`Card` 等。  
**没有使用 pro-components。**

### 5.2 怎么访问

`http://localhost:8000/tree`

### 5.3 文件路径

```
src/pages/TreeDemo/
├── index.tsx       ← 全部逻辑（约 600 行，含详细注释）
└── index.less      ← 样式
```

### 5.4 页面有哪些「状态」？（理解回填的关键）

React 里用 `useState` 存数据，数据变了界面就更新。

```tsx
// ========== 页面级状态（TreeDemo 组件） ==========

singleValue; // 单选「已确认」的值 → 回填到单选 Input
multiValue; // 多选「已确认」的值数组 → 回填到多选 Input

singleModalOpen; // 单选弹窗是否打开
multiModalOpen; // 多选弹窗是否打开

queryResult; // 点「查询」后展示的结果
```

**为什么要分「弹窗内临时状态」和「页面已确认状态」？**

```
用户在弹窗里点选 → 还没点「确定」→ 不应该改 Input
用户点「确定」   → 才把选择写回 singleValue / multiValue → Input 才更新
用户点「取消」   → 丢弃弹窗里的临时选择 → Input 不变
```

这就是「回填」的核心思想：**确定才回填，取消不算数。**

### 5.5 完整交互流程（单选）

用时间线描述：

```
① 用户点击单选 Input
       ↓
   setSingleModalOpen(true)  → 弹窗打开

② 弹窗打开时（useEffect 监听 open=true）
       ↓
   把 singleValue（页面上次已选的值）复制到 tempSelected（弹窗临时值）
       ↓
   如果有选中项，expandedKeys 设为 [选中项的 key] → 树展开到该节点

③ 用户在弹窗里点某个节点的 Radio 或文字
       ↓
   setTempSelected({ key, title })  → 只改弹窗内临时状态

④ 用户点「确定」
       ↓
   setSingleValue(tempSelected)     → 写入页面已确认状态
   setSingleModalOpen(false)        → 关弹窗
       ↓
   singleInputText = singleValue.title  → Input 显示选中的文字

⑤ 用户再次点击 Input 打开弹窗
       ↓
   useEffect 再次执行：tempSelected = singleValue
       ↓
   树上 Radio 恢复为上次选中的节点 ✅（这就是「再次打开要回填」）
```

**对应代码位置：**

| 步骤 | 代码 |
| --- | --- |
| 打开弹窗 | `onOpen={() => setSingleModalOpen(true)}` |
| 恢复选中 | `SingleTreeModal` 里的 `useEffect(() => { if (open) setTempSelected(value) ...})` |
| 确定回填 | `onConfirm={(node) => { setSingleValue(node); setSingleModalOpen(false) }}` |
| Input 显示 | `singleInputText = singleValue ? singleValue.title : ''` |

### 5.6 完整交互流程（多选 + 父子联动）

多选比单选多一个概念：**父子联动**（勾选父节点 = 全选所有子节点）。

```
① 用户点击多选 Input → multiModalOpen = true

② 弹窗打开时
       ↓
   checkedKeys = multiValue 里所有 key
   expandedKeys = 这些 key（展开到已选节点）

③ 用户勾选节点（两种方式）

   方式 A：点 Tree 自带的 Checkbox
       ↓
   Tree 的 onCheck 回调（antd 内置父子联动）
       ↓
   setCheckedKeys(最新的 key 列表)

   方式 B：点节点文字
       ↓
   toggleCheckedWithCascade(key, checkedKeys)
       ↓
   收集该节点 + 所有子孙 key，一次性加入或移除

④ 用户点「确定」
       ↓
   onConfirm(keysToNodes(checkedKeys))
       ↓
   setMultiValue(节点数组)
       ↓
   multiInputText = multiValue.map(item => item.title).join('、')
```

**父子联动函数说明：**

```tsx
// 勾选 0-1 时，会同时勾选 0-1、0-1-0、0-1-1、0-1-2
collectNodeAndDescendantKeys(node);

// 取消 0-1 时，上面这些 key 全部移除
toggleCheckedWithCascade(key, currentKeys);
```

### 5.7 弹窗里树是怎么「展开」的？

Tree 组件有两个关键 props：

| prop               | 含义                                |
| ------------------ | ----------------------------------- |
| `expandedKeys`     | 当前哪些节点是「展开」状态          |
| `autoExpandParent` | 设为 true 时，antd 会自动展开父节点 |

**场景 1：打开弹窗时展开到已选项**

```tsx
useEffect(() => {
  if (open) {
    setExpandedKeys(value ? [value.key] : []); // 单选
    // 或多选：setExpandedKeys(value.map(item => item.key));
    setAutoExpandParent(true);
  }
}, [open, value]);
```

**场景 2：搜索时自动展开匹配节点的父级**

用户输入搜索词 → 在 `flatNodeList` 里找匹配的节点 → 找每个匹配节点的**父节点 key** → 设为 `expandedKeys` → 用户就能看到被搜到的子节点。

```tsx
const onSearch = (e) => {
  const keyword = e.target.value;
  const keys = flatNodeList
    .filter(item => item.title.includes(keyword))
    .map(item => findParentKey(item.key, treeSource))  // 找父节点
    .filter(...);
  setExpandedKeys(keys);
  setAutoExpandParent(true);
};
```

**场景 3：用户手动点三角展开/收起**

```tsx
onExpand={(keys) => {
  setExpandedKeys(keys);
  setAutoExpandParent(false);  // 手动展开后不再自动帮用户展开
}}
```

### 5.8 数据结构说明

**树的数据（treeSource）：**

```tsx
[
  { key: '0-0', title: '0-0' },
  {
    key: '0-1',
    title: '0-1',
    children: [
      { key: '0-1-0', title: '0-1-0' },
      { key: '0-1-1', title: '0-1-1' },
      ...
    ],
  },
  ...
]
```

**选中后存的对象（TreeNodeValue）：**

```tsx
{ key: '0-1', title: '0-1' }
```

**flatNodeList（扁平列表，搜索用）：**

```tsx
[
  { key: '0-0', title: '0-0' },
  { key: '0-1', title: '0-1' },
  { key: '0-1-0', title: '0-1-0' },
  ...
]
```

### 5.9 只读 Input 是怎么实现的

```tsx
<Input
  readOnly // 不能键盘输入
  value={singleInputText} // 显示已选文字
  onClick={onOpen} // 点击打开弹窗
  onKeyDown={(e) => e.preventDefault()} // 禁止键盘
/>
```

看起来像输入框，其实是「选择器触发器」。

### 5.10 查询和重置

**查询：**

```tsx
const handleQuery = () => {
  setQueryResult({ single: singleValue, multi: multiValue });
};
```

把当前 `singleValue`、`multiValue` 复制到 `queryResult`，页面下方 Card 根据 `queryResult` 渲染。

**重置：**

```tsx
const handleReset = () => {
  setSingleValue(null);
  setMultiValue([]);
  setQueryResult(null);
  setSingleModalOpen(false);
  setMultiModalOpen(false);
};
```

全部清空，回到初始状态。

### 5.11 树 Demo 架构图

```
TreeDemo 页面
├── PickerInput（单选）──onClick──→ SingleTreeModal
│                                      ├── Search 搜索
│                                      ├── Tree + Radio
│                                      └── 确定 → setSingleValue
│
├── PickerInput（多选）──onClick──→ MultiTreeModal
│                                      ├── Search 搜索
│                                      ├── Tree + checkable
│                                      └── 确定 → setMultiValue
│
├── 查询按钮 → setQueryResult → 结果 Card
└── 重置按钮 → 清空所有 state
```

---

## 6. 常见问题 FAQ

### Q1：为什么不用 pro-components？

pro 是 Ant Design Pro 的扩展组件库，适合中后台快速搭建。  
这三个 Demo deliberately 只用 **antd 原生组件**，方便学习、复制到任何 React 项目。

### Q2：src 支持哪些格式？

| 类型 | 支持格式                                             |
| ---- | ---------------------------------------------------- |
| 图片 | http 链接、Base64、`data:image/...`                  |
| PDF  | http 链接、Base64、`data:application/pdf;base64,...` |

### Q3：左转第一次转很多圈？

已修复。旋转用累加角度（0 → -90 → -180），不要 normalize 成 270，否则 CSS 会绕大圈。

### Q4：iframe PDF 还有浏览器自带工具栏？

Chrome/Edge 一般可通过 `#toolbar=0` 隐藏。Firefox 可能仍有，建议换 pdf.js 版。

### Q5：树多选勾选父节点，子节点也要勾上？

使用 Tree 的 `checkable` + 默认 `checkStrictly=false`（父子联动）。  
点 Checkbox 由 antd 处理；点文字由 `toggleCheckedWithCascade` 处理。

### Q6：我想在自己的页面用 FilePreview，最少写几行？

```tsx
import FilePreview from '@/components/FilePreview';

<FilePreview type="filePdf" src={你的pdf地址} pdfMode="pdfjs" />;
```

### Q7：建议学习顺序

1. 先跑起来三个 Demo 页面试一遍操作
2. 读 `FilePreview/index.tsx`（50 行，总调度）
3. 读 `usePreviewControls.ts`（工具栏状态）
4. 读 `ImageContent.tsx` 或 `PdfJsContent.tsx`（具体渲染）
5. 读 `TreeDemo/index.tsx` 第五部分「页面入口」，再往上读 Modal 部分

---

## 附录：确认未使用 pro-components

以下 Demo 文件的 import 中 **均无** `@ant-design/pro-components`：

- `src/pages/FilePreviewDemo/index.tsx`
- `src/pages/FilePreviewIframeDemo/index.tsx`
- `src/pages/TreeDemo/index.tsx`
- `src/components/FilePreview/*`

页面布局使用：`Typography.Title`、`Card`、`div` + `index.less`。

---

_文档版本：与当前代码同步。如有疑问，可对照源码中的中文注释阅读。_
