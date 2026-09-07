import {
  Request,
  Response,
  NextFunction
} from "express";


export type UserRole =
  | "ADMIN"
  | "SUB_ADMIN"
  | "EDITOR"
  | "REVIEWER"
  | "AUTHOR";



export const authorize = (
  ...allowedRoles: UserRole[]
) => {


  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {


    if (!req.user) {

      return res.status(401).json({

        success: false,

        message: "Unauthorized"

      });

    }



    const userRole =
      String(req.user.role).toUpperCase() as UserRole;

    if (userRole === "ADMIN") {
      return next();
    }

    if (
      !allowedRoles.includes(
        userRole
      )
    ) {


      return res.status(403).json({

        success:false,

        message:"Forbidden: Access denied",

        userRole,

        requiredRoles: allowedRoles

      });

    }



    next();

  };

};