import { z } from "zod";

export const LEAD_EVENT_TYPES = [
  "wedding", "quinceanera", "graduation", "festival", "concert",
  "private_party", "sports", "corporate", "cruise_hotel", "university", "other",
] as const;

export const LEAD_EVENT_SIZES = [
  "s_lt_100", "s_100_250", "s_250_500", "s_500_2k", "s_2k_10k", "s_gt_10k",
] as const;

export const LEAD_EVENT_TYPE_LABELS: Record<typeof LEAD_EVENT_TYPES[number], string> = {
  wedding:       "Boda",
  quinceanera:   "XV años",
  graduation:    "Graduación",
  festival:      "Festival",
  concert:       "Concierto",
  private_party: "Evento privado",
  sports:        "Evento deportivo",
  corporate:     "Evento corporativo",
  cruise_hotel:  "Crucero / Hotel / Resort",
  university:    "Universidad",
  other:         "Otro",
};

export const LEAD_EVENT_SIZE_LABELS: Record<typeof LEAD_EVENT_SIZES[number], string> = {
  s_lt_100:  "Menos de 100 invitados",
  s_100_250: "100 a 250",
  s_250_500: "250 a 500",
  s_500_2k:  "500 a 2,000",
  s_2k_10k:  "2,000 a 10,000",
  s_gt_10k:  "Más de 10,000",
};

export const leadFormSchema = z.object({
  full_name:        z.string().min(2, "Nombre demasiado corto").max(120),
  email:            z.string().email("Email inválido").max(160),
  phone:            z.string().min(8, "Teléfono inválido").max(40),
  company:          z.string().max(160).optional().or(z.literal("")),
  event_type:       z.enum(LEAD_EVENT_TYPES),
  event_type_other: z.string().max(120).optional().or(z.literal("")),
  event_size:       z.enum(LEAD_EVENT_SIZES),
  event_date:       z.string().optional().or(z.literal("")),
  event_location:   z.string().max(160).optional().or(z.literal("")),
  message:          z.string().max(500).optional().or(z.literal("")),
  referral_source:  z.string().max(80).optional().or(z.literal("")),
  newsletter_opt_in: z.boolean().default(false),
  privacy_accepted: z.literal(true, { message: "Debes aceptar el aviso de privacidad" }),

  utm_source:   z.string().max(120).optional().or(z.literal("")),
  utm_medium:   z.string().max(120).optional().or(z.literal("")),
  utm_campaign: z.string().max(120).optional().or(z.literal("")),
  utm_content:  z.string().max(120).optional().or(z.literal("")),
  utm_term:     z.string().max(120).optional().or(z.literal("")),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
