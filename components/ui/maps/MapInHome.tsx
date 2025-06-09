// MapInHome.tsx
"use client";

import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { createRoot } from "react-dom/client";
import { Popover } from "antd";
import { DollarOutlined, ApartmentOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Post {
  id: string;
  location: { lat: string; lng: string };
  title: string;
  price: number;
  area: number;
  media: string[];
}

interface MapInHomeProps {
  posts: Post[];
  center: [number, number];
}

export default function MapInHome({ posts, center }: MapInHomeProps) {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<goongjs.Map | null>(null);
  const markersRef = useRef<goongjs.Marker[]>([]);
  const mapApiKey = process.env.NEXT_PUBLIC_GOONG_MAP_API_KEY || "";

  const handleViewDetailPost = (id: string) => {
    router.push(`/phong-tro/${id}`);
  };

  // parse [lng, lat] từ string
  const parseCoords = (loc: { lat: string; lng: string }): [number, number] => [
    parseFloat(loc.lng),
    parseFloat(loc.lat),
  ];

  // Khởi tạo Goong map 1 lần
  useEffect(() => {
    if (!mapContainer.current || !mapApiKey) {
      if (!mapApiKey) console.error("Thiếu biến NEXT_PUBLIC_GOONG_MAP_API_KEY");
      return;
    }

    goongjs.accessToken = mapApiKey;
    mapRef.current = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: center ?? [105.8342, 21.0285],
      zoom: 8,
    });
    mapRef.current.addControl(new goongjs.NavigationControl(), "top-right");

    return () => {
      // cleanup
      markersRef.current.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapApiKey, center]);

  // Cập nhật markers mỗi khi posts thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    posts.forEach((post) => {
      const [lng, lat] = parseCoords(post.location);

      // Container cho marker & Popover trigger
      const container = document.createElement("div");
      container.style.pointerEvents = "auto";

      // Mount Popover + marker nội dung
      createRoot(container).render(
        <Popover
          trigger="hover"
          placement="top"
          content={
            <div
              className="flex w-60 bg-white rounded-lg cursor-pointer"
              onClick={() => handleViewDetailPost(post.id)}
            >
              <Image
                src={post.media[0]}
                alt={post.title}
                width={100}
                height={10}
                objectFit="contain"
                className="rounded"
              />
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-semibold mb-2 line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center text-xs space-x-4">
                  <span className="flex items-center space-x-1">
                    <DollarOutlined />
                    <span>{post.price.toLocaleString()}₫</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ApartmentOutlined />
                    <span>{post.area}m²</span>
                  </span>
                </div>
              </div>
            </div>
          }
        >
          <div className="flex flex-col items-center cursor-pointer">
            <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow mb-1">
              {(post.price / 1_000_000).toFixed(0)}tr
            </div>
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="red"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
        </Popover>
      );

      // Tạo marker lên map
      const marker = new goongjs.Marker({
        element: container,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Fit bounds nếu nhiều marker
    if (posts.length > 1) {
      const bounds = posts.reduce(
        (b, p) => b.extend(parseCoords(p.location)),
        new goongjs.LngLatBounds(
          parseCoords(posts[0].location),
          parseCoords(posts[0].location)
        )
      );
      map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
    }
  }, [posts, router]);

  return <div ref={mapContainer} className="w-full h-[400px]" />;
}
