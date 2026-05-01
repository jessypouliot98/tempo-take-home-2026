import { Note } from "@/modules/sticky-note/types";
import { NOTE_DEFAULT } from "@/modules/sticky-note/constants";
import clsx from "clsx";
import { useEffect, useEffectEvent, useState } from "react";
import { dragElement } from "@/modules/drag-utils";

export type StickyNoteProps = {
  note: Note;
  updateNote: (partialNote: Partial<Note>) => void;
  focusNote: () => void;
  grabNote: () => void;
  dropNote: () => void;
  focused: boolean;
};

export function StickyNote({ note, focused, updateNote, focusNote, grabNote, dropNote }: StickyNoteProps) {
  const [noteEl, setNoteEl] = useState<HTMLDivElement | null>(null);
  const { text, x, y, width, height } = note;
  const [grabbing, setGrabbing] = useState(false);
  const updateNoteEvent = useEffectEvent(updateNote)
  const grabNoteEvent = useEffectEvent(grabNote)
  const dropNoteEvent = useEffectEvent(dropNote)

  const cssVars = {
    container: {
      '--x': `${x}px`,
      '--y': `${y}px`,
      '--width': `${width}px`,
      '--height': `${height}px`,
      '--z-index': `${note.priority}`,
    } as object,
    toolbar: {
      '--h': `${NOTE_DEFAULT.TOOLBAR_HEIGHT}px`,
    } as object
  }

  useEffect(() => {
    if (!noteEl) return;
    const abortController = new AbortController();

    const getNotePos = () => {
      return {
        x: parseFloat(noteEl.style.getPropertyValue("--x")),
        y: parseFloat(noteEl.style.getPropertyValue("--y")),
      }
    }

    let initial = getNotePos();

    dragElement({
      element: noteEl,
      grabCheck: (ev) => {
        const target = ev.target as HTMLElement;
        if (target.closest("[data-note=resize-handle]")) {
          return false;
        }
        if (target.closest("[data-note=text]")) {
          return false;
        }
        return true;
      },
      callbacks: {
        grab: () => {
          document.body.classList.add("select-none!");
          initial = getNotePos();
          setGrabbing(true);
          grabNoteEvent();
        },
        drag: (ev) => {
          noteEl.style.setProperty("--x", `${initial.x + ev.translateX}px`);
          noteEl.style.setProperty("--y", `${initial.y + ev.translateY}px`);
        },
        drop: () => {
          document.body.classList.remove("select-none!");
          updateNoteEvent(getNotePos())
          setGrabbing(false);
          dropNoteEvent();
        },
      },
      signal: abortController.signal,
    })

    return () => {
      abortController.abort();
    }
  }, [noteEl]);

  useEffect(() => {
    if (!noteEl) return;
    const resizeHandleEl = noteEl.querySelector("[data-note=resize-handle]") as HTMLElement | null;
    if (!resizeHandleEl) return;

    const abortController = new AbortController();

    const getNoteSize = () => {
      return {
        width: parseFloat(noteEl.style.getPropertyValue("--width")),
        height: parseFloat(noteEl.style.getPropertyValue("--height")),
      }
    }

    let initial = getNoteSize();

    dragElement({
      element: resizeHandleEl,
      callbacks: {
        grab: () => {
          document.body.classList.add("select-none!");
          initial = getNoteSize();
          setGrabbing(true);
          grabNoteEvent();
        },
        drag: (ev) => {
          noteEl.style.setProperty("--width", `${initial.width + ev.translateX}px`);
          noteEl.style.setProperty("--height", `${initial.height + ev.translateY}px`);
        },
        drop: () => {
          document.body.classList.remove("select-none!");
          updateNoteEvent(getNoteSize())
          setGrabbing(false);
          dropNoteEvent();
        },
      },
      signal: abortController.signal,
    })

    return () => {
      abortController.abort();
    }
  }, [noteEl]);

  let colors: string;
  switch (note.color) {
    case "sky-blue": {
      colors = "from-sky-300 to-sky-200 ring-sky-400";
      break;
    }
    case "lavender-purple": {
      colors = "from-violet-300 to-violet-200 ring-violet-400";
      break;
    }
    case "lime-green": {
      colors = "from-lime-300 to-lime-200 ring-lime-400";
      break;
    }
    case "peach-orange": {
      colors = "from-orange-300 to-orange-200 ring-orange-400";
      break;
    }
    default:
    case "classic-yellow": {
      colors = "from-amber-300 to-amber-200 ring-amber-400";
      break;
    }
  }

  return (
    <div
      ref={setNoteEl}
      data-note="wrapper"
      style={cssVars.container}
      className={clsx(
        "group/note",
        "absolute top-(--y) left-(--x) w-(--width) h-(--height)",
        "bg-linear-to-b",
        "shadow-lg data-[grabbing=true]:shadow-xl",
        "data-[grabbing=true]:opacity-90",
        "data-[focused=true]:ring-2",
        colors,
        "transition z-(--z-index)",
      )}
      data-note-id={note.id}
      data-grabbing={grabbing}
      data-focused={focused}
      onMouseDown={focusNote}
    >
      <div className="relative flex flex-col size-full">
        <div
          data-note="grab-area"
          style={cssVars.toolbar}
          className={clsx(
            "h-(--h) bg-linear-to-br from-black/20 to-black/10 opacity-50",
            grabbing ? "cursor-grabbing" : "cursor-grab",
          )}
        />
        <p
          className="max-h-full overflow-auto px-4 py-2 flex-1 outline-0 whitespace-pre-wrap"
          data-note="text"
          contentEditable={focused ? "plaintext-only" : false}
          dangerouslySetInnerHTML={{ __html: text }}
          onBlur={(ev) => {
            updateNote({ text: ev.currentTarget.innerText });
          }}
        />
        <div
          data-note="resize-handle"
          className="absolute bottom-1 right-1 size-4 bg-white/50 rounded-full cursor-se-resize"
        />
      </div>
    </div>
  )
}