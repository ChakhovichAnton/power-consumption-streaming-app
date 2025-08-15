import { useCallback, useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import Dialog from "./Dialog.tsx";
import { getAvailableDates } from "../services/powerConsumptionService.ts";
import { getMonthRange } from "../utils/date.ts";

interface DateSelectorProps {
  defaultDate: Date;
  onSelect: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  defaultDate,
  onSelect,
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [selected, setSelectedDate] = useState<Date>(defaultDate);
  const [loading, setLoading] = useState(false);

  const getDates = useCallback(async (date: Date) => {
    setLoading(true);
    const [start, end] = getMonthRange(date);
    const newDates = await getAvailableDates(start, end);
    setAvailableDates(newDates);
    setLoading(false);
  }, []);

  useEffect(() => {
    getDates(defaultDate);
  }, [defaultDate, getDates]);

  return (
    <div className="flex gap-2">
      <button
        className="bg-blue-300 rounded p-1"
        onClick={(event) => {
          event.stopPropagation();
          setDialogIsOpen(true);
          getDates(defaultDate);
        }}
      >
        Select date
      </button>
      <Dialog
        isOpen={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        closeDialogButton
      >
        <div className="md:p-4">
          <DayPicker
            animate
            fixedWeeks
            defaultMonth={defaultDate}
            navLayout="around"
            captionLayout="dropdown-years"
            mode="single"
            selected={selected}
            onSelect={(newDate?: Date) => {
              if (newDate) {
                setSelectedDate(newDate);
              }
            }}
            onMonthChange={getDates}
            modifiers={{ available: availableDates }}
            modifiersStyles={{
              available: {
                position: "relative",
                backgroundColor: "#e0f7fa",
                borderRadius: "50%",
              },
            }}
            weekStartsOn={1}
            disabled={loading}
          />
          <div className="flex flex-col mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#e0f7fa]"></div>
              <p>Date with data</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
              <p>Date with no data</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border-2 border-[#0000ff]"></div>
              <p>Selected date</p>
            </div>
          </div>
          <div className="flex w-full mt-2">
            <button
              onClick={() => {
                onSelect(selected);
                setDialogIsOpen(false);
              }}
              className="bg-blue-300 w-full rounded p-1"
            >
              View data
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DateSelector;
