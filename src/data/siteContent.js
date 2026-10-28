// Central content + asset config. Replace placeholders here; components read from this file only.

const u = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&w=${w}`

const V = (f) => `https://upca.ca/wp-content/uploads/2025/10/${f}`

// Drop the supplied logo at /public/logo.png (or change this path). Until then a text wordmark is shown.
export const LOGO_SRC = '/logo.png'

export const CONTACT = {
  // PLACEHOLDERS: no verified contact info was supplied. Fill these in; empty values are hidden.
  email: '',
  phone: '',
  // Where every "Book a Free Consultation" button goes (e.g. a Calendly URL or mailto:). Defaults to the footer.
  consultationHref: '#contact',
  social: { instagram: '', facebook: '', youtube: '' },
}

export const NAV = [
  { label: 'Services', href: '#services' },
  { label: 'Our Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Areas We Serve', href: '#areas' },
  { label: 'Contact', href: '#contact' },
]

export const IMG = {
  hero: '/hero.jpg',
  showcase: u('1600047509807-ba8f99d2cdde', 1600),
  areas: u('1489447068241-b3490214e879', 1800),
  cta: u('1600573472592-401b489a3cdc', 2000),
  testimonials: [],
}

export const HERO_CARDS = [
  { title: 'Professional Photography', icon: 'camera', img: u('1600607687939-ce8a6c25118c', 500) },
  { title: 'Drone Photos & Films', icon: 'drone', img: u('1448630360428-65456885c650', 500) },
  { title: 'Cinematic Video Tours', icon: 'video', img: u('1502672260266-1c1ef2d93688', 500) },
]

export const TRUST = [
  { icon: 'camera', title: 'Stunning Visuals', sub: 'Sell Faster' },
  { icon: 'chart', title: 'Modern Marketing', sub: 'Reach More Buyers' },
  { icon: 'users', title: 'Trusted by', sub: 'Agents Across Niagara' },
]

export const PROPERTIES = [
  { title: 'Modern Family Home', location: 'Niagara', img: u('1600596542815-ffad4c1539a9', 1000) },
  { title: 'Waterfront Property', location: 'Burlington', img: u('1600585154340-be6161a56a0c', 1000) },
  { title: 'Custom Build', location: 'Hamilton', img: u('1564013799919-ab600027ffc6', 1000) },
]

export const SERVICES = [
  { icon: 'camera', title: 'Real Estate Photography', text: 'Bright, modern, high-quality photos that make your listings stand out.', img: u('1600607687939-ce8a6c25118c', 600), video: V('Real-Estate-Photography-DONE-2.mp4') },
  { icon: 'play', title: 'Property Video Tours', text: "Cinematic videos that showcase the property's true potential.", img: u('1502672260266-1c1ef2d93688', 600), video: V('Property-Video-Tours.mp4') },
  { icon: 'orbit', title: '360 Virtual Tours', text: 'Immersive tours that let buyers explore anytime, anywhere.', img: u('1493809842364-78817add7ffb', 600), video: V('360-Virtual-Tours.mp4') },
  { icon: 'drone', title: 'Drone Photos & Films', text: 'Stunning aerial visuals that highlight the entire property and location.', img: u('1448630360428-65456885c650', 600), video: V('Drone-Photos-Films.mp4') },
  { icon: 'monitor', title: 'Agent Websites', text: 'Beautiful, modern websites designed for real estate professionals.', img: u('1560448204-e02f11c3d0e2', 600), video: V('Property-Microsites-Agent-Websites-DONE.mp4') },
  { icon: 'megaphone', title: 'Full-Service Marketing', text: 'A complete marketing solution to get your listings maximum exposure.', img: u('1600566753190-17f0baa2a6c3', 600), video: V('1010.mp4') },
]

export const SHOWCASE_LIST = ['Photos', 'Videos', 'Drone', 'Virtual Tours']

