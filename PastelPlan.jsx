import { useEffect, useRef, useState } from "react";
import {
  Sun,
  Clock,
  BookOpen,
  Users,
  PencilLine,
  Check,
  Plus,
  Sparkles,
  ClipboardList,
  Droplet,
  Wind,
  SignalHigh,
  BatteryFull,
  Paperclip,
  Link2,
  Image as ImageIcon,
  FileText,
  X,
  Palette,
} from "lucide-react";

const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // 3MB cap so localStorage doesn't blow up
const MAX_BG_BYTES = 4 * 1024 * 1024; // 4MB cap for the background photo

function uidAtt() {
  return "a" + Math.random().toString(36).slice(2, 9);
}

const COLOR_SWATCHES = [
  { key: "lavender", fill: "var(--pp-lavender)", ink: "var(--pp-lavender-ink)" },
  { key: "blush", fill: "var(--pp-blush)", ink: "var(--pp-blush-ink)" },
  { key: "sky", fill: "var(--pp-sky)", ink: "var(--pp-sky-ink)" },
  { key: "mint", fill: "var(--pp-mint)", ink: "var(--pp-mint-ink)" },
  { key: "gold", fill: "var(--pp-gold)", ink: "var(--pp-gold-ink)" },
  { key: "peach", fill: "var(--pp-peach)", ink: "var(--pp-peach-ink)" },
  { key: "lilac", fill: "var(--pp-lilac)", ink: "var(--pp-lilac-ink)" },
  { key: "seafoam", fill: "var(--pp-seafoam)", ink: "var(--pp-seafoam-ink)" },
];
function swatchByKey(key) {
  return COLOR_SWATCHES.find((s) => s.key === key);
}

const EMOJI_SETS = {
  animals: ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄", "🐔", "🐧", "🦋", "🐢", "🐝", "🐬", "🦖", "🐌"],
  plants: ["🌱", "🌿", "🍀", "🌸", "🌻", "🌷", "🌹", "🌼", "🍁", "🍂", "🌵", "🌴", "🌳", "🍄", "🌾", "🌺", "🌈", "🍃"],
  party: ["🎉", "🎊", "🎈", "🎂", "🎁", "🥳", "🎆", "🎇", "✨", "⭐️", "🌟", "🏆", "🥇", "🎯", "🎨", "🎵", "🍕", "🍩"],
  faces: ["😀", "😃", "😄", "😊", "🙂", "😉", "😍", "🤩", "😎", "🤔", "😴", "🥱", "😅", "😇", "🤗", "🙌", "👍", "💪"],
};
const EMOJI_TABS = [
  { key: "animals", tab: "🐻" },
  { key: "plants", tab: "🌿" },
  { key: "party", tab: "🎉" },
  { key: "faces", tab: "🙂" },
];

const FONT_STYLES = [
  { key: "warm", label: "Warm", preview: "'Fraunces Var', serif" },
  { key: "classic", label: "Classic", preview: "Georgia, serif" },
  { key: "rounded", label: "Rounded", preview: "ui-rounded, sans-serif" },
  { key: "clean", label: "Clean", preview: "system-ui, sans-serif" },
];
const FONT_STACKS = {
  warm: { display: "'Fraunces Var', ui-serif, Georgia, serif", body: "'Figtree Var', ui-sans-serif, -apple-system, 'Segoe UI', sans-serif" },
  classic: { display: "ui-serif, Georgia, 'Times New Roman', serif", body: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  rounded: { display: "ui-rounded, 'SF Pro Rounded', -apple-system, 'Segoe UI', sans-serif", body: "ui-rounded, 'SF Pro Rounded', -apple-system, 'Segoe UI', sans-serif" },
  clean: { display: "system-ui, -apple-system, 'Segoe UI', sans-serif", body: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
};
const FONT_SIZES = [
  { key: "sm", label: "Small", zoom: 0.9 },
  { key: "md", label: "Medium", zoom: 1 },
  { key: "lg", label: "Large", zoom: 1.15 },
];

/**
 * PastelPlan — a single-file mobile daily planner for teachers.
 * Drop into any React + Tailwind project. lucide-react is the only
 * external dependency. Fonts (Figtree, Fraunces) are self-hosted from
 * ./fonts — copy that folder alongside this component, or swap the
 * @font-face src urls for your own hosting/CDN.
 *
 * The timeline is fully editable (tap a block, or "+ Add block") and
 * everything — schedule, prep checklist, to-dos, water count —
 * autosaves to localStorage so it survives a refresh.
 */

const CATS = {
  class: { fill: "var(--pp-lavender)", ink: "var(--pp-lavender-ink)", label: "Class", Icon: BookOpen },
  duty: { fill: "var(--pp-blush)", ink: "var(--pp-blush-ink)", label: "Task", Icon: Users },
  prep: { fill: "var(--pp-sky)", ink: "var(--pp-sky-ink)", label: "Prep", Icon: PencilLine },
};
const CAT_ORDER = ["class", "duty", "prep"];

const DEFAULT_SCHEDULE = [
  { id: "s1", time24: "07:45", title: "Homeroom & Attendance", cat: "prep", done: false, sub: { title: "Update attendance in SIS", done: false } },
  { id: "s2", time24: "08:05", title: '7th Grade ELA · "The Giver" ch. 12', cat: "class", done: false, sub: { title: "Collect reading journals", done: false } },
  { id: "s3", time24: "09:00", title: "8th Grade ELA · Essay Workshop", cat: "class", done: false, sub: { title: "Pass back rubrics", done: false } },
  { id: "s4", time24: "09:50", title: "Hallway Duty", cat: "duty", done: false, sub: { title: "Check hall passes", done: false } },
  { id: "s5", time24: "10:10", title: "Planning Period", cat: "prep", done: false, sub: { title: "Prep Friday's quiz", done: false } },
  { id: "s6", time24: "11:05", title: "Lunch Duty · Cafeteria", cat: "duty", done: false, sub: { title: "Restock hand sanitizer table", done: false } },
  { id: "s7", time24: "11:50", title: "7th Grade ELA · Vocab Quiz", cat: "class", done: false, sub: { title: "Enter quiz grades", done: false } },
  { id: "s8", time24: "12:45", title: "8th Grade ELA · Reading Conferences", cat: "class", done: false, sub: { title: "Log conference notes", done: false } },
  { id: "s9", time24: "13:40", title: "Bus Duty", cat: "duty", done: false, sub: { title: "Radio check with front office", done: false } },
];

const PREP_ITEMS = ["Highlighters (3 colors)", "Peer-review rubric copies", "Visualizer / timer ready"];

const TODO_URGENT = [
  { id: "u1", text: "Submit field-trip permission count to office", due: "Due 3:00 PM" },
  { id: "u2", text: "Email Mr. Alvarez re: IEP accommodation, period 3" },
];

const TODO_LATER = [
  { id: "l1", text: "Grade today's exit tickets — 7th grade" },
  { id: "l2", text: "Print Friday's quiz masters" },
];

const QUOTES = [
  "You don't have to finish the whole list today — just the next right thing.",
  "A calm teacher makes a calm room. Breathe before period one.",
  "Progress, not a perfect lesson plan.",
  "Small steps, every period.",
  "You already know more than the to-do list gives you credit for.",
];

const WATER_GOAL = 8;

function fmtTime(time24) {
  const [hh, mm] = time24.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return { num: `${h12}:${String(mm).padStart(2, "0")}`, ampm };
}

function uid() {
  return "s" + Math.random().toString(36).slice(2, 9);
}

/** Persists to localStorage under `key`; falls back to `initial` (or a factory) when nothing's stored yet or storage is unavailable. */
function useLocalStorageState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = typeof window !== "undefined" && window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : typeof initial === "function" ? initial() : initial;
    } catch {
      return typeof initial === "function" ? initial() : initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (e.g. private browsing) — edits just won't persist */
    }
  }, [key, value]);
  return [value, setValue];
}

