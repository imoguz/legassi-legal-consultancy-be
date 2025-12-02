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
        customFilterHandler = null
      ) => {
        // Extract all filters from query
        const queryFilters = {};
        const metaKeys = ["page", "limit", "sortBy", "sortOrder", "search"];

        Object.keys(req.query).forEach((key) => {
          if (
            !metaKeys.includes(key) &&
            req.query[key] !== undefined &&
            req.query[key] !== ""
          ) {
            queryFilters[key] = req.query[key];
          }
        });

        // Apply custom filter handler
        let finalFilters = {};
        if (customFilterHandler && typeof customFilterHandler === "function") {
          finalFilters = await customFilterHandler(queryFilters, req);
        } else {
          // Convert array values to $in
          finalFilters = queryFilters;
          Object.keys(finalFilters).forEach((key) => {
            if (
              Array.isArray(finalFilters[key]) &&
              finalFilters[key].length > 0
            ) {
              finalFilters[key] = { $in: finalFilters[key] };
            }
          });
        }

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
