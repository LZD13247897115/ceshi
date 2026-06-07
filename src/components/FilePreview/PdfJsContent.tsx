/**
 * =============================================================================
 * 【文件说明】PdfJsContent.tsx —— 用 pdf.js 把 PDF 画到 Canvas
 * =============================================================================
 *
 * 实现原理（小白版）：
 *   1. pdf.js 读取 PDF 文件（支持链接和 Base64）
 *   2. 每一页 PDF 对应一个 <canvas> 画布
 *   3. pdf.js 把 PDF 内容「画」到 canvas 上
 *   4. 缩放/旋转在 pdf.js 渲染参数里控制（比 iframe 的 CSS 更准确）
 *
 * 依赖：
 *   - npm 包 pdfjs-dist
 *   - .umirc.ts 里 copy worker 文件到 /pdf.worker.min.mjs
 * =============================================================================
 */

import { Alert, Empty, Spin } from 'antd';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PDF_WORKER_URL,
  base64ToUint8Array,
  isHttpUrl,
  isPdfBase64Source,
  toPdfJsRotation,
  trimSrc,
} from './utils';

/** PdfJsContentProps —— pdf.js PDF 预览组件的参数 */
export interface PdfJsContentProps {
  src: string;
  scale: number;
  rotation: number;
  viewerRef: React.RefObject<HTMLDivElement>;
}

/** workerReady：Worker 是否已配置（全局只需配置一次） */
let workerReady = false;

/**
 * setupPdfWorker —— 告诉 pdf.js Worker 脚本在哪里
 * Worker 在后台线程解析 PDF，避免页面卡死
 */
function setupPdfWorker() {
  if (workerReady || typeof window === 'undefined') return;
  GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
  workerReady = true;
}

/**
 * destroyPdf —— 释放 PDF 文档占用的内存
 * @param doc pdf.js 返回的文档对象
 */
async function destroyPdf(doc: PDFDocumentProxy | null | undefined) {
  if (!doc) return;
  try {
    if (typeof doc.cleanup === 'function') await doc.cleanup();
    if (doc.loadingTask?.destroy) await doc.loadingTask.destroy();
  } catch {
    /* 组件卸载时忽略错误 */
  }
}

/**
 * setupCanvas —— 设置 canvas 的宽高（支持高清屏 Retina）
 * @param canvas 画布 DOM
 * @param w 逻辑宽度
 * @param h 逻辑高度
 */
function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const ratio = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
  canvas.width = Math.floor(w * ratio);
  canvas.height = Math.floor(h * ratio);
  canvas.style.width = `${Math.floor(w)}px`;
  canvas.style.height = `${Math.floor(h)}px`;
  const transform = ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined;
  return { ctx, transform };
}

/**
 * loadPdf —— 根据地址类型加载 PDF
 * @param src PDF 链接或 Base64
 * @returns pdf.js 文档对象
 */
async function loadPdf(src: string): Promise<PDFDocumentProxy> {
  setupPdfWorker();
  const trimmed = trimSrc(src);
  if (isHttpUrl(trimmed)) {
    return getDocument({ url: trimmed }).promise;
  }
  if (isPdfBase64Source(trimmed)) {
    return getDocument({ data: base64ToUint8Array(trimmed) }).promise;
  }
  throw new Error('无效的 PDF 地址');
}

/**
 * renderPage —— 把 PDF 某一页绘制到 canvas 上
 * @param doc PDF 文档
 * @param pageNum 页码（从 1 开始）
 * @param canvas 目标画布
 * @param scale 缩放
 * @param rotation 旋转角度
 */
async function renderPage(
  doc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation: number,
): Promise<RenderTask> {
  const page: PDFPageProxy = await doc.getPage(pageNum);
  const viewport = page.getViewport({
    scale,
    rotation: toPdfJsRotation(rotation),
  });
  const { ctx, transform } = setupCanvas(
    canvas,
    viewport.width,
    viewport.height,
  );
  return page.render({ canvas, canvasContext: ctx, viewport, transform });
}

/**
 * PdfPageCanvas —— 单页 PDF 对应的 canvas 组件
 * 挂载时把 canvas DOM 注册给父组件，父组件才知道往哪画
 */
const PdfPageCanvas: React.FC<{
  pageNumber: number;
  onRegister: (page: number, el: HTMLCanvasElement | null) => void;
}> = ({ pageNumber, onRegister }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    onRegister(pageNumber, ref.current);
    return () => onRegister(pageNumber, null);
  }, [pageNumber, onRegister]);

  return (
    <div className="file-preview-pdf-page">
      <div className="file-preview-pdf-page-label">第 {pageNumber} 页</div>
      <canvas ref={ref} className="file-preview-pdf-canvas" />
    </div>
  );
};

