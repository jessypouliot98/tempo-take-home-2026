import { NOTE_COLORS } from "@/modules/sticky-note/constants";

export function colorByIndex(index: number) {
  return NOTE_COLORS[index % NOTE_COLORS.length];
}