import type {
  Estimate,
  EstimateLineItem,
  JobRequest,
  Kobo,
  Negotiation,
} from "@/lib/types";

function lineItem(
  id: string,
  kind: EstimateLineItem["kind"],
  label: string,
  amount: Kobo,
  negotiable = true,
  note?: string,
): EstimateLineItem {
  return { id, kind, label, amount, negotiable, note };
}

const plumbingEstimate: Estimate = {
  id: "est_001",
  jobId: "job_001",
  lineItems: [
    lineItem("li_001", "labour", "Replace faulty pipe section", 1800000),
    lineItem("li_002", "transport", "Opebi to Ogba, 7 km", 600000, false),
    lineItem("li_003", "materials", "Pipe, fittings, sealant", 800000, false),
  ],
  subtotal: 3200000,
  total: 3200000,
  negotiableBand: { min: 2560000, max: 3840000 },
  createdAt: "2026-10-25T18:02:00.000Z",
  expiresAt: "2026-10-25T20:02:00.000Z",
};

const plumbingNegotiation: Negotiation = {
  id: "neg_001",
  jobId: "job_001",
  artisanId: "art_chinedu_okafor",
  maxRounds: 3,
  expiresAt: "2026-10-25T20:02:00.000Z",
  status: "agreed",
  agreedTotal: 3200000,
  agreedAt: "2026-10-25T18:08:00.000Z",
  rounds: [
    {
      index: 0,
      actor: "system",
      total: 2800000,
      lineItems: [
        lineItem("li_001a", "labour", "Pipe repair", 1400000),
        lineItem("li_002a", "transport", "Call-out and transport", 600000, false),
        lineItem("li_003a", "materials", "Washer and sealant", 800000, false),
      ],
      reason: "System estimate for a standard pipe repair.",
      createdAt: "2026-10-25T18:00:00.000Z",
      accepted: false,
    },
    {
      index: 1,
      actor: "artisan",
      total: 3200000,
      lineItems: [
        lineItem("li_001b", "labour", "Replace pipe section", 1800000),
        lineItem("li_002b", "transport", "Call-out and transport", 600000, false),
        lineItem("li_003b", "materials", "Pipe, fittings, sealant", 800000, false),
      ],
      reason: "Pipe needs replacing, not just the washer.",
      createdAt: "2026-10-25T18:04:00.000Z",
      accepted: false,
    },
    {
      index: 2,
      actor: "customer",
      total: 3200000,
      lineItems: [
        lineItem("li_001c", "labour", "Replace pipe section", 1800000),
        lineItem("li_002c", "transport", "Call-out and transport", 600000, false),
        lineItem("li_003c", "materials", "Pipe, fittings, sealant", 800000, false),
      ],
      reason: "Understood — replace the pipe.",
      createdAt: "2026-10-25T18:08:00.000Z",
      accepted: true,
    },
  ],
};

const acEstimate: Estimate = {
  id: "est_002",
  jobId: "job_002",
  lineItems: [
    lineItem("li_010", "labour", "Standard AC servicing", 700000, false),
    lineItem("li_011", "transport", "Transport within Umuahia South", 150000, false),
  ],
  subtotal: 850000,
  total: 850000,
  negotiableBand: { min: 850000, max: 850000 },
  createdAt: "2026-10-24T08:30:00.000Z",
  expiresAt: "2026-10-24T10:30:00.000Z",
};

/**
 * Seed jobs for mock mode. Money is integer kobo throughout.
 * These cover the three states the early screens need:
 * searching, en_route (travel mode), and complete.
 */
export const jobs: JobRequest[] = [
  {
    id: "job_001",
    customerId: "cust_adaeze",
    categoryId: "cat_plumbing_repair",
    title: "Burst pipe under the kitchen sink",
    description:
      "Water is pooling under the kitchen sink. I have closed the main valve. The pipe joint looks split.",
    attachments: [],
    site: {
      lat: 6.6018,
      lng: 3.3491,
      lgaCode: "NG-LA-IKEJA",
      landmark: "Blue building opposite First Bank, Opebi",
      pinConfirmedByUser: true,
      accuracyM: 12,
      savedLabel: "home",
      plusCode: "6FR8+QJ Lagos",
    },
    timing: { mode: "now" },
    urgency: "standard",
    phase: "en_route",
    artisanId: "art_chinedu_okafor",
    estimate: plumbingEstimate,
    negotiation: plumbingNegotiation,
    agreedTotal: 3200000,
    escrowFunded: true,
    completionCode: "482913",
    createdAt: "2026-10-25T17:58:00.000Z",
    updatedAt: "2026-10-25T18:12:00.000Z",
    startedAt: "2026-10-25T18:10:00.000Z",
  },
  {
    id: "job_002",
    customerId: "cust_adaeze",
    categoryId: "cat_ac_servicing",
    title: "Service bedroom AC",
    description:
      "The bedroom AC is cooling weakly and rattling. Standard servicing requested.",
    attachments: [],
    site: {
      lat: 5.4721,
      lng: 7.4702,
      lgaCode: "NG-AB-UMUAHIA-SOUTH",
      landmark: "Yellow duplex after Ubakala junction, beside the school",
      pinConfirmedByUser: true,
      accuracyM: 18,
      savedLabel: "other",
    },
    timing: { mode: "now" },
    urgency: "standard",
    phase: "complete",
    artisanId: "art_adaobi_nkem",
    estimate: acEstimate,
    agreedTotal: 850000,
    escrowFunded: true,
    completionCode: "771204",
    createdAt: "2026-10-24T08:20:00.000Z",
    updatedAt: "2026-10-24T11:05:00.000Z",
    startedAt: "2026-10-24T09:05:00.000Z",
    completedAt: "2026-10-24T11:00:00.000Z",
  },
  {
    id: "job_003",
    customerId: "cust_adaeze",
    categoryId: "cat_electrical_repair",
    title: "Two sockets sparking in the sitting room",
    description:
      "Two wall sockets spark when I plug in the TV. I have stopped using them. Please check the wiring.",
    attachments: [],
    site: {
      lat: 6.4473,
      lng: 3.4748,
      lgaCode: "NG-LA-ETI-OSA",
      landmark: "White estate gate opposite Ebeano, Lekki Phase 1",
      pinConfirmedByUser: false,
      accuracyM: 35,
      savedLabel: "home",
    },
    timing: { mode: "now" },
    urgency: "emergency",
    phase: "searching",
    escrowFunded: false,
    createdAt: "2026-10-25T18:35:00.000Z",
    updatedAt: "2026-10-25T18:35:00.000Z",
  },
];

export function getMockJobById(id: string): JobRequest | undefined {
  return jobs.find((job) => job.id === id);
}
