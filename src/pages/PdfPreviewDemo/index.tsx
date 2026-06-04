/**
 * =============================================================================
 * PDF Base64 预览 Demo（单文件完整版）
 * =============================================================================
 *
 * 技术栈：React + Ant Design + Mozilla pdf.js（Canvas 渲染，无 iframe）
 *
 * 数据流：
 *   Base64 → Uint8Array → pdf.js Worker 解析 → 每页绘制到 <canvas>
 *
 * 功能：
 *   - 加载示例 / 上传 PDF / 粘贴 Base64
 *   - 上一页、下一页、左转、右转、放大、缩小、重置、全屏
 *
 * 依赖说明：
 *   - npm 包：pdfjs-dist（需在 .umirc.ts 中 copy worker 到 /pdf.worker.min.mjs）
 *   - 样式：同目录 index.less
 * =============================================================================
 */

import {
  FilePdfOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  UploadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { UploadProps } from 'antd';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  message,
  Space,
  Spin,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './index.less';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

// =============================================================================
// 1. 常量
// =============================================================================

/** 缩放步长、范围 */
const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const ROTATE_STEP = 90;

/** pdf.js Worker 地址（与 .umirc.ts copy 输出文件名一致） */
const PDF_WORKER_URL = '/pdf.worker.min.mjs';

/**
 * 演示用：一页极简 PDF 的 Base64（页面文字为 "Hello PDF"）
 * 实际项目替换为接口返回的 Base64 即可
 */
const SAMPLE_PDF_BASE64 =
  'JVBERi0xLjQKJYGBgYEKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWzMgMCBSXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCjUgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQoSGVsbG8gUERGKSBUagoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA2NCAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIG4gCjAwMDAwMDAyMzggMDAwMDAgbiAKMDAwMDAwMDI5NSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjM5NQolJUVPRgo=';

// =============================================================================
// 2. 工具函数：Base64 / 全屏
// =============================================================================

/** 去掉 data:application/pdf;base64, 前缀与空白 */
function stripBase64Prefix(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/^data:application\/pdf;base64,(.+)$/i);
  if (match) return match[1].replace(/\s/g, '');
  return trimmed.replace(/\s/g, '');
}

/** Base64 → 二进制（pdf.js 需要 Uint8Array） */
function base64ToUint8Array(base64: string): Uint8Array {
  const pure = stripBase64Prefix(base64);
  const binary = atob(pure);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** 从本地 File 读取为 Base64（无前缀） */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(stripBase64Prefix(reader.result as string));
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function normalizeRotation(deg: number): number {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

/** pdf.js 仅支持 0 / 90 / 180 / 270 */
function toPdfJsRotation(deg: number): number {
  const normalized = ((deg % 360) + 360) % 360;
  return (Math.round(normalized / 90) * 90) % 360;
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

async function requestFullscreen(element: HTMLElement): Promise<void> {
  const el = element as FullscreenElement;
  if (el.requestFullscreen) await el.requestFullscreen();
  else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) await el.msRequestFullscreen();
}

async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.fullscreenElement && doc.exitFullscreen) await doc.exitFullscreen();
  else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen)
    await doc.webkitExitFullscreen();
  else if (doc.msFullscreenElement && doc.msExitFullscreen)
    await doc.msExitFullscreen();
}

function isFullscreenActive(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(
    doc.fullscreenElement ??
      doc.webkitFullscreenElement ??
      doc.msFullscreenElement,
  );
}

// =============================================================================
// 3. pdf.js：Worker 配置、加载文档、渲染到 Canvas
// =============================================================================

let pdfWorkerConfigured = false;

/** 配置 pdf.js Worker（全局只需一次） */
function setupPdfJsWorker(): void {
  if (pdfWorkerConfigured || typeof window === 'undefined') return;
  GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
  pdfWorkerConfigured = true;
}

/** 从 Base64 加载 PDF 文档 */
async function loadPdfFromBase64(base64: string): Promise<PDFDocumentProxy> {
  setupPdfJsWorker();
  return getDocument({ data: base64ToUint8Array(base64) }).promise;
}

/**
 * 释放文档（pdf.js v6 用 cleanup + loadingTask.destroy，没有 doc.destroy）
 */
async function destroyPdfDocument(
  doc: PDFDocumentProxy | null | undefined,
): Promise<void> {
  if (!doc) return;
  try {
    if (typeof doc.cleanup === 'function') await doc.cleanup();
    if (doc.loadingTask?.destroy) await doc.loadingTask.destroy();
  } catch {
    /* 卸载时忽略 */
  }
}

