type MoveDetails = {
  translateX: number;
  translateY: number;
};

type Params = {
  element: HTMLElement;
  grabCheck?: (ev: MouseEvent) => boolean;
  callbacks: {
    grab: (ev: MoveDetails) => void;
    drag: (ev: MoveDetails) => void;
    drop: (ev: MoveDetails) => void;
  },
  signal: AbortSignal
}

const MOUSE_LEFT = 0;

/**
 * This function is a simple drag and drop implementation.
 * It checks mousedown on the element to start dragging,
 * then it checks mousemove and mouseup on the window so that the grab state is maintained
 * even if the mouse leaves the context (and the browser window)
 */
export function dragElement({ element, grabCheck, callbacks, signal }: Params) {
  element.addEventListener(
    "mousedown",
    (downEvent) => {
      if (downEvent.button !== MOUSE_LEFT) {
        return;
      }
      if (grabCheck && !grabCheck(downEvent)) {
        return;
      }

      const abortMoveController = new AbortController();

      const getMoveDetails = (ev: MouseEvent): MoveDetails => {
        return {
          translateX: ev.clientX - downEvent.clientX,
          translateY: ev.clientY - downEvent.clientY,
        }
      }

      callbacks.grab(getMoveDetails(downEvent));

      window.addEventListener(
        "mousemove",
        (moveEvent) => {
          callbacks.drag(getMoveDetails(moveEvent));
        },
        { signal: AbortSignal.any([signal, abortMoveController.signal]) }
      )

      window.addEventListener(
        "mouseup",
        (upEvent) => {
          callbacks.drop(getMoveDetails(upEvent));
          abortMoveController.abort();
        },
        { once: true, signal }
      )

      /**
       * If the signal is aborted, we need to call the drop callback
       * to ensure any cleanup is performed.
       */
      signal.addEventListener(
        "abort",
        () => {
          callbacks.drop(getMoveDetails(downEvent));
        },
        { once: true, signal: abortMoveController.signal })
    }
  )
}