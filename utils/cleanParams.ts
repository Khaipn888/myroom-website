export function cleanParams<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([v]) => {
      if (v === undefined || v === null) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
  ) as Partial<T>;
}
