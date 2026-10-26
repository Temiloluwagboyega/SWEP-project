"use client";
import { useEffect, useRef } from "react";
import { CircleAlert } from "lucide-react";
export function ErrorSummary({
  message,
  fields,
}: {
  message?: string;
  fields: Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Object.keys(fields).length;
  useEffect(() => {
    if (message || count) ref.current?.focus();
  }, [message, fields, count]);
  if (!message && !count) return null;
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="form-error error-summary"
    >
      <CircleAlert aria-hidden="true" size={20} />
      <div>
        <h2>{message || "Check these details before continuing."}</h2>
        {count > 0 && (
          <ul>
            {Object.entries(fields).map(([name, text]) => (
              <li key={name}>
                <a
                  href={`#${name}`}
                  onClick={(event) => {
                    const input = document.getElementById(name);
                    if (input) {
                      event.preventDefault();
                      input.focus();
                      input.scrollIntoView({
                        block: "center",
                        behavior: "instant",
                      });
                    }
                  }}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
