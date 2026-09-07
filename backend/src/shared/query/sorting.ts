export interface SortingOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getSorting = (
  options: SortingOptions,
  defaultField = "createdAt"
) => {
  return {
    [options.sortBy || defaultField]:
      options.sortOrder === "asc"
        ? "asc"
        : "desc",
  };
};