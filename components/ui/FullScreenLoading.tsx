"use client";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";

export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
      <Image
        width={100}
        height={50}
        src="/images/logo.png"
        alt="Logo"
        className="mb-2 object-contain"
      />
      <LoadingOutlined className="text-3xl text-blue-600 animate-spin mb-2" />
      <p className="text-sm text-gray-600">Chờ một xíu nhé...</p>
    </div>
  );
}
