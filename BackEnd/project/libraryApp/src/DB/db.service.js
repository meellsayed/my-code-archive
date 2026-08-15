/**
 * @param {{ model: import('mongoose').Model<any>, data?: object }} params
 * @returns {Promise<object>}
 */
export const create = async ({ model, data = {} } = {}) => {
  let document = await model.create(data);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, arrayOfData?: object[] }} params
 * @returns {Promise<object[]>}
 */
export const createMany = async ({ model, arrayOfData = [{}] } = {}) => {
  const documents = await model.insertMany(arrayOfData);
  return documents;
};

/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object, select?: string, populate?: import('mongoose').PopulateOptions[], limit?: number, skip?: number }} params
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
} = {}) => {
  const document = await model
    .find(filter)
    .select(select)
    .populate(populate)
    .limit(limit)
    .skip(skip)
    .sort(sort);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object|null>}
 */
export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findOne(filter)
    .select(select)
    .populate(populate);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, id?: string, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object|null>}
 */
export const findById = async ({
  model,
  id = "",
  select = "",
  populate = [],
} = {}) => {
  const document = await model.findById(id).select(select).populate(populate);
  return document;
};

/**
 * @param {{ model: import('mongoose').Model<any>, id?: string, data?: object, options?: object, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object|null>}
 */
export const findByIdAndUpdate = async ({
  model,
  id = "",
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findByIdAndUpdate(id, data, options)
    .select(select)
    .populate(populate);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object, data?: object, options?: object, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object|null>}
 */
export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findOneAndUpdate(filter, data, options)
    .select(select)
    .populate(populate);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object, data?: object, options?: object, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object>}
 */
export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = {},
} = {}) => {
  const document = await model.updateOne(filter, data, options);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object, data?: object, options?: object, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object>}
 */
export const updateMany = async ({
  model,
  filter = {},
  data = {},
  options = {},
} = {}) => {
  const document = await model.updateMany(filter, data, options);
  return document;
};

/**
 * @param {{ model: import('mongoose').Model<any>, id?: string, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object|null>}
 */
export const findByIdAndDelete = async ({
  model,
  id = "",
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findByIdAndDelete(id)
    .select(select)
    .populate(populate);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object, select?: string, populate?: import('mongoose').PopulateOptions[] }} params
 * @returns {Promise<object|null>}
 */
export const findOneAndDelete = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findOneAndDelete(filter)
    .select(select)
    .populate(populate);
  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object }} params
 * @returns {Promise<object>}
 */
export const deleteOne = async ({ model, filter = {} } = {}) => {
  const document = await model.deleteOne(filter);

  return document;
};
/**
 * @param {{ model: import('mongoose').Model<any>, filter?: object }} params
 * @returns {Promise<object>}
 */
export const deleteMany = async ({ model, filter = {} } = {}) => {
  const document = await model.deleteMany(filter);

  return document;
};
