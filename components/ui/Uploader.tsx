"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

interface UploaderProps {
  maxCount?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
}

type MediaFile = {
  file: File | null;
  previewUrl: string;
  type: string;
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) throw new Error("Upload thất bại");

  const data = await res.json();
  return data.secure_url;
};

const Uploader: React.FC<UploaderProps> = ({ maxCount = 8, value = [], onChange }) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const initial = value.map((url) => ({
      file: null!, // chỉ để render preview
      previewUrl: url,
      type: /\.(mp4|webm|ogg)$/i.test(url) ? "video" : "image",
    }));
    setMediaList(initial);
  }, [value]);
  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const files = Array.from(event.target.files || []);
    const newMedia: MediaFile[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const sizeMB = file.size / 1024 / 1024;

      if (!isImage && !isVideo) {
        toast.error("Chỉ cho phép ảnh hoặc video!");
        continue;
      }

      if (isImage && sizeMB > 5) {
        toast.error(`Ảnh "${file.name}" vượt quá 5MB`);
        continue;
      }

      if (isVideo && sizeMB > 20) {
        toast.error(`Video "${file.name}" vượt quá 20MB`);
        continue;
      }

      try {
        const cloudUrl = await uploadToCloudinary(file);

        newMedia.push({
          file,
          previewUrl: cloudUrl,
          type: isImage ? "image" : "video",
        });
      } catch (error) {
        console.log(error);
        toast.error(`Không thể tải lên ${file.name}`);
      }
    }

    const combined = [...mediaList, ...newMedia].slice(0, maxCount);
    setMediaList(combined);
    onChange?.(combined.map((m) => m.previewUrl));
    setUploading(false);
  };

  const removeFile = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    setMediaList(updated);
    onChange?.(updated.map((m) => m.previewUrl));
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mediaList.map((media, index) => (
          <div
            key={index}
            className="relative group rounded overflow-hidden shadow border hover:shadow-lg transition-all"
          >
            {media.type === "image" ? (
              <div
                onClick={() => setPreview(media)}
                className="relative w-full h-32 sm:h-36 md:h-40 cursor-pointer"
              >
                <Image
                  src={media.previewUrl}
                  alt="preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="relative w-full h-32 sm:h-36 md:h-40 cursor-pointer"
                onClick={() => setPreview(media)}
              >
                <video
                  src={media.previewUrl}
                  className="object-cover w-full h-full rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black bg-opacity-60 rounded-full p-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      width="24"
                      height="24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => removeFile(index)}
              className="absolute cursor-pointer top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:text-red-600 hover:scale-110"
              title="Xoá"
            >
              <span className="anticon anticon-delete">
                <svg
                  viewBox="64 64 896 896"
                  focusable="false"
                  data-icon="delete"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M360 820a40 40 0 0 0 40 40h224a40 40 0 0 0 40-40V328H360v492zM792 240H628l-12.4-32.9A72 72 0 0 0 548 160H476a72 72 0 0 0-67.6 47.1L396 240H232c-4.4 0-8 3.6-8 8v32c0 4.4 3.6 8 8 8h560c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8-8-8z" />
                </svg>
              </span>
            </button>
          </div>
        ))}

        {mediaList.length < maxCount && (
          <label className="w-full h-32 sm:h-36 md:h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-sm font-medium rounded cursor-pointer transition">
            {uploading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-500 animate-pulse">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Đang tải lên...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl">+</div>
                <span className="text-xs mt-1">Tải lên ảnh hoặc video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  style={{ display: "none" }}
                />
              </>
            )}
          </label>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-11/12 max-w-3xl bg-white p-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {preview.type === "image" ? (
              <div className="relative w-full h-[80vh]">
                <Image
                  src={preview.previewUrl}
                  alt="preview"
                  fill
                  className="object-contain rounded"
                  unoptimized
                />
              </div>
            ) : (
              <video
                src={preview.previewUrl}
                className="w-full max-h-[80vh] rounded"
                controls
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Uploader;
