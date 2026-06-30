import { Team, Player, Match, NewsPost, Sponsor, CoefficientRanking, ChampionRecord, MatchStats } from '../types';

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
    'Agricultural and Environmental Engineering', 'Applied Geo-Physics', 'Anatomy', 'Animal Production and Health', 'Bio Chemistry',
    'Building Technology', 'Crop Soil and Pest Management', 'Cyber Security', 'Enterpreneurship', 'Forestry and Wood Technology',
    'Information and Communication Engineering', 'Industrial Design', 'Information Systems', 'Medicine and Surgery', 'Micro Biology',
    'Marine Science and Technology', 'Physiology', 'Physics', 'Securities and Investment Management Technology', 'Statistics'
  ][i] + ` (${abbr})`,
  logoUrl: null,
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

export const PLAYERS: Player[] = [
  // Live Star Players
  { id: 'player-agp-michael', name: "Michael", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'agp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agp-michael' },
  { id: 'player-agp-roland', name: "Roland", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'agp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agp-roland' },
  { id: 'player-ent-promise', name: "Promise", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ent', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ent-promise' },
  { id: 'player-ent-fairy', name: "Fairy", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ent', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ent-fairy' },
  { id: 'player-ent-pelumi', name: "Pelumi", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ent', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ent-pelumi' },
  { id: 'player-mbbs-dr-p', name: "Dr. P", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'mbbs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mbbs-dr-p' },
  { id: 'player-mbbs-adesola', name: "Adesola Emmanuel", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'mbbs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mbbs-adesola' },
  { id: 'player-aph-kunlex', name: "Kunlex", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'aph', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aph-kunlex' },
  { id: 'player-aph-emmanuel', name: "Emmanuel", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'aph', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aph-emmanuel' },
  { id: 'player-aph-fola', name: "Fola", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'aph', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aph-fola' },
  { id: 'player-csp-ademide', name: "Ademide", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'csp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=csp-ademide' },
  { id: 'player-csp-adedara', name: "Adedara", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'csp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=csp-adedara' },
  { id: 'player-csp-akindeko', name: "Akindeko Emmanuel", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'csp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=csp-akindeko' },
  { id: 'player-csp-pelumi', name: "Pelumi", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'csp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=csp-pelumi' },
  { id: 'player-ice-usman', name: "Bamidele Usman", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ice', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ice-usman' },
  { id: 'player-ice-prosper', name: "Adeyemi Prosper", position: "GK" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ice', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ice-prosper' },
  { id: 'player-ice-samson', name: "Olayiwola Samson", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ice', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ice-samson' },
  { id: 'player-ifs-idris', name: "Idris", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-idris' },
  { id: 'player-ifs-kehinde', name: "Kehinde", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-kehinde' },
  { id: 'player-ifs-segun', name: "Segun", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-segun' },
  { id: 'player-ifs-victor', name: "Victor", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-victor' },
  { id: 'player-idd-soji', name: "Soji", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-soji' },
  { id: 'player-idd-sola', name: "Ikudayisi Oyesola", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-sola' },
  { id: 'player-idd-tolu', name: "Tolu", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-tolu' },
  { id: 'player-idd-neymar', name: "Neymar", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-neymar' },
  { id: 'player-idd-enzo', name: "Enzo", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-enzo' },
  { id: 'player-idd-emmy', name: "Emmy", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-emmy' },
 
  // Registration Base Indexes per team
  ...(() => {
    (globalThis as any).TEAM_REG_BASES = {
      mst: 1001,
      fwt: 1024,
      simt: 1047,
      cys: 1070,
      phy: 1093,
      sta: 1116,
      ifs: 1139,
      mcb: 1162,
      bdg: 1185,
      ice: 1208,
      age: 1231,
      mbbs: 1254,
      aph: 1277,
      ent: 1300,
      csp: 1323,
      bch: 1346,
      ana: 1369,
      idd: 1392,
      phs: 1415,
      agp: 1438,
    };
    (globalThis as any).getPlayerRegNumber = (teamId: string, idx: number): string => {
      const base = (globalThis as any).TEAM_REG_BASES[teamId.toLowerCase()] || 2000;
      return `FCL/${teamId.toUpperCase()}/26/${base + idx}`;
    };
    return [];
  })(),

  // Official MST Squad List
  ...[
    { name: "Ogundeji Feyitunmise Hezekiah", position: "GK" as const, level: "500L", jerseyNo: 1, regNumber: "FCL/MST/26/1001" },
    { name: "Adeyemi Adedayo Ibrahim", position: "DEF" as const, level: "500L", jerseyNo: 8, regNumber: "FCL/MST/26/1002" },
    { name: "Akinnayajo Irewale", position: "DEF" as const, level: "500L", regNumber: "FCL/MST/26/1003" },
    { name: "Ojoisimi Bright Agbomizi", position: "DEF" as const, level: "300L", regNumber: "FCL/MST/26/1004" },
    { name: "Bernard Augustine Obioma", position: "DEF" as const, level: "200L", jerseyNo: 16, regNumber: "FCL/MST/26/1005" },
    { name: "Philip Believe Oluwashina", position: "DEF" as const, level: "500L", regNumber: "FCL/MST/26/1006" },
    { name: "Adeniyi Ademola Daniel", position: "DEF" as const, level: "400L", jerseyNo: 2, regNumber: "FCL/MST/26/1007" },
    { name: "Ademisoye Segun", position: "DEF" as const, level: "300L", regNumber: "FCL/MST/26/1008" },
    { name: "Adediran Olanrewaju Abeeb", position: "MID" as const, level: "300L", jerseyNo: 4, regNumber: "FCL/MST/26/1009" },
    { name: "Iyare Praise", position: "MID" as const, level: "500L", jerseyNo: 55, regNumber: "FCL/MST/26/1010" },
    { name: "Akinyo Boluwatife Precious", position: "MID" as const, level: "100L", regNumber: "FCL/MST/26/1011" },
    { name: "Adekunle Ayomide Mubarak", position: "MID" as const, level: "200L", regNumber: "FCL/MST/26/1012" },
    { name: "Olagunju Moses Temitope", position: "MID" as const, level: "500L", regNumber: "FCL/MST/26/1013" },
    { name: "Ayeni Ayobami", position: "MID" as const, level: "100L", regNumber: "FCL/MST/26/1014" },
    { name: "Nkemjika Sydney", position: "FWD" as const, level: "400L", jerseyNo: 9, regNumber: "FCL/MST/26/1015" },
    { name: "Shomuyiwa Lateef Babatunde", position: "FWD" as const, level: "200L", regNumber: "FCL/MST/26/1016" },
    { name: "Boyede Joseph Ayomide", position: "FWD" as const, level: "300L", jerseyNo: 10, regNumber: "FCL/MST/26/1017" },
    { name: "Fabusuyi Daniel Oluwafisayo", position: "FWD" as const, level: "500L", regNumber: "FCL/MST/26/1018" },
    { name: "Akintunde Ayomide Oluwaseyifunmi", position: "FWD" as const, level: "100L", jerseyNo: 30, regNumber: "FCL/MST/26/1019" },
    { name: "Ekwe Fortune", position: "FWD" as const, level: "500L", regNumber: "FCL/MST/26/1020" }
  ].map((p, idx) => ({
    id: `player-mst-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: p.regNumber || (globalThis as any).getPlayerRegNumber('mst', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'mst',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=mst-player-${idx + 1}`
  })),
  // Auto-generate helper players for other teams to keep rosters occupied
  ...[
    { name: "Afolabi Timothy Testimony", position: "GK" as const, level: "500L", jerseyNo: 55, matricNumber: "FWT/20/4555" },
    { name: "Jonathan Henry Chukwu", position: "DEF" as const, level: "400L", jerseyNo: 13, matricNumber: "FWT/22/8617" },
    { name: "Ayodeji Blessing Elisha", position: "DEF" as const, level: "500L", jerseyNo: 3, matricNumber: "FWT/20/4575" },
    { name: "Ayadi Bright Tayo", position: "DEF" as const, level: "500L", jerseyNo: 2, matricNumber: "FWT/20/4574" },
    { name: "Ganiyu Malik Ayomide", position: "DEF" as const, level: "500L", jerseyNo: 5, matricNumber: "FWT/20/4592" },
    { name: "Owolabi Taofeeq Ademola", position: "DEF" as const, level: "500L", jerseyNo: 6, matricNumber: "FWT/20/4622" },
    { name: "Tiamiyu Samuel Temitope", position: "DEF" as const, level: "300L", jerseyNo: 20, matricNumber: "FWT/23/3489" },
    { name: "Awosiyan Oluwaseun Victor", position: "DEF" as const, level: "200L", jerseyNo: 21, matricNumber: "FWT/24/8573" },
    { name: "Bello Baki Oluwaseyi", position: "MID" as const, level: "500L", jerseyNo: 8, matricNumber: "FWT/20/4581" },
    { name: "Famuwagun Tomiwa Young", position: "MID" as const, level: "400L", jerseyNo: 12, matricNumber: "FWT/22/8607" },
    { name: "Fadiji Bonnke Samuel", position: "MID" as const, level: "500L", jerseyNo: 10, matricNumber: "FWT/20/4587" },
    { name: "Ajayi Oluwatobi Oluwasegun", position: "MID" as const, level: "500L", jerseyNo: 4, matricNumber: "FWT/20/4558" },
    { name: "Iyapo Banji", position: "MID" as const, level: "500L", jerseyNo: 14, matricNumber: "FWT/17/3778" },
    { name: "Oghoromai Richard Ayomide", position: "MID" as const, level: "400L", jerseyNo: 16, matricNumber: "FWT/22/8627" },
    { name: "Adegoke Blessing Moses", position: "MID" as const, level: "200L", jerseyNo: 19, matricNumber: "FWT/24/8554" },
    { name: "Ayodeji Bright Kehinde", position: "FWD" as const, level: "500L", jerseyNo: 7, matricNumber: "FWT/20/4576" },
    { name: "Ogunkanmi Oluwanimisire Oladayo", position: "FWD" as const, level: "200L", jerseyNo: 11, matricNumber: "FWT/24/8589" },
    { name: "Agunloye Segun Isaac", position: "FWD" as const, level: "400L", jerseyNo: 9, matricNumber: "FWT/22/8587" },
    { name: "Sanusi Olaitan John", position: "FWD" as const, level: "500L", jerseyNo: 15, matricNumber: "FWT/20/4611" },
    { name: "Olalekan Hammed Olajuwon", position: "FWD" as const, level: "400L", jerseyNo: 17, matricNumber: "FWT/22/8638" },
    { name: "Akinmola Oluwafisayo Oluwafemi", position: "FWD" as const, level: "400L", jerseyNo: 18, matricNumber: "FWT/22/8590" },
    { name: "Olayemi Elijah Ayokunle", position: "FWD" as const, level: "400L", jerseyNo: 20, matricNumber: "FWT/22/8644" },
    { name: "Akindele Damilola Temitope", position: "FWD" as const, level: "500L", jerseyNo: 22, matricNumber: "FWT/20/4561" }
  ].map((p, idx) => ({
    id: `player-fwt-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('fwt', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'fwt',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=fwt-player-${idx + 1}`
  })),
  // CYS Official Squad (Extensive 23-player registry, ordered to match historical lineup mappings)
  ...[
    { name: "Olabode Victor Oluwatosin", position: "GK" as const, level: "500L", jerseyNo: 1, matricNumber: "CYS/20/4932" },
    { name: "Adewumi Excel Joshua", position: "DEF" as const, level: "500L", jerseyNo: 3, matricNumber: "CYS/22/9017" },
    { name: "Kadri Taofeek Akorede", position: "DEF" as const, level: "300L", jerseyNo: 4, matricNumber: "CYS/23/4061" },
    { name: "Raji Jubril Olarewaju", position: "DEF" as const, level: "100L", jerseyNo: 5, matricNumber: "CYS/25/7084" },
    { name: "Fashola Oluwatobi Joshua", position: "DEF" as const, level: "500L", jerseyNo: 2, matricNumber: "CYS/20/4918" },
    { name: "Nwoke Isaac Honour", position: "MID" as const, level: "300L", jerseyNo: 6, matricNumber: "CYS/23/4068" },
    { name: "Ayeni Babatunde Paul", position: "MID" as const, level: "500L", jerseyNo: 21, matricNumber: "CYS/20/4911" },
    { name: "Onah Caleb Igoche", position: "MID" as const, level: "500L", jerseyNo: 8, matricNumber: "CYS/22/9082" },
    { name: "Ajao Alameen Olaide", position: "MID" as const, level: "200L", jerseyNo: 17, matricNumber: "CYS/24/9175" },
    { name: "Jegede Daniel Kolawole", position: "FWD" as const, level: "500L", jerseyNo: 9, matricNumber: "CYS/20/4923" },
    { name: "Akinyede Allen Oluwaferanmi", position: "FWD" as const, level: "500L", jerseyNo: 7, matricNumber: "CYS/20/4908" },
    { name: "Adedotun Faiz Ayobami", position: "GK" as const, level: "100L", jerseyNo: 13, matricNumber: "CYS/25/6982" },
    { name: "Ifedayoijitimeyin Valerian Igbagboyemi", position: "DEF" as const, level: "500L", jerseyNo: 15, matricNumber: "CYS/20/4920" },
    { name: "Olanrewaju Mujeeb Abolaji", position: "DEF" as const, level: "100L", jerseyNo: 12, matricNumber: "CYS/25/7071" },
    { name: "Akinrinola Samuel Temitope", position: "MID" as const, level: "500L", jerseyNo: 20, matricNumber: "CYS/20/4905" },
    { name: "Akinshipe Oluwafemi Solomon", position: "MID" as const, level: "300L", jerseyNo: 23, matricNumber: "CYS/24/9180" },
    { name: "Oluwadiya Timilehin Abraham", position: "MID" as const, level: "500L", jerseyNo: 18, matricNumber: "CYS/20/4935" },
    { name: "Olamijulo Israel Damilare", position: "MID" as const, level: "500L", jerseyNo: 10, matricNumber: "CYS/22/9071" },
    { name: "Adeoye Ezekiel Oluwaseyi", position: "MID" as const, level: "500L", jerseyNo: 14, matricNumber: "CYS/20/4897" },
    { name: "Owolabi Olaifeoluwa Solomon", position: "MID" as const, level: "300L", jerseyNo: 16, matricNumber: "CYS/23/4090" },
    { name: "Bello Daniel Damilare", position: "FWD" as const, level: "500L", jerseyNo: 11, matricNumber: "CYS/20/4914" },
    { name: "Olorunfemi Taiwo James", position: "FWD" as const, level: "100L", jerseyNo: 22, matricNumber: "CYS/25/7075" },
    { name: "Adetule Marvellous Mayowa", position: "FWD" as const, level: "500L", jerseyNo: 19, matricNumber: "CYS/20/4899" },
    { name: "John Igbalamide", position: "GK" as const, level: "200L", jerseyNo: 16, matricNumber: "CYS/24/9111" }
  ].map((p, idx) => ({
    id: `player-cys-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('cys', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'cys',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=cys-player-${idx + 1}`
  })),

  // SIMT Official Squad (Underdogs' extensive 23-player registry)
  ...[
    { name: "Nwabunwanne Chibichi Daniel", position: "GK" as const, level: "200L", jerseyNo: 1, matricNumber: "SIM/24/1738" },
    { name: "Divine Gabriel Ibrahim", position: "GK" as const, level: "200L", matricNumber: "SIM/24/1727" },
    { name: "Adebayo Samuel Ayobami", position: "DEF" as const, level: "200L", jerseyNo: 16, matricNumber: "SIM/24/1697" },
    { name: "Adeniyi Opeyemi Israel", position: "DEF" as const, level: "200L", jerseyNo: 99, matricNumber: "SIM/24/1701" },
    { name: "Momoh Joshua David", position: "DEF" as const, level: "200L", jerseyNo: 66, matricNumber: "SIM/24/1737" },
    { name: "Aderiye Joshua Adekunle", position: "DEF" as const, level: "200L", jerseyNo: 2, matricNumber: "SIM/24/1703" },
    { name: "Adewale Uthman Boluwatife", position: "DEF" as const, level: "100L", matricNumber: "SIM/25/0329" },
    { name: "Omolayo Precious Ayomide", position: "DEF" as const, level: "200L", jerseyNo: 19, matricNumber: "SIM/24/1757" },
    { name: "Yusuf Soliu Okikiola", position: "DEF" as const, level: "200L", matricNumber: "SIM/24/1768" },
    { name: "Ajiwoye Oluwalonimi Israel", position: "DEF" as const, level: "200L", matricNumber: "SIM/24/1711" },
    { name: "Afolabi Abdulmuheez", position: "DEF" as const, level: "200L", jerseyNo: 4, matricNumber: "SIM/24/1707" },
    { name: "Olabamiji Eric Ayokunle", position: "DEF" as const, level: "200L", jerseyNo: 24, matricNumber: "SIM/24/1749" },
    { name: "Kolawole Emmanuel Timilehin", position: "MID" as const, level: "200L", jerseyNo: 12, matricNumber: "SIM/24/1735" },
    { name: "Oweazim Chukwudumebi", position: "MID" as const, level: "200L", jerseyNo: 8, matricNumber: "SIM/24/1761" },
    { name: "Okoye Philip C.", position: "MID" as const, level: "100L", matricNumber: "SIM/25/0377" },
    { name: "Adeniyi Temitope Oluwadamilare", position: "MID" as const, level: "100L", matricNumber: "SIM/25/0326" },
    { name: "Adewopo Feranmi", position: "MID" as const, level: "200L", jerseyNo: 5, matricNumber: "SIM/24/1704" },
    { name: "Omowale Ridwan Gbolahun", position: "MID" as const, level: "200L", jerseyNo: 11, matricNumber: "SIM/24/1760" },
    { name: "Oladapo Isaac Ayomide", position: "FWD" as const, level: "200L", jerseyNo: 10, matricNumber: "SIM/24/1750" },
    { name: "Emmanuel Oluwapamilerin Joshua", position: "FWD" as const, level: "200L", jerseyNo: 7, matricNumber: "SIM/24/1724" },
    { name: "Ogboye Samuel Oluwaponmile", position: "FWD" as const, level: "200L", jerseyNo: 9, matricNumber: "SIM/24/1746" },
    { name: "Ipinlaye Samuel Fisayo", position: "FWD" as const, level: "200L", jerseyNo: 14, matricNumber: "SIM/24/1731" },
    { name: "Amure Matthew", position: "FWD" as const, level: "200L", jerseyNo: 20, matricNumber: "SIM/24/1718" }
  ].map((p, idx) => ({
    id: `player-simt-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('simt', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'simt',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=simt-player-${idx + 1}`
  })),

  // STA Official Squad (Statistics department squad list)
  ...[
    { name: "Rotimi Joseph Folahan", position: "GK" as const, level: "100L", jerseyNo: 1, matricNumber: "STA/25/1591" },
    { name: "Okusi Edward", position: "GK" as const, level: "300L", jerseyNo: 13, matricNumber: "STA/23/6720" },
    { name: "Emmanuel Olaoluwa Akintayo", position: "DEF" as const, level: "300L", jerseyNo: 2, matricNumber: "STA/23/6687" },
    { name: "Adewumi Micclinton Adegoke", position: "DEF" as const, level: "200L", jerseyNo: 6, matricNumber: "STA/24/2807" },
    { name: "Afilaka Praise Temidayo", position: "DEF" as const, level: "300L", jerseyNo: 5, matricNumber: "STA/23/6682" },
    { name: "Omowole Adebusuyi Abraham", position: "DEF" as const, level: "200L", jerseyNo: 29, matricNumber: "STA/24/2890" },
    { name: "Aminu Moses Vincent", position: "DEF" as const, level: "100L", jerseyNo: 20, matricNumber: "STA/25/0920" },
    { name: "Victor Gospel Leo", position: "DEF" as const, level: "300L", jerseyNo: 3, matricNumber: "STA/23/6745" },
    { name: "Jackson Joseph", position: "DEF" as const, level: "200L", jerseyNo: 17, matricNumber: "STA/24/2862" },
    { name: "Adedeji Taofeek Oyeleke", position: "DEF" as const, level: "300L", jerseyNo: 12, matricNumber: "STA/23/6673" },
    { name: "Eki Kelvin Aghoghomena", position: "DEF" as const, level: "300L", jerseyNo: 15, matricNumber: "STA/23/6697" },
    { name: "Afolabi David Adebayo", position: "MID" as const, level: "100L", jerseyNo: 16, matricNumber: "STA/25/0905" },
    { name: "Agbo Peter", position: "MID" as const, level: "100L", jerseyNo: 19, matricNumber: "STA/25/0906" },
    { name: "Johnson Emmanuel Olaoluwa", position: "MID" as const, level: "300L", jerseyNo: 7, matricNumber: "STA/23/6711" },
    { name: "Akinjogunla Mayowa", position: "MID" as const, level: "300L", jerseyNo: 14, matricNumber: "STA/23/6686" },
    { name: "Akinsowon Gbenga Ejiro", position: "MID" as const, level: "500L", jerseyNo: 16, matricNumber: "STA/20/7167" },
    { name: "Ayetan Samuel Precious", position: "MID" as const, level: "500L", jerseyNo: 24, matricNumber: "STA/20/7178" },
    { name: "Salam Rokeeb Oladimeji", position: "MID" as const, level: "200L", jerseyNo: 8, matricNumber: "STA/24/2898" },
    { name: "Daisi Toluwanimi", position: "FWD" as const, level: "300L", jerseyNo: 11, matricNumber: "STA/23/6695" },
    { name: "Akintunde Samuel", position: "FWD" as const, level: "200L", jerseyNo: 18, matricNumber: "STA/24/2822" },
    { name: "Precious", position: "FWD" as const, level: "100L", jerseyNo: 21, matricNumber: "STA/25/0890" },
    { name: "Bello Riliwan Remilekun", position: "FWD" as const, level: "200L", jerseyNo: 9, matricNumber: "STA/24/2843" },
    { name: "Nwachukwu Jesse", position: "FWD" as const, level: "300L", jerseyNo: 10, matricNumber: "STA/23/6713" }
  ].map((p, idx) => ({
    id: `player-sta-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('sta', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'sta',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=sta-player-${idx + 1}`
  })),

  // IFS Official Squad (Information Systems department squad list)
  ...[
    { name: "Harun Abdulkareem", position: "GK" as const, level: "500L", jerseyNo: 1, matricNumber: "IFS/20/4978" },
    { name: "Owogbemi Oluwadunsin Emmanuel", position: "GK" as const, level: "300L", jerseyNo: 23, matricNumber: "IFS/23/6822" },
    { name: "Gowon Mathias Monday", position: "DEF" as const, level: "100L", jerseyNo: 5, matricNumber: "IFS/25/7267" },
    { name: "Ude-Abara George Chidindu", position: "DEF" as const, level: "200L", jerseyNo: 13, matricNumber: "IFS/24/9370" },
    { name: "Sokun Omotayo Clinton", position: "DEF" as const, level: "300L", jerseyNo: 12, matricNumber: "IFS/23/6829" },
    { name: "Falana Stephen Odunayo", position: "DEF" as const, level: "500L", jerseyNo: 22, matricNumber: "IFS/20/4976" },
    { name: "Olatunji Dunni Oluwagbenga", position: "DEF" as const, level: "300L", jerseyNo: 3, matricNumber: "IFS/23/6810" },
    { name: "Owamokele Joshua", position: "DEF" as const, level: "300L", jerseyNo: 6, matricNumber: "IFS/23/6821" },
    { name: "Oshunniran Gbolahan", position: "DEF" as const, level: "500L", jerseyNo: 15, matricNumber: "IFS/20/4998" },
    { name: "Adeosun Peace", position: "DEF" as const, level: "500L", jerseyNo: 2, matricNumber: "IFS/20/4949" },
    { name: "Adeyanju Dominion Harry", position: "MID" as const, level: "200L", jerseyNo: 18, matricNumber: "IFS/24/9294" },
    { name: "Olorunfunmilayo Gbolaga Emmanuel", position: "MID" as const, level: "500L", jerseyNo: 28, matricNumber: "IFS/20/4993" },
    { name: "Olawuyi Praise Olatunji", position: "MID" as const, level: "200L", jerseyNo: 11, matricNumber: "IFS/24/9348" },
    { name: "Olanrewaju Ifeoluwa", position: "MID" as const, level: "300L", jerseyNo: 4, matricNumber: "IFS/23/6808" },
    { name: "Uhiene Paul Anuoluwapo", position: "MID" as const, level: "500L", jerseyNo: 8, matricNumber: "IFS/20/5006" },
    { name: "Bakare Idris", position: "FWD" as const, level: "500L", jerseyNo: 10, matricNumber: "IFS/20/4970" },
    { name: "Ojodako Joseph Olayinka", position: "FWD" as const, level: "100L", jerseyNo: 17, matricNumber: "IFS/25/7302" },
    { name: "Fasiku Victor Adebola", position: "FWD" as const, level: "300L", jerseyNo: 14, matricNumber: "IFS/23/6784" },
    { name: "Busari Ifeoluwa Habeeb", position: "FWD" as const, level: "300L", jerseyNo: 7, matricNumber: "IFS/23/6893" },
    { name: "Omotomo Olumide Daniel", position: "FWD" as const, level: "300L", jerseyNo: 27, matricNumber: "IFS/23/6818" },
    { name: "Adewale Adeola Samue", position: "FWD" as const, level: "300L", jerseyNo: 9, matricNumber: "IFS/23/6764" },
    { name: "Akinyemi Feranmi Olusegun", position: "FWD" as const, level: "500L", jerseyNo: 19, matricNumber: "IFS/20/4961" },
    { name: "Olorunfemi Kehinde John", position: "FWD" as const, level: "100L", jerseyNo: 29, matricNumber: "IFS/25/7309" }
  ].map((p, idx) => ({
    id: `player-ifs-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('ifs', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'ifs',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-player-${idx + 1}`
  })),

  // MCB Official Squad (Microbiology starting players + subs)
  ...[
    { name: "Adesuyi Oluwasegun", position: "GK" as const, level: "500l", jerseyNo: 1, matricNumber: "MCB/20/6695" },
    { name: "Ayeni Opeyemi", position: "DEF" as const, level: "500l", jerseyNo: 5, matricNumber: "MCB/20/6714" },
    { name: "Alagbe Jeremiah Kehinde", position: "DEF" as const, level: "500l", jerseyNo: 6, matricNumber: "MCB/22/1291" },
    { name: "Osowo Taiwo", position: "DEF" as const, level: "500l", jerseyNo: 3, matricNumber: "MCB/20/6760" },
    { name: "Favour", position: "MID" as const, level: "300l", jerseyNo: 17, matricNumber: "MCB/23/6044" },
    { name: "Oni Oluwadamilola", position: "MID" as const, level: "500l", jerseyNo: 8, matricNumber: "MCB/20/6758" },
    { name: "Lawal Favour Ben", position: "MID" as const, level: "400l", jerseyNo: 68, matricNumber: "MCB/22/1322" },
    { name: "Olowu Dennis", position: "MID" as const, level: "200l", jerseyNo: 4, matricNumber: "MCB/24/1457" },
    { name: "Olaniran Oluwatimilehin", position: "FWD" as const, level: "500l", jerseyNo: 10, matricNumber: "MCB/20/6748" },
    { name: "Ameh Lucky", position: "FWD" as const, level: "400l", jerseyNo: 9, matricNumber: "MCB/22/1295" },
    { name: "Alowonle Clement", position: "FWD" as const, level: "500l", jerseyNo: 18, matricNumber: "MCB/20/6610" },
    { name: "Adameji Isaac", position: "DEF" as const, level: "500l", jerseyNo: 40, matricNumber: "MCB/19/2616" },
    { name: "Wasiu Ismaeel", position: "FWD" as const, level: "200l", jerseyNo: 21, matricNumber: "MCB/24/1469" },
    { name: "Adeleye Blessing", position: "DEF" as const, level: "500l", jerseyNo: 12, matricNumber: "MCB/20/6609" },
    { name: "Tallest", position: "DEF" as const, level: "200l", jerseyNo: 20, matricNumber: "MCB/24/1500" },
    { name: "Arogunrerin Abdulsalam", position: "MID" as const, level: "100l", jerseyNo: 38, matricNumber: "MCB/25/1298" },
    { name: "Olaoye Festus", position: "MID" as const, level: "300l", jerseyNo: 24, matricNumber: "MCB/23/6023" },
    { name: "Dyno", position: "MID" as const, level: "400l", jerseyNo: 64, matricNumber: "MCB/24/1245" },
    { name: "Olanipekun Alfred", position: "MID" as const, level: "500l", jerseyNo: 19, matricNumber: "MCB/20/6747" },
    { name: "Fayipe Christopher", position: "FWD" as const, level: "100l", jerseyNo: 66, matricNumber: "MCB/25/1329" },
    { name: "Adenoye Paul", position: "FWD" as const, level: "500l", jerseyNo: 11, matricNumber: "MCB/22/1275" },
    { name: "Oyelakin Fawaz", position: "FWD" as const, level: "500l", jerseyNo: 22, matricNumber: "MCB/20/6767" },
    { name: "Abdullattef Solah", position: "FWD" as const, level: "500l", jerseyNo: 7, matricNumber: "MCB/20/6609" }
  ].map((p, idx) => ({
    id: `player-mcb-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('mcb', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'mcb',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=mcb-player-${idx + 1}`
  })),

  // MBBS Official Squad (Medicine and Surgery starts + subs)
  ...[
    { name: "Afolabi Yusuf", position: "GK" as const, level: "300L", jerseyNo: 1, matricNumber: "MBS/23/0980" },
    { name: "Ojo Daniel", position: "DEF" as const, level: "400L", jerseyNo: 4, matricNumber: "MBS/21/0945" },
    { name: "Chinedu Nelson", position: "DEF" as const, level: "300L", jerseyNo: 5, matricNumber: "MBS/23/0954" },
    { name: "Eze Joshua", position: "DEF" as const, level: "300L", jerseyNo: 3, matricNumber: "MBS/23/0957" },
    { name: "Olumide Olamide", position: "DEF" as const, level: "500L", jerseyNo: 2, matricNumber: "MBS/20/0899" },
    { name: "SK", position: "MID" as const, level: "500L", jerseyNo: 7, matricNumber: "MBS/20/0912" },
    { name: "Balogun Victor", position: "MID" as const, level: "300L", jerseyNo: 8, matricNumber: "MBS/23/0932" },
    { name: "Adeniyi Samuel", position: "MID" as const, level: "400L", jerseyNo: 6, matricNumber: "MBS/22/0971" },
    { name: "Bamidele Fikayo", position: "FWD" as const, level: "500L", jerseyNo: 10, matricNumber: "MBS/20/0904" },
    { name: "Olawale Ibrahim", position: "FWD" as const, level: "300L", jerseyNo: 9, matricNumber: "MBS/23/0921" },
    { name: "Okonkwo Charles", position: "FWD" as const, level: "200L", jerseyNo: 11, matricNumber: "MBS/24/1012" }
  ].map((p, idx) => ({
    id: `player-mbbs-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('mbbs', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'mbbs',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=mbbs-player-${idx + 1}`
  })),

  // PHY Official Squad (Physics starting players + subs)
  ...[
    { name: "Eniola Ayomide Emmanuel", position: "GK" as const, level: "300l", jerseyNo: 13, matricNumber: "PHE/23/6610" },
    { name: "Ajayi Timothy", position: "DEF" as const, level: "500l", jerseyNo: 3, matricNumber: "PHY/20/7049" },
    { name: "Praise Balogun", position: "DEF" as const, level: "500l", jerseyNo: 16, matricNumber: "PHY/20/7069" },
    { name: "Okumagba Franklin", position: "DEF" as const, level: "200l", jerseyNo: 4, matricNumber: "PHY/24/2129" },
    { name: "Olamide Agboola", position: "DEF" as const, level: "400l", jerseyNo: 15, matricNumber: "PHY/22/1844" },
    { name: "Ajigboteleda Emmanuel", position: "MID" as const, level: "400l", jerseyNo: 18, matricNumber: "PHY/22/1847" },
    { name: "Temitope Ajayi", position: "MID" as const, level: "500l", jerseyNo: 17, matricNumber: "PHY/20/7048" },
    { name: "Uduak Abasi", position: "MID" as const, level: "500l", jerseyNo: 8, matricNumber: "PHY/20/7143" },
    { name: "Are Moses", position: "FWD" as const, level: "200l", jerseyNo: 19, matricNumber: "PHY/24/2064" },
    { name: "Iyenagbe Christian", position: "FWD" as const, level: "400l", jerseyNo: 14, matricNumber: "PHY/22/1884" },
    { name: "Akinseye Oluwasanmilore", position: "FWD" as const, level: "400l", jerseyNo: 11, matricNumber: "PHY/22/1857" },
    { name: "Lawal Oluwabukunmi", position: "DEF" as const, level: "500l", jerseyNo: 12, matricNumber: "PHY/20/7089" },
    { name: "Oladipupo Afeez", position: "FWD" as const, level: "400l", jerseyNo: 20, matricNumber: "PHY/22/1905" },
    { name: "Andrew Emmanuel", position: "FWD" as const, level: "300l", jerseyNo: 21, matricNumber: "PHE/23/6598" },
    { name: "Adeleye Benjamin", position: "GK" as const, level: "500l", jerseyNo: 1, matricNumber: "PHY/20/7030" },
    { name: "Olagundoye Joseph", position: "DEF" as const, level: "500l", jerseyNo: 2, matricNumber: "PHY/20/7112" },
    { name: "Gomes Oluwabukunmi", position: "DEF" as const, level: "500l", jerseyNo: 5, matricNumber: "PHY/22/2183" },
    { name: "Oyeleye Oladipupo", position: "MID" as const, level: "500l", jerseyNo: 10, matricNumber: "PHY/20/7134" },
    { name: "Abiola Samuel", position: "MID" as const, level: "500l", jerseyNo: 6, matricNumber: "PHY/20/7024" },
    { name: "Abiola Abdmalik", position: "MID" as const, level: "300l", jerseyNo: 22, matricNumber: "PHY/23/6523" },
    { name: "Adesomo Blessing", position: "FWD" as const, level: "500l", jerseyNo: 9, matricNumber: "PHY/20/7036" },
    { name: "Ubine David", position: "FWD" as const, level: "500l", jerseyNo: 7, matricNumber: "PHY/20/7142" },
    { name: "Adejimi Goodluck", position: "FWD" as const, level: "200l", jerseyNo: 23, matricNumber: "PHY/24/2031" }
  ].map((p, idx) => ({
    id: `player-phy-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('phy', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'phy',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=phy-player-${idx + 1}`
  })),

  // BDG Official Squad (Building Technology)
  ...[
    { name: "Ojo David", position: "GK" as const, level: "400L", jerseyNo: 1, matricNumber: "BDG/22/1185" },
    { name: "Arowolo Gideon", position: "DEF" as const, level: "500L", jerseyNo: 4, matricNumber: "BDG/21/1186" },
    { name: "Adeleke Samson", position: "DEF" as const, level: "300L", jerseyNo: 5, matricNumber: "BDG/23/1188" },
    { name: "Salami Victor", position: "DEF" as const, level: "200L", jerseyNo: 3, matricNumber: "BDG/24/1189" },
    { name: "Babalola Toheeb", position: "DEF" as const, level: "500L", jerseyNo: 2, matricNumber: "BDG/21/1190" },
    { name: "Akinbiyi Akinwalere Ayomikun", position: "MID" as const, level: "500L", jerseyNo: 8, matricNumber: "BDG/21/1192" },
    { name: "Akinfolahan Temidayo Ebunoluwa", position: "MID" as const, level: "300L", jerseyNo: 10, matricNumber: "BDG/23/1195" },
    { name: "Praise", position: "MID" as const, level: "400L", jerseyNo: 14, matricNumber: "BDG/22/1198" },
    { name: "Christopher Samuel", position: "FWD" as const, level: "100L", jerseyNo: 7, matricNumber: "BDG/25/1196" },
    { name: "Awoyemi Jesutofunmi", position: "FWD" as const, level: "400L", jerseyNo: 9, matricNumber: "BDG/22/1191" },
    { name: "Desmond", position: "FWD" as const, level: "500L", jerseyNo: 19, matricNumber: "BDG/21/1201" },
    { name: "Adebayo Kolawole", position: "DEF" as const, level: "300L", jerseyNo: 13, matricNumber: "BDG/23/1202" },
    { name: "Olawuyi Moses", position: "MID" as const, level: "200L", jerseyNo: 15, matricNumber: "BDG/24/1205" }
  ].map((p, idx) => ({
    id: p.name === "Awoyemi Jesutofunmi" ? "player-bdg-tofunmi" :
        p.name === "Desmond" ? "player-bdg-desmond" :
        p.name === "Praise" ? "player-bdg-praise" :
        `player-bdg-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('bdg', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'bdg',
    image: p.name === "Awoyemi Jesutofunmi" ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-tofunmi' :
           p.name === "Desmond" ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-desmond' :
           p.name === "Praise" ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-praise' :
           `https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-player-${idx + 1}`
  })),

  // AGE Official Squad (Agricultural and Environmental Engineering)
  ...[
    { name: "Babatunde", position: "GK" as const, level: "300L", jerseyNo: 1, matricNumber: "AGE/23/3912" }, // player-age-1
    { name: "Afolabi", position: "DEF" as const, level: "400L", jerseyNo: 2, matricNumber: "AGE/22/3913" },  // player-age-2
    { name: "Olawale", position: "DEF" as const, level: "200L", jerseyNo: 3, matricNumber: "AGE/24/3914" },  // player-age-3
    { name: "Temitope", position: "DEF" as const, level: "500L", jerseyNo: 4, matricNumber: "AGE/21/3915" }, // player-age-4
    { name: "Femi", position: "DEF" as const, level: "300L", jerseyNo: 5, matricNumber: "AGE/23/3916" },     // player-age-5
    { name: "Adeyemi", position: "MID" as const, level: "200L", jerseyNo: 6, matricNumber: "AGE/24/3917" },  // player-age-6
    { name: "Jones Falana", position: "MID" as const, level: "400L", jerseyNo: 7, matricNumber: "AGE/22/4021" }, // player-age-7
    { name: "Anthony", position: "MID" as const, level: "300L", jerseyNo: 9, matricNumber: "AGE/23/3911" },   // player-age-8 (Anthony scored 47')
    { name: "Tunde", position: "FWD" as const, level: "400L", jerseyNo: 8, matricNumber: "AGE/22/3918" },    // player-age-9
    { name: "Sylvanus", position: "FWD" as const, level: "500L", jerseyNo: 10, matricNumber: "AGE/21/5012" }, // player-age-10 (Sylvanus scored penalty 42')
    { name: "Samuel", position: "FWD" as const, level: "100L", jerseyNo: 11, matricNumber: "AGE/25/3919" },   // player-age-11
    { name: "Agesin", position: "DEF" as const, level: "300L", jerseyNo: 14, matricNumber: "AGE/23/3931" },   // player-age-12
    { name: "Muhammed", position: "FWD" as const, level: "400L", jerseyNo: 17, matricNumber: "AGE/22/3944" }  // player-age-13
  ].map((p, idx) => ({
    id: `player-age-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    regNumber: (globalThis as any).getPlayerRegNumber('age', idx),
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'age',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=age-player-${idx + 1}`
  })),

  // Auto-generate helper players for other teams to keep rosters occupied
  ...Array.from({ length: 150 }, (_, i) => {
    const team = TEAMS[i % TEAMS.length];
    if (team.id === 'mst' || team.id === 'fwt' || team.id === 'cys' || team.id === 'simt' || team.id === 'sta' || team.id === 'ifs' || team.id === 'mcb' || team.id === 'phy' || team.id === 'age' || team.id === 'mbbs' || team.id === 'bdg') {
      return null;
    }
    return {
      id: `player-${i + 1}`,
      name: ['John Doe', 'Samuel Ade', 'Tunde Williams', 'Chidi Okafor', 'Victor Moses', 'David Alaba', 'Olamide Baddo', 'Femi Kuti', 'Burna Boy', 'Wiz Kid', 'Davido', 'Rema', 'Asake', 'Tiwa Savage', 'Yemi Alade'][i % 15] + ` ${i + 1}`,
      position: ['FWD', 'MID', 'DEF', 'GK'][i % 4] as any,
      goals: 0,
      played: 0,
      cleanSheets: 0,
      teamId: team.id,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=player-${i + 1}`,
      regNumber: (globalThis as any).getPlayerRegNumber(team.id, i)
    };
  }).filter((p): p is any => p !== null) as Player[]
];

export const MATCHES: Match[] = [
  // --- MATCHDAY 1 (June 11 - 14) ---
  { 
    id: 'md1-1', 
    homeTeam: 'MST', 
    awayTeam: 'ICE', 
    date: '2026-06-11', 
    time: '13:30', 
    venue: 'FUTA Football Pitch', 
    status: 'Finished', 
    homeScore: 0, 
    awayScore: 0, 
    lineupSubmittedHome: true, 
    lineupSubmittedAway: true, 
    matchday: 1,
    referee: 'Adesiyan Victor',
    refereeAssigned: true,
    matchApproved: true,
    manOfTheMatch: 'Faleye Aduragbemi',
    officialsPanel: [
      'Kickoff supervision',
      'Foul adjudication',
      'Card issuance (Yellow/Red)',
      'Match timing control',
      'Final match report validation'
    ]
  }, // OPENING MATCH
  { id: 'md1-2', homeTeam: 'AGP', awayTeam: 'BCH', date: '2026-06-13', time: '09:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Abraham', refereeAssigned: true, manOfTheMatch: 'Oyelakin Abdulquadri' },
  { id: 'md1-3', homeTeam: 'CYS', awayTeam: 'ANA', date: '2026-06-13', time: '11:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Tosin', refereeAssigned: true, manOfTheMatch: 'Raji Jubril Olarewaju' },
  { id: 'md1-4', homeTeam: 'PHS', awayTeam: 'APH', date: '2026-06-13', time: '12:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 1, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Tosin', refereeAssigned: true, manOfTheMatch: 'Emmanuel' },
  { id: 'md1-5', homeTeam: 'BDG', awayTeam: 'ENT', date: '2026-06-13', time: '14:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Abraham', refereeAssigned: true, manOfTheMatch: 'Awoyemi Jesutofunmi' },
  { id: 'md1-6', homeTeam: 'IFS', awayTeam: 'CSP', date: '2026-06-13', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 1, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Jones', refereeAssigned: true, manOfTheMatch: 'Ademide' },
  { id: 'md1-7', homeTeam: 'FWT', awayTeam: 'IDD', date: '2026-06-13', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 2, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Jones', refereeAssigned: true, manOfTheMatch: 'Ikudayisi Oyesola' },
  { id: 'md1-8', homeTeam: 'AGE', awayTeam: 'SIMT', date: '2026-06-14', time: '16:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 3, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 1, referee: 'Juwon', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Adebayo Samuel Ayobami' },
  { id: 'md1-9', homeTeam: 'MBBS', awayTeam: 'STA', date: '2026-06-14', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 1, referee: 'Victor', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Bamidele Fikayo' },
  { id: 'md1-10', homeTeam: 'MCB', awayTeam: 'PHY', date: '2026-06-14', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 2, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 1, referee: 'Juwon', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Iyenagbe Christian' },

  // --- MATCHDAY 2 (June 20 - 21) ---
  { id: 'md2-1', homeTeam: 'CSP', awayTeam: 'STA', date: '2026-06-20', time: '09:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 3, awayScore: 2, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Abraham (MEE)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Akindeko Emmanuel' },
  { id: 'md2-2', homeTeam: 'APH', awayTeam: 'IDD', date: '2026-06-20', time: '11:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Abraham (MEE)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Ikudayisi Oyesola' },
  { id: 'md2-3', homeTeam: 'IFS', awayTeam: 'MBBS', date: '2026-06-20', time: '12:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Abraham (MEE)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Gowon Mathias Monday' },
  { id: 'md2-4', homeTeam: 'ICE', awayTeam: 'BCH', date: '2026-06-20', time: '14:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Tosin (MTS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Adeyemi Prosper' },
  { id: 'md2-5', homeTeam: 'PHS', awayTeam: 'AGP', date: '2026-06-20', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Victor (ESM)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Adeagbo Pelumi' },
  { id: 'md2-6', homeTeam: 'MST', awayTeam: 'CYS', date: '2026-06-20', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 4, awayScore: 4, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Tosin (MTS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Iyare Praise' },
  { id: 'md2-7', homeTeam: 'ENT', awayTeam: 'ANA', date: '2026-06-21', time: '12:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Juwon (MNE)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Dominion' },
  { id: 'md2-8', homeTeam: 'MCB', awayTeam: 'AGE', date: '2026-06-21', time: '14:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 3, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Juwon (MNE)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Oni Oluwadamilola' },
  { id: 'md2-9', homeTeam: 'BDG', awayTeam: 'FWT', date: '2026-06-21', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 4, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Juwon (MNE)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Awoyemi Jesutofunmi' },
  { id: 'md2-10', homeTeam: 'PHY', awayTeam: 'SIMT', date: '2026-06-21', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 2, referee: 'Victor (ESM)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Oweazim Chukwudumebi' },

  // --- MATCHDAY 3 (June 27 - 28) ---
  { id: 'md3-1', homeTeam: 'PHY', awayTeam: 'AGP', date: '2026-06-27', time: '09:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 2, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Victor (ESM)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Olasunkanmi Michael' },
  { id: 'md3-2', homeTeam: 'PHS', awayTeam: 'BCH', date: '2026-06-27', time: '11:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 2, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Victor (ESM)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'N/A' },
  { id: 'md3-3', homeTeam: 'CSP', awayTeam: 'CYS', date: '2026-06-27', time: '12:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 3, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Tosin (MTS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Olabode Victor Oluwatosin' },
  { id: 'md3-4', homeTeam: 'IFS', awayTeam: 'STA', date: '2026-06-27', time: '14:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 2, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Uche (CYS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Daisi Toluwanimi' },
  { id: 'md3-5', homeTeam: 'MCB', awayTeam: 'IDD', date: '2026-06-27', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 1, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Uche (CYS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'N/A' },
  { id: 'md3-6', homeTeam: 'MST', awayTeam: 'SIMT', date: '2026-06-27', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 4, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Uche (CYS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'Nkemjika Sydney' },
  { id: 'md3-7', homeTeam: 'ICE', awayTeam: 'FWT', date: '2026-06-28', time: '12:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 3, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3, walkover: true, referee: 'Administrative Walkover', refereeAssigned: true, matchApproved: true, note: 'Walkover due to FWT Disqualification' },
  { id: 'md3-8', homeTeam: 'APH', awayTeam: 'AGE', date: '2026-06-28', time: '14:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Peter (IFS)', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'N/A', note: 'Awarded by Committee Decision' },
  { id: 'md3-9', homeTeam: 'ENT', awayTeam: 'MBBS', date: '2026-06-28', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 1, awayScore: 3, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 3, referee: 'Fatai', refereeAssigned: true, matchApproved: true, manOfTheMatch: 'N/A' },
  { id: 'md3-10', homeTeam: 'BDG', awayTeam: 'ANA', date: '2026-06-28', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 3, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3, walkover: true, referee: 'Administrative Walkover', refereeAssigned: true, matchApproved: true, note: 'Walkover awarded in favour of ANA' },

  // --- PLAYOFF ROUND (June 29 - 30) ---
  { id: 'PO1', homeTeam: 'SEED3', awayTeam: 'SEED14', date: 'TBA', time: 'TBA', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 4, stage: 'Playoff Round' },
  { id: 'PO2', homeTeam: 'SEED4', awayTeam: 'SEED13', date: 'TBA', time: 'TBA', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: true, lineupSubmittedAway: true, matchday: 4, stage: 'Playoff Round' },
  { id: 'PO3', homeTeam: 'SEED5', awayTeam: 'SEED12', date: 'TBA', time: 'TBA', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 4, stage: 'Playoff Round' },
  { id: 'PO4', homeTeam: 'SEED6', awayTeam: 'SEED11', date: 'TBA', time: 'TBA', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 4, stage: 'Playoff Round' },
  { id: 'PO5', homeTeam: 'SEED7', awayTeam: 'SEED10', date: 'TBA', time: 'TBA', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 4, stage: 'Playoff Round' },
  { id: 'PO6', homeTeam: 'SEED8', awayTeam: 'SEED9', date: 'TBA', time: 'TBA', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 4, stage: 'Playoff Round' },

  // --- QUARTER-FINALS (July 1 - 2) ---
  { id: 'QF1', homeTeam: 'SEED1', awayTeam: 'PO6_WINNER', date: '2026-07-01', time: '14:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 5, stage: 'Quarter-finals' },
  { id: 'QF2', homeTeam: 'SEED2', awayTeam: 'PO5_WINNER', date: '2026-07-01', time: '16:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 5, stage: 'Quarter-finals' },
  { id: 'QF3', homeTeam: 'PO2_WINNER', awayTeam: 'PO4_WINNER', date: '2026-07-02', time: '14:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 5, stage: 'Quarter-finals' },
  { id: 'QF4', homeTeam: 'PO1_WINNER', awayTeam: 'PO3_WINNER', date: '2026-07-02', time: '16:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 5, stage: 'Quarter-finals' },

  // --- SEMI-FINALS (July 4 - 5, Two-legged Home & Away Aggregate) ---
  { id: 'SF1_1', homeTeam: 'QF1_WINNER', awayTeam: 'QF3_WINNER', date: '2026-07-04', time: '15:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 6, stage: 'Semi-finals' },
  { id: 'SF1_2', homeTeam: 'QF3_WINNER', awayTeam: 'QF1_WINNER', date: '2026-07-05', time: '15:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 6, stage: 'Semi-finals' },
  { id: 'SF2_1', homeTeam: 'QF2_WINNER', awayTeam: 'QF4_WINNER', date: '2026-07-04', time: '17:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 6, stage: 'Semi-finals' },
  { id: 'SF2_2', homeTeam: 'QF4_WINNER', awayTeam: 'QF2_WINNER', date: '2026-07-05', time: '17:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 6, stage: 'Semi-finals' },

  // --- FINAL (July 6) ---
  { id: 'FINAL', homeTeam: 'SF1_WINNER', awayTeam: 'SF2_WINNER', date: '2026-07-06', time: '16:00', venue: 'FUTA Football Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 7, stage: 'Final' },
];

export const NEWS: NewsPost[] = [
  {
    id: 'disciplinary-mst-simt',
    title: '🚨 OFFICIAL STATEMENT ON THE MST vs SIMT FIXTURE',
    excerpt: 'The FCL Disciplinary Committee has suspended Nwabunwanne Chibichi Daniel (SIMT) for 2 matches and Adeyemi Adebayo Ibrahim (MST) for 1 match, and fined both teams ₦10,000.',
    content: `Published: 28th June, 2026
Time: 22:30

Following a thorough review of the reports and incidents recorded during the **Marine Science and Technology (MST)** vs **Security, Investment and Management Technology (SIMT)** fixture, the FCL Disciplinary Committee hereby issues the following decisions:

## 1. SUSPENSION OF PLAYERS

**Nwabunwanne Chibichi Daniel (SIMT)** is hereby suspended for **two (2) matches**, effective immediately. This suspension is **not subject to appeal**. The sanction is imposed due to his use of abusive and vulgar language towards match officials and opposition players, as well as his unsportsmanlike conduct following MST's second goal.

**Adeyemi Adebayo Ibrahim (MST)** is hereby suspended for **one (1) match**, effective immediately. This suspension is **not subject to appeal**. Upon confirmation from the match officials, the Committee finds that, despite his intention to de-escalate the situation, his conduct during the incident following MST's second goal constituted unsportsmanlike behaviour that contributed to the disorder.

## 2. FINANCIAL SANCTIONS

In view of the misconduct displayed by players of both teams during the fixture, the Committee has imposed a fine of **₦10,000 (Ten Thousand Naira only)** on **Marine Science and Technology (MST)** and **Security, Investment and Management Technology (SIMT)** respectively.

The fines are intended to reinforce the responsibility of teams to maintain discipline and ensure the conduct of their players throughout the competition.

## 3. WARNING TO SIMT

**Security, Investment and Management Technology (SIMT)** is hereby issued a **final warning** following the general misconduct exhibited by members of the team, who allowed emotions to overshadow the principles of fair play and sportsmanship.

The Committee wishes to make it clear that any future occurrence of a similar nature involving SIMT may attract more severe disciplinary measures, including possible expulsion from the FUTA Champions League.

The FUTA Champions League remains committed to upholding discipline, fairness, respect for match officials, and the spirit of sportsmanship. All participating teams are reminded that misconduct of any form will be met with appropriate disciplinary action in accordance with the FCL Regulations.

This decision takes immediate effect.

**Signed,**

**FCL Disciplinary Committee**`,
    image: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1000',
    date: '2026-06-28',
    category: 'Committee Announcement'
  },
  {
    id: 'postponed-notice',
    title: '🚨 OFFICIAL NOTICE OF POSTPONEMENT 🚨',
    excerpt: 'The Opening Match of the 2026 FUTA Champions League (MST vs ICE) has been postponed until further notice due to adverse playing conditions.',
    content: `Published: 5th June, 2026
Time: 17:30

The FUTA Champions League Committee regrets to inform all participating teams, officials, stakeholders, and supporters that the Opening Match of the 2026 FUTA Champions League has been postponed until further notice.

Match Details
🏆 FUTA Champions League 2026 – Opening Match
⚔️ MST vs ICE
📅 Friday, 5th June 2026
🕔 Kick-off: 5:00 PM

This decision was necessitated by the heavy rainfall experienced today and its adverse effect on the condition of the playing surface, making it unsafe and unsuitable for competitive football.

The safety of players, officials, and spectators remains our utmost priority. As such, the Committee has deemed it necessary to postpone the fixture until conditions are favorable for play.

Consequently, this postponement may result in adjustments to the 2026 FUTA Champions League calendar and match schedule. All participating teams and stakeholders will be duly informed of any changes as they become necessary.

A new date and time for the fixture will be communicated in due course.

The Committee appreciates the understanding, patience, and continued support of all teams, partners, and football enthusiasts.

Thank you.

FUTA Champions League Committee
Building the Premier Inter-Departmental Football Competition in FUTA`,
    image: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=1000',
    date: '2026-06-05',
    category: 'Committee Announcement'
  },
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
    title: 'Defending Champions MST Ready',
    excerpt: 'MST captain speaks on their preparations for the new season.',
    content: 'Longer content about titans fcl...',
    image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
    date: '2026-04-25',
    category: 'Interview'
  }
];

export const SPONSORS: Sponsor[] = [
  { id: 'hua-express', name: 'HUA Express', logo: 'public/logos/HUA Express.jpg', logoUrl: 'public/logos/HUA Express.jpg', category: 'Sponsor', tier: 'GOLD', website: 'https://www.huaexpress.delivery/', email: 'huaexpress@business.com' },
  { id: 'sydtech', name: 'Sydtech', logo: 'public/logos/Sydtech.jpg', logoUrl: null, category: 'Sponsor', tier: 'SILVER', website: '#', email: 'contact@sydtech.com' },
  { id: 'chime-sports', name: 'Chime Sports', logo: 'public/logos/Chima Sports.jpg', logoUrl: null, category: 'Sponsor', tier: 'SILVER', website: '#' },
  { id: 'favy-scentual', name: 'Favy Scentual', logo: 'public/logos/Favy Scentual.jpg', logoUrl: null, category: 'Sponsor', tier: 'SILVER', website: '#' },
  { id: 'oyn', name: 'OYN', logo: 'public/logos/OYN.jpg', logoUrl: null, category: 'Sponsor', tier: 'SILVER', website: '#' },
  { id: 'futa-bro', name: 'FUTA Bro', logo: 'public/logos/FUTA Bro.jpg', logoUrl: null, category: 'Media Partner', tier: 'BRONZE', website: '#' },
  { id: 'futa-fabrizio', name: 'FUTA Fabrizio', logo: 'public/logos/FUTA Fabrizio.jpg', logoUrl: null, category: 'Media Partner', tier: 'BRONZE', website: '#' }
];

export const COEFFICIENTS: CoefficientRanking[] = [
  { rank: 1, teamId: 'mst', teamName: 'Marine Science and Technology', points2026: 9.00, points2025: 16.00, totalCoefficient: 25.00, isActive: true, movement: '🟢⬆️' },
  { rank: 2, teamId: 'bdg', teamName: 'Building Technology', points2026: 10.00, points2025: 13.00, totalCoefficient: 23.00, isActive: true, movement: '🟢⬇️' },
  { rank: 3, teamId: 'ifs', teamName: 'Information Systems', points2026: 7.00, points2025: 16.00, totalCoefficient: 23.00, isActive: true, movement: '🟢⬇️' },
  { rank: 4, teamId: 'mcb', teamName: 'Micro Biology', points2026: 8.00, points2025: 11.00, totalCoefficient: 19.00, isActive: true, movement: '🟢➡️' },
  { rank: 5, teamId: 'csp', teamName: 'Crop Soil and Pest Management', points2026: 9.00, points2025: 8.00, totalCoefficient: 17.00, isActive: true, movement: '🟢➡️' },
  { rank: 6, teamId: 'ipe', teamName: 'Industrial and Production Engineering', points2026: 0.00, points2025: 17.00, totalCoefficient: 17.00, isActive: false, movement: '🔴➡️' },
  { rank: 7, teamId: 'agy', teamName: 'Applied Geology', points2026: 0.00, points2025: 15.00, totalCoefficient: 15.00, isActive: false, movement: '🔴➡️' },
  { rank: 8, teamId: 'phs', teamName: 'Physiology', points2026: 7.00, points2025: 7.00, totalCoefficient: 14.00, isActive: true, movement: '🟢➡️' },
  { rank: 9, teamId: 'cys', teamName: 'Cyber Security', points2026: 10.00, points2025: 3.00, totalCoefficient: 13.00, isActive: true, movement: '🟢⬆️' },
  { rank: 10, teamId: 'fat', teamName: 'Fisheries and Aquaculture Technology', points2026: 0.00, points2025: 13.00, totalCoefficient: 13.00, isActive: false, movement: '🔴⬇️' },
  { rank: 11, teamId: 'ice', teamName: 'Information and Communication Engineering', points2026: 11.00, points2025: 0.00, totalCoefficient: 11.00, isActive: true, movement: '🟢⬇️' },
  { rank: 12, teamId: 'ent', teamName: 'Entrepreneurship', points2026: 4.00, points2025: 7.00, totalCoefficient: 11.00, isActive: true, movement: '🟢⬇️' },
  { rank: 13, teamId: 'mme', teamName: 'Metallurgical and Materials Engineering', points2026: 0.00, points2025: 11.00, totalCoefficient: 11.00, isActive: false, movement: '🔴⬇️' },
  { rank: 14, teamId: 'mne', teamName: 'Mining Engineering', points2026: 0.00, points2025: 11.00, totalCoefficient: 11.00, isActive: false, movement: '🔴⬇️' },
  { rank: 15, teamId: 'idd', teamName: 'Industrial Design', points2026: 10.00, points2025: 0.00, totalCoefficient: 10.00, isActive: true, movement: '🟢⬆️' },
  { rank: 16, teamId: 'mbbs', teamName: 'Medicine and Surgery', points2026: 6.00, points2025: 4.00, totalCoefficient: 10.00, isActive: true, movement: '🟢⬇️' },
  { rank: 17, teamId: 'phy', teamName: 'Physics', points2026: 9.00, points2025: 0.00, totalCoefficient: 9.00, isActive: true, movement: '🟢⬆️' },
  { rank: 18, teamId: 'ana', teamName: 'Anatomy', points2026: 9.00, points2025: 0.00, totalCoefficient: 9.00, isActive: true, movement: '🟢⬆️' },
  { rank: 19, teamId: 'mts', teamName: 'Mathematics', points2026: 0.00, points2025: 9.00, totalCoefficient: 9.00, isActive: false, movement: '🔴⬇️' },
  { rank: 20, teamId: 'rsg', teamName: 'Remote Sensing & GIS', points2026: 0.00, points2025: 8.00, totalCoefficient: 8.00, isActive: false, movement: '🔴➡️' },
  { rank: 21, teamId: 'aph', teamName: 'Animal Production and Health', points2026: 7.00, points2025: 0.00, totalCoefficient: 7.00, isActive: true, movement: '🟢➡️' },
  { rank: 22, teamId: 'simt', teamName: 'Securities and Investment Management Technology', points2026: 7.00, points2025: 0.00, totalCoefficient: 7.00, isActive: true, movement: '🟢➡️' },
  { rank: 23, teamId: 'agp', teamName: 'Applied Geo-Physics', points2026: 7.00, points2025: 0.00, totalCoefficient: 7.00, isActive: true, movement: '🟢➡️' },
  { rank: 24, teamId: 'bch', teamName: 'Bio Chemistry', points2026: 6.00, points2025: 0.00, totalCoefficient: 6.00, isActive: true, movement: '🟢⬆️' },
  { rank: 25, teamId: 'sta', teamName: 'Statistics', points2026: 6.00, points2025: 0.00, totalCoefficient: 6.00, isActive: true, movement: '🟢⬆️' },
  { rank: 26, teamId: 'ltt', teamName: 'Logistics and Transport Technology', points2026: 0.00, points2025: 6.00, totalCoefficient: 6.00, isActive: false, movement: '🔴⬇️' },
  { rank: 27, teamId: 'svg', teamName: 'Surveying and Geoinformatics', points2026: 0.00, points2025: 6.00, totalCoefficient: 6.00, isActive: false, movement: '🔴⬇️' },
  { rank: 28, teamId: 'bmt', teamName: 'Bio Medical Technology', points2026: 0.00, points2025: 4.00, totalCoefficient: 4.00, isActive: false, movement: '🔴⬇️' },
  { rank: 29, teamId: 'age', teamName: 'Agricultural and Environmental Engineering', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true, movement: '🟢➡️' },
  { rank: 30, teamId: 'fwt', teamName: 'Forestry and Wood Technology', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true, movement: '🟢➡️' },
  { rank: 31, teamId: 'che', teamName: 'Chemistry', points2026: 0.00, points2025: 3.00, totalCoefficient: 3.00, isActive: false, movement: '🔴➡️' },
];

export const MOCK_MATCH_STATS: MatchStats[] = MATCHES.map((match) => {
  if (match.id === 'md1-1') {
    return {
      matchId: match.id,
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 0
    };
  }
  if (match.id === 'md2-7') {
    return {
      matchId: match.id,
      cornersHome: 4,
      cornersAway: 3,
      yellowCardsHome: 2,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
      homeCorners: 4,
      awayCorners: 3,
      homeYellowCards: 2,
      awayYellowCards: 1,
      homeRedCards: 0,
      awayRedCards: 0
    };
  }
  if (match.id === 'md2-8') {
    return {
      matchId: match.id,
      cornersHome: 6,
      cornersAway: 5,
      yellowCardsHome: 2,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 1,
      homeCorners: 6,
      awayCorners: 5,
      homeYellowCards: 2,
      awayYellowCards: 1,
      homeRedCards: 0,
      awayRedCards: 1
    };
  }
  if (match.id === 'md2-9') {
    return {
      matchId: match.id,
      cornersHome: 3,
      cornersAway: 5,
      yellowCardsHome: 1,
      yellowCardsAway: 2,
      redCardsHome: 0,
      redCardsAway: 0,
      homeCorners: 3,
      awayCorners: 5,
      homeYellowCards: 1,
      awayYellowCards: 2,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 5,
      awayFouls: 8,
      homeFreeKicks: 8,
      awayFreeKicks: 5
    };
  }
  if (match.id === 'md2-10') {
    return {
      matchId: match.id,
      cornersHome: 5,
      cornersAway: 1,
      yellowCardsHome: 0,
      yellowCardsAway: 3,
      redCardsHome: 0,
      redCardsAway: 0,
      homeCorners: 5,
      awayCorners: 1,
      homeYellowCards: 0,
      awayYellowCards: 3,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 3,
      homeFouls: 4,
      awayFouls: 8,
      homeFreeKicks: 8,
      awayFreeKicks: 4
    };
  }
  const charSum = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    matchId: match.id,
    cornersHome: (charSum % 7) + 2,
    cornersAway: (charSum % 6) + 1,
    yellowCardsHome: charSum % 4,
    yellowCardsAway: charSum % 5,
    redCardsHome: charSum % 11 === 0 ? 1 : 0,
    redCardsAway: charSum % 13 === 0 ? 1 : 0
  };
});

