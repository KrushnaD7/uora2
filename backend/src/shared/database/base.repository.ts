import { PaginatedResult } from "./prisma.types";

export abstract class BaseRepository {

    protected async paginate<T>(

        model:any,

        query:any,

        include?:any

    ):Promise<PaginatedResult<T>>{

        const [data,total] =
        await Promise.all([

            model.findMany({

                where:query.where,

                orderBy:query.orderBy,

                skip:query.skip,

                take:query.take,

                include

            }),

            model.count({

                where:query.where

            })

        ]);


        return{

            data,

            total

        };

    }

}