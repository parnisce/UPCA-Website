import { SERVICES } from "./content";

export function Marquee() {
  const words = [...SERVICES.map((s) => s.title), ...SERVICES.map((s) => s.title)];
  return (
    <div aria-hidden="true" className="u-marquee">
      <div className="u-marquee__track">
        {[0, 1].map((k) => (
          <ul key={k}>
            {words.map((w, i) => (
              <li key={`${k}-${i}`}>{w}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
