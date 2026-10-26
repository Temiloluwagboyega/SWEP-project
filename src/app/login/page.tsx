import { AuthForm } from "@/components/auth-form";
import { ShieldCheck, Check } from "lucide-react";
export default function Login() {
  return (
    <div className="shell auth-layout">
      <section className="auth-intro">
        <div className="eyebrow">YOUR CAMPUS SUPPORT, IN ONE PLACE</div>
        <h1>
          Welcome back.
          <br />
          <span>We’re listening.</span>
        </h1>
        <p>
          Sign in to submit a concern, follow your reports, or access your
          authorised staff queue.
        </p>
        <ul className="check-list">
          <li>
            <Check size={17} /> Track every report with a unique reference
          </li>
          <li>
            <Check size={17} /> Choose who receives your concern
          </li>
          <li>
            <Check size={17} /> Keep sensitive details confidential
          </li>
        </ul>
        <div className="auth-seal">
          <ShieldCheck size={35} strokeWidth={1.4} />
          <div>
            Made for the OAU community.
            <small>Built around care, clarity, and accountability.</small>
          </div>
        </div>
      </section>
      <section className="panel auth-panel">
        <span className="large-icon">
          <ShieldCheck size={25} />
        </span>
        <h2>Sign in to CampusGuard</h2>
        <p className="muted">Students and responders use the same sign-in.</p>
        <AuthForm />
      </section>
    </div>
  );
}
