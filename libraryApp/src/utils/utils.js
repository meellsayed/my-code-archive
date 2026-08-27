export const filterObject = (data) => {
  const updates = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
  return updates;
};

export const paginate = async ({
  model,
  filter = {},
  page = 1,
  limit = 10,
  select,
  populate,
  sort = { createdAt: -1 },
}) => {
  const skip = (page - 1) * limit;

  const query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (select) {
    query.select(select);
  }

  if (populate) {
    query.populate(populate);
  }

  const [data, total] = await Promise.all([
    query.lean(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const paginateAggregation = async ({
  model,
  pipeline = [],
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  const [result] = await model.aggregate([
    ...pipeline,

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],

        metadata: [{ $count: "total" }],
      },
    },

    {
      $project: {
        data: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0],
        },
      },
    },
  ]);

  const total = result.total;
  const totalPages = Math.ceil(total / limit);

  return {
    data: result.data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
