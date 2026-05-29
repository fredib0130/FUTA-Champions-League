import { Team, Player, Match, NewsPost, Sponsor, CoefficientRanking, ChampionRecord } from '../types';

export const CHAMPIONS: ChampionRecord[] = [
  { 
    year: 2025, 
    winnerId: 'mst', 
    winnerName: 'MST', 
    runnerUpId: 'agy', 
    runnerUpName: 'AGY', 
    score: '3–1 on penalties after a 0–0 fulltime play' 
  }
];

export const TEAM_BIOS: Record<string, string> = {
  AGE: "NUESA (SEET) runners-up make their debut in the FUTA Champions League and look like one of the strongest sides in POT C. Led by Jones, AGE will be aiming for an impressive first outing. Currently ranked 23rd overall.",
  ANA: "BAMSSA (SBMS) runners-up and one of the newest sides in POT D. Though ranked 25th overall, ANA could spring surprises against teams like CYS, ENT, and BDG.",
  APH: "A historic Awopegba department featuring notable names like Alaga and Samuel Chi. Despite never winning the Awopegba tournament, APH arrives as NAAS (SAAT) runners-up. Ranked 19th overall.",
  AGP: "NAEMS (SEMS) runners-up entering quietly but with potential. Ranked 24th overall, AGP will look to improve and match SEMS’ top faculty reputation.",
  BCH: "NALSS (SLS) debutants joining MCB as SLS representatives. New to the competition and currently ranked 26th overall.",
  BDG: "NAES (SET) champions and one of the tournament’s elite sides. With experience and quality, BDG returns for their second appearance, ranked 3rd overall and aiming even higher.",
  CSP: "NAAS (SAAT) second-highest ranked team (10th overall). With FAT absent this year, CSP will look to establish dominance despite qualifying as runners-up.",
  CYS: "After a disappointing 2025 campaign, CYS returns as ACOMS (SOC) second-best team. Ranked 16th overall and eager to redeem themselves.",
  ENT: "From 2025 underdogs to a rising powerhouse, ENT has climbed from 14th to 9th in the rankings. Representing ALITECH (SLIT), they continue to prove strength beyond numbers.",
  FWT: "Making their debut as FA Cup runners-up (NAAS – SAAT). Ranked 27th overall, FWT will rely on players like Kobo to make an impact.",
  ICE: "New SEET champions after dethroning IPE. A fresh and ambitious side looking to match or surpass IPE’s 2025 performance. Currently around the 20th mark.",
  IDD: "Stepping in for 2025 runners-up SVG (NAES – SET), IDD joins BDG as SET representatives in this year’s competition.",
  IFS: "ACOMS (SOC) champions back-to-back and joint top-ranked team alongside MST. Despite losing key players, IFS retains a solid core and will look to go beyond their 2025 quarter-final exit.",
  MST: "Defending champions, FA Cup winners, and NAEMS (SEMS) champions. Joint top-ranked team with an 18-game unbeaten run. A dominant force and clear tournament favorites.",
  MBBS: "The sole representative from SCS, automatically qualified. Their performance this year will determine if they can improve on their 2025 showing.",
  MCB: "NALSS (SLS) powerhouse and 5th overall ranked team. With stars like Martial, KDB, and Newton, MCB aims to break into the top four.",
  PHY: "NAPSS (SPS) champions and debutants after displacing MTS. Ranked 13th, PHY will aim to elevate SPS’ standing.",
  PHS: "Back-to-back BAMSSA (SBMS) champions and ranked 8th overall. A strong and consistent side ready to make a statement.",
  SIMT: "True underdogs of the tournament. Against all odds, SIMT qualifies and enters ranked 30th, with nothing to lose and everything to prove.",
  STA: "Earned qualification by defeating NAPSS (SPS) runners-up. STA will be determined to prove their place and compete strongly."
};

export const TEAMS: Team[] = [
  'AGE', 'AGP', 'ANA', 'APH', 'BCH', 'BDG', 'CSP', 'CYS', 'ENT', 'FWT',
  'ICE', 'IDD', 'IFS', 'MBBS', 'MCB', 'MST', 'PHS', 'PHY', 'SIMT', 'STA'
].map((abbr, i) => ({
  id: abbr.toLowerCase(),
  name: [
    'Agricultural Engineering', 'Applied Geo-Physics', 'Anatomy', 'Animal Production and Health', 'Bio Chemistry',
    'Building Technology', 'Crop Science and Pest', 'Cyber Security', 'Enterpreneurship', 'Forestry and Wood Technology',
    'Information and Communication Engineering', 'Industrial Design', 'Information Systems', 'Medicine and Surgery', 'Micro Biology',
    'Marine Science and Technology', 'Physiology', 'Physics', 'Security Investment and Management Technology', 'Statistics'
  ][i] + ` (${abbr})`,
  logo: {
    'AGE': 'public/logos/AGE.jpg',
    'AGP': 'public/logos/AGP.jpg',
    'ANA': 'public/logos/ANA.jpg',
    'APH': 'public/logos/APH.jpg',
    'BCH': 'public/logos/BCH.jpg',
    'BDG': 'public/logos/BDG.jpg',
    'CSP': 'public/logos/CSP.jpg',
    'CYS': 'public/logos/CYS.jpg',
    'ENT': 'public/logos/ENT.jpg',
    'FWT': 'public/logos/FWT.jpg',
    'ICE': 'public/logos/ICE.jpg',
    'IDD': 'public/logos/IDD.jpg',
    'IFS': 'public/logos/IFS.jpg',
    'MBBS': 'public/logos/MBBS.jpg',
    'MCB': 'public/logos/MCB.jpg',
    'MST': 'public/logos/MST.jpg',
    'PHS': 'public/logos/PHS.jpg',
    'PHY': 'public/logos/PHY.jpg',
    'SIMT': 'public/logos/SIMT.jpg',
    'STA': 'public/logos/STA.jpg'
  }[abbr] || `https://api.dicebear.com/7.x/identicon/svg?seed=${abbr}`,
  group: 'League',
  pot: (['BDG', 'IFS', 'MCB', 'MST', 'PHS'].includes(abbr) ? 'A' :
        ['APH', 'CSP', 'ENT', 'ICE', 'PHY'].includes(abbr) ? 'B' :
        ['AGE', 'AGP', 'CYS', 'FWT', 'MBBS'].includes(abbr) ? 'C' :
        ['ANA', 'BCH', 'IDD', 'SIMT', 'STA'].includes(abbr) ? 'D' : undefined) as Team['pot'],
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  form: [],
  description: TEAM_BIOS[abbr] || `${abbr} Department official football team. Ready for FCL 2026.`,
  squad: []
})).sort((a, b) => a.name.localeCompare(b.name));

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
  { id: 'md1-1', homeTeamId: 'mst', awayTeamId: 'ice', date: '2026-06-05', time: '15:30', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 1 }, // OPENING MATCH
  { id: 'md1-2', homeTeamId: 'age', awayTeamId: 'simt', date: '2026-06-06', time: '08:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-3', homeTeamId: 'agp', awayTeamId: 'bch', date: '2026-06-06', time: '09:30', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-4', homeTeamId: 'cys', awayTeamId: 'ana', date: '2026-06-06', time: '11:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-5', homeTeamId: 'phs', awayTeamId: 'aph', date: '2026-06-06', time: '12:30', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-6', homeTeamId: 'bdg', awayTeamId: 'ent', date: '2026-06-06', time: '14:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-7', homeTeamId: 'ifs', awayTeamId: 'csp', date: '2026-06-06', time: '15:30', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-8', homeTeamId: 'fwt', awayTeamId: 'idd', date: '2026-06-06', time: '17:00', venue: 'Pitch A', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-9', homeTeamId: 'mbbs', awayTeamId: 'sta', date: '2026-06-07', time: '08:00', venue: 'Pitch B', status: 'UPCOMING', matchday: 1 },
  { id: 'md1-10', homeTeamId: 'mcb', awayTeamId: 'phy', date: '2026-06-07', time: '09:30', venue: 'FUTA Main Bowl', status: 'UPCOMING', matchday: 1 },

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

