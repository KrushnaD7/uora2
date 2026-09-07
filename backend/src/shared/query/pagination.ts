export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export const getPagination = (
  options: PaginationOptions
): PaginationResult => {
  const page = Math.max(
    Number(options.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(options.limit) || 10, 1),
    100
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};