function useToggleSet(initial = []) {
  const [set, setSet] = useState(new Set(initial));
  const toggle = (id) =>
    setSet((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  return [set, toggle];
}

function CheckBox({ checked, onClick, size = 22, tone = "var(--pp-line)", label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onClick}
      className="grid shrink-0 place-items-center rounded-[7px] border-[1.75px] transition-all duration-150"
      style={{
        width: size,
        height: size,
        borderColor: checked ? tone : "var(--pp-line)",
        background: checked ? tone : "transparent",
        color: checked ? "var(--pp-surface)" : "transparent",
      }}
    >
      <Check
        size={Math.round(size * 0.6)}
        strokeWidth={3}
        className={checked ? "scale-100" : "scale-50"}
        style={{ transition: "transform .18s cubic-bezier(.34,1.56,.64,1)" }}
      />
    </button>
  );
}

export default function PastelPlan() {
  const [now, setNow] = useState(new Date());
  const [schedule, setSchedule] = useLocalStorageState("pastelplan.schedule.v1", () =>
    DEFAULT_SCHEDULE.map((x) => ({ ...x }))
  );
  const [editingId, setEditingId] = useState(null);
  const [prepChecked, togglePrep] = useToggleSet();
  const [todoChecked, toggleTodo] = useToggleSet();
  const [waterFilled, setWaterFilled] = useLocalStorageState("pastelplan.water.v1", 0);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("in");
  const breathTimer = useRef(null);
  const [customize, setCustomize] = useLocalStorageState("pastelplan.customize.v1", { bgPhoto: null, fontStyle: "warm", fontSize: "md" });
  const [showCustomize, setShowCustomize] = useState(false);
  const fontStack = FONT_STACKS[customize.fontStyle] || FONT_STACKS.warm;
  const zoom = (FONT_SIZES.find((f) => f.key === customize.fontSize) || FONT_SIZES[1]).zoom;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (breathing) {
      setBreathPhase("in");
      breathTimer.current = setInterval(() => {
        setBreathPhase((p) => (p === "in" ? "out" : "in"));
      }, 4000);
    } else {
      clearInterval(breathTimer.current);
    }
    return () => clearInterval(breathTimer.current);
  }, [breathing]);

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dateLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  const clock = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const sortedSchedule = [...schedule].sort((a, b) => a.time24.localeCompare(b.time24));
  const leftCount = schedule.filter((s) => !s.done).length;

  function toggleDone(id) {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }
  function toggleSub(id) {
    setSchedule((prev) => prev.map((s) => (s.id === id && s.sub ? { ...s, sub: { ...s.sub, done: !s.sub.done } } : s)));
  }
  function updateItem(id, patch) {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function deleteItem(id) {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    setEditingId(null);
  }
  function addBlock() {
    const time24 = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const item = { id: uid(), time24, title: "", cat: "prep", done: false };
    setSchedule((prev) => [...prev, item]);
    setEditingId(item.id);
  }
  function saveEdit(id, { time24, title, cat, sub, attachments, color, emoji }) {
    const trimmed = title.trim();
    if (!trimmed) {
      // discard blank new/edited blocks instead of saving an empty title
      setSchedule((prev) => prev.filter((s) => s.id !== id || (s.title || "").trim() !== ""));
      setEditingId(null);
      return;
    }
    updateItem(id, { time24, title: trimmed, cat, sub, attachments, color, emoji });
    setEditingId(null);
  }
  function cancelEdit(id, wasNew) {
    if (wasNew) setSchedule((prev) => prev.filter((s) => s.id !== id));
    setEditingId(null);
  }

  const wrapperStyle = {
    "--pp-font-display-override": fontStack.display,
    "--pp-font-body-override": fontStack.body,
    ...(customize.bgPhoto
      ? {
          backgroundImage: `linear-gradient(color-mix(in srgb, var(--pp-paper) 45%, transparent), color-mix(in srgb, var(--pp-paper) 45%, transparent)), url(${customize.bgPhoto})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
  };

  return (
    <div className="flex min-h-screen justify-center bg-[var(--pp-paper)] px-3.5 py-7" style={wrapperStyle}>
      <PastelPlanStyles />

      <div className="flex w-full max-w-[402px] flex-col overflow-hidden rounded-[34px] bg-[var(--pp-frame)] shadow-[0_1px_2px_rgba(30,20,40,.15),0_18px_40px_-12px_rgba(30,20,40,.35)]" style={{ zoom }}>
        {/* status bar */}
        <div className="flex items-center justify-between px-6 pb-1 pt-3 font-semibold text-[13px] tabular-nums text-[var(--pp-ink)]">
          <span>{clock}</span>
          <div className="flex items-center gap-1.5">
            <SignalHigh size={16} strokeWidth={2} />
            <BatteryFull size={18} strokeWidth={1.6} />
          </div>
        </div>

        {/* header */}
        <header className="pp-header relative overflow-hidden px-5.5 pb-5.5 pt-1.5">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--pp-ink-soft)]">
                {dayName} · SAMPLE DAY
              </div>
              <h1
                className="pp-font-display mt-1 text-[2rem] font-semibold leading-[1.05] text-[var(--pp-ink)]"
                style={{ textWrap: "balance" }}
              >
                {dateLabel}
              </h1>
              <p className="pp-font-display mt-3 border-l-2 border-[var(--pp-lavender-ink)]/60 pl-3.5 text-[0.95rem] italic leading-[1.4] text-[var(--pp-ink-soft)]">
                "{quote}"
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowCustomize(true)}
                aria-label="Customize planner"
                className="relative grid h-11 w-11 place-items-center rounded-2xl border-[1.5px] text-[var(--pp-ink-soft)]"
                style={{ background: "color-mix(in srgb, var(--pp-surface) 70%, transparent)", borderColor: "color-mix(in srgb, var(--pp-ink) 10%, transparent)" }}
              >
                <Palette size={19} strokeWidth={1.8} />
              </button>
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[var(--pp-gold-ink)] shadow-[0_6px_14px_-6px_rgba(30,20,40,.4)]"
                style={{ background: "linear-gradient(155deg, var(--pp-gold), color-mix(in srgb, var(--pp-gold) 55%, var(--pp-blush)))" }}
              >
                <Sun size={22} strokeWidth={1.9} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-col gap-5 px-4.5 pb-1.5 pt-4.5">
          {/* TIMELINE */}
          <section>
            <SectionTitle icon={Clock} fill="var(--pp-lavender)" ink="var(--pp-lavender-ink)" title="Today's Timeline" trailing={`${leftCount} left`} />
            <p className="-mt-1.5 mb-2.5 text-[0.72rem] font-medium text-[var(--pp-ink-soft)]">Tap a block to edit it</p>
            <div className="flex flex-col">
              {sortedSchedule.map((item, i) => (
                <TimelineRow
                  key={item.id}
                  item={item}
                  isFirst={i === 0}
                  isLast={i === sortedSchedule.length - 1}
                  editing={editingId === item.id}
                  onToggleDone={() => toggleDone(item.id)}
                  onToggleSub={() => toggleSub(item.id)}
                  onStartEdit={() => setEditingId(item.id)}
                  onSave={(patch) => saveEdit(item.id, patch)}
                  onCancel={() => cancelEdit(item.id, item.title.trim() === "")}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addBlock}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--pp-line)] py-3 text-[0.8rem] font-bold text-[var(--pp-ink-soft)] transition-transform active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.2} /> Add block
            </button>
          </section>

          {/* PREP & HOOK */}
          <section>
            <SectionTitle icon={PencilLine} fill="var(--pp-gold)" ink="var(--pp-gold-ink)" title="Rush Prep & Hook" />
            <div className="pp-card">
              <p className="mb-3 text-[0.8rem] leading-[1.45] text-[var(--pp-ink-soft)]">
                <b className="font-semibold text-[var(--pp-ink)]">Period 3 · Argument Essay Workshop</b>
                <br />
                Objective: students identify claim, evidence &amp; reasoning in a peer's draft.
              </p>
              <ul className="mb-3 flex flex-col gap-1.5">
                {PREP_ITEMS.map((text) => {
                  const checked = prepChecked.has(text);
                  return (
                    <li key={text} className="flex cursor-pointer select-none items-center gap-2.5" onClick={() => togglePrep(text)}>
                      <CheckBox checked={checked} onClick={() => togglePrep(text)} size={19} tone="var(--pp-sky-ink)" label={text} />
                      <span
                        className="text-[0.82rem] font-medium text-[var(--pp-ink)]"
                        style={checked ? { color: "var(--pp-ink-soft)", textDecoration: "line-through" } : undefined}
                      >
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-start gap-2.5 rounded-[14px] bg-[var(--pp-gold)] px-3 py-2.5">
                <Sparkles size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[var(--pp-gold-ink)]" />
                <div>
                  <p className="mb-0.5 text-[0.66rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-gold-ink)]">Warm-up hook</p>
                  <p className="text-[0.83rem] font-medium leading-[1.42] text-[color:color-mix(in_srgb,var(--pp-gold-ink)_70%,var(--pp-ink))]">
                    Project one line and ask: is this a fact or an opinion — and how could you prove it?
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TO-DO MATRIX */}
          <section>
            <SectionTitle icon={ClipboardList} fill="var(--pp-blush)" ink="var(--pp-blush-ink)" title="To-Do Matrix" />
            <div className="pp-card">
              <TodoGroup label="Handle today" dotColor="var(--pp-blush-ink)" items={TODO_URGENT} checked={todoChecked} onToggle={toggleTodo} />
              <div className="mt-3.5">
                <TodoGroup label="Can wait this week" dotColor="var(--pp-ink-soft)" items={TODO_LATER} checked={todoChecked} onToggle={toggleTodo} />
              </div>
            </div>
          </section>

          {/* WELLNESS */}
          <section>
            <SectionTitle icon={Droplet} fill="var(--pp-mint)" ink="var(--pp-mint-ink)" title="Wellness Break" />
            <div className="pp-card" style={{ background: "linear-gradient(165deg, var(--pp-surface), var(--pp-surface-alt))" }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.78rem] font-semibold text-[var(--pp-ink)]">Hydration goal · {WATER_GOAL} cups</span>
                <span className="text-[0.78rem] font-bold tabular-nums text-[var(--pp-sky-ink)]">
                  {waterFilled} / {WATER_GOAL}
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {Array.from({ length: WATER_GOAL }).map((_, i) => {
                  const filled = i < waterFilled;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Log cup ${i + 1}`}
                      onClick={() => setWaterFilled(i < waterFilled ? i : i + 1)}
                      className="transition-transform duration-150 active:scale-90"
                      style={{ color: filled ? "var(--pp-sky-ink)" : "var(--pp-line)", transform: filled ? "scale(1.06)" : undefined }}
                    >
                      <Droplet size={26} strokeWidth={2} fill={filled ? "currentColor" : "none"} fillOpacity={0.18} />
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 border-t border-dashed border-[var(--pp-line)] pt-3.5">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center">
                  <span
                    className="pp-breathe-pulse absolute inset-0 rounded-full"
                    style={{
                      background: "color-mix(in srgb, var(--pp-mint) 70%, transparent)",
                      animationPlayState: breathing ? "running" : "paused",
                    }}
                  />
                  <span
                    className="relative grid h-10 w-10 place-items-center rounded-full text-[var(--pp-surface)] shadow-[0_4px_10px_-3px_rgba(30,20,40,.5)]"
                    style={{ background: "var(--pp-mint-ink)" }}
                  >
                    <Wind size={17} strokeWidth={2} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[0.83rem] font-bold text-[var(--pp-ink)]">60-second Breather</p>
                  <p className="mb-2 text-[0.76rem] font-medium text-[var(--pp-ink-soft)]">
                    {breathing ? (breathPhase === "in" ? "Breathe in…" : "Breathe out…") : "Tap start between periods"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setBreathing((b) => !b)}
                    className="rounded-[10px] px-3.5 py-1.5 text-[0.76rem] font-bold transition-transform active:scale-95"
                    style={
                      breathing
                        ? { background: "transparent", color: "var(--pp-ink-soft)", border: "1.5px solid var(--pp-line)" }
                        : { background: "var(--pp-mint-ink)", color: "var(--pp-surface)", border: "1.5px solid transparent" }
                    }
                  >
                    {breathing ? "Stop" : "Start"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="px-5 pb-1 pt-3.5 text-center text-[0.68rem] font-semibold tracking-[.02em] text-[var(--pp-ink-soft)]">
          PastelPlan · made for the space between periods
        </footer>
        <p className="px-5 pb-5.5 text-center text-[0.62rem] font-bold tracking-[.04em] text-[var(--pp-ink-soft)] opacity-60">jvtcordova</p>
      </div>

      {showCustomize && <CustomizeSheet customize={customize} setCustomize={setCustomize} onClose={() => setShowCustomize(false)} />}
    </div>
  );
}

function CustomizeSheet({ customize, setCustomize, onClose }) {
  const bgInputRef = useRef(null);

  function handleBgFile(file) {
    if (!file) return;
    if (file.size > MAX_BG_BYTES) {
      alert("That photo is over 4MB — try a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCustomize((prev) => ({ ...prev, bgPhoto: reader.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[84vh] w-full max-w-[402px] overflow-y-auto rounded-t-[24px] bg-[var(--pp-surface)] px-5 pb-6 pt-2.5 shadow-[0_-10px_30px_-8px_rgba(30,20,40,.4)]">
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-[var(--pp-line)]" />
        <h3 className="pp-font-display mb-4 text-[1.1rem] font-semibold text-[var(--pp-ink)]">Customize</h3>

        <section className="mb-4.5">
          <p className="mb-2.5 text-[0.72rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Background photo</p>
          <button
            type="button"
            onClick={() => bgInputRef.current?.click()}
            className="flex w-full items-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--pp-line)] px-3.5 py-2.5 text-[0.8rem] font-bold text-[var(--pp-ink-soft)]"
          >
            <ImageIcon size={15} strokeWidth={1.8} /> Upload your own photo
          </button>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleBgFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
          {customize.bgPhoto && (
            <div className="relative mt-2.5 h-24 overflow-hidden rounded-[14px]">
              <img src={customize.bgPhoto} alt="Custom background" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove background photo"
                onClick={() => setCustomize((prev) => ({ ...prev, bgPhoto: null }))}
                className="absolute right-1.5 top-1.5 grid h-6.5 w-6.5 place-items-center rounded-full bg-black/55 text-white"
              >
                <X size={13} strokeWidth={2.4} />
              </button>
            </div>
          )}
        </section>

        <section className="mb-4.5">
          <p className="mb-2.5 text-[0.72rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Font style</p>
          <div className="flex flex-wrap gap-2">
            {FONT_STYLES.map((f) => {
              const active = customize.fontStyle === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setCustomize((prev) => ({ ...prev, fontStyle: f.key }))}
                  style={{
                    fontFamily: f.preview,
                    background: active ? "var(--pp-lavender)" : "transparent",
                    borderColor: active ? "var(--pp-lavender)" : "var(--pp-line)",
                    color: active ? "var(--pp-lavender-ink)" : "var(--pp-ink-soft)",
                  }}
                  className="rounded-full border-[1.5px] px-3.5 py-2 text-[0.78rem] font-bold"
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-4.5">
          <p className="mb-2.5 text-[0.72rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Text size</p>
          <div className="flex flex-wrap gap-2">
            {FONT_SIZES.map((f) => {
              const active = customize.fontSize === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setCustomize((prev) => ({ ...prev, fontSize: f.key }))}
                  style={{
                    background: active ? "var(--pp-lavender)" : "transparent",
                    borderColor: active ? "var(--pp-lavender)" : "var(--pp-line)",
                    color: active ? "var(--pp-lavender-ink)" : "var(--pp-ink-soft)",
                  }}
                  className="rounded-full border-[1.5px] px-3.5 py-2 text-[0.78rem] font-bold"
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="mt-1 w-full rounded-[14px] bg-[var(--pp-mint-ink)] py-3.5 text-[0.88rem] font-bold text-[var(--pp-surface)]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function TimelineRow({ item, isFirst, isLast, editing, onToggleDone, onToggleSub, onStartEdit, onSave, onCancel, onDelete }) {
  const [draftTime, setDraftTime] = useState(item.time24);
  const [draftTitle, setDraftTitle] = useState(item.title);
  const [draftCat, setDraftCat] = useState(item.cat);
  const [draftSub, setDraftSub] = useState(item.sub?.title || "");
  const [draftSubColor, setDraftSubColor] = useState(item.sub?.color || "");
  const [draftColor, setDraftColor] = useState(item.color || "");
  const [draftEmoji, setDraftEmoji] = useState(item.emoji || "");
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [emojiTab, setEmojiTab] = useState("animals");
  const [draftAttachments, setDraftAttachments] = useState(item.attachments || []);
  const [showLinkRow, setShowLinkRow] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);
  const linkInputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setDraftTime(item.time24);
      setDraftTitle(item.title);
      setDraftCat(item.cat);
      setDraftSub(item.sub?.title || "");
      setDraftSubColor(item.sub?.color || "");
      setDraftColor(item.color || "");
      setDraftEmoji(item.emoji || "");
      setShowEmojiPanel(false);
      setEmojiTab("animals");
      setDraftAttachments(item.attachments || []);
      setShowLinkRow(false);
      setLinkValue("");
      // new blocks start with an empty title — focus so typing can start immediately
      if (!item.title) setTimeout(() => titleRef.current?.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function handleFiles(files) {
    [...files].forEach((file) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        alert(`"${file.name}" is over 3MB — try a smaller file.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDraftAttachments((prev) => [
          ...prev,
          { id: uidAtt(), type: file.type.startsWith("image/") ? "image" : "file", label: file.name, url: reader.result },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  function addLink() {
    const url = linkValue.trim();
    if (!url) return;
    const label = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const href = /^https?:\/\//.test(url) ? url : "https://" + url;
    setDraftAttachments((prev) => [...prev, { id: uidAtt(), type: "link", label, url: href }]);
    setLinkValue("");
    setShowLinkRow(false);
  }

  if (editing) {
    return (
      <div className="pp-row-grid relative grid gap-x-0.5 px-0.5 py-2.5">
        <div className="pp-card !p-3" style={{ gridColumn: "1 / -1" }}>
          <div className="mb-2 flex items-center gap-2">
            <input
              type="time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              className="w-[122px] shrink-0 rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] px-2 py-1.5 text-[0.8rem] font-bold tabular-nums text-[var(--pp-ink)]"
            />
            <div className="flex flex-1 gap-1.5">
              {CAT_ORDER.map((c) => {
                const cat = CATS[c];
                const active = draftCat === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraftCat(c)}
                    className="flex-1 rounded-full border-[1.5px] py-1.5 text-[0.66rem] font-bold uppercase tracking-[.02em] transition-all"
                    style={{
                      background: active ? cat.fill : "transparent",
                      color: active ? cat.ink : "var(--pp-ink-soft)",
                      borderColor: active ? cat.fill : "var(--pp-line)",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            ref={titleRef}
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="What's happening?"
            className="mb-2 w-full rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] px-2.5 py-2 text-[0.83rem] font-medium text-[var(--pp-ink)]"
          />
          <input
            type="text"
            value={draftSub}
            onChange={(e) => setDraftSub(e.target.value)}
            placeholder="Sub-block (optional)"
            className="mb-2 w-full rounded-[10px] border-[1.5px] border-dashed border-[var(--pp-line)] bg-[var(--pp-paper)] px-2.5 py-2 text-[0.8rem] font-medium text-[var(--pp-ink)]"
          />
          <div className="mb-2.5 ml-10 flex flex-wrap gap-1">
            <ColorSwatchRow size={17} value={draftSubColor} onChange={setDraftSubColor} />
          </div>

          <p className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Color</p>
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <ColorSwatchRow size={26} value={draftColor} onChange={setDraftColor} />
          </div>

          <p className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Icon</p>
          <div className="mb-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPanel((v) => !v)}
              className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] text-[17px]"
            >
              {draftEmoji || <CurrentCatIcon cat={draftCat} />}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftEmoji("");
                setShowEmojiPanel(false);
              }}
              className="rounded-full border-[1.5px] border-[var(--pp-line)] px-3 py-1.5 text-[0.72rem] font-bold text-[var(--pp-ink-soft)]"
            >
              Default icon
            </button>
          </div>
          {showEmojiPanel && (
            <div className="mb-2.5 rounded-[14px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] p-2.5">
              <div className="mb-2 flex gap-1.5">
                {EMOJI_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setEmojiTab(t.key)}
                    className="flex-1 rounded-[10px] border-[1.5px] py-1.5 text-[15px]"
                    style={{
                      background: emojiTab === t.key ? "var(--pp-lavender)" : "var(--pp-surface)",
                      borderColor: emojiTab === t.key ? "var(--pp-lavender-ink)" : "var(--pp-line)",
                    }}
                  >
                    {t.tab}
                  </button>
                ))}
              </div>
              <div className="grid max-h-[132px] grid-cols-7 gap-1 overflow-y-auto">
                {EMOJI_SETS[emojiTab].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setDraftEmoji(e);
                      setShowEmojiPanel(false);
                    }}
                    className="rounded-[8px] py-1 text-[19px] active:bg-[var(--pp-surface-alt)]"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[var(--pp-line)] px-2.5 py-1.5 text-[0.72rem] font-bold text-[var(--pp-ink-soft)]"
            >
              <Paperclip size={13} strokeWidth={2} /> Attach
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkRow((v) => !v);
                setTimeout(() => linkInputRef.current?.focus(), 0);
              }}
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[var(--pp-line)] px-2.5 py-1.5 text-[0.72rem] font-bold text-[var(--pp-ink-soft)]"
            >
              <Link2 size={13} strokeWidth={2} /> Link
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.txt,.csv"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {showLinkRow && (
            <div className="mb-2 flex items-center gap-1.5">
              <input
                ref={linkInputRef}
                type="url"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLink()}
                placeholder="https://..."
                className="flex-1 rounded-[9px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] px-2.5 py-1.5 text-[0.78rem] text-[var(--pp-ink)]"
              />
              <button type="button" onClick={addLink} className="rounded-[9px] bg-[var(--pp-sky-ink)] px-3 py-1.5 text-[0.72rem] font-bold text-[var(--pp-surface)]">
                Add
              </button>
            </div>
          )}
          {draftAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {draftAttachments.map((a) => (
                <AttachmentChip key={a.id} attachment={a} onRemove={() => setDraftAttachments((prev) => prev.filter((x) => x.id !== a.id))} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onDelete} className="px-1 py-1.5 text-[0.74rem] font-bold text-[var(--pp-blush-ink)]">
              Delete
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[9px] border-[1.5px] border-[var(--pp-line)] px-3 py-1.5 text-[0.74rem] font-bold text-[var(--pp-ink-soft)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                onSave({
                  time24: draftTime,
                  title: draftTitle,
                  cat: draftCat,
                  sub: draftSub.trim()
                    ? { title: draftSub.trim(), done: item.sub?.done || false, color: draftSubColor || null }
                    : null,
                  attachments: draftAttachments,
                  color: draftColor || null,
                  emoji: draftEmoji || null,
                })
              }
              className="rounded-[9px] bg-[var(--pp-mint-ink)] px-3.5 py-1.5 text-[0.74rem] font-bold text-[var(--pp-surface)]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cat = CATS[item.cat];
  const Icon = cat.Icon;
  const t = fmtTime(item.time24);
  const customColor = item.color ? swatchByKey(item.color) : null;
  const fillColor = customColor ? customColor.fill : cat.fill;
  const inkColor = customColor ? customColor.ink : cat.ink;
  const subSwatch = item.sub?.color ? swatchByKey(item.sub.color) : null;

  return (
    <div className="pp-row-grid relative grid gap-x-0.5 px-0.5 py-2.5">
      <div className="pr-2 text-right text-[0.72rem] font-bold leading-tight text-[var(--pp-ink-soft)] tabular-nums">
        <div>{t.num}</div>
        <div>{t.ampm}</div>
      </div>
      <div className="relative flex justify-center">
        <span className={`pp-rail-line ${isFirst ? "first" : ""} ${isLast ? "last" : ""}`} aria-hidden="true" />
        <span className="relative z-[1] mt-1 h-[11px] w-[11px] rounded-full border-2" style={{ borderColor: "var(--pp-surface)", boxShadow: `0 0 0 1.5px ${inkColor}` }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          role="button"
          tabIndex={0}
          onClick={onStartEdit}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStartEdit()}
          className="flex cursor-pointer items-center gap-2.5 rounded-[14px] border px-2.5 py-2.5 transition-opacity duration-150"
          style={{ borderColor: "var(--pp-line)", opacity: item.done ? 0.55 : 1 }}
        >
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[10px] text-[16px] leading-none" style={{ background: fillColor, color: inkColor }}>
            {item.emoji || <Icon size={16} strokeWidth={1.9} />}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block truncate text-[0.83rem] font-semibold text-[var(--pp-ink)]"
              style={item.done ? { textDecoration: "line-through", textDecorationColor: "var(--pp-ink-soft)" } : undefined}
            >
              {item.title}
            </span>
            <span className="text-[0.66rem] font-bold uppercase tracking-[.03em]" style={{ color: inkColor }}>
              {cat.label}
            </span>
          </span>
          <CheckBox
            checked={item.done}
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone();
            }}
            size={24}
            tone="var(--pp-mint-ink)"
            label={`Mark ${item.title} done`}
          />
        </div>
        {item.attachments?.length > 0 && (
          <div className="ml-10 flex flex-wrap gap-1.5">
            {item.attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} onOpen={() => window.open(a.url, "_blank", "noopener")} />
            ))}
          </div>
        )}
        {item.sub?.title && (
          <div
            className="ml-10 flex min-h-[26px] items-center gap-2 border-l-2 border-dashed pl-2.5"
            style={{ borderColor: subSwatch ? subSwatch.ink : "var(--pp-line)" }}
          >
            <CheckBox
              checked={item.sub.done}
              onClick={onToggleSub}
              size={18}
              tone={subSwatch ? subSwatch.ink : "var(--pp-mint-ink)"}
              label={`Mark ${item.sub.title} done`}
            />
            <span
              className="text-[0.76rem] font-medium text-[var(--pp-ink-soft)]"
              style={item.sub.done ? { textDecoration: "line-through" } : undefined}
            >
              {item.sub.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorSwatchRow({ value, onChange, size = 24 }) {
  return (
    <>
      {COLOR_SWATCHES.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          aria-label={s.key}
          className="rounded-full border-2"
          style={{ width: size, height: size, background: s.fill, borderColor: value === s.key ? "var(--pp-ink)" : "transparent" }}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Default color"
        className="grid place-items-center rounded-full border-[1.5px] border-dashed border-[var(--pp-line)] bg-[var(--pp-paper)] text-[var(--pp-ink-soft)]"
        style={{ width: size, height: size }}
      >
        <X size={Math.round(size * 0.42)} strokeWidth={2.2} />
      </button>
    </>
  );
}

function CurrentCatIcon({ cat }) {
  const Icon = CATS[cat].Icon;
  return <Icon size={17} strokeWidth={1.9} />;
}

function AttachmentChip({ attachment, onRemove, onOpen }) {
  const TypeIcon = attachment.type === "link" ? Link2 : attachment.type === "image" ? ImageIcon : FileText;
  return (
    <span
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      title={attachment.label}
      className="flex max-w-[168px] items-center gap-1.5 rounded-full border border-[var(--pp-line)] bg-[var(--pp-paper)] py-[3px] pl-[3px] pr-2.5 text-[0.7rem] font-semibold text-[var(--pp-ink)]"
      style={onOpen ? { cursor: "pointer" } : undefined}
    >
      {attachment.type === "image" && attachment.url ? (
        <img src={attachment.url} alt="" className="h-[18px] w-[18px] shrink-0 rounded-[5px] object-cover" />
      ) : (
        <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px]" style={{ background: "var(--pp-sky)", color: "var(--pp-sky-ink)" }}>
          <TypeIcon size={11} strokeWidth={2} />
        </span>
      )}
      <span className="truncate">{attachment.label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 text-[var(--pp-ink-soft)]"
        >
          <X size={12} strokeWidth={2.4} />
        </span>
      )}
    </span>
  );
}

function SectionTitle({ icon: Icon, fill, ink, title, trailing }) {
  return (
    <h2 className="pp-font-display mb-2.5 flex items-center gap-2 text-[1.02rem] font-semibold text-[var(--pp-ink)]">
      <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[9px]" style={{ background: fill, color: ink }}>
        <Icon size={15} strokeWidth={2} />
      </span>
      {title}
      {trailing && <small className="ml-auto text-[0.72rem] font-semibold tracking-[.02em] text-[var(--pp-ink-soft)]">{trailing}</small>}
    </h2>
  );
}

function TodoGroup({ label, dotColor, items, checked, onToggle }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dotColor }} />
        <span className="text-[0.72rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">{label}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <li key={item.id} className="flex cursor-pointer select-none items-start gap-2.5" onClick={() => onToggle(item.id)}>
              <CheckBox checked={isChecked} onClick={() => onToggle(item.id)} size={20} tone="var(--pp-mint-ink)" label={item.text} />
              <p
                className="text-[0.83rem] font-medium leading-[1.38] text-[var(--pp-ink)]"
                style={isChecked ? { color: "var(--pp-ink-soft)", textDecoration: "line-through" } : undefined}
              >
                {item.text}
                {item.due && <span className="mt-0.5 block text-[0.7rem] font-semibold text-[var(--pp-ink-soft)]">{item.due}</span>}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Design tokens, fonts, and the handful of rules Tailwind utilities can't express (grid track, keyframes). */
function PastelPlanStyles() {
  return (
    <style>{`
      @font-face {
        font-family: 'Figtree Var';
        src: url('./fonts/figtree.woff2') format('woff2');
        font-weight: 300 800; font-style: normal; font-display: swap;
      }
      @font-face {
        font-family: 'Fraunces Var';
        src: url('./fonts/fraunces-normal.woff2') format('woff2');
        font-weight: 300 900; font-style: normal; font-display: swap;
      }
      @font-face {
        font-family: 'Fraunces Var';
        src: url('./fonts/fraunces-italic.woff2') format('woff2');
        font-weight: 300 900; font-style: italic; font-display: swap;
      }

      :root {
        --pp-paper: #F8F3F6; --pp-frame: #FFFFFF; --pp-surface: #FFFFFF; --pp-surface-alt: #F3ECFA;
        --pp-ink: #3D3450; --pp-ink-soft: #7A7189; --pp-line: #ECE2F0;
        --pp-lavender: #E1D6F7; --pp-lavender-ink: #6B579E;
        --pp-blush: #F8D6E1; --pp-blush-ink: #B4587B;
        --pp-sky: #D2ECF8; --pp-sky-ink: #3E7C9A;
        --pp-mint: #D3F0E0; --pp-mint-ink: #33936B;
        --pp-gold: #F7E7BE; --pp-gold-ink: #9C7A24;
        --pp-peach: #FBDCC6; --pp-peach-ink: #C97A3D;
        --pp-lilac: #E8D6F5; --pp-lilac-ink: #8B5FB0;
        --pp-seafoam: #CFF0E8; --pp-seafoam-ink: #2E9C82;
      }
      @media (prefers-color-scheme: dark) {
        :root:not([data-theme="light"]) {
          --pp-paper: #1E1926; --pp-frame: #251F2E; --pp-surface: #2A2334; --pp-surface-alt: #322A40;
          --pp-ink: #F2ECF8; --pp-ink-soft: #B3A7C4; --pp-line: #3B3247;
          --pp-lavender: #4A3D73; --pp-lavender-ink: #CBBBF2;
          --pp-blush: #5C3245; --pp-blush-ink: #F1B1C6;
          --pp-sky: #294C5C; --pp-sky-ink: #9FDCF3;
          --pp-mint: #274A3B; --pp-mint-ink: #90E1BC;
          --pp-gold: #493D22; --pp-gold-ink: #E9CA7A;
          --pp-peach: #4A3323; --pp-peach-ink: #F0B27E;
          --pp-lilac: #3E2E52; --pp-lilac-ink: #D3AEEF;
          --pp-seafoam: #234238; --pp-seafoam-ink: #7EE0C4;
        }
      }
      :root[data-theme="dark"] {
        --pp-paper: #1E1926; --pp-frame: #251F2E; --pp-surface: #2A2334; --pp-surface-alt: #322A40;
        --pp-ink: #F2ECF8; --pp-ink-soft: #B3A7C4; --pp-line: #3B3247;
        --pp-lavender: #4A3D73; --pp-lavender-ink: #CBBBF2;
        --pp-blush: #5C3245; --pp-blush-ink: #F1B1C6;
        --pp-sky: #294C5C; --pp-sky-ink: #9FDCF3;
        --pp-mint: #274A3B; --pp-mint-ink: #90E1BC;
        --pp-gold: #493D22; --pp-gold-ink: #E9CA7A;
        --pp-peach: #4A3323; --pp-peach-ink: #F0B27E;
        --pp-lilac: #3E2E52; --pp-lilac-ink: #D3AEEF;
        --pp-seafoam: #234238; --pp-seafoam-ink: #7EE0C4;
      }

      .pp-font-display { font-family: var(--pp-font-display-override, 'Fraunces Var', ui-serif, Georgia, serif); }
      .pp-header, main, footer, button, input { font-family: var(--pp-font-body-override, 'Figtree Var', ui-sans-serif, -apple-system, 'Segoe UI', sans-serif); }

      .pp-header { background: var(--pp-surface-alt); }
      .pp-header::after {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(220px 140px at 106% -20%, color-mix(in srgb, var(--pp-blush) 55%, transparent), transparent),
          radial-gradient(180px 140px at -10% 120%, color-mix(in srgb, var(--pp-sky) 55%, transparent), transparent);
      }

      .pp-card { background: var(--pp-surface); border: 1px solid var(--pp-line); border-radius: 20px; padding: 14px; }

      .pp-row-grid { grid-template-columns: 44px 20px minmax(0, 1fr); }
      .pp-rail-line { position: absolute; top: 0; bottom: -10px; left: 50%; width: 2px; transform: translateX(-50%); background: var(--pp-line); }
      .pp-rail-line.first { top: 12px; }
      .pp-rail-line.last { bottom: 50%; }

      @keyframes pp-breathe {
        0%, 100% { transform: scale(0.72); opacity: .55; }
        50% { transform: scale(1.15); opacity: 1; }
      }
      .pp-breathe-pulse { animation: pp-breathe 8s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .pp-breathe-pulse { animation: none; opacity: .8; }
      }
    `}</style>
  );
}
