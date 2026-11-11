# UPCA Real Estate Marketing & Media: design brief

Animation mode: animated-website

Design read: Realtors and homeowners in Niagara, Hamilton and Burlington who want listings that look expensive. Register: confident, clean, cinematic, trustworthy. The brand colors are user-given and locked (#103E61 and #F2B620).

Concept spine: journey / waypoints. One property, one continuous camera move, six services as waypoints along it. A thin gold route line and square waypoint markers recur on every section.

Delivery tier: cinema (Lenis smooth scroll bridged to GSAP, scroll-scrub film as the Tier-1 hero mechanic, motion pass kept to transform only).

Journey shape: single-shot. ONE continuous ~15s film generated in one call, then sliced into six consecutive chapter clips with an exact shared boundary frame (continuous take, no seams). Justification: one subject (a house) seen ever more closely and then from above.
Journey (chapters, one clip slice each):
1. Photography: "Make every listing impossible to ignore." (also the hero) focal point: lit entrance, macro.
2. Property Video Tours: "Walk them through the front door." focal: facade, pulling back.
3. 360 Virtual Tours: "Open house, any hour." focal: arc around the house.
4. Drone Photo and Video: "See the lot, the street, the view." focal: rising above the roof.
5. Agent Websites: "A page for every listing." focal: high aerial of the property.
6. Full-Service Marketing: "One team. Every channel." focal: wide aerial, final beauty state.
World grammar: modern two-storey glass-and-timber house at blue hour, warm gold interior light (#F2B620), deep brand-blue dusk void (#0A2236 into #103E61), surroundings fall away to dark navy, 35mm architectural photography, locked exposure, slow steady motion, no cuts, no text. START: low macro on the lit entrance. END: high wide aerial of the whole property.
Mobile framing: subject kept center-safe; lighter mobile encodes (max height 720).
Delivery budget: 32 MiB desktop, 16 MiB mobile for all clips.
Anti-convergence ledger (previous build in this chat: none).

Locked palette (user brand): ground #0A2236, field #103E61, deep #07182A, ink #F3F6F9, muted #A9BCCB, hairline rgba(243,246,249,0.16), accent #F2B620 (the only accent). Defense: these are the client's exact brand colors, so the near-black plus amber ban is overridden by explicit brand colors; the ground is brand blue darkened, not graphite.
Theme: Bold Studio Solid in brand blue, one theme across the whole page, tint shifts only within the blue family; one gold block near the end as a material switch.
Locked type: Outfit (display and body, 600/700 for display) + IBM Plex Mono (small labels and readouts). No serif.
Corner language: sharp (0 to 2px) with hairlines. No pills.
Background character: solid brand blue with soft ambient depth and faint survey hairlines.
Hero architecture: massive image-first (the film), restrained text bottom-left, vertical progress rail right.
Section system: Swiss grid discipline with hairlines, one layout family per section.
Signature components: price ladder rows; oversized numerals as structure; layered crop frames; vertical route rail.
Second-read moment: one oversized numeral (process step numerals) as structure.

Section plan (families, no consecutive repeat):
1. Journey: full-bleed film with chapter overlay (image-first).
2. Packages: price ladder, three stacked full-width rows (rows, not cards).
3. Process: three steps on a route line with giant outlined numerals.
4. Why UPCA: asymmetric split, big sentence left, four hairline-separated reasons right.
5. Areas: layered crop frames plus a mono town list.
6. Final call to action: full-width solid gold block, then footer.
Eyebrow budget: ceil(6/3) = 2 (journey kicker is the chapter label; one more on Areas).

Asset plan: film (+6 slices, posters, mobile), storyboard, 6 boards in refs/, custom icon set (gold line glyphs), content imagery (interior, aerial home, laptop), Niagara aerial plate, user logo (supplied), head kit, OG/cover.

CTA inventory (label per intent: consultation = "Book a Consultation"; package = "Book Essentials", "Book Pro Plus", "Book Pro Max"):
- Nav: corner-bracket (viewfinder) target that closes around the label on hover.
- Chapter 1 and chapter 6: oversized underlined text link whose arrow travels along a drawn route line.
- Package rows: the whole row is the CTA; it shears one step and shifts grade on hover.
- Final block: framed square button on the gold field with a clipped text swap on hover.

## Revision (hero film v2, content from upca.ca)
Film v2: descent from a night aerial over the Niagara region, into the lit home, through the entrance to an open-plan interior and out toward the twilight view. Same world grammar (brand blue + gold), calm dark upper frame for the logo and nav. Logo: a reversed version (navy letters set to ink) so it blends into the dark film; no white plate. Copy, contact details, areas and add-on prices now come from upca.ca.