const PdfJsContent: React.FC<PdfJsContentProps> = ({
  src,
  scale,
  rotation,
  viewerRef,
}) => {
  /** pdfDoc：已加载的 PDF 文档对象 */
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  /** numPages：PDF 总页数 */
  const [numPages, setNumPages] = useState(0);
  /** loading：是否正在加载/解析 PDF */
  const [loading, setLoading] = useState(false);
  /** rendering：是否正在把 PDF 画到 canvas */
  const [rendering, setRendering] = useState(false);
  /** error：加载失败时的错误信息 */
  const [error, setError] = useState<string | null>(null);

  /** docRef：用 ref 存文档，卸载时方便释放内存 */
  const docRef = useRef<PDFDocumentProxy | null>(null);
  /** canvasMapRef：页码 → canvas DOM 的映射 */
  const canvasMapRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  /** tasksRef：正在进行的渲染任务，取消时用 */
  const tasksRef = useRef<RenderTask[]>([]);

  /**
   * registerCanvas —— 子组件 PdfPageCanvas 挂载时调用，登记 canvas
   * @param page 页码
   * @param el canvas 元素，null 表示卸载
   */
  const registerCanvas = useCallback(
    (page: number, el: HTMLCanvasElement | null) => {
      if (el) canvasMapRef.current.set(page, el);
      else canvasMapRef.current.delete(page);
    },
    [],
  );

  /** cancelRenders —— 取消所有进行中的渲染任务 */
  const cancelRenders = useCallback(() => {
    tasksRef.current.forEach((t) => {
      try {
        t.cancel();
      } catch {
        /* ignore */
      }
    });
    tasksRef.current = [];
  }, []);

  /**
   * useEffect ①：src 变化时重新加载 PDF
   * 依赖项 [src]：只有地址变了才重新加载
   */
  useEffect(() => {
    setupPdfWorker();
    const trimmed = trimSrc(src);
    if (!trimmed) {
      void destroyPdf(docRef.current);
      docRef.current = null;
      setPdfDoc(null);
      setNumPages(0);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      await destroyPdf(docRef.current);
      docRef.current = null;
      setPdfDoc(null);
      setNumPages(0);

      try {
        const doc = await loadPdf(trimmed);
        if (cancelled) {
          await destroyPdf(doc);
          return;
        }
        docRef.current = doc;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'PDF 加载失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      cancelRenders();
      void destroyPdf(docRef.current);
      docRef.current = null;
    };
  }, [src, cancelRenders]);

  /**
   * useEffect ②：文档/缩放/旋转变化时，重新渲染所有页到 canvas
   * 依赖项 [pdfDoc, numPages, scale, rotation]
   */
  useEffect(() => {
    if (!pdfDoc || numPages < 1) return undefined;

    let cancelled = false;

    const renderAll = async () => {
      cancelRenders();
      setRendering(true);
      try {
        for (let i = 1; i <= numPages; i += 1) {
          if (cancelled) break;
          const canvas = canvasMapRef.current.get(i);
          if (!canvas) continue;
          const task = await renderPage(pdfDoc, i, canvas, scale, rotation);
          if (cancelled) {
            task.cancel();
            break;
          }
          tasksRef.current.push(task);
          await task.promise;
        }
      } catch (e) {
        if (!cancelled && e instanceof Error && !e.message.includes('cancel')) {
          console.error('[PdfJsContent]', e);
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    };

    const frameId = requestAnimationFrame(() => void renderAll());
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      cancelRenders();
    };
  }, [pdfDoc, numPages, scale, rotation, cancelRenders]);

  /** pageNumbers：页码数组 [1, 2, 3, ...]，用于循环渲染每一页 */
  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages],
  );

  if (!loading && !pdfDoc && !error && !trimSrc(src)) {
    return (
      <div className="file-preview-viewer file-preview-viewer-empty">
        <Empty description="暂无 PDF，请传入 src 地址" />
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="file-preview-viewer">
      {error && (
        <Alert
          type="error"
          showIcon
          message="PDF 加载失败"
          description={error}
          className="file-preview-viewer-error"
        />
      )}
      <Spin
        spinning={loading || (rendering && numPages > 0)}
        tip={loading ? '正在解析 PDF...' : '正在渲染页面...'}
        size="large"
        wrapperClassName="file-preview-spin-wrapper"
      >
        <div className="file-preview-viewer-scroll">
          <div className="file-preview-pdf-pages">
            {pageNumbers.map((n) => (
              <PdfPageCanvas
                key={n}
                pageNumber={n}
                onRegister={registerCanvas}
              />
            ))}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default PdfJsContent;
