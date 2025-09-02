import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';
import { Calendar, Download, FileText } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

interface DateRangeSelectorProps {
  onExport: (startDate: Date, endDate: Date) => void;
  isExporting?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onExport,
  isExporting = false,
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleExport = () => {
    if (startDate && endDate && startDate <= endDate) {
      onExport(startDate, endDate);
    }
  };

  const getPresetRange = (type: 'thisMonth' | 'lastMonth' | 'thisYear' | 'last3Months') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (type) {
      case 'thisMonth':
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0),
        };
      case 'lastMonth':
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0),
        };
      case 'last3Months':
        return {
          start: new Date(currentYear, currentMonth - 2, 1),
          end: new Date(),
        };
      case 'thisYear':
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(),
        };
    }
  };

  const presetButtons = [
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last 3 Months', value: 'last3Months' },
    { label: 'This Year', value: 'thisYear' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Export Financial Statement</h3>
          <p className="text-sm text-gray-600">Select date range for your PDF report</p>
        </div>
      </div>

      {/* Preset Range Buttons */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Select:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {presetButtons.map((preset) => (
            <motion.button
              key={preset.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const range = getPresetRange(preset.value);
                setStartDate(range.start);
                setEndDate(range.end);
              }}
              className="px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 
                         rounded-lg transition-colors duration-200"
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date!)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-primary focus:border-transparent"
              placeholderText="Select start date"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date!)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-primary focus:border-transparent"
              placeholderText="Select end date"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Export Period:</span>{' '}
          {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This will include all income, expenses, and EMIs within the selected date range.
        </p>
      </div>

      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(206, 110, 85, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExport}
        disabled={!startDate || !endDate || startDate > endDate || isExporting}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r 
                   from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 
                   text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   transition-all duration-300 transform border-2 border-accent-400"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
            <span className="text-base">Generating Your PDF Statement...</span>
          </>
        ) : (
          <>
            <div className="p-2 bg-white/20 rounded-lg">
              <Download className="h-5 w-5" />
            </div>
            <span>Download PDF Statement</span>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <FileText className="h-3 w-3" />
              PDF
            </div>
          </>
        )}
      </motion.button>

      {/* Date validation message */}
      {startDate && endDate && startDate > endDate && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 mt-2 text-center"
        >
          Start date must be before or equal to end date
        </motion.p>
      )}
    </motion.div>
  );
};

export default DateRangeSelector;
