"use client";

import { useMemo, useState } from "react";
import { ChipInput } from "@/components/admin/ChipInput";
import { fieldClassName, labelClassName } from "@/components/admin/ui";
import type {
  AdminAttributeDefinition,
  AdminProductAttributeValue,
} from "@/lib/admin/queries";

type Draft = {
  attributeId: string;
  label: string;
  dataType: "boolean" | "select";
  options: string[];
  filterGroup: string;
  filterable: boolean;
  valueBoolean: boolean;
  valueText: string;
};

type Row = Draft & { uid: string };

const EMPTY_DRAFT: Draft = {
  attributeId: "",
  label: "",
  dataType: "boolean",
  options: [],
  filterGroup: "",
  filterable: false,
  valueBoolean: true,
  valueText: "",
};

function rowFromValue(value: AdminProductAttributeValue, index: number): Row {
  const dataType = value.dataType === "select" ? "select" : "boolean";
  return {
    uid: value.attributeId || `attr-${index}`,
    attributeId: value.attributeId,
    label: value.label,
    dataType,
    options:
      value.valueText && !value.options.includes(value.valueText)
        ? [...value.options, value.valueText]
        : value.options,
    filterGroup: value.filterGroup ?? "",
    filterable: value.filterable,
    valueBoolean: value.valueBoolean ?? false,
    valueText: value.valueText ?? "",
  };
}

