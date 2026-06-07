/**
 * =============================================================================
 * 【文件说明】PreviewToolbar.tsx —— 预览工具栏
 * =============================================================================
 *
 * 五个按钮：左转、右转、放大、缩小、全屏
 * 图标全部来自 @ant-design/icons（Ant Design 官方图标库）
 *
 * 这是一个「纯展示组件」：自己不管状态，只接收 props 和回调函数
 * =============================================================================
 */

import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import { normalizeRotation } from './utils';

const { Text } = Typography;

/** PreviewToolbarProps —— 工具栏需要的所有参数 */
export interface PreviewToolbarProps {
  /** scale：当前缩放比例，用于右侧文字显示 */
  scale: number;
  /** rotation：当前旋转角度（累加值） */
  rotation: number;
  /** isFullscreen：是否全屏中，决定全屏按钮图标和文字 */
  isFullscreen: boolean;
  /** onRotateLeft：点击左转按钮时，父组件传入的处理函数 */
  onRotateLeft: () => void;
  /** onRotateRight：点击右转按钮时调用 */
  onRotateRight: () => void;
  /** onZoomIn：点击放大按钮时调用 */
  onZoomIn: () => void;
  /** onZoomOut：点击缩小按钮时调用 */
  onZoomOut: () => void;
  /** onToggleFullscreen：点击全屏按钮时调用 */
  onToggleFullscreen: () => void;
}

const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  scale,
  rotation,
  isFullscreen,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
}) => (
  <div className="file-preview-toolbar">
    <Space wrap size="small">
      {/* Tooltip：鼠标悬停显示提示文字；Button：antd 按钮；icon：按钮里的图标 */}
      <Tooltip title="左转（逆时针 90°）">
        <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft} />
      </Tooltip>
      <Tooltip title="右转（顺时针 90°）">
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
    {/* 右侧显示当前缩放和旋转（normalizeRotation 把 -90 显示成 270） */}
    <Text type="secondary" className="file-preview-toolbar-meta">
      缩放 {Math.round(scale * 100)}% · 旋转 {normalizeRotation(rotation)}°
    </Text>
  </div>
);

export default PreviewToolbar;
