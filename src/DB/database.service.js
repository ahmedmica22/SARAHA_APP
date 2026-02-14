export const findOne = async ({
  model,
  select = "",
  filter = {},
  options = {},
} = {}) => {
  const doc = model.findOne(filter).select(select);
  if (select?.length) {
    doc.select(select);
  }
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};
export const findById = async ({
  id,
  options,
  select,
  model
}) => {
  const doc = model.findById(id).select(select || "");
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
}


export const create = async ({
  model,
  data,
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};
export const createOne = async ({
  model,
  data,
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};
export const insertMany = async ({ data, model }) => {
  return await model.insertMany(data);
};

export const updateOne = async ({ filter, update, options, model } = {}) => {
  if (Array.isArray(update)) {
    update.push({
      $set: {
        __v: { $add: ["$__v", 1] },
      },
    });
    return await model.updateOne(filter || {}, update, {
      ...options,
      runValidators: true,
      updatePipeline: true,
    });
  }

  return await model.updateOne(
    filter || {},
    { ...update, $inc: { __v: 1 } },
    options,
  );
};


export const findOneAndUpdate = async ({
  filter,
  update,
  options,
  model,
} = {}) => {
  if (Array.isArray(update)) {
    update.push({
      $set: {
        __v: { $add: ["$__v", 1] },
      },
    });
    return await model.findOneAndUpdate(filter || {}, update, {
      new: true,
      runValidators: true,

      ...options,
      updatePipeline: true,
    });
  }
  return await model.findOneAndUpdate(
    filter || {},
    { ...update, $inc: { __v: 1 } },
    {
      new: true,
      runValidators: true,

      ...options,
    },
  );
};

export const findByIdAndUpdate = async ({
  id,
  update,
  options = { new: true },
  model,
}) => {
  return await model.findByIdAndUpdate(
    id,
    { ...update, $inc: { __v: 1 } },
    options,
  );
};

export const deleteOne = async ({ filter, model }) => {
  return await model.deleteOne(filter || {});
};

export const deleteMany = async ({ filter, model }) => {
  return await model.deleteMany(filter || {});
};

export const findOneAndDelete = async ({ filter, model } = {}) => {
  return await model.findOneAndDelete(filter || {});
};
