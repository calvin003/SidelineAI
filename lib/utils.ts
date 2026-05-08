import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avgScore(skills: Record<string, { score: number }>): number {
  const values = Object.values(skills).map((s) => s.score);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function formatGrade(n: number): string {
  return n.toFixed(1);
}

export function gradeLetter(n: number): string {
  if (n >= 9) return "A+";
  if (n >= 8.3) return "A";
  if (n >= 7.8) return "A-";
  if (n >= 7.3) return "B+";
  if (n >= 6.8) return "B";
  if (n >= 6.3) return "B-";
  if (n >= 5.8) return "C+";
  if (n >= 5) return "C";
  return "C-";
}