/** 按视口设置 Canvas 像素（Retina 高清） */
function prepareCanvasForViewport(
  canvas: HTMLCanvasElement,
  viewportWidth: number,
  viewportHeight: number,
) {
  const outputScale = window.devicePixelRatio || 1;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('无法获取 Canvas 2D 上下文');
  canvas.width = Math.floor(viewportWidth * outputScale);
  canvas.height = Math.floor(viewportHeight * outputScale);
  canvas.style.width = `${Math.floor(viewportWidth)}px`;
  canvas.style.height = `${Math.floor(viewportHeight)}px`;
  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
  return { context, transform };
}

/** 将 PDF 某一页绘制到指定 canvas */
async function renderPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation: number,
): Promise<RenderTask> {
  const page: PDFPageProxy = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({
    scale,
    rotation: toPdfJsRotation(rotation),
  });
  const { context, transform } = prepareCanvasForViewport(
    canvas,
    viewport.width,
    viewport.height,
  );
  return page.render({ canvas, canvasContext: context, viewport, transform });
}

// =============================================================================
// 4. Hooks
// =============================================================================

/** 根据 Base64 加载 pdf 文档 */
function usePdfDocument(base64Source: string) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    const pure = stripBase64Prefix(base64Source);
    if (!pure) {
      void destroyPdfDocument(docRef.current);
      docRef.current = null;
      setDocument(null);
      setNumPages(0);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      await destroyPdfDocument(docRef.current);
      docRef.current = null;
      setDocument(null);
      setNumPages(0);

      try {
        const loadedDoc = await loadPdfFromBase64(pure);
        if (cancelled) {
          await destroyPdfDocument(loadedDoc);
          return;
        }
        docRef.current = loadedDoc;
        setDocument(loadedDoc);
        setNumPages(loadedDoc.numPages);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'PDF 解析失败');
          setDocument(null);
          setNumPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      void destroyPdfDocument(docRef.current);
      docRef.current = null;
    };
  }, [base64Source]);

  return { document, numPages, loading, error };
}

/** 缩放、旋转、全屏状态 */
function usePdfPreview(initialScale = 1.2, initialRotation = 0) {
  const [scale, setScale] = useState(initialScale);
  const [rotation, setRotation] = useState(initialRotation);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(isFullscreenActive());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('MSFullscreenChange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('MSFullscreenChange', onChange);
    };
  }, []);

  const toggleFullscreen = useCallback(
    async (container: HTMLElement | null) => {
      if (!container) return;
      try {
        if (isFullscreenActive()) await exitFullscreen();
        else await requestFullscreen(container);
      } catch {
        /* 需用户手势触发 */
      }
    },
    [],
  );

  return {
    scale,
    rotation,
    isFullscreen,
    rotateLeft: () => setRotation((p) => normalizeRotation(p - ROTATE_STEP)),
    rotateRight: () => setRotation((p) => normalizeRotation(p + ROTATE_STEP)),
    zoomIn: () => setScale((p) => clampScale(p + ZOOM_STEP)),
    zoomOut: () => setScale((p) => clampScale(p - ZOOM_STEP)),
    resetView: () => {
      setScale(initialScale);
      setRotation(initialRotation);
    },
    toggleFullscreen,
  };
}

/** 把已加载文档渲染到各页 canvas */
function usePdfPageRenderer(
  pdfDocument: PDFDocumentProxy | null,
  numPages: number,
  scale: number,
  rotation: number,
) {
  const canvasMapRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<RenderTask[]>([]);
  const [rendering, setRendering] = useState(false);

  const registerCanvas = useCallback(
    (pageNumber: number, canvas: HTMLCanvasElement | null) => {
      if (canvas) canvasMapRef.current.set(pageNumber, canvas);
      else canvasMapRef.current.delete(pageNumber);
    },
    [],
  );

  const cancelPendingRenders = useCallback(() => {
    renderTasksRef.current.forEach((task) => {
      try {
        task.cancel();
      } catch {
        /* ignore */
      }
    });
    renderTasksRef.current = [];
  }, []);

  useEffect(() => {
    if (!pdfDocument || numPages < 1) return undefined;

    let cancelled = false;

    const renderAll = async () => {
      cancelPendingRenders();
      setRendering(true);
      try {
        for (let pageNum = 1; pageNum <= numPages; pageNum += 1) {
          if (cancelled) break;
          const canvas = canvasMapRef.current.get(pageNum);
          if (!canvas) continue;
          const task = await renderPageToCanvas(
            pdfDocument,
            pageNum,
            canvas,
            scale,
            rotation,
          );
          if (cancelled) {
            task.cancel();
            break;
          }
          renderTasksRef.current.push(task);
          await task.promise;
        }
      } catch (e) {
        if (!cancelled && e instanceof Error && !e.message.includes('cancel')) {
          console.error('[PDF 渲染]', e);
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    };

    const frameId = requestAnimationFrame(() => void renderAll());
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      cancelPendingRenders();
    };
  }, [pdfDocument, numPages, scale, rotation, cancelPendingRenders]);

  return { registerCanvas, rendering };
}

// =============================================================================
// 5. 子组件：单页 Canvas / 工具栏 / 预览区
// =============================================================================

/** 单页 canvas，挂载时注册到渲染器 */
const PdfPageCanvas: React.FC<{
  pageNumber: number;
  onRegister: (page: number, el: HTMLCanvasElement | null) => void;
}> = ({ pageNumber, onRegister }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    onRegister(pageNumber, canvasRef.current);
    return () => onRegister(pageNumber, null);
  }, [pageNumber, onRegister]);

  return (
    <div className="pdf-preview-page" data-page={pageNumber}>
      <div className="pdf-preview-page-label">第 {pageNumber} 页</div>
      <canvas ref={canvasRef} className="pdf-preview-canvas" />
    </div>
  );
};

