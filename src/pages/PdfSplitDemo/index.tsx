/**
 * =============================================================================
 * PdfSplitDemo —— 左 PDF 预览 + 右消息列表
 * =============================================================================
 *
 * 【路由】/pdf-split-demo（见 .umirc.ts）
 * 【访问】http://localhost:8000/pdf-split-demo
 *
 * 【全屏要点】
 *   ref 挂在包含「工具栏 + iframe」的外层 div 上再 requestFullscreen，
 *   不要只对 iframe 全屏，否则没有退出按钮且容易失败。
 * =============================================================================
 */
import { Typography } from 'antd';
import React, { useState } from 'react';
import MessageListPanel from './components/MessageListPanel';
import PdfViewerPanel from './components/PdfViewerPanel';
import { DEFAULT_PDF_SRC, messageList } from './constants';
import './index.less';

const { Title, Text } = Typography;

const PdfSplitDemo: React.FC = () => {
  const [activeMessageId, setActiveMessageId] = useState(
    messageList[0]?.id ?? '1',
  );

  return (
    <div className="pdf-split-demo-page">
      <Title level={3}>PDF 分栏预览 Demo</Title>
      <Text type="secondary">
        路由：/pdf-split-demo · 左 iframe PDF + 控件 · 右消息卡片 · 全屏已修复
      </Text>

      <div className="pdf-split-demo-layout" style={{ marginTop: 16 }}>
        <div className="pdf-split-demo-left">
          <PdfViewerPanel src={DEFAULT_PDF_SRC} />
        </div>

        <div className="pdf-split-demo-right">
          <MessageListPanel
            messages={messageList}
            activeId={activeMessageId}
            onSelect={setActiveMessageId}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfSplitDemo;
