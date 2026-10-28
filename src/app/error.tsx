"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell page-content empty-page">
      <h1>Something interrupted this page.</h1>
      <p>
        We couldn’t load the information. Please try again. For urgent help, contact
        security personnel near you, call QRS, or visit the Senate Building.
      </p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
