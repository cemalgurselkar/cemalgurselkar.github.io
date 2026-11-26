/**
 * Interactive terminal modal (UI). Command logic lives in ./commands.ts.
 *
 * Accessibility: native <dialog>.showModal() gives modal semantics, makes the page inert,
 * traps focus and handles Escape (we intercept `cancel` to animate the close). Focus goes to
 * the input on open and back to the monitor hotspot on close. Output is a polite live region.
 *
 * Safety: user input is only matched against a fixed command list and echoed with textContent.
 * Links come from site data and are re-checked with isSafeHref before rendering.
 */
import {
  History,
  isSafeHref,
  PROMPT,
  runCommand,
  WELCOME,
  type Line,
  type TerminalData,
} from "./commands";
import type { Universe } from "./universe";
import { lockScroll, motionAllowed, unlockScroll } from "../scroll-lock";

const OPEN_MS = 300;
const CLOSE_MS = 220;
const EASE = "cubic-bezier(0.2, 0.7, 0.3, 1)";

export function initTerminal(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-terminal]");
  const hotspot = document.querySelector<HTMLButtonElement>(
    "[data-terminal-open]",
  );
  const dataEl = document.querySelector<HTMLScriptElement>(
    "[data-terminal-data]",
  );
  if (!dialog || !hotspot || !dataEl || typeof dialog.showModal !== "function")
    return;

  const output = dialog.querySelector<HTMLElement>("[data-terminal-output]")!;
  const form = dialog.querySelector<HTMLFormElement>("[data-terminal-form]")!;
  const input = dialog.querySelector<HTMLInputElement>(
    "[data-terminal-input]",
  )!;
  const body = dialog.querySelector<HTMLElement>("[data-terminal-body]")!;
  const closeButton = dialog.querySelector<HTMLButtonElement>(
    "[data-terminal-close]",
  )!;

  let data: TerminalData;
  try {
    data = JSON.parse(dataEl.textContent || "{}") as TerminalData;
  } catch {
    return; // keep the hotspot hidden: the terminal can't work without its data
  }

  const history = new History();
  let started = false;
  let closing = false;
  let universe: Universe | undefined;
  let locked = false;

  // ---- rendering ----------------------------------------------------------

  const renderLine = (ln: Line): HTMLElement => {
    const row = document.createElement("div");
    row.className = `term-row tone-${ln.tone ?? "default"}`;
    for (const seg of ln.segments) {
      if (typeof seg === "string") {
        row.append(document.createTextNode(seg));
      } else if (isSafeHref(seg.href)) {
        const a = document.createElement("a");
        a.textContent = seg.text;
        a.href = seg.href;
        if (seg.external) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          const hint = document.createElement("span");
          hint.className = "sr-only";
          hint.textContent = " (opens in a new tab)";
          a.append(hint);
        }
        row.append(a);
      } else {
        row.append(document.createTextNode(seg.text));
      }
    }
    return row;
  };

  const print = (lines: Line[]) => {
    const fragment = document.createDocumentFragment();
    for (const ln of lines) fragment.append(renderLine(ln));
    output.append(fragment);
    scrollToEnd();
  };

  const echo = (text: string) => {
    const row = document.createElement("div");
    row.className = "term-row term-echo";
    const prompt = document.createElement("span");
    prompt.className = "term-prompt";
    prompt.textContent = `${PROMPT} `;
    row.append(prompt, document.createTextNode(text));
    output.append(row);
  };

  const scrollToEnd = () => {
    body.scrollTop = body.scrollHeight;
  };

  const stopUniverse = () => {
    universe?.stop();
    universe = undefined;
  };

  // ---- commands -------------------------------------------------------------

  const execute = async (raw: string) => {
    echo(raw);
    history.push(raw);
    const result = runCommand(raw, { data, locale: navigator.language });

    if (result.action === "clear") {
      stopUniverse();
      output.replaceChildren();
      return;
    }
    print(result.lines);

    if (result.action === "universe") {
      stopUniverse();
      const host = document.createElement("div");
      host.className = "term-row";
      output.append(host);
      const { startUniverse } = await import("./universe");
      universe = startUniverse(host, { animate: motionAllowed() });
      scrollToEnd();
    } else if (result.action === "exit") {
      window.setTimeout(close, 350);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    void execute(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      input.value = history.previous(input.value);
      requestAnimationFrame(() =>
        input.setSelectionRange(input.value.length, input.value.length),
      );
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      input.value = history.next();
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      void execute("clear");
    }
  });

  // Clicking empty terminal space focuses the prompt (but not when selecting text or using links).
  body.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button") || window.getSelection()?.toString())
      return;
    input.focus({ preventScroll: true });
  });

  // ---- open / close -----------------------------------------------------------

  const lock = () => {
    if (locked) return;
    locked = true;
    lockScroll();
  };

  const unlock = () => {
    if (!locked) return;
    locked = false;
    unlockScroll();
  };

  /** Transform that places the window over the monitor, for the "emerge" effect. */
  const fromMonitor = (): string => {
    const from = hotspot.getBoundingClientRect();
    const to = dialog.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const scale = Math.max(
      0.12,
      Math.min(0.6, from.width / Math.max(1, to.width)),
    );
    return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(3)})`;
  };

  const open = () => {
    if (dialog.open) return;
    closing = false;
    dialog.showModal();
    lock();
    if (!started) {
      started = true;
      print(WELCOME);
    }
    input.focus({ preventScroll: true });
    scrollToEnd();

    if (motionAllowed()) {
      dialog.animate(
        [
          { opacity: 0, transform: fromMonitor() },
          { opacity: 1, transform: "none" },
        ],
        { duration: OPEN_MS, easing: EASE },
      );
    }
  };

  function close() {
    if (!dialog!.open || closing) return;
    closing = true;
    stopUniverse();
    if (!motionAllowed()) {
      dialog!.close();
      return;
    }
    const animation = dialog!.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: fromMonitor() },
      ],
      { duration: CLOSE_MS, easing: "ease-in", fill: "forwards" },
    );
    animation.onfinish = () => {
      dialog!.close();
      animation.cancel();
    };
  }

  dialog.addEventListener("close", () => {
    closing = false;
    stopUniverse();
    unlock();
    hotspot.focus({ preventScroll: true });
  });

  // Escape → animated close instead of the instant default.
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  // Click on the dimmed backdrop (outside the window) closes too.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  closeButton.addEventListener("click", close);
  hotspot.addEventListener("click", open);

  // Leaving the page (bfcache / navigation) must not leave the page locked.
  window.addEventListener("pagehide", () => {
    stopUniverse();
    if (dialog.open) dialog.close();
    unlock();
  });

  hotspot.hidden = false;
}