export const PROCESS = [
  { icon: 'calendar', title: 'Book a Consultation', text: "Tell us about your property and your goals. We'll recommend the best media package for your needs." },
  { icon: 'camera', title: 'We Capture', text: 'Our professional team captures stunning photos, videos, drone footage and more at your property.' },
  { icon: 'rocket', title: 'You Launch', text: 'Receive your edited media quickly and start marketing your listing with confidence.' },
]

export const PACKAGES = [
  {
    name: 'Essentials', icon: 'camera', tag: 'Perfect for standard residential listing', band: 'Photo Package', price: '$149', cta: 'Book Essentials',
    groups: [
      { icon: 'image', title: 'Photos', items: ['30-35 in Total', 'Exterior Photos (DSLR)', 'Interior Photos (DSLR)', 'ALL High Quality Edited', 'MLS & Print Ready Photos', 'Next Day Delivery'] },
      { icon: 'megaphone', title: 'Marketing Graphics', items: ['Listing Spotlight', 'Open House Promo', 'Price Update', 'Under Contract / Pending', 'Just Sold'] },
    ],
  },
  {
    name: 'Pro Plus', icon: 'clapper', tag: 'The complete marketing package for serious listings', band: 'Photo + Video + Aerial', price: '$399', cta: 'Book Pro Plus', popular: true, includes: 'Everything in Essentials',
    groups: [
      { icon: 'video', title: 'Video Marketing', items: ['Cinematic Walkthrough Video', 'Social Media Reel', 'Vertical Video Content'] },
      { icon: 'drone', title: 'Drone Media', items: ['Aerial Photography', 'Aerial Video'] },
      { icon: 'megaphone', title: 'Additional Assets', items: ['Premium Editing', 'Property Highlight Reel', 'Social Media Ready Content'] },
    ],
  },
  {
    name: 'Pro Max', icon: 'crown', tag: 'The full marketing system for premium properties', band: 'All Inclusive', price: '$645', cta: 'Book Pro Max', includes: 'Everything in Essentials',
    groups: [
      { icon: 'orbit', title: 'Virtual Tours', items: ['Matterport 360 Tour', 'Interactive Floor Plan', 'Virtual Walkthrough'] },
      { icon: 'monitorplay', title: 'Premium Marketing Suite', items: ['Website Landing Page', 'Agent Branding Integration'] },
      { icon: 'megaphone', title: 'Priority Service', items: ['Priority Scheduling', 'Fast Turnaround', 'Premium Support'] },
    ],
  },
]

// SAMPLE testimonials: invented placeholder names and text for layout only. Replace with real, approved client reviews.
export const TESTIMONIALS = [
  { name: 'Sample Client A', role: 'Realtor, Niagara Falls', text: 'The photos made our listing look like a magazine spread. We had showings booked within a day of it going live.' },
  { name: 'Sample Client B', role: 'Broker, Hamilton', text: 'Drone footage and the video tour set our listing apart. Fast delivery, easy to work with, and the quality is consistently great.' },
  { name: 'Sample Client C', role: 'Realtor, Burlington', text: 'From booking to delivery the process was simple. The team showed up on time and handled everything, including the property website.' },
  { name: 'Sample Client D', role: 'Team Lead, St. Catharines', text: 'Our whole team uses UPCA now. The 360 tours save us so many unnecessary showings and buyers arrive already sold on the home.' },
  { name: 'Sample Client E', role: 'Realtor, Grimsby', text: 'Turnaround is incredibly quick. I get edited photos the next morning, which keeps my listings ahead of the competition.' },
  { name: 'Sample Client F', role: 'Agent, Welland', text: 'The social media creatives were a bonus I did not expect. One shoot gave me content for the whole campaign.' },
  { name: 'Sample Client G', role: 'Realtor, Lincoln', text: 'Professional, reliable and detail oriented. They understand how to present a property and make buyers stop scrolling.' },
  { name: 'Sample Client H', role: 'Broker Owner, Oakville', text: 'Pricing is fair, the packages are clear, and the results speak for themselves. I recommend UPCA to every agent I know.' },
  { name: 'Sample Client I', role: 'Realtor, Fort Erie', text: 'The agent website they built looks polished and loads fast. Clients tell me it is the nicest listing page they have seen.' },
  { name: 'Sample Client J', role: 'Agent, Stoney Creek', text: 'They listened to what I needed for a luxury listing and delivered a full media package that exceeded expectations.' },
]

