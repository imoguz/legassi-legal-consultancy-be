"use strict";

module.exports = (req, res, next) => {
  let search = req.query?.search || {};
  for (let key in search) search[key] = { $regex: search[key], $options: "i" };
  const sort = req.query?.sort || {};
  const page = +req.query?.page > 0 ? req.query?.page - 1 : 0;
  const limit = +req.query?.limit > 0 ? req.query?.limit : 0;

  req.queryHandler = async (modelName, Populate, filter) => {
    search = { ...search, ...filter };
    return await modelName
      .find(search)
      .sort(sort)
      .skip(page * limit)
      .limit(limit)
      .populate(Populate);
  };
  next();
};
