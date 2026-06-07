/**
 * =============================================================================
 * 【单文件版】文件预览 Demo —— iframe（图片 + PDF 全在一个文件里）
 * =============================================================================
 *
 * 访问地址：http://localhost:8000/file-preview-single-iframe
 *
 * 和 pdf.js 单文件版功能相同，区别：
 *   PDF 用 <iframe> 嵌入，依赖浏览器内置 PDF 查看器
 *   地址后加 #toolbar=0 尽量隐藏浏览器自带工具栏
 *
 * 技术：React + antd（无 pro-components），不用 pdf.js
 *
 * 核心参数：
 *   type = 'fileImage' → 图片
 *   type = 'filePdf'   → PDF（iframe 方式）
 *   src  = 链接 / Base64 / data:... URL
 * =============================================================================
 */

import {
  FileImageOutlined,
  FilePdfOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LinkOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  UploadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Radio,
  Space,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const { TextArea } = Input;
const { Paragraph, Text, Title } = Typography;

// =============================================================================
// 一、类型
// =============================================================================

type FilePreviewType = 'fileImage' | 'filePdf';

// =============================================================================
// 二、常量
// =============================================================================

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 5;
const ROTATE_STEP = 90;

const SAMPLE_PDF_BASE64 =
  'JVBERi0xLjQKJYGBgYEKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWzMgMCBSXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCjUgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQoSGVsbG8gUERGKSBUagoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA2NCAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIG4gCjAwMDAwMDAyMzggMDAwMDAgbiAKMDAwMDAwMDI5NSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjM5NQolJUVPRgo=';

const SAMPLE_PDF_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

const SAMPLE_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTY3N2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5JbWFnZSBEZW1vPC90ZXh0Pjwvc3ZnPg==';

// =============================================================================
// 三、工具函数
// =============================================================================

function trimSrc(input: string) {
  return input.trim();
}

function isHttpUrl(input: string) {
  return /^https?:\/\//i.test(trimSrc(input));
}

/** 图片地址规范化 → 给 img 用 */
function normalizeImageSrc(input: string, defaultMime = 'image/png') {
  const trimmed = trimSrc(input);
  if (!trimmed) return '';
  if (/^data:image\//i.test(trimmed) || isHttpUrl(trimmed)) return trimmed;
  return `data:${defaultMime};base64,${trimmed.replace(/\s/g, '')}`;
}

function stripPdfBase64Prefix(input: string) {
  const trimmed = trimSrc(input);
  const match = trimmed.match(/^data:application\/pdf;base64,(.+)$/i);
  if (match) return match[1].replace(/\s/g, '');
  return trimmed.replace(/\s/g, '');
}

/** PDF 地址规范化 → 给 iframe 用 */
function normalizePdfSrc(input: string) {
  const trimmed = trimSrc(input);
  if (!trimmed) return '';
  if (/^data:application\/pdf/i.test(trimmed) || isHttpUrl(trimmed)) return trimmed;
  return `data:application/pdf;base64,${stripPdfBase64Prefix(trimmed)}`;
}

/**
 * iframe 专用：追加 #toolbar=0 隐藏浏览器 PDF 工具栏
 * Chrome/Edge 有效；Firefox 可能仍显示，可换 pdf.js 单文件版
 */
function buildIframePdfSrc(input: string) {
  const normalized = normalizePdfSrc(input);
  if (!normalized) return '';
  const [base] = normalized.split('#');
  return `${base}#toolbar=0&navpanes=0&scrollbar=0`;
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function normalizeRotation(deg: number) {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

/** 图片和 iframe 的旋转缩放：CSS transform */
function buildTransformStyle(scale: number, rotation: number): React.CSSProperties {
  return {
    transform: `rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: 'center center',
  };
}

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};
type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

async function requestFullscreen(element: HTMLElement) {
  const el = element as FullscreenElement;
  if (el.requestFullscreen) await el.requestFullscreen();
  else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) await el.msRequestFullscreen();
}

async function exitFullscreen() {
  const doc = document as FullscreenDocument;
  if (doc.fullscreenElement && doc.exitFullscreen) await doc.exitFullscreen();
  else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  } else if (doc.msFullscreenElement && doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}

function isFullscreenActive() {
  const doc = document as FullscreenDocument;
  return Boolean(
    doc.fullscreenElement ??
      doc.webkitFullscreenElement ??
      doc.msFullscreenElement,
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(trimSrc(reader.result as string));
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function readPdfFileAsBase64(file: File) {
  return readFileAsDataUrl(file).then(stripPdfBase64Prefix);
}

// =============================================================================
// 四、Hook：工具栏
// =============================================================================

function usePreviewControls(initialScale = 1, initialRotation = 0) {
  const [scale, setScale] = useState(initialScale);
  const [rotation, setRotation] = useState(initialRotation);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(isFullscreenActive());
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    document.addEventListener('MSFullscreenChange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
      document.removeEventListener('MSFullscreenChange', sync);
    };
  }, []);

  const toggleFullscreen = useCallback(async (container: HTMLElement | null) => {
    if (!container) return;
    try {
      if (isFullscreenActive()) await exitFullscreen();
      else await requestFullscreen(container);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    scale,
    rotation,
    isFullscreen,
    rotateLeft: () => setRotation((p) => p - ROTATE_STEP),
    rotateRight: () => setRotation((p) => p + ROTATE_STEP),
    zoomIn: () => setScale((p) => clampScale(p + ZOOM_STEP)),
    zoomOut: () => setScale((p) => clampScale(p - ZOOM_STEP)),
    toggleFullscreen,
  };
}

// =============================================================================
// 五、工具栏 UI
// =============================================================================

const PreviewToolbar: React.FC<{
  scale: number;
  rotation: number;
  isFullscreen: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
}> = ({
  scale,
  rotation,
  isFullscreen,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
}) => (
  <div className="fp-single-toolbar">
    <Space wrap size="small">
      <Tooltip title="左转">
        <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft} />
      </Tooltip>
      <Tooltip title="右转">
        <Button icon={<RotateRightOutlined />} onClick={onRotateRight} />
      </Tooltip>
      <Tooltip title="放大">
        <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
      </Tooltip>
      <Tooltip title="缩小">
        <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
      </Tooltip>
      <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
        <Button
          type="primary"
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={onToggleFullscreen}
        />
      </Tooltip>
    </Space>
    <Text type="secondary">
      缩放 {Math.round(scale * 100)}% · 旋转 {normalizeRotation(rotation)}°
    </Text>
  </div>
);

// =============================================================================
// 六、图片预览
// =============================================================================

const ImagePreview: React.FC<{
  src: string;
  scale: number;
  rotation: number;
  viewerRef: React.RefObject<HTMLDivElement>;
}> = ({ src, scale, rotation, viewerRef }) => {
  const [imgError, setImgError] = useState(false);
  const imageSrc = normalizeImageSrc(src);

  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  if (!imageSrc) {
    return (
      <div className="fp-single-viewer fp-single-empty">
        <Empty description="暂无图片" />
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="fp-single-viewer">
      {imgError ? (
        <div className="fp-single-empty">
          <Empty description="图片加载失败" />
        </div>
      ) : (
        <div className="fp-single-scroll fp-single-scroll-center">
          <div className="fp-single-stage" style={buildTransformStyle(scale, rotation)}>
            <img
              src={imageSrc}
              alt="预览"
              className="fp-single-img"
              draggable={false}
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 七、iframe PDF 预览
// =============================================================================

const PdfIframePreview: React.FC<{
  src: string;
  scale: number;
  rotation: number;
  viewerRef: React.RefObject<HTMLDivElement>;
}> = ({ src, scale, rotation, viewerRef }) => {
  const pdfSrc = buildIframePdfSrc(src);

  if (!pdfSrc) {
    return (
      <div className="fp-single-viewer fp-single-empty">
        <Empty description="暂无 PDF" />
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="fp-single-viewer">
      <div className="fp-single-scroll fp-single-scroll-center">
        {/* 旋转缩放作用在 iframe 外层 div，因为改不了 iframe 内部 */}
        <div
          className="fp-single-iframe-stage"
          style={buildTransformStyle(scale, rotation)}
        >
          <iframe title="PDF 预览" src={pdfSrc} className="fp-single-iframe" />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 八、预览总组件
// =============================================================================

const FilePreviewBlock: React.FC<{
  type: FilePreviewType;
  src: string;
}> = ({ type, src }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const controls = usePreviewControls(1, 0);

  return (
    <div className="fp-single-wrap">
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
      {type === 'fileImage' ? (
        <ImagePreview
          src={src}
          scale={controls.scale}
          rotation={controls.rotation}
          viewerRef={viewerRef}
        />
      ) : (
        <PdfIframePreview
          src={src}
          scale={controls.scale}
          rotation={controls.rotation}
          viewerRef={viewerRef}
        />
      )}
    </div>
  );
};

// =============================================================================
// 九、页面入口
// =============================================================================

const FilePreviewAllInOneIframe: React.FC = () => {
  /** type：'fileImage' 看图片，'filePdf' 看 PDF（本页用 iframe） */
  const [type, setType] = useState<FilePreviewType>('filePdf');

  /** src：文件地址 */
  const [src, setSrc] = useState(SAMPLE_PDF_BASE64);

  /** inputDraft：文本框草稿 */
  const [inputDraft, setInputDraft] = useState('');

  const handleTypeChange = (next: FilePreviewType) => {
    setType(next);
    setSrc(next === 'fileImage' ? SAMPLE_IMAGE_SRC : SAMPLE_PDF_BASE64);
    setInputDraft('');
  };

  const uploadProps: UploadProps = {
    accept: type === 'fileImage' ? 'image/*' : '.pdf,application/pdf',
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        setSrc(
          type === 'fileImage'
            ? await readFileAsDataUrl(file)
            : await readPdfFileAsBase64(file),
        );
        setInputDraft('');
        message.success(`已加载：${file.name}`);
      } catch {
        message.error('读取失败');
      }
      return Upload.LIST_IGNORE;
    },
  };

  const applyInput = () => {
    const raw = inputDraft.trim();
    if (!raw) {
      message.warning('请先输入');
      return;
    }
    setSrc(type === 'fileImage' ? normalizeImageSrc(raw) : stripPdfBase64Prefix(raw));
    message.success('已应用');
  };

  return (
    <>
      <style>{PAGE_STYLES}</style>

      <div className="fp-single-page">
        <Title level={3}>文件预览（单文件 iframe 版）</Title>
        <Text type="secondary">
          全部代码在本文件 · 访问 /file-preview-single-iframe · 无 pro-components
        </Text>

        <Alert
          type="info"
          showIcon
          style={{ margin: '16px 0' }}
          message="说明"
          description={
            <Paragraph style={{ marginBottom: 0 }}>
              PDF 用 <Text code>&lt;iframe&gt;</Text> 嵌入。
              pdf.js 单文件版见 <Text code>/file-preview-single-pdfjs</Text>。
            </Paragraph>
          }
        />

        <Card title="数据源" size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Radio.Group value={type} onChange={(e) => handleTypeChange(e.target.value)}>
              <Radio.Button value="fileImage">fileImage（图片）</Radio.Button>
              <Radio.Button value="filePdf">filePdf（PDF）</Radio.Button>
            </Radio.Group>
            <Space wrap>
              {type === 'fileImage' ? (
                <Button icon={<FileImageOutlined />} onClick={() => setSrc(SAMPLE_IMAGE_SRC)}>
                  示例图片
                </Button>
              ) : (
                <>
                  <Button icon={<FilePdfOutlined />} onClick={() => setSrc(SAMPLE_PDF_BASE64)}>
                    示例 PDF（Base64）
                  </Button>
                  <Button icon={<LinkOutlined />} onClick={() => setSrc(SAMPLE_PDF_URL)}>
                    示例 PDF（链接）
                  </Button>
                </>
              )}
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
            </Space>
            <TextArea
              rows={3}
              placeholder="粘贴链接或 Base64"
              value={inputDraft}
              onChange={(e) => setInputDraft(e.target.value)}
            />
            <Button type="primary" onClick={applyInput}>
              应用
            </Button>
          </Space>
        </Card>

        <Card title="预览（左转/右转/放大/缩小/全屏）" size="small">
          <FilePreviewBlock type={type} src={src} />
        </Card>
      </div>
    </>
  );
};

export default FilePreviewAllInOneIframe;

// =============================================================================
// 十、样式
// =============================================================================

const PAGE_STYLES = `
.fp-single-page { padding: 24px; background: #fff; min-height: 100%; }
.fp-single-wrap { width: 100%; }
.fp-single-toolbar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 16px; padding: 12px 16px;
  background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px;
}
.fp-single-viewer {
  position: relative; min-height: 480px; background: #525659;
  border-radius: 8px; overflow: hidden;
}
.fp-single-empty {
  display: flex; align-items: center; justify-content: center;
  min-height: 480px; background: #fafafa; border: 1px dashed #d9d9d9;
}
.fp-single-scroll {
  width: 100%; height: 70vh; min-height: 480px; overflow: auto; padding: 24px;
}
.fp-single-scroll-center {
  display: flex; align-items: center; justify-content: center;
}
.fp-single-stage {
  display: inline-flex; background: #fff; border-radius: 4px; padding: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
.fp-single-img {
  display: block; max-width: min(90vw, 960px); max-height: min(70vh, 720px);
  user-select: none;
}
.fp-single-iframe-stage {
  width: min(900px, 95%); height: min(70vh, 800px);
}
.fp-single-iframe {
  width: 100%; height: 100%; border: none; background: #fff;
  border-radius: 4px; box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
.fp-single-viewer:fullscreen .fp-single-scroll { height: 100vh; min-height: 100%; }
`;
