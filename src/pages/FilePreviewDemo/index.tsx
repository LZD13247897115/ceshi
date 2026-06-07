/**
 * =============================================================================
 * 【页面说明】FilePreviewDemo —— 文件预览 Demo（pdf.js 版）
 * =============================================================================
 *
 * 访问地址：http://localhost:8000/file-preview
 *
 * 这个页面做什么？
 *   演示 FilePreview 组件的用法，PDF 用 pdf.js 渲染（不用 iframe）
 *
 * 核心就一行：
 *   <FilePreview type={type} src={src} pdfMode="pdfjs" />
 *
 * type 两个值：
 *   fileImage → 图片
 *   filePdf   → PDF
 *
 * src 支持：http 链接、Base64、data:... URL
 *
 * iframe 版本请看：FilePreviewIframeDemo（/file-preview-iframe）
 * =============================================================================
 */

import type { FilePreviewType } from '@/components/FilePreview';
import FilePreview, {
  SAMPLE_IMAGE_SRC,
  SAMPLE_PDF_BASE64,
  SAMPLE_PDF_URL,
} from '@/components/FilePreview';
import {
  normalizeImageSrc,
  readFileAsDataUrl,
  readPdfFileAsBase64,
  stripPdfBase64Prefix,
} from '@/components/FilePreview/utils';
import {
  FileImageOutlined,
  FilePdfOutlined,
  LinkOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  Alert,
  Button,
  Card,
  Input,
  Radio,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import React, { useState } from 'react';
import './index.less';

const { TextArea } = Input;
const { Paragraph, Text, Title } = Typography;

const FilePreviewDemo: React.FC = () => {
  /**
   * 【状态①】type —— 当前预览类型
   * useState 是 React 存「会变化的数据」的方式
   * FilePreviewType 只能是 'fileImage' 或 'filePdf'
   */
  const [type, setType] = useState<FilePreviewType>('fileImage');

  /**
   * 【状态②】src —— 当前预览的文件地址
   * 传给 FilePreview 组件，可以是链接 / Base64 / DataURL
   */
  const [src, setSrc] = useState(SAMPLE_IMAGE_SRC);

  /**
   * 【状态③】inputDraft —— 文本框里正在输入的内容
   * 还没点「应用」按钮，不会影响到 src
   */
  const [inputDraft, setInputDraft] = useState('');

  /**
   * handleTypeChange —— 切换 fileImage / filePdf 时调用
   * @param nextType 切换后的类型
   *
   * 切换时自动加载对应示例，方便直接看效果
   */
  const handleTypeChange = (nextType: FilePreviewType) => {
    setType(nextType);
    if (nextType === 'fileImage') {
      setSrc(SAMPLE_IMAGE_SRC);
    } else {
      setSrc(SAMPLE_PDF_BASE64);
    }
    setInputDraft('');
  };

  /**
   * uploadProps —— antd Upload 组件的配置
   * beforeUpload：用户选文件后触发，这里读取文件内容写入 src
   * return Upload.LIST_IGNORE：阻止 Upload 默认上传行为（我们只做本地预览）
   */
  const uploadProps: UploadProps = {
    accept: type === 'fileImage' ? 'image/*' : '.pdf,application/pdf',
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        if (type === 'fileImage') {
          setSrc(await readFileAsDataUrl(file));
        } else {
          setSrc(await readPdfFileAsBase64(file));
        }
        setInputDraft('');
        message.success(`已加载：${file.name}`);
      } catch {
        message.error('读取失败');
      }
      return Upload.LIST_IGNORE;
    },
  };

  /**
   * applyInput —— 把文本框内容应用到 src
   * 用户粘贴链接或 Base64 后点「应用」按钮触发
   */
  const applyInput = () => {
    const raw = inputDraft.trim();
    if (!raw) {
      message.warning('请先输入链接或 Base64');
      return;
    }
    if (type === 'fileImage') {
      setSrc(normalizeImageSrc(raw));
    } else {
      setSrc(stripPdfBase64Prefix(raw));
    }
    message.success('已应用');
  };

  return (
    <div className="file-preview-demo-page">
      {/* 页面标题 */}
      <div className="file-preview-demo-page-header">
        <Title level={3} style={{ marginBottom: 4 }}>
          文件预览 Demo（pdf.js）
        </Title>
        <Text type="secondary">type 切换图片/PDF · 左转右转放大缩小全屏</Text>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="说明"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            本页 PDF 使用 <Text code>pdf.js</Text> 渲染（不用 iframe）。
            核心组件 <Text code>FilePreview</Text>，通过{' '}
            <Text code>type=&quot;fileImage&quot;</Text> 或{' '}
            <Text code>type=&quot;filePdf&quot;</Text> 切换。 iframe 版本请访问{' '}
            <Text code>/file-preview-iframe</Text>。
          </Paragraph>
        }
      />

      {/* 控制区：选类型、加载示例、上传、粘贴地址 */}
      <Card
        title="① 选择类型 & 数据源"
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>type 参数：</Text>
            <Radio.Group
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              style={{ marginLeft: 12 }}
            >
              <Radio.Button value="fileImage">fileImage（图片）</Radio.Button>
              <Radio.Button value="filePdf">filePdf（PDF）</Radio.Button>
            </Radio.Group>
          </div>

          <Space wrap>
            {type === 'fileImage' ? (
              <Button
                icon={<FileImageOutlined />}
                onClick={() => {
                  setSrc(SAMPLE_IMAGE_SRC);
                  setInputDraft('');
                  message.success('已加载示例图片');
                }}
              >
                加载示例图片
              </Button>
            ) : (
              <>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={() => {
                    setSrc(SAMPLE_PDF_BASE64);
                    setInputDraft('');
                    message.success('已加载示例 PDF（Base64）');
                  }}
                >
                  示例 PDF（Base64）
                </Button>
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => {
                    setSrc(SAMPLE_PDF_URL);
                    setInputDraft('');
                    message.success('已加载示例 PDF（链接）');
                  }}
                >
                  示例 PDF（链接）
                </Button>
              </>
            )}
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传本地文件</Button>
            </Upload>
          </Space>

          <TextArea
            rows={3}
            placeholder={
              type === 'fileImage'
                ? '粘贴图片链接 / Base64 / data:image/...'
                : '粘贴 PDF 链接 / Base64 / data:application/pdf;base64,...'
            }
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
          />
          <Button type="primary" onClick={applyInput}>
            应用上面的地址
          </Button>
          <Text type="secondary">
            当前 type = <Text code>{type}</Text>，src 长度 {src.length} 字符
          </Text>
        </Space>
      </Card>

      {/* 预览区：核心组件 */}
      <Card title="② 预览区域（带工具栏控件）" size="small">
        {/*
          【核心代码】就这一行：
          type  → 图片还是 PDF
          src   → 文件地址
          pdfMode="pdfjs" → PDF 用 pdf.js 渲染
          initialScale={1.2} → 初始放大到 120%
        */}
        <FilePreview type={type} src={src} pdfMode="pdfjs" initialScale={1.2} />
      </Card>
    </div>
  );
};

export default FilePreviewDemo;
