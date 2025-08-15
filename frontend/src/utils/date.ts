export const getMonthRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return [firstDay, lastDay];
};

export const newDateWithADayAdded = (date: Date) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 1);
  return newDate;
};

export const getUtcMidnight = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};