export const AREAS = ['Niagara Region', 'Grimsby', 'Hamilton', 'Lincoln', 'Burlington', 'Welland', 'St. Catharines', 'and nearby communities']
export const AREA_PINS = [
  { name: 'Hamilton', style: { left: '38%', top: '13%' } },
  { name: 'Burlington', style: { left: '68%', top: '15%' } },
  { name: 'Niagara Falls', style: { left: '40%', top: '39%' } },
]

export const FOOTER_SERVICES = ['Real Estate Photography', 'Property Video Tours', '360 Virtual Tours', 'Drone Photos & Films', 'Agent Websites', 'Full-Service Marketing']

// Cinematic scroll journey. Each scene has a PNG (original) with a lighter WebP twin of the same name.
const scene = (n, file) => `/images/scene-0${n}-${file}`
export const SCENES = [
  { id: 'house', kicker: 'The House', file: scene(1, 'house'), alt: 'Residential brick home on a sunny street', title: 'Every Great Listing Starts With a First Impression', text: 'Make your property stand out with professional real estate marketing and media.' },
  { id: 'photography', kicker: 'Photography', file: scene(2, 'photography'), alt: 'Photographer capturing the front of the home with a camera on a tripod', title: 'Capture Every Detail', text: 'Professional real estate photography showcases the details that help buyers connect with a property.' },
  { id: 'drone', kicker: 'Drone', file: scene(3, 'drone'), alt: 'Drone capturing an aerial view of the property', title: 'See the Bigger Picture', text: 'Showcase the property, outdoor spaces, and surrounding neighborhood with professional drone photography and films.' },
  { id: 'matterport', kicker: 'Virtual Tours', file: scene(4, 'matterport'), alt: 'Home interior shown in a Matterport 3D virtual tour interface', title: 'Step Inside From Anywhere', text: 'Give buyers an immersive way to explore the property with Matterport 3D virtual tours.' },
  { id: 'website', kicker: 'Websites', file: scene(5, 'website'), alt: 'Laptop displaying a real estate listing website for the property', title: 'Turn Your Listing Into a Digital Experience', text: 'Present your property through polished real estate websites and dedicated property microsites.' },
  { id: 'social', kicker: 'Social Media', file: scene(6, 'social'), alt: 'Property marketing campaign shown across multiple social media platforms', title: 'Turn Attention Into Opportunity', text: 'Transform your property media into engaging social media creatives and marketing content.' },
].map((s) => ({ ...s, png: `${s.file}.png`, webp: `${s.file}.webp` }))

// "Marketing That Makes Your Listing Stand Out" section
export const FEATURES_INTRO = 'We combine creativity, technology and local marketing expertise to deliver results that help you sell faster and for more.'
export const FEATURES = [
  { icon: 'quality', title: 'Professional Quality', text: 'We deliver high-impact, visually stunning content—from HDR photography to cinematic video tours—crafted using the latest technology to showcase your properties at their absolute best.' },
  { icon: 'packages', title: 'Affordable Packages', text: "Premium marketing shouldn't break the bank. Our cost-effective packages are designed to fit your budget while delivering professional results that make your listings shine." },
  { icon: 'local', title: 'Local Expertise', text: 'We understand your market. Our team knows what appeals to local buyers, ensuring your marketing resonates and drives real results.' },
  { icon: 'fast', title: 'Fast Turnaround', text: 'In real estate, timing is everything. Our streamlined process ensures you get your marketing materials quickly without sacrificing quality—helping you stay ahead of the competition.' },
]