/** 工具栏：翻页、旋转、缩放、全屏 */
const PdfToolbar: React.FC<{
  scale: number;
  rotation: number;
  isFullscreen: boolean;
  currentPage: number;
  totalPages: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}> = ({
  scale,
  rotation,
  isFullscreen,
  currentPage,
  totalPages,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
  onPrevPage,
  onNextPage,
}) => (
  <div className="pdf-preview-toolbar">
    <Space wrap size="small">
      <Tooltip title="上一页">
        <Button
          icon={<LeftOutlined />}
          disabled={currentPage <= 1}
          onClick={onPrevPage}
        >
          上一页
        </Button>
      </Tooltip>
      <Tooltip title="下一页">
        <Button
          icon={<RightOutlined />}
          disabled={totalPages === 0 || currentPage >= totalPages}
          onClick={onNextPage}
        >
          下一页
        </Button>
      </Tooltip>
      <Text type="secondary">
        {totalPages > 0 ? `${currentPage} / ${totalPages}` : '— / —'}
      </Text>
      <Tooltip title="逆时针 90°">
        <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft}>
          左转
        </Button>
      </Tooltip>
      <Tooltip title="顺时针 90°">
        <Button icon={<RotateRightOutlined />} onClick={onRotateRight}>
          右转
        </Button>
      </Tooltip>
      <Tooltip title="放大">
        <Button icon={<ZoomInOutlined />} onClick={onZoomIn}>
          放大
        </Button>
      </Tooltip>
      <Tooltip title="缩小">
        <Button icon={<ZoomOutOutlined />} onClick={onZoomOut}>
          缩小
        </Button>
      </Tooltip>
      <Tooltip title="恢复默认">
        <Button icon={<ReloadOutlined />} onClick={onReset}>
          重置
        </Button>
      </Tooltip>
      <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
        <Button
          type="primary"
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? '退出全屏' : '全屏'}
        </Button>
      </Tooltip>
    </Space>
    <Text type="secondary" className="pdf-preview-toolbar-meta">
      缩放 {Math.round(scale * 100)}% · 旋转 {rotation}°
    </Text>
  </div>
);

/** 预览区：多页 canvas + 加载态 */
const PdfViewer = forwardRef<
  HTMLDivElement,
  {
    pdfDocument: PDFDocumentProxy | null;
    numPages: number;
    scale: number;
    rotation: number;
    loading?: boolean;
    error?: string | null;
    currentPage?: number;
  }
