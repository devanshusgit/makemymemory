/**
 * What the customer types on the product page for the engraving — the baby's
 * name, date and time of birth, weight. Stored per product as
 * `customizationFields`, rendered by components/shop/DynamicCustomizationFields,
 * and saved onto each order line as `customization`.
 */
export type CustomizationFieldType = "text" | "date" | "time" | "number" | "textarea" | "select";

export interface CustomizationField {
  id: string;
  label: string;
  type: CustomizationFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export const DEFAULT_CUSTOMIZATION_FIELDS: CustomizationField[] = [
  { id: "name",   label: "Name",              type: "text", placeholder: "Enter name", required: true,  order: 1 },
  { id: "date",   label: "Date",              type: "date", placeholder: "dd-mm-yyyy", required: false, order: 2 },
  { id: "time",   label: "Time",              type: "time", placeholder: "--:--",      required: false, order: 3 },
  { id: "weight", label: "Weight (optional)", type: "text", placeholder: "e.g. 3.1 kg", required: false, order: 4 },
];

export const CUSTOMIZATION_FIELD_TYPES: { value: CustomizationFieldType; label: string }[] = [
  { value: "text",     label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "date",     label: "Date" },
  { value: "time",     label: "Time" },
  { value: "number",   label: "Number" },
  { value: "select",   label: "Dropdown" },
];
