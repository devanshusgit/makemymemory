"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, Wand2 } from "lucide-react";
import {
  type CustomizationField,
  CUSTOMIZATION_FIELD_TYPES,
  DEFAULT_CUSTOMIZATION_FIELDS,
} from "@/lib/data/customizationFields";

/**
 * Admin editor for the fields a customer fills on the product page — the
 * details that get engraved (name, date, time, weight...). The product form
 * had no way to set these at all, and every save used to wipe whatever was
 * there, which is why no product was asking customers for a name.
 */

function slug(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "field";
}

export default function CustomizationFieldsEditor({
  value,
  onChange,
}: {
  value: CustomizationField[];
  onChange: (fields: CustomizationField[]) => void;
}) {
  const fields = [...(value || [])].sort((a, b) => a.order - b.order);

  // Ids must be unique: the product page keys each customer's answer by id, so
  // two fields sharing one would overwrite each other.
  const commit = (next: CustomizationField[]) => {
    const seen = new Set<string>();
    onChange(next.map((f, i) => {
      let id = f.id || "field";
      for (let n = 2; seen.has(id); n++) id = `${f.id || "field"}-${n}`;
      seen.add(id);
      return { ...f, id, order: i + 1 };
    }));
  };

  const update = (index: number, patch: Partial<CustomizationField>) => {
    const next = fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    commit(next);
  };

  const move = (index: number, by: number) => {
    const to = index + by;
    if (to < 0 || to >= fields.length) return;
    const next = [...fields];
    [next[index], next[to]] = [next[to], next[index]];
    commit(next);
  };

  const add = () => {
    const taken = new Set(fields.map((f) => f.id));
    let id = "field";
    for (let n = 1; taken.has(id); n++) id = `field-${n}`;
    commit([...fields, { id, label: "", type: "text", placeholder: "", required: false, order: fields.length + 1 }]);
  };

  const inputCls = "bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C9A84C]";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Customer details to engrave
        </label>
        {fields.length === 0 && (
          <button type="button" onClick={() => commit(DEFAULT_CUSTOMIZATION_FIELDS)}
            className="flex items-center gap-1 text-xs font-semibold text-[#8B6F2E] hover:underline">
            <Wand2 className="w-3.5 h-3.5" /> Use Name / Date / Time / Weight
          </button>
        )}
      </div>
      <p className="text-xs text-stone-400 mb-2">
        The customer fills these on the product page before adding to cart. They appear on the order.
      </p>

      {fields.length === 0 ? (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-2">
          No fields — customers will not be asked for a name or any detail for this product.
        </div>
      ) : (
        <div className="space-y-2 mb-2">
          {fields.map((f, i) => (
            <div key={i} className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input value={f.label} placeholder="Label (e.g. Baby's name)"
                  onChange={(e) => {
                    const label = e.target.value;
                    // Keep the id in step with the label until the field is saved on an order.
                    const autoId = !f.id || f.id.startsWith("field") || f.id === slug(f.label);
                    update(i, { label, ...(autoId ? { id: slug(label) } : {}) });
                  }}
                  className={`${inputCls} flex-1 min-w-[140px]`} />
                <select value={f.type} onChange={(e) => update(i, { type: e.target.value as CustomizationField["type"] })}
                  className={inputCls}>
                  {CUSTOMIZATION_FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <label className="flex items-center gap-1 text-xs text-stone-600">
                  <input type="checkbox" checked={f.required} onChange={(e) => update(i, { required: e.target.checked })} />
                  Required
                </label>
                <div className="flex items-center gap-1 ml-auto">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"
                    className="p-1 rounded text-stone-500 hover:bg-stone-200 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === fields.length - 1} aria-label="Move down"
                    className="p-1 rounded text-stone-500 hover:bg-stone-200 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => commit(fields.filter((_, j) => j !== i))} aria-label="Remove field"
                    className="p-1 rounded text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <input value={f.placeholder || ""} placeholder="Hint shown in the box (optional)"
                onChange={(e) => update(i, { placeholder: e.target.value })}
                className={`${inputCls} w-full`} />
              {f.type === "select" && (
                <input value={(f.options || []).join(", ")} placeholder="Choices, separated by commas"
                  onChange={(e) => update(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className={`${inputCls} w-full`} />
              )}
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={add}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-stone-300 text-stone-500 hover:border-[#C9A84C] hover:text-[#1A1A1A]">
        <Plus className="w-3 h-3" /> Add field
      </button>
    </div>
  );
}
