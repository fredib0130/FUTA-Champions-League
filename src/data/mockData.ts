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
  { id: 'player-bdg-tofunmi', name: "Tofunmi", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'bdg', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-tofunmi' },
  { id: 'player-bdg-desmond', name: "Desmond", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'bdg', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-desmond' },
  { id: 'player-bdg-praise', name: "Praise", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'bdg', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bdg-praise' },
  { id: 'player-ent-promise', name: "Promise", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ent', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ent-promise' },
  { id: 'player-ent-fairy', name: "Fairy", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ent', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ent-fairy' },
  { id: 'player-aph-kunlex', name: "Kunlex", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'aph', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aph-kunlex' },
  { id: 'player-aph-emmanuel', name: "Emmanuel", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'aph', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aph-emmanuel' },
  { id: 'player-csp-ademide', name: "Ademide", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'csp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=csp-ademide' },
  { id: 'player-csp-adedara', name: "Adedara", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'csp', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=csp-adedara' },
  { id: 'player-ifs-idris', name: "Idris", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-idris' },
  { id: 'player-ifs-kehinde', name: "Kehinde", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-kehinde' },
  { id: 'player-ifs-segun', name: "Segun", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-segun' },
  { id: 'player-ifs-victor', name: "Victor", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'ifs', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ifs-victor' },
  { id: 'player-idd-soji', name: "Soji", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-soji' },
  { id: 'player-idd-sola', name: "Sola", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-sola' },
  { id: 'player-idd-tolu', name: "Tolu", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'idd', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=idd-tolu' },
  { id: 'player-fwt-neymar', name: "Neymar", position: "FWD" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'fwt', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fwt-neymar' },
  { id: 'player-fwt-enzo', name: "Enzo", position: "MID" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'fwt', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fwt-enzo' },
  { id: 'player-fwt-malik', name: "Malik", position: "DEF" as const, goals: 0, played: 0, cleanSheets: 0, teamId: 'fwt', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fwt-malik' },

  // Official MST Squad List
  ...[
    { name: "Ogundeji Feyitunmise Hezekiah", position: "GK" as const, level: "500L", jerseyNo: 1, matricNumber: "MST/20/5287" },
    { name: "Adeyemi Adedayo Ibrahim", position: "DEF" as const, level: "500L", jerseyNo: 8, matricNumber: "MST/20/5251" },
    { name: "Akinnayajo Irewale", position: "DEF" as const, level: "500L", matricNumber: "MST/20/5259" },
    { name: "Ojoisimi Bright Agbomizi", position: "DEF" as const, level: "300L", matricNumber: "MST/23/4393" },
    { name: "Bernard Augustine Obioma", position: "DEF" as const, level: "200L", jerseyNo: 16, matricNumber: "MST/24/9615" },
    { name: "Philip Believe Oluwashina", position: "DEF" as const, level: "500L", matricNumber: "MST/20/5302" },
    { name: "Adeniyi Ademola Daniel", position: "DEF" as const, level: "400L", jerseyNo: 2, matricNumber: "MST/22/9519" },
    { name: "Ademisoye Segun", position: "DEF" as const, level: "300L", matricNumber: "MST/23/4356" },
    { name: "Adediran Olanrewaju Abeeb", position: "MID" as const, level: "300L", jerseyNo: 4, matricNumber: "MST/23/4355" },
    { name: "Iyare Praise", position: "MID" as const, level: "500L", jerseyNo: 55, matricNumber: "MST/20/5281" },
    { name: "Akinyo Boluwatife Precious", position: "MID" as const, level: "100L", matricNumber: "MST/25/7760" },
    { name: "Adekunle Ayomide Mubarak", position: "MID" as const, level: "200L", matricNumber: "MST/24/9603" },
    { name: "Olagunju Moses Temitope", position: "MID" as const, level: "500L", matricNumber: "MST/19/0958" },
    { name: "Ayeni Ayobami", position: "MID" as const, level: "100L", matricNumber: "MST/25/7765" },
    { name: "Nkemjika Sydney", position: "FWD" as const, level: "400L", jerseyNo: 9, matricNumber: "MST/22/9560" },
    { name: "Shomuyiwa Lateef Babatunde", position: "FWD" as const, level: "200L", matricNumber: "MST/24/9656" },
    { name: "Boyede Joseph Ayomide", position: "FWD" as const, level: "300L", jerseyNo: 10, matricNumber: "MST/23/4376" },
    { name: "Fabusuyi Daniel Oluwafisayo", position: "FWD" as const, level: "500L", matricNumber: "MST/20/5277" },
    { name: "Akintunde Ayomide Oluwaseyifunmi", position: "FWD" as const, level: "100L", jerseyNo: 30, matricNumber: "MST/25/7758" },
    { name: "Ekwe Fortune", position: "FWD" as const, level: "500L", matricNumber: "MST/20/5273" }
  ].map((p, idx) => ({
    id: `player-mst-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    matricNumber: p.matricNumber,
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
    matricNumber: p.matricNumber,
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
    { name: "Adetule Marvellous Mayowa", position: "FWD" as const, level: "500L", jerseyNo: 19, matricNumber: "CYS/20/4899" }
  ].map((p, idx) => ({
    id: `player-cys-${idx + 1}`,
    name: p.name,
    position: p.position,
    level: p.level,
    jerseyNo: p.jerseyNo,
    matricNumber: p.matricNumber,
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
    matricNumber: p.matricNumber,
    goals: 0,
    played: 0,
    cleanSheets: 0,
    teamId: 'simt',
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=simt-player-${idx + 1}`
  })),

  // Auto-generate helper players for other teams to keep rosters occupied
  ...Array.from({ length: 150 }, (_, i) => {
    const team = TEAMS[i % TEAMS.length];
    if (team.id === 'mst' || team.id === 'fwt' || team.id === 'cys' || team.id === 'simt') {
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
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=player-${i + 1}`
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
  { id: 'md1-5', homeTeam: 'BDG', awayTeam: 'ENT', date: '2026-06-13', time: '14:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 2, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Abraham', refereeAssigned: true, manOfTheMatch: 'Tofunmi' },
  { id: 'md1-6', homeTeam: 'IFS', awayTeam: 'CSP', date: '2026-06-13', time: '15:30', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 1, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Jones', refereeAssigned: true, manOfTheMatch: 'Ademide' },
  { id: 'md1-7', homeTeam: 'FWT', awayTeam: 'IDD', date: '2026-06-13', time: '17:00', venue: 'Mini Pitch', status: 'Finished', homeScore: 0, awayScore: 2, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1, referee: 'Jones', refereeAssigned: true, manOfTheMatch: 'Sola' },
  { id: 'md1-8', homeTeam: 'AGE', awayTeam: 'SIMT', date: '2026-06-14', time: '16:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1 },
  { id: 'md1-9', homeTeam: 'MBBS', awayTeam: 'STA', date: '2026-06-14', time: '15:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1 },
  { id: 'md1-10', homeTeam: 'MCB', awayTeam: 'PHY', date: '2026-06-14', time: '17:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 1 },

  // --- MATCHDAY 2 (June 20 - 21) ---
  { id: 'md2-1', homeTeam: 'CSP', awayTeam: 'STA', date: '2026-06-20', time: '11:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-2', homeTeam: 'PHS', awayTeam: 'AGP', date: '2026-06-20', time: '12:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-3', homeTeam: 'PHY', awayTeam: 'SIMT', date: '2026-06-20', time: '14:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-4', homeTeam: 'MST', awayTeam: 'CYS', date: '2026-06-20', time: '15:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-5', homeTeam: 'APH', awayTeam: 'IDD', date: '2026-06-20', time: '17:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-6', homeTeam: 'IFS', awayTeam: 'MBBS', date: '2026-06-21', time: '11:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-7', homeTeam: 'ENT', awayTeam: 'ANA', date: '2026-06-21', time: '12:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-8', homeTeam: 'MCB', awayTeam: 'AGE', date: '2026-06-21', time: '14:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-9', homeTeam: 'ICE', awayTeam: 'BCH', date: '2026-06-21', time: '15:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },
  { id: 'md2-10', homeTeam: 'BDG', awayTeam: 'FWT', date: '2026-06-21', time: '17:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 2 },

  // --- MATCHDAY 3 (June 27 - 28) ---
  { id: 'md3-1', homeTeam: 'MST', awayTeam: 'SIMT', date: '2026-06-27', time: '09:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-2', homeTeam: 'ENT', awayTeam: 'MBBS', date: '2026-06-27', time: '11:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-3', homeTeam: 'PHS', awayTeam: 'BCH', date: '2026-06-27', time: '12:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-4', homeTeam: 'ICE', awayTeam: 'FWT', date: '2026-06-27', time: '14:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-5', homeTeam: 'BDG', awayTeam: 'ANA', date: '2026-06-27', time: '15:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-6', homeTeam: 'CSP', awayTeam: 'CYS', date: '2026-06-28', time: '09:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-7', homeTeam: 'IFS', awayTeam: 'STA', date: '2026-06-28', time: '11:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-8', homeTeam: 'PHY', awayTeam: 'AGP', date: '2026-06-28', time: '12:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-9', homeTeam: 'MCB', awayTeam: 'IDD', date: '2026-06-28', time: '14:00', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
  { id: 'md3-10', homeTeam: 'APH', awayTeam: 'AGE', date: '2026-06-28', time: '15:30', venue: 'Mini Pitch', status: 'Upcoming', homeScore: 0, awayScore: 0, lineupSubmittedHome: false, lineupSubmittedAway: false, matchday: 3 },
];

export const NEWS: NewsPost[] = [
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
  { rank: 1, teamId: 'ifs', teamName: 'Information Systems', points2026: 4.00, points2025: 16.00, totalCoefficient: 20.00, isActive: true },
  { rank: 2, teamId: 'mst', teamName: 'Marine Science and Technology', points2026: 4.00, points2025: 16.00, totalCoefficient: 20.00, isActive: true },
  { rank: 3, teamId: 'bdg', teamName: 'Building Technology', points2026: 4.00, points2025: 13.00, totalCoefficient: 17.00, isActive: true },
  { rank: 4, teamId: 'ipe', teamName: 'Industrial and Production Engineering', points2026: 0.00, points2025: 17.00, totalCoefficient: 17.00, isActive: false },
  { rank: 5, teamId: 'mcb', teamName: 'Micro Biology', points2026: 4.00, points2025: 11.00, totalCoefficient: 15.00, isActive: true },
  { rank: 6, teamId: 'agy', teamName: 'Applied Geology', points2026: 0.00, points2025: 15.00, totalCoefficient: 15.00, isActive: false },
  { rank: 7, teamId: 'fat', teamName: 'Fisheries and Aquaculture Technology', points2026: 0.00, points2025: 13.00, totalCoefficient: 13.00, isActive: false },
  { rank: 8, teamId: 'phs', teamName: 'Physiology', points2026: 4.00, points2025: 7.00, totalCoefficient: 11.00, isActive: true },
  { rank: 9, teamId: 'ent', teamName: 'Entrepreneurship', points2026: 4.00, points2025: 7.00, totalCoefficient: 11.00, isActive: true },
  { rank: 10, teamId: 'csp', teamName: 'Crop Soil and Pest Management', points2026: 3.00, points2025: 8.00, totalCoefficient: 11.00, isActive: true },
  { rank: 11, teamId: 'mme', teamName: 'Metallurgical and Materials Engineering', points2026: 0.00, points2025: 11.00, totalCoefficient: 11.00, isActive: false },
  { rank: 12, teamId: 'mne', teamName: 'Mining Engineering', points2026: 0.00, points2025: 11.00, totalCoefficient: 11.00, isActive: false },
  { rank: 13, teamId: 'mts', teamName: 'Mathematics', points2026: 0.00, points2025: 9.00, totalCoefficient: 9.00, isActive: false },
  { rank: 14, teamId: 'rsg', teamName: 'Remote Sensing & GIS', points2026: 0.00, points2025: 8.00, totalCoefficient: 8.00, isActive: false },
  { rank: 15, teamId: 'mbbs', teamName: 'Medicine and Surgery', points2026: 3.00, points2025: 4.00, totalCoefficient: 7.00, isActive: true },
  { rank: 16, teamId: 'cys', teamName: 'Cyber Security', points2026: 3.00, points2025: 3.00, totalCoefficient: 6.00, isActive: true },
  { rank: 17, teamId: 'ltt', teamName: 'Logistics and Transport Technology', points2026: 0.00, points2025: 6.00, totalCoefficient: 6.00, isActive: false },
  { rank: 18, teamId: 'svg', teamName: 'Surveying and Geoinformatics', points2026: 0.00, points2025: 6.00, totalCoefficient: 6.00, isActive: false },
  { rank: 19, teamId: 'aph', teamName: 'Animal Production and Health', points2026: 4.00, points2025: 0.00, totalCoefficient: 4.00, isActive: true },
  { rank: 20, teamId: 'ice', teamName: 'Information and Communication Engineering', points2026: 4.00, points2025: 0.00, totalCoefficient: 4.00, isActive: true },
  { rank: 21, teamId: 'phy', teamName: 'Physics', points2026: 4.00, points2025: 0.00, totalCoefficient: 4.00, isActive: true },
  { rank: 22, teamId: 'bmt', teamName: 'Bio Medical Technology', points2026: 0.00, points2025: 4.00, totalCoefficient: 4.00, isActive: false },
  { rank: 23, teamId: 'age', teamName: 'Agricultural and Environmental Engineering', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 24, teamId: 'agp', teamName: 'Applied Geo-Physics', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 25, teamId: 'ana', teamName: 'Anatomy', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 26, teamId: 'bch', teamName: 'Bio Chemistry', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 27, teamId: 'fwt', teamName: 'Forestry and Wood Technology', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 28, teamId: 'sta', teamName: 'Statistics', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 29, teamId: 'idd', teamName: 'Industrial Design', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 30, teamId: 'simt', teamName: 'Securities and Investment Management Technology', points2026: 3.00, points2025: 0.00, totalCoefficient: 3.00, isActive: true },
  { rank: 31, teamId: 'che', teamName: 'Chemistry', points2026: 0.00, points2025: 3.00, totalCoefficient: 3.00, isActive: false },
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

