"use client";
import PostCard from "@/components/ui/PostCard";
import FilterSidebar from "@/components/ui/FilterSidebar";
import SearchFilterBar, { FilterValues } from "@/components/ui/SearchFilterBar";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAllPosts } from "@/api/post";
import { Spin, Pagination } from "antd";
import MapInHome from "@/components/ui/maps/MapInHome";
import EmptyState from "@/components/ui/EmptyState";

const defaultFilters: FilterValues = {
  province: "Toàn quốc",
  sort: "newest",
  area: [0, 100],
  price: [500000, 10000000],
  utilities: [],
  postType: null,
  peoplePerRoom: null,
};

export default function Home() {
  const [isShowMap, setIsShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const {
    data: listAllPosts,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ["getAllPosts", page, filters],
    queryFn: () => {
      const { area, price, ...restFilters } = filters;
      return getAllPosts({
        page,
        limit: 10,
        ...restFilters,
        areaMin: area?.[0],
        areaMax: area?.[1],
        priceMin: price?.[0],
        priceMax: price?.[1],
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  // - Khi user chọn nhanh khoảng giá
  const handleQuickPrice = (priceRange: [number, number]) => {
    // Tạo object filters mới (clone từ filters cũ)
    const newFilters: FilterValues = {
      ...filters,
      price: priceRange, // gán lại mảng [min, max]
    };
    setFilters(newFilters);
    setPage(1);
  };

  // - Khi user chọn nhanh khoảng diện tích
  const handleQuickArea = (areaRange: [number, number]) => {
    const newFilters: FilterValues = {
      ...filters,
      area: areaRange, // gán lại mảng [min, max]
    };
    setFilters(newFilters);
    setPage(1);
  };

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };
  console.log("listAllPosts", listAllPosts);
  const handleShowMap = () => {
    setIsShowMap(!isShowMap);
  };

  if (isError) return <div>Đã có lỗi xảy ra khi tải tin đăng.</div>;

  const renderHeader = (suggested: boolean, appliedFilters: string[]) => {
    // Icon tùy theo suggested
    const icon = suggested ? "💡" : "🔍";

    // 1. Xác định mainTitle
    let mainTitle: string;
    if (filters.postType === "co-living") {
      mainTitle = `Tìm người ở ghép ${
        filters.province === "Toàn quốc"
          ? "trên toàn quốc"
          : `khu vực ${filters.province}`
      }`;
    } else if (filters.postType === "house") {
      mainTitle = `Cho thuê nhà trọ nguyên căn ${
        filters.province === "Toàn quốc"
          ? "trên toàn quốc"
          : `khu vực ${filters.province}`
      }`;
    } else {
      mainTitle = `Cho thuê nhà trọ, phòng trọ ${
        filters.province === "Toàn quốc"
          ? "trên toàn quốc"
          : `khu vực ${filters.province}`
      }`;
    }

    // 2. Tạo mảng detailParts
    const detailParts: string[] = [];

    // Xác định xem nên áp dụng `filters` hay `appliedFilters`
    const shouldInclude = (key: string): boolean => {
      if (suggested) {
        // suggested = true → chỉ hiển thị nếu key nằm trong appliedFilters
        return appliedFilters.includes(key);
      } else {
        // suggested = false → hiển thị nếu user đã chọn (khác default)
        switch (key) {
          case "keyword":
            return (
              filters.keyword !== undefined && filters.keyword.trim() !== ""
            );
          case "province":
            return (
              filters.province !== undefined && filters.province !== "Toàn quốc"
            );
          case "postType":
            return filters.postType !== null;
          case "utilities":
            return (
              Array.isArray(filters.utilities) && filters.utilities.length > 0
            );
          case "price":
            return (
              filters.price?.[0] !== defaultFilters.price?.[0] ||
              filters.price?.[1] !== defaultFilters.price?.[1]
            );
          case "area":
            return (
              filters.area?.[0] !== defaultFilters.area?.[0] ||
              filters.area?.[1] !== defaultFilters.area?.[1]
            );
          case "peoplePerRoom":
            return (
              filters.peoplePerRoom !== undefined &&
              filters.peoplePerRoom !== null
            );
          default:
            return false;
        }
      }
    };

    // a. Province
    if (shouldInclude("province")) {
      detailParts.push(`Khu vực: ${filters.province}`);
    }

    // b. keyword
    if (shouldInclude("keyword")) {
      detailParts.push(`Từ khóa: “${filters.keyword?.trim()}”`);
    }

    // e. price
    if (shouldInclude("price")) {
      detailParts.push(
        `${filters.price?.[0].toLocaleString()}₫–${filters.price?.[1].toLocaleString()}₫`
      );
    }
    // f. area
    if (shouldInclude("area")) {
      detailParts.push(`${filters.area?.[0]}m²–${filters.area?.[1]}m²`);
    }
    // d. utilities
    if (shouldInclude("utilities")) {
      detailParts.push(`${filters.utilities?.join(" / ")}`);
    }

    // g. peoplePerRoom
    if (shouldInclude("peoplePerRoom")) {
      detailParts.push(`${filters.peoplePerRoom} người/phòng`);
    }

    // 3. Ghép mainTitle với detailParts
    if (detailParts.length === 0) {
      return (
        <p className="font-semibold mb-2">
          <span className="mr-1">{icon}</span>
          {mainTitle}
        </p>
      );
    }

    return (
      <p className="font-semibold mb-2">
        <span className="mr-1">{icon}</span>
        {mainTitle}
        {detailParts.map((txt, idx) => (
          <span key={idx}>{`, ${txt}`}</span>
        ))}
      </p>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Search và lọc */}
      <SearchFilterBar
        initialFilters={filters}
        onApply={handleApplyFilters}
        handleShowMap={handleShowMap}
      />
      {isShowMap && (
        <div className="my-2">
          <MapInHome
            posts={listAllPosts?.data?.posts || []}
            center={listAllPosts?.data?.center}
          />
        </div>
      )}
      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-6">
        {/* Danh sách bài đăng */}
        <div className="flex-1 lg:col-span-7">
          {renderHeader(false, listAllPosts?.data?.appliedFilters || [])}
          <div className="flex justify-center items-center w-full min-h-48 bg-white rounded-lg mb-5">
            <Spin spinning={isLoading} tip="Đang tải tin đăng...">
              {listAllPosts?.data?.suggested ? (
                <EmptyState
                  message={`Không có kết quả nào phù hợp`}
                  imageSrc="/images/empty.png"
                  imageAlt="Không có kết quả"
                />
              ) : (
                listAllPosts?.data?.posts?.map((item: any) => (
                  <PostCard key={item.id} {...item} />
                ))
              )}
            </Spin>
          </div>

          {listAllPosts?.data?.suggested && listAllPosts?.data?.total > 0 && (
            <>
              {renderHeader(
                listAllPosts?.data?.suggested,
                listAllPosts?.data?.appliedFilters || []
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {listAllPosts.data.posts.map((item: any) => (
                  <PostCard key={item.id} {...item} />
                ))}
              </div>
            </>
          )}
          {listAllPosts?.data?.total > 20 && (
            <div className="mt-6 text-center">
              <Pagination
                current={page}
                pageSize={20}
                total={listAllPosts?.data?.total || 0}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
        {/* Bộ lọc */}
        <div className="w-full lg:col-span-3 shrink-0">
          <FilterSidebar
            onPriceSelect={handleQuickPrice}
            onAreaSelect={handleQuickArea}
          />
        </div>
      </div>
    </div>
  );
}
