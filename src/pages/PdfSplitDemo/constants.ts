import { SAMPLE_PDF_URL } from '@/components/FilePreview/utils';

/** 默认展示的 PDF 地址 */
export const DEFAULT_PDF_SRC = SAMPLE_PDF_URL;

/** 右侧消息/介绍列表 */
export interface MessageItem {
  id: string;
  title: string;
  time: string;
  summary: string;
  content: string;
}

export const messageList: MessageItem[] = [
  {
    id: '1',
    title: '全屏使用说明',
    time: '2026-03-21 10:00',
    summary: '点击全屏时，工具栏和 PDF 会一起进入全屏',
    content:
      '全屏必须对用户点击生效。本 Demo 把工具栏和 iframe 包在同一个 div 里再 requestFullscreen，这样全屏后仍能点「退出全屏」。按 Esc 也可退出。',
  },
  {
    id: '2',
    title: '旋转与缩放',
    time: '2026-03-21 10:05',
    summary: 'iframe 模式通过 CSS transform 实现',
    content:
      '左转/右转每次 90°，放大/缩小按步长调整 scale。transform 作用在 iframe 外层 div 上，不是改 iframe 内部 PDF 查看器。',
  },
  {
    id: '3',
    title: 'iframe PDF 说明',
    time: '2026-03-21 10:10',
    summary: '依赖浏览器内置 PDF 查看器',
    content:
      '地址后会自动加 #toolbar=0 尽量隐藏浏览器自带工具栏。若 Chrome 仍显示，可换 pdf.js 方案（见 /file-preview）。',
  },
  {
    id: '4',
    title: '布局说明',
    time: '2026-03-21 10:15',
    summary: '左侧预览，右侧消息卡片',
    content:
      '点击右侧卡片可在下方查看详情。左侧预览区独立滚动，全屏只影响左侧预览容器，不影响右侧列表。',
  },
];
