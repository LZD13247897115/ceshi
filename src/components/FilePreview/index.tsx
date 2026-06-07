/**
 * =============================================================================
 * 【文件说明】index.tsx —— FilePreview 主组件（入口）
 * =============================================================================
 *
 * 这是整个预览功能的「总调度」：
 *   1. 根据 type 决定显示图片还是 PDF
 *   2. 根据 pdfMode 决定 PDF 用 pdf.js 还是 iframe
 *   3. 统一管理工具栏（左转右转放大缩小全屏）
 *
 * 【最简单的用法】
 *   import FilePreview from '@/components/FilePreview';
 *
 *   // 预览图片
 *   <FilePreview type="fileImage" src="图片地址" />
 *
 *   // 预览 PDF（pdf.js）
 *   <FilePreview type="filePdf" src="pdf地址" pdfMode="pdfjs" />
 *
 *   // 预览 PDF（iframe）
 *   <FilePreview type="filePdf" src="pdf地址" pdfMode="iframe" />
 * =============================================================================
 */

import React, { useRef } from 'react';
import ImageContent from './ImageContent';
import './index.less';
import PdfIframeContent from './PdfIframeContent';
import PdfJsContent from './PdfJsContent';
import PreviewToolbar from './PreviewToolbar';
import type { FilePreviewProps } from './types';
import { usePreviewControls } from './usePreviewControls';

const FilePreview: React.FC<FilePreviewProps> = ({
  type,
  src,
  pdfMode = 'pdfjs',
  className = '',
  initialScale = 1,
  initialRotation = 0,
}) => {
  /**
   * viewerRef：预览区域的 DOM 引用
   * useRef 创建一个「盒子」，里面存 DOM 节点，全屏时传给浏览器 API
   */
  const viewerRef = useRef<HTMLDivElement>(null);

  /**
   * controls：工具栏的所有状态和方法
   * 来自 usePreviewControls 这个 Hook
   */
  const controls = usePreviewControls(initialScale, initialRotation);

  /**
   * pdf.js 和 图片/iframe 的缩放方式不同：
   *   - pdf.js：缩放传给 pdf.js 渲染（Canvas 重绘）
   *   - 图片/iframe：缩放用 CSS transform
   * 所以这里拆成两个变量
   */
  const pdfJsScale =
    type === 'filePdf' && pdfMode === 'pdfjs' ? controls.scale : 1;
  const cssScale =
    type === 'fileImage' || pdfMode === 'iframe' ? controls.scale : 1;

  return (
    <div className={`file-preview ${className}`.trim()}>
      {/* ---------- 工具栏：五个按钮 ---------- */}
      <PreviewToolbar
        scale={controls.scale}
        rotation={controls.rotation}
        isFullscreen={controls.isFullscreen}
        onRotateLeft={controls.rotateLeft}
        onRotateRight={controls.rotateRight}
        onZoomIn={controls.zoomIn}
        onZoomOut={controls.zoomOut}
        onToggleFullscreen={() => controls.toggleFullscreen(viewerRef.current)}
      />

      {/* ---------- 预览内容：根据 type 和 pdfMode 选择不同子组件 ---------- */}
      {type === 'fileImage' ? (
        /* type=fileImage → 图片预览 */
        <ImageContent
          src={src}
          scale={cssScale}
          rotation={controls.rotation}
          viewerRef={viewerRef}
        />
      ) : pdfMode === 'iframe' ? (
        /* type=filePdf + pdfMode=iframe → iframe 嵌入 PDF */
        <PdfIframeContent
          src={src}
          scale={cssScale}
          rotation={controls.rotation}
          viewerRef={viewerRef}
        />
      ) : (
        /* type=filePdf + pdfMode=pdfjs（默认）→ pdf.js 画到 Canvas */
        <PdfJsContent
          src={src}
          scale={Math.max(pdfJsScale, 0.5)}
          rotation={controls.rotation}
          viewerRef={viewerRef}
        />
      )}
    </div>
  );
};

export default FilePreview;

/* 导出类型和 Demo 示例数据，方便页面 import */
export type { FilePreviewProps, FilePreviewType, PdfRenderMode } from './types';
export { SAMPLE_IMAGE_SRC, SAMPLE_PDF_BASE64, SAMPLE_PDF_URL } from './utils';
