import type { Pkg } from "./content";
import { ADDONS, PACKAGES } from "./content";

function selectPackage(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("upca:package", { detail: name }));
}

function Row({ pkg, index }: { pkg: Pkg; index: number }) {
  return (
    <li className="u-row-item" style={{ ["--i" as string]: index }}>
      <a className="u-row" href="#contact" onClick={() => selectPackage(pkg.name)}>
        <img alt={pkg.img.alt} className="u-row__peek" height={688} loading="lazy" src={pkg.img.src} width={1024} />
        <div className="u-row__name">
          <h3>{pkg.name}</h3>
          <p>{pkg.band}</p>
          {pkg.popular ? <span className="u-row__flag">Most popular</span> : null}
        </div>
        <div className="u-row__price">
          <small>Starting from</small>
          <strong>{pkg.price}</strong>
        </div>
        <div className="u-row__groups">
          {pkg.includes ? <p className="u-row__includes">{pkg.includes}</p> : null}
          <div className="u-row__cols">
            {pkg.groups.map((g) => (
              <div key={g.title}>
                <h4>{g.title}</h4>
                <ul>
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="u-row__cta">
          <span>{pkg.cta}</span>
          <i aria-hidden="true" />
        </div>
      </a>
    </li>
  );
}

export function Packages() {
  return (
    <section className="u-section u-packages u-bgsec" id="packages" style={{ ["--bg" as string]: "url(/assets/world/scene-02-poster.jpg)" }}>
      <div className="u-wrap">
        <header className="u-head">
          <h2 className="u-h2">Flexible packages for every listing.</h2>
          <p className="u-lede">Choose the right package for your property. Custom packages are also available.</p>
        </header>
        <ul className="u-rows">
          {PACKAGES.map((p, i) => (
            <Row index={i} key={p.id} pkg={p} />
          ))}
        </ul>
        <div className="u-addons">
          <h3>Add to any package.</h3>
          <ul>
            {ADDONS.map((a) => (
              <li key={a.name}>
                <span>{a.name}</span>
                <strong>{a.price}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
