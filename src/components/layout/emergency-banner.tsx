import Link from "next/link";
import { ArrowUpRight, Siren, MapPin } from "lucide-react";
import { contacts } from "@/config/contacts";
export function EmergencyBanner() {
  const qrs = contacts[0];
  return (
    <div className="emergency-strip">
      <div className="shell emergency-inner">
        <div>
          <Siren aria-hidden="true" size={18} />
          <span>
            <strong>In danger now?</strong> Go directly to the QRS, Senate
            Building.
          </span>
        </div>
        <Link href="/contacts">
          Emergency contacts
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
        {qrs.verified && qrs.phone !== "VERIFY_BEFORE_DEMO" && (
          <a href={`tel:${qrs.phone}`}>Call QRS</a>
        )}
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
          Don’t wait for an online report. Go directly to the Quick Response
          Squad.
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
