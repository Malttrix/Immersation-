import React, { useId } from "react";
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label className="studio-field">
      <span>{label}</span>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            "aria-label": label,
            "aria-describedby": hint ? id : undefined,
          })
        : children}
      {hint && <small id={id}>{hint}</small>}
    </label>
  );
}
export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="studio-panel">
      <header>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}
