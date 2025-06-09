"use client";

import React from "react";
import { Modal, List, Typography } from "antd";

const { Text } = Typography;

interface Props {
  visible: boolean;
  reports: any[];
  onClose: () => void;
}

const PostReportModal: React.FC<Props> = ({ visible, reports, onClose }) => {
  return (
    <Modal
      title="Danh sách Report"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {reports && reports.length > 0 ? (
        <List
          dataSource={reports}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <Text strong>
                    {item.reporter} —{" "}
                    {new Date(item.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                }
                description={<Text>{item.reason}</Text>}
              />
            </List.Item>
          )}
        />
      ) : (
        <Text>Không có report nào.</Text>
      )}
    </Modal>
  );
};

export default PostReportModal;
