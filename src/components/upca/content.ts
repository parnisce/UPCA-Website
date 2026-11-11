// All page copy and data for the sections after the journey. Edit here.

export const BOOK_LABEL = "Book Free Consultation";
// Public origin used for absolute social-card URLs. Update if a custom domain is connected.
export const SITE_ORIGIN = "https://upca-website.pages.dev";
export const THEME_COLOR = "#0a2236";

export type Pkg = {
  id: string;
  name: string;
  band: string;
  price: string;
  cta: string;
  popular?: boolean;
  img: { src: string; alt: string };
  includes?: string;
  groups: { title: string; items: string[] }[];
};

export const PACKAGES: Pkg[] = [
  {
    id: "essentials",
    name: "Essentials",
    band: "Photo package",
    price: "$149",
    cta: "Book Essentials",
    img: { src: "/assets/img/interior.jpg", alt: "Bright open-plan living room photographed for a listing" },
    groups: [
      { title: "Photos", items: ["30-35 in total", "Exterior photos (DSLR)", "Interior photos (DSLR)", "All high quality edited", "MLS and print ready photos", "Next day delivery"] },
      { title: "Marketing graphics", items: ["Listing spotlight", "Open house promo", "Price update", "Under contract / pending", "Just sold"] },
    ],
  },
  {
    id: "pro-plus",
    name: "Pro Plus",
    band: "Photo + video + aerial",
    price: "$399",
    cta: "Book Pro Plus",
    popular: true,
    img: { src: "/assets/img/aerial.jpg", alt: "Drone view of a suburban home with a pool" },
    includes: "Everything in Essentials",
    groups: [
      { title: "Video marketing", items: ["Cinematic walkthrough video", "Social media reel", "Vertical video content"] },
      { title: "Drone media", items: ["Aerial photography", "Aerial video"] },
      { title: "Additional assets", items: ["Premium editing", "Property highlight reel", "Social media ready content"] },
    ],
  },
  {
    id: "pro-max",
    name: "Pro Max",
    band: "All inclusive",
    price: "$645",
    cta: "Book Pro Max",
    img: { src: "/assets/img/laptop.jpg", alt: "Laptop showing a property listing website" },
    includes: "Everything in Essentials",
    groups: [
      { title: "Virtual tours", items: ["Matterport 360 tour", "Interactive floor plan", "Virtual walkthrough"] },
      { title: "Premium marketing suite", items: ["Website landing page", "Agent branding integration"] },
      { title: "Priority service", items: ["Priority scheduling", "Fast turnaround", "Premium support"] },
    ],
  },
];

export const STEPS = [
  { icon: "calendar", title: "Book a Consultation", text: "Tell us about your property and your goals. We recommend the best media package for your needs." },
  { icon: "camera", title: "We Capture", text: "Our team captures photos, video, drone footage and more at your property." },
  { icon: "rocket", title: "You Launch", text: "Receive your edited media quickly and start marketing your listing with confidence." },
];

export const REASONS = [
  { icon: "camera", title: "Professional Quality", text: "High-impact HDR photography and cinematic video tours, made with current technology to show each property at its best." },
  { icon: "laptop", title: "Affordable Packages", text: "Premium marketing should not break the bank. Our packages fit your budget and still deliver professional results." },
  { icon: "tour360", title: "Local Expertise", text: "We know your market and what appeals to local buyers, so your marketing resonates and drives real results." },
  { icon: "rocket", title: "Fast Turnaround", text: "Timing is everything in real estate. Our process gets your materials to you quickly, without cutting quality." },
];

export const CORE_AREAS = ["Niagara Falls", "Niagara on the Lake", "St. Catharines", "Welland", "Thorold", "Pelham", "Grimsby", "Lincoln", "Fort Erie", "Port Colborne", "Wainfleet"];
export const CALL_FIRST_AREAS = ["Hamilton", "Burlington", "Haldimand"];
export const AREAS = [...CORE_AREAS, ...CALL_FIRST_AREAS];

export const CONTACT = {
  phone: "+1 (289) 366-9999",
  phoneHref: "tel:+12893669999",
  email: "support@upca.ca",
  emailHref: "mailto:support@upca.ca",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/upcaofficial" },
    { label: "Instagram", href: "https://www.instagram.com/upcaofficial/" },
    { label: "YouTube", href: "https://www.youtube.com/@UPCACorp" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/upca-real-estate-media-company/" },
  ],
};

export const ADDONS = [
  { name: "Property website", price: "$20" },
  { name: "Aerial photos", price: "$39" },
  { name: "Aerial video", price: "$39" },
  { name: "Matterport 2D floor plan", price: "$49" },
  { name: "Walkthrough video", price: "$129" },
  { name: "360 Matterport virtual tour", price: "$135" },
  { name: "Cinematic video", price: "$179" },
];

export const NAV_LINKS = [
  { href: "#packages", label: "Packages" },
  { href: "#process", label: "Process" },
  { href: "#areas", label: "Areas" },
];

export const FOOTER_SERVICES = ["Real Estate Photography", "Property Video Tours", "360 Virtual Tours", "Drone Photo and Video", "Agent Websites", "Full-Service Marketing"];
