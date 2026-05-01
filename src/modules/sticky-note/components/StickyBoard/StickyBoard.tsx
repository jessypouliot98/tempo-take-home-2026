import { useRef, useState } from "react";
import { Note } from "@/modules/sticky-note/types";
import { StickyNote } from "@/modules/sticky-note/components/StickyNote/StickyNote";
import clsx from "clsx";
import { useUniqueId } from "@/modules/react-utils/hooks/useUniqueId";
import { NOTE_DEFAULT } from "@/modules/sticky-note/constants";
import { BoardContext, BoardContextValue } from "@/modules/sticky-note/context/BoardContext";
import { colorByIndex } from "@/modules/sticky-note/utils/colorByIndex";

export type StickyBoardProps = {
  className?: string;
}

const LOCAL_STORAGE_KEY = "sticky-board";
type Ability = "cursor" | "add";
type Position = { x: number; y: number };

function saveNotes(notes: Note[]) {
  const normalizedNotes = notes
    .toSorted((a, b) => b.priority - a.priority)
    .map((note, i) => ({
      ...note,
      priority: i,
    }))
  const notesString = JSON.stringify(normalizedNotes);
  localStorage.setItem(LOCAL_STORAGE_KEY, notesString);
  alert("Saved!"); // TODO [PRODUCTION] Replace with a non-blocking notification system
}

function loadNotes() {
  /**
   * TODO [PRODUCTION] Implement storage validation,
   * setting a corrupt state will break the app
   */
  const notesString = localStorage.getItem(LOCAL_STORAGE_KEY);
  let notes: Note[];
  if (notesString) {
    notes = JSON.parse(notesString);
  } else {
    notes = [];
  }
  return notes;
}

export function StickyBoard({ className }: StickyBoardProps) {
  const generateUniqueId = useUniqueId();
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const counterRef = useRef(notes.length);
  const [focusedNote, setFocusedNote] = useState(() => {
    return notes.at(-1)?.id;
  });
  const [ability, setAbility] = useState<Ability>("cursor");
  const [context, setContext] = useState<BoardContextValue>({
    dragging: undefined,
    drop: "board",
  });

  const handleAddNote = (pos: Position) => {
    const priority = counterRef.current++;
    setNotes((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        text: NOTE_DEFAULT.TEXT,
        x: pos.x - (NOTE_DEFAULT.SIZE / 2),
        y: pos.y - (NOTE_DEFAULT.TOOLBAR_HEIGHT / 2),
        width: NOTE_DEFAULT.SIZE,
        height: NOTE_DEFAULT.SIZE,
        priority,
        color: colorByIndex(priority)
      }
    ])
  }

  return (
    <div
      className={clsx(
        "relative overflow-hidden",
        ability === "cursor" && "cursor-auto",
        ability === "add" && "cursor-crosshair",
        className,
      )}
      onMouseDown={(ev) => {
        const boardRect = ev.currentTarget.getBoundingClientRect();
        const target = ev.target as HTMLElement;
        if (!target.closest("[data-note=wrapper]")) {
          setFocusedNote(undefined);
        }
        if (ability === "add") {
          handleAddNote({
            x: ev.clientX - boardRect.x,
            y: ev.clientY - boardRect.y,
          })
          setAbility("cursor")
        }
      }}
    >
      <BoardContext.Provider value={context}>
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            focused={note.id === focusedNote}
            updateNote={(partialNote) => {
              setNotes((prev) => {
                return prev.map((n) => {
                  if (n.id !== note.id) {
                    return n;
                  }
                  return { ...n, ...partialNote }
                })
              })
            }}
            focusNote={() => {
              setNotes((prev) => {
                return prev.map((n) => {
                  if (n.id !== note.id) {
                    return n;
                  }
                  return { ...n, priority: counterRef.current++ }
                })
              })
              setFocusedNote(note.id);
            }}
            grabNote={() => {
              setContext((prev) => ({ ...prev, dragging: note.id }))
            }}
            dropNote={() => {
              setContext((prev) => ({ ...prev, drop: "board", dragging: undefined }))
              if (context.drop === "trash") {
                setNotes((prev) => prev.filter((n) => n.id !== note.id))
              }
            }}
          />
        ))}
      </BoardContext.Provider>
      <div
        // TODO Fix bug where priority constantly increasing can cause them to render on top of these tools.
        // Using large z-index to temporarily fix this issue.
        className="z-9999 absolute bottom-0 right-0 flex flex-row gap-4 p-4 pointer-events-none"
        // Prevent ability click on tool click
        onClick={(ev) => ev.stopPropagation()}
        onMouseDown={(ev) => ev.stopPropagation()}
      >
        <button
          className={clsx(
            "flex justify-center items-center size-24 rounded-2xl",
            "cursor-pointer font-medium transition-colors pointer-events-auto",
            "bg-white text-blue-500 border-2 border-blue-500",
          )}
          onClick={() => {
            saveNotes(notes);
          }}
        >
          Save
        </button>
        <div
          data-trash={context.drop === "trash" ? "open" : "closed"}
          className={clsx(
            "flex justify-center items-center size-24 rounded-2xl",
            "font-medium transition-colors pointer-events-auto",
            "bg-red-100 text-red-500 border-2 border-red-500",
            "data-[trash=open]:bg-red-500 data-[trash=open]:text-white"
          )}
          onClick={() => {
            setAbility((prev) => prev === "add" ? "cursor" : "add")
          }}
          onMouseEnter={() => {
            if (context.dragging != null) {
              setContext((prev) => ({ ...prev, drop: "trash" }))
            }
          }}
          onMouseLeave={() => {
            setContext((prev) => ({ ...prev, drop: "board" }))
          }}
        >
          Trash
        </div>
        <button
          aria-pressed={ability === "add"}
          className={clsx(
            "flex justify-center items-center size-24 rounded-2xl",
            "cursor-pointer font-medium transition-colors pointer-events-auto",
            "bg-white text-blue-500 border-2 border-blue-500",
            "aria-pressed:bg-blue-500 aria-pressed:text-white"
          )}
          onClick={() => {
            setAbility((prev) => prev === "add" ? "cursor" : "add")
          }}
        >
          Add note
        </button>
      </div>
    </div>
  )
}