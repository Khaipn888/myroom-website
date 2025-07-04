"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  InputNumber,
  Popconfirm,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  DoubleLeftOutlined,
} from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import Image from "next/image";
import {
  addMember,
  getRoomsDetail,
  deleteMember,
  updateMember,
} from "@/api/room";
import { toast } from "react-toastify";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  createInvoice,
  getInvoiceByMonth,
  getAllInvoiceOfRoom,
  updateInvoiceStatus,
} from "@/api/invoice";
import dayjs from "dayjs";
import RoomInvoicesTable from "@/components/ui/RoomInvoiceTable";
import { checkIsOwner } from "@/utils/checkIsOwner";

interface Member {
  name: string;
  phone: string;
  code: string;
  // cccdFront: string; // URL preview
  // cccdBack: string;
}

interface RoomDetailProps {
  room: any;
  hostel: any;
  onBack: () => void;
  hostelName: string;
}

export default function RoomDetail({
  room,
  hostel,
  onBack,
  hostelName,
}: RoomDetailProps) {
  // Chỉ số điện/nước & ảnh
  const [prevElectricity, setPrevElectricity] = useState<number | undefined>();
  const [prevWater, setPrevWater] = useState<number | undefined>();
  const [electricity, setElectricity] = useState<number | undefined>();
  const [water, setWater] = useState<number | undefined>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isLoadingCreateInvoice, setIsLoadingCreateInvoice] = useState(false);
  // Modal form
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const { data: roomDetail, refetch } = useQuery<any>({
    queryKey: ["getRoomDetail", room._id],
    queryFn: () => getRoomsDetail(room._id),
    placeholderData: keepPreviousData,
    enabled: room._id ? true : false,
    staleTime: 1000 * 60,
  });

  const { data: invoice, refetch: refetchInvoice } = useQuery<any>({
    queryKey: ["getInvoiceByMonth", selectedDate],
    queryFn: () =>
      getInvoiceByMonth(
        room._id,
        dayjs(selectedDate).month(),
        dayjs(selectedDate).year()
      ),
    placeholderData: keepPreviousData,
    enabled: room._id ? true : false,
    staleTime: 1000 * 60,
  });

  const { data: allInvoice, refetch: refetchAllInvoice } = useQuery<any>({
    queryKey: ["getAllInvoice"],
    queryFn: () => getAllInvoiceOfRoom(room._id),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (invoice) {
      setPrevElectricity(invoice.data.elec.pre);
      setPrevWater(invoice.data.water.pre);
      setElectricity(invoice.data.elec.after);
      setWater(invoice.data.water.after);
      const remoteImages: any[] = [];
      if (Array.isArray(invoice.data.images)) {
        invoice.data.images.forEach((url: string, idx: number) => {
          remoteImages.push({
            uid: `remote-${idx}`, // duy nhất cho mỗi ảnh
            name: `Image_${idx + 1}.jpg`,
            status: "done", // đã “downloaded”
            url, // chính là URL Cloudinary
          });
        });
      }
      setFileList([...remoteImages]);
    }
  }, [invoice]);
  // Helpers to normalize Upload event
  const normFile = (e: any) => (Array.isArray(e) ? e : e && e.fileList);

  // Add member
  const handleAddMember = async () => {
    try {
      const vals = await form.validateFields();
      // Lấy file từ fileList và tạo URL preview
      // const frontFile = vals?.cccdFront[0]?.originFileObj || "";
      // const backFile = vals?.cccdBack[0]?.originFileObj || "";
      const newMember = {
        name: vals.name,
        phone: vals.phone,
        code: vals.memberCode,
        // cccdFront: URL.createObjectURL(frontFile),
        // cccdBack: URL.createObjectURL(backFile),
      };
      await addMember({ roomId: room._id, hostelId: hostel._id, ...newMember });
      toast.success("Đã thêm mới thành viên vào phòng");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Thêm mới thành viên thất bại");
    } finally {
      form.resetFields();
      setIsMemberModalOpen(false);
    }
  };

  //Edit member
  const handleEditMember = (member: any) => {
    setEditingMember(member);
    // Thiết lập giá trị ban đầu cho form
    editForm.setFieldsValue({
      name: member.name,
      phone: member.phone,
      memberCode: member.code,
      cccdFront: member.cccdFront
        ? [
            {
              uid: "front",
              name: "cccdFront.jpg",
              url: member.cccdFront,
            },
          ]
        : [],
      cccdBack: member.cccdBack
        ? [
            {
              uid: "back",
              name: "cccdBack.jpg",
              url: member.cccdBack,
            },
          ]
        : [],
    });
    setIsEditMemberModalOpen(true);
  };

  const handleUpdateMember = async () => {
    try {
      const vals = await editForm.validateFields();
      console.log("object", editingMember);
      if (!editingMember) return;

      const updatedMember = {
        name: vals.name,
        phone: vals.phone,
        code: vals.memberCode,
      };
      // Xử lý ảnh mới nếu có
      // if (vals.cccdFront?.length && vals.cccdFront[0].originFileObj) {
      //   updatedMember.cccdFront = URL.createObjectURL(vals.cccdFront[0].originFileObj);
      // } else if (vals.cccdFront?.[0]?.url) {
      //   updatedMember.cccdFront = vals.cccdFront[0].url;
      // }

      // if (vals.cccdBack?.length && vals.cccdBack[0].originFileObj) {
      //   updatedMember.cccdBack = URL.createObjectURL(vals.cccdBack[0].originFileObj);
      // } else if (vals.cccdBack?.[0]?.url) {
      //   updatedMember.cccdBack = vals.cccdBack[0].url;
      // }

      await updateMember(editingMember._id, {
        roomId: room._id,
        hostelId: hostel._id,
        ...updatedMember,
      });
      toast.success("Cập nhật thành viên thành công");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Cập nhật thành viên thất bại");
    } finally {
      editForm.resetFields();
      setIsEditMemberModalOpen(false);
      setEditingMember(null);
    }
  };

  // Delete member
  const handleDeleteMember = async (member: any) => {
    try {
      await deleteMember(member._id, room._id, hostel._id, member?.code);
      toast.success("Xóa thành viên thành công");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Xóa thành viên thất bại");
    }
  };

  const handleBeforeUpload = async (rawFile: any) => {
    if (!invoice?.data.isEdit) {
      return false;
    }
    if (fileList.length >= 4) return false;
    // rawFile là RcFile (có thuộc tính uid)
    // Nhưng nếu để an toàn, ta có thể tự tạo uid:
    const uid = rawFile.uid || `${rawFile.name}-${Date.now()}`;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(rawFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
    // Tạo UploadFile object
    const uploadFile: any = {
      uid,
      name: rawFile.name,
      status: "done",
      url: base64,
      originFileObj: rawFile,
      preview: base64,
    };
    setFileList((prev) => [...prev, uploadFile]);
    return false; // không upload tự động
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj!);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleRemove = (file: any) => {
    if (!invoice?.data.isEdit) {
      return false;
    }
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const uploadFilesToCloudinary = async (files: any[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const fileObj of files) {
      if (!fileObj.originFileObj) continue;
      const formData = new FormData();
      formData.append("file", fileObj.originFileObj);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );
      try {
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          urls.push(uploadData.secure_url);
        } else {
          console.error("Cloudinary upload lỗi:", uploadData);
        }
      } catch (err) {
        console.error("Lỗi upload Cloudinary:", err);
      }
    }
    return urls;
  };

  const handleConfirmReadings = async () => {
    // Kiểm tra đã chọn tháng
    if (!selectedDate) {
      toast.error("Vui lòng chọn tháng để chốt");
      return;
    }
    // Nếu không có prevReadings, bắt nhập prevElectricity & prevWater
    if (
      (roomDetail?.data.prevReadings == null &&
        (prevElectricity == null || prevWater == null)) ||
      electricity == null ||
      water == null
    ) {
      toast.error("Vui lòng nhập đầy đủ chỉ số tháng trước và tháng hiện tại");
      return;
    }
    // 1. Upload tối đa 4 file lên Cloudinary
    setIsLoadingCreateInvoice(true);
    const filesToUpload = fileList.slice(0, 4);
    const imageUrls = await uploadFilesToCloudinary(filesToUpload);

    // 2. Sau khi có URLs, gọi recordReadings
    try {
      const payload = {
        roomId: room._id,
        hostelId: hostel._id,
        price: room.price,
        elec: {
          pre: prevElectricity,
          after: electricity,
        },
        water: {
          pre: prevWater,
          after: water,
        },
        services: hostel.services,
        totalMembers: roomDetail.data.members.length,
        month: dayjs(selectedDate).month() + 1,
        year: dayjs(selectedDate).year(),
        images: imageUrls,
      };
      await createInvoice(payload);
      toast.success("Chốt chỉ số và tạo hóa đơn thành công");
      refetchInvoice();
      refetchAllInvoice();
    } catch (err) {
      console.error(err);
      toast.error("Chốt chỉ số thất bại");
    } finally {
      setIsLoadingCreateInvoice(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateInvoiceStatus(id, { status });
      refetchAllInvoice();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <Space align="center">
        <DoubleLeftOutlined
          onClick={onBack}
          style={{ fontSize: 20, cursor: "pointer" }}
        />
        <h2 className="text-lg font-semibold">
          {hostelName} - {room.name}
        </h2>
      </Space>

      {/* Thông tin chung */}
      <Card>
        <Descriptions
          column={{
            sm: 1,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          size="small"
        >
          <Descriptions.Item label="Giá thuê">
            {room.price.toLocaleString()} đ
          </Descriptions.Item>
          <Descriptions.Item label="Diện tích">
            {room.area} m²
          </Descriptions.Item>
          {hostel?.services?.map((s: any, i: number) => (
            <Descriptions.Item key={i} label={s.name}>
              {s.price.toLocaleString()} {s.unit}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      {/* Thành viên */}
      <Card
        title="👥 Thành viên"
        extra={
          checkIsOwner(roomDetail?.data.ownerId) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsMemberModalOpen(true)}
            >
              Thêm thành viên
            </Button>
          )
        }
      >
        <Table<Member>
          dataSource={roomDetail?.data.members}
          rowKey="id"
          pagination={false}
          size="small"
        >
          <Table.Column title="Tên" dataIndex="name" key="name" />
          <Table.Column title="SĐT" dataIndex="phone" key="phone" />
          <Table.Column title="Mã thành viên" dataIndex="code" key="code" />
          <Table.Column
            title="CCCD mặt trước"
            key="cccdFront"
            render={(_, record) =>
              !record.cccdFront ? (
                <span>Chưa tải lên</span>
              ) : (
                <Image
                  src={record.cccdFront}
                  alt="CCCD mặt trước"
                  width={60}
                  height={40}
                  objectFit="cover"
                />
              )
            }
          />
          <Table.Column
            title="CCCD mặt sau"
            key="cccdBack"
            render={(_, record) =>
              !record.cccdBack ? (
                <span>Chưa tải lên</span>
              ) : (
                <Image
                  src={record.cccdBack}
                  alt="CCCD sau"
                  width={60}
                  height={40}
                  objectFit="cover"
                />
              )
            }
          />
          {checkIsOwner(roomDetail?.data.ownerId) && (
            <Table.Column
              key="actions"
              render={(_, record) => (
                <Space size="middle">
                  <EditOutlined
                    className="text-blue-600 cursor-pointer"
                    onClick={() => handleEditMember(record)}
                  />
                  <Popconfirm
                    title="Bạn có chắc muốn xóa thành viên này?"
                    onConfirm={() => handleDeleteMember(record)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <DeleteOutlined className="text-red-600 cursor-pointer" />
                  </Popconfirm>
                </Space>
              )}
            />
          )}
        </Table>

        {/* Modal Thêm thành viên */}
        <Modal
          title="Thêm thành viên"
          open={isMemberModalOpen}
          onCancel={() => {
            setIsMemberModalOpen(false);
            form.resetFields();
          }}
          onOk={handleAddMember}
          destroyOnClose
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Họ & tên"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="memberCode"
              label="Mã thành viên"
              rules={[{ message: "Vui lòng nhập mã thành viên" }]}
            >
              <Input />
            </Form.Item>
            <div className="grid grid-cols-2">
              {/* CCCD mặt trước */}
              <Form.Item
                name="cccdFront"
                label="Ảnh CCCD mặt trước"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <ImgCrop rotationSlider={true}>
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </ImgCrop>
              </Form.Item>

              {/* CCCD mặt sau */}
              <Form.Item
                name="cccdBack"
                label="Ảnh CCCD mặt sau"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <ImgCrop rotationSlider={true}>
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </ImgCrop>
              </Form.Item>
            </div>
          </Form>
        </Modal>
        <Modal
          title="Sửa thành viên"
          open={isEditMemberModalOpen}
          onCancel={() => {
            setIsEditMemberModalOpen(false);
            editForm.resetFields();
            setEditingMember(null);
          }}
          onOk={handleUpdateMember}
          destroyOnClose
          width={600}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="name"
              label="Họ & tên"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="memberCode"
              label="Mã thành viên"
              rules={[
                { required: true, message: "Vui lòng nhập mã thành viên" },
              ]}
            >
              <Input />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              {/* CCCD mặt trước */}
              <Form.Item
                name="cccdFront"
                label="Ảnh CCCD mặt trước"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <ImgCrop rotationSlider={true}>
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </ImgCrop>
              </Form.Item>

              {/* CCCD mặt sau */}
              <Form.Item
                name="cccdBack"
                label="Ảnh CCCD mặt sau"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <ImgCrop rotationSlider={true}>
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </ImgCrop>
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Card>

      {/* Chốt chỉ số điện nước */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>🔌 Chốt số điện, nước tháng hiện tại</span>
            <DatePicker
              format={"MM-YYYY"}
              picker="month"
              value={selectedDate}
              onChange={(val) => setSelectedDate(val)}
              style={{ width: 150 }}
            />
          </div>
        }
      >
        <Form layout="vertical" className="space-y-4">
          {/* Nếu có prevReadings, hiện readOnly; nếu không, cho phép nhập */}
          <div className="md:grid md:grid-cols-2 md:gap-5">
            <Form.Item label="Chỉ số điện tháng trước">
              <InputNumber
                style={{ width: "100%" }}
                value={prevElectricity}
                onChange={(val) => setPrevElectricity(val as number)}
                placeholder="Nhập điện tháng trước"
                disabled={!invoice?.data.isEdit || invoice?.data.elec.pre}
              />
            </Form.Item>
            <Form.Item label="Chỉ số nước tháng trước">
              <InputNumber
                style={{ width: "100%" }}
                value={prevWater}
                onChange={(val) => setPrevWater(val as number)}
                placeholder="Nhập nước tháng trước"
                disabled={!invoice?.data.isEdit || invoice?.data.water.pre}
              />
            </Form.Item>
          </div>

          {/* Nhập chỉ số tháng hiện tại */}
          <div className="md:grid md:grid-cols-2 md:gap-5">
            <Form.Item label="Chỉ số điện hiện tại">
              <InputNumber
                style={{ width: "100%" }}
                value={electricity}
                onChange={(val) => setElectricity(val as number)}
                placeholder="Nhập điện hiện tại"
                disabled={!invoice?.data.isEdit}
              />
            </Form.Item>
            <Form.Item label="Chỉ số nước hiện tại">
              <InputNumber
                style={{ width: "100%" }}
                value={water}
                onChange={(val) => setWater(val as number)}
                placeholder="Nhập nước hiện tại"
                disabled={!invoice?.data.isEdit}
              />
            </Form.Item>
          </div>

          <Form.Item label="Ảnh chụp công tơ (tối đa 4 ảnh)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemove}
              onPreview={handlePreview}
              disabled={!invoice?.data.isEdit}
            >
              {fileList.length >= 4 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>

            {/* Modal để xem preview ảnh */}
            <Modal
              open={previewVisible}
              footer={null}
              onCancel={() => setPreviewVisible(false)}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%",
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
          </Form.Item>

          {/* Nút chốt chỉ số */}
          {invoice?.data.isEdit && (
            <Form.Item>
              <Button
                disabled={!invoice?.data.isEdit}
                type="primary"
                onClick={handleConfirmReadings}
                loading={isLoadingCreateInvoice}
              >
                Chốt tiền phòng
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>

      {/* Bảng hóa đơn */}
      <RoomInvoicesTable
        allInvoice={allInvoice?.data}
        roomPrice={room.price}
        onStatusUpdate={handleUpdateStatus}
        isOwner={checkIsOwner(roomDetail?.data.ownerId)}
      />
    </div>
  );
}
