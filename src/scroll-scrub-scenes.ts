/**
 * Scene data for the UPCA scroll journey. ONE continuous film (single-shot),
 * sliced into six consecutive chapter clips that share their boundary frame,
 * so the camera move never has a seam. Keep this array a module constant.
 */
import { createElement } from "react";
import type { ScrollScrubScene, ScrollScrubTheme } from "@/components/scroll-scrub/scroll-scrub";
import { BookLink } from "@/components/upca/cta";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#f2b620",
  background: "#0a2236",
  ink: "#f3f6f9",
  muted: "#a9bccb",
};

const clip = (n: number) => ({
  clip: `/assets/world/scene-0${n}.mp4`,
  mobileClip: `/assets/world/scene-0${n}-mobile.mp4`,
  mobilePoster: `/assets/world/scene-0${n}-mobile-poster.jpg`,
  poster: `/assets/world/scene-0${n}-poster.jpg`,
});

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    ...clip(1),
    actions: createElement(BookLink, { variant: "route" }),
    body: "Get full real estate marketing support. Photos, videos, websites, social media and listing promotions.",
    id: "photography",
    label: "Photos",
    tags: ["Real estate photography"],
    title: "Win more listings and sell faster.",
  },
  {
    ...clip(2),
    body: "From scroll-stopping reels to prestige films. Agent-led walkthroughs or cinematic stories, MLS-ready.",
    id: "video-tours",
    align: "right",
    label: "Video",
    tags: ["Property video tours"],
    title: "Walk them through the front door.",
  },
  {
    ...clip(3),
    body: "Immersive tours that increase time-on-listing and remote buyer confidence.",
    id: "virtual-tours",
    label: "360 tours",
    tags: ["360 virtual tours"],
    title: "Open house, any hour of the day.",
  },
  {
    ...clip(4),
    body: "Aerial photos and films that show the property and its neighbourhood in one frame.",
    id: "drone",
    align: "right",
    label: "Drone",
    tags: ["Drone photo and video"],
    title: "See the lot, the street, the view.",
  },
  {
    ...clip(5),
    body: "Own the traffic. Control the experience. Conversion-ready sites for listings, teams and brokerages.",
    id: "websites",
    label: "Websites",
    tags: ["Agent websites"],
    title: "A page for every listing.",
  },
  {
    ...clip(6),
    actions: createElement(BookLink, { variant: "route" }),
    body: "Social media management and marketing campaigns, built around every listing.",
    id: "marketing",
    align: "right",
    label: "Marketing",
    tags: ["Full-service marketing"],
    title: "One team. Every channel.",
  },
];
