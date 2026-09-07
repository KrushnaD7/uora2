import { z } from "zod";


export const publishArticleSchema = z.object({

  body: z.object({

    submissionId:
      z.string().uuid(),


    journalId:
      z.string().uuid(),


    issueId:
      z.string().uuid(),


    title:
      z.string().optional(),


    doi:
      z.string().optional(),


    pages:
      z.string().optional(),


    pdfUrl:
      z.string().optional(),


    scheduledPublishAt:
      z.string().datetime().optional(),


  })

});



export const updateArticleSchema = z.object({

  body: z.object({

    title:
      z.string().optional(),


    doi:
      z.string().optional(),


    pages:
      z.string().optional(),


    pdfUrl:
      z.string().optional(),


  })

});



export type PublishArticleInput =
  z.infer<
    typeof publishArticleSchema
  >["body"];



export type UpdateArticleInput =
  z.infer<
    typeof updateArticleSchema
  >["body"];