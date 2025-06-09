"use client";
import React from "react";
import { Button, Divider } from "antd";

interface FilterSidebarProps {
  onPriceSelect: (range: [number, number]) => void;
  onAreaSelect: (range: [number, number]) => void;
}

const priceRanges = [
  { label: "Dưới 1 triệu", value: "0-1000000" },
  { label: "1 - 2 triệu", value: "1000000-2000000" },
  { label: "2 - 2.5 triệu", value: "2000000-2500000" },
  { label: "2.5 - 3 triệu", value: "2500000-3000000" },
  { label: "3 - 3.5 triệu", value: "3000000-3500000" },
  { label: "3.5 - 4 triệu", value: "3500000-4000000" },
  { label: "4 - 4.5 triệu", value: "4000000-4500000" },
  { label: "4.5 - 5 triệu", value: "4500000-5000000" },
  { label: "5 - 6 triệu", value: "5000000-6000000" },
  { label: "Trên 6 triệu", value: "6000000-100000000" },
];

const areaRanges = [
  { label: "Dưới 15m²", value: "0-15" },
  { label: "15 - 25m²", value: "15-25" },
  { label: "25 - 30m²", value: "25-30" },
  { label: "30 - 35m²", value: "30-35" },
  { label: "Trên 35m²", value: "35-1000" },
];

export default function FilterSidebar({
  onPriceSelect,
  onAreaSelect,
}: FilterSidebarProps) {
  // Hàm dùng chung để parse "min-max" thành [min, max]
  const parseRange = (str: string): [number, number] => {
    const [minStr, maxStr] = str.split("-");
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return [min, max];
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <p className="font-semibold text-sm mb-2 text-center">
        Tìm nhanh theo giá
      </p>
      <div className="flex flex-col gap-2 mb-4">
        {priceRanges.map((range) => (
          <Button
            key={range.value}
            size="small"
            block
            onClick={() => {
              const parsed = parseRange(range.value);
              onPriceSelect(parsed);
            }}
          >
            {range.label}
          </Button>
        ))}
      </div>

      <Divider className="my-2" />
      <p className="font-semibold text-sm mb-2 text-center">
        Tìm nhanh theo diện tích
      </p>
      <div className="flex flex-col gap-2">
        {areaRanges.map((range) => (
          <Button
            key={range.value}
            size="small"
            block
            onClick={() => {
              const parsed = parseRange(range.value);
              onAreaSelect(parsed);
            }}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
