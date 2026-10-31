import React, { useId, useState } from "react";
import { Field } from "./fields";
import { editorialImageSource } from "../../lib/magazine-markdown";
export function MediaPicker({
  label,
  value,
  onChange,
  choices,
}: {
  label: string;
  value?: string;
  onChange: (s: string) => void;
  choices: { url: string; label: string }[];
}) {
  const id = useId(),
    [failed, setFailed] = useState("");
  const safe = editorialImageSource(value);
  return (
    <div className="studio-media">
      <Field
        label={label}
        hint="Use a hosted image URL or choose an existing article asset. Uploads are not connected."
      >
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          list={id}
          placeholder="https://…"
        />
      </Field>
      <datalist id={id}>
        {choices.map((c) => (
          <option key={c.url} value={c.url}>
            {c.label}
          </option>
        ))}
      </datalist>
      {value &&
        (safe && failed !== value ? (
          <img
            src={safe}
            alt={`${label} preview`}
            loading="lazy"
            onError={() => setFailed(value || "")}
          />
        ) : (
          <p role="status">Image unavailable. Check the URL.</p>
        ))}
    </div>
  );
}
