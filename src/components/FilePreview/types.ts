/**
 * =============================================================================
 * 【文件说明】types.ts —— 类型定义文件
 * =============================================================================
 *
 * 这个文件不写具体功能代码，只定义「类型」。
 * TypeScript 的类型就像说明书：告诉编辑器和你自己，某个变量应该是什么格式。
 *
 * 小白理解：
 *   - type  = 几种固定取值之一（像单选题）
 *   - interface = 一个对象应该有哪些字段（像表格列名）
 * =============================================================================
 */

/**
 * FilePreviewType —— 预览类型（传给 FilePreview 组件的 type 属性）
 *
 * 只有两个合法值：
 *   'fileImage' → 展示图片（jpg/png/base64 等）
 *   'filePdf'   → 展示 PDF 文件
 */
export type FilePreviewType = 'fileImage' | 'filePdf';

/**
 * PdfRenderMode —— PDF 用什么方式渲染（仅 type='filePdf' 时才有意义）
 *
 *   'pdfjs'  → 用 pdf.js 库把 PDF 画到 Canvas 上（推荐，可控性强）
 *   'iframe' → 用浏览器自带的 PDF 查看器嵌在 iframe 里（代码简单）
 */
export type PdfRenderMode = 'pdfjs' | 'iframe';

/**
 * FilePreviewProps —— FilePreview 组件接收的所有参数（props）
 *
 * 使用示例：
 *   <FilePreview type="fileImage" src="https://xxx/a.png" />
 */
export interface FilePreviewProps {
  /** type：决定预览图片还是 PDF，见 FilePreviewType */
  type: FilePreviewType;

  /**
   * src：文件地址，下面三种写法都支持
   *   1. 普通网址：https://example.com/file.pdf
   *   2. 纯 Base64 字符串（一长串字母数字）
   *   3. DataURL：data:image/png;base64,xxxx 或 data:application/pdf;base64,xxxx
   */
  src: string;

  /** pdfMode：PDF 渲染方式，不传默认 'pdfjs' */
  pdfMode?: PdfRenderMode;

  /** className：额外 CSS 类名，方便外层自定义样式 */
  className?: string;

  /** initialScale：初始缩放比例，1 表示 100%，1.2 表示 120% */
  initialScale?: number;

  /** initialRotation：初始旋转角度（度），0 表示不旋转 */
  initialRotation?: number;
}
