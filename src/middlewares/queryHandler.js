const createQueryHandler = () => {
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 100;
  const DEFAULT_SORT = "createdAt";
  const DEFAULT_ORDER = "desc";

  return async (req, res, next) => {
    try {
      // Parse and validate query parameters
      const page = Math.max(1, parseInt(req.query.page) || 1);
      let limit = Math.min(
        parseInt(req.query.limit) || DEFAULT_LIMIT,
        MAX_LIMIT
      );
      limit = Math.max(1, limit);

      const sort = req.query.sort || DEFAULT_SORT;
      const order = req.query.order || DEFAULT_ORDER;
      const search = req.query.search ? req.query.search.trim() : null;
      const filters = { ...req.query.filters };

      // Remove pagination and sorting params from filters
      delete filters.page;
      delete filters.limit;
      delete filters.sort;
      delete filters.order;
      delete filters.search;

      // Build sort object
      const sortFields = sort.split(",");
      const sortOrders = order.split(",");
      const sortObject = {};

      sortFields.forEach((field, index) => {
        const dir = sortOrders[index] === "asc" ? 1 : -1;
        sortObject[field] = dir;
      });

      // Attach query handler to request
      req.queryHandler = async (
        Model,
        populateOptions = null,
        searchFields = []
      ) => {
        // Build base query with filters
        const query = Model.find(filters);

        // Add search if provided
        if (search && searchFields.length > 0) {
          const searchConditions = searchFields.map((field) => ({
            [field]: { $regex: search, $options: "i" },
          }));
          query.or(searchConditions);
        }

        // Get total count
        const totalQuery = query.clone();
        const total = await totalQuery.countDocuments();

        // Apply pagination and sorting
        query
          .sort(sortObject)
          .skip((page - 1) * limit)
          .limit(limit);

        // Apply population if specified
        if (populateOptions) {
          if (Array.isArray(populateOptions)) {
            populateOptions.forEach((option) => query.populate(option));
          } else {
            query.populate(populateOptions);
          }
        }

        const data = await query.exec();

        return {
          data,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        };
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = createQueryHandler();
