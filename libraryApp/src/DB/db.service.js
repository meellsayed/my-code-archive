/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   data?: object,
 *   options?: import('mongoose').QueryOptions
 * }} params
 * @returns {Promise<object>}
 */
export const create = async ({ model, data = {}, options = {} } = {}) => {
  const document = await model.create(data);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   arrayOfData?: object[],
 *   options?: import('mongoose').InsertManyOptions
 * }} params
 * @returns {Promise<object[]>}
 */
export const createMany = async ({
  model,
  arrayOfData = [{}],
  options = {},
} = {}) => {
  const documents = await model.insertMany(arrayOfData, options);

  return documents;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   limit?: number,
 *   skip?: number,
 *   sort?: object,
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object[]>}
 */
export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
  limit = 1000,
  skip = 0,
  sort = {},
  session,
} = {}) => {
  const document = await model
    .find(filter)
    .select(select)
    .populate(populate)
    .limit(limit)
    .skip(skip)
    .sort(sort)
    .session(session);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object|null>}
 */
export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
  session,
} = {}) => {
  const document = await model
    .findOne(filter)
    .select(select)
    .populate(populate)
    .session(session);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   id?: string,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object|null>}
 */
export const findById = async ({
  model,
  id = "",
  select = "",
  populate = [],
  session,
} = {}) => {
  const document = await model
    .findById(id)
    .select(select)
    .populate(populate)
    .session(session);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   id?: string,
 *   data?: object,
 *   options?: import('mongoose').QueryOptions,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object|null>}
 */
export const findByIdAndUpdate = async ({
  model,
  id = "",
  data = {},
  options = {},
  select = "",
  populate = [],
  session,
} = {}) => {
  const document = await model
    .findByIdAndUpdate(id, data, {
      ...options,
      session,
    })
    .select(select)
    .populate(populate);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   data?: object,
 *   options?: import('mongoose').QueryOptions,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object|null>}
 */
export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = [],
  session,
} = {}) => {
  const document = await model
    .findOneAndUpdate(filter, data, {
      ...options,
      session,
    })
    .select(select)
    .populate(populate);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   data?: object,
 *   options?: import('mongoose').UpdateOptions,
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object>}
 */
export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = {},
  session,
} = {}) => {
  const document = await model.updateOne(filter, data, {
    ...options,
    session,
  });

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   data?: object,
 *   options?: import('mongoose').UpdateOptions,
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object>}
 */
export const updateMany = async ({
  model,
  filter = {},
  data = {},
  options = {},
  session,
} = {}) => {
  const document = await model.updateMany(filter, data, {
    ...options,
    session,
  });

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   id?: string,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object|null>}
 */
export const findByIdAndDelete = async ({
  model,
  id = "",
  select = "",
  populate = [],
  session,
} = {}) => {
  const document = await model
    .findByIdAndDelete(id, { session })
    .select(select)
    .populate(populate);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   select?: string,
 *   populate?: import('mongoose').PopulateOptions[],
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object|null>}
 */
export const findOneAndDelete = async ({
  model,
  filter = {},
  select = "",
  populate = [],
  session,
} = {}) => {
  const document = await model
    .findOneAndDelete(filter, { session })
    .select(select)
    .populate(populate);

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object>}
 */
export const deleteOne = async ({ model, filter = {}, session } = {}) => {
  const document = await model.deleteOne(filter, {
    session,
  });

  return document;
};

/**
 * @param {{
 *   model: import('mongoose').Model<any>,
 *   filter?: object,
 *   session?: import('mongoose').ClientSession
 * }} params
 * @returns {Promise<object>}
 */
export const deleteMany = async ({ model, filter = {}, session } = {}) => {
  const document = await model.deleteMany(filter, {
    session,
  });

  return document;
};
