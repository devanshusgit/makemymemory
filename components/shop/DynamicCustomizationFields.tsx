"use client";

import { useState, useEffect } from "react";

interface CustomizationField {
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
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export default function DynamicCustomizationFields({ fields, values, onChange }: Props) {
  if (!fields || fields.length === 0) {
    return null;
  }

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleChange = (fieldId: string, value: string) => {
    onChange({
      ...values,
      [fieldId]: value,
    });
  };

  const renderField = (field: CustomizationField) => {
    const value = values[field.id] || "";

    const inputClasses = `w-full px-4 py-3 rounded-xl border text-sm transition-all
      focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent`;

    const labelClasses = `block text-xs font-semibold uppercase tracking-wide mb-2`;

    switch (field.type) {
      case "text":
        return (
          <div key={field.id}>
            <label className={labelClasses} style={{ color: "#6B6560" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={inputClasses}
              style={{ borderColor: "#E8D5A3", backgroundColor: "#FFFFFF" }}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id}>
            <label className={labelClasses} style={{ color: "#6B6560" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className={inputClasses}
              style={{ borderColor: "#E8D5A3", backgroundColor: "#FFFFFF" }}
            />
          </div>
        );

      case "number":
        return (
          <div key={field.id}>
            <label className={labelClasses} style={{ color: "#6B6560" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={inputClasses}
              style={{ borderColor: "#E8D5A3", backgroundColor: "#FFFFFF" }}
            />
          </div>
        );

      case "date":
        return (
          <div key={field.id}>
            <label className={labelClasses} style={{ color: "#6B6560" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              className={inputClasses}
              style={{ borderColor: "#E8D5A3", backgroundColor: "#FFFFFF" }}
            />
          </div>
        );

      case "time":
        return (
          <div key={field.id}>
            <label className={labelClasses} style={{ color: "#6B6560" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              className={inputClasses}
              style={{ borderColor: "#E8D5A3", backgroundColor: "#FFFFFF" }}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id}>
            <label className={labelClasses} style={{ color: "#6B6560" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              className={inputClasses}
              style={{ borderColor: "#E8D5A3", backgroundColor: "#FFFFFF" }}
            >
              <option value="">
                {field.placeholder || `Select ${field.label}`}
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  // Group fields for better layout
  const hasMultipleFields = sortedFields.length > 1;
  const dateTimeFields = sortedFields.filter(f => f.type === "date" || f.type === "time");
  const otherFields = sortedFields.filter(f => f.type !== "date" && f.type !== "time");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#1A1A1A" }}>
        Personalize Your Product
      </h3>

      {/* Render non-date/time fields first */}
      {otherFields.map(renderField)}

      {/* Group date and time fields together if both exist */}
      {dateTimeFields.length > 0 && (
        <div className={dateTimeFields.length > 1 ? "grid grid-cols-2 gap-3" : ""}>
          {dateTimeFields.map(renderField)}
        </div>
      )}
    </div>
  );
}
