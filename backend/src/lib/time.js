export const timeAndDateStringToTimestamp = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split("/");
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");

  const isoString = `${year}-${paddedMonth}-${paddedDay}T${timeStr}Z`; // Assuming timestamps are in UTC

  return new Date(isoString).getTime();
};
