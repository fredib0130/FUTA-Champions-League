import { Team, Player, Match, NewsPost, Sponsor } from '../types';

export const TEAMS: Team[] = [
  'AGE', 'AGP', 'ANA', 'APH', 'BCH', 'BDG', 'CSP', 'CYS', 'ENT', 'FWT',
  'ICE', 'IDD', 'IFS', 'MBBS', 'MCB', 'MST', 'PHS', 'PHY', 'SIMT', 'STA'
].map((abbr, i) => ({
  id: abbr.toLowerCase(),
  name: [
    'Agricultural Engineering', 'Applied Geo-Physics', 'Anatomy', 'Animal Production and Health', 'Bio-Chemistry',
    'Building', 'Crop Science', 'Cyber Security', 'Entrepreneurship', 'Forestry',
    'ICE', 'Industrial Design', 'Information Systems', 'Medicine', 'Micro-Biology',
    'Marine Science', 'Physiology', 'Physics', 'Security Investment', 'Statistics'
  ][i] + ` (${abbr})`,
  logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${abbr}`,
  group: 'League',
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  form: [],
  description: `${abbr} Department official football team. Ready for FCL 2026.`,
  squad: []
})).sort((a, b) => a.name.localeCompare(b.name));

// Apply regenerated identicons to all 20 teams in alphabetical order
[
  '/regenerated_image_1777538774871.x/identicon/svg',
  '/regenerated_image_1777538778166.x/identicon/svg',
  '/regenerated_image_1777538779090.x/identicon/svg',
  '/regenerated_image_1777538782691.x/identicon/svg',
  '/regenerated_image_1777538784664.x/identicon/svg',
  '/regenerated_image_1777538786231.x/identicon/svg',
  '/regenerated_image_1777538787210.x/identicon/svg',
  '/regenerated_image_1777538788385.x/identicon/svg',
  '/regenerated_image_1777538790557.x/identicon/svg',
  '/regenerated_image_1777538793690.x/identicon/svg',
  '/regenerated_image_1777539044419.png',
  '/regenerated_image_1777539047336.x/identicon/svg',
  '/regenerated_image_1777539049054.x/identicon/svg',
  '/regenerated_image_1777539049756.x/identicon/svg',
  '/regenerated_image_1777539050574.x/identicon/svg',
  '/regenerated_image_1777539053021.x/identicon/svg',
  '/regenerated_image_1777539053751.x/identicon/svg',
  '/regenerated_image_1777539056610.x/identicon/svg',
  '/regenerated_image_1777539057345.x/identicon/svg',
  '/regenerated_image_1777539060274.x/identicon/svg',
].forEach((logo, i) => {
  if (TEAMS[i]) {
    TEAMS[i].logo = logo;
  }
});

export const PLAYERS: Player[] = Array.from({ length: 150 }, (_, i) => ({
  id: `player-${i + 1}`,
  name: ['John Doe', 'Samuel Ade', 'Tunde Williams', 'Chidi Okafor', 'Victor Moses', 'David Alaba', 'Olamide Baddo', 'Femi Kuti', 'Burna Boy', 'Wiz Kid', 'Davido', 'Rema', 'Asake', 'Tiwa Savage', 'Yemi Alade'][i % 15] + ` ${i + 1}`,
  position: ['FWD', 'MID', 'DEF', 'GK'][i % 4] as any,
  goals: 0, // Reset to 0 for tournament launch
  assists: 0,
  cleanSheets: 0,
  teamId: TEAMS[i % 20].id,
  image: `https://api.dicebear.com/7.x/avataaars/svg?seed=player-${i + 1}`
}));

