export const filterObject = (data) => {
  const updates = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
  return updates;
};

// not used for now 
export const pagination = async ({ filter, model, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const total = await model.countDocuments(filter);
  let pages = Math.ceil(total / limit);
  return { skip, total, pages };
};
