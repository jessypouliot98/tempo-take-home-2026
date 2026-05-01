import React from "react";
import { Note } from "@/modules/sticky-note/types";

export type BoardContextValue = {
  dragging: Note["id"] | undefined;
  drop: "board" | "trash";
}

export const BoardContext = React.createContext<BoardContextValue>({
  dragging: undefined,
  drop: "board",
})