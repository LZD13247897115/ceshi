/**
 * =============================================================================
 * 【文件说明】usePreviewControls.ts —— 预览控件的状态 Hook
 * =============================================================================
 *
 * 什么是 Hook？
 *   React 里以 use 开头的函数，用来在组件里管理「会变化的数据」。
 *   这个 Hook 专门管理：缩放、旋转、全屏 三个状态 + 五个操作方法。
 *
 * 用法：
 *   const controls = usePreviewControls(1, 0);
 *   controls.zoomIn();        // 放大
 *   controls.rotateLeft();    // 左转
 *   controls.scale;           // 当前缩放值
 * =============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ROTATE_STEP,
  ZOOM_STEP,
  clampScale,
  exitFullscreen,
  isFullscreenActive,
  requestFullscreen,
} from './utils';

/**
 * usePreviewControls —— 预览工具栏的状态和方法
 *
 * @param initialScale 初始缩放，默认 1（100%）
 * @param initialRotation 初始旋转角度，默认 0
 * @returns 包含 scale/rotation/isFullscreen 和五个操作方法的对象
 */
export function usePreviewControls(initialScale = 1, initialRotation = 0) {
  /** scale：当前缩放比例，1=100%，1.5=150% */
  const [scale, setScale] = useState(initialScale);

  /**
   * rotation：当前旋转角度（累加值，可以是负数）
   * 例如：0 → 点左转 → -90 → 再左转 → -180
   * 不要 normalize 成 270，否则 CSS 动画会绕大圈
   */
  const [rotation, setRotation] = useState(initialRotation);

  /** isFullscreen：是否处于全屏模式 */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * useEffect：组件挂载后监听浏览器全屏变化
   * 用户按 Esc 退出全屏时，同步更新 isFullscreen 状态
   */
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

  /**
   * toggleFullscreen —— 切换全屏/退出全屏
   * @param container 要全屏的 DOM 节点（预览区 div）
   */
  const toggleFullscreen = useCallback(
    async (container: HTMLElement | null) => {
      if (!container) return;
      try {
        if (isFullscreenActive()) await exitFullscreen();
        else await requestFullscreen(container);
      } catch {
        /* 全屏必须由用户点击触发，失败时忽略 */
      }
    },
    [],
  );

  return {
    scale,
    rotation,
    isFullscreen,
    /** rotateLeft：逆时针转 90° */
    rotateLeft: () => setRotation((p) => p - ROTATE_STEP),
    /** rotateRight：顺时针转 90° */
    rotateRight: () => setRotation((p) => p + ROTATE_STEP),
    /** zoomIn：放大一步 */
    zoomIn: () => setScale((p) => clampScale(p + ZOOM_STEP)),
    /** zoomOut：缩小一步 */
    zoomOut: () => setScale((p) => clampScale(p - ZOOM_STEP)),
    /** toggleFullscreen：切换全屏 */
    toggleFullscreen,
  };
}
