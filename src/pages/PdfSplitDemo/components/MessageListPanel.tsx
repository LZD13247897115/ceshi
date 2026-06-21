import { Card, Typography } from 'antd';
import React from 'react';
import type { MessageItem } from '../constants';

const { Text, Paragraph } = Typography;

interface MessageListPanelProps {
  messages: MessageItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * MessageListPanel —— 右侧消息卡片列表 + 选中项详情
 */
const MessageListPanel: React.FC<MessageListPanelProps> = ({
  messages,
  activeId,
  onSelect,
}) => {
  const activeItem =
    messages.find((item) => item.id === activeId) ?? messages[0];

  return (
    <>
      <Card title="消息列表" size="small" className="pdf-split-message-list">
        {messages.map((item) => (
          <Card
            key={item.id}
            size="small"
            className={`pdf-split-message-card${
              item.id === activeId ? ' active' : ''
            }`}
            onClick={() => onSelect(item.id)}
          >
            <Text strong>{item.title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.time}
            </Text>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0, marginTop: 8 }}
            >
              {item.summary}
            </Paragraph>
          </Card>
        ))}
      </Card>

      {activeItem && (
        <Card title="详情" size="small" className="pdf-split-message-detail">
          <Text strong>{activeItem.title}</Text>
          <Paragraph type="secondary" style={{ fontSize: 12 }}>
            {activeItem.time}
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            {activeItem.content}
          </Paragraph>
        </Card>
      )}
    </>
  );
};

export default MessageListPanel;
