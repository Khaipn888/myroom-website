"use client";

import { Button, Checkbox, Form, Input, Divider } from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { loginApi, forgotPasswordApi, resetPasswordApi } from "@/api/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [otpSent, setOtpSent] = useState(false);
  const [fpForm] = Form.useForm();
  const { setUser } = useUserStore();
  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await loginApi(values); // gọi api đăng nhập
      if (response?.data) setUser(response?.data);
      toast.success("Đăng nhập thành công!");
      router.push("/"); // chuyển trang sau đăng nhập
    } catch (err: any) {
      toast.error(err.response.data.error);
    }
  };

  const onSendOtp = async (values: { email: string }) => {
    try {
      await forgotPasswordApi(values.email);
      toast.success("Mã OTP đã được gửi đến email của bạn");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gửi OTP thất bại");
    }
  };

  // 3) Xác thực OTP + reset mật khẩu
  const onReset = async (values: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const { email, otp, newPassword, confirmPassword } = values;
    if (newPassword !== confirmPassword) {
      fpForm.setFields([
        {
          name: "confirmPassword",
          errors: ["Mật khẩu xác nhận không khớp"],
        },
      ]);
      return;
    }
    try {
      await resetPasswordApi({ email, otp, newPassword, confirmPassword });
      toast.success("Đổi mật khẩu thành công, mời bạn đăng nhập lại");
      setView("login");
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex overflow-hidden">
        {/* Left side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#e9f7ff] px-6 py-10">
          <Image
            src="/images/logo.png"
            alt="Logo Illustration"
            width={200} // bắt buộc phải có
            height={10} // để xác định tỷ lệ (ở đây là 4:3)
          />
          <Image
            src="/images/login.png"
            alt="Login Illustration"
            width={700} // bắt buộc phải có
            height={600} // để xác định tỷ lệ (ở đây là 4:3)
            style={{ width: "90%", height: "auto" }}
          />
          <p className="text-lg text-[#012c5e] font-semibold">
            Bạn muốn tìm và quản lý phòng
            <br />
            Hãy để chúng tôi giúp bạn
          </p>
        </div>

        {/* Right side */}
        {view === "login" && (
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-xl font-semibold mb-2">Xin chào bạn</h2>
            <h1 className="text-2xl font-bold mb-6">Đăng nhập để tiếp tục</h1>

            <Form
              form={form}
              name="login"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập email!" }]}
              >
                <Input
                  size="large"
                  placeholder="Email"
                  prefix={<MailOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Mật khẩu"
                  prefix={<LockOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-4">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Nhớ tài khoản</Checkbox>
                </Form.Item>
                <div
                  onClick={() => setView("forgot")}
                  className="text-blue-600 cursor-pointer hover:text-blue-500 text-sm "
                >
                  Quên mật khẩu?
                </div>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{ width: "100%" }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <Divider>Hoặc</Divider>

            <GoogleLoginButton />

            <p className="text-xs text-gray-500 mt-4">
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <a className="text-blue-500" href="#">
                Điều khoản sử dụng
              </a>
              ,
              <a className="text-blue-500" href="#">
                {" "}
                Chính sách bảo mật
              </a>
              , và
              <a className="text-blue-500" href="#">
                {" "}
                Quy chế
              </a>{" "}
              của chúng tôi.
            </p>

            <p className="text-sm mt-4 text-black">
              Chưa là thành viên?{" "}
              <a className="text-blue-500 font-semibold" href="/register">
                Đăng ký tại đây
              </a>
            </p>
          </div>
        )}
        {view === "forgot" && (
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-xl font-semibold mb-2">Quên mật khẩu</h2>
            <p className="mb-4 text-sm text-gray-600">
              Nhập email để nhận mã OTP
            </p>

            <Form
              form={fpForm}
              layout="vertical"
              onFinish={otpSent ? onReset : onSendOtp}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Email"
                  prefix={<MailOutlined />}
                  disabled={otpSent}
                />
              </Form.Item>

              {otpSent && (
                <>
                  <Form.Item
                    name="otp"
                    rules={[{ required: true, message: "Nhập mã OTP" }]}
                  >
                    <Input placeholder="Mã OTP" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    rules={[{ required: true, message: "Nhập mật khẩu mới" }]}
                  >
                    <Input.Password placeholder="Mật khẩu mới" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                      { required: true, message: "Xác nhận mật khẩu" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject("Mật khẩu không khớp");
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Xác nhận mật khẩu" />
                  </Form.Item>
                </>
              )}

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  {otpSent ? "Xác nhận đổi mật khẩu" : "Lấy mã OTP"}
                </Button>
              </Form.Item>
            </Form>

            <Button
              type="link"
              className="mt-2"
              onClick={() => {
                setView("login");
                setOtpSent(false);
                fpForm.resetFields();
              }}
            >
              ← Quay lại Đăng nhập
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
