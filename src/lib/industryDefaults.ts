export const industryDefaults: Record<string, {
  services: string[];
  qualificationQuestions: string[];
  description: string;
}> = {
  hvac: {
    services: ["AC Repair", "Furnace Repair", "HVAC Installation", "Duct Cleaning", "Maintenance Plans", "Emergency Service"],
    qualificationQuestions: [
      "What type of system do you have (central AC, mini-split, heat pump)?",
      "Is the unit heating, cooling, or both?",
      "How old is the system?",
      "Are you the homeowner or a tenant?",
      "Is this an emergency or can it wait a few days?",
    ],
    description: "We provide residential and commercial HVAC repair, installation, and maintenance services.",
  },
  plumbing: {
    services: ["Drain Cleaning", "Leak Repair", "Water Heater", "Pipe Replacement", "Sewer Line", "Emergency Service"],
    qualificationQuestions: [
      "Where is the issue located (kitchen, bathroom, basement)?",
      "Is there active water damage or flooding?",
      "Are you the homeowner?",
      "How long has this been going on?",
      "Is this an emergency?",
    ],
    description: "We handle residential and commercial plumbing repairs, installations, and emergency services.",
  },
  roofing: {
    services: ["Roof Repair", "Roof Replacement", "Inspections", "Storm Damage", "Gutter Service", "Emergency Tarping"],
    qualificationQuestions: [
      "What type of roof do you have (shingle, tile, metal, flat)?",
      "Is there an active leak?",
      "Was there recent storm damage?",
      "Are you the property owner?",
      "Do you have an insurance claim?",
    ],
    description: "We provide roof repair, replacement, inspections, and storm damage restoration.",
  },
  solar: {
    services: ["Solar Panel Installation", "System Design", "Battery Storage", "Panel Cleaning", "System Monitoring", "Maintenance"],
    qualificationQuestions: [
      "Do you own your home?",
      "What is your average monthly electric bill?",
      "What type of roof do you have?",
      "Are you interested in battery storage?",
      "Have you received other solar quotes?",
    ],
    description: "We design and install residential and commercial solar energy systems with battery storage options.",
  },
  agency: {
    services: ["AI Receptionist Setup", "Lead Management", "Multi-Client Support", "White-Label Branding", "Reporting", "Integration Support"],
    qualificationQuestions: [
      "How many clients do you manage?",
      "What industries do your clients serve?",
      "Do you need white-label branding?",
      "What is your current call handling process?",
      "Do you need multi-location support?",
    ],
    description: "We manage AI receptionist services for multiple home-service clients.",
  },
  other: {
    services: [],
    qualificationQuestions: [],
    description: "",
  },
};
