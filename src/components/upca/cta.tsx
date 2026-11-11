import { BOOK_LABEL } from "./content";

// Chapter link: the arrow travels along a drawn route line on hover and focus.
export function BookLink({ variant = "route" }: { variant?: "route" }) {
  return (
    <a className={`u-route u-route--${variant}`} href="/contact">
      <span className="u-route__label">{BOOK_LABEL}</span>
      <span aria-hidden="true" className="u-route__track">
        <i className="u-route__line" />
        <i className="u-route__arrow" />
      </span>
    </a>
  );
}

// Nav CTA: viewfinder corner brackets that close in around the label.
export function ViewfinderButton({ className = "" }: { className?: string }) {
  return (
    <a className={`u-view ${className}`} href="/contact">
      <i aria-hidden="true" className="u-view__c u-view__c--tl" />
      <i aria-hidden="true" className="u-view__c u-view__c--tr" />
      <i aria-hidden="true" className="u-view__c u-view__c--bl" />
      <i aria-hidden="true" className="u-view__c u-view__c--br" />
      <span>{BOOK_LABEL}</span>
    </a>
  );
}
