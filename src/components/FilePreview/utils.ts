/**
 * =============================================================================
 * 【文件说明】utils.ts —— 工具函数和常量
 * =============================================================================
 *
 * 这里放「纯函数」和「常量」，不直接写 React 组件。
 * 多个文件都会 import 这里的方法，避免重复写相同逻辑。
 * =============================================================================
 */

import type React from 'react';

// ---------------------------------------------------------------------------
// 常量：预览控件的配置（改这里可以调整放大/缩小步长、极限值等）
// ---------------------------------------------------------------------------

/** ZOOM_STEP：每次点放大/缩小按钮，缩放比例变化多少（0.1 = 10%） */
export const ZOOM_STEP = 0.1;

/** MIN_SCALE：允许的最小缩放（0.2 = 20%，再小就看不清了） */
export const MIN_SCALE = 0.2;

/** MAX_SCALE：允许的最大缩放（5 = 500%） */
export const MAX_SCALE = 5;

/** ROTATE_STEP：每次点左转/右转，旋转多少度（固定 90°） */
export const ROTATE_STEP = 90;

/**
 * PDF_WORKER_URL：pdf.js 的 Worker 脚本地址
 * Worker 是后台线程，负责解析 PDF，不阻塞页面卡顿
 * 这个文件在 .umirc.ts 里配置 copy 到项目根目录
 */
export const PDF_WORKER_URL = '/pdf.worker.min.mjs';

/** SAMPLE_PDF_BASE64：Demo 用的示例 PDF（Base64 格式，一页 Hello PDF） */
export const SAMPLE_PDF_BASE64 =
  'JVBERi0xLjQKJYGBgYEKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoKMiAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWzMgMCBSXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCjUgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQoSGVsbG8gUERGKSBUagoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA2NCAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIG4gCjAwMDAwMDAyMzggMDAwMDAgbiAKMDAwMDAwMDI5NSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjM5NQolJUVPRgo=';

/** SAMPLE_PDF_URL：Demo 用的示例 PDF 在线链接 */
export const SAMPLE_PDF_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

/** SAMPLE_IMAGE_SRC：Demo 用的示例图片（蓝色 SVG，DataURL 格式） */
export const SAMPLE_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTY3N2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5JbWFnZSBEZW1vPC90ZXh0Pjwvc3ZnPg==';

// ---------------------------------------------------------------------------
// 字符串处理
// ---------------------------------------------------------------------------

/**
 * trimSrc —— 去掉字符串首尾空格
 * @param input 原始字符串
 * @returns 去掉空格后的字符串
 */
export function trimSrc(input: string): string {
  return input.trim();
}

/**
 * isHttpUrl —— 判断是不是 http/https 开头的网址
 * @param input 要判断的字符串
 * @returns true=是网址，false=不是
 */
export function isHttpUrl(input: string): boolean {
  return /^https?:\/\//i.test(trimSrc(input));
}

/**
 * normalizeImageSrc —— 把各种图片输入统一成 <img src="..."> 能用的格式
 *
 * @param input 用户传入的图片地址（链接 / Base64 / DataURL）
 * @param defaultMime 纯 Base64 时默认按什么图片类型处理，默认 png
 * @returns 可直接给 img 使用的 src
 */
