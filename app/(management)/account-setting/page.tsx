"use client";
import { Button, Form, Input, Radio, Upload, UploadProps } from "antd";
import {
  CameraOutlined,
  CloseCircleFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { updateMe } from "@/api/user";
import { changePassword } from "@/api/auth";
import { toast } from "react-toastify";

export default function AccountSettingsPage() {
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserStore();
  const [pwdLoading, setPwdLoading] = useState(false);
  // Preview ảnh khi người dùng chọn
  const handleUploadPreview: UploadProps["onChange"] = (info) => {
    const file = info.file.originFileObj || info.fileList?.[0]?.originFileObj;
    if (!file) return;

    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Xoá ảnh đã chọn
  const handleRemoveImage = () => {
    setAvatarPreview(null);
    setPendingImageFile(null);
  };

  // Submit form + upload ảnh
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let uploadedImageUrl = avatarPreview || "";

      // Nếu có file mới → upload lên Cloudinary
      if (pendingImageFile) {
        const formData = new FormData();
        formData.append("file", pendingImageFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.secure_url;
      }

      const values = await form.validateFields();

      // Gửi dữ liệu về backend
      const userUpdated = await updateMe({
        ...values,
        avatar: uploadedImageUrl,
      });
      if (userUpdated) {
        setUser(userUpdated.data);
      }
      toast.success("cập nhập thông tin thành công");
    } catch (err) {
      toast.error("Hệ thống lỗi, vui lòng quay lại sau");
      console.error("Lỗi khi cập nhật:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
      });
      // Đồng thời nếu user.avatar có sẵn, cho preview luôn
      setAvatarPreview(user.avatar || null);
    }
  }, [user, form]);

  const handleChangePassword = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } =
        await pwdForm.validateFields();
      if (newPassword !== confirmPassword) {
        pwdForm.setFields([
          {
            name: "confirmPassword",
            errors: ["Mật khẩu xác nhận không khớp"],
          },
        ]);
        return;
      }
      setPwdLoading(true);
      await changePassword({ currentPassword, newPassword });
      toast.success("Đổi mật khẩu thành công");
      pwdForm.resetFields();
    } catch (err: any) {
      if (err.errorFields) {
        // lỗi validation của AntD
      } else {
        toast.error(err.error || "Đổi mật khẩu thất bại");
      }
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto relative z-10">
        <h1 className="text-xl font-semibold mb-6">
          Cài đặt thông tin cá nhân
        </h1>

        {/* Avatar Upload */}
        <div className="md:flex space-y-5 md:space-y-0 items-center justify-between gap-6 mb-6">
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUploadPreview}
          >
            <div className="relative w-[100px] h-[100px] rounded-full border border-dashed border-gray-300 bg-gray-50 cursor-pointer flex items-center justify-center text-gray-500 hover:shadow transition">
              {!avatarPreview && (
                <div className="flex flex-col items-center">
                  <CameraOutlined className="text-lg" />
                  <span className="text-xs">Tải ảnh</span>
                </div>
              )}

              {avatarPreview && (
                <>
                  <Image
                    width={100}
                    height={100}
                    src={avatarPreview || (user?.avatar as string)}
                    alt="avatar preview"
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-full"
                  />
                  <CloseCircleFilled
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-[-8px] right-[-8px] text-red-500 text-xl bg-white rounded-full shadow cursor-pointer"
                  />
                </>
              )}
            </div>
          </Upload>
          <div className="flex flex-col items-center border border-gray-100 shadow rounded-lg p-5">
            <div className="text-gray-600 text-xs font-semibold">
              Mã người dùng
            </div>
            <div className="font-semibold">{user?.code}</div>
          </div>
          <div className="flex flex-col items-center border border-gray-100 shadow rounded-lg p-5">
            <div className="text-gray-600 text-xs font-semibold">
              Tổng số tin đăng
            </div>
            <div className="font-semibold">15</div>
          </div>
          <div className="flex flex-col items-center border border-gray-100 shadow rounded-lg p-5">
            <div className="text-gray-600 text-xs font-semibold">
              Số tin đã cho thuê
            </div>
            <div className="font-semibold">4</div>
          </div>
        </div>

        {/* Form người dùng */}
        <Form
          form={form}
          initialValues={{
            name: user?.name,
            phone: user?.phone,
            email: user?.email,
            address: user?.address,
          }}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập họ tên..." />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập số điện thoại..." />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ type: "email" }]}>
              <Input placeholder="example@email.com" />
            </Form.Item>

            <Form.Item label="Giới tính" name="gender">
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="111 Hoàng Mai Hà Nội" />
          </Form.Item>

          <div className="flex justify-end mt-6">
            <Button type="primary" onClick={handleSubmit}>
              Cập nhật thông tin
            </Button>
          </div>
        </Form>
        <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password
              placeholder="Mật khẩu hiện tại"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Tối thiểu 6 ký tự" },
            ]}
          >
            <Input.Password
              placeholder="Mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <div className="flex justify-end">
            <Button
              type="primary"
              loading={pwdLoading}
              onClick={handleChangePassword}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </div>
      {/* Loading overlay */}
      {loading && <FullScreenLoading />}
    </div>
  );
}
