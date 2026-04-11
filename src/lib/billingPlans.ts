export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  maxLocations: number;
  maxMinutes: number;
  features: string[];
  isSelfServe: boolean;
  highlight?: boolean;
}

export const BILLING_PLANS: Record<string, BillingPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 497,
    priceLabel: "$497/mo",
    maxLocations: 1,
    maxMinutes: 500,
    features: [
      "1 location",
      "500 AI call minutes/mo",
      "Lead qualification & scoring",
      "Hot-lead SMS alerts",
      "24/7 AI receptionist",
    ],
    isSelfServe: true,
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 997,
    priceLabel: "$997/mo",
    maxLocations: 3,
    maxMinutes: 2000,
    features: [
      "Up to 3 locations",
      "2,000 AI call minutes/mo",
      "Everything in Starter",
      "Appointment scheduling",
      "Priority support",
    ],
    isSelfServe: true,
    highlight: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 0,
    priceLabel: "Custom",
    maxLocations: 999,
    maxMinutes: 99999,
    features: [
      "Unlimited locations",
      "Custom minute volume",
      "White-label branding",
      "Dedicated account manager",
      "Custom integrations",
    ],
    isSelfServe: false,
  },
};

export function getPlan(planId: string): BillingPlan {
  return BILLING_PLANS[planId] || BILLING_PLANS.starter;
}
