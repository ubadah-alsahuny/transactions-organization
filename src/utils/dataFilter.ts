const EMPLOYEE_NOTE_SUFFIXES = ['LegalParagraph', 'PersonalNote'] as const;

export function filterInitialData(data: Record<string, any>): Record<string, any> {
  if (!data) return data;
  return Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      !EMPLOYEE_NOTE_SUFFIXES.some((suffix) => key.endsWith(suffix))
    )
  );
}

export function filterStepOneData(data: Record<string, any>): Record<string, any> {
  if (!data) return data;
  return Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      EMPLOYEE_NOTE_SUFFIXES.some((suffix) => key.endsWith(suffix))
    )
  );
}