export interface IndustryTemplate {
  services: string[];
  qualificationQuestions: string[];
  description: string;
  emergencyScenarios: string[];
  schedulingDefaults: {
    appointmentTypes: string[];
    defaultDuration: string;
    bufferTime: string;
    bookingNotes: string;
  };
  knowledgeBase: {
    faqs: string;
    serviceNotes: string;
    pricingGuidance: string;
    policies: string;
  };
  scoringNotes: string;
  behaviorDefaults: {
    prioritizeUrgent: boolean;
    encourageSameDay: boolean;
    escalateAfterHoursEmergency: boolean;
    captureEquipmentDetails: boolean;
    routeMaintenanceSeparately: boolean;
  };
}

export const industryDefaults: Record<string, IndustryTemplate> = {
  hvac: {
    services: [
      "AC Repair",
      "AC Installation",
      "Furnace Repair",
      "Furnace Installation",
      "Heat Pump Service",
      "Tune-Up & Maintenance",
      "Emergency HVAC Service",
      "Thermostat Issue",
      "Indoor Air Quality",
      "Ductwork Inspection",
    ],
    qualificationQuestions: [
      "Is this for heating or cooling?",
      "Is the issue urgent — for example, no heat or no cooling?",
      "Is the system not turning on, blowing warm air, leaking, making noise, or short cycling?",
      "Is this a repair, maintenance visit, or replacement?",
      "Are you an existing customer?",
      "What is the property address?",
      "When do you need service — today, this week, or are you planning ahead?",
      "Will someone be home for the appointment?",
    ],
    description:
      "We provide residential and commercial HVAC repair, installation, and maintenance services including AC, furnace, heat pump, and indoor air quality solutions.",
    emergencyScenarios: [
      "No heat in winter",
      "No cooling in summer",
      "Gas smell near furnace",
      "Carbon monoxide alarm triggered",
      "System making loud banging or grinding noises",
      "Water leaking from unit",
      "Electrical burning smell from HVAC unit",
    ],
    schedulingDefaults: {
      appointmentTypes: ["Diagnostic / Service Call", "Tune-Up", "Free Estimate", "Emergency Visit"],
      defaultDuration: "60",
      bufferTime: "30",
      bookingNotes:
        "Emergency visits are 2-hour windows. Commercial jobs may require a longer appointment block.",
    },
    knowledgeBase: {
      faqs: `Q: Do you offer free estimates?
A: Yes, we provide free on-site estimates for system replacements and new installations.

Q: What areas do you serve?
A: We serve the greater metro area. Ask for specifics if you're outside city limits.

Q: Do you work on all brands?
A: We service all major brands including Carrier, Trane, Lennox, Rheem, and Goodman.

Q: How quickly can you come out?
A: For emergencies like no heat or no cooling, we offer same-day or next-day service. Routine calls are usually within 1–3 business days.

Q: Do you offer financing?
A: Yes, we offer financing options for qualifying installations and replacements. Ask about current promotions.

Q: What does a tune-up include?
A: Our maintenance tune-up includes a full system inspection, filter replacement, coil cleaning, refrigerant check, and safety test.`,
      serviceNotes:
        "We specialize in residential and light commercial HVAC systems. Minimum service call fee applies. We carry common parts on our trucks for faster repairs.",
      pricingGuidance:
        "Diagnostic fee: $89–$129. Tune-up: $99–$149. We don't quote full replacements over the phone — a technician visit is required for accurate pricing.",
      policies:
        "A credit card on file is required for after-hours emergency visits. Cancellations need 4 hours notice. Commercial jobs require approval from the operations manager.",
    },
    scoringNotes:
      "Emergency and no-heat/no-cooling issues score highest. Same-day requests score higher. Install or replacement inquiries score high. Maintenance and tune-ups score moderate. Unclear or low-intent inquiries score lower.",
    behaviorDefaults: {
      prioritizeUrgent: true,
      encourageSameDay: true,
      escalateAfterHoursEmergency: true,
      captureEquipmentDetails: true,
      routeMaintenanceSeparately: true,
    },
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
    emergencyScenarios: ["Burst pipe", "Sewer backup", "No hot water", "Active flooding"],
    schedulingDefaults: {
      appointmentTypes: ["Service Call", "Free Estimate", "Emergency Visit"],
      defaultDuration: "60",
      bufferTime: "15",
      bookingNotes: "",
    },
    knowledgeBase: { faqs: "", serviceNotes: "", pricingGuidance: "", policies: "" },
    scoringNotes: "",
    behaviorDefaults: {
      prioritizeUrgent: true,
      encourageSameDay: true,
      escalateAfterHoursEmergency: true,
      captureEquipmentDetails: false,
      routeMaintenanceSeparately: false,
    },
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
    emergencyScenarios: ["Active roof leak", "Storm damage with exposed decking", "Tree fell on roof"],
    schedulingDefaults: {
      appointmentTypes: ["Inspection", "Free Estimate", "Emergency Tarping"],
      defaultDuration: "60",
      bufferTime: "15",
      bookingNotes: "",
    },
    knowledgeBase: { faqs: "", serviceNotes: "", pricingGuidance: "", policies: "" },
    scoringNotes: "",
    behaviorDefaults: {
      prioritizeUrgent: true,
      encourageSameDay: false,
      escalateAfterHoursEmergency: true,
      captureEquipmentDetails: false,
      routeMaintenanceSeparately: false,
    },
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
    emergencyScenarios: [],
    schedulingDefaults: {
      appointmentTypes: ["Consultation", "Site Survey", "Maintenance Visit"],
      defaultDuration: "90",
      bufferTime: "15",
      bookingNotes: "",
    },
    knowledgeBase: { faqs: "", serviceNotes: "", pricingGuidance: "", policies: "" },
    scoringNotes: "",
    behaviorDefaults: {
      prioritizeUrgent: false,
      encourageSameDay: false,
      escalateAfterHoursEmergency: false,
      captureEquipmentDetails: false,
      routeMaintenanceSeparately: false,
    },
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
    emergencyScenarios: [],
    schedulingDefaults: {
      appointmentTypes: ["Onboarding Call", "Demo"],
      defaultDuration: "60",
      bufferTime: "15",
      bookingNotes: "",
    },
    knowledgeBase: { faqs: "", serviceNotes: "", pricingGuidance: "", policies: "" },
    scoringNotes: "",
    behaviorDefaults: {
      prioritizeUrgent: false,
      encourageSameDay: false,
      escalateAfterHoursEmergency: false,
      captureEquipmentDetails: false,
      routeMaintenanceSeparately: false,
    },
  },
  other: {
    services: [],
    qualificationQuestions: [],
    description: "",
    emergencyScenarios: [],
    schedulingDefaults: {
      appointmentTypes: ["Service Call"],
      defaultDuration: "60",
      bufferTime: "15",
      bookingNotes: "",
    },
    knowledgeBase: { faqs: "", serviceNotes: "", pricingGuidance: "", policies: "" },
    scoringNotes: "",
    behaviorDefaults: {
      prioritizeUrgent: false,
      encourageSameDay: false,
      escalateAfterHoursEmergency: false,
      captureEquipmentDetails: false,
      routeMaintenanceSeparately: false,
    },
  },
};
