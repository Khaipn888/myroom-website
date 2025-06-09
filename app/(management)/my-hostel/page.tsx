"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Select,
  Spin,
} from "antd";
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import HostelDetail from "@/components/ui/HostelDetail";
import HostelCard from "@/components/ui/HostelCard";
import {
  getAllMyHostel,
  createHostel,
  updateHostel,
  deleteHostel,
  getHostelDetail,
} from "@/api/hostel";
import { toast } from "react-toastify";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { checkIsOwner } from "@/utils/checkIsOwner";
import InvoiceExportButton from "@/components/ui/InvoiceExportButton";

interface Service {
  name: string;
  price: number;
  unit: string;
}

interface Hostel {
  _id: string;
  name: string;
  totalRoom: number;
  floorCount: number;
  currentOccupants?: number;
  address: string;
  electricityPrice: number;
  waterPrice: number;
  services: Service[];
}

export default function MyHostels() {
  const [selectedHostel, setSelectedHostel] = useState<any>(null);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm<any>();

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm<any>();
  const [editingHostel, setEditingHostel] = useState<any>(null);

  const {
    data: myHostels,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["getMyHostels"],
    queryFn: () => getAllMyHostel(),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
  const openAddModal = () => {
    addForm.resetFields();
    setIsAddModalOpen(true);
  };

  const { data: hostelDetail } = useQuery<any>({
    queryKey: ["getHostelDetail", selectedHostel],
    queryFn: () => getHostelDetail(selectedHostel?._id),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    enabled: selectedHostel !== null,
  });

  const handleAddOk = async () => {
    try {
      const values = await addForm.validateFields();
      const svcList = [];
      if (typeof values.electricityPrice === "number") {
        svcList.push({
          name: "Điện",
          price: values.electricityPrice,
          unit: values.electricityUnit,
        });
      }
      if (typeof values.waterPrice === "number") {
        svcList.push({
          name: "Nước",
          price: values.waterPrice,
          unit: values.waterUnit as string,
        });
      }

      // Thêm các dịch vụ khác (nếu có) vào sau
      if (Array.isArray(values.services)) {
        svcList.push(...values.services);
      }

      // 3. Chuẩn bị payload cho API
      const payload = {
        name: values.name?.trim(),
        address: values.address?.trim(),
        floorCount: values.floorCount,
        totalRoom: values.totalRoom,
        services: svcList,
      };

      await createHostel(payload);
      refetch();
      toast.success("Thêm nhà trọ mới thành công");
    } catch (error) {
      console.error(error);
      toast.error("Thêm thất bại");
    } finally {
      setIsAddModalOpen(false);
    }
  };
  const openEditModal = (h: Hostel) => {
    setEditingHostel(h);
    editForm.setFieldsValue(h);
    setIsEditModalOpen(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      const svcList = [];
      if (typeof values.electricityPrice === "number") {
        svcList.push({
          name: "Điện",
          price: values.electricityPrice,
          unit: values.electricityUnit,
        });
      }
      if (typeof values.waterPrice === "number") {
        svcList.push({
          name: "Nước",
          price: values.waterPrice,
          unit: values.waterUnit as string,
        });
      }

      // Thêm các dịch vụ khác (nếu có) vào sau
      if (Array.isArray(values.services)) {
        svcList.push(...values.services);
      }

      // 3. Chuẩn bị payload cho API
      const payload = {
        name: values.name?.trim(),
        address: values.address?.trim(),
        floorCount: values.floorCount,
        totalRoom: values.totalRoom,
        services: svcList,
      };
      await updateHostel({ id: editingHostel?._id, data: payload });
      refetch();
      toast.success("Sửa thông tin nhà trọ thành công");
    } catch (error) {
      console.error(error);
      toast.error("Sửa thất bại");
    } finally {
      setIsEditModalOpen(false);
      setEditingHostel(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHostel(id);
      toast.success("Xoá thành công");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Xoá thất bại");
    }
  };

  if (selectedHostel) {
    return (
      <HostelDetail
        hostel={selectedHostel}
        hostelDetail={hostelDetail}
        onBack={() => setSelectedHostel(null)}
      />
    );
  }

  return (
    <div className="p-4 bg-white min-h-full">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold mb-4">Danh sách nhà trọ của bạn</h2>
        <InvoiceExportButton />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="">
          Tổng số nhà trọ: <strong>{myHostels?.data?.length}</strong>
        </div>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={openAddModal}
        >
          Thêm nhà trọ
        </Button>
      </div>

      <div className="md:grid md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10 col-span-2">
            <Spin />
          </div>
        ) : (
          myHostels.data?.map((h: any) => (
            <HostelCard
              key={h._id}
              isOwner={checkIsOwner(h.ownerId)}
              hostel={h}
              onDelete={handleDelete}
              onEdit={openEditModal}
              onSelect={setSelectedHostel}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal
        title="Thêm nhà trọ mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleAddOk}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={addForm} layout="vertical">
          {/* Thông tin chung */}
          <div className="mb-4">
            <h3 className="text-base font-semibold mb-2">Thông tin chung</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tên nhà trọ */}
              <Form.Item
                name="name"
                label="Tên nhà trọ"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhà trọ" },
                ]}
                className="sm:col-span-2"
              >
                <Input placeholder="Nhập tên nhà trọ" />
              </Form.Item>

              {/* Số tầng */}
              <Form.Item
                name="floorCount"
                label="Số tầng"
                rules={[{ required: true, message: "Vui lòng nhập số tầng" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="VD: 2"
                />
              </Form.Item>

              {/* Tổng số phòng */}
              <Form.Item
                name="totalRoom"
                label="Tổng số phòng"
                rules={[
                  { required: true, message: "Vui lòng nhập tổng số phòng" },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="VD: 10"
                />
              </Form.Item>
              {/* Địa chỉ */}
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                className="sm:col-span-2"
              >
                <Input placeholder="Ví dụ: 123 Lê Lợi, Quận 1, TP. HCM" />
              </Form.Item>

              {/* Giá điện + Đơn vị */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <Form.Item
                  name="electricityPrice"
                  label="Giá điện"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá điện" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="VD: 3500"
                  />
                </Form.Item>
                <Form.Item
                  name="electricityUnit"
                  label="Đơn vị điện"
                  initialValue="đ/số"
                  rules={[{ required: true, message: "Chọn đơn vị điện" }]}
                >
                  <Select>
                    <Select.Option value="đ/số">đ/số</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Giá nước + Đơn vị */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <Form.Item
                  name="waterPrice"
                  label="Giá nước"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá nước" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="VD: 2000"
                  />
                </Form.Item>
                <Form.Item
                  name="waterUnit"
                  label="Đơn vị nước"
                  initialValue="đ/người"
                  rules={[{ required: true, message: "Chọn đơn vị nước" }]}
                >
                  <Select>
                    <Select.Option value="đ/người">đ/người</Select.Option>
                    <Select.Option value="đ/phòng">đ/số</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Dịch vụ khác */}
          <div>
            <h3 className="text-base font-semibold mb-2">
              Dịch vụ khác (nếu có)
            </h3>
            <Form.List name="services">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      className="mb-2 flex-wrap sm:flex-nowrap"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        rules={[{ required: true, message: "Tên dịch vụ" }]}
                      >
                        <Input placeholder="Tên dịch vụ" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        rules={[{ required: true, message: "Giá" }]}
                      >
                        <InputNumber placeholder="Giá (đồng)" min={0} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "unit"]}
                        initialValue="đ/người"
                        rules={[{ required: true, message: "Đơn vị" }]}
                      >
                        <Select>
                          <Select.Option value="đ/người">đ/người</Select.Option>
                          <Select.Option value="đ/phòng">đ/phòng</Select.Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                    >
                      Thêm dịch vụ
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa nhà trọ"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingHostel(null);
        }}
        onOk={handleEditOk}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          {/* Các Form.Item giống như Add Modal */}
          <Form.Item
            name="name"
            label="Tên nhà trọ"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà trọ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="floorCount"
            label="Số tầng"
            rules={[{ required: true, message: "Vui lòng nhập số tầng" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="totalRoom"
            label="Tổng số phòng"
            rules={[{ required: true, message: "Vui lòng nhập tổng số phòng" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="VD: 10"
            />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>
          <Form.List name="services">
            {(fields, { add, remove }) => (
              <>
                <label className="font-semibold !mb-2">Giá dịch vụ</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" className="mb-2">
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Tên dịch vụ" }]}
                    >
                      <Input placeholder="Tên dịch vụ" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      rules={[{ required: true, message: "Giá" }]}
                    >
                      <InputNumber placeholder="Giá" min={0} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "unit"]}
                      rules={[{ required: true, message: "Đơn vị" }]}
                    >
                      <Input placeholder="Đơn vị" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm dịch vụ
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
