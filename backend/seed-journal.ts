import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default journals...");
  
  // 1. Seed UORA-AI
  const existingAI = await prisma.journal.findFirst({
    where: { slug: "uora-ai" }
  });

  if (!existingAI) {
    const aiJournal = await prisma.journal.create({
      data: {
        name: "UORA Journal of Artificial Intelligence",
        shortName: "UORA-AI",
        slug: "uora-ai",
        subdomain: "ai",
        issn: "1234-5678",
        email: "ai@uora.edu",
        status: "ACTIVE",
        settings: {
          create: {
            about: "Universal peer-reviewed academic journal published by UORA Publications focusing on Artificial Intelligence.",
            aimsScope: "This journal covers research and developments in machine learning, neural networks, computer vision, natural language processing, and emerging AI technologies.",
            ethics: "UORA Publications is committed to maintaining the highest ethical standards of publishing. All manuscripts undergo a double-blind peer-review process, ensuring fairness, transparency, and scientific integrity."
          }
        }
      }
    });
    console.log("Successfully created UORA-AI journal:", aiJournal.name);
  } else {
    console.log("UORA-AI journal already exists.");
  }

  // 2. Seed UJGSM
  const existingGreen = await prisma.journal.findFirst({
    where: { slug: "ujgsm" }
  });

  if (!existingGreen) {
    const greenJournal = await prisma.journal.create({
      data: {
        name: "Universal Journal of Green Sci-Tech and Management",
        shortName: "UJGSM",
        slug: "ujgsm",
        subdomain: "ujgsm",
        issn: "3107-9326",
        email: "contact@uorapublications.com",
        phone: "+91 9766930707",
        status: "ACTIVE",
        settings: {
          create: {
            about: "The Universal Journal of Green Sci-Tech and Management (UJGSM) is a bi-monthly, peer-reviewed, open-access journal published by the Universal Oneness Research Association (UORA). It is dedicated to bridging the gap between research and practice in science, technology, and management, with a specific focus on sustainable solutions.",
            aimsScope: "UJGSM covers a broad spectrum of multidisciplinary areas. It aims to publish original research articles, reviews, case studies, and technical notes that make significant contributions to green technology, environmental engineering, sustainable business models, renewable energy, and eco-friendly management policies.",
            ethics: "UJGSM is committed to maintaining the highest ethical standards of publishing. All manuscripts undergo a double-blind peer-review process, ensuring fairness, transparency, and scientific integrity. We adhere to standard editorial and publishing ethics guidelines.",
            contactEmail: "contact@uorapublications.com",
            contactPhone: "+91 9766930707",
            address: "E-1/8 Mathura Nagar, N-6, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431003, India"
          }
        }
      }
    });
    console.log("Successfully created UJGSM journal:", greenJournal.name);
  } else {
    console.log("UJGSM journal already exists.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
