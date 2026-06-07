/**
 * =============================================================================
 * 【页面说明】FilePreviewIframeDemo —— 文件预览 Demo（iframe 版）
 * =============================================================================
 *
 * 访问地址：http://localhost:8000/file-preview-iframe
 *
 * 和 pdf.js 版的区别：
 *   本页 pdfMode="iframe" → PDF 嵌在 <iframe> 里，靠浏览器自带查看器
 *   另一页 /file-preview → PDF 用 pdf.js 画到 Canvas
 *
 * 其余用法完全一样：type 切换图片/PDF，src 传地址
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

const FilePreviewIframeDemo: React.FC = () => {
  /** type：'fileImage'=图片，'filePdf'=PDF */
  const [type, setType] = useState<FilePreviewType>('filePdf');

  /** src：传给 FilePreview 的文件地址 */
  const [src, setSrc] = useState(SAMPLE_PDF_BASE64);

  /** inputDraft：文本框草稿，点「应用」后才写入 src */
  const [inputDraft, setInputDraft] = useState('');

  /** handleTypeChange：切换类型时换示例数据 */
  const handleTypeChange = (nextType: FilePreviewType) => {
    setType(nextType);
    setSrc(nextType === 'fileImage' ? SAMPLE_IMAGE_SRC : SAMPLE_PDF_BASE64);
    setInputDraft('');
  };

  /** uploadProps：上传本地文件的配置 */
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

  /** applyInput：应用文本框里的地址 */
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
      <div className="file-preview-demo-page-header">
        <Title level={3} style={{ marginBottom: 4 }}>
          文件预览 Demo（iframe）
        </Title>
        <Text type="secondary">PDF 用 iframe 嵌入 · 图片同样支持</Text>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="说明"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            本页 PDF 使用 <Text code>&lt;iframe&gt;</Text> 展示。
            已尽量隐藏浏览器自带工具栏（#toolbar=0）。 pdf.js 版本请访问{' '}
            <Text code>/file-preview</Text>。
          </Paragraph>
        }
      />

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
                  }}
                >
                  示例 PDF（Base64）
                </Button>
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => {
                    setSrc(SAMPLE_PDF_URL);
                    setInputDraft('');
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
            placeholder="粘贴链接或 Base64"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
          />
          <Button type="primary" onClick={applyInput}>
            应用上面的地址
          </Button>
        </Space>
      </Card>

      <Card title="② 预览区域" size="small">
        {/*
          pdfMode="iframe" → PDF 走 iframe 方案
          图片时 pdfMode 无影响，只看 type
        */}
        <FilePreview type={type} src={src} pdfMode="iframe" />
      </Card>
    </div>
  );
};

export default FilePreviewIframeDemo;
