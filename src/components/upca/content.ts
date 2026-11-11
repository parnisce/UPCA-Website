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
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About Us" },
  { href: "#why", label: "Why Us" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact Us" },
];

export const FOOTER_SERVICES = ["Real Estate Photography", "Property Video Tours", "360 Virtual Tours", "Drone Photo and Video", "Agent Websites", "Full-Service Marketing"];

export const SERVICES = [
  { title: "Real Estate Photography", img: "/assets/img/interior.jpg", text: "Bright, modern, high-quality photos that make your listings stand out." },
  { title: "Property Video Tours", img: "/assets/world/scene-04-poster.jpg", text: "Cinematic videos that showcase the property's true potential." },
  { title: "360 Virtual Tours", img: "/assets/world/scene-06-poster.jpg", text: "Immersive tours that let buyers explore anytime, anywhere." },
  { title: "Drone Photos and Films", img: "/assets/img/aerial.jpg", text: "Stunning aerial visuals that highlight the entire property and location." },
  { title: "Agent Websites", img: "/assets/img/laptop.jpg", text: "Beautiful, modern websites designed for real estate professionals." },
  { title: "Full-Service Marketing", img: "/assets/world/scene-02-poster.jpg", text: "A complete marketing solution to get your listings maximum exposure." },
];

export const ABOUT = {
  title: "One team for every listing.",
  paragraphs: [
    "UPCA is a real estate marketing and media team serving agents, teams and brokerages across Niagara, Hamilton and Burlington.",
    "We cover photography, video tours, 360 virtual tours, drone photo and video, agent websites, and social media and marketing campaigns, so one team can handle the media for every listing.",
  ],
  facts: [
    { value: "6", label: "services under one roof" },
    { value: "$149", label: "packages start here" },
    { value: "11", label: "core communities served" },
  ],
};

// Sample reviews for layout only. Replace with real, approved client reviews.
export const TESTIMONIALS = [
  { name: "Sample Client A", role: "Realtor, Niagara Falls", text: "The photos made our listing look like a magazine spread. We had showings booked within a day of it going live." },
  { name: "Sample Client B", role: "Broker, Hamilton", text: "Drone footage and the video tour set our listing apart. Fast delivery, easy to work with, and the quality is consistently great." },
  { name: "Sample Client C", role: "Realtor, Burlington", text: "From booking to delivery the process was simple. The team showed up on time and handled everything, including the property website." },
  { name: "Sample Client D", role: "Team Lead, St. Catharines", text: "Our whole team uses UPCA now. The 360 tours save us so many unnecessary showings and buyers arrive already sold on the home." },
  { name: "Sample Client E", role: "Realtor, Grimsby", text: "Turnaround is incredibly quick. I get edited photos the next morning, which keeps my listings ahead of the competition." },
  { name: "Sample Client F", role: "Agent, Welland", text: "The social media creatives were a bonus I did not expect. One shoot gave me content for the whole campaign." },
];

export const FAQS = [
  { q: "Which areas do you serve?", a: "We cover Niagara Falls, Niagara on the Lake, St. Catharines, Welland, Thorold, Pelham, Grimsby, Lincoln, Fort Erie, Port Colborne and Wainfleet. For Hamilton, Burlington and Haldimand, call us first. Nearby regions may be available on request." },
  { q: "How much does it cost?", a: "Packages start at $149 for Essentials, $399 for Pro Plus and $645 for Pro Max. You can also add single services, such as aerial photos for $39 or a 360 Matterport virtual tour for $135. Custom packages are available." },
  { q: "How fast will I get my media?", a: "Essentials includes next day delivery. Pro Max adds priority scheduling and fast turnaround." },
  { q: "What is included in the Essentials package?", a: "30 to 35 high quality edited photos, interior and exterior, ready for the MLS and print, plus marketing graphics such as Listing Spotlight, Open House Promo, Price Update, Under Contract and Just Sold." },
  { q: "Do you offer drone and 360 tours?", a: "Yes. Aerial photos and aerial video are in Pro Plus, and Matterport 360 tours with an interactive floor plan are in Pro Max. Both are also available as add-ons." },
  { q: "How do I book?", a: "Book a free 15-minute consultation with the form below or call us. Tell us about the property and we will recommend the package that fits. No obligation." },
];
