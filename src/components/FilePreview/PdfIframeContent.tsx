/**
 * =============================================================================
 * 【文件说明】PdfIframeContent.tsx —— iframe 方式展示 PDF
 * =============================================================================
 *
 * 实现原理：
 *   用 <iframe src="PDF地址"> 让浏览器内置 PDF 查看器显示 PDF
 *
 * 优点：代码简单
 * 缺点：旋转/缩放是对整个 iframe 做 CSS transform；部分浏览器自带工具栏难完全隐藏
 *
 * 若 iframe 仍有问题，请用 pdf.js 模式（PdfJsContent.tsx）
 * =============================================================================
 */

import { Empty } from 'antd';
import React from 'react';
import { buildIframePdfSrc, buildTransformStyle } from './utils';

/** PdfIframeContentProps —— iframe PDF 预览组件的参数 */
export interface PdfIframeContentProps {
  /** src：PDF 链接或 Base64 */
  src: string;
  /** scale：缩放比例 */
  scale: number;
  /** rotation：旋转角度 */
  rotation: number;
  /** viewerRef：预览区 DOM，用于全屏 */
  viewerRef: React.RefObject<HTMLDivElement>;
}

const PdfIframeContent: React.FC<PdfIframeContentProps> = ({
  src,
  scale,
  rotation,
  viewerRef,
}) => {
  /**
   * pdfSrc：处理后的 iframe 地址
   * buildIframePdfSrc 会在后面加 #toolbar=0 隐藏浏览器自带 PDF 工具栏
   */
  const pdfSrc = buildIframePdfSrc(src);

  if (!pdfSrc) {
    return (
      <div className="file-preview-viewer file-preview-viewer-empty">
        <Empty description="暂无 PDF，请传入 src 地址" />
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="file-preview-viewer">
      <div className="file-preview-viewer-scroll file-preview-viewer-scroll-iframe">
        {/* 对 iframe 外层 div 做 transform，实现旋转和缩放 */}
        <div
          className="file-preview-iframe-stage"
          style={buildTransformStyle(scale, rotation)}
        >
          <iframe
            title="PDF 预览"
            src={pdfSrc}
            className="file-preview-iframe"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfIframeContent;