>(
  (
    {
      pdfDocument,
      numPages,
      scale,
      rotation,
      loading = false,
      error = null,
      currentPage = 1,
    },
    ref,
  ) => {
    const { registerCanvas, rendering } = usePdfPageRenderer(
      pdfDocument,
      numPages,
      scale,
      rotation,
    );
    const pageNumbers = useMemo(
      () => Array.from({ length: numPages }, (_, i) => i + 1),
      [numPages],
    );
    const showEmpty = !loading && !pdfDocument && !error;
    const showLoading = loading || (pdfDocument && rendering && numPages > 0);

    if (showEmpty) {
      return (
        <div className="pdf-preview-viewer pdf-preview-viewer-empty">
          <Empty description="暂无 PDF，请加载示例或上传文件" />
        </div>
      );
    }

    return (
      <div ref={ref} className="pdf-preview-viewer">
        {error && (
          <Alert
            type="error"
            showIcon
            message="PDF 加载失败"
            description={error}
            className="pdf-preview-viewer-error"
          />
        )}
        <Spin
          spinning={!!showLoading}
          tip={loading ? '正在解析 PDF...' : '正在渲染页面...'}
          size="large"
          wrapperClassName="pdf-preview-spin-wrapper"
        >
          <div className="pdf-preview-viewer-scroll">
            <div className="pdf-preview-pages">
              {pageNumbers.map((pageNum) => (
                <div
                  key={pageNum}
                  id={`pdf-page-${pageNum}`}
                  className={
                    pageNum === currentPage
                      ? 'pdf-preview-page-wrapper pdf-preview-page-wrapper-active'
                      : 'pdf-preview-page-wrapper'
                  }
                >
                  <PdfPageCanvas
                    pageNumber={pageNum}
                    onRegister={registerCanvas}
                  />
                </div>
              ))}
            </div>
          </div>
        </Spin>
      </div>
    );
  },
);
PdfViewer.displayName = 'PdfViewer';

// =============================================================================
// 6. 页面入口
// =============================================================================

const PdfPreviewDemo: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [base64Source, setBase64Source] = useState(SAMPLE_PDF_BASE64);
  const [inputDraft, setInputDraft] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    document: pdfDocument,
    numPages,
    loading: docLoading,
    error: docError,
  } = usePdfDocument(base64Source);

  const {
    scale,
    rotation,
    isFullscreen,
    rotateLeft,
    rotateRight,
    zoomIn,
    zoomOut,
    resetView,
    toggleFullscreen,
  } = usePdfPreview(1.2, 0);

  useEffect(() => {
    setupPdfJsWorker();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [base64Source]);

  const scrollToPage = useCallback((page: number) => {
    document
      .getElementById(`pdf-page-${page}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const uploadProps: UploadProps = {
    accept: '.pdf,application/pdf',
    showUploadList: false,
    beforeUpload: async (file) => {
      if (file.type && file.type !== 'application/pdf') {
        message.error('仅支持 PDF');
        return Upload.LIST_IGNORE;
      }
      try {
        setBase64Source(await readFileAsBase64(file));
        setInputDraft('');
        message.success(`已加载：${file.name}`);
      } catch {
        message.error('读取失败');
      }
      return Upload.LIST_IGNORE;
    },
  };

  return (
    <PageContainer
      className="pdf-preview-demo"
      ghost
      header={{ title: 'PDF Base64 预览', subTitle: '单文件 Demo' }}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="说明"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            本页所有逻辑均在 <Text code>index.tsx</Text> 单文件中。使用 pdf.js
            将 Base64 解析后绘制到 Canvas，支持旋转、缩放、翻页、全屏。
          </Paragraph>
        }
      />

      <Card title="数据源" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => {
                setBase64Source(SAMPLE_PDF_BASE64);
                setInputDraft('');
                message.success('已加载示例');
              }}
            >
              加载示例
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传 PDF</Button>
            </Upload>
          </Space>
          <TextArea
            rows={4}
            placeholder="粘贴 Base64 或 data:application/pdf;base64,..."
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
          />
          <Button
            type="primary"
            onClick={() => {
              const pure = stripBase64Prefix(inputDraft);
              if (!pure) {
                message.warning('请先粘贴 Base64');
                return;
              }
              setBase64Source(pure);
              message.success('已应用');
            }}
          >
            应用 Base64
          </Button>
          <Text type="secondary">
            Base64 长度 {base64Source.length}
            {numPages > 0 ? ` · 共 ${numPages} 页` : ''}
          </Text>
        </Space>
      </Card>

      <Card title="预览" size="small">
        <PdfToolbar
          scale={scale}
          rotation={rotation}
          isFullscreen={isFullscreen}
          currentPage={currentPage}
          totalPages={numPages}
          onRotateLeft={rotateLeft}
          onRotateRight={rotateRight}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onToggleFullscreen={() => toggleFullscreen(viewerRef.current)}
          onPrevPage={() => {
            const p = Math.max(1, currentPage - 1);
            setCurrentPage(p);
            scrollToPage(p);
          }}
          onNextPage={() => {
            const p = Math.min(numPages || 1, currentPage + 1);
            setCurrentPage(p);
            scrollToPage(p);
          }}
        />
        <PdfViewer
          ref={viewerRef}
          pdfDocument={pdfDocument}
          numPages={numPages}
          scale={scale}
          rotation={rotation}
          loading={docLoading}
          error={docError}
          currentPage={currentPage}
        />
      </Card>
    </PageContainer>
  );
};

export default PdfPreviewDemo;
