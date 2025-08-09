const createQueryHandler = () => {
  const DEFAULT_LIMIT = 20;
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

      const sort = req.query.sortBy || DEFAULT_SORT;
      const order = req.query.sortOrder || DEFAULT_ORDER;
      const search = req.query.search ? req.query.search.trim() : null;

      // Copy all query params into filters except known meta keys
      const filters = { ...req.query };
      delete filters.page;
      delete filters.limit;
      delete filters.sortBy;
      delete filters.sortOrder;
      delete filters.search;

      // Convert boolean strings to actual booleans
      Object.keys(filters).forEach((key) => {
        if (Array.isArray(filters[key])) {
          filters[key] = filters[key].map((v) =>
            v === "true" ? true : v === "false" ? false : v
          );
        } else {
          if (filters[key] === "true") filters[key] = true;
          if (filters[key] === "false") filters[key] = false;
        }
      });

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
        searchFields = [],
        extraFilters = {}
      ) => {
        // Merge base filters with query filters
        const finalFilters = { ...extraFilters, ...filters };

        // Build base query with filters
        const query = Model.find(finalFilters);

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
