import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data in dependency order
  await prisma.jobSubbie.deleteMany();
  await prisma.variation.deleteMany();
  await prisma.progressClaim.deleteMany();
  await prisma.document.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.job.deleteMany();
  await prisma.subcontractor.deleteMany();
  await prisma.settings.deleteMany();

  // --- Settings ---
  await prisma.settings.create({
    data: {
      id: "default",
      businessName: "Luke's Fit-Out",
      abn: "",
      phone: "",
      email: "",
      address: "",
      jobPrefix: "FO-",
      nextJobNumber: 4,
    },
  });

  // --- Jobs ---
  const job1 = await prisma.job.create({
    data: {
      jobNumber: "FO-001",
      clientName: "Smith Residence",
      siteAddress: "42 Banksia Ave, Thornbury VIC 3071",
      phone: "0412 345 678",
      email: "john.smith@email.com",
      phase: "on-site",
      quoteAmount: 185000,
      quoteSentDate: new Date("2025-11-10"),
      contractSigned: new Date("2025-11-25"),
      startDate: new Date("2026-01-06"),
      targetEndDate: new Date("2026-05-30"),
      percentComplete: 65,
      notes: "Full interior fit-out including kitchen, bathrooms, and living areas.",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      jobNumber: "FO-002",
      clientName: "Acme Office",
      siteAddress: "Level 3, 100 Collins St, Melbourne VIC 3000",
      phone: "03 9876 5432",
      email: "projects@acmecorp.com.au",
      phase: "pre-con",
      quoteAmount: 420000,
      quoteSentDate: new Date("2026-02-01"),
      contractSigned: new Date("2026-02-20"),
      startDate: new Date("2026-04-14"),
      targetEndDate: new Date("2026-09-30"),
      percentComplete: 10,
      notes: "Commercial office fit-out. Awaiting council approval for partition walls.",
    },
  });

  await prisma.job.create({
    data: {
      jobNumber: "FO-003",
      clientName: "Chan Apartment",
      siteAddress: "Unit 8, 15 Harbour Rd, Docklands VIC 3008",
      phone: "0498 765 432",
      email: "mei.chan@gmail.com",
      phase: "quoting",
      quoteAmount: 95000,
      percentComplete: 0,
      notes: "Apartment renovation — kitchen and ensuite. Client reviewing quote.",
    },
  });

  // --- Subcontractors ---
  const sparkElectric = await prisma.subcontractor.create({
    data: {
      trade: "Electrician",
      companyName: "Spark Electric",
      contactName: "Dave Nguyen",
      phone: "0411 222 333",
      email: "dave@sparkelectric.com.au",
      abn: "12 345 678 901",
      insuranceExpiry: new Date("2026-12-31"),
      rateBasis: "Per hour — $95 + GST",
      rating: 5,
      notes: "Reliable, always on time. Preferred sparky.",
    },
  });

  await prisma.subcontractor.create({
    data: {
      trade: "Plumber",
      companyName: "AquaFlow Plumbing",
      contactName: "Sarah Reilly",
      phone: "0422 333 444",
      email: "sarah@aquaflow.com.au",
      abn: "23 456 789 012",
      insuranceExpiry: new Date("2026-09-15"),
      rateBasis: "Per job quote",
      rating: 4,
      notes: "Good work, sometimes runs a day behind schedule.",
    },
  });

  await prisma.subcontractor.create({
    data: {
      trade: "Painter",
      companyName: "Pro Coat Painters",
      contactName: "Marco Bianchi",
      phone: "0433 444 555",
      email: "marco@procoat.com.au",
      abn: "34 567 890 123",
      insuranceExpiry: new Date("2027-03-01"),
      rateBasis: "Per sqm — $18",
      rating: 4,
      notes: "Clean finish. Good at colour-matching.",
    },
  });

  const tbdPlastering = await prisma.subcontractor.create({
    data: {
      trade: "Plasterer",
      companyName: "TBD Plastering",
      contactName: null,
      phone: null,
      email: null,
      abn: null,
      insuranceExpiry: null,
      rateBasis: null,
      rating: null,
      notes: "Need to find a plasterer — asking around for recommendations.",
    },
  });

  // --- Daily Logs on FO-001 ---
  const today = new Date("2026-03-15");
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);

  await prisma.dailyLog.create({
    data: {
      jobId: job1.id,
      date: yesterday,
      notes:
        "Electrician completed rough-in for kitchen island. Plumber started second-fix in ensuite. Waiting on tiles delivery — expected tomorrow.",
      weather: "Sunny, 24°C",
      onSite: "Dave (Spark Electric), Sarah (AquaFlow), 2 labourers",
    },
  });

  await prisma.dailyLog.create({
    data: {
      jobId: job1.id,
      date: dayBefore,
      notes:
        "Framing for built-in wardrobes completed. Electrician ran cabling for new downlights in living area. Minor delay — wrong plasterboard delivered, sent back.",
      weather: "Overcast, 18°C, light rain in afternoon",
      onSite: "Dave (Spark Electric), 2 labourers, Luke",
    },
  });

  // --- Variation on FO-001 ---
  await prisma.variation.create({
    data: {
      jobId: job1.id,
      title: "Additional power points in kitchen",
      description:
        "Client requested 4 extra double GPOs along the kitchen island bench and splashback. Includes cabling, mounting, and connection to existing board.",
      amount: 2800,
      status: "approved",
    },
  });

  // --- Progress Claim on FO-001 ---
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  await prisma.progressClaim.create({
    data: {
      jobId: job1.id,
      claimNumber: 1,
      amount: 55500,
      dateSent: twoWeeksAgo,
      datePaid: oneWeekAgo,
      status: "paid",
    },
  });

  // --- JobSubbie: Electrician linked to FO-001 ---
  await prisma.jobSubbie.create({
    data: {
      jobId: job1.id,
      subcontractorId: sparkElectric.id,
      quoteAmount: 18500,
      status: "on-site",
      scheduledStart: new Date("2026-01-13"),
      scheduledEnd: new Date("2026-04-30"),
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