export function normalizeImageSrc(
  input: string,
  defaultMime = 'image/png',
): string {
  const trimmed = trimSrc(input);
  if (!trimmed) return '';
  // 已经是完整格式，原样返回
  if (/^data:image\//i.test(trimmed) || isHttpUrl(trimmed)) return trimmed;
  // 纯 Base64 → 拼成 data:image/png;base64,xxxx
  return `data:${defaultMime};base64,${trimmed.replace(/\s/g, '')}`;
}

/**
 * stripPdfBase64Prefix —— 去掉 PDF 的 data:application/pdf;base64, 前缀
 * pdf.js 解析时需要纯 Base64，不要前缀
 *
 * @param input 可能带前缀的 PDF Base64
 * @returns 纯 Base64 字符串
 */
export function stripPdfBase64Prefix(input: string): string {
  const trimmed = trimSrc(input);
  const match = trimmed.match(/^data:application\/pdf;base64,(.+)$/i);
  if (match) return match[1].replace(/\s/g, '');
  return trimmed.replace(/\s/g, '');
}

/**
 * normalizePdfSrc —— 把 PDF 输入统一成 iframe / 部分场景可用的地址
 *
 * @param input PDF 链接或 Base64
 * @returns 完整可用的 PDF 地址
 */
export function normalizePdfSrc(input: string): string {
  const trimmed = trimSrc(input);
  if (!trimmed) return '';
  if (/^data:application\/pdf/i.test(trimmed) || isHttpUrl(trimmed))
    return trimmed;
  return `data:application/pdf;base64,${stripPdfBase64Prefix(trimmed)}`;
}

/**
 * buildIframePdfSrc —— iframe 专用 PDF 地址（隐藏浏览器自带工具栏）
 *
 * 在地址后面加 #toolbar=0 等参数，Chrome/Edge 会隐藏 iframe 里那排 PDF 按钮
 *
 * @param input 原始 PDF 地址
 * @returns 带隐藏参数的 iframe src
 */
export function buildIframePdfSrc(input: string): string {
  const normalized = normalizePdfSrc(input);
  if (!normalized) return '';
  const [base] = normalized.split('#');
  return `${base}#toolbar=0&navpanes=0&scrollbar=0`;
}

/**
 * base64ToUint8Array —— Base64 转成二进制数组
 * pdf.js 读 Base64 格式的 PDF 时需要 Uint8Array，不能直接用字符串
 *
 * @param base64 Base64 字符串
 * @returns 二进制字节数组
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const pure = stripPdfBase64Prefix(base64);
  const binary = atob(pure); // 浏览器 API：Base64 解码
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * isPdfBase64Source —— 判断 PDF 源是不是 Base64/DataURL（而不是 http 链接）
 *
 * @param input PDF 地址
 * @returns true=Base64 类，false=链接类
 */
export function isPdfBase64Source(input: string): boolean {
  const trimmed = trimSrc(input);
  if (/^data:application\/pdf/i.test(trimmed)) return true;
  if (isHttpUrl(trimmed)) return false;
  return trimmed.length > 0;
}

/**
 * clampScale —— 把缩放比例限制在 MIN_SCALE ~ MAX_SCALE 之间
 * 防止缩太小或太大
 *
 * @param scale 当前缩放值
 * @returns 限制后的缩放值
 */
export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * normalizeRotation —— 把任意角度转成 0~359（仅用于「显示」，不用于 CSS 旋转累加）
 *
 * @param deg 角度（可以是负数或超过 360）
 * @returns 0~359 之间的角度
 */
export function normalizeRotation(deg: number): number {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

/**
 * toPdfJsRotation —— 把角度转成 pdf.js 支持的值（只能是 0/90/180/270）
 *
 * @param deg 当前累加旋转角度
 * @returns pdf.js 可用的旋转角度
 */
export function toPdfJsRotation(deg: number): number {
  const n = ((deg % 360) + 360) % 360;
  return (Math.round(n / 90) * 90) % 360;
}

/**
 * buildTransformStyle —— 生成 CSS transform 样式对象
 * 用于图片和 iframe：通过 rotate + scale 实现旋转和缩放
 *
 * 注意：rotation 用累加值（0, -90, -180…），不要 normalize，否则左转动画会绕大圈
 *
 * @param scale 缩放比例
 * @param rotation 旋转角度（累加值）
 * @returns React 的 style 对象
 */
export function buildTransformStyle(
  scale: number,
  rotation: number,
): React.CSSProperties {
  return {
    transform: `rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: 'center center', // 以中心点为旋转/缩放中心
  };
}

// ---------------------------------------------------------------------------
// 全屏 API（兼容 Chrome / Safari / 旧版 Edge）
// ---------------------------------------------------------------------------

/** 扩展 HTMLElement 类型，加上浏览器前缀方法（TypeScript 需要） */
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

/** requestFullscreen —— 让某个 DOM 元素进入全屏 */
export async function requestFullscreen(element: HTMLElement): Promise<void> {
  const el = element as FullscreenElement;
  if (el.requestFullscreen) await el.requestFullscreen();
  else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) await el.msRequestFullscreen();
}

/** exitFullscreen —— 退出全屏 */
export async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.fullscreenElement && doc.exitFullscreen) await doc.exitFullscreen();
  else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  } else if (doc.msFullscreenElement && doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}

/** isFullscreenActive —— 当前页面是否处于全屏状态 */
export function isFullscreenActive(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(
    doc.fullscreenElement ??
      doc.webkitFullscreenElement ??
      doc.msFullscreenElement,
  );
}

// ---------------------------------------------------------------------------
// 文件读取（上传本地文件时用）
// ---------------------------------------------------------------------------

/**
 * readFileAsDataUrl —— 把用户选的 File 读成 DataURL
 * 读完后可以直接给 img src 使用
 *
 * @param file 用户上传的文件对象
 * @returns Promise，成功时返回 DataURL 字符串
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(trimSrc(reader.result as string));
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * readPdfFileAsBase64 —— 把 PDF File 读成纯 Base64（不含 data: 前缀）
 *
 * @param file 用户上传的 PDF 文件
 * @returns Promise，成功时返回纯 Base64
 */
export function readPdfFileAsBase64(file: File): Promise<string> {
  return readFileAsDataUrl(file).then(stripPdfBase64Prefix);
}