export function ProductAttributesField({
  definitions,
  values,
}: {
  definitions: AdminAttributeDefinition[];
  values: AdminProductAttributeValue[];
}) {
  const [rows, setRows] = useState<Row[]>(() => values.map(rowFromValue));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const payload = useMemo(
    () =>
      JSON.stringify(
        rows.map((row) => ({
          attributeId: row.attributeId || null,
          label: row.label,
          dataType: row.dataType,
          filterGroup: row.filterGroup.trim() || null,
          filterable: row.filterable,
          valueBoolean: row.dataType === "boolean" ? row.valueBoolean : null,
          valueText: row.dataType === "select" ? row.valueText || null : null,
          options: row.dataType === "select" ? row.options : undefined,
        })),
      ),
    [rows],
  );

  const usedIds = new Set(rows.map((row) => row.attributeId).filter(Boolean));
  const available = definitions.filter(
    (definition) =>
      (definition.dataType === "boolean" || definition.dataType === "select") &&
      !usedIds.has(definition.id),
  );

  function updateRow(uid: string, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.uid === uid ? { ...row, ...patch } : row)),
    );
  }

  function chooseDefinition(id: string) {
    if (!id) {
      setDraft(EMPTY_DRAFT);
      return;
    }
    const definition = definitions.find((item) => item.id === id);
    if (!definition) return;
    const dataType = definition.dataType === "select" ? "select" : "boolean";
    setDraft({
      attributeId: definition.id,
      label: definition.label,
      dataType,
      options: definition.options,
      filterGroup: definition.filterGroup ?? "",
      filterable: definition.filterable,
      valueBoolean: true,
      valueText: definition.options[0] ?? "",
    });
  }

  function addDraft() {
    const label = draft.label.trim();
    if (!label) return;
    if (
      draft.dataType === "select" &&
      !draft.attributeId &&
      draft.options.length === 0
    ) {
      return;
    }
    if (draft.dataType === "select" && !draft.valueText.trim()) return;
    setRows((current) => [
      ...current,
      {
        ...draft,
        label,
        valueText: draft.valueText.trim(),
        uid: draft.attributeId || `new-${label}-${current.length}`,
      },
    ]);
    setDraft(EMPTY_DRAFT);
    setAdding(false);
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="attributes" value={payload} />
      {rows.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No attributes yet. Add a yes/no or single-choice flag for this product.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.uid}
              className="grid gap-3 rounded-lg border border-outline-variant/25 p-3 sm:grid-cols-2"
            >
              <p className="text-sm font-semibold text-on-surface sm:col-span-2">
                {row.label}
                <span className="ml-2 text-xs font-medium text-on-surface-variant">
                  {row.dataType === "boolean" ? "Yes / no" : "Single choice"}
                </span>
              </p>
              {row.dataType === "boolean" ? (
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={row.valueBoolean}
                    onChange={(event) =>
                      updateRow(row.uid, { valueBoolean: event.target.checked })
                    }
                  />
                  Yes
                </label>
              ) : (
                <label className={labelClassName()}>
                  Value
                  {row.options.length > 0 ? (
                    <select
                      value={row.valueText}
                      onChange={(event) =>
                        updateRow(row.uid, { valueText: event.target.value })
                      }
                      className={fieldClassName()}
                    >
                      <option value="">,  Select , </option>
                      {row.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={row.valueText}
                      onChange={(event) =>
                        updateRow(row.uid, { valueText: event.target.value })
                      }
                      className={fieldClassName()}
                    />
                  )}
                </label>
              )}
              <label className={labelClassName()}>
                Filter group
                <input
                  value={row.filterGroup}
                  onChange={(event) =>
                    updateRow(row.uid, { filterGroup: event.target.value })
                  }
                  placeholder="e.g. Purity & Preparation"
                  className={fieldClassName()}
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input
                  type="checkbox"
                  checked={row.filterable}
                  onChange={(event) =>
                    updateRow(row.uid, { filterable: event.target.checked })
                  }
                />
                Show in catalogue filters
              </label>
              <div>
                <button
                  type="button"
                  className="text-sm font-semibold text-red-700 hover:underline"
                  onClick={() =>
                    setRows((current) => current.filter((item) => item.uid !== row.uid))
                  }
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="grid gap-3 rounded-lg border border-primary/20 bg-white p-4 sm:grid-cols-2">
          <label className={`${labelClassName()} sm:col-span-2`}>
            Attribute
            <select
              value={draft.attributeId}
              onChange={(event) => chooseDefinition(event.target.value)}
              className={fieldClassName()}
            >
              <option value="">Create new…</option>
              {available.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.label}
                </option>
              ))}
            </select>
          </label>
          {draft.attributeId ? null : (
            <>
              <label className={labelClassName()}>
                Label
                <input
                  value={draft.label}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, label: event.target.value }))
                  }
                  className={fieldClassName()}
                  placeholder="No palm oil"
                />
              </label>
              <label className={labelClassName()}>
                Type
                <select
                  value={draft.dataType}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      dataType: event.target.value === "select" ? "select" : "boolean",
                      options: [],
                      valueText: "",
                    }))
                  }
                  className={fieldClassName()}
                >
                  <option value="boolean">Yes / no</option>
                  <option value="select">Single choice</option>
                </select>
              </label>
              {draft.dataType === "select" ? (
                <div className="sm:col-span-2">
                  <ChipInput
                    label="Choices"
                    mode="multi"
                    placeholder="Add a choice, press Enter"
                    onChange={(options) =>
                      setDraft((current) => ({
                        ...current,
                        options,
                        valueText: options.includes(current.valueText)
                          ? current.valueText
                          : (options[0] ?? ""),
                      }))
                    }
                  />
                </div>
              ) : null}
            </>
          )}
          <label className={labelClassName()}>
            Filter group
            <input
              value={draft.filterGroup}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  filterGroup: event.target.value,
                }))
              }
              placeholder="e.g. Purity & Preparation"
              className={fieldClassName()}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.filterable}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  filterable: event.target.checked,
                }))
              }
            />
            Show in catalogue filters
          </label>
          {draft.dataType === "boolean" ? (
            <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.valueBoolean}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    valueBoolean: event.target.checked,
                  }))
                }
              />
              Yes for this product
            </label>
          ) : (
            <label className={labelClassName()}>
              Value for this product
              {draft.options.length > 0 ? (
                <select
                  value={draft.valueText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      valueText: event.target.value,
                    }))
                  }
                  className={fieldClassName()}
                >
                  <option value="">,  Select , </option>
                  {draft.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={draft.valueText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      valueText: event.target.value,
                    }))
                  }
                  className={fieldClassName()}
                />
              )}
            </label>
          )}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="button"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
              onClick={addDraft}
            >
              Add to product
            </button>
            <button
              type="button"
              className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold"
              onClick={() => {
                setAdding(false);
                setDraft(EMPTY_DRAFT);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold"
          onClick={() => setAdding(true)}
        >
          Add attribute
        </button>
      )}
    </div>
  );
}
