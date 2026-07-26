//
// Create
export const create = async ({ model = "", data = {} } = {}) => {
  const document = model.create(data);
  return document;
};
export const createMany = async ({ model = "", arrayOfData = [{}] } = {}) => {
    let document =[{}]
    for (let index = 0; index < arrayOfData.length; index++) {
        const element = arrayOfData[index];
         document[index] = model.create(element);
    }
  return document;
};

// Find
export const find = async ({
  model = "",
  filter = {},
  select = "",
  populate = [],
  limit = 1000,
  skip = 0,
} = {}) => {
  const document = await model
    .find(filter)
    .select(select)
    .populate(populate)
    .limit(limit)
    .skip(skip);
  return document;
};
export const findOne = async ({
  model = "",
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
export const findById = async ({
  model = "",
  id = "",
  select = "",
  populate = [],
} = {}) => {
  const document = await model.findById(id).select(select).populate(populate);
  return document;
};

// Updata
export const findByIdAndUpdate = async ({
  model = "",
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
export const findOneAndUpdate = async ({
  model = "",
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
export const UpdateOne = async ({
  model = "",
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .UpdateOne(filter, data, options)
    .select(select)
    .populate(populate);
  return document;
};
export const UpdateMany = async ({
  model = "",
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .UpdateMany(filter, data, options)
    .select(select)
    .populate(populate);
  return document;
};

// delete
export const findByIdAndDelete = async ({
  model = "",
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
export const findOneAndDelete = async ({
  model = "",
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
export const deleteOne = async ({ model = "", filter = {} } = {}) => {
  const document = await model.deleteOne(filter);

  return document;
};
export const deleteMany = async ({ model = "", filter = {} } = {}) => {
  const document = await model.deleteMany(filter);

  return document;
};
