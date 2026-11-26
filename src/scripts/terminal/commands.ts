/**
 * Simulated terminal: command registry.
 *
 * Pure functions, no DOM. Input is only ever matched against this fixed list of command names;
 * nothing is evaluated or executed. Output is structured data (text + vetted links), which the
 * UI renders with textContent — never innerHTML.
 */

export interface TerminalData {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  interests: string[];
  focus: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  email?: string;
  mediumProfileUrl?: string;
  projects: { title: string; description: string; href: string }[];
  articles: { title: string; url: string; date: string }[];
}

export type Tone =
  "default" | "muted" | "accent" | "warm" | "success" | "error";

export interface LinkSegment {
  text: string;
  href: string;
  /** Opens in a new tab (external sites). */
  external?: boolean;
}

export type Segment = string | LinkSegment;

export interface Line {
  segments: Segment[];
  tone?: Tone;
}

export type Action = "clear" | "exit" | "universe";

export interface CommandResult {
  lines: Line[];
  action?: Action;
}

export interface CommandContext {
  data: TerminalData;
  now?: Date;
  locale?: string;
  timeZone?: string;
}

interface CommandDef {
  name: string;
  summary: string;
  run: (ctx: CommandContext) => CommandResult;
}

export const PROMPT = "visitor@observatory:~$";
export const MAX_INPUT = 200;

const line = (text: string, tone?: Tone): Line => ({ segments: [text], tone });
const blank: Line = { segments: [""] };
const notConfigured = (what: string): CommandResult => ({
  lines: [line(`${what} is not configured yet.`, "muted")],
});
const linkLine = (label: string, href: string, external = true): Line => ({
  segments: [
    `${label} `,
    { text: href.replace(/^mailto:/, ""), href, external },
  ],
});

const DATE_STYLE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
};

const COMMANDS: CommandDef[] = [
  {
    name: "help",
    summary: "list available commands",
    run: () => ({
      lines: [
        line("Available commands:", "accent"),
        ...COMMANDS.map((c) => line(`  ${c.name.padEnd(10)} ${c.summary}`)),
        blank,
        line("Tip: use ↑ / ↓ to browse your command history.", "muted"),
      ],
    }),
  },
  {
    name: "whoami",
    summary: "who runs this observatory",
    run: ({ data }) => ({
      lines: [
        line(data.name, "accent"),
        line(data.role, "warm"),
        blank,
        line(data.tagline),
        line(data.bio, "muted"),
      ],
    }),
  },
  {
    name: "projects",
    summary: "portfolio projects",
    run: ({ data }) =>
      data.projects.length === 0
        ? { lines: [line("No projects published yet.", "muted")] }
        : {
            lines: [
              line(`${data.projects.length} project(s):`, "accent"),
              ...data.projects.flatMap((p) => [
                { segments: ["  → ", { text: p.title, href: p.href }] },
                line(`    ${p.description}`, "muted"),
              ]),
            ],
          },
  },
  {
    name: "interests",
    summary: "technical interests",
    run: ({ data }) => {
      const items = [...new Set([...data.focus, ...data.interests])];
      return items.length === 0
        ? { lines: [line("No interests configured yet.", "muted")] }
        : {
            lines: [
              ...(data.focus[0]
                ? [line(`Currently exploring: ${data.focus[0]}`, "success")]
                : []),
              ...data.interests.map((i) => line(`  * ${i}`)),
            ],
          };
    },
  },
  {
    name: "articles",
    summary: "articles on Medium",
    run: ({ data }) => {
      if (data.articles.length === 0) {
        return {
          lines: [
            line("No articles published yet.", "muted"),
            ...(data.mediumProfileUrl
              ? [linkLine("Medium:", data.mediumProfileUrl)]
              : []),
          ],
        };
      }
      return {
        lines: [
          line(`${data.articles.length} article(s) on Medium:`, "accent"),
          ...data.articles.map((a) => ({
            segments: [
              `  ${a.date}  `,
              { text: a.title, href: a.url, external: true },
            ],
          })),
        ],
      };
    },
  },
  {
    name: "github",
    summary: "GitHub profile",
    run: ({ data }) =>
      data.githubUrl
        ? { lines: [linkLine("GitHub:", data.githubUrl)] }
        : notConfigured("GitHub"),
  },
  {
    name: "linkedin",
    summary: "LinkedIn profile",
    run: ({ data }) =>
      data.linkedinUrl
        ? { lines: [linkLine("LinkedIn:", data.linkedinUrl)] }
        : notConfigured("LinkedIn"),
  },
  {
    name: "resume",
    summary: "download my CV",
    run: ({ data }) =>
      data.resumeUrl
        ? { lines: [linkLine("CV:", data.resumeUrl)] }
        : notConfigured("A CV"),
  },
  {
    name: "date",
    summary: "your local date and time",
    run: ({ now = new Date(), locale, timeZone }) => ({
      lines: [
        line(
          new Intl.DateTimeFormat(locale, { ...DATE_STYLE, timeZone }).format(
            now,
          ),
        ),
      ],
    }),
  },
  {
    name: "clear",
    summary: "clear the screen",
    run: () => ({ lines: [], action: "clear" }),
  },
  {
    name: "universe",
    summary: "a tiny star simulation",
    run: () => ({
      lines: [
        line("Booting a pocket universe… (runs for a few seconds)", "muted"),
      ],
      action: "universe",
    }),
  },
  {
    name: "exit",
    summary: "close the terminal",
    run: () => ({
      lines: [line("Goodbye. Keep looking up.", "muted")],
      action: "exit",
    }),
  },
];

