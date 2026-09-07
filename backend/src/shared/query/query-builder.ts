import { getPagination } from "./pagination";
import { getSorting } from "./sorting";
import { buildSearch } from "./search";
import { removeUndefined } from "./filters";

export const buildQuery = ({
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  searchFields = [],
  filters = {},
}: any) => {
  const pagination = getPagination({
    page,
    limit,
  });

  const where = {
    ...removeUndefined(filters),
    ...buildSearch(
      search,
      searchFields
    ),
  };

  const orderBy = getSorting({
    sortBy,
    sortOrder,
  });

  return {
    where,
    orderBy,
    ...pagination,
  };
};