export const COEFFICIENTS: CoefficientRanking[] = [
  { rank: 1, teamId: 'ifs', teamName: 'Information Systems', points2026: 4.00, points2025: 16.00, totalCoefficient: 20.00, isActive: true },
  { rank: 2, teamId: 'mst', teamName: 'Marine Science', points2026: 4.00, points2025: 16.00, totalCoefficient: 20.00, isActive: true },
  { rank: 3, teamId: 'bdg', teamName: 'Building', points2026: 4.00, points2025: 13.00, totalCoefficient: 17.00, isActive: true },
  { rank: 4, teamId: 'ipe', teamName: 'IPE', points2026: 0.00, points2025: 17.00, totalCoefficient: 17.00, isActive: false },
  { rank: 5, teamId: 'mcb', teamName: 'Micro-Biology', points2026: 4.00, points2025: 11.00, totalCoefficient: 15.00, isActive: true },
  { rank: 6, teamId: 'agy', teamName: 'AGY', points2026: 0.00, points2025: 15.00, totalCoefficient: 15.00, isActive: false },
  { rank: 7, teamId: 'fat', teamName: 'FAT', points2026: 0.00, points2025: 13.00, totalCoefficient: 13.00, isActive: false },
  { rank: 8, teamId: 'phs', teamName: 'Physiology', points2026: 4.00, points2025: 7.00, totalCoefficient: 11.00, isActive: true },
  { rank: 9, teamId: 'ent', teamName: 'Entrepreneurship', points2026: 4.00, points2025: 7.00, totalCoefficient: 11.00, isActive: true },
  { rank: 10, teamId: 'csp', teamName: 'Crop Science', points2026: 3.00, points2025: 8.00, totalCoefficient: 11.00, isActive: true },
  { rank: 11, teamId: 'mme', teamName: 'MME', points2026: 0.00, points2025: 11.00, totalCoefficient: 11.00, isActive: false },
  { rank: 12, teamId: 'mne', teamName: 'MNE', points2026: 0.00, points2025: 11.00, totalCoefficient: 11.00, isActive: false },
  { rank: 13, teamId: 'mts', teamName: 'MTS', points2026: 0.00, points2025: 9.00, totalCoefficient: 9.00, isActive: false },
  { rank: 14, teamId: 'rsg', teamName: 'RSG', points2026: 0.00, points2025: 8.00, totalCoefficient: 8.00, isActive: false },
  { rank: 15, teamId: 'mbbs', teamName: 'Medicine', points2026: 3.00, points2025: 4.00, totalCoefficient: 7.00, isActive: true },
  { rank: 16, teamId: 'cys', teamName: 'Cyber Security', points2026: 3.00, points2025: 3.00, totalCoefficient: 6.00, isActive: true },
  { rank: 17, teamId: 'ltt', teamName: 'LTT', points2026: 0.00, points2025: 6.00, totalCoefficient: 6.00, isActive: false },
  { rank: 18, teamId: 'svg', teamName: 'SVG', points2026: 0.00, points2025: 6.00, totalCoefficient: 6.00, isActive: false },
  { rank: 19, teamId: 'aph', teamName: 'Animal Production and Health', points2026: 4.00, points2025: 0.00, totalCoefficient: 4.00, isActive: true },
  { rank: 20, teamId: 'ice', teamName: 'ICE', points2026: 4.00, points2025: 0.00, totalCoefficient: 4.00, isActive: true },
  { rank: 21, teamId: 'phy', teamName: 'Physics', points2026: 4.00, points2025: 0.00, totalCoefficient: 4.00, isActive: true },
  { rank: 22, teamId: 'bmt', teamName: 'BMT', points2026: 0.00, points2025: 4.00, totalCoefficient: 4.00, isActive: false },
  { rank: 23, teamId: 'age', teamName: 'Agricultural Engineering', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 24, teamId: 'agp', teamName: 'Applied Geo-Physics', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 25, teamId: 'ana', teamName: 'Anatomy', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 26, teamId: 'bch', teamName: 'Bio-Chemistry', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 27, teamId: 'fwt', teamName: 'Forestry', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 28, teamId: 'sta', teamName: 'Statistics', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 29, teamId: 'idd', teamName: 'Industrial Design', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 30, teamId: 'simt', teamName: 'Security Investment', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 31, teamId: 'che', teamName: 'CHE', points2026: 0.00, points2025: 3.00, totalCoefficient: 3.00, isActive: false },
];
