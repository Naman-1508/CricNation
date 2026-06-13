import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if we have teams first
  const existingTeams = await prisma.team.count();
  if (existingTeams >= 2) {
    console.log("Teams already exist, skipping seed.");
    return;
  }

  // Create some users just in case we need them as team owners
  const user1 = await prisma.user.upsert({
    where: { email: "captain1@test.com" },
    update: {},
    create: {
      name: "Captain One",
      email: "captain1@test.com",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "captain2@test.com" },
    update: {},
    create: {
      name: "Captain Two",
      email: "captain2@test.com",
    },
  });

  // Create Team A
  const teamA = await prisma.team.create({
    data: {
      name: "Mumbai Indians",
      shortName: "MI",
      createdById: user1.id,
      colorHex: "#1D4ED8",
      homeGround: "Wankhede Stadium",
      members: {
        create: [
          { name: "Rohit Sharma", role: "CAPTAIN" },
          { name: "Suryakumar Yadav", role: "VICE_CAPTAIN" },
          { name: "Jasprit Bumrah", role: "PLAYER" },
          { name: "Hardik Pandya", role: "PLAYER" },
          { name: "Ishan Kishan", role: "PLAYER" },
        ],
      },
    },
  });

  // Create Team B
  const teamB = await prisma.team.create({
    data: {
      name: "Chennai Super Kings",
      shortName: "CSK",
      createdById: user2.id,
      colorHex: "#F5A623",
      homeGround: "M. A. Chidambaram Stadium",
      members: {
        create: [
          { name: "MS Dhoni", role: "CAPTAIN" },
          { name: "Ravindra Jadeja", role: "VICE_CAPTAIN" },
          { name: "Ruturaj Gaikwad", role: "PLAYER" },
          { name: "Deepak Chahar", role: "PLAYER" },
          { name: "Moeen Ali", role: "PLAYER" },
        ],
      },
    },
  });

  console.log(`Created teams: ${teamA.name} and ${teamB.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
