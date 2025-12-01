// CocoFile - Date Range Filter Dialog Component
// Allows users to filter files by date range

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DateRangeFilter } from "@/types";

interface DateRangeFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (dateRange: DateRangeFilter) => void;
}

export const DateRangeFilterDialog: React.FC<DateRangeFilterDialogProps> = ({
  open,
  onOpenChange,
  dateRange,
  onDateRangeChange,
}) => {
  const [startDate, setStartDate] = useState<string>(
    dateRange.startDate?.toISOString().split("T")[0] || "",
  );
  const [endDate, setEndDate] = useState<string>(
    dateRange.endDate?.toISOString().split("T")[0] || "",
  );

  const handleApply = () => {
    onDateRangeChange({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onDateRangeChange({
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>日付範囲で絞り込み</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick select buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              よく使う期間
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(7)}
              >
                過去7日間
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(30)}
              >
                過去30日間
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(90)}
              >
                過去3ヶ月
              </Button>
            </div>
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium">
              開始日
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End date */}
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium">
              終了日
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Info text */}
          {(startDate || endDate) && (
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              {startDate && endDate
                ? `${startDate} から ${endDate} の間に作成されたファイルを表示`
                : startDate
                  ? `${startDate} 以降に作成されたファイルを表示`
                  : `${endDate} 以前に作成されたファイルを表示`}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            クリア
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleApply}>適用</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangeFilterDialog;
