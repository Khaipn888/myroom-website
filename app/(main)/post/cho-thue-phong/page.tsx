"use client";
import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Checkbox,
  Row,
  Col,
  AutoComplete,
  Select,
  Space,
  Radio,
} from "antd";
import Uploader from "@/components/ui/Uploader";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { debounce } from "lodash";
import { createPost } from "@/api/post";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
// Tải MapPicker động để tránh lỗi SSR
const MapPicker = dynamic(() => import("@/components/ui/maps/MapPicker"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 400,
        backgroundColor: "#f0f0f0",
        textAlign: "center",
        lineHeight: "400px",
      }}
    >
      Đang tải bản đồ...
    </div>
  ),
});

const { TextArea } = Input;

interface FormValues {
  type: string;
  title: string;
  price: number;
  area: number;
  address: string;
  location?: { lat: number; lng: number };
  media?: string[];
  utilities?: string[];
  description?: string;
  peoplePerRoom?: number;
  services?: { name: string; price: number; unit: string }[];
  contactName: string;
  contactPhone: string;
  contactZalo?: string;
}

const utilitiesOptions = [
  { label: "Wi-Fi", value: "wifi" },
  { label: "Chỗ để xe", value: "Chỗ để xe" },
  { label: "Vệ sinh chung", value: "Vệ sinh chung" },
  { label: "Vệ sinh khép kín", value: "Vệ sinh khép kín" },
  { label: "Full đồ", value: "Full đồ" },
  { label: "Điều hòa", value: "Điều hòa" },
  { label: "Bình nóng lạnh", value: "Bình nóng lạnh" },
  { label: "Máy giặt", value: "Máy giặt" },
  { label: "Giường", value: "Giường" },
  { label: "Tủ quần áo", value: "Tủ quần áo" },
  { label: "Bếp riêng", value: "Bếp riêng" },
  { label: "Thang máy", value: "Thang máy" },
  { label: "An ninh tốt", value: "An ninh tốt" },
  { label: "Khoá vân tay", value: "Khoá vân tay" },
];

