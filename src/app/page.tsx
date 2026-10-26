import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  FileText,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Users,
  Building2,
  Siren,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { TextLink } from "@/components/ui";
export default async function Home() {
  const user = await getSessionUser();
  return (
    <div className="shell home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="green-dot" /> YOUR CAMPUS. OUR SHARED
            RESPONSIBILITY.
          </div>
          <h1>
            Speak up.
            <br />
            Stay informed.
            <br />
            <span>Feel supported.</span>
          </h1>
          <p>
            A simpler way to report a security concern at OAU. Reach the right
            people and follow your report, every step of the way.
          </p>
          <div className="hero-actions">
            <Link
              href={user && user.role !== "STUDENT" ? "/staff" : "/report/new"}
              className="button button-primary"
            >
              {user && user.role !== "STUDENT"
                ? "Open staff queue"
                : "Report an incident"}
              <ArrowUpRight size={18} />
            </Link>
            <Link
              href={
                user?.role === "STUDENT"
                  ? "/reports"
                  : user
                    ? "/staff"
                    : "/login"
              }
              className="button button-outline"
            >
              Track my reports
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-assurance">
            <LockKeyhole size={14} />
            <span>Private reporting</span>
            <i />
            <span>Clear follow-up</span>
            <i />
            <span>No app to install</span>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="How CampusGuard connects your report to campus security"
        >
          <div className="visual-grid" />
          <span className="visual-label">
            <span className="green-dot" /> CONNECTED CAMPUS, CLEARER REPORTING
          </span>
          <div className="campus-illustration">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="campus-core">
              <ShieldCheck size={57} strokeWidth={1.25} />
              <span>CampusGuard</span>
              <small>Here to help you be heard.</small>
            </div>
            <div className="floating-card card-report">
              <span className="mini-icon">
                <FileText size={19} />
              </span>
              <div>
                Your concern matters
                <small>Report securely, in your own words.</small>
              </div>
              <Check size={17} className="green-text" />
            </div>
            <div className="floating-card card-routing">
              <span className="mini-icon">
                <Users size={18} />
              </span>
              <div>
                The right people<small>You choose who receives it.</small>
              </div>
            </div>
            <div className="floating-card card-tracking">
              <span className="mini-icon">
                <ClipboardList size={18} />
              </span>
              <div>
                A clear way forward<small>One reference. Every update.</small>
              </div>
            </div>
            <div className="map-pin pin-one">
              <MapPin size={17} />
            </div>
            <div className="map-pin pin-two">
              <Building2 size={18} />
            </div>
          </div>
          <span className="visual-bottom">
            DESIGNED AROUND THE OAU COMMUNITY <ArrowUpRight size={14} />
          </span>
        </div>
      </section>
      <section className="urgent-card">
        <span className="urgent-icon">
          <Siren size={23} />
        </span>
        <div>
          <h2>Need help right now?</h2>
          <p>
            Don’t wait for an online report. Go to the Quick Response Squad at
            the Senate Building.
          </p>
        </div>
        <Link href="/contacts" className="text-link">
          Find emergency help <ArrowUpRight size={17} />
        </Link>
      </section>
      <section className="how-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              A CLEAR PATH FROM CONCERN TO FOLLOW-UP
            </div>
            <h2>Reporting, without the uncertainty.</h2>
          </div>
          <span className="section-aside">
            Three steps to make your voice heard.
          </span>
        </div>
        <div className="steps-grid">
          {[
            {
              number: "01",
              icon: FileText,
              title: "Tell us what happened",
              text: "Choose a category and campus location, then describe your concern. Mark it confidential if you need to.",
            },
            {
              number: "02",
              icon: Users,
              title: "Choose the right channel",
              text: "Send it to the Student Union Security Committee or Official University Security. We’ll help you choose.",
            },
            {
              number: "03",
              icon: ClipboardList,
              title: "Stay in the loop",
              text: "Get your unique reference and check your report’s progress. See public updates as your case moves forward.",
            },
          ].map((step) => (
            <article className="step-card" key={step.number}>
              <div className="step-top">
                <step.icon size={24} strokeWidth={1.5} />
                <span>{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="channels-section">
        <div>
          <div className="eyebrow">TWO CHANNELS. ONE PLACE TO START.</div>
          <h2>
            You don’t need to know
            <br />
            every department.
          </h2>
          <p>
            Choose the channel that feels right. The Committee can refer a case
            to Official Security when further support is needed.
          </p>
          <TextLink href="/report/new">Start a report</TextLink>
        </div>
        <div className="channel-stack">
          <article>
            <span className="mini-icon">
              <Users size={22} />
            </span>
            <div>
              <h3>Student Union Security Committee</h3>
              <p>
                Student disputes, accommodation-agent issues, and civil matters
                that may be settled through mediation.
              </p>
            </div>
          </article>
          <article>
            <span className="mini-icon">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h3>Official University Security</h3>
              <p>
                Theft, assault, threats, serious incidents, or concerns
                involving non-students or off-campus locations.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="privacy-section">
        <LockKeyhole size={21} />
        <div>
          <h3>Your information deserves care.</h3>
          <p>
            Your reports are visible to you and permitted responders.
            Confidential report details are restricted to your handler and, in
            the Security channel, authorised supervisors. Confidential reporting
            is not anonymous.
          </p>
        </div>
        <Link href="/contacts" aria-label="Learn where to get help">
          <ArrowUpRight size={23} />
        </Link>
      </section>
    </div>
  );
}
