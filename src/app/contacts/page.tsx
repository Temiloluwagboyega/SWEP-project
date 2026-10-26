import { MapPin, Phone, ArrowUpRight, Info, ShieldCheck } from "lucide-react";
import { contacts } from "@/config/contacts";
import { PageHeading } from "@/components/ui/page-heading";
export default function Contacts() {
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow="Help & contacts"
        title="Emergency contacts"
        description="Reach the people who support campus safety. For immediate danger, go directly to the QRS."
      />
      <div className="notice notice-urgent">
        <Info aria-hidden="true" size={20} />
        <div>
          <strong>This app is not monitored 24/7.</strong>
          <p>
            For emergencies, call the QRS directly or visit the Senate Building.
            Submitting a report does not guarantee an immediate response.
          </p>
        </div>
      </div>
      <div className="contact-grid">
        {contacts.map((contact) => (
          <article className="panel contact-card" key={contact.name}>
            <span className="large-icon">
              <ShieldCheck aria-hidden="true" size={27} />
            </span>
            <h2>{contact.name}</h2>
            <p className="location-line">
              <MapPin aria-hidden="true" size={16} />
              {contact.location}
            </p>
            <p>{contact.description}</p>
            {contact.verified && contact.phone !== "VERIFY_BEFORE_DEMO" ? (
              <a
                className="button button-primary"
                href={`tel:${contact.phone}`}
              >
                <Phone aria-hidden="true" size={16} />
                Call {contact.phone}
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            ) : (
              <div className="unverified-note">
                <Info aria-hidden="true" size={15} />
                Phone number awaiting verification. Visit the location for
                assistance.
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="panel information-panel">
        <h2>Prefer to report online?</h2>
        <p>
          An online report helps you record what happened and follow its status.
          Phone and in-person reporting remain available through the existing
          campus security structure.
        </p>
        <a href="/report/new" className="text-link">
          Report an incident <ArrowUpRight aria-hidden="true" size={16} />
        </a>
      </div>
    </div>
  );
}
