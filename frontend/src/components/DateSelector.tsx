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

  const newDateSelected = (newDate?: Date) => {
    if (newDate) {
      setSelectedDate(newDate);
      onSelect(newDate);
    }
  };

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
        <div className="md:p-8">
          <DayPicker
            animate
            fixedWeeks
            defaultMonth={defaultDate}
            navLayout="around"
            captionLayout="dropdown-years"
            mode="single"
            selected={selected}
            onSelect={newDateSelected}
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
          <div className="flex justify-end">
            <button
              onClick={() => {
                onSelect(selected);
                setDialogIsOpen(false);
              }}
              className="bg-blue-300 rounded p-1"
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
