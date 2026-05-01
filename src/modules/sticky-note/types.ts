import { NOTE_COLORS } from "@/modules/sticky-note/constants";

export type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number;
  color: NoteColors
}

export type NoteColors = typeof NOTE_COLORS[number];