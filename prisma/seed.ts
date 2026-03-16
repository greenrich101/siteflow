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
      abn: "51 824 753 619",
      phone: "0438 112 009",
      email: "luke@lukesfitout.com.au",
      address: "Unit 4, 29 Industrial Dr, Thomastown VIC 3074",
      jobPrefix: "FO-",
      nextJobNumber: 13,
    },
  });

  const today = new Date("2026-03-15");

  // Helper for relative dates
  function daysAgo(n: number) {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  }
  function daysFromNow(n: number) {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  }

  // ==================== JOBS ====================

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
      notes: "Full interior fit-out including kitchen, bathrooms, and living areas. Client very particular about finishes.",
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
      notes: "Commercial office fit-out. Awaiting council approval for partition walls. Need to coordinate with building management for after-hours access.",
    },
  });

  const job3 = await prisma.job.create({
    data: {
      jobNumber: "FO-003",
      clientName: "Chan Apartment",
      siteAddress: "Unit 8, 15 Harbour Rd, Docklands VIC 3008",
      phone: "0498 765 432",
      email: "mei.chan@gmail.com",
      phase: "quoting",
      quoteAmount: 95000,
      percentComplete: 0,
      notes: "Apartment renovation — kitchen and ensuite. Client reviewing quote. May want to add laundry if budget allows.",
    },
  });

  const job4 = await prisma.job.create({
    data: {
      jobNumber: "FO-004",
      clientName: "Bayside Medical Centre",
      siteAddress: "88 Beach Rd, Sandringham VIC 3191",
      phone: "03 9521 8800",
      email: "admin@baysidemedical.com.au",
      phase: "on-site",
      quoteAmount: 310000,
      quoteSentDate: new Date("2025-10-05"),
      contractSigned: new Date("2025-10-22"),
      startDate: new Date("2025-12-02"),
      targetEndDate: new Date("2026-04-15"),
      percentComplete: 82,
      notes: "Medical clinic fit-out. 6 consult rooms, reception, and procedure room. Strict infection control requirements for finishes. Nearly done — just snagging and final fix.",
    },
  });

  const job5 = await prisma.job.create({
    data: {
      jobNumber: "FO-005",
      clientName: "Nguyen Family Home",
      siteAddress: "17 Elm St, Box Hill VIC 3128",
      phone: "0401 998 223",
      email: "trang.nguyen@outlook.com",
      phase: "complete",
      quoteAmount: 142000,
      quoteSentDate: new Date("2025-06-15"),
      contractSigned: new Date("2025-07-01"),
      startDate: new Date("2025-08-11"),
      targetEndDate: new Date("2025-12-20"),
      percentComplete: 100,
      notes: "Full house renovation — kitchen, 2 bathrooms, and open plan living. Completed on time. Client very happy, left a Google review.",
    },
  });

  const job6 = await prisma.job.create({
    data: {
      jobNumber: "FO-006",
      clientName: "The Brunswick Hotel",
      siteAddress: "280 Sydney Rd, Brunswick VIC 3056",
      phone: "03 9383 2100",
      email: "manager@brunswickhotel.com.au",
      phase: "on-site",
      quoteAmount: 575000,
      quoteSentDate: new Date("2025-09-20"),
      contractSigned: new Date("2025-10-15"),
      startDate: new Date("2025-11-18"),
      targetEndDate: new Date("2026-06-30"),
      percentComplete: 45,
      notes: "Pub renovation — new bar area, kitchen upgrade, dining room refresh, and outdoor beer garden. Working around partial trade — venue open Thu-Sun during works.",
    },
  });

  const job7 = await prisma.job.create({
    data: {
      jobNumber: "FO-007",
      clientName: "Rivera Dental",
      siteAddress: "Suite 2, 45 High St, Prahran VIC 3181",
      phone: "0423 551 882",
      email: "dr.rivera@riveradental.com.au",
      phase: "quoting",
      quoteAmount: 198000,
      percentComplete: 0,
      notes: "Dental surgery fit-out. Need specialist plumbing for chair units. Waiting on equipment specs from supplier before finalising quote.",
    },
  });

  const job8 = await prisma.job.create({
    data: {
      jobNumber: "FO-008",
      clientName: "Patel Townhouse",
      siteAddress: "3/22 Station St, Fairfield VIC 3078",
      phone: "0455 321 009",
      email: "ravi.patel@gmail.com",
      phase: "pre-con",
      quoteAmount: 78000,
      quoteSentDate: new Date("2026-02-18"),
      contractSigned: new Date("2026-03-05"),
      startDate: new Date("2026-04-07"),
      targetEndDate: new Date("2026-06-20"),
      percentComplete: 5,
      notes: "Kitchen and bathroom reno. Small job but good margin. Client wants to start ASAP — ordering materials now.",
    },
  });

  const job9 = await prisma.job.create({
    data: {
      jobNumber: "FO-009",
      clientName: "Greenwood Co-Working",
      siteAddress: "Level 1, 55 Smith St, Fitzroy VIC 3065",
      phone: "0412 009 887",
      email: "hello@greenwoodcowork.com.au",
      phase: "complete",
      quoteAmount: 265000,
      quoteSentDate: new Date("2025-04-10"),
      contractSigned: new Date("2025-05-01"),
      startDate: new Date("2025-06-16"),
      targetEndDate: new Date("2025-11-15"),
      percentComplete: 100,
      notes: "Co-working space fit-out. 12 private offices, hot desk area, meeting rooms, kitchenette. Completed under budget. Retained for future expansion work.",
    },
  });

  const job10 = await prisma.job.create({
    data: {
      jobNumber: "FO-010",
      clientName: "Williams Granny Flat",
      siteAddress: "Rear, 9 Oak Cres, Preston VIC 3072",
      phone: "0408 776 543",
      email: "b.williams@bigpond.com",
      phase: "quoting",
      quoteAmount: 62000,
      percentComplete: 0,
      notes: "Internal fit-out of existing granny flat shell. Kitchen, bathroom, flooring, paint. Budget-conscious client.",
    },
  });

  const job11 = await prisma.job.create({
    data: {
      jobNumber: "FO-011",
      clientName: "Southbank Penthouse",
      siteAddress: "Level 42, 1 Freshwater Pl, Southbank VIC 3006",
      phone: "0499 123 456",
      email: "james.h@luxeliving.com.au",
      phase: "pre-con",
      quoteAmount: 890000,
      quoteSentDate: new Date("2026-01-15"),
      contractSigned: new Date("2026-02-10"),
      startDate: new Date("2026-05-05"),
      targetEndDate: new Date("2026-12-15"),
      percentComplete: 3,
      notes: "High-end penthouse renovation. Italian marble, custom joinery, smart home integration. Client overseas — communicating via agent. Biggest job this year.",
    },
  });

  const job12 = await prisma.job.create({
    data: {
      jobNumber: "FO-012",
      clientName: "Little Ones Childcare",
      siteAddress: "12 Park Ave, Northcote VIC 3070",
      phone: "03 9482 3300",
      email: "director@littleonescc.com.au",
      phase: "on-site",
      quoteAmount: 245000,
      quoteSentDate: new Date("2025-12-01"),
      contractSigned: new Date("2025-12-18"),
      startDate: new Date("2026-02-02"),
      targetEndDate: new Date("2026-05-15"),
      percentComplete: 38,
      notes: "Childcare centre fit-out. Strict safety regs — rounded edges, non-toxic finishes, soft flooring. Working during centre closure periods only (weekends + holidays).",
    },
  });

  // ==================== SUBCONTRACTORS ====================

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
      notes: "Reliable, always on time. Preferred sparky. Does resi and commercial.",
    },
  });

  const aquaFlow = await prisma.subcontractor.create({
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
      notes: "Good work, sometimes runs a day behind schedule. Great on commercial jobs.",
    },
  });

  const proCoat = await prisma.subcontractor.create({
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
      notes: "Clean finish. Good at colour-matching. Crew of 3-4 guys.",
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

  const precisionTiling = await prisma.subcontractor.create({
    data: {
      trade: "Tiler",
      companyName: "Precision Tiling",
      contactName: "Tony Caruso",
      phone: "0444 555 666",
      email: "tony@precisiontiling.com.au",
      abn: "45 678 901 234",
      insuranceExpiry: new Date("2026-11-30"),
      rateBasis: "Per sqm — $85 (supply + install)",
      rating: 5,
      notes: "Top quality work. Specialises in large-format tiles and waterproofing. Booked out 3-4 weeks in advance.",
    },
  });

  const solidCarpentry = await prisma.subcontractor.create({
    data: {
      trade: "Carpenter",
      companyName: "Solid Carpentry",
      contactName: "Ben Taylor",
      phone: "0455 666 777",
      email: "ben@solidcarpentry.com.au",
      abn: "56 789 012 345",
      insuranceExpiry: new Date("2027-01-15"),
      rateBasis: "Day rate — $650 + GST",
      rating: 5,
      notes: "Excellent framer and second-fix carpenter. Does custom joinery too. Go-to chippy for quality jobs.",
    },
  });

  const coolAir = await prisma.subcontractor.create({
    data: {
      trade: "HVAC",
      companyName: "Cool Air Mechanical",
      contactName: "Jim Papadopoulos",
      phone: "0466 777 888",
      email: "jim@coolairmelb.com.au",
      abn: "67 890 123 456",
      insuranceExpiry: new Date("2026-08-20"),
      rateBasis: "Per job quote",
      rating: 3,
      notes: "Decent work but communication could be better. Sometimes hard to pin down for a start date. Only option for split system installs at short notice.",
    },
  });

  const eliteGlass = await prisma.subcontractor.create({
    data: {
      trade: "Glazier",
      companyName: "Elite Glass & Mirrors",
      contactName: "Steve Morrison",
      phone: "0477 888 999",
      email: "steve@eliteglass.com.au",
      abn: "78 901 234 567",
      insuranceExpiry: new Date("2026-10-01"),
      rateBasis: "Per job quote",
      rating: 4,
      notes: "Shower screens, mirrors, splashbacks. Good turnaround on custom orders. 2-3 week lead time for frameless.",
    },
  });

  const melbCabinets = await prisma.subcontractor.create({
    data: {
      trade: "Cabinet Maker",
      companyName: "Melbourne Custom Cabinets",
      contactName: "Liam O'Brien",
      phone: "0488 999 000",
      email: "liam@melbcabinets.com.au",
      abn: "89 012 345 678",
      insuranceExpiry: new Date("2027-02-28"),
      rateBasis: "Per job quote (measure + manufacture + install)",
      rating: 5,
      notes: "Best cabinetmaker we use. 4-6 week lead time from measure. Does kitchens, vanities, built-in robes. Not cheap but worth it.",
    },
  });

  const allFloors = await prisma.subcontractor.create({
    data: {
      trade: "Flooring",
      companyName: "All Floors Melbourne",
      contactName: "Katrina Wells",
      phone: "0499 000 111",
      email: "kat@allfloorsmelb.com.au",
      abn: "90 123 456 789",
      insuranceExpiry: new Date("2026-07-31"),
      rateBasis: "Per sqm — varies by product",
      rating: 4,
      notes: "Timber, vinyl plank, hybrid. Good install quality. Supply through their own warehouse so pricing is competitive.",
    },
  });

  const innerCityDemo = await prisma.subcontractor.create({
    data: {
      trade: "Demolition",
      companyName: "Inner City Demo",
      contactName: "Mick Flanagan",
      phone: "0400 111 222",
      email: "mick@innercitydemo.com.au",
      abn: "01 234 567 890",
      insuranceExpiry: new Date("2026-06-15"),
      rateBasis: "Day rate — $1,800 (2-man crew + skip)",
      rating: 4,
      notes: "Careful strip-out work. Good for apartments and commercial where you need to be clean and quiet. Includes waste removal.",
    },
  });

  const firestopPro = await prisma.subcontractor.create({
    data: {
      trade: "Fire Protection",
      companyName: "Firestop Pro",
      contactName: "Angela Chen",
      phone: "0411 333 444",
      email: "angela@firestoppro.com.au",
      abn: "11 222 333 444",
      insuranceExpiry: new Date("2027-04-30"),
      rateBasis: "Per job quote",
      rating: 4,
      notes: "Fire-rated walls, penetrations, compliance certs. Essential for commercial and childcare jobs. Good turnaround on certificates.",
    },
  });

  // ==================== DAILY LOGS ====================

  // FO-001 (Smith Residence) — on-site, 65%
  await prisma.dailyLog.createMany({
    data: [
      {
        jobId: job1.id,
        date: daysAgo(1),
        notes: "Electrician completed rough-in for kitchen island. Plumber started second-fix in ensuite. Waiting on tiles delivery — expected tomorrow.",
        weather: "Sunny, 24°C",
        onSite: "Dave (Spark Electric), Sarah (AquaFlow), 2 labourers",
      },
      {
        jobId: job1.id,
        date: daysAgo(2),
        notes: "Framing for built-in wardrobes completed. Electrician ran cabling for new downlights in living area. Minor delay — wrong plasterboard delivered, sent back.",
        weather: "Overcast, 18°C, light rain in afternoon",
        onSite: "Dave (Spark Electric), 2 labourers, Luke",
      },
      {
        jobId: job1.id,
        date: daysAgo(3),
        notes: "Tiler finished main bathroom floor and walls. Looks fantastic — client visited and loved the herringbone pattern. Started waterproofing in ensuite.",
        weather: "Sunny, 27°C",
        onSite: "Tony (Precision Tiling), 1 labourer",
      },
      {
        jobId: job1.id,
        date: daysAgo(6),
        notes: "Cabinetmaker delivered and installed kitchen base units. Benchtop template done — 3 week wait for stone. Plumber did rough-in for island sink.",
        weather: "Partly cloudy, 22°C",
        onSite: "Liam (Melb Cabinets), Sarah (AquaFlow), Luke, 1 labourer",
      },
      {
        jobId: job1.id,
        date: daysAgo(8),
        notes: "Plasterer completed living room and hallway. Sanding tomorrow. Paint prep can start end of week.",
        weather: "Overcast, 16°C",
        onSite: "Plasterer (sub), 1 labourer",
      },
      {
        jobId: job1.id,
        date: daysAgo(12),
        notes: "HVAC install — split systems in master bedroom and living area. Ran into a joist conflict in ceiling cavity, had to reroute ducting. Lost half a day.",
        weather: "Sunny, 30°C — hot in the roof",
        onSite: "Jim (Cool Air), Dave (Spark Electric), Luke",
      },
    ],
  });

  // FO-004 (Bayside Medical) — on-site, 82%
  await prisma.dailyLog.createMany({
    data: [
      {
        jobId: job4.id,
        date: daysAgo(1),
        notes: "Final paint touch-ups in consult rooms 4-6. Flooring contractor finishing vinyl in procedure room. Looking good for handover by end of month.",
        weather: "Sunny, 23°C",
        onSite: "Marco (Pro Coat), Kat (All Floors), 1 labourer",
      },
      {
        jobId: job4.id,
        date: daysAgo(3),
        notes: "Electrician completed data cabling and tested all GPOs. Building inspector visited — passed rough-in inspection. Awaiting final inspection date.",
        weather: "Cloudy, 19°C",
        onSite: "Dave (Spark Electric), Luke",
      },
      {
        jobId: job4.id,
        date: daysAgo(5),
        notes: "Reception desk installed. Custom joinery looks great. Minor adjustment needed on one drawer — cabinetmaker will come back Friday.",
        weather: "Sunny, 26°C",
        onSite: "Liam (Melb Cabinets), 1 labourer",
      },
      {
        jobId: job4.id,
        date: daysAgo(9),
        notes: "Tiling complete in all wet areas. Started installing sanitaryware. One basin was damaged in transit — replacement ordered, 5 day lead time.",
        weather: "Overcast, 17°C, rain",
        onSite: "Tony (Precision Tiling), Sarah (AquaFlow), 1 labourer",
      },
    ],
  });

  // FO-006 (Brunswick Hotel) — on-site, 45%
  await prisma.dailyLog.createMany({
    data: [
      {
        jobId: job6.id,
        date: daysAgo(1),
        notes: "Bar area demo complete. Started framing new bar structure. Coordinating with venue — they need the beer garden usable by Easter weekend.",
        weather: "Sunny, 25°C",
        onSite: "Ben (Solid Carpentry), Mick (Inner City Demo), 3 labourers, Luke",
      },
      {
        jobId: job6.id,
        date: daysAgo(2),
        notes: "Plumber relocated gas lines for new kitchen layout. Electrician started rewiring bar area. Found asbestos in one ceiling panel — getting tested, may need abatement.",
        weather: "Overcast, 20°C",
        onSite: "Sarah (AquaFlow), Dave (Spark Electric), 2 labourers",
      },
      {
        jobId: job6.id,
        date: daysAgo(4),
        notes: "Commercial kitchen extract fan delivered — wrong model. Sent back, correct one due next week. Working around it for now. Beer garden pergola framing started.",
        weather: "Sunny, 28°C",
        onSite: "Ben (Solid Carpentry), 2 labourers",
      },
      {
        jobId: job6.id,
        date: daysAgo(7),
        notes: "Dining room strip-out complete. Removed old carpet, exposed original floorboards underneath — owner wants to keep and refinish them. Good find, saves on flooring budget.",
        weather: "Partly cloudy, 21°C",
        onSite: "Mick (Inner City Demo), 2 labourers, Luke",
      },
      {
        jobId: job6.id,
        date: daysAgo(10),
        notes: "Fire protection contractor did inspection. Need additional fire-rated walls between kitchen and bar. Quoted $4,200 — variation submitted to client.",
        weather: "Overcast, 15°C, rain all day",
        onSite: "Angela (Firestop Pro), Luke",
      },
    ],
  });

  // FO-012 (Little Ones Childcare) — on-site, 38%
  await prisma.dailyLog.createMany({
    data: [
      {
        jobId: job12.id,
        date: daysAgo(1),
        notes: "Weekend work session. Completed framing for new nappy change area and sleep room. Plumber rough-in for additional hand basins.",
        weather: "Sunny, 22°C",
        onSite: "Ben (Solid Carpentry), Sarah (AquaFlow), Luke, 2 labourers",
      },
      {
        jobId: job12.id,
        date: daysAgo(3),
        notes: "Electrician installed emergency lighting and exit signs. Fire protection contractor did penetration sealing. Council inspector booked for next Tuesday.",
        weather: "Overcast, 18°C",
        onSite: "Dave (Spark Electric), Angela (Firestop Pro)",
      },
      {
        jobId: job12.id,
        date: daysAgo(8),
        notes: "Soft flooring samples approved by director. Ordering 120sqm of safety vinyl — 2 week lead time. Started ceiling grid in main play area.",
        weather: "Sunny, 25°C",
        onSite: "Luke, 2 labourers",
      },
    ],
  });

  // ==================== VARIATIONS ====================

  // FO-001
  await prisma.variation.createMany({
    data: [
      {
        jobId: job1.id,
        title: "Additional power points in kitchen",
        description: "Client requested 4 extra double GPOs along the kitchen island bench and splashback. Includes cabling, mounting, and connection to existing board.",
        amount: 2800,
        status: "approved",
      },
      {
        jobId: job1.id,
        title: "Upgrade to stone benchtops",
        description: "Client changed from laminate to 40mm Caesarstone benchtops in kitchen and ensuite. Price difference for supply and install.",
        amount: 8500,
        status: "approved",
      },
      {
        jobId: job1.id,
        title: "Add built-in study nook",
        description: "New built-in desk and shelving unit in hallway alcove. Includes custom joinery, LED strip lighting, and 2x GPOs.",
        amount: 4200,
        status: "pending",
      },
    ],
  });

  // FO-004
  await prisma.variation.createMany({
    data: [
      {
        jobId: job4.id,
        title: "Additional consult room sink",
        description: "Client requested hand basin in consult room 5 (not in original scope). Plumbing, vanity, and tiling.",
        amount: 3800,
        status: "approved",
      },
      {
        jobId: job4.id,
        title: "Upgrade waiting room flooring",
        description: "Changed from vinyl plank to commercial-grade carpet tile in waiting area. Price difference inc. subfloor prep.",
        amount: 2200,
        status: "approved",
      },
    ],
  });

  // FO-006
  await prisma.variation.createMany({
    data: [
      {
        jobId: job6.id,
        title: "Fire-rated walls — kitchen/bar",
        description: "Additional fire-rated walls required between commercial kitchen and bar area per fire engineer's report. BCA compliance.",
        amount: 4200,
        status: "pending",
      },
      {
        jobId: job6.id,
        title: "Refinish original floorboards",
        description: "Owner wants to sand and polish original hardwood floorboards discovered under carpet in dining room. Approx 85sqm.",
        amount: 6800,
        status: "approved",
      },
      {
        jobId: job6.id,
        title: "Outdoor heaters for beer garden",
        description: "Supply and install 4x commercial gas strip heaters in new pergola area. Includes gas line extension.",
        amount: 9500,
        status: "pending",
      },
    ],
  });

  // FO-012
  await prisma.variation.createMany({
    data: [
      {
        jobId: job12.id,
        title: "Additional hand basins",
        description: "Licensing requires 2 additional child-height hand basins in the toddler room. Plumbing and installation.",
        amount: 3200,
        status: "approved",
      },
    ],
  });

  // FO-002
  await prisma.variation.create({
    data: {
      jobId: job2.id,
      title: "Server room cooling upgrade",
      description: "Upgraded HVAC spec for server room from wall-mounted split to precision cooling unit. Includes additional electrical circuit.",
      amount: 12500,
      status: "pending",
    },
  });

  // ==================== PROGRESS CLAIMS ====================

  // FO-001 — 65% complete, $185k + approved variations
  await prisma.progressClaim.createMany({
    data: [
      {
        jobId: job1.id,
        claimNumber: 1,
        amount: 37000,
        dateSent: new Date("2026-01-20"),
        datePaid: new Date("2026-02-03"),
        status: "paid",
      },
      {
        jobId: job1.id,
        claimNumber: 2,
        amount: 55500,
        dateSent: new Date("2026-02-15"),
        datePaid: new Date("2026-02-28"),
        status: "paid",
      },
      {
        jobId: job1.id,
        claimNumber: 3,
        amount: 37000,
        dateSent: daysAgo(10),
        datePaid: null,
        status: "sent",
      },
    ],
  });

  // FO-004 — 82% complete, $310k
  await prisma.progressClaim.createMany({
    data: [
      {
        jobId: job4.id,
        claimNumber: 1,
        amount: 62000,
        dateSent: new Date("2025-12-20"),
        datePaid: new Date("2026-01-06"),
        status: "paid",
      },
      {
        jobId: job4.id,
        claimNumber: 2,
        amount: 93000,
        dateSent: new Date("2026-01-25"),
        datePaid: new Date("2026-02-10"),
        status: "paid",
      },
      {
        jobId: job4.id,
        claimNumber: 3,
        amount: 62000,
        dateSent: new Date("2026-02-20"),
        datePaid: new Date("2026-03-05"),
        status: "paid",
      },
      {
        jobId: job4.id,
        claimNumber: 4,
        amount: 46500,
        dateSent: daysAgo(5),
        datePaid: null,
        status: "sent",
      },
    ],
  });

  // FO-005 — complete, fully paid
  await prisma.progressClaim.createMany({
    data: [
      {
        jobId: job5.id,
        claimNumber: 1,
        amount: 28400,
        dateSent: new Date("2025-08-25"),
        datePaid: new Date("2025-09-08"),
        status: "paid",
      },
      {
        jobId: job5.id,
        claimNumber: 2,
        amount: 42600,
        dateSent: new Date("2025-09-30"),
        datePaid: new Date("2025-10-14"),
        status: "paid",
      },
      {
        jobId: job5.id,
        claimNumber: 3,
        amount: 42600,
        dateSent: new Date("2025-11-10"),
        datePaid: new Date("2025-11-25"),
        status: "paid",
      },
      {
        jobId: job5.id,
        claimNumber: 4,
        amount: 28400,
        dateSent: new Date("2025-12-20"),
        datePaid: new Date("2026-01-05"),
        status: "paid",
      },
    ],
  });

  // FO-006 — 45% complete, $575k
  await prisma.progressClaim.createMany({
    data: [
      {
        jobId: job6.id,
        claimNumber: 1,
        amount: 115000,
        dateSent: new Date("2025-12-15"),
        datePaid: new Date("2026-01-02"),
        status: "paid",
      },
      {
        jobId: job6.id,
        claimNumber: 2,
        amount: 115000,
        dateSent: new Date("2026-02-01"),
        datePaid: new Date("2026-02-18"),
        status: "paid",
      },
      {
        jobId: job6.id,
        claimNumber: 3,
        amount: 57500,
        dateSent: daysAgo(7),
        datePaid: null,
        status: "sent",
      },
    ],
  });

  // FO-009 — complete, fully paid
  await prisma.progressClaim.createMany({
    data: [
      {
        jobId: job9.id,
        claimNumber: 1,
        amount: 53000,
        dateSent: new Date("2025-07-01"),
        datePaid: new Date("2025-07-15"),
        status: "paid",
      },
      {
        jobId: job9.id,
        claimNumber: 2,
        amount: 79500,
        dateSent: new Date("2025-08-15"),
        datePaid: new Date("2025-08-29"),
        status: "paid",
      },
      {
        jobId: job9.id,
        claimNumber: 3,
        amount: 79500,
        dateSent: new Date("2025-10-01"),
        datePaid: new Date("2025-10-16"),
        status: "paid",
      },
      {
        jobId: job9.id,
        claimNumber: 4,
        amount: 53000,
        dateSent: new Date("2025-11-15"),
        datePaid: new Date("2025-11-30"),
        status: "paid",
      },
    ],
  });

  // FO-012 — 38% complete, $245k
  await prisma.progressClaim.createMany({
    data: [
      {
        jobId: job12.id,
        claimNumber: 1,
        amount: 49000,
        dateSent: new Date("2026-02-20"),
        datePaid: new Date("2026-03-06"),
        status: "paid",
      },
      {
        jobId: job12.id,
        claimNumber: 2,
        amount: 49000,
        dateSent: daysAgo(4),
        datePaid: null,
        status: "sent",
      },
    ],
  });

  // ==================== JOB-SUBBIE ASSIGNMENTS ====================

  // FO-001 (Smith Residence)
  await prisma.jobSubbie.createMany({
    data: [
      {
        jobId: job1.id,
        subcontractorId: sparkElectric.id,
        quoteAmount: 18500,
        status: "on-site",
        scheduledStart: new Date("2026-01-13"),
        scheduledEnd: new Date("2026-04-30"),
      },
      {
        jobId: job1.id,
        subcontractorId: aquaFlow.id,
        quoteAmount: 22000,
        status: "on-site",
        scheduledStart: new Date("2026-01-20"),
        scheduledEnd: new Date("2026-04-15"),
      },
      {
        jobId: job1.id,
        subcontractorId: precisionTiling.id,
        quoteAmount: 14500,
        status: "on-site",
        scheduledStart: new Date("2026-02-24"),
        scheduledEnd: new Date("2026-04-10"),
      },
      {
        jobId: job1.id,
        subcontractorId: melbCabinets.id,
        quoteAmount: 32000,
        status: "on-site",
        scheduledStart: new Date("2026-03-01"),
        scheduledEnd: new Date("2026-04-20"),
      },
      {
        jobId: job1.id,
        subcontractorId: coolAir.id,
        quoteAmount: 8200,
        status: "complete",
        scheduledStart: new Date("2026-02-17"),
        scheduledEnd: new Date("2026-03-07"),
      },
      {
        jobId: job1.id,
        subcontractorId: proCoat.id,
        quoteAmount: 12000,
        status: "quoted",
        scheduledStart: new Date("2026-04-14"),
        scheduledEnd: new Date("2026-05-02"),
      },
      {
        jobId: job1.id,
        subcontractorId: allFloors.id,
        quoteAmount: 9800,
        status: "quoted",
        scheduledStart: new Date("2026-04-21"),
        scheduledEnd: new Date("2026-05-09"),
      },
    ],
  });

  // FO-004 (Bayside Medical)
  await prisma.jobSubbie.createMany({
    data: [
      {
        jobId: job4.id,
        subcontractorId: sparkElectric.id,
        quoteAmount: 28000,
        status: "on-site",
        scheduledStart: new Date("2025-12-09"),
        scheduledEnd: new Date("2026-03-28"),
      },
      {
        jobId: job4.id,
        subcontractorId: aquaFlow.id,
        quoteAmount: 19500,
        status: "complete",
        scheduledStart: new Date("2025-12-09"),
        scheduledEnd: new Date("2026-03-14"),
      },
      {
        jobId: job4.id,
        subcontractorId: precisionTiling.id,
        quoteAmount: 11200,
        status: "complete",
        scheduledStart: new Date("2026-01-19"),
        scheduledEnd: new Date("2026-03-07"),
      },
      {
        jobId: job4.id,
        subcontractorId: melbCabinets.id,
        quoteAmount: 45000,
        status: "complete",
        scheduledStart: new Date("2026-02-03"),
        scheduledEnd: new Date("2026-03-14"),
      },
      {
        jobId: job4.id,
        subcontractorId: proCoat.id,
        quoteAmount: 15800,
        status: "on-site",
        scheduledStart: new Date("2026-03-10"),
        scheduledEnd: new Date("2026-03-28"),
      },
      {
        jobId: job4.id,
        subcontractorId: allFloors.id,
        quoteAmount: 8900,
        status: "on-site",
        scheduledStart: new Date("2026-03-10"),
        scheduledEnd: new Date("2026-03-21"),
      },
    ],
  });

  // FO-005 (Nguyen Family Home — complete)
  await prisma.jobSubbie.createMany({
    data: [
      {
        jobId: job5.id,
        subcontractorId: sparkElectric.id,
        quoteAmount: 14000,
        status: "complete",
        scheduledStart: new Date("2025-08-18"),
        scheduledEnd: new Date("2025-11-28"),
      },
      {
        jobId: job5.id,
        subcontractorId: aquaFlow.id,
        quoteAmount: 18000,
        status: "complete",
        scheduledStart: new Date("2025-08-18"),
        scheduledEnd: new Date("2025-11-14"),
      },
      {
        jobId: job5.id,
        subcontractorId: precisionTiling.id,
        quoteAmount: 9500,
        status: "complete",
        scheduledStart: new Date("2025-09-22"),
        scheduledEnd: new Date("2025-10-24"),
      },
      {
        jobId: job5.id,
        subcontractorId: proCoat.id,
        quoteAmount: 11500,
        status: "complete",
        scheduledStart: new Date("2025-11-03"),
        scheduledEnd: new Date("2025-11-21"),
      },
      {
        jobId: job5.id,
        subcontractorId: allFloors.id,
        quoteAmount: 7200,
        status: "complete",
        scheduledStart: new Date("2025-11-10"),
        scheduledEnd: new Date("2025-11-21"),
      },
    ],
  });

  // FO-006 (Brunswick Hotel)
  await prisma.jobSubbie.createMany({
    data: [
      {
        jobId: job6.id,
        subcontractorId: innerCityDemo.id,
        quoteAmount: 14400,
        status: "on-site",
        scheduledStart: new Date("2025-11-18"),
        scheduledEnd: new Date("2026-03-20"),
      },
      {
        jobId: job6.id,
        subcontractorId: solidCarpentry.id,
        quoteAmount: 38000,
        status: "on-site",
        scheduledStart: new Date("2025-12-01"),
        scheduledEnd: new Date("2026-05-30"),
      },
      {
        jobId: job6.id,
        subcontractorId: sparkElectric.id,
        quoteAmount: 42000,
        status: "on-site",
        scheduledStart: new Date("2026-01-06"),
        scheduledEnd: new Date("2026-05-15"),
      },
      {
        jobId: job6.id,
        subcontractorId: aquaFlow.id,
        quoteAmount: 35000,
        status: "on-site",
        scheduledStart: new Date("2026-01-06"),
        scheduledEnd: new Date("2026-04-30"),
      },
      {
        jobId: job6.id,
        subcontractorId: firestopPro.id,
        quoteAmount: 8500,
        status: "quoted",
        scheduledStart: new Date("2026-04-01"),
        scheduledEnd: new Date("2026-04-14"),
      },
      {
        jobId: job6.id,
        subcontractorId: coolAir.id,
        quoteAmount: 22000,
        status: "quoted",
        scheduledStart: new Date("2026-04-14"),
        scheduledEnd: new Date("2026-05-09"),
      },
    ],
  });

  // FO-009 (Greenwood Co-Working — complete)
  await prisma.jobSubbie.createMany({
    data: [
      {
        jobId: job9.id,
        subcontractorId: sparkElectric.id,
        quoteAmount: 32000,
        status: "complete",
        scheduledStart: new Date("2025-06-23"),
        scheduledEnd: new Date("2025-10-31"),
      },
      {
        jobId: job9.id,
        subcontractorId: solidCarpentry.id,
        quoteAmount: 28000,
        status: "complete",
        scheduledStart: new Date("2025-06-23"),
        scheduledEnd: new Date("2025-09-26"),
      },
      {
        jobId: job9.id,
        subcontractorId: proCoat.id,
        quoteAmount: 18500,
        status: "complete",
        scheduledStart: new Date("2025-09-29"),
        scheduledEnd: new Date("2025-10-17"),
      },
      {
        jobId: job9.id,
        subcontractorId: allFloors.id,
        quoteAmount: 15200,
        status: "complete",
        scheduledStart: new Date("2025-10-06"),
        scheduledEnd: new Date("2025-10-24"),
      },
      {
        jobId: job9.id,
        subcontractorId: eliteGlass.id,
        quoteAmount: 9800,
        status: "complete",
        scheduledStart: new Date("2025-10-13"),
        scheduledEnd: new Date("2025-10-24"),
      },
    ],
  });

  // FO-012 (Little Ones Childcare)
  await prisma.jobSubbie.createMany({
    data: [
      {
        jobId: job12.id,
        subcontractorId: solidCarpentry.id,
        quoteAmount: 24000,
        status: "on-site",
        scheduledStart: new Date("2026-02-02"),
        scheduledEnd: new Date("2026-04-10"),
      },
      {
        jobId: job12.id,
        subcontractorId: sparkElectric.id,
        quoteAmount: 19500,
        status: "on-site",
        scheduledStart: new Date("2026-02-09"),
        scheduledEnd: new Date("2026-04-30"),
      },
      {
        jobId: job12.id,
        subcontractorId: aquaFlow.id,
        quoteAmount: 16000,
        status: "on-site",
        scheduledStart: new Date("2026-02-09"),
        scheduledEnd: new Date("2026-04-15"),
      },
      {
        jobId: job12.id,
        subcontractorId: firestopPro.id,
        quoteAmount: 6500,
        status: "on-site",
        scheduledStart: new Date("2026-03-09"),
        scheduledEnd: new Date("2026-03-20"),
      },
      {
        jobId: job12.id,
        subcontractorId: proCoat.id,
        quoteAmount: 14000,
        status: "quoted",
        scheduledStart: new Date("2026-04-13"),
        scheduledEnd: new Date("2026-05-01"),
      },
      {
        jobId: job12.id,
        subcontractorId: allFloors.id,
        quoteAmount: 11500,
        status: "quoted",
        scheduledStart: new Date("2026-04-20"),
        scheduledEnd: new Date("2026-05-08"),
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("  12 jobs (3 quoting, 3 pre-con, 4 on-site, 2 complete)");
  console.log("  12 subcontractors");
  console.log("  17 daily logs");
  console.log("  10 variations");
  console.log("  20 progress claims");
  console.log("  34 job-subbie assignments");
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
