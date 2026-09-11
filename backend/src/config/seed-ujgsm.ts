import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { env } from "./env";

/**
 * One-time content seed for the UJGSM journal (Universal Journal of Green
 * Sci-Tech and Management) — its Volume 1 / Issue 1 (July–August 2025) and the
 * five articles that make up that issue, each with its PDF.
 *
 * Why this runs on the server rather than through the public API:
 *   - Article authorship is stored on the submission (SubmissionAuthor ->
 *     Author). The submission-create API only ever attaches the *logged-in*
 *     user's author profile, so driving it as admin would credit every paper
 *     to "UORA Administrator". Seeding directly lets us record the real
 *     authors, affiliations and corresponding emails.
 *   - The publish API forces publishedAt = now; here we can keep the real
 *     August 2025 publication date.
 *   - The production MySQL is only reachable from the app process (Unix
 *     socket), so this is the only place the writes can happen.
 *
 * It is fully idempotent: every step checks for what it would create and skips
 * it if already present, so it is safe to run on every boot. It does real work
 * exactly once and then always short-circuits at the journal check. Any failure
 * is caught by the caller and never blocks startup.
 */

const JOURNAL_SLUG = "ujgsm";

// Modest, factual descriptive copy inferred from the journal's scope and the
// contents of its first issue. Ethics and Author Guidelines are intentionally
// left unset so the public page falls back to the platform's built-in copy —
// those are editorial policy documents and are for the editors to supply.
const ABOUT =
  "The Universal Journal of Green Sci-Tech and Management (UJGSM) is a " +
  "peer-reviewed, open-access journal publishing original research at the " +
  "intersection of sustainable science, engineering technology and " +
  "management. It provides a platform for researchers, academics and " +
  "practitioners to share work that advances environmentally responsible " +
  "innovation and its practical application across industry.";

const AIMS_SCOPE =
  "UJGSM welcomes original research, reviews and case studies in areas " +
  "including — but not limited to — green and sustainable engineering, " +
  "renewable energy and carbon reduction, sustainable manufacturing and " +
  "materials, environmentally friendly fuels and machining, supply chain " +
  "and operations management, and the management practices that enable the " +
  "transition to a low-carbon economy. The journal favours studies that " +
  "combine technical rigour with real-world environmental and economic impact.";

type SeedAuthor = {
  fullName: string;
  designation?: string;
  institution?: string;
  email?: string;
};

type SeedArticle = {
  /** Stable, deterministic paper id — used as the idempotency key. */
  paperId: string;
  /** Source PDF filename under backend/seed-assets/ujgsm/. */
  pdf: string;
  title: string;
  abstract: string;
  keywords: string;
  doi: string;
  correspondingEmail: string;
  authors: SeedAuthor[];
};

/**
 * Split a raw "NameDesignation, Institution" string (the form the source DOCX
 * stored authors in, with no separator between name and role) into its parts,
 * by locating the first academic-role keyword.
 */
function splitAuthor(raw: string, email?: string): SeedAuthor {
  const roles = [
    "Research Scholar",
    "Assistant Professor",
    "Associate Professor",
    "Professor",
    "Head of Department",
    "Senior Lecturer",
    "Sr. Lecturer",
    "Lecturer",
  ];
  for (const role of roles) {
    const idx = raw.indexOf(role);
    if (idx > 0) {
      const fullName = raw.slice(0, idx).trim();
      const rest = raw.slice(idx + role.length).replace(/^[,\s]+/, "").trim();
      return { fullName, designation: role, institution: rest || undefined, email };
    }
  }
  return { fullName: raw.trim(), email };
}

const FALLBACK_EMAIL = process.env.ADMIN_EMAIL || "uorapublication@gmail.com";

