const stringFromSnakeToCamel = (string) => {
  return string
    .toLowerCase()
    .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace("_", ""));
};

export const snakeToCamel = (obj) => {
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    newObj[stringFromSnakeToCamel(key)] = value;
  }
  return newObj;
};
