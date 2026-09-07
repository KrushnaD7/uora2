import {
  Request,
  Response,
  NextFunction
} from "express";


import {
  ZodTypeAny
} from "zod";



const validate = (
  schema: ZodTypeAny
) => {


  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {


    try {


      const result =
        schema.safeParse({

          body: req.body,

          params: req.params,

          query: req.query

        });



      if (!result.success) {


        res.status(422).json({

          success: false,

          message: "Validation error",

          errors:
            result.error.issues

        });


        return;

      }



      next();



    } catch (error) {


      res.status(500).json({

        success: false,

        message:
          "Validation failed"

      });


    }


  };


};



export default validate;