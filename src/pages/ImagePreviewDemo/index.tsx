/**
 * =============================================================================
 * 图片 Base64 / DataURL 预览 Demo（单文件完整版）
 * =============================================================================
 *
 * 技术栈：React + Ant Design + CSS transform（无需第三方图片库）
 *
 * 数据流：
 *   Base64 / DataURL / 上传文件 → <img src> → 外层 transform 控制缩放与旋转
 *
 * 功能：
 *   - 加载示例图 / 上传图片 / 粘贴 Base64 或 data:image/... URL
 *   - 左转、右转、放大、缩小、重置、全屏
 *
 * 样式：同目录 index.less
 * =============================================================================
 */

import {
  FileImageOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
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
  Space,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.less';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

// =============================================================================
// 1. 常量
// =============================================================================

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 5;
const ROTATE_STEP = 90;
const INITIAL_SCALE = 1;

/**
 * 演示用示例图（SVG，320×200，蓝底白字 "Image Demo"）
 * 实际项目可换成接口返回的 Base64 或图片 URL
 */
const SAMPLE_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTY3N2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5JbWFnZSBEZW1vPC90ZXh0Pjwvc3ZnPg==';

const ACCEPT_IMAGE = '.png,.jpg,.jpeg,.gif,.webp,.svg,image/*';

// =============================================================================
// 2. 工具函数
// =============================================================================

/**
 * 规范化图片地址：
 * - 已是 data:image/... 或 http(s) URL → 原样返回（去首尾空白）
 * - 纯 Base64 → 默认按 png 拼成 DataURL
 */
function normalizeImageSrc(input: string, defaultMime = 'image/png'): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^data:image\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const pure = trimmed.replace(/\s/g, '');
  return `data:${defaultMime};base64,${pure}`;
}

/** 从 File 读取为完整 DataURL（可直接给 img src） */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).trim());
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

/** 生成图片容器的 transform 样式 */
function buildImageTransformStyle(
  scale: number,
  rotation: number,
): React.CSSProperties {
  return {
    transform: `rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: 'center center',
    transition: 'transform 0.2s ease',
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
// 3. Hook：缩放 / 旋转 / 全屏
// =============================================================================

function useImagePreview(initialScale = INITIAL_SCALE, initialRotation = 0) {
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
        /* 需用户点击触发 */
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

// =============================================================================
// 4. 子组件：工具栏 / 预览区
// =============================================================================

const ImageToolbar: React.FC<{
  scale: number;
  rotation: number;
  isFullscreen: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}> = ({
  scale,
  rotation,
  isFullscreen,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
}) => (
  <div className="image-preview-toolbar">
    <Space wrap size="small">
      <Tooltip title="逆时针旋转 90°">
        <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft}>
          左转
        </Button>
      </Tooltip>
      <Tooltip title="顺时针旋转 90°">
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
      <Tooltip title="恢复默认缩放与角度">
        <Button icon={<ReloadOutlined />} onClick={onReset}>
          重置
        </Button>
      </Tooltip>
      <Tooltip title={isFullscreen ? '退出全屏' : '全屏预览'}>
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
    <Text type="secondary" className="image-preview-toolbar-meta">
      缩放 {Math.round(scale * 100)}% · 旋转 {rotation}°
    </Text>
  </div>
);

const ImageViewer: React.FC<{
  imageSrc: string;
  scale: number;
  rotation: number;
  viewerRef: React.RefObject<HTMLDivElement>;
}> = ({ imageSrc, scale, rotation, viewerRef }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  if (!imageSrc) {
    return (
      <div className="image-preview-viewer image-preview-viewer-empty">
        <Empty description="暂无图片，请加载示例或上传文件" />
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="image-preview-viewer">
      {imgError ? (
        <div className="image-preview-viewer-empty">
          <Empty description="图片加载失败，请检查 Base64 或文件格式" />
        </div>
      ) : (
        <div className="image-preview-viewer-scroll">
          {/* 舞台层：transform 作用在此，img 保持原始分辨率 */}
          <div
            className="image-preview-stage"
            style={buildImageTransformStyle(scale, rotation)}
          >
            <img
              src={imageSrc}
              alt="预览"
              className="image-preview-img"
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
// 5. 页面入口
// =============================================================================

const ImagePreviewDemo: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);

  /** 可直接用于 img src 的地址（DataURL 或 http URL） */
  const [imageSrc, setImageSrc] = useState(SAMPLE_IMAGE_SRC);
  const [inputDraft, setInputDraft] = useState('');

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
  } = useImagePreview(INITIAL_SCALE, 0);

  const uploadProps: UploadProps = {
    accept: ACCEPT_IMAGE,
    showUploadList: false,
    beforeUpload: async (file) => {
      const isImage =
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
      if (!isImage) {
        message.error('仅支持图片文件');
        return Upload.LIST_IGNORE;
      }
      try {
        setImageSrc(await readFileAsDataUrl(file));
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
      className="image-preview-demo"
      ghost
      header={{ title: '图片预览', subTitle: '放大 · 旋转 · 全屏' }}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="实现说明"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            使用 <Text code>&lt;img&gt;</Text> 展示图片，通过外层{' '}
            <Text code>transform: rotate() scale()</Text>{' '}
            实现旋转与缩放；全屏作用于预览容器，按 Esc 退出。支持 Base64、
            <Text code>data:image/...</Text> 及上传本地图片。
          </Paragraph>
        }
      />

      <Card title="数据源" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Button
              icon={<FileImageOutlined />}
              onClick={() => {
                setImageSrc(SAMPLE_IMAGE_SRC);
                setInputDraft('');
                message.success('已加载示例图片');
              }}
            >
              加载示例图
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Space>
          <TextArea
            rows={4}
            placeholder="粘贴 data:image/...;base64,... 或纯 Base64 后点击「应用」"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
          />
          <Button
            type="primary"
            onClick={() => {
              const src = normalizeImageSrc(inputDraft);
              if (!src) {
                message.warning('请先粘贴图片数据');
                return;
              }
              setImageSrc(src);
              message.success('已应用图片');
            }}
          >
            应用
          </Button>
          <Text type="secondary" ellipsis style={{ maxWidth: '100%' }}>
            当前地址长度：{imageSrc.length} 字符
          </Text>
        </Space>
      </Card>

      <Card title="预览" size="small">
        <ImageToolbar
          scale={scale}
          rotation={rotation}
          isFullscreen={isFullscreen}
          onRotateLeft={rotateLeft}
          onRotateRight={rotateRight}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onToggleFullscreen={() => toggleFullscreen(viewerRef.current)}
        />
        <ImageViewer
          imageSrc={imageSrc}
          scale={scale}
          rotation={rotation}
          viewerRef={viewerRef}
        />
      </Card>
    </PageContainer>
  );
};

export default ImagePreviewDemo;
