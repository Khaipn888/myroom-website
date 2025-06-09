"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Divider, Typography } from "antd";
import {
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { toast } from "react-toastify";

import { registerApi, sendOtpApi, verifyOtpApi } from "@/api/auth";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const { Title, Paragraph } = Typography;

export default function Register() {
  const router = useRouter();
  const [form] = Form.useForm();

  // Trạng thái giai đoạn: false = hiển thị form đăng ký, true = hiển thị xác thực OTP
  const [isOtpStage, setIsOtpStage] = useState(false);

  // Email đã đăng ký (để hiển thị và gửi lại OTP)
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Trạng thái loading cho form đăng ký
  const [registerLoading, setRegisterLoading] = useState(false);

  // Trạng thái và bộ đếm thời gian cho OTP
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 phút = 300 giây
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Chạy bộ đếm thời gian khi isOtpStage = true
  useEffect(() => {
    if (!isOtpStage) return;

    setSecondsLeft(300);
    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isOtpStage]);

  // Format thời gian từ giây sang mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Xử lý submit form đăng ký
  const onFinishRegister = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    const { name, email, password } = values;
    setRegisterLoading(true);

    try {
      // 1. Gọi API đăng ký
      await registerApi({ name, email, password });
      toast.success("Đăng ký thành công! Đang gửi mã OTP...");

      // 2. Gọi API gửi OTP ngay sau khi đăng ký
      await sendOtpApi({ email });
      toast.success("Mã OTP đã được gửi đến email của bạn.");

      // 3. Chuyển sang giai đoạn nhập OTP
      setRegisteredEmail(email);
      setIsOtpStage(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Xử lý submit form xác thực OTP
  const onFinishVerify = async (values: { otp: string }) => {
    const { otp } = values;
    if (!registeredEmail) return;
    setOtpLoading(true);

    try {
      await verifyOtpApi({ email: registeredEmail, otp });
      toast.success("Xác thực OTP thành công! Bạn có thể đăng nhập ngay.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Xác thực thất bại");
    } finally {
      setOtpLoading(false);
    }
  };

  // Xử lý gửi lại OTP
  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);

    try {
      await sendOtpApi({ email: registeredEmail });
      toast.success("Mã OTP mới đã được gửi đến email của bạn.");
      setSecondsLeft(300); // reset lại bộ đếm 5 phút
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể gửi lại OTP");
    } finally {
      setResendLoading(false);
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
            width={200}
            height={10}
          />
          <Image
            src="/images/login.png"
            alt="Login Illustration"
            width={700}
            height={600}
            style={{ width: "90%", height: "auto" }}
          />
          <p className="text-lg text-[#012c5e] font-semibold text-center">
            Bạn muốn tìm và quản lý phòng
            <br />
            Hãy để chúng tôi giúp bạn
          </p>
        </div>

        {/* Right side: đăng ký hoặc xác thực OTP */}
        <div className="w-full md:w-1/2 p-8">
          {!isOtpStage ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Xin chào bạn</h2>
              <h1 className="text-2xl font-bold mb-6">Đăng ký tài khoản nào</h1>

              <Form
                form={form}
                name="register"
                layout="vertical"
                onFinish={onFinishRegister}
              >
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hiển thị" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Tên hiển thị"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không đúng định dạng!" },
                  ]}
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

                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Mật khẩu không khớp!"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Nhập lại mật khẩu"
                    prefix={<LockOutlined />}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{ width: "100%" }}
                    loading={registerLoading}
                  >
                    Đăng Ký
                  </Button>
                </Form.Item>
              </Form>

              <p className="text-sm text-black">
                Đã có tài khoản?{" "}
                <a className="text-blue-500 font-semibold" href="/login">
                  Đăng nhập tại đây
                </a>
              </p>

              <Divider>Hoặc</Divider>

              <GoogleLoginButton />
            </>
          ) : (
            <>
              <Title level={3} className="text-center mb-4">
                Xác thực mã OTP
              </Title>
              <Paragraph className="text-center mb-6">
                Mã OTP đã được gửi đến email:
                <br />
                <strong>{registeredEmail}</strong>
              </Paragraph>

              <Form
                form={form}
                name="verify-otp"
                layout="vertical"
                onFinish={onFinishVerify}
              >
                <Form.Item
                  name="otp"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã OTP!" },
                    { len: 6, message: "OTP gồm 6 chữ số." },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập mã OTP"
                    prefix={<NumberOutlined />}
                    maxLength={6}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{ width: "100%" }}
                    loading={otpLoading}
                  >
                    Xác thực OTP
                  </Button>
                </Form.Item>
              </Form>

              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-gray-600">
                    Hết hạn sau:{" "}
                    <span className="font-medium">{formatTime(secondsLeft)}</span>
                  </span>
                </div>
                <Button
                  type="link"
                  onClick={handleResend}
                  loading={resendLoading}
                  disabled={secondsLeft > 0}
                >
                  Gửi lại OTP
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
