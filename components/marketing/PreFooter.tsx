"use client";

import { useVariant } from "./VariantProvider";

export function PreFooter() {
  const { content: c } = useVariant();
  return (
    <section className="section">
      <div className="ng-container">
        <div className="pullquote reveal" dangerouslySetInnerHTML={{ __html: c.pullquoteHtml }} />
      </div>
    </section>
  );
}
