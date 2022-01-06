const isNull = (param) => {
  return (
    param === "null" || !param || param === "undefined" || param === undefined
  );
};

const buildKeywordQuery = (fields = [], keyword) => {
  let ORlist = [];
  if (isNull(keyword)) {
    return {};
  }
  fields.forEach((field) => {
    ORlist.push({
      [field]: {
        $regex: keyword,
        $options: "i", // case insensitive
      },
    });
  });
  return {
    $or: [...ORlist],
  };
};

module.exports = { buildKeywordQuery };
