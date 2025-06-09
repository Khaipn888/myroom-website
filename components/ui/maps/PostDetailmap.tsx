"use client";

import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

interface PostMapProps {
  location: {
    lat: string;
    lng: string;
  };
}

export default function PostDetailMap({ location }: PostMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<goongjs.Map | null>(null);
  const markerRef = useRef<goongjs.Marker | null>(null);
  const mapApiKey = process.env.NEXT_PUBLIC_GOONG_MAP_API_KEY || "";

  useEffect(() => {
    if (!mapContainer.current || !mapApiKey) {
      console.error("Missing NEXT_PUBLIC_GOONG_MAP_API_KEY");
      return;
    }

    goongjs.accessToken = mapApiKey;
    // Khởi tạo map
    mapRef.current = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: location,
      zoom: 15,
    });
    mapRef.current.addControl(new goongjs.NavigationControl(), "top-right");

    // Thêm marker
    markerRef.current = new goongjs.Marker({
      color: "red",
      anchor: "bottom",
    })
      .setLngLat(location)
      .addTo(mapRef.current);

    return () => {
      // Cleanup khi unmount
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapApiKey, location]);

  return <div ref={mapContainer} className="w-full h-[300px] rounded" />;
}
