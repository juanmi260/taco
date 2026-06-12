import type { ChangeEvent } from 'react';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: Props) {
  const inputId = id ?? `toggle-${label.replace(/\s+/g, '-')}`;
  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
    >
      <span className="text-slate-900 dark:text-slate-100">{label}</span>
      <input
        id={inputId}
        type="checkbox"
        className="h-5 w-5 cursor-pointer accent-emerald-600"
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      />
    </label>
  );
}
