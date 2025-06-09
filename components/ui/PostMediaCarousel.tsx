"use client";
import { Carousel } from "antd";
import { useRef, useState } from "react";
import Image from "next/image";

interface PostMediaCarouselProps {
  media: string[];
}

export default function PostMediaCarousel({ media }: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  const handleThumbnailClick = (index: number) => {
    carouselRef.current?.goTo(index);
    setActiveIndex(index);
  };
  console.log("media", media);
  return (
    <div className="w-full">
      {/* Carousel chính */}
      <div className="relative rounded overflow-hidden">
        <Carousel
          ref={carouselRef}
          dots={false}
          afterChange={(index) => setActiveIndex(index)}
          arrows
        >
          {media?.map((item, index) => (
            <div
              key={index}
              className="w-full aspect-video bg-black flex items-center justify-center"
            >
              {item.includes("image") && (
                <Image
                  width={100}
                  height={100}
                  src={item}
                  alt={`media-${index}`}
                  className="object-contain w-full h-full"
                />
              )}
              {item.includes("video") && (
                <video controls className="w-full h-full object-contain">
                  <source src={item} type="video/mp4" />
                  Trình duyệt không hỗ trợ video.
                </video>
              )}
              {item.includes("map") && (
                <Image
                  width={100}
                  height={100}
                  src={item}
                  alt="map"
                  className="object-contain w-full h-full"
                />
              )}
            </div>
          ))}
        </Carousel>
        {/* Đếm số ảnh */}
        <div className="absolute bottom-2 right-3 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
          {activeIndex + 1}/{media?.length}
        </div>
      </div>

      {/* Thumbnail bên dưới */}
      <div className="flex gap-2 mt-2 overflow-x-auto px-4">
        {media?.map((item, index) => (
          <div
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`w-20 h-16 border rounded overflow-hidden cursor-pointer ${
              index === activeIndex ? "border-blue-500" : "border-gray-300"
            }`}
          >
            {item.includes("video") ? (
              <video muted className="w-full h-full object-cover">
                <source src={item} />
              </video>
            ) : (
              <Image
                width={100}
                height={100}
                src={item}
                alt={`thumb-${index}`}
                className="object-cover w-full h-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
