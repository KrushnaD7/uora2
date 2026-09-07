import { Building2, Mail, MapPin, Phone } from "lucide-react";

export const CONTACT_EMAIL = "contact@uorapublications.com";
export const CONTACT_PHONE = "+91 9766930707";

export interface ContactInfo {
  id: number;
  title: string;
  value: string;
  icon: React.ElementType;
  /** Makes the row actionable (tel:, mailto:, maps link). */
  href?: string;
}

export const contactInfo: ContactInfo[] = [
  {
    id: 1,
    title: "Publisher",
    value: "Universal Oneness in Research Association (UORA)",
    icon: Building2,
  },
  {
    id: 2,
    title: "Office address",
    value:
      "E-1/8 Mathura Nagar, N-6, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431003, India",
    icon: MapPin,
    href: "https://maps.google.com/?q=E-1/8+Mathura+Nagar+N-6+Cidco+Chhatrapati+Sambhajinagar+Maharashtra+431003",
  },
  {
    id: 3,
    title: "Phone",
    value: CONTACT_PHONE,
    icon: Phone,
    href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`,
  },
  {
    id: 4,
    title: "Email",
    value: CONTACT_EMAIL,
    icon: Mail,
    href: `mailto:${CONTACT_EMAIL}`,
  },
];

export const compliances = [
  { title: "UDYAM", value: "UDYAM-MH-04-0237577" },
  { title: "GSTN", value: "27AAIFU8304M1ZO" },
  { title: "Shop Act", value: "2541500320009408" },
];
