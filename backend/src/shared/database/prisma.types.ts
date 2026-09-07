export interface QueryOptions {

    page?: number;

    limit?: number;

    search?: string;

    sortBy?: string;

    sortOrder?: "asc" | "desc";

    filters?: Record<string, any>;

}

export interface PaginatedResult<T>{

    data:T[];

    total:number;

}