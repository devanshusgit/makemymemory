"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Check, X } from "lucide-react";

export interface CustomizationField {
  id: string;
  label: string;
  type: "text" | "date" | "time" | "number" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface Props {
  fields: CustomizationField[];
  onChange: (fields: CustomizationField[]) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "select", label: "Dropdown" },
];

export default function CustomizationFieldsManager({ fields, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addField = () => {
    const newField: CustomizationField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      placeholder: "",
      required: false,
      order: fields.length,
    };
    onChange([...fields, newField]);
    setEditingId(newField.id);
  };

  const updateField = (id: string, updates: Partial<CustomizationField>) => {
    onChange(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    )
      return;

    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order
    newFields.forEach((f, i) => (f.order = i));
    onChange(newFields);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Customization Fields
        </label>
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                     transition-colors"
          style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 px-4 border-2 border-dashed rounded-xl"
          style={{ borderColor: "#E8D5A3", backgroundColor: "#FAF8F4" }}>
          <p className="text-sm text-stone-400">
            No customization fields yet. Click "Add Field" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white border rounded-xl p-4"
              style={{ borderColor: "#E8D5A3" }}
            >
              {editingId === field.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                        style={{ borderColor: "#E8D5A3" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as CustomizationField["type"],
                          })
                        }
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                        style={{ borderColor: "#E8D5A3" }}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                      style={{ borderColor: "#E8D5A3" }}
                    />
                  </div>

                  {field.type === "select" && (
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value.split(",").map((s) => s.trim()),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                        style={{ borderColor: "#E8D5A3" }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor={`required-${field.id}`} className="text-sm text-stone-600">
                      Required field
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                                 bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                                 bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                      className="text-stone-400 hover:text-stone-600 disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(index, "down")}
                      disabled={index === fields.length - 1}
                      className="text-stone-400 hover:text-stone-600 disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-800">{field.label}</span>
                      {field.required && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Type: {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                      {field.placeholder && ` • Placeholder: "${field.placeholder}"`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingId(field.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg
                               border hover:bg-stone-50 transition-colors"
                    style={{ borderColor: "#E8D5A3", color: "#6B6560" }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
