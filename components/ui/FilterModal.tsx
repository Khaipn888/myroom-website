"use client";
import {
  Modal,
  Slider,
  Checkbox,
  Radio,
  Select,
  Button,
  Form,
  Divider,
} from "antd";

const { Option } = Select;

const utilities = [
 "wifi",
 "Chỗ để xe",
 "Vệ sinh chung",
 "Vệ sinh khép kín",
 "Full đồ",
 "Điều hòa",
 "Bình nóng lạnh",
 "Máy giặt",
 "Giường",
 "Tủ quần áo",
 "Bếp riêng",
 "Thang máy",
 "An ninh tốt",
 "Khoá vân tay",
];


interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (values: any) => void;
  initialValues: any;
}

export default function FilterModal({
  open,
  onClose,
  onApply,
  initialValues,
}: Props) {
  const [form] = Form.useForm();
  const area = Form.useWatch("area", form) || initialValues.area;
  const price = Form.useWatch("price", form) || initialValues.price;
  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({
    area: [0, 100],
    price: [500000, 10000000],
    peoplePerRoom: null,
    postType: null,
    utilities: [],
  });
  };

  const handleApply = () => {
    const values = form.getFieldsValue();
    onApply(values);
    onClose();
  };

  return (
    <Modal
      title="Bộ lọc tìm phòng"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        className="max-h-[500px] overflow-y-auto px-3"
      >
        {/* Diện tích */}
        <Form.Item
          label={
            <span className="font-semibold">{`Diện tích: ${area[0]}m² - ${area[1]}m²`}</span>
          }
          name="area"
        >
          <Slider
            range
            defaultValue={initialValues.area}
            min={5}
            max={100}
            marks={{ 5: "5m²", 100: "100m²" }}
            style={{ maxWidth: 400, margin: "auto" }}
          />
        </Form.Item>

        {/* Giá phòng */}
        <Form.Item
          label={
            <span className="font-semibold">{`Giá phòng: ${price[0].toLocaleString()}đ - ${price[1].toLocaleString()}đ`}</span>
          }
          name="price"
        >
          <Slider
            range
            defaultValue={initialValues.price}
            min={500000}
            max={10000000}
            step={500000}
            marks={{
              500000: "500K",
              5000000: "5tr",
              10000000: "10tr",
            }}
            style={{ maxWidth: 400, margin: "auto" }}
          />
        </Form.Item>

        {/* Tiện ích */}
        <Form.Item
          label={<span className="font-semibold">Tiện ích</span>}
          name="utilities"
        >
          <Checkbox.Group options={utilities} />
        </Form.Item>

        {/* Loại tin */}
        <Form.Item
          label={<span className="font-semibold">Loại tin đăng</span>}
          name="postType"
        >
          <Radio.Group>
            <Radio value="house">Thuê nguyên căn</Radio>
            <Radio value="room">Thuê phòng lẻ</Radio>
            <Radio value="co-living">Ở ghép</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Số người/phòng */}
        <Form.Item
          label={<span className="font-semibold">Số người/phòng</span>}
          name="peoplePerRoom"
        >
          <Select placeholder="Chọn số người">
            <Option value="1">1 người</Option>
            <Option value="2">2 người</Option>
            <Option value="3">3 người</Option>
            <Option value="4">4+ người</Option>
          </Select>
        </Form.Item>

        {/* Có ảnh/video */}
        <Form.Item name="hasMedia" valuePropName="checked">
          <Checkbox>Có ảnh/video</Checkbox>
        </Form.Item>

        <Divider />

        <div className="flex justify-center gap-5">
          <Button onClick={handleReset}>Đặt lại</Button>
          <Button type="primary" onClick={handleApply}>
            Áp dụng
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
