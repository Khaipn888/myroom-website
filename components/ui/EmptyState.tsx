// File: components/ui/EmptyState.tsx
"use client";

import React from "react";
import Image from "next/image";

interface EmptyStateProps {
  message?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export default function EmptyState({
  message = "Không có kết quả nào phù hợp",
  imageSrc = "/images/empty-state.png",
  imageAlt = "Empty state",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg py-5 bg-white ${className}`}
    >
      <Image
        src={imageSrc}
        width={120}
        height={120}
        alt={imageAlt}
        className="object-contain select-none"
      />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
