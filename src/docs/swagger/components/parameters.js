module.exports = {
  pageParam: {
    in: "query",
    name: "page",
    schema: {
      type: "integer",
      minimum: 1,
      default: 1,
    },
    description: "Page number for pagination.",
  },

  limitParam: {
    in: "query",
    name: "limit",
    schema: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 10,
    },
    description: "Number of items per page (maximum is 100).",
  },

  sortParam: {
    in: "query",
    name: "sort",
    schema: {
      type: "string",
      default: "createdAt",
    },
    description:
      "Fields to sort by. Use comma-separated field names. For descending order, use 'order=desc'.",
  },

  orderParam: {
    in: "query",
    name: "order",
    schema: {
      type: "string",
      default: "desc",
      enum: ["asc", "desc"],
    },
    description: "Sorting order for corresponding fields (asc or desc).",
  },

  searchParam: {
    in: "query",
    name: "search",
    schema: { type: "string" },
    description:
      "Search term to filter results. Applies to defined searchable fields.",
  },

  filtersParam: {
    in: "query",
    name: "filters",
    schema: {
      type: "object",
      additionalProperties: { type: "string" },
    },
    style: "deepObject",
    explode: true,
    description:
      "Additional filter criteria (key-value pairs) to refine results.",
  },

  documentIdParam: {
    in: "path",
    name: "id",
    required: true,
    schema: { type: "string" },
    description: "Unique identifier for the document.",
    example: "66545791f8545c2b3f6f47df",
  },
};