export const MATCHES: Match[] = [
  // --- MATCHDAY 1 (June 5 - 7) ---
  { id: 'md1-1', homeTeamId: 'age', awayTeamId: 'simt', date: '2026-06-05', time: '16:00', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 1 }, // OPENING MATCH
  { id: 'md1-2', homeTeamId: 'agp', awayTeamId: 'bch', date: '2026-06-06', time: '10:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-3', homeTeamId: 'cys', awayTeamId: 'ana', date: '2026-06-06', time: '12:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-4', homeTeamId: 'phs', awayTeamId: 'aph', date: '2026-06-06', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-5', homeTeamId: 'bdg', awayTeamId: 'ent', date: '2026-06-06', time: '16:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-6', homeTeamId: 'ifs', awayTeamId: 'csp', date: '2026-06-07', time: '10:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-7', homeTeamId: 'fwt', awayTeamId: 'idd', date: '2026-06-07', time: '12:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-8', homeTeamId: 'mst', awayTeamId: 'ice', date: '2026-06-07', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-9', homeTeamId: 'mbbs', awayTeamId: 'sta', date: '2026-06-07', time: '16:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-10', homeTeamId: 'mcb', awayTeamId: 'phy', date: '2026-06-07', time: '17:30', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 1 },

  // --- MATCHDAY 2 (June 10 - 11) ---
  { id: 'md2-1', homeTeamId: 'csp', awayTeamId: 'sta', date: '2026-06-10', time: '10:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-2', homeTeamId: 'phy', awayTeamId: 'simt', date: '2026-06-10', time: '12:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-3', homeTeamId: 'phs', awayTeamId: 'agp', date: '2026-06-10', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-4', homeTeamId: 'mst', awayTeamId: 'cys', date: '2026-06-10', time: '16:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-5', homeTeamId: 'mcb', awayTeamId: 'age', date: '2026-06-11', time: '10:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-6', homeTeamId: 'ifs', awayTeamId: 'mbbs', date: '2026-06-11', time: '12:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-7', homeTeamId: 'aph', awayTeamId: 'idd', date: '2026-06-11', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-8', homeTeamId: 'ice', awayTeamId: 'bch', date: '2026-06-11', time: '16:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-9', homeTeamId: 'bdg', awayTeamId: 'fwt', date: '2026-06-11', time: '17:30', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 2 },
  { id: 'md2-10', homeTeamId: 'ent', awayTeamId: 'ana', date: '2026-06-11', time: '18:00', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 2 },

  // --- MATCHDAY 3 (June 13 - 15) ---
  { id: 'md3-1', homeTeamId: 'mst', awayTeamId: 'simt', date: '2026-06-13', time: '10:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-2', homeTeamId: 'ent', awayTeamId: 'mbbs', date: '2026-06-13', time: '12:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-3', homeTeamId: 'phs', awayTeamId: 'bch', date: '2026-06-13', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-4', homeTeamId: 'ice', awayTeamId: 'fwt', date: '2026-06-13', time: '16:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-5', homeTeamId: 'bdg', awayTeamId: 'ana', date: '2026-06-14', time: '10:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-6', homeTeamId: 'csp', awayTeamId: 'cys', date: '2026-06-14', time: '12:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-7', homeTeamId: 'ifs', awayTeamId: 'sta', date: '2026-06-14', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-8', homeTeamId: 'phy', awayTeamId: 'agp', date: '2026-06-14', time: '16:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-9', homeTeamId: 'mcb', awayTeamId: 'idd', date: '2026-06-15', time: '16:00', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 3 },
  { id: 'md3-10', homeTeamId: 'aph', awayTeamId: 'age', date: '2026-06-15', time: '18:00', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 3 },
];

export const NEWS: NewsPost[] = [
  {
    id: '1',
    title: 'FCL 2026 Kickoff Announced',
    excerpt: 'The most anticipated student football league is back with a bang.',
    content: 'Longer content about the kickoff...',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000',
    date: '2026-04-20',
    category: 'Announcement'
  },
  {
    id: '2',
    title: 'Defending Champions Titans FC Ready',
    excerpt: 'Titans FC captain speaks on their preparations for the new season.',
    content: 'Longer content about titans fcl...',
    image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
    date: '2026-04-25',
    category: 'Interview'
  }
];

export const SPONSORS: Sponsor[] = [
  { id: 's1', name: 'Alat by Wema', logo: 'https://seeklogo.com/images/A/alat-logo-9E7D4E7B7D-seeklogo.com.png', tier: 'GOLD', website: '#' },
  { id: 's2', name: 'Pepsi', logo: 'https://seeklogo.com/images/P/pepsi-logo-BF1BD3C623-seeklogo.com.png', tier: 'GOLD', website: '#' },
  { id: 's3', name: 'Bolt', logo: 'https://seeklogo.com/images/B/bolt-logo-4966779BC2-seeklogo.com.png', tier: 'SILVER', website: '#' }
];
