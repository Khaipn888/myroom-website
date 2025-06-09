"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { AutoComplete, Button, Dropdown, Select, Space } from "antd";
import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import { FaMapMarkedAlt } from "react-icons/fa";
import { convertLocationData, LocationMap } from "@/utils/locationDataBuilder";
import FilterModal from "./FilterModal";
import debounce from "lodash/debounce";
import { getSearchSuggestions } from "@/api/post";

export interface FilterValues {
  province?: string;
  keyword?: string;
  sort?: string;
  area?: [number, number];
  price?: [number, number];
  utilities?: string[];
  postType?: "house" | "room" | "co-living" | null;
  peoplePerRoom?: string | null;
  hasMedia?: boolean;
}

interface SearchFilterBarProps {
  initialFilters: FilterValues;
  onApply: (filters: FilterValues) => void;
  handleShowMap: () => void;
}

const sortOption = [
  { label: "Mới nhất", value: "newest" },
  { label: "Rẻ nhất", value: "price_asc" },
  { label: "Đắt nhất", value: "price_desc" },
];

export default function SearchFilterBar({
  initialFilters,
  onApply,
  handleShowMap,
}: SearchFilterBarProps) {
  const [locationMap, setLocationMap] = useState<LocationMap>({});
  const [selectedProvince, setSelectedProvince] = useState<string>(
    initialFilters.province || "Hà Nội"
  );
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [keyword, setKeyword] = useState(initialFilters.keyword || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState(720);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [area, setArea] = useState<FilterValues["area"]>(
    initialFilters.area || [15, 60]
  );
  const [price, setPrice] = useState<FilterValues["price"]>(
    initialFilters.price || [1000000, 10000000]
  );
  const [utilities, setUtilities] = useState<string[]>(
    initialFilters.utilities || []
  );
  const [postType, setPostType] = useState<FilterValues["postType"]>(
    initialFilters.postType
  );
  const [peoplePerRoom, setPeoplePerRoom] = useState<
    FilterValues["peoplePerRoom"]
  >(initialFilters.peoplePerRoom);
  const [hasMedia, setHasMedia] = useState<boolean>(
    initialFilters.hasMedia || true
  );
  const [sort, setSort] = useState<string>(initialFilters.sort || "newest");
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  useEffect(() => {
    fetch("/data/locations.json")
      .then((res) => res.json())
      .then((data) => {
        const result = convertLocationData(data);
        setLocationMap(result);
      });
  }, []);

  useEffect(() => {
    if (dropdownRef.current) {
      setDropdownWidth(dropdownRef.current.offsetWidth);
    }
  }, [selectedProvince]);

  const handleModalApply = (vals: any) => {
    setArea(vals.area);
    setPrice(vals.price);
    setUtilities(vals.amenities || []);
    setPostType(vals.postType || null);
    setPeoplePerRoom(vals.peoplePerRoom || null);
    setHasMedia(vals.hasMedia || false);
    setIsFilterOpen(false);

    // gom tất cả lại và đẩy lên Home
    onApply({
      province: selectedProvince,
      keyword,
      sort,
      area: vals.area,
      price: vals.price,
      utilities: vals.utilities || [],
      postType: vals.postType || null,
      peoplePerRoom: vals.peoplePerRoom || null,
      hasMedia: vals.hasMedia || false,
    });
  };

  const handleApply = () => {
    onApply({
      province: selectedProvince,
      keyword,
      sort,
      area,
      price,
      utilities: utilities || [],
      postType: postType || null,
      peoplePerRoom: peoplePerRoom || null,
      hasMedia: hasMedia || false,
    });
  };

  const getLocalSuggestions = (q: string) => {
    const list: { label: string; value: string }[] = [];
    const prov = locationMap[selectedProvince];
    if (!prov) return list;

    prov.districts.forEach((dist) => {
      if (dist.toLowerCase().includes(q.toLowerCase())) {
        list.push({ label: `${dist}, ${selectedProvince}`, value: dist });
      }
      prov.wardMap[dist]?.forEach((ward) => {
        if (ward.toLowerCase().includes(q.toLowerCase())) {
          list.push({
            label: `${ward}, ${dist}, ${selectedProvince}`,
            value: `${ward}, ${dist}`,
          });
        }
      });
    });
    return list;
  };

  const handleProvinceClick = (province: string) => {
    setSelectedProvince(province);
    setProvinceOpen(false);
  };

  const provinceDropdown = (
    <div
      className="max-h-[400px] w overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 bg-white rounded shadow-md p-4 z-50"
      style={{ width: dropdownWidth }}
    >
      <div className="grid grid-cols-3 gap-y-2 text-sm">
        {Object.keys(locationMap).map((province) => (
          <div
            key={province}
            className={`cursor-pointer hover:text-blue-600 ${
              selectedProvince === province ? "text-red-600 font-medium" : ""
            }`}
            onClick={() => handleProvinceClick(province)}
          >
            {province}
          </div>
        ))}
      </div>
    </div>
  );

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (q: string) => {
        // local
        const local = getLocalSuggestions(q);

        // backend
        let remote: { label: string; value: string }[] = [];
        try {
          const res = await getSearchSuggestions({
            province: selectedProvince,
            q,
          });
          remote = res.data.map((item: any) => ({
            label: item.label,
            value: item.label,
          }));
        } catch (e) {
          console.error(e);
        }

        // concat và set
        setOptions([...local, ...remote]);
      }, 300),
    [selectedProvince, locationMap]
  );

  const handleSearch = (q: string) => {
    setKeyword(q);
    if (q) fetchSuggestions(q);
    else setOptions([]);
  };

  return (
    <div className="bg-white mb-3 py-3 rounded shadow flex flex-wrap lg:grid lg:grid-cols-10 items-center gap-6">
      <div ref={dropdownRef} className="lg:col-span-7 ml-4">
        <Space.Compact className="w-full">
          <div>
            <Dropdown
              open={provinceOpen}
              onOpenChange={(open) => setProvinceOpen(open)}
              dropdownRender={() => provinceDropdown}
              trigger={["click"]}
            >
              <Button size="middle">
                {selectedProvince} <DownOutlined />
              </Button>
            </Dropdown>
          </div>

          <AutoComplete
            style={{ flex: 1 }}
            options={options}
            onSearch={handleSearch}
            value={keyword}
            onChange={setKeyword}
            placeholder="Gõ từ khóa để tìm bài đăng, quận/huyện, địa chỉ,…"
            filterOption={false} // tắt filter mặc định để dùng server/local combo
          />

          <Button type="primary" onClick={handleApply}>
            Tìm kiếm
          </Button>
        </Space.Compact>
      </div>

      <div className="flex lg:col-span-3 gap-2 justify-between mr-4">
        <Button
          onClick={() => setIsFilterOpen(true)}
          icon={<FilterOutlined />}
          size="middle"
        >
          Lọc
        </Button>

        <Button
          type="default"
          size="middle"
          className="text-white bg-teal-600 border-none"
          icon={<FaMapMarkedAlt />}
          onClick={handleShowMap}
        >
          Bản đồ
        </Button>
        <Select
          className="w-full"
          defaultValue="newest"
          size="middle"
          options={sortOption}
          onChange={(sort: string) => {
            setSort(sort);
            handleApply();
          }}
        />
      </div>
      <FilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleModalApply}
        initialValues={{
          area,
          price,
          utilities,
          postType,
          peoplePerRoom,
          hasMedia,
        }}
      />
    </div>
  );
}
