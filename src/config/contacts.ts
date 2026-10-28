export const emergencyGuidance =
  "Contact security personnel near you or call the QRS. You can also visit the QRS at the Senate Building, OAU.";

type Contact = {
  name: string;
  location: string;
  phone: string | null;
  otherPhones?: string[];
  description: string;
  source?: { title: string; url: string; checkedOn: string };
};

export const contacts: Contact[] = [
  {
    name: "Quick Response Squad (QRS)",
    location: "Senate Building, OAU; security personnel across campus",
    phone: "09034592436",
    otherPhones: ["09070367707", "09070367711"],
    description:
      "For urgent campus security assistance. You can also approach security personnel in your building or the nearest campus security post.",
    source: {
      title: "OAU Security Unit · published emergency lines",
      url: "https://security.oauife.edu.ng/security-tips/",
      checkedOn: "28 October 2026",
    },
  },
  {
    name: "National emergency line",
    location: "Nigeria",
    phone: "112",
    description:
      "National emergency number for police, fire and medical emergencies. For campus assistance, you can also call QRS or approach nearby security personnel.",
    source: {
      title: "Nigerian Communications Commission · emergency service charter",
      url: "https://www.ncc.gov.ng/about/servicom-charter/departmental-charters/special-duties-department-service-charter",
      checkedOn: "28 October 2026",
    },
  },
  {
    name: "Student Union Security Committee",
    location: "Student Union office, OAU",
    phone: null,
    description:
      "For student disputes, civil matters, and advice on reporting. Confirm office arrangements before visiting. For immediate danger, contact QRS or security personnel near you.",
  },
];
