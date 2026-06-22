/**
 * DatePicker 回填 —— 最简版（单文件学完）
 *
 * 访问：http://localhost:8000/date-picker
 *
 * 就三步：
 *   1. 接口返回 string  "2026-02-13"
 *   2. moment 解析 → 转 dayjs → form.setFieldsValue 回填
 *   3. 提交时 .format('YYYY-MM-DD') 转回 string
 */
import { Button, DatePicker, Form, Spin, Typography, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const DATE_FORMAT = 'YYYY-MM-DD';

/** 模拟接口：返回 string 日期 */
function fetchDetail(): Promise<{ eventDate: string }> {
  return Promise.resolve({ eventDate: '2026-02-13' });
}

/** 接口 string → DatePicker 需要的 dayjs */
function toPickerValue(dateStr: string): Dayjs {
  return dayjs(moment(dateStr, DATE_FORMAT).format(DATE_FORMAT));
}

const DatePickerDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail().then((data) => {
      // 回填：string 不能直接给 DatePicker，要先转成 dayjs
      form.setFieldsValue({
        eventDate: toPickerValue(data.eventDate),
      });
      setLoading(false);
    });
  }, [form]);

  const onFinish = (values: { eventDate: Dayjs }) => {
    // 提交：dayjs 转回接口要的 string
    const eventDate = moment(values.eventDate.toDate()).format(DATE_FORMAT);
    message.success(`提交给接口：${eventDate}`);
    console.log({ eventDate });
  };

  return (
    <Spin spinning={loading}>
      <Typography.Title level={4}>DatePicker 回填（最简）</Typography.Title>
      <Typography.Paragraph type="secondary">
        接口返回 &quot;2026-02-13&quot;，加载后自动回填到下面日期框
      </Typography.Paragraph>

      <Form form={form} onFinish={onFinish} style={{ maxWidth: 320 }}>
        <Form.Item label="活动日期" name="eventDate">
          <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form>
    </Spin>
  );
};

export default DatePickerDemo;
