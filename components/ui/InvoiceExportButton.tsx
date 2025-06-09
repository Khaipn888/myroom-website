"use client";

import { useState } from "react";
import { Button, Modal, DatePicker, Space, Spin, Checkbox, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { exportInvoicesExcel } from "@/api/invoice";

export default function InvoiceExportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [exportAll, setExportAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    if (!isExporting) {
      setIsModalOpen(false);
      setSelectedDate(null);
      setExportAll(false);
    }
  };

  const handleExport = async () => {
    if (!exportAll && !selectedDate) {
      message.warning("Vui lòng chọn tháng/năm hoặc tích 'Xuất tất cả'");
      return;
    }
    setIsExporting(true);
    try {
      if (exportAll) {
        await exportInvoicesExcel();
      } else {
        const month = (selectedDate?.month() ?? 0) + 1; // dayjs month is 0-based
        const year = selectedDate?.year() ?? dayjs().year();
        await exportInvoicesExcel(month, year);
      }
      message.success("Đã bắt đầu tải file Excel hóa đơn");
      setIsModalOpen(false);
      setSelectedDate(null);
      setExportAll(false);
    } catch (err) {
      console.error(err);
      message.error("Xuất hóa đơn thất bại");
    } finally {
      setIsExporting(false);
    }
  };

  const onCheckExportAll = (e: any) => {
    setExportAll(e.target.checked);
    if (e.target.checked) {
      setSelectedDate(null);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={openModal}
      >
        Xuất hóa đơn
      </Button>

      <Modal
        title="Chọn tháng/năm để xuất hóa đơn"
        open={isModalOpen}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={isExporting}>
            Hủy
          </Button>,
          <Button
            key="export"
            type="primary"
            onClick={handleExport}
            disabled={!exportAll && !selectedDate}
          >
            {isExporting ? <Spin size="small" /> : "Xuất"}
          </Button>,
        ]}
        maskClosable={!isExporting}
        closable={!isExporting}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Checkbox checked={exportAll} onChange={onCheckExportAll}>
            Xuất tất cả các tháng
          </Checkbox>
          <DatePicker
            picker="month"
            style={{ width: "100%" }}
            placeholder="Chọn tháng/năm"
            onChange={(date) => setSelectedDate(date)}
            disabled={exportAll || isExporting}
            value={exportAll ? null : selectedDate}
            disabledDate={(current) => current && current > dayjs().endOf("month")}
          />
        </Space>
      </Modal>
    </>
  );
}
