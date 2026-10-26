import { AuthForm } from "@/components/auth-form";
import { ShieldCheck, Check } from "lucide-react";
export default function Register() {
  return (
    <div className="shell auth-layout">
      <section className="auth-intro">
        <div className="eyebrow">TAKE THE FIRST STEP</div>
        <h1>
          Your voice.
          <br />
          <span>A clearer way forward.</span>
        </h1>
        <p>
          Create a student account to report concerns and stay informed as your
          reports are handled.
        </p>
        <ul className="check-list">
          <li>
            <Check size={17} /> Only your own reports are visible to you
          </li>
          <li>
            <Check size={17} /> Confidential options for sensitive concerns
          </li>
          <li>
            <Check size={17} /> Public updates without exposing staff notes
          </li>
        </ul>
        <div className="notice">
          <ShieldCheck size={20} />
          <p>
            Confidential does not mean anonymous. Your assigned handler can see
            who you are.
          </p>
        </div>
      </section>
      <section className="panel auth-panel">
        <h2>Create your student account</h2>
        <p className="muted">A few details to help you report and follow up.</p>
        <AuthForm register />
      </section>
    </div>
  );
}
