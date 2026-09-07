import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { prisma } from "../../config/prisma";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

const userRepository = new UserRepository();



export class UserService {



  async createUser(data: any) {


    const existingUser =
      await userRepository.findByEmail(
        data.email
      );


    if (existingUser) {

      throw new ConflictError(
        "Email already exists"
      );

    }


    const hashedPassword =
      await bcrypt.hash(
        data.password,
        10
      );

    // Create the user and its role-specific profile atomically.
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          ...data,
          password: hashedPassword
        }
      });

      if (created.role === "AUTHOR") {
        await tx.author.create({
          data: {
            userId: created.id,
            fullName: created.name,
            email: created.email
          }
        });
      } else if (created.role === "REVIEWER") {
        await tx.reviewer.create({
          data: {
            fullName: created.name,
            email: created.email,
            isActive: true
          }
        });
      }

      return created;
    });


    return this.removePassword(user);

  }




  async getUsers() {


    const users =
      await userRepository.findAll();


    return users.map(
      user => this.removePassword(user)
    );

  }





  async getUserById(id:string) {


    const user =
      await userRepository.findById(id);



    if(!user){

      throw new NotFoundError(
        "User not found"
      );

    }


    return this.removePassword(user);

  }





  async updateUser(
    id:string,
    data:any
  ){


    if(data.password){

      data.password =
        await bcrypt.hash(
          data.password,
          10
        );

    }



    // Update the user and its role-specific profile atomically.
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.users.update({
        where: { id },
        data
      });

      if (data.role === "AUTHOR") {
        const exists = await tx.author.findFirst({ where: { userId: updated.id } });
        if (!exists) {
          await tx.author.create({
            data: {
              userId: updated.id,
              fullName: updated.name,
              email: updated.email
            }
          });
        }
      } else if (data.role === "REVIEWER") {
        const exists = await tx.reviewer.findFirst({ where: { email: updated.email } });
        if (!exists) {
          await tx.reviewer.create({
            data: {
              fullName: updated.name,
              email: updated.email,
              isActive: true
            }
          });
        }
      }

      return updated;
    });


    return this.removePassword(user);

  }





  async deleteUser(id:string){


    await userRepository.delete(id);


    return {

      message:
      "User deleted successfully"

    };

  }





  private removePassword(user:any){


    const {

      password,

      ...safeUser

    } = user;


    return safeUser;

  }


}