export const COMMAND_NAMES = COMMANDS.map((c) => c.name);

export const WELCOME: Line[] = [
  line("Welcome to my digital observatory.", "accent"),
  blank,
  line("System: Cemal Gürsel Portfolio v1.0"),
  { segments: ["Status: ", "Online"], tone: "success" },
  blank,
  line("Type 'help' to explore.", "muted"),
];

/** Normalise raw input: trim, collapse spaces, cap length. */
export function normalizeInput(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_INPUT);
}

/** Run one line of input. Only the first word matters, case-insensitively. */
export function runCommand(raw: string, ctx: CommandContext): CommandResult {
  const input = normalizeInput(raw);
  if (!input) return { lines: [] };
  const name = input.split(" ")[0].toLowerCase();
  const command = COMMANDS.find((c) => c.name === name);
  if (!command) {
    return {
      lines: [
        line(`command not found: ${name.slice(0, 40)}`, "error"),
        line("Type 'help' to see what's available.", "muted"),
      ],
    };
  }
  return command.run(ctx);
}

/** Only these hrefs are ever rendered as links. */
export function isSafeHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return (
      url.protocol === "https:" ||
      url.protocol === "http:" ||
      url.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

/** Command history with ↑/↓ navigation (like a shell). */
export class History {
  private entries: string[] = [];
  private cursor = 0;
  private draft = "";

  constructor(private readonly limit = 50) {}

  push(entry: string): void {
    const value = normalizeInput(entry);
    if (value && this.entries.at(-1) !== value) {
      this.entries.push(value);
      if (this.entries.length > this.limit) this.entries.shift();
    }
    this.cursor = this.entries.length;
    this.draft = "";
  }

  /** ↑ — older entry. `current` is what's in the input now (kept as a draft). */
  previous(current: string): string {
    if (this.cursor === this.entries.length) this.draft = current;
    if (this.cursor > 0) this.cursor--;
    return this.entries[this.cursor] ?? current;
  }

  /** ↓ — newer entry, ending at the saved draft. */
  next(): string {
    if (this.cursor < this.entries.length) this.cursor++;
    return this.cursor === this.entries.length
      ? this.draft
      : this.entries[this.cursor];
  }
}
