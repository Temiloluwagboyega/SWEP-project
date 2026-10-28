import Link from "next/link";
import { MapPin, Phone, ArrowUpRight, Info, ShieldCheck } from "lucide-react";
import { contacts, emergencyGuidance } from "@/config/contacts";
import { PageHeading } from "@/components/ui/page-heading";
export default function Contacts() {
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow="Help & contacts"
        title="Emergency contacts"
        description="Reach campus security, nearby security personnel, or emergency services directly."
      />
      <div className="notice notice-urgent">
        <Info aria-hidden="true" size={20} />
        <div>
          <strong>This app is not monitored 24/7.</strong>
          <p>
            {emergencyGuidance}{" "}
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
            {contact.phone ? (
              <div className="form-stack">
                {[contact.phone, ...(contact.otherPhones ?? [])].map((phone, index) => (
                  <a key={phone} className={`button button-${index ? "outline" : "primary"}`} href={`tel:${phone}`}>
                    <Phone aria-hidden="true" size={16} />
                    Call {phone}
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </a>
                ))}
                {contact.source && <p className="field-help">
                  <a className="text-link" href={contact.source.url} target="_blank" rel="noreferrer">{contact.source.title}</a>
                  <br />Source checked {contact.source.checkedOn}. Published numbers; call availability has not been tested.
                </p>}
              </div>
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
        <Link href="/report/new" className="text-link">
          Report an incident <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </div>
  );
}
