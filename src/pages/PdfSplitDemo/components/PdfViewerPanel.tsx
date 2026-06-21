/**
 * PdfViewerPanel —— 左侧 PDF iframe 预览 + 工具栏
 *
 * 【全屏正确写法】
 *   ref 挂在「工具栏 + 预览区」的外层 shell 上，而不是只挂在 iframe 上。
 *   这样全屏后工具栏仍在，可以点退出全屏。
 */
import PreviewToolbar from '@/components/FilePreview/PreviewToolbar';
import { usePreviewControls } from '@/components/FilePreview/usePreviewControls';
import {
  buildIframePdfSrc,
  buildTransformStyle,
} from '@/components/FilePreview/utils';
import { Empty } from 'antd';
import React, { useRef } from 'react';

interface PdfViewerPanelProps {
  src: string;
}

const PdfViewerPanel: React.FC<PdfViewerPanelProps> = ({ src }) => {
  /** viewerShellRef：全屏目标 DOM，必须包含工具栏 + PDF 区域 */
  const viewerShellRef = useRef<HTMLDivElement>(null);
  const controls = usePreviewControls(1, 0);
  const pdfSrc = buildIframePdfSrc(src);

  const handleToggleFullscreen = () => {
    controls.toggleFullscreen(viewerShellRef.current);
  };

  if (!pdfSrc) {
    return (
      <div className="pdf-split-viewer-shell">
        <div className="pdf-split-viewer-scroll">
          <Empty description="暂无 PDF" />
        </div>
      </div>
    );
  }

  return (
    <div ref={viewerShellRef} className="pdf-split-viewer-shell">
      <div className="pdf-split-viewer-toolbar-wrap">
        <PreviewToolbar
          scale={controls.scale}
          rotation={controls.rotation}
          isFullscreen={controls.isFullscreen}
          onRotateLeft={controls.rotateLeft}
          onRotateRight={controls.rotateRight}
          onZoomIn={controls.zoomIn}
          onZoomOut={controls.zoomOut}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>

      <div className="pdf-split-viewer-scroll">
        <div
          className="pdf-split-iframe-stage"
          style={buildTransformStyle(controls.scale, controls.rotation)}
        >
          <iframe title="PDF 预览" src={pdfSrc} className="pdf-split-iframe" />
        </div>
      </div>
    </div>
  );
};

export default PdfViewerPanel;
