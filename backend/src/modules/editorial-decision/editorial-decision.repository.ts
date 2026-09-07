import { prisma } from "../../config/prisma";


export class EditorialDecisionRepository {


  async updateSubmissionStatus(
    submissionId: string,
    status: string
  ) {

    return prisma.submission.update({

      where: {
        id: submissionId
      },

      data: {
        status: status as any
      }

    });

  }




  async createStatusHistory(
    submissionId: string,
    data: any
  ) {

    return prisma.submissionStatusHistory.create({

      data: {

        submissionId,

        status: data.status,

        remarks: data.remarks || null

      }

    });

  }




  async getStatusHistory(
    submissionId: string
  ) {

    return prisma.submissionStatusHistory.findMany({

      where: {

        submissionId

      },

      orderBy: {

        changedAt: "desc"

      }

    });

  }


}