import { defineConfig } from '@umijs/max';

export default defineConfig({
  /**
   * pdf.js 依赖的 Worker 文件，构建时复制到输出根目录
   * 与 src/utils/pdfjsConfig.ts 中的 PDF_WORKER_URL 保持一致
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
      name: '产品管理',
      path: '/product',
      component: './ProductTable',
    },
    {
      name: '树形选择',
      path: '/tree',
      component: './TreeDemo',
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
  ],
  npmClient: 'npm',
  utoopack: {},
});
