"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Auto-saves form data to localStorage and restores it on mount.
 * Returns [formData, updateField, clearDraft, draftRestored] where
 * draftRestored is true when data was loaded from a previous draft.
 */
export function useFormDraft(
  storageKey: string,
  initialData: Record<string, string>,
): [
  Record<string, string>,
  (field: string, value: string) => void,
  () => void,
  boolean,
] {
  const [draftRestored, setDraftRestored] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  const initialized = useRef(false);

  // Restore draft on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
        setDraftRestored(true);
      }
    } catch {}
  }, [storageKey]);

  // Save to localStorage whenever formData changes (after initial load)
  useEffect(() => {
    if (!initialized.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch {}
  }, [storageKey, formData]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch {}
    setDraftRestored(false);
  }, [storageKey]);

  return [formData, updateField, clearDraft, draftRestored];
}
