import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Modal,
  Descriptions,
  Button,
  Space,
  Typography,
} from "antd";
import Image from "next/image";
const { Text } = Typography;

interface Service {
  name: string;
  price: number; // đơn giá
  unit: string; // "đ/người" | "đ/phòng"
  amount: number; // đã tính sẵn
}

interface Invoice {
  _id: string;
  roomId: string;
  year: number;
  month: number;
  water: { pre: number; after: number };
  elec: { pre: number; after: number };
  services: Service[]; // các dịch vụ ngoài điện nước
  totalMembers: number;
  totalAmount: number;
  images: string[];
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
}

interface RoomDetailInvoicesProps {
  allInvoice: Invoice[]; // mảng invoices của phòng
  roomPrice: number; // giá thuê căn bản của phòng
  isOwner: boolean; // true nếu user là chủ
  onStatusUpdate: (id: string, status: Invoice["status"]) => void;
  // hàm gọi API khi đổi status
}

export default function RoomInvoicesTable({
  allInvoice,
  roomPrice,
  isOwner,
  onStatusUpdate,
}: RoomDetailInvoicesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Khi user click 1 hàng
  const handleRowClick = (record: Invoice) => {
    setSelectedInvoice(record);
    setModalVisible(true);
  };

  // Khi user thay đổi status nếu là owner
  const handleStatusChange = (id: string, newStatus: Invoice["status"]) => {
    onStatusUpdate?.(id, newStatus);
  };

  // Format "Tháng/Năm" từ month, year
  const renderMonthYear = (value: any, record: Invoice) => {
    return `${String(record.month).padStart(2, "0")}/${record.year}`;
  };

  // Render cột Tình trạng
  const renderStatus = (_: any, record: Invoice) => {
    let color = "red";
    if (record.status === "PAID") color = "green";
    else if (record.status === "PARTIALLY_PAID") color = "orange";
    else if (record.status === "CANCELLED") color = "gray";
    return (
      <Tag color={color}>
        {record.status === "UNPAID" ? "Chưa đóng" : "Đã đóng"}
      </Tag>
    );
  };

  return (
    <>
      <Card title="💰 Hóa đơn tiền phòng">
        <Table<Invoice>
          dataSource={allInvoice}
          rowKey="_id"
          size="small"
          pagination={false}
        >
          <Table.Column
            title="Tháng/Năm"
            dataIndex="month"
            key="monthYear"
            render={renderMonthYear}
          />
          <Table.Column
            title="Tổng tiền trọ"
            dataIndex="totalAmount"
            key="totalAmount"
            render={(val: number) => <Text>{val.toLocaleString()} đ</Text>}
          />
          <Table.Column
            title="Tình trạng"
            dataIndex="status"
            key="status"
            render={renderStatus}
          />
          <Table.Column
            key="details"
            render={(_: any, record: Invoice) => (
              <Button type="link" onClick={() => handleRowClick(record)}>
                Xem chi tiết
              </Button>
            )}
          />
          {isOwner && (
            <Table.Column
              title="Xác nhận"
              key="verify"
              render={(_: any, record: Invoice) =>
                record.status === "PAID" ? (
                  <Button
                    size="small"
                    className="!text-xs"
                    onClick={() => handleStatusChange(record._id, "UNPAID")}
                  >
                    Chưa đóng tiền
                  </Button>
                ) : (
                  <Button
                    size="small"
                    className="!text-xs"
                    onClick={() => handleStatusChange(record._id, "PAID")}
                  >
                    Đã đóng tiền
                  </Button>
                )
              }
            />
          )}
        </Table>
      </Card>

      <Modal
        title="Chi tiết hóa đơn"
        visible={modalVisible}
        footer={<Button onClick={() => setModalVisible(false)}>Đóng</Button>}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        {selectedInvoice && (
          <Descriptions
            column={1}
            bordered
            size="small"
            title={`Hóa đơn tháng ${String(selectedInvoice.month).padStart(
              2,
              "0"
            )}/${selectedInvoice.year}`}
          >
            <Descriptions.Item label="Giá thuê căn bản">
              {roomPrice.toLocaleString()} đ
            </Descriptions.Item>

            <Descriptions.Item label="Điện (số tiêu thụ)">
              {selectedInvoice.elec.after - selectedInvoice.elec.pre} (
              {selectedInvoice.elec.pre} - {selectedInvoice.elec.after})
            </Descriptions.Item>

            <Descriptions.Item label="Nước (số tiêu thụ)">
              {selectedInvoice.water.after - selectedInvoice.water.pre} (
              {selectedInvoice.water.pre} - {selectedInvoice.water.after})
            </Descriptions.Item>

            {selectedInvoice.services.length > 0 && (
              <Descriptions.Item label="Dịch vụ khác">
                {selectedInvoice.services.map((s, idx) => (
                  <div key={idx}>
                    {s.name}: {s.amount.toLocaleString()}đ (
                    {s.unit === "đ/người"
                      ? `đơn giá ${s.price.toLocaleString()}đ×${
                          selectedInvoice.totalMembers
                        }người`
                      : `đơn giá ${s.price.toLocaleString()}`}
                    )
                  </div>
                ))}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Tổng cộng">
              <Text strong>
                {selectedInvoice.totalAmount.toLocaleString()} đ
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Tình trạng">
              <Tag
                color={
                  selectedInvoice.status === "PAID"
                    ? "green"
                    : selectedInvoice.status === "PARTIALLY_PAID"
                    ? "orange"
                    : selectedInvoice.status === "CANCELLED"
                    ? "gray"
                    : "red"
                }
              >
                {selectedInvoice.status === "UNPAID"
                  ? "Chưa đóng"
                  : selectedInvoice.status === "PARTIALLY_PAID"
                  ? "Đã đóng một phần"
                  : selectedInvoice.status === "PAID"
                  ? "Đã đóng"
                  : "Hủy"}
              </Tag>
            </Descriptions.Item>

            {selectedInvoice.images.length > 0 && (
              <Descriptions.Item label="Ảnh chụp công tơ">
                <Space wrap>
                  {selectedInvoice.images.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 100,
                        height: 100,
                        position: "relative",
                        border: "1px solid #f0f0f0",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={url}
                        alt={`Invoice Image ${idx + 1}`}
                        layout="fill"
                        objectFit="cover"
                        onClick={() => {
                          // Preview toàn màn hình
                          setPreviewImage(url);
                          setPreviewVisible(true);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Modal preview hình ảnh */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width={600}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%", // tỉ lệ 16:9
          }}
        >
          <Image
            src={previewImage}
            alt="Preview"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
      </Modal>
    </>
  );
}
