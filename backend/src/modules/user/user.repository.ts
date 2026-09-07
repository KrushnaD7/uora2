import { prisma } from "../../config/prisma";


export class UserRepository {


  create(data:any){

    return prisma.users.create({
      data
    });

  }


  findAll(){

    return prisma.users.findMany({
      orderBy:{
        createdAt:"desc"
      },
      // Defense in depth: never pull password hashes or one-time token
      // hashes into app memory for a bulk admin listing, even though the
      // service layer already strips the password before the response goes
      // out. (Explicit field list, not an exclude — safer if new sensitive
      // columns are added to the model later.)
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  }


  findById(id:string){

    return prisma.users.findUnique({
      where:{
        id
      }
    });

  }


  findByEmail(email:string){

    return prisma.users.findUnique({
      where:{
        email
      }
    });

  }


  update(
    id:string,
    data:any
  ){

    return prisma.users.update({

      where:{
        id
      },

      data

    });

  }


  delete(id:string){

    return prisma.users.delete({

      where:{
        id
      }

    });

  }

}