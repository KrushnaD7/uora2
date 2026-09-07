import { prisma } from "../../config/prisma";


export class PublicRepository {


  // Get Active Journals

  getJournals() {

    return prisma.journal.findMany({

      where: {

        status: "ACTIVE"

      },

      orderBy: {

        createdAt: "desc"

      },

      include: {

        settings: true,

        volumes: {

          select: {

            id: true,

            volumeNumber: true,

            year: true

          },

          orderBy: {

            volumeNumber: "asc"

          }

        }

      }

    });

  }




  // Get Active Journal Details
  // Exposes the full Journal > Volume > Issue > Article hierarchy

  getJournalBySlug(
    slug: string
  ) {

    return prisma.journal.findFirst({

      where: {

        slug,

        status: "ACTIVE"

      },

      include: {

        settings: true,

        volumes: {

          orderBy: {

            volumeNumber: "desc"

          },

          include: {

            issues: {

              where: {

                status: "PUBLISHED"

              },

              orderBy: {

                issueNumber: "desc"

              },

              include: {

                articles: {

                  where: {
                    publishedAt: { not: null }
                  },

                  orderBy: {

                    publishedAt: "desc"

                  },

                  include: {

                    journal: true

                  }

                }

              }

            }

          }

        }

      }

    });

  }




  // Get All Published Issues
  // Across all active journals (for author "Available Issues" view)

  getIssues() {

    return prisma.issue.findMany({

      where: {

        status: "PUBLISHED",

        journal: {

          status: "ACTIVE"

        }

      },

      include: {

        journal: {

          include: {

            settings: true

          }

        },

        volume: true,

        _count: {

          select: {

            articles: true

          }

        }

      },

      orderBy: [

        { publishedAt: "desc" }

      ],

      // Bounded so this endpoint can never fetch/serialize an unbounded
      // number of rows as the catalogue grows. 200 is generous for a public
      // "recent issues" listing; if the real count grows past this, switch
      // this endpoint to real page/limit query params (see public.controller
      // and public.repository history for why it wasn't done here directly —
      // it would change the response shape and needs a matching frontend
      // update).
      take: 200

    });

  }




  // Get Public Volume With Issues

  getVolumeById(
    id: string
  ) {

    return prisma.volume.findFirst({

      where: {

        id,

        journal: {

          status: "ACTIVE"

        }

      },

      include: {

        journal: {

          include: {

            settings: true

          }

        },

        issues: {

          where: {

            status: "PUBLISHED"

          },

          orderBy: {

            issueNumber: "desc"

          },

          include: {

            articles: {

              where: {
                publishedAt: { not: null }
              },

              orderBy: {

                publishedAt: "desc"

              }

            }

          }

        }

      }

    });

  }




  // Get Public Issue With Articles

  getIssueById(
    id: string
  ) {

    return prisma.issue.findFirst({

      where: {

        id,

        status: "PUBLISHED",

        journal: {

          status: "ACTIVE"

        }

      },

      include: {

        journal: {

          include: {

            settings: true

          }

        },

        volume: true,

        articles: {

          where: {
            publishedAt: { not: null }
          },

          orderBy: {

            publishedAt: "desc"

          },

          include: {

            journal: true

          }

        }

      }

    });

  }




  // Get Public Articles

  getArticles() {

    return prisma.article.findMany({

      where: {

        publishedAt: { not: null },

        journal: {

          status: "ACTIVE"

        },

        issue: {

          status: "PUBLISHED"

        }

      },

      include: {

        journal: true,

        issue: {

          include: {

            volume: true

          }

        }

      },

      orderBy: {

        publishedAt: "desc"

      },

      // See the comment in getIssues() above — same reasoning, same bound.
      take: 200

    });

  }




  // Lightweight lookup for streaming the PDF — the download endpoint only
  // ever needs the title and pdfUrl, not the full nested article graph that
  // getArticleById() builds for the article detail page.
  getArticleFileInfo(
    id: string
  ) {

    return prisma.article.findFirst({

      where: {

        id,

        publishedAt: { not: null },

        journal: {

          status: "ACTIVE"

        },

        issue: {

          status: "PUBLISHED"

        }

      },

      select: {

        title: true,

        pdfUrl: true

      }

    });

  }




  // Get Single Public Article

  getArticleById(
    id: string
  ) {

    return prisma.article.findFirst({

      where: {

        id,

        publishedAt: { not: null },

        journal: {

          status: "ACTIVE"

        },

        issue: {

          status: "PUBLISHED"

        }

      },

      include: {

        journal: {

          include: {

            settings: true

          }

        },

        issue: {

          include: {

            volume: true

          }

        },

        submission: {

          select: {

            id: true,

            title: true,

            abstract: true,

            paperId: true,

            authors: {

              orderBy: {

                authorOrder: "asc"

              },

              select: {

                authorOrder: true,

                isCorresponding: true,

                author: {

                  select: {

                    id: true,

                    fullName: true,

                    institution: true,

                    country: true,

                    designation: true,

                    orcid: true

                  }

                }

              }

            }

          }

        }

      }

    });

  }


}
