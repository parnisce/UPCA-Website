// Detail copy for each service page. Prices and inclusions mirror PACKAGES and ADDONS in content.ts.

export type ServiceDetail = {
  slug: string;
  tagline: string;
  lead: string;
  highlights: { title: string; text: string }[];
  includes: string[];
  bestFor: string[];
  from: { label: string; price: string };
  packages: string[];
  metaDescription: string;
  recommended: string;
};

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    slug: "real-estate-photography",
    tagline: "Photos that stop the scroll.",
    lead: "Bright, modern, high-quality photography that makes every listing look its best online and in print. Interior and exterior photos are shot on DSLR, carefully edited and delivered ready for the MLS.",
    highlights: [
      { title: "DSLR quality", text: "Exterior and interior photos shot with professional gear, not a phone." },
      { title: "MLS and print ready", text: "30 to 35 edited photos sized and prepared for the MLS, brochures and social media." },
      { title: "Next day delivery", text: "Your edited gallery arrives the next day so the listing can go live fast." },
    ],
    includes: ["30-35 photos in total", "Exterior photos (DSLR)", "Interior photos (DSLR)", "All high quality edited", "MLS and print ready photos", "Next day delivery", "Marketing graphics: Listing spotlight, Open house promo, Price update, Under contract / pending, Just sold"],
    bestFor: ["New listings", "Open houses", "Price updates and relists", "Agent and brokerage branding"],
    from: { label: "Essentials package", price: "$149" },
    packages: ["Essentials", "Pro Plus", "Pro Max"],
    metaDescription: "Professional real estate photography in Niagara, Hamilton and Burlington. 30-35 edited DSLR photos, MLS ready, next day delivery from $149.",
    recommended: "Essentials",
  },
  {
    slug: "property-video-tours",
    tagline: "Cinematic video that sells the feeling.",
    lead: "Cinematic videos that show a property's true potential. From a full walkthrough to short social reels, we make video that gets buyers to book a showing.",
    highlights: [
      { title: "Cinematic walkthrough", text: "A polished walkthrough that moves through the home the way a buyer would." },
      { title: "Social media reel", text: "A short, punchy cut made for Instagram, Facebook and TikTok." },
      { title: "Vertical video", text: "Vertical content so your listing fills the screen on phones." },
    ],
    includes: ["Cinematic walkthrough video", "Social media reel", "Vertical video content", "Property highlight reel", "Premium editing", "Social media ready content"],
    bestFor: ["Premium listings", "Agents building a video presence", "Listings that need to stand out on social media"],
    from: { label: "Walkthrough video add-on", price: "$129" },
    packages: ["Pro Plus"],
    metaDescription: "Cinematic property video tours, walkthroughs and social reels for real estate agents in Niagara, Hamilton and Burlington.",
    recommended: "Pro Plus",
  },
  {
    slug: "360-virtual-tours",
    tagline: "Let buyers explore anytime, anywhere.",
    lead: "Immersive Matterport 360 tours that let buyers walk through a home on their own schedule. Fewer unnecessary showings, and buyers arrive already interested.",
    highlights: [
      { title: "Matterport 360 tour", text: "A true walk-through experience that works on any phone, tablet or computer." },
      { title: "Interactive floor plan", text: "Buyers understand the layout before they ever visit." },
      { title: "Virtual walkthrough", text: "Share one link in your listing, emails and social posts." },
    ],
    includes: ["Matterport 360 tour", "Interactive floor plan", "Virtual walkthrough", "Matterport 2D floor plan (add-on)"],
    bestFor: ["Out-of-town and relocating buyers", "Larger or more complex homes", "Reducing unqualified showings"],
    from: { label: "360 Matterport virtual tour add-on", price: "$135" },
    packages: ["Pro Max"],
    metaDescription: "Matterport 360 virtual tours and interactive floor plans for real estate listings in Niagara, Hamilton and Burlington.",
    recommended: "Pro Max",
  },
  {
    slug: "drone-photos-and-films",
    tagline: "The whole property, from above.",
    lead: "Stunning aerial photos and video that show the full lot, the neighbourhood and the surroundings. Aerial media tells buyers what ground-level photos cannot.",
    highlights: [
      { title: "Aerial photography", text: "Sharp overhead and angled shots of the home, lot and location." },
      { title: "Aerial video", text: "Smooth drone footage that can be added to any video tour." },
      { title: "Location context", text: "Show nearby water, parks, schools and streets in one frame." },
    ],
    includes: ["Aerial photography", "Aerial video", "Premium editing", "Available as an add-on to any package"],
    bestFor: ["Waterfront and rural properties", "Large lots and acreage", "Showing neighbourhood and location"],
    from: { label: "Aerial photos or video add-on", price: "$39" },
    packages: ["Pro Plus"],
    metaDescription: "Drone photos and aerial video for real estate listings in Niagara, Hamilton and Burlington. Aerial add-ons from $39.",
    recommended: "Pro Plus",
  },
  {
    slug: "agent-websites",
    tagline: "A home on the web for every listing.",
    lead: "Beautiful, modern websites designed for real estate professionals. Give each property its own link or build a landing page that carries your agent branding.",
    highlights: [
      { title: "Property websites", text: "A dedicated page for one listing with all of its photos, video and tours." },
      { title: "Agent branding", text: "Your name, logo and contact details, integrated throughout." },
      { title: "Share anywhere", text: "One clean link for email, social posts and print marketing." },
    ],
    includes: ["Property website", "Website landing page", "Agent branding integration"],
    bestFor: ["Agents who want a branded listing link", "Teams promoting several listings", "Marketing that goes beyond the MLS"],
    from: { label: "Property website add-on", price: "$20" },
    packages: ["Pro Max"],
    metaDescription: "Property websites and agent landing pages for real estate professionals in Niagara, Hamilton and Burlington. From $20.",
    recommended: "Pro Max",
  },
  {
    slug: "full-service-marketing",
    tagline: "One team for the whole campaign.",
    lead: "A complete marketing solution to give your listings maximum exposure. Photos, video, drone, tours, websites and social content, all handled by one team.",
    highlights: [
      { title: "Everything in one place", text: "Photography, video, drone, 360 tours and websites from a single booking." },
      { title: "Social media ready", text: "Graphics and content built to post the day the listing goes live." },
      { title: "Priority service", text: "Priority scheduling, fast turnaround and premium support with Pro Max." },
    ],
    includes: ["Marketing graphics for every listing stage", "Social media ready content", "Property highlight reel", "Priority scheduling", "Fast turnaround", "Premium support", "Custom packages available"],
    bestFor: ["Busy agents and teams", "Brokerages that want consistent media", "High-value or hard-to-sell listings"],
    from: { label: "Pro Max package", price: "$645" },
    packages: ["Essentials", "Pro Plus", "Pro Max"],
    metaDescription: "Full-service real estate marketing and media in Niagara, Hamilton and Burlington. Photos, video, drone, tours and websites from one team.",
    recommended: "Pro Max",
  },
];

export function getServiceDetail(slug: string) {
  return SERVICE_DETAILS.find((s) => s.slug === slug);
}
