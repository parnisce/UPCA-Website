import { useEffect } from "react";

// Elements that fade and rise into view once scrolled to. Content stays visible
// without JavaScript: the hidden state is only applied after this effect runs.
const TARGETS = [
  ".u-section .u-eyebrow",
  ".u-section .u-h2",
  ".u-section .u-lede",
  ".u-areas__fig",
  ".u-areas__panel",
  ".u-callfirst",
  ".u-about__grid > *",
  ".u-why__grid > *",
  ".u-addons",
  ".u-final__intro",
  ".u-form",
  ".u-final__title",
  ".u-footer__top > *",
  ".u-faq__grid > *",
  ".u-detail__main",
  ".u-detail__side",
  ".u-pkgcards",
  ".u-more__list",
  ".u-ctaband__inner",
  ".u-contact__info",
  ".u-contact__form",
  ".u-pagehero .u-crumb",
].join(",");

export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el, i) => {
      el.setAttribute("data-rv", "");
      el.style.setProperty("--rv", String((i % 3) * 90) + "ms");
      io.observe(el);
    });
    return () => {
      io.disconnect();
      els.forEach((el) => {
        el.removeAttribute("data-rv");
        el.classList.remove("is-in");
      });
    };
  }, []);
  return null;
}