const ARTICLES: SeedArticle[] = [
  {
    paperId: "UJGSM-2025-0001",
    pdf: "ujgsm-article1.pdf",
    doi: "10.5678/uora.ujgsm.2025.1.1",
    title:
      "Survey-Based Case Study of Supply Chain Management (SCM) in Construction Industries",
    keywords:
      "Supply Chain Management, Construction Industry, Material Management, ABC Analysis, Maharashtra, Inventory Control",
    correspondingEmail: "akashwankhade1@gmail.com",
    authors: [
      splitAuthor(
        "Akash WankhadeResearch Scholar, Dr. Babasaheb Ambedkar Marathwada University, Chhatrapati Sambhajinagar",
        "akashwankhade1@gmail.com"
      ),
      splitAuthor(
        "Gurupreet AttalAssistant Professor, Deogiri Institute of Engineering and Management Studies, Chhatrapati Sambhajinagar"
      ),
    ],
    abstract:
      "The construction industry is another sector that substantially contributes to economic growth and is also a very fragmented industry that is vulnerable to material management inefficiencies. Supply Chain Management (SCM) provides the systematic approaches to eliminate delays, wastage and costs, but it is not widely applied in the construction companies of regions in India. This paper gives survey-based case study research of construction firms in Maharashtra with special consideration given to Bindra Steel Pvt. Ltd.\n\nThe research uses various inventory control methods, including ABC, HML, FSN, VED, SDE analysis, and codification system to measure procurement, storage, consumption and criticality of construction materials. Findings indicate that material management constitutes about 75 percent of overall cost of production and as such, it is the most substantial area that could be considered in reduction of costs.\n\nIt is also revealed that scientific codification enhances traceability and decreases retrieval delays, and inventory classifications point out the important items that need to be carefully monitored. The research concludes that with structured SCM practices, cost efficiency, accuracy of forecasting and competitiveness of construction firms can be improved. The suggested recommendations are the implementation of digital inventory solutions, education, and active purchases programs, specific to the regional construction industry.",
  },
  {
    paperId: "UJGSM-2025-0002",
    pdf: "ujgsm-article2.pdf",
    doi: "10.5678/uora.ujgsm.2025.1.2",
    title:
      "Evaluating Environmental Benefits of Rooftop Solar PV through Carbon Displacement Analysis",
    keywords:
      "Rooftop Solar PV, Carbon Offset, CO₂ Reduction, Renewable Energy, Photovoltaic System, Sustainability, Solar Energy Performance, Environmental Impact, Seasonal Analysis, Greenhouse Gas Emissions",
    correspondingEmail: "sagarkauthalkar@gmail.com",
    authors: [
      splitAuthor(
        "Sagar KauthalkarResearch Scholar, Dr. Babasaheb Ambedkar Marathwad University, Chhatrapati Sambhajinagar",
        "sagarkauthalkar@gmail.com"
      ),
      splitAuthor(
        "Yogesh SatheAssociate Professor, Mechanical Engineering, Government College of Engineering Aurangabad, Chhatrapati Sambhajinagar"
      ),
    ],
    abstract:
      "This research delivered an extensive assessment of the carbon dioxide reductions that came from operating the 937 kWp solar photovoltaic (PV) rooftop system in Waluj, MIDC, Aurangabad. The study tracks one complete year (2024) through dashboard real-time data measurement to determine CO₂ displacement levels and yearly performance patterns.\n\nThe system produced 42.47 lakh kg of carbon offset annually while specifically reaching its maximum output in May and its minimum output in July due to variations in solar irradiation levels during summer and monsoon seasons. The monthly average carbon dioxide reduction reached 7.36 lakh kg per month based on calculated data indicating strong environmental benefits of this installation.\n\nThe most efficient operating days of the system happened mostly during summertime when conditions were best suited for solar power generation. This research investigation demonstrates the potential of rooftop solar systems to advance climate targets and presents optimization methods for increasing carbon reduction through performance tracking systems.",
  },
  {
    paperId: "UJGSM-2025-0003",
    pdf: "ujgsm-article3.pdf",
    doi: "10.5678/uora.ujgsm.2025.1.3",
    title:
      "A Review on Minimum Quantity Lubrication (MQL) Using Hybrid Nanofluids: Enhancing Tool Life and Surface Quality in Metal Cutting",
    keywords:
      "Minimum Quantity Lubrication (MQL), Hybrid Nanofluids, Machinability, Tool Wear, EN 24 Alloy Steel",
    correspondingEmail: FALLBACK_EMAIL,
    authors: [
      splitAuthor(
        "Komal MorankarResearch Scholar, Department of Mechanical Engineering, Jawaharlal Nehru Engineering College, Chh. Sambhajinagar (MS), India"
      ),
      splitAuthor(
        "Ravindra DeshmukhProfessor, Department of Mechanical Engineering, Jawaharlal Nehru Engineering College, Chh. Sambhajinagar (MS), India"
      ),
    ],
    abstract:
      "This review aims to explore the application of vegetable oil based hybrid nanofluids in MQL when machining a high strength steel called EN 24 alloy steel which finds applicability in the manufacturing industry. However, conventional cutting fluids, while cooling and lubricating, create environmental issues making way for MQL and eco-friendly biodegradable oils.\n\nBy dispersing nanoparticles in a vegetable oil base, hybrid nanofluids exhibit remarkable increase from thermal conductivity to wide-ranging cutting lubrication in machining. The purpose of this article review is twofold: focusing on the major machinability characteristics which are tool wear, surface finish and cutting forces along with evaluating the sustainability influence of hybrid nanofluids at MQL.\n\nThe outcomes of this research illustrate that hybrid nanofluids decrease the tool wear more significantly than MQL fluids while improving surface finish and reducing cutting force. These enhancements result from formation of a stable tribo-film and a better heat dissipation ability of the hybrid nanofluids and endorse increased tool longevity and improved machining accuracy.\n\nFurthermore, the choice of utilizing vegetable oil as base fluid is environmentally friendly since it eradicates generation of toxic waste and pollutes the environment. Based from the discussions made in this review, there are some areas that needs to fill up by new research as follow: economic analysis and long-term performance evaluation.",
  },
  {
    paperId: "UJGSM-2025-0004",
    pdf: "ujgsm-article4.pdf",
    doi: "10.5678/uora.ujgsm.2025.1.4",
    title:
      "Performance and Emission Characteristics of a Four-Stroke Engine Using E20 Fuel Blend",
    keywords:
      "Ethanol Blend, E20, Spark Ignition Engine, Emissions, Brake Thermal Efficiency",
    correspondingEmail: "pprashantpatil1@gmail.com",
    authors: [
      splitAuthor(
        "Prashant PatilAssistant Professor, Department of Technology, Shivaji University Kolhapur",
        "pprashantpatil1@gmail.com"
      ),
      splitAuthor("Umesh HiwalraleSr. Lecturer, Government Polytechnic, Jalna"),
      splitAuthor("Chandrashekhar IngleSr. Lecturer, Government Polytechnic, Ambad"),
    ],
    abstract:
      "The development of more eco-friendly fuels has promoted major research on ethanol-gasoline mixtures. Whereas most previous research highlights E85, the viability of lower ethanol blends like E20 is vital to developing countries because of their cost, availability and compatibility of materials.\n\nThe experiment assesses the performance and emission features of a four-stroke, air-cooled, single-cylinder spark ignition (SI) engine fuelled by E20 (20% ethanol, 80% gasoline). Key parameters compared using experimental trials comprised brake thermal efficiency, brake specific fuel consumption (BSFC), exhaust gas temperature, and controlled emissions (CO, HC, NOx) of pure gasoline and E20.\n\nThe results demonstrate that E20 contributes to a slight gain in thermal efficiency and a drastic decrease in CO and HC emissions with slight progress in NOx formation. It implies that E20 can be used as a non-polluting, cost-effective, and intermediate alternative to pure gasoline in small and medium-size operations.",
  },
  {
    paperId: "UJGSM-2025-0005",
    pdf: "ujgsm-article5.pdf",
    doi: "10.5678/uora.ujgsm.2025.1.5",
    title:
      "Enhancing Wear Performance of W-Cu Composites through Response Surface Methodology",
    keywords:
      "Tungsten–Copper Composites, Wear Rate Optimization, Response Surface Methodology, Box–Behnken Design, Design of Experiments",
    correspondingEmail: "harshalpkale@gmail.com",
    authors: [
      splitAuthor(
        "Harshal KaleHead of Department, Mechanical Engineering, Shreeyash College of Engineering and Technology, Aurangabad",
        "harshalpkale@gmail.com"
      ),
      splitAuthor(
        "Sambhaji SatheSr. Lecturer, Mechanical Engineering, Shreeyash College of Engineering and Technology, Aurangabad"
      ),
    ],
    abstract:
      "This paper aims to maximize wear resistance of tungsten-copper (W-Cu) composites on Response Surface Methodology (RSM) and Box-Behnken Design (BBD). The experimental variables included the reinforcement percentage, the temperature and the mechanical load.\n\nRegression and ANOVA analysis showed that temperature and percentage of Cu-W are significant variables that influence the wear rate, whereas quadratic terms showed weaker influences. The optimal conditions were established as 40% Cu, 200°C and 100 N load with the minimum wear rate and a desirability of 1.0.\n\nThe synergistic effects of temperature and reinforcement content on wear behavior were demonstrated with the help of contour and surface plots. It is found that RSM is efficient and minimizes experimental trials with accurate optimization to allow the production of W-Cu composites with an excellent level of durability in electrical contacts and high-temperature tooling.",
  },
];