export default function PostRoomForm() {
  const [form] = Form.useForm<FormValues>();
  const [addressOptions, setAddressOptions] = useState<{ value: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [selectLocationOnMap, setSelectLocationOnMap] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isChooseOnMap, setIsChooseOnMap] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoadingSubmit(true);
      const payload = {
        ...values,
        location: isChooseOnMap ? selectLocationOnMap : selectedLocation,
      };
      console.log("payload", payload);
      await createPost(payload);
      toast.success("Tin đã được tạo thành công");
    } catch (err: any) {
      toast.error(err.message || "Đăng tin thất bại");
    } finally {
      setLoadingSubmit(false);
      form.resetFields();
      router.push("/");
    }
  };

  // Hàm tìm kiếm địa chỉ với Goong Places
  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      try {
        const response = await fetch(
          `https://rsapi.goong.io/Place/AutoComplete?api_key=${
            process.env.NEXT_PUBLIC_GOONG_REST_API_KEY
          }&input=${encodeURIComponent(value)}`
        );
        const data = await response.json();
        if (data.predictions && Array.isArray(data.predictions)) {
          setAddressOptions(
            data.predictions.map((item: any) => ({
              value: item.description,
            }))
          );
        }
      } catch (error) {
        console.error("Có lỗi xảy ra khi gọi API Goong Places:", error);
      }
    }, 500), // delay 500ms
    []
  );
  const handleAddressSearch = (value: string) => {
    if (!value) {
      setAddressOptions([]);
      return;
    }
    debouncedSearch(value);
  };

  // Xử lý khi chọn địa chỉ từ autocomplete
  const handleAddressSelect = async (value: string) => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
          value
        )}&api_key=${process.env.NEXT_PUBLIC_GOONG_REST_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setSelectedLocation({
          lat: location.lat,
          lng: location.lng,
          address: value,
        });
        form.setFieldsValue({ address: value });
        setIsChooseOnMap(false);
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi lấy tọa độ:", error);
    }
  };

  // Xử lý khi chọn vị trí trên bản đồ
  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    form.setFieldsValue({ address: location.address });
    setSelectLocationOnMap(location);
    setIsChooseOnMap(true);
  };

  const renderLabel = (text: string) => (
    <span className="font-semibold">{text}</span>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
        backgroundColor: "white",
      }}
    >
      <Form.Item
        name="type"
        label={renderLabel("Loại tin đăng")}
        rules={[{ required: true, message: "Vui lòng chọn loại tin đăng" }]}
      >
        <Radio.Group>
          <Radio value="house">Cho thuê nguyên căn</Radio>
          <Radio value="room">Cho thuê phòng lẻ</Radio>
          <Radio value="co-living">Tìm người ở ghép</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="title"
        label={renderLabel("Tiêu đề")}
        rules={[{ required: true, message: "Vui lòng nhập tiêu đề tin đăng" }]}
      >
        <Input placeholder="Nhập tiêu đề tin đăng" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="price"
            label={renderLabel("Giá cho thuê (đ/tháng)")}
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={100000}
              placeholder="Giá cho thuê"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="area"
            label={renderLabel("Diện tích (m²)")}
            rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Diện tích"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="peoplePerRoom"
            label={renderLabel("Số người/phòng")}
            rules={[
              { required: true, message: "Vui lòng chọn số người/phòng" },
            ]}
          >
            <Select placeholder="Chọn số người/phòng">
              <Select.Option value="1">1 người</Select.Option>
              <Select.Option value="2">2 người</Select.Option>
              <Select.Option value="3">3 người</Select.Option>
              <Select.Option value="4">4 người</Select.Option>
              <Select.Option value="4+">4+ người</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.List
        name="services"
        initialValue={[
          { name: "Điện", price: 3500, unit: "đ/số" },
          { name: "Nước", price: 15000, unit: "đ/số" },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            <label className="font-semibold block mb-2">Giá dịch vụ</label>

            {fields.map((field, index) => {
              const serviceName = form.getFieldValue([
                "services",
                field.name,
                "name",
              ]);

              // đơn vị cho từng dịch vụ
              const getUnitOptions = () => {
                if (serviceName?.toLowerCase() === "nước") {
                  return ["đ/số", "đ/người"];
                }
                if (serviceName?.toLowerCase() === "điện") {
                  return ["đ/số"];
                }
                return ["đ/người", "đ/phòng"];
              };

              const isElectric = serviceName?.toLowerCase() === "điện";

              return (
                <Row gutter={12} key={field.name} className="mb-2">
                  <Col span={8}>
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]}
                      rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
                    >
                      <Input placeholder="Tên dịch vụ" />
                    </Form.Item>
                  </Col>

                  <Col span={14}>
                    <Space.Compact>
                      <Form.Item
                        {...field}
                        name={[field.name, "price"]}
                        noStyle
                        rules={[{ required: true, message: "Nhập giá" }]}
                      >
                        <InputNumber
                          placeholder="Giá"
                          min={0}
                          style={{ width: "60%" }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "unit"]}
                        noStyle
                        rules={[{ required: true, message: "Chọn đơn vị" }]}
                      >
                        <Select
                          disabled={isElectric}
                          placeholder="Đơn vị"
                          style={{ width: "40%" }}
                        >
                          {getUnitOptions().map((opt) => (
                            <Select.Option key={opt} value={opt}>
                              {opt}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Space.Compact>
                  </Col>

                  <Col span={2} className="flex items-center justify-center">
                    {index > 1 && (
                      <Button
                        danger
                        type="link"
                        onClick={() => remove(field.name)}
                      >
                        Xoá
                      </Button>
                    )}
                  </Col>
                </Row>
              );
            })}

            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                + Thêm dịch vụ khác
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        label={renderLabel("Địa chỉ")}
        name="address"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
      >
        <AutoComplete
          placeholder="Nhập địa chỉ..."
          options={addressOptions}
          onSearch={handleAddressSearch}
          onSelect={handleAddressSelect}
        />
      </Form.Item>

      <Form.Item label={renderLabel("Chọn vị trí trên bản đồ")}>
        <MapPicker
          onLocationSelect={handleLocationSelect}
          location={selectedLocation || undefined}
        />
      </Form.Item>

      <Form.Item
        name="media"
        label={renderLabel("Ảnh/Video")}
        valuePropName="value"
        getValueFromEvent={(e) => e}
        rules={[{ required: true, message: "Vui lòng tải lên ít nhất 1 file" }]}
      >
        <Uploader />
      </Form.Item>
      <Form.Item label={renderLabel("Tiện ích")} name="utilities">
        <Checkbox.Group>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-2">
            {utilitiesOptions.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item label={renderLabel("Thông tin chi tiết")} name="description">
        <TextArea rows={4} placeholder="Mô tả chi tiết về phòng trọ..." />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="contactPhone"
            label={renderLabel("Số điện thoại liên hệ")}
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="Số điện thoại liên hệ" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="contactZalo" label={renderLabel("Zalo")}>
            <Input placeholder="Zalo" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loadingSubmit}
          disabled={loadingSubmit}
          block
        >
          Đăng tin
        </Button>
      </Form.Item>
    </Form>
  );
}
