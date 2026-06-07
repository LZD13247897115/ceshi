/**
 * =============================================================================
 * 【文件说明】ImageContent.tsx —— 图片预览区域
 * =============================================================================
 *
 * 实现原理（小白版）：
 *   1. 用 <img> 标签显示图片
 *   2. 在 img 外面包一层 div，给 div 加 CSS transform 实现旋转和缩放
 *   3. 全屏时把整个预览区 div 放大到全屏
 * =============================================================================
 */

import { Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import { buildTransformStyle, normalizeImageSrc } from './utils';

/** ImageContentProps —— 图片预览组件接收的参数 */
export interface ImageContentProps {
  /** src：图片地址（链接 / Base64 / DataURL） */
  src: string;
  /** scale：缩放比例，来自工具栏 */
  scale: number;
  /** rotation：旋转角度，来自工具栏 */
  rotation: number;
  /** viewerRef：预览区 DOM 引用，全屏时需要传给浏览器 API */
  viewerRef: React.RefObject<HTMLDivElement>;
}

const ImageContent: React.FC<ImageContentProps> = ({
  src,
  scale,
  rotation,
  viewerRef,
}) => {
  /** imgError：图片是否加载失败（地址错误或格式不对时为 true） */
  const [imgError, setImgError] = useState(false);

  /** 把各种格式的 src 统一成 img 能用的地址 */
  const imageSrc = normalizeImageSrc(src);

  /** 换了一张图时，重置错误状态 */
  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  /* 没有图片地址 → 显示空状态 */
  if (!imageSrc) {
    return (
      <div className="file-preview-viewer file-preview-viewer-empty">
        <Empty description="暂无图片，请传入 src 地址" />
      </div>
    );
  }

  return (
    /* ref={viewerRef}：把这个 div 的引用存起来，全屏时用 */
    <div ref={viewerRef} className="file-preview-viewer">
      {imgError ? (
        <div className="file-preview-viewer-empty">
          <Empty description="图片加载失败，请检查 src 是否正确" />
        </div>
      ) : (
        <div className="file-preview-viewer-scroll">
          {/*
            file-preview-stage：旋转和缩放作用在这一层
            style={buildTransformStyle(...)}：动态生成 transform CSS
          */}
          <div
            className="file-preview-stage"
            style={buildTransformStyle(scale, rotation)}
          >
            <img
              src={imageSrc}
              alt="文件预览"
              className="file-preview-img"
              draggable={false}
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageContent;
