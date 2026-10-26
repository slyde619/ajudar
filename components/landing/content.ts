import type { EstimateLineItem } from "@/lib/types";

export const EXAMPLE_ESTIMATE: { total: number; items: EstimateLineItem[] } = {
  total: 2_500_000,
  items: [
    { id: "l", kind: "labour", label: "Plumbing repair", amount: 1_400_000, negotiable: true },
    { id: "t", kind: "transport", label: "Call-out and transport within Rumuola", amount: 300_000, negotiable: false },
    {
      id: "m",
      kind: "materials",
      label: "Pipe, fittings, sealant",
      amount: 800_000,
      negotiable: false,
      note: "Receipted. You pay what they cost",
    },
  ],
};

export const GATE_CHECKS = [
  { title: "NIN matched to a live selfie", detail: "checked by Smile ID when they join." },
  { title: "A guarantor we called", detail: "someone who knows their work, confirmed by phone." },
  { title: "Real photos of past jobs", detail: "checked by hand before they see a single request." },
  { title: "A selfie at your gate", detail: "you see it matched before you open up." },
] as const;

export const GREETINGS = [
  { lang: "en", language: "English", text: "What's broken?" },
  { lang: "pcm", language: "Pidgin", text: "Wetin spoil?" },
  { lang: "ig", language: "Igbo", text: "Gịnị mebiri?" },
  { lang: "yo", language: "Yorùbá", text: "Kí ló bàjẹ́?" },
  { lang: "ha", language: "Hausa", text: "Me ya lalace?" },
] as const;

export const DRAFT_GREETINGS = [
  { lang: "ibb", language: "Ibibio", text: "Nso abiara?" },
  { lang: "efi", language: "Efik", text: "Nso ebiara?" },
  { lang: "ikw", language: "Ikwerre", text: null },
  { lang: "ijc", language: "Kalabari", text: null },
  { lang: "ogo", language: "Khana (Ogoni)", text: null },
  { lang: "anw", language: "Annang", text: null },
  { lang: "orx", language: "Oro", text: null },
] as const;

export type TradeTone = "blue" | "sand" | "mint" | "peach" | "lilac" | "rose";

export const TRADES: { id: string; label: string; book: string; line: string; jobs: string[]; tone: TradeTone }[] = [
  {
    id: "plumbing",
    label: "Plumbing",
    book: "Book a plumber",
    line: "The tap that won't stop, the borehole pump, the overhead tank that won't fill.",
    jobs: ["Leaking tap", "Borehole pump", "Water heater", "Blocked drain"],
    tone: "blue",
  },
  {
    id: "electrical",
    label: "Electrical",
    book: "Book an electrician",
    line: "Light comes back and the socket sparks. Wiring, breakers, fittings, done safely.",
    jobs: ["Sparking socket", "Rewiring", "Changeover", "Ceiling fan"],
    tone: "sand",
  },
  {
    id: "ac",
    label: "AC servicing",
    book: "Book an AC technician",
    line: "Blowing hot air in the dry season. Gas, cleaning and installation.",
    jobs: ["Not cooling", "Gas refill", "Cleaning", "Installation"],
    tone: "mint",
  },
  {
    id: "generator",
    label: "Generator",
    book: "Book a gen repairer",
    line: "The gen that won't start an hour before the match.",
    jobs: ["Won't start", "Servicing", "Carburettor", "Rewinding"],
    tone: "peach",
  },
  {
    id: "carpentry",
    label: "Carpentry",
    book: "Book a carpenter",
    line: "Doors that won't close, a wardrobe to build, a ceiling that sags.",
    jobs: ["Door and lock", "Wardrobe", "Ceiling", "Furniture repair"],
    tone: "lilac",
  },
  {
    id: "painting",
    label: "Painting & tiling",
    book: "Book a painter or tiler",
    line: "Fresh walls before the in-laws arrive. Inside, outside and tiled floors.",
    jobs: ["Interior", "Exterior", "Floor tiles", "Screeding"],
    tone: "rose",
  },
];

export const PROOF_FEED = [
  { id: "match", title: "Chinedu accepted", detail: "Plumbing repair · 4.8 rating" },
  { id: "price", title: "₦25,000 agreed", detail: "Held in escrow" },
  { id: "route", title: "On the way", detail: "12 min · Rumuola Road" },
  { id: "gate", title: "Selfie matched at your gate", detail: "It's the face you booked" },
  { id: "code", title: "Code accepted", detail: "Job marked done" },
  { id: "paid", title: "₦25,000 released", detail: "To Chinedu, on the spot" },
] as const;

export const PLACES = [
  { id: "ph", name: "Port Harcourt", state: "Rivers", x: 196, y: 262, areas: ["GRA", "D-Line", "Borokiri", "Trans-Amadi"] },
  { id: "obio", name: "Obio/Akpor", state: "Rivers", x: 214, y: 214, areas: ["Rumuola", "Rumuokoro", "Woji", "Choba"] },
  { id: "eleme", name: "Eleme", state: "Rivers", x: 262, y: 262, areas: ["Onne", "Alesa"] },
  { id: "uyo", name: "Uyo", state: "Akwa Ibom", x: 436, y: 170, areas: ["Ewet Housing", "Shelter Afrique", "Oron Road", "Nwaniba Road"] },
  { id: "eket", name: "Eket", state: "Akwa Ibom", x: 420, y: 286, areas: [] },
  { id: "ikot", name: "Ikot Ekpene", state: "Akwa Ibom", x: 374, y: 132, areas: [] },
] as const;

export const FAQS = [
  {
    id: "price",
    q: "How is the price agreed?",
    a: "You see an itemised estimate before anyone moves: labour, call-out and transport, materials. The artisan can counter on labour only. When you both accept, that's the price, and it doesn't change at the gate.",
  },
  {
    id: "money",
    q: "Where does my money go?",
    a: "Into escrow, not into anyone's pocket. It stays there while the work happens and is released only when you read the artisan your six-digit code.",
  },
  {
    id: "noshow",
    q: "What if they don't show up?",
    a: "You'll see them moving on the map with an honest ETA, so you're never left guessing. And until you give the code, your money stays in escrow.",
  },
  {
    id: "unhappy",
    q: "What if I'm not happy with the work?",
    a: "Don't give the code. Raise it in the app and we step in before any money moves.",
  },
  {
    id: "checks",
    q: "How are artisans checked?",
    a: "NIN matched to a live selfie by Smile ID, a guarantor we call, and real photos of past jobs checked by hand. At your gate, a fresh selfie is matched before you open up.",
  },
  {
    id: "where",
    q: "Where is ajudar available?",
    a: "We're starting in Rivers and Akwa Ibom: Port Harcourt, Obio/Akpor, Eleme, Uyo, Eket and Ikot Ekpene. More states follow.",
  },
  {
    id: "artisan",
    q: "I'm an artisan. How do I get paid?",
    a: "You see the money is in escrow before you set out. When you finish, the customer reads you the code, and escrow releases on the spot. Transfers to your bank follow.",
  },
] as const;
