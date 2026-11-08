import React from 'react';

export const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-[#5A5350] focus:border-verde-agua focus:outline-none focus:ring-2 focus:ring-verde-agua/30';
export const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-verde-agua px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6fa79d] disabled:cursor-wait disabled:opacity-60';
export const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#5A5350] transition-colors hover:border-verde-agua hover:text-verde-agua disabled:opacity-60';

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#5A5350]">
      {label}
      {children}
      {hint && <small className="text-xs font-normal leading-relaxed text-gray-500">{hint}</small>}
    </label>
  );
}
export function ErrorText({ message }: { message: string }) {
  return message ? <p role="alert" className="rounded-xl border-l-4 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null;
}
