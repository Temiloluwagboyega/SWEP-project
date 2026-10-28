import Link from "next/link";
import { ArrowUpRight, Siren, MapPin } from "lucide-react";
import { contacts, emergencyGuidance } from "@/config/contacts";
export function EmergencyBanner() {
  const qrs = contacts[0];
  return (
    <div className="emergency-strip" role="region" aria-label="Emergency help">
      <div className="shell emergency-inner">
        <div>
          <span className="emergency-pulse" aria-hidden="true">
            <Siren size={18} />
          </span>
          <span>
            <strong>In danger now?</strong>{" "}
            <span className="emergency-detail">
              Contact security personnel near you or call QRS.
            </span>
          </span>
        </div>
        <div className="emergency-actions">
          {qrs.phone && (
            <a className="emergency-cta" href={`tel:${qrs.phone}`}>
              Call QRS
            </a>
          )}
          <Link className="emergency-cta" href="/contacts">
            Get help
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
export function EmergencyHelp() {
  return (
    <div className="notice notice-urgent">
      <Siren aria-hidden="true" size={22} />
      <div>
        <strong>Need help right now?</strong>
        <p>
          Don’t wait for an online report. {emergencyGuidance}
        </p>
        <p className="location-line">
          <MapPin aria-hidden="true" size={16} />
          Senate Building, OAU
        </p>
        <Link href="/contacts" className="text-link">
          View emergency contacts
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </div>
  );
}