// The whole issue is dated August 2025.
const PUBLISHED_AT = new Date("2025-08-20T00:00:00.000Z");

/** Copy a seeded PDF into UPLOADS_DIR if it is not already there. */
function ensurePdf(fileName: string): boolean {
  const src = path.join(__dirname, "..", "..", "seed-assets", "ujgsm", fileName);
  const dest = path.resolve(env.uploadsDir, fileName);
  try {
    if (!fs.existsSync(src)) {
      console.warn(`[seed:ujgsm] source PDF missing, skipping copy: ${src}`);
      return false;
    }
    if (!fs.existsSync(env.uploadsDir)) {
      fs.mkdirSync(env.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`[seed:ujgsm] copied ${fileName} -> ${dest}`);
    }
    return true;
  } catch (err) {
    console.warn(`[seed:ujgsm] could not place ${fileName}:`, err);
    return false;
  }
}

/**
 * Seed the UJGSM journal, its first issue and articles. Idempotent and safe to
 * call on every startup.
 */
export async function seedUjgsm(): Promise<string> {
  // Fast path: nothing to do once the journal and all five articles exist.
  const existing = await prisma.journal.findUnique({
    where: { slug: JOURNAL_SLUG },
    include: { articles: true },
  });
  if (existing && existing.articles.length >= ARTICLES.length) {
    return "ujgsm already seeded";
  }

  // 1. Journal
  const journal =
    existing ??
    (await prisma.journal.create({
      data: {
        name: "Universal Journal of Green Sci-Tech and Management",
        shortName: "UJGSM",
        slug: JOURNAL_SLUG,
        subdomain: JOURNAL_SLUG,
        email: FALLBACK_EMAIL,
        status: "ACTIVE",
      },
    }));

  // 2. Settings (About + Aims & Scope; ethics/guidelines left to fallback)
  const settings = await prisma.journalSetting.findUnique({
    where: { journalId: journal.id },
  });
  if (!settings) {
    await prisma.journalSetting.create({
      data: {
        journalId: journal.id,
        about: ABOUT,
        aimsScope: AIMS_SCOPE,
        contactEmail: FALLBACK_EMAIL,
      },
    });
  }

  // 3. Volume 1 (2025)
  let volume = await prisma.volume.findFirst({
    where: { journalId: journal.id, volumeNumber: 1 },
  });
  if (!volume) {
    volume = await prisma.volume.create({
      data: { journalId: journal.id, volumeNumber: 1, year: 2025 },
    });
  }

  // 4. Issue 1 (July–August 2025), published
  let issue = await prisma.issue.findFirst({
    where: { volumeId: volume.id, issueNumber: 1 },
  });
  if (!issue) {
    issue = await prisma.issue.create({
      data: {
        journalId: journal.id,
        volumeId: volume.id,
        issueNumber: 1,
        title: "Vol. 1 No. 1 (2025): July–August Issue",
        status: "PUBLISHED",
        publishedAt: PUBLISHED_AT,
      },
    });
  }

  // 5. Articles — each as an accepted+published submission with real authors
  let created = 0;
  for (const art of ARTICLES) {
    const already = await prisma.submission.findUnique({
      where: { paperId: art.paperId },
    });
    if (already) continue;

    ensurePdf(art.pdf);
    const pdfUrl = `/uploads/${art.pdf}`;

    await prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          journalId: journal.id,
          paperId: art.paperId,
          title: art.title,
          abstract: `${art.abstract}\n\nKeywords: ${art.keywords}`,
          correspondingEmail: art.correspondingEmail,
          status: "PUBLISHED",
        },
      });

      // Authors (real names/affiliations) + join rows
      for (let i = 0; i < art.authors.length; i++) {
        const a = art.authors[i];
        const author = await tx.author.create({
          data: {
            fullName: a.fullName,
            email: a.email || null,
            institution: a.institution || null,
            designation: a.designation || null,
          },
        });
        await tx.submissionAuthor.create({
          data: {
            submissionId: submission.id,
            authorId: author.id,
            authorOrder: i + 1,
            isCorresponding: i === 0,
          },
        });
      }

      // Manuscript file record (points at the copied PDF)
      await tx.submissionFile.create({
        data: {
          submissionId: submission.id,
          fileType: "MANUSCRIPT",
          originalName: art.pdf,
          storedName: art.pdf,
          filePath: `uploads/${art.pdf}`,
          mimeType: "application/pdf",
        },
      });

      await tx.submissionStatusHistory.create({
        data: {
          submissionId: submission.id,
          status: "PUBLISHED",
          remarks: "Seeded UJGSM Vol. 1 Issue 1 article",
        },
      });

      // The published article
      await tx.article.create({
        data: {
          journalId: journal.id,
          issueId: issue!.id,
          submissionId: submission.id,
          title: art.title,
          doi: art.doi,
          pdfUrl,
          publishedAt: PUBLISHED_AT,
        },
      });
    });
    created++;
  }

  return `ujgsm seeded (journal ${journal.id}, ${created} new article(s))`;
}
