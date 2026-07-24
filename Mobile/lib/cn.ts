/** Concatène des classes NativeWind conditionnelles (les valeurs falsy sont ignorées). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
