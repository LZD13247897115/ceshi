import { defineConfig } from '@umijs/max';

export default defineConfig({
  /**
   * pdf.js 依赖的 Worker 文件，构建时复制到输出根目录
   * 与 src/components/FilePreview/utils.ts 中的 PDF_WORKER_URL 保持一致
   */
  copy: [
    {
      from: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
      to: 'pdf.worker.min.mjs',
    },
  ],
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
    {
      name: 'inputTable',
      path: '/InputTable',
      component: './inputTable',
    },
    {
      name: '产品管理',
      path: '/product',
      component: './ProductTable',
    },
    {
      name: '树形选择',
      path: '/tree',
      component: './TreeDemo',
    },
    /**
     * 【Tree 组件入门】
     * 路径：/tree-learn
     * 页面：src/pages/TreeLearnDemo/index.tsx
     * 说明：从零学习 antd Tree API（展开、选中、勾选等）
     */
    {
      name: 'Tree 入门',
      path: '/tree-learn',
      component: './TreeLearnDemo',
    },
    /**
     * 【自定义表单控件 Demo】
     * 路径：/custom-form
     * 入口：src/pages/CustomFormDemo/index.tsx
     * 结构：components/ hooks/ utils/ constants.ts types.ts columns.tsx
     * 复用：src/components/TreeFormPicker/（单选/多选树表单控件）
     */
    {
      name: '自定义表单',
      path: '/custom-form',
      component: './CustomFormDemo',
    },
    {
      name: 'PDF 预览',
      path: '/pdf-preview',
      component: './PdfPreviewDemo',
    },
    {
      name: '图片预览',
      path: '/image-preview',
      component: './ImagePreviewDemo',
    },
    /**
     * 【文件预览 pdf.js 版】
     * 路径：/file-preview
     * 页面：src/pages/FilePreviewDemo/index.tsx
     * 说明：type=fileImage 展示图片，type=filePdf 用 pdf.js 渲染 PDF
     *       支持链接和 Base64，带左转/右转/放大/缩小/全屏控件
     */
    {
      name: '文件预览 pdf.js',
      path: '/file-preview',
      component: './FilePreviewDemo',
    },
    /**
     * 【文件预览 iframe 版】
     * 路径：/file-preview-iframe
     * 页面：src/pages/FilePreviewIframeDemo/index.tsx
     * 说明：和上面一样支持 type 切换，但 PDF 用 iframe 嵌入（实现更简单）
     */
    {
      name: '文件预览 iframe',
      path: '/file-preview-iframe',
      component: './FilePreviewIframeDemo',
    },
    /**
     * 【单文件版 pdf.js】全部逻辑在一个 tsx 里，方便小白阅读
     * 路径：/file-preview-single-pdfjs
     * 文件：src/pages/FilePreviewAllInOnePdfJs/index.tsx
     */
    {
      name: '预览单文件 pdf.js',
      path: '/file-preview-single-pdfjs',
      component: './FilePreviewAllInOnePdfJs',
    },
    /**
     * 【单文件版 iframe】全部逻辑在一个 tsx 里
     * 路径：/file-preview-single-iframe
     * 文件：src/pages/FilePreviewAllInOneIframe/index.tsx
     */
    {
      name: '预览单文件 iframe',
      path: '/file-preview-single-iframe',
      component: './FilePreviewAllInOneIframe',
    },
  ],
  npmClient: 'npm',
  utoopack: {},
});
