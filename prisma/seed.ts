import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CricNation...');

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { phone: '9999000001' },
    update: {},
    create: { name: 'Rahul Dravid', phone: '9999000001', city: 'Bangalore', role: 'PLAYER' },
  });
  const user2 = await prisma.user.upsert({
    where: { phone: '9999000002' },
    update: {},
    create: { name: 'Virat Singh', phone: '9999000002', city: 'Bangalore', role: 'PLAYER' },
  });
  const user3 = await prisma.user.upsert({
    where: { phone: '9999000003' },
    update: {},
    create: { name: 'MS Sharma', phone: '9999000003', city: 'Bangalore', role: 'ORGANIZER' },
  });
  const user4 = await prisma.user.upsert({
    where: { phone: '9999000004' },
    update: {},
    create: { name: 'Rohit Kumar', phone: '9999000004', city: 'Mumbai', role: 'PLAYER' },
  });
  const user5 = await prisma.user.upsert({
    where: { phone: '9999000005' },
    update: {},
    create: { name: 'Sachin Tendulkar Jr', phone: '9999000005', city: 'Mumbai', role: 'PLAYER' },
  });

  console.log('✅ Users created');

  // Create teams
  const team1 = await prisma.team.upsert({
    where: { id: 'seed-team-1' },
    update: {},
    create: {
      id: 'seed-team-1',
      name: 'Colony XI',
      shortName: 'COL',
      colorHex: '#E8390E',
      homeGround: 'Indiranagar Ground, Bangalore',
      city: 'Bangalore',
      createdById: user1.id,
      members: {
        create: [
          { userId: user1.id, name: user1.name!, role: 'CAPTAIN', jerseyNo: 1 },
          { userId: user2.id, name: user2.name!, role: 'VICE_CAPTAIN', jerseyNo: 7 },
        ],
      },
    },
  });

  const team2 = await prisma.team.upsert({
    where: { id: 'seed-team-2' },
    update: {},
    create: {
      id: 'seed-team-2',
      name: 'Street Warriors',
      shortName: 'STW',
      colorHex: '#2563EB',
      homeGround: 'Koramangala Park',
      city: 'Bangalore',
      createdById: user4.id,
      members: {
        create: [
          { userId: user4.id, name: user4.name!, role: 'CAPTAIN', jerseyNo: 10 },
          { userId: user5.id, name: user5.name!, role: 'PLAYER', jerseyNo: 4 },
        ],
      },
    },
  });

  console.log('✅ Teams created');

  // Create tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: 'seed-tourney-1' },
    update: {},
    create: {
      id: 'seed-tourney-1',
      name: 'Colony Cup 2025',
      format: 'T20',
      bracketType: 'LEAGUE_KNOCKOUT',
      organizerId: user3.id,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      status: 'UPCOMING',
      registrationOpen: true,
      maxTeams: 8,
      entryFee: 500,
      autoApprove: false,
    },
  });

  console.log('✅ Tournament created');

  // Seed a live match
  const match = await prisma.match.upsert({
    where: { id: 'seed-match-1' },
    update: {},
    create: {
      id: 'seed-match-1',
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      status: 'LIVE',
      overs: 20,
      ballType: 'Leather',
      matchType: 'LIMITED_OVERS',
      startTime: new Date(),
      tournamentId: tournament.id,
    },
  });

  console.log('✅ Match created');

  // Seed feed posts
  const posts = [
    { content: '🔥 Rahul just smashed a massive 6️⃣ off the last ball! Colony XI chasing 145. This is ELECTRIC! 🏏', userId: user2.id },
    { content: 'What a spell by MS Sharma! 3 wickets in 4 balls. Street Warriors reeling at 67/5. 💥', userId: user3.id },
    { content: 'Colony XI vs Street Warriors — LIVE now at Indiranagar Ground. Come and watch! 🏟️', userId: user1.id },
    { content: 'Colony Cup registrations are OPEN! Only 8 teams. Entry ₹500. Register now on CricNation 🏆', userId: user3.id },
    { content: 'That run out was INSANE 😱 Three wickets in the powerplay and the crowd is going wild at the colony ground!', userId: user4.id },
  ];

  for (const post of posts) {
    await prisma.feedPost.create({
      data: {
        userId: post.userId,
        content: post.content,
        matchId: post === posts[0] || post === posts[2] ? match.id : undefined,
        isAutoPost: false,
      },
    });
  }

  console.log('✅ Feed posts seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
