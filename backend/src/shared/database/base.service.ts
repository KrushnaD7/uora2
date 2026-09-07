import { buildQuery } from "../query/query-builder";
import { getPaginationMeta } from "../query/pagination";

export abstract class BaseService {

    protected build(query:any){

        return buildQuery(query);

    }

    protected response(

        result:any,

        page:number,

        limit:number

    ){

        return{

            meta:getPaginationMeta(

                result.total,

                page,

                limit

            ),

            data:result.data

        };

    }

}