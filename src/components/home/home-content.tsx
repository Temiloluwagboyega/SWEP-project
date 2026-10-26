import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { EmergencyHelp } from "@/components/layout/emergency-banner";
export function HomeContent({ isStaff = false }: { isStaff?: boolean }) {
  return (
    <div className="shell home">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="institution-line">
            <span className="institution-mark" aria-hidden="true">
              OAU
            </span>
            Campus security & student support
          </p>
          <h1>
            A clear way to report.
            <br />A place to follow up.
          </h1>
          <p className="hero-description">
            Report a concern to the right people at OAU, keep your reference,
            and see what happens next.
          </p>
          <div className="hero-actions">
            <ButtonLink href={isStaff ? "/staff" : "/report/new"}>
              {isStaff ? "Open staff queue" : "Report an incident"}
              <ArrowUpRight aria-hidden="true" size={19} />
            </ButtonLink>
            <ButtonLink
              variant="outline"
              href={isStaff ? "/staff" : "/reports"}
            >
              Track my reports
              <ArrowRight aria-hidden="true" size={19} />
            </ButtonLink>
          </div>
          <p className="hero-assurance">
            <LockKeyhole aria-hidden="true" size={17} />
            Your report is visible only to you and permitted responders.
          </p>
          <div className="hero-quick-location">
            <MapPin aria-hidden="true" size={20} />
            <div>
              <strong>Prefer to speak to someone?</strong>
              <p>Visit the QRS at the Senate Building.</p>
            </div>
            <Link href="/contacts" aria-label="Find in-person security help">
              <ArrowUpRight aria-hidden="true" size={21} />
            </Link>
          </div>
        </div>
        <Panel className="route-panel" aria-labelledby="route-heading">
          <div className="route-panel-heading">
            <span className="route-symbol">
              <ShieldCheck aria-hidden="true" size={26} />
            </span>
            <p>Two routes. One place to start.</p>
            <h2 id="route-heading">Who can help with your concern?</h2>
          </div>
          <div className="route-options">
            <article>
              <span className="route-icon">
                <Users aria-hidden="true" size={25} />
              </span>
              <div>
                <h3>Student Union Security Committee</h3>
                <p>
                  Student disputes, accommodation-agent issues, and civil
                  matters suitable for mediation.
                </p>
                <TextLink
                  href={isStaff ? "/staff" : "/report/new?channel=COMMITTEE"}
                >
                  {isStaff ? "Open your queue" : "Choose Committee"}
                </TextLink>
              </div>
            </article>
            <article>
              <span className="route-icon">
                <ShieldCheck aria-hidden="true" size={25} />
              </span>
              <div>
                <h3>Official University Security</h3>
                <p>
                  Theft, assault, threats, serious incidents, and concerns
                  involving non-students or off-campus locations.
                </p>
                <TextLink
                  href={isStaff ? "/staff" : "/report/new?channel=SECURITY"}
                >
                  {isStaff ? "Open your queue" : "Choose Official Security"}
                </TextLink>
              </div>
            </article>
          </div>
          <p className="route-footnote">
            Not sure? The Committee can refer a case to Official Security when
            needed.
          </p>
        </Panel>
      </section>
      <section className="home-emergency">
        <EmergencyHelp />
        <p>
          Online reporting supports existing campus security. It does not
          dispatch help or guarantee an immediate response.
        </p>
      </section>
      <section className="how-section" aria-labelledby="how-heading">
        <div className="section-heading">
          <h2 id="how-heading">What happens when you report?</h2>
          <p>A reference to keep. A record you can return to.</p>
        </div>
        <ol className="report-steps">
          {[
            {
              icon: FileText,
              title: "Tell us what happened",
              text: "Choose a category and campus location. Describe what you know, then decide who receives it.",
            },
            {
              icon: ShieldCheck,
              title: "The receiving team reviews it",
              text: "Your chosen channel can review, assign, or refer the report under the agreed handling process.",
            },
            {
              icon: ClipboardCheck,
              title: "Follow your report’s progress",
              text: "Use My reports to see the current status and updates shared with you by the receiving team.",
            },
          ].map((step, i) => (
            <li key={step.title}>
              <div className="step-icon">
                <step.icon aria-hidden="true" size={25} />
                <span aria-hidden="true">{i + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="home-privacy">
        <span className="privacy-mark">
          <LockKeyhole aria-hidden="true" size={30} />
        </span>
        <div>
          <h2>Sensitive concerns deserve careful handling.</h2>
          <p>
            Choose confidential reporting to restrict full details to your
            handler and, in the Security channel, authorised supervisors.
            Confidential reporting is not anonymous—the handler can see who you
            are.
          </p>
        </div>
        <ButtonLink href={isStaff ? "/staff" : "/report/new"} variant="outline">
          {isStaff ? "View your queue" : "Start a report"}
          <ArrowRight aria-hidden="true" size={18} />
        </ButtonLink>
      </section>
    </div>
  );
}
