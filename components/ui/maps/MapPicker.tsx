"use client";
import { useEffect, useRef, useState } from "react";
import goongjs from "@goongmaps/goong-js";
import GoongGeocoder from "@goongmaps/goong-geocoder";
import "@goongmaps/goong-js/dist/goong-js.css";
import "@goongmaps/goong-geocoder/dist/goong-geocoder.css";

interface MapPickerProps {
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  location?: { lat: number; lng: number; address: string } | null;
}

const MapPicker = ({ onLocationSelect, location }: MapPickerProps) => {
  const mapContainer = useRef(null);
  const map = useRef<goongjs.Map | null>(null);
  const geocoder = useRef<GoongGeocoder | null>(null);
  const [marker, setMarker] = useState<goongjs.Marker | null>(null);

  const mapApiKey = process.env.NEXT_PUBLIC_GOONG_MAP_API_KEY || "";
  const restApiKey = process.env.NEXT_PUBLIC_GOONG_REST_API_KEY || "";

  useEffect(() => {
    if (!mapContainer.current) return;

    goongjs.accessToken = mapApiKey;

    map.current = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: location ? [location.lng, location.lat] : [105.83991, 21.028],
      zoom: 12,
    });

    map.current.addControl(new goongjs.NavigationControl(), "top-right");

    geocoder.current = new GoongGeocoder({
      accessToken: restApiKey,
      goongjs: goongjs,
    });

    map.current.addControl(geocoder.current, "top-left");

    geocoder.current.on("result", (e: any) => {
      const { geometry, place_name } = e.result;
      if (geometry?.coordinates) {
        updateMarker(
          geometry.coordinates[1],
          geometry.coordinates[0],
          place_name
        );
      }
    });

    map.current.on("click", (e: any) => {
      fetch(
        `https://rsapi.goong.io/Geocode?latlng=${e.lngLat.lat},${e.lngLat.lng}&api_key=${restApiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          const address =
            data.results?.[0]?.formatted_address || "Không xác định địa chỉ";
          updateMarker(e.lngLat.lat, e.lngLat.lng, address);
        })
        .catch((error) => console.error("Lỗi khi gọi Goong Geocode:", error));
    });

    // Set initial marker
    if (location) {
      updateMarker(
        location.lat,
        location.lng,
        location.address || ""
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Theo dõi khi prop `location` thay đổi từ cha
  useEffect(() => {
    if (map.current && location) {
      map.current.flyTo({ center: [location.lng, location.lat], zoom: 14 });
      updateMarker(
        location.lat,
        location.lng,
        location.address || ""
      );
    }
  }, [location]);

  const updateMarker = (lat: number, lng: number, address: string) => {
    if (marker) marker.remove();

    const newMarker = new goongjs.Marker()
      .setLngLat([lng, lat])
      .addTo(map.current!);
    setMarker(newMarker);
    onLocationSelect?.({ lat, lng, address });
  };

  return <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />;
};

export default MapPicker;
