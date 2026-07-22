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
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  BarChart3,
  User,
  Briefcase,
  AlignLeft,
  MapPin,
  Folder,
} from "lucide-react";

/**
 * PastelPlan — a single-file mobile daily planner for teachers.
 * Drop into any React + Tailwind project. lucide-react is the only
 * external dependency. Fonts (Figtree, Fraunces) are self-hosted from
 * ./fonts — copy that folder alongside this component, or swap the
 * @font-face src urls for your own hosting/CDN.
 *
 * Everything autosaves to localStorage:
 *  - a cosmetic sign-up (name/email, no real accounts) personalizes the greeting
 *  - the timeline is saved per calendar day (tap the date to browse other days)
 *  - a Dashboard tab (the default view) shows a weekly overview + an "Up Next" reminder
 *  - blocks support multiple sub-blocks, custom colors, emoji icons, and attachments
 */

const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // 3MB cap so localStorage doesn't blow up
const MAX_BG_BYTES = 4 * 1024 * 1024; // 4MB cap for the background photo

function uidAtt() {
  return "a" + Math.random().toString(36).slice(2, 9);
}
function uid() {
  return "s" + Math.random().toString(36).slice(2, 9);
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
  weather: ["☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "❄️", "☃️", "🌈", "💨", "🌪️", "🌫️", "☔", "🌡️", "🌙"],
  writing: ["✏️", "🖊️", "🖋️", "🖍️", "📝", "📖", "📔", "📓", "📒", "📚", "🔖", "🖇️", "✂️", "📐", "📏", "🖌️"],
  office: ["📎", "📌", "📁", "📂", "🗂️", "🗃️", "🖨️", "💻", "📅", "📆", "🗓️", "📋", "🖥️", "☎️", "📞", "📮"],
  time: ["⏰", "⏱️", "⏲️", "🕐", "🕑", "🕒", "🕓", "⌛", "⏳", "🔔", "📅", "🗓️"],
};
const EMOJI_TABS = [
  { key: "animals", tab: "🐻" },
  { key: "plants", tab: "🌿" },
  { key: "party", tab: "🎉" },
  { key: "faces", tab: "🙂" },
  { key: "weather", tab: "☀️" },
  { key: "writing", tab: "✏️" },
  { key: "office", tab: "📎" },
  { key: "time", tab: "⏰" },
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

const CATS = {
  class: { fill: "var(--pp-lavender)", ink: "var(--pp-lavender-ink)", label: "Class", Icon: BookOpen },
  duty: { fill: "var(--pp-blush)", ink: "var(--pp-blush-ink)", label: "Task", Icon: Users },
  prep: { fill: "var(--pp-sky)", ink: "var(--pp-sky-ink)", label: "Prep", Icon: PencilLine },
  errands: { fill: "var(--pp-mint)", ink: "var(--pp-mint-ink)", label: "Errands", Icon: MapPin },
};
const CAT_ORDER = ["class", "duty", "prep", "errands"];

// New days start empty — no seeded sample content.
const DEFAULT_SCHEDULE = [];
const PREP_ITEMS = [];
const TODO_URGENT = [];
const TODO_LATER = [];

const QUOTES = [
  "I'm not late, I'm running on 'teacher time.'",
  "My to-do list called. It wants a raise.",
  "Behind every tired teacher is a lesson plan that lied about the timing.",
  "Monday, we need to talk. This isn't working out.",
  "I graded papers so you don't have to. You're welcome.",
  "My planner is organized. My life is a rough draft.",
  "Dili ko ma-stress sa akong trabaho. Ang akong trabaho ang ma-stress sa akong ka-relax.",
  "Naa kay workmate nga mura'g 'calculator'? Mo-function lang kung naay i-divide o i-multiply nga OT pay.",
  "Bawal ka kapuyon, timan-e gastador kaayo ka.",
  "Gipakilig pero wa gihigugma, OK ra na uy, ako man gani nagpa-alarm pero wala naka mata.",
  "Ayaw kabalaka nga itom ka kay kung balihon ang itom 'moti'.",
];

const WATER_GOAL = 8;
const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

const WORK_ROLES = [
  { key: "select", label: "Select a Role" },
  { key: "teacher", label: "Teacher" },
  { key: "office-head", label: "Office Head" },
  { key: "executive-assistant", label: "Executive Assistant" },
  { key: "staff", label: "Staff" },
  { key: "coordinator", label: "Coordinator" },
  { key: "laboratory-incharge", label: "Laboratory In-Charge" },
  { key: "others", label: "Others" },
];

const FIVE_ES = [
  { key: "engage", label: "Engage", placeholder: "Hooks, warm-ups, diagnostic queries..." },
  { key: "explore", label: "Explore", placeholder: "Hands-on observation, guided inquiry..." },
  { key: "explain", label: "Explain", placeholder: "Direct instruction, key terminology..." },
  { key: "elaborate", label: "Elaborate", placeholder: "Application, case studies, extended problems..." },
  { key: "evaluate", label: "Evaluate", placeholder: "Exit tickets, reflection, self-assessment..." },
];

const TOTAL_WEEKS = 18;

function freshWeek() {
  return {
    topics: [],
    outcomes: "",
    assessments: "",
    labs: "",
    date: "",
    days: [],
    remarks: "",
    fiveEs: { engage: "", explore: "", explain: "", elaborate: "", evaluate: "" },
  };
}

function freshCourseOutline() {
  const weeks = {};
  for (let i = 1; i <= TOTAL_WEEKS; i++) weeks[i] = freshWeek();
  return { weeks };
}

const OFFICE_HEAD_TABS = [
  { key: "meetings", label: "Meetings", singular: "meeting", accent: "lavender", Icon: Users },
  { key: "field", label: "Field", singular: "field entry", accent: "mint", Icon: MapPin },
  { key: "dailyTasks", label: "Daily Tasks", singular: "task", accent: "blush", Icon: ClipboardList },
];

const OFFICE_TAB_FIELDS = {
  meetings: [
    { key: "title", label: "Title", type: "text", placeholder: "e.g. Budget review" },
    { key: "date", label: "Date", type: "date" },
    { key: "time", label: "Time", type: "time" },
    { key: "location", label: "Location", type: "text", placeholder: "e.g. Conference room" },
  ],
  field: [
    { key: "title", label: "Title", type: "text", placeholder: "e.g. Site inspection" },
    { key: "date", label: "Date", type: "date" },
    { key: "location", label: "Location", type: "text", placeholder: "e.g. Building B" },
  ],
  dailyTasks: [{ key: "title", label: "Task", type: "text", placeholder: "e.g. Sign the requisition forms" }],
};

const DEFAULT_OFFICE_HEAD = { meetings: [], field: [], dailyTasks: [] };

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ACTION_TYPES = ["QUIZ", "LECTURE", "GROUP ACTIVITY", "LAB ACTIVITY", "REMINDERS", "ASSIGNMENT", "GRADE", "ABSENT", "EXCUSE", "PRESENT", "OTHERS"];

function fmtDaysTime(item) {
  const days = (item.days || []).map((d) => d.slice(0, 3)).join(", ");
  const inLabel = item.timeIn ? `${fmtTime(item.timeIn).num} ${fmtTime(item.timeIn).ampm}` : "";
  const outLabel = item.timeOut ? `${fmtTime(item.timeOut).num} ${fmtTime(item.timeOut).ampm}` : "";
  const timeRange = inLabel && outLabel ? `${inLabel}–${outLabel}` : inLabel || outLabel;
  return [days, timeRange].filter(Boolean).join(" · ");
}

function dayOfWeekFromDate(dateStr) {
  if (!dateStr) return "";
  return dateFromISO(dateStr).toLocaleDateString("en-US", { weekday: "long" });
}

const PREP_LOG_TYPES = ["LECTURE", "LAB ACTIVITY", "GROUP ACTIVITY"];
const DAY_OFFSET_FROM_MONDAY = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };

// A course-outline week's Date is treated as an anchor within its Mon–Sun span;
// its checked Days resolve to the actual calendar date(s) in that same week.
function weekMeetingDates(week) {
  if (!week.date) return [];
  if (!week.days || !week.days.length) return [week.date];
  const anchor = dateFromISO(week.date);
  const anchorDow = anchor.getDay();
  const mondayOffset = anchorDow === 0 ? -6 : 1 - anchorDow;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);
  return week.days.map((dayName) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + (DAY_OFFSET_FROM_MONDAY[dayName] || 0));
    return todayISO(d);
  });
}

function findOutlineWeekForClassOnDate(courseOutlines, classId, dateStr) {
  const co = courseOutlines[classId];
  if (!co || !co.weeks) return null;
  for (const weekKey of Object.keys(co.weeks)) {
    const week = co.weeks[weekKey];
    if (weekMeetingDates(week).includes(dateStr)) return { weekNum: Number(weekKey), week };
  }
  return null;
}

function getMatchedOutlineWeeksForDate(classSchedule, courseOutlines, dateStr) {
  const results = [];
  classSchedule.forEach((cls) => {
    const match = findOutlineWeekForClassOnDate(courseOutlines, cls.id, dateStr);
    if (match) results.push({ classId: cls.id, className: cls.className, weekNum: match.weekNum, week: match.week });
  });
  return results;
}

function getSyncedOutlinePrepForDate(classSchedule, courseOutlines, dateStr) {
  return getMatchedOutlineWeeksForDate(classSchedule, courseOutlines, dateStr).map((m) => {
    const topicsLabel = m.week.topics.map((t) => t.title).filter(Boolean).join(", ");
    return {
      id: `outline-prep-${m.classId}-${m.weekNum}`,
      classId: m.classId,
      weekNum: m.weekNum,
      label: `LESSON — ${m.className} / Week ${m.weekNum}${topicsLabel ? ": " + topicsLabel : ""}`,
    };
  });
}

function getSyncedOutlineTodosForDate(classSchedule, courseOutlines, dateStr) {
  const items = [];
  getMatchedOutlineWeeksForDate(classSchedule, courseOutlines, dateStr).forEach((m) => {
    if (m.week.assessments && m.week.assessments.trim()) {
      items.push({
        id: `outline-todo-assess-${m.classId}-${m.weekNum}`,
        text: `Assessment — ${m.className} / Week ${m.weekNum}: ${m.week.assessments.trim()}`,
        sourceClassId: m.classId,
        outlineWeek: m.weekNum,
      });
    }
    if (m.week.remarks && m.week.remarks.trim()) {
      items.push({
        id: `outline-todo-remarks-${m.classId}-${m.weekNum}`,
        text: `Remarks — ${m.className} / Week ${m.weekNum}: ${m.week.remarks.trim()}`,
        sourceClassId: m.classId,
        outlineWeek: m.weekNum,
      });
    }
  });
  return items;
}

// Work Notes → Personal Notes sync: recurring class meetings show up as read-only
// Timeline/Calendar/Dashboard blocks (enriched with the matching course-outline
// week's topics when its Date/Days resolve to this date); activity log entries and
// outline weeks feed Rush Prep & Hook and the To-Do Matrix. Nothing here is
// persisted — it's recomputed live from classSchedule/courseOutlines/sectionLogs so
// Work Notes stays the single source of truth.
function getSyncedClassBlocksForDate(classSchedule, courseOutlines, dateStr) {
  const weekday = dayOfWeekFromDate(dateStr);
  const results = [];
  classSchedule.forEach((cls) => {
    const scheduledToday = !!weekday && (cls.days || []).includes(weekday);
    const match = findOutlineWeekForClassOnDate(courseOutlines, cls.id, dateStr);
    // A class block shows up either on its own recurring weekly schedule, or on any
    // date a course-outline week explicitly resolves to for it — the outline's Date/Days
    // don't need to also be re-registered in the class's general weekly schedule.
    if (!scheduledToday && !match) return;
    const topicsLabel = match ? match.week.topics.map((t) => t.title).filter(Boolean).join(", ") : "";
    const title = match ? `${cls.className} — Week ${match.weekNum}${topicsLabel ? ": " + topicsLabel : ""}` : cls.className;
    results.push({
      id: "class-" + cls.id,
      time24: cls.timeIn || "00:00",
      title,
      cat: "class",
      synced: true,
      sourceClassId: cls.id,
      outlineWeek: match ? match.weekNum : null,
    });
  });
  return results;
}

function getSyncedLogEntriesForDate(classSchedule, classSections, sectionLogs, dateStr) {
  const results = [];
  Object.keys(classSections).forEach((classId) => {
    (classSections[classId] || []).forEach((sec) => {
      (sectionLogs[sec.id] || []).forEach((entry) => {
        if (entry.date === dateStr) {
          const cls = classSchedule.find((c) => c.id === classId);
          results.push({ ...entry, classId, className: cls ? cls.className : "", sectionId: sec.id, sectionName: sec.name });
        }
      });
    });
  });
  return results;
}

function fmtTime(time24) {
  const [hh, mm] = time24.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return { num: `${h12}:${String(mm).padStart(2, "0")}`, ampm };
}

function todayISO(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dateFromISO(iso) {
  return new Date(iso + "T00:00:00");
}
function scheduleKeyFor(dateStr) {
  return "pastelplan.schedule." + dateStr;
}
function loadScheduleFor(dateStr) {
  try {
    const raw = localStorage.getItem(scheduleKeyFor(dateStr));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }
  return dateStr === todayISO() ? DEFAULT_SCHEDULE.map((x) => ({ ...x })) : [];
}
function startOfWeekMonday(d) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
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
  const [userProfile, setUserProfile] = useLocalStorageState("pastelplan.user.v1", null);
  const [showLanding, setShowLanding] = useState(true);
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayISO());
  const [schedule, setSchedule] = useState(() => loadScheduleFor(todayISO()));
  const [editingId, setEditingId] = useState(null);
  const [activeView, setActiveView] = useState("dashboard"); // dashboard is the landing page
  const [showCalendar, setShowCalendar] = useState(false);
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

  const [mainPage, setMainPage] = useState("personal");
  const [workRole, setWorkRole] = useLocalStorageState("pastelplan.role.v1", "select");
  const [classSchedule, setClassSchedule] = useLocalStorageState("pastelplan.classSchedule.v1", []);
  const [courseOutlines, setCourseOutlines] = useLocalStorageState("pastelplan.courseOutlines.v1", {});
  const [classSections, setClassSections] = useLocalStorageState("pastelplan.classSections.v1", {});
  const [sectionLogs, setSectionLogs] = useLocalStorageState("pastelplan.sectionLogs.v1", {});
  const [activeClassId, setActiveClassId] = useState(null);
  const [outlineJumpWeek, setOutlineJumpWeek] = useState(null);
  const [activeSectionsClassId, setActiveSectionsClassId] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [officeHead, setOfficeHead] = useLocalStorageState("pastelplan.officeHead.v1", () => ({ ...DEFAULT_OFFICE_HEAD }));
  const [activeOfficeTab, setActiveOfficeTab] = useState("meetings");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // persist the currently-viewed day's schedule under its own date key
  useEffect(() => {
    try {
      localStorage.setItem(scheduleKeyFor(selectedDate), JSON.stringify(schedule));
    } catch {
      /* storage unavailable */
    }
  }, [schedule, selectedDate]);

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

  const todayIso = todayISO();
  const isToday = selectedDate === todayIso;
  const viewDate = dateFromISO(selectedDate);
  const dayName = viewDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dateLabel = viewDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const dayOfYear = Math.floor((viewDate - new Date(viewDate.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  const clock = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const firstName = userProfile?.name ? userProfile.name.trim().split(/\s+/)[0] : "";
  const namePart = firstName ? `Hi ${firstName}` : isToday ? "Sample day" : "";
  const syncedClassBlocksSelected = getSyncedClassBlocksForDate(classSchedule, courseOutlines, selectedDate);
  const syncedLogEntriesSelected = getSyncedLogEntriesForDate(classSchedule, classSections, sectionLogs, selectedDate);
  const syncedPrepEntries = syncedLogEntriesSelected.filter((e) => PREP_LOG_TYPES.includes(e.type));
  const syncedTodoEntries = syncedLogEntriesSelected.filter((e) => !PREP_LOG_TYPES.includes(e.type));
  const syncedOutlinePrepEntries = getSyncedOutlinePrepForDate(classSchedule, courseOutlines, selectedDate);
  const syncedOutlineTodoEntries = getSyncedOutlineTodosForDate(classSchedule, courseOutlines, selectedDate);
  const sortedSchedule = [...schedule, ...syncedClassBlocksSelected].sort((a, b) => a.time24.localeCompare(b.time24));

  function goToWorkClass(classId) {
    setMainPage("work");
    setWorkRole("teacher");
    setActiveSectionsClassId(classId);
    setActiveSectionId(null);
  }
  function goToWorkSection(classId, sectionId) {
    setMainPage("work");
    setWorkRole("teacher");
    setActiveSectionsClassId(classId);
    setActiveSectionId(sectionId);
  }
  function goToWorkOutlineWeek(classId, weekNum) {
    setMainPage("work");
    setWorkRole("teacher");
    setActiveClassId(classId);
    setOutlineJumpWeek(weekNum);
  }
  const leftCount = schedule.filter((s) => !s.done).length;

  function switchDate(dateStr) {
    setSelectedDate(dateStr);
    setSchedule(loadScheduleFor(dateStr));
    setEditingId(null);
  }
  function toggleDone(id) {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }
  function toggleSub(itemId, subId) {
    setSchedule((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, subs: (s.subs || []).map((sub) => (sub.id === subId ? { ...sub, done: !sub.done } : sub)) } : s))
    );
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
    const item = { id: uid(), time24, title: "", cat: "prep", done: false, subs: [] };
    setSchedule((prev) => [...prev, item]);
    setEditingId(item.id);
  }
  function saveEdit(id, { time24, title, cat, days, date, venue, subs, attachments, color, emoji }) {
    const trimmed = title.trim();
    if (!trimmed) {
      // discard blank new/edited blocks instead of saving an empty title
      setSchedule((prev) => prev.filter((s) => s.id !== id || (s.title || "").trim() !== ""));
      setEditingId(null);
      return;
    }
    updateItem(id, { time24, title: trimmed, cat, days, date, venue, subs, sub: undefined, attachments, color, emoji });
    setEditingId(null);
  }
  function cancelEdit(id, wasNew) {
    if (wasNew) setSchedule((prev) => prev.filter((s) => s.id !== id));
    setEditingId(null);
  }
  function resetAllData() {
    const ok = window.confirm("Clear all planner data? This removes every saved day's timeline, prep, to-dos, water log, and your name — and can't be undone.");
    if (!ok) return;
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("pastelplan.")) localStorage.removeItem(k);
      });
    } catch {
      /* ignore */
    }
    window.location.reload();
  }

  // ---- Dashboard data (computed here so it can read live `schedule` for the selected day) ----
  function computeDayStats(dateStr) {
    const syncedCount = getSyncedClassBlocksForDate(classSchedule, courseOutlines, dateStr).length;
    if (dateStr === selectedDate) return { total: schedule.length + syncedCount, done: schedule.filter((s) => s.done).length };
    try {
      const raw = localStorage.getItem(scheduleKeyFor(dateStr));
      const arr = raw ? JSON.parse(raw) : [];
      return { total: arr.length + syncedCount, done: arr.filter((s) => s.done).length };
    } catch {
      return { total: syncedCount, done: 0 };
    }
  }
  function getTodaySchedule() {
    if (selectedDate === todayIso) return schedule;
    try {
      const raw = localStorage.getItem(scheduleKeyFor(todayIso));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  const todaySchedule = [...getTodaySchedule(), ...getSyncedClassBlocksForDate(classSchedule, courseOutlines, todayIso)];
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const upNextRaw = todaySchedule
    .filter((s) => !s.done)
    .map((s) => {
      const [hh, mm] = s.time24.split(":").map(Number);
      return { ...s, mins: hh * 60 + mm };
    })
    .filter((s) => s.mins >= nowMins)
    .sort((a, b) => a.mins - b.mins)[0];
  let upNext = null;
  if (upNextRaw) {
    const diff = upNextRaw.mins - nowMins;
    const inText = diff <= 0 ? "Starting now" : diff < 60 ? `In ${diff} min` : `In ${Math.floor(diff / 60)}h ${diff % 60}m`;
    upNext = { ...upNextRaw, inText, soon: diff <= 10 };
  }
  const weekStart = startOfWeekMonday(dateFromISO(todayIso));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const todayStats = computeDayStats(todayIso);
  const catCounts = { class: 0, duty: 0, prep: 0, errands: 0 };
  todaySchedule.forEach((s) => {
    catCounts[s.cat] = (catCounts[s.cat] || 0) + 1;
  });

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

  if (showLanding) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: "linear-gradient(155deg, var(--pp-lavender) 0%, var(--pp-blush) 45%, var(--pp-sky) 100%)" }}
      >
        <PastelPlanStyles />
        <SignUpCard
          userProfile={userProfile}
          firstName={firstName}
          dateLabel={dateLabel}
          quote={quote}
          onSubmit={(profile) => {
            setUserProfile(profile);
            setShowLanding(false);
          }}
          onContinue={() => setShowLanding(false)}
        />
      </div>
    );
  }

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
                {dayName}
                {namePart && ` · ${namePart.toUpperCase()}`}
              </div>
              <h1
                role="button"
                tabIndex={0}
                aria-label="Open calendar"
                onClick={() => setShowCalendar(true)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowCalendar(true)}
                className="pp-font-display mt-1 cursor-pointer text-[2rem] font-semibold leading-[1.05] text-[var(--pp-ink)]"
                style={{ textWrap: "balance" }}
              >
                {dateLabel}
              </h1>
              <p className="pp-font-display mt-3 border-l-2 border-[var(--pp-lavender-ink)]/60 pl-3.5 text-[0.95rem] italic leading-[1.4] text-[var(--pp-ink-soft)]">
                "{quote}"
              </p>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => switchDate(todayIso)}
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--pp-surface)] px-3 py-1.5 text-[0.7rem] font-bold text-[var(--pp-lavender-ink)]"
                >
                  <ArrowUp size={11} strokeWidth={2.2} /> Jump to today
                </button>
              )}
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

        {/* personal / work switcher */}
        <div className="flex gap-2 px-4.5 pt-3.5">
          <button
            type="button"
            onClick={() => setMainPage("personal")}
            className="flex-1 rounded-xl py-2 text-[0.76rem] font-bold"
            style={
              mainPage === "personal"
                ? { background: "var(--pp-ink)", color: "var(--pp-surface)" }
                : { background: "transparent", color: "var(--pp-ink-soft)", border: "1.5px solid var(--pp-line)" }
            }
          >
            Personal Notes
          </button>
          <button
            type="button"
            onClick={() => setMainPage("work")}
            className="flex-1 rounded-xl py-2 text-[0.76rem] font-bold"
            style={
              mainPage === "work"
                ? { background: "var(--pp-ink)", color: "var(--pp-surface)" }
                : { background: "transparent", color: "var(--pp-ink-soft)", border: "1.5px solid var(--pp-line)" }
            }
          >
            Work Notes
          </button>
        </div>

        {mainPage === "personal" && (
        <>
        {/* view tabs */}
        <div className="flex gap-2 px-4.5 pt-4">
          <button
            type="button"
            onClick={() => setActiveView("planner")}
            className="flex-1 rounded-xl border-[1.5px] py-2.5 text-[0.8rem] font-bold"
            style={
              activeView === "planner"
                ? { background: "var(--pp-lavender)", borderColor: "var(--pp-lavender)", color: "var(--pp-lavender-ink)" }
                : { background: "var(--pp-surface)", borderColor: "var(--pp-line)", color: "var(--pp-ink-soft)" }
            }
          >
            📋 Planner
          </button>
          <button
            type="button"
            onClick={() => setActiveView("dashboard")}
            className="flex-1 rounded-xl border-[1.5px] py-2.5 text-[0.8rem] font-bold"
            style={
              activeView === "dashboard"
                ? { background: "var(--pp-lavender)", borderColor: "var(--pp-lavender)", color: "var(--pp-lavender-ink)" }
                : { background: "var(--pp-surface)", borderColor: "var(--pp-line)", color: "var(--pp-ink-soft)" }
            }
          >
            📊 Dashboard
          </button>
        </div>

        {activeView === "planner" ? (
          <main className="flex flex-col gap-5 px-4.5 pb-1.5 pt-4.5">
            {/* TIMELINE */}
            <section>
              <SectionTitle icon={Clock} fill="var(--pp-lavender)" ink="var(--pp-lavender-ink)" title="Today's Timeline" trailing={`${leftCount} left`} />
              <p className="-mt-1.5 mb-2.5 text-[0.72rem] font-medium text-[var(--pp-ink-soft)]">Tap a block to edit it</p>
              <div className="flex flex-col">
                {sortedSchedule.map((item, i) =>
                  item.synced ? (
                    <SyncedTimelineRow
                      key={item.id}
                      item={item}
                      isFirst={i === 0}
                      isLast={i === sortedSchedule.length - 1}
                      onOpen={() =>
                        item.outlineWeek ? goToWorkOutlineWeek(item.sourceClassId, item.outlineWeek) : goToWorkClass(item.sourceClassId)
                      }
                    />
                  ) : (
                    <TimelineRow
                      key={item.id}
                      item={item}
                      isFirst={i === 0}
                      isLast={i === sortedSchedule.length - 1}
                      editing={editingId === item.id}
                      onToggleDone={() => toggleDone(item.id)}
                      onToggleSub={(subId) => toggleSub(item.id, subId)}
                      onStartEdit={() => setEditingId(item.id)}
                      onSave={(patch) => saveEdit(item.id, patch)}
                      onCancel={() => cancelEdit(item.id, item.title.trim() === "")}
                      onDelete={() => deleteItem(item.id)}
                    />
                  )
                )}
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
                  <b className="font-semibold text-[var(--pp-ink)]">No lesson selected yet</b>
                  <br />
                  Add today's objective here once you've planned it.
                </p>
                <ul className="mb-3 flex flex-col gap-1.5">
                  {syncedPrepEntries.length === 0 && syncedOutlinePrepEntries.length === 0 && (
                    <li className="text-[0.8rem] italic text-[var(--pp-ink-soft)]">No prep items yet.</li>
                  )}
                  {syncedPrepEntries.map((entry) => {
                    const checked = prepChecked.has(entry.id);
                    const label = `${entry.type} — ${entry.className} / ${entry.sectionName}${entry.notes ? ": " + entry.notes : ""}`;
                    return (
                      <li key={entry.id} className="flex select-none items-center gap-2.5">
                        <CheckBox checked={checked} onClick={() => togglePrep(entry.id)} size={19} tone="var(--pp-sky-ink)" label={label} />
                        <span
                          className="cursor-pointer text-[0.82rem] font-medium text-[var(--pp-ink)]"
                          style={checked ? { color: "var(--pp-ink-soft)", textDecoration: "line-through" } : undefined}
                          onClick={() => goToWorkSection(entry.classId, entry.sectionId)}
                        >
                          {label}
                        </span>
                      </li>
                    );
                  })}
                  {syncedOutlinePrepEntries.map((entry) => {
                    const checked = prepChecked.has(entry.id);
                    return (
                      <li key={entry.id} className="flex select-none items-center gap-2.5">
                        <CheckBox checked={checked} onClick={() => togglePrep(entry.id)} size={19} tone="var(--pp-sky-ink)" label={entry.label} />
                        <span
                          className="cursor-pointer text-[0.82rem] font-medium text-[var(--pp-ink)]"
                          style={checked ? { color: "var(--pp-ink-soft)", textDecoration: "line-through" } : undefined}
                          onClick={() => goToWorkOutlineWeek(entry.classId, entry.weekNum)}
                        >
                          {entry.label}
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
                      No hook added yet.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* TO-DO MATRIX */}
            <section>
              <SectionTitle icon={ClipboardList} fill="var(--pp-blush)" ink="var(--pp-blush-ink)" title="To-Do Matrix" />
              <div className="pp-card">
                <TodoGroup
                  label="Handle today"
                  dotColor="var(--pp-blush-ink)"
                  items={[
                    ...syncedTodoEntries.map((entry) => ({
                      id: entry.id,
                      text: `${entry.type} — ${entry.className} / ${entry.sectionName}${entry.notes ? ": " + entry.notes : ""}`,
                      sourceClassId: entry.classId,
                      sourceSectionId: entry.sectionId,
                    })),
                    ...syncedOutlineTodoEntries,
                  ]}
                  checked={todoChecked}
                  onToggle={toggleTodo}
                  onOpenSource={(item) =>
                    item.outlineWeek ? goToWorkOutlineWeek(item.sourceClassId, item.outlineWeek) : goToWorkSection(item.sourceClassId, item.sourceSectionId)
                  }
                />
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
        ) : (
          <DashboardView
            upNext={upNext}
            weekDays={weekDays}
            selectedDate={selectedDate}
            todayIso={todayIso}
            computeDayStats={computeDayStats}
            onSelectDay={(dStr) => {
              switchDate(dStr);
              setActiveView("planner");
            }}
            todayStats={todayStats}
            water={waterFilled}
            catCounts={catCounts}
            onOpenSyncedClass={(item) =>
              item.outlineWeek ? goToWorkOutlineWeek(item.sourceClassId, item.outlineWeek) : goToWorkClass(item.sourceClassId)
            }
          />
        )}
        </>
        )}

        {mainPage === "work" && (
          <WorkView
            workRole={workRole}
            setWorkRole={setWorkRole}
            classSchedule={classSchedule}
            setClassSchedule={setClassSchedule}
            courseOutlines={courseOutlines}
            setCourseOutlines={setCourseOutlines}
            classSections={classSections}
            setClassSections={setClassSections}
            sectionLogs={sectionLogs}
            setSectionLogs={setSectionLogs}
            activeClassId={activeClassId}
            setActiveClassId={setActiveClassId}
            outlineJumpWeek={outlineJumpWeek}
            setOutlineJumpWeek={setOutlineJumpWeek}
            activeSectionsClassId={activeSectionsClassId}
            setActiveSectionsClassId={setActiveSectionsClassId}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            officeHead={officeHead}
            setOfficeHead={setOfficeHead}
            activeOfficeTab={activeOfficeTab}
            setActiveOfficeTab={setActiveOfficeTab}
          />
        )}

        <footer className="px-5 pb-1 pt-3.5 text-center text-[0.68rem] font-semibold tracking-[.02em] text-[var(--pp-ink-soft)]">
          DailyGiya · made for the space between periods
        </footer>
        <p className="px-5 pb-5.5 text-center text-[0.62rem] font-bold tracking-[.04em] text-[var(--pp-ink-soft)] opacity-60">jvtcordova@2026</p>
      </div>

      {showCustomize && (
        <CustomizeSheet customize={customize} setCustomize={setCustomize} onClose={() => setShowCustomize(false)} onReset={resetAllData} />
      )}
      {showCalendar && (
        <CalendarSheet
          selectedDate={selectedDate}
          onSelect={switchDate}
          onClose={() => setShowCalendar(false)}
          classSchedule={classSchedule}
          classSections={classSections}
          sectionLogs={sectionLogs}
          courseOutlines={courseOutlines}
        />
      )}
    </div>
  );
}

function SignUpCard({ userProfile, firstName, dateLabel, quote, onSubmit, onContinue }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const nameRef = useRef(null);
  const isReturning = !!userProfile?.name;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }
    onSubmit({ name: trimmed, email: email.trim() });
  }

  return (
    <div className="relative w-full max-w-[360px] px-2">
      <div
        className="relative rounded-[30px] px-6 pb-6 pt-7 text-center shadow-[0_20px_44px_-14px_rgba(30,20,40,.45)]"
        style={{ background: "linear-gradient(165deg, var(--pp-surface), color-mix(in srgb, var(--pp-lavender) 25%, var(--pp-surface)))" }}
      >
        {isReturning ? (
          <>
            <h2 className="pp-font-display mb-1.5 text-[1.3rem] font-semibold leading-tight text-[var(--pp-ink)]">
              Welcome Back{firstName ? `, ${firstName}` : ""}!
            </h2>
            <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[.05em] text-[var(--pp-ink-soft)]">{dateLabel}</p>
            <p className="mb-6 text-[0.82rem] italic leading-[1.45] text-[var(--pp-ink-soft)]">"{quote}"</p>
            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-2xl py-3.5 text-[0.9rem] font-bold text-[var(--pp-surface)] shadow-[0_10px_20px_-6px_rgba(30,20,40,.4)] transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--pp-lavender-ink), var(--pp-blush-ink))" }}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <h2 className="pp-font-display mb-1.5 text-[1.3rem] font-semibold leading-tight text-[var(--pp-ink)]">
              Welcome to
              <br />
              Daily GIYA!
            </h2>
            <p className="mb-5.5 text-[0.82rem] italic leading-[1.45] text-[var(--pp-ink-soft)]">"Small steps every day lead to big changes."</p>
            <label className="mb-1.5 block text-left text-[0.66rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Your name</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Jess Cordova"
              className="mb-3.5 w-full rounded-xl bg-[var(--pp-surface-alt)] px-3.5 py-2.5 text-[0.88rem] text-[var(--pp-ink)] shadow-[inset_0_2px_4px_rgba(30,20,40,.16)]"
            />
            <label className="mb-1.5 block text-left text-[0.66rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@school.edu"
              className="mb-3.5 w-full rounded-xl bg-[var(--pp-surface-alt)] px-3.5 py-2.5 text-[0.88rem] text-[var(--pp-ink)] shadow-[inset_0_2px_4px_rgba(30,20,40,.16)]"
            />
            <button
              type="button"
              onClick={submit}
              className="mt-1 w-full rounded-2xl py-3.5 text-[0.9rem] font-bold text-[var(--pp-surface)] shadow-[0_10px_20px_-6px_rgba(30,20,40,.4)] transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--pp-lavender-ink), var(--pp-blush-ink))" }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarSheet({ selectedDate, onSelect, onClose, classSchedule, classSections, sectionLogs, courseOutlines }) {
  const initial = dateFromISO(selectedDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const todayIso = todayISO();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, muted: true, month: viewMonth - 1 });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false, month: viewMonth });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - (startOffset + daysInMonth) + 1, muted: true, month: viewMonth + 1 });

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[84vh] w-full max-w-[402px] overflow-y-auto rounded-t-[24px] bg-[var(--pp-surface)] px-5 pb-6 pt-2.5 shadow-[0_-10px_30px_-8px_rgba(30,20,40,.4)]">
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-[var(--pp-line)]" />
        <div className="mb-3.5 flex items-center justify-between">
          <button type="button" onClick={prevMonth} aria-label="Previous month" className="grid h-[30px] w-[30px] place-items-center rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] text-[var(--pp-ink-soft)]">
            <ChevronLeft size={15} strokeWidth={2.2} />
          </button>
          <span className="pp-font-display text-[1rem] font-semibold text-[var(--pp-ink)]">{monthLabel}</span>
          <button type="button" onClick={nextMonth} aria-label="Next month" className="grid h-[30px] w-[30px] place-items-center rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] text-[var(--pp-ink-soft)]">
            <ChevronRight size={15} strokeWidth={2.2} />
          </button>
        </div>
        <div className="mb-1.5 grid grid-cols-7">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-center text-[0.64rem] font-extrabold uppercase text-[var(--pp-ink-soft)]">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {cells.map((c, i) => {
            const cellDate = new Date(viewYear, c.month, c.day);
            const iso = todayISO(cellDate);
            let hasData = false;
            try {
              hasData = !!localStorage.getItem(scheduleKeyFor(iso));
            } catch {
              /* ignore */
            }
            if (!hasData) {
              hasData =
                getSyncedClassBlocksForDate(classSchedule, courseOutlines, iso).length > 0 ||
                getSyncedLogEntriesForDate(classSchedule, classSections, sectionLogs, iso).length > 0 ||
                getMatchedOutlineWeeksForDate(classSchedule, courseOutlines, iso).length > 0;
            }
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDate;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(iso);
                  onClose();
                }}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[10px] text-[0.78rem] font-semibold"
                style={{
                  color: c.muted ? "var(--pp-ink-soft)" : "var(--pp-ink)",
                  opacity: c.muted ? 0.4 : 1,
                  background: isSelected ? "var(--pp-lavender)" : "transparent",
                  boxShadow: isToday && !isSelected ? "inset 0 0 0 1.5px var(--pp-lavender-ink)" : "none",
                }}
              >
                <span style={isSelected ? { color: "var(--pp-lavender-ink)", fontWeight: 800 } : undefined}>{c.day}</span>
                {hasData && !c.muted && <span className="h-1 w-1 rounded-full" style={{ background: "var(--pp-mint-ink)" }} />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect(todayIso);
            onClose();
          }}
          className="mt-3.5 w-full rounded-xl border-[1.5px] border-[var(--pp-line)] py-2.5 text-[0.8rem] font-bold text-[var(--pp-ink-soft)]"
        >
          Today
        </button>
      </div>
    </div>
  );
}

function DashboardView({ upNext, weekDays, selectedDate, todayIso, computeDayStats, onSelectDay, todayStats, water, catCounts, onOpenSyncedClass }) {
  let upNextVisual = null;
  let UpNextIcon = Bell;
  if (upNext) {
    const cat = CATS[upNext.cat];
    const custom = upNext.color ? swatchByKey(upNext.color) : null;
    upNextVisual = { fill: custom ? custom.fill : cat.fill, ink: custom ? custom.ink : cat.ink };
    if (upNext.synced) UpNextIcon = cat.Icon;
  }
  const t = upNext ? fmtTime(upNext.time24) : null;

  return (
    <div className="flex flex-col gap-5 px-4.5 pb-1.5 pt-4.5">
      <section>
        <SectionTitle icon={Bell} fill="var(--pp-gold)" ink="var(--pp-gold-ink)" title="Up Next" />
        <div className="pp-card">
          {upNext && upNextVisual ? (
            <div
              className={"flex items-center gap-3" + (upNext.synced ? " cursor-pointer" : "")}
              onClick={upNext.synced ? () => onOpenSyncedClass(upNext) : undefined}
            >
              <span
                className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] text-[20px] leading-none ${upNext.soon ? "pp-bell-pulse" : ""}`}
                style={{ background: upNextVisual.fill, color: upNextVisual.ink }}
              >
                {upNext.emoji || <UpNextIcon size={20} strokeWidth={1.8} />}
              </span>
              <div className="min-w-0">
                <p className="mb-0.5 text-[0.72rem] font-extrabold uppercase tracking-[.02em] text-[var(--pp-gold-ink)]">
                  {upNext.inText} · {t.num} {t.ampm}
                  {upNext.synced ? " · Work Notes" : ""}
                </p>
                <p className="text-[0.9rem] font-bold text-[var(--pp-ink)]">{upNext.title}</p>
              </div>
            </div>
          ) : (
            <p className="dash-empty text-center text-[0.78rem] text-[var(--pp-ink-soft)]">Nothing left on today's timeline. Nice work! 🎉</p>
          )}
        </div>
      </section>

      <section>
        <SectionTitle icon={Calendar} fill="var(--pp-lavender)" ink="var(--pp-lavender-ink)" title="This Week" />
        <div className="flex justify-between gap-1">
          {weekDays.map((d, i) => {
            const dStr = todayISO(d);
            const stats = computeDayStats(dStr);
            const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
            const isToday = dStr === todayIso;
            const isSelected = dStr === selectedDate;
            return (
              <button
                key={dStr}
                type="button"
                onClick={() => onSelectDay(dStr)}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-xl py-1"
                style={{ background: isSelected ? "var(--pp-surface-alt)" : "transparent" }}
              >
                <span className="text-[0.64rem] font-bold uppercase text-[var(--pp-ink-soft)]">{WEEKDAY_LETTERS[i]}</span>
                <span
                  className="grid h-[34px] w-[34px] place-items-center rounded-full"
                  style={{ background: `conic-gradient(var(--pp-mint-ink) ${pct}%, var(--pp-line) 0)` }}
                >
                  <span
                    className="grid h-[26px] w-[26px] place-items-center rounded-full bg-[var(--pp-surface)] text-[0.7rem] font-bold text-[var(--pp-ink)]"
                    style={isToday ? { boxShadow: "0 0 0 1.5px var(--pp-lavender-ink)" } : undefined}
                  >
                    {d.getDate()}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle icon={BarChart3} fill="var(--pp-mint)" ink="var(--pp-mint-ink)" title="Today's Snapshot" />
        <div className="pp-card">
          <div className="mb-3.5 flex gap-2.5">
            <div className="flex-1 rounded-[14px] bg-[var(--pp-paper)] py-3.5 text-center">
              <span className="pp-font-display block text-[1.4rem] font-semibold tabular-nums text-[var(--pp-ink)]">
                {todayStats.done}/{todayStats.total}
              </span>
              <span className="mt-0.5 block text-[0.66rem] font-bold uppercase tracking-[.03em] text-[var(--pp-ink-soft)]">Blocks done</span>
            </div>
            <div className="flex-1 rounded-[14px] bg-[var(--pp-paper)] py-3.5 text-center">
              <span className="pp-font-display block text-[1.4rem] font-semibold tabular-nums text-[var(--pp-ink)]">
                {water}/{WATER_GOAL}
              </span>
              <span className="mt-0.5 block text-[0.66rem] font-bold uppercase tracking-[.03em] text-[var(--pp-ink-soft)]">Cups logged</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1.5 text-[0.72rem] font-bold" style={{ background: "var(--pp-lavender)", color: "var(--pp-lavender-ink)" }}>
              Class {catCounts.class || 0}
            </span>
            <span className="rounded-full px-3 py-1.5 text-[0.72rem] font-bold" style={{ background: "var(--pp-blush)", color: "var(--pp-blush-ink)" }}>
              Task {catCounts.duty || 0}
            </span>
            <span className="rounded-full px-3 py-1.5 text-[0.72rem] font-bold" style={{ background: "var(--pp-sky)", color: "var(--pp-sky-ink)" }}>
              Prep {catCounts.prep || 0}
            </span>
            <span className="rounded-full px-3 py-1.5 text-[0.72rem] font-bold" style={{ background: "var(--pp-mint)", color: "var(--pp-mint-ink)" }}>
              Errands {catCounts.errands || 0}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkView({
  workRole,
  setWorkRole,
  classSchedule,
  setClassSchedule,
  courseOutlines,
  setCourseOutlines,
  classSections,
  setClassSections,
  sectionLogs,
  setSectionLogs,
  activeClassId,
  setActiveClassId,
  outlineJumpWeek,
  setOutlineJumpWeek,
  activeSectionsClassId,
  setActiveSectionsClassId,
  activeSectionId,
  setActiveSectionId,
  officeHead,
  setOfficeHead,
  activeOfficeTab,
  setActiveOfficeTab,
}) {
  const roleLabel = (WORK_ROLES.find((r) => r.key === workRole) || WORK_ROLES[0]).label;

  return (
    <main className="flex flex-col gap-5 px-4.5 pb-1.5 pt-4.5">
      <section>
        <SectionTitle icon={Briefcase} fill="var(--pp-lavender)" ink="var(--pp-lavender-ink)" title="Work Role" />
        <div className="pp-card">
          <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Choose your role</label>
          <select
            value={workRole}
            onChange={(e) => setWorkRole(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2.5 text-[0.85rem] font-semibold text-[var(--pp-ink)]"
          >
            {WORK_ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {workRole === "teacher" ? (
        <TeacherWorkspace
          classSchedule={classSchedule}
          setClassSchedule={setClassSchedule}
          courseOutlines={courseOutlines}
          setCourseOutlines={setCourseOutlines}
          classSections={classSections}
          setClassSections={setClassSections}
          sectionLogs={sectionLogs}
          setSectionLogs={setSectionLogs}
          activeClassId={activeClassId}
          setActiveClassId={setActiveClassId}
          outlineJumpWeek={outlineJumpWeek}
          setOutlineJumpWeek={setOutlineJumpWeek}
          activeSectionsClassId={activeSectionsClassId}
          setActiveSectionsClassId={setActiveSectionsClassId}
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
        />
      ) : workRole === "office-head" ? (
        <OfficeHeadDashboard
          officeHead={officeHead}
          setOfficeHead={setOfficeHead}
          activeOfficeTab={activeOfficeTab}
          setActiveOfficeTab={setActiveOfficeTab}
        />
      ) : (
        <section>
          <div className="pp-card flex flex-col items-center gap-2 py-8 text-center">
            <User size={30} strokeWidth={1.6} className="text-[var(--pp-ink-soft)]" />
            <p className="pp-font-display text-[1.05rem] font-semibold text-[var(--pp-ink)]">
              {workRole === "select" ? "Select a Role" : `${roleLabel} Dashboard`}
            </p>
            <p className="max-w-[26ch] text-[0.78rem] leading-[1.4] text-[var(--pp-ink-soft)]">
              {workRole === "select"
                ? "Choose a role above to unlock tailored tools and workflows."
                : `Custom workspace tools for ${roleLabel} will appear here.`}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}

function OutlineTextarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={5}
      className="w-full resize-none rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2.5 text-[0.82rem] leading-[1.45] text-[var(--pp-ink)]"
    />
  );
}

function DaysTimeFields({ days, timeIn, timeOut, onChange }) {
  const toggleDay = (d) => {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d];
    onChange({ days: next, timeIn, timeOut });
  };
  return (
    <>
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Days</label>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className="rounded-full border-[1.5px] px-2.5 py-1 text-[0.68rem] font-bold"
              style={
                days.includes(d)
                  ? { background: "var(--pp-lavender)", borderColor: "var(--pp-lavender)", color: "var(--pp-lavender-ink)" }
                  : { background: "var(--pp-surface)", borderColor: "var(--pp-line)", color: "var(--pp-ink-soft)" }
              }
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Time In</label>
        <input
          type="time"
          value={timeIn}
          onChange={(e) => onChange({ days, timeIn: e.target.value, timeOut })}
          className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Time Out</label>
        <input
          type="time"
          value={timeOut}
          onChange={(e) => onChange({ days, timeIn, timeOut: e.target.value })}
          className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
        />
      </div>
    </>
  );
}

function ClassAddForm({ onAdd, onCancel }) {
  const [draft, setDraft] = useState({ className: "", days: [], timeIn: "", timeOut: "" });

  const submit = () => {
    if (!draft.className.trim()) return;
    onAdd({ id: uid(), className: draft.className.trim(), days: draft.days, timeIn: draft.timeIn, timeOut: draft.timeOut });
  };

  return (
    <div className="pp-card flex flex-col gap-2.5">
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Class</label>
        <input
          type="text"
          value={draft.className}
          placeholder="e.g. Grade 10 Biology"
          onChange={(e) => setDraft((d) => ({ ...d, className: e.target.value }))}
          className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
        />
      </div>
      <DaysTimeFields days={draft.days} timeIn={draft.timeIn} timeOut={draft.timeOut} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-[1.5px] border-[var(--pp-line)] py-2 text-[0.78rem] font-bold text-[var(--pp-ink-soft)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="flex-1 rounded-xl py-2 text-[0.78rem] font-bold text-[var(--pp-surface)]"
          style={{ background: "var(--pp-ink)" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ClassRow({ cls, onOpenOutline, onOpenSections, onDelete }) {
  const subtext = fmtDaysTime(cls);
  return (
    <div className="flex items-center gap-2.5 border-b border-[var(--pp-line)] py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.83rem] font-semibold text-[var(--pp-ink)]">{cls.className}</p>
        {subtext && <p className="truncate text-[0.68rem] text-[var(--pp-ink-soft)]">{subtext}</p>}
      </div>
      <button
        type="button"
        onClick={onOpenSections}
        className="flex shrink-0 items-center gap-1 rounded-full border-[1.5px] border-[var(--pp-line)] px-2.5 py-1.5 text-[0.68rem] font-bold text-[var(--pp-ink-soft)]"
      >
        <Users size={13} strokeWidth={2} /> Sections
      </button>
      <button
        type="button"
        onClick={onOpenOutline}
        className="flex shrink-0 items-center gap-1 rounded-full border-[1.5px] border-[var(--pp-line)] px-2.5 py-1.5 text-[0.68rem] font-bold text-[var(--pp-ink-soft)]"
      >
        <Folder size={13} strokeWidth={2} /> Outline
      </button>
      <button type="button" onClick={onDelete} aria-label="Delete class" className="shrink-0 text-[var(--pp-ink-soft)]">
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

function ClassScheduleList({ classSchedule, setClassSchedule, setCourseOutlines, classSections, setClassSections, setSectionLogs, onOpenOutline, onOpenSections }) {
  const [adding, setAdding] = useState(false);

  const addClass = (cls) => {
    setClassSchedule((prev) => [...prev, cls]);
    setAdding(false);
  };
  const deleteClass = (id) => {
    setClassSchedule((prev) => prev.filter((c) => c.id !== id));
    setCourseOutlines((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    const sections = classSections[id] || [];
    setClassSections((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSectionLogs((prev) => {
      const next = { ...prev };
      sections.forEach((s) => delete next[s.id]);
      return next;
    });
  };

  return (
    <section>
      <SectionTitle icon={Calendar} fill="var(--pp-sky)" ink="var(--pp-sky-ink)" title="Class Schedule" />
      {adding ? (
        <ClassAddForm onAdd={addClass} onCancel={() => setAdding(false)} />
      ) : (
        <>
          <div className="pp-card">
            {classSchedule.length === 0 ? (
              <p className="py-3 text-center text-[0.78rem] text-[var(--pp-ink-soft)]">No classes yet.</p>
            ) : (
              classSchedule.map((cls) => (
                <ClassRow
                  key={cls.id}
                  cls={cls}
                  onOpenOutline={() => onOpenOutline(cls.id)}
                  onOpenSections={() => onOpenSections(cls.id)}
                  onDelete={() => deleteClass(cls.id)}
                />
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--pp-line)] py-3 text-[0.8rem] font-bold text-[var(--pp-ink-soft)]"
          >
            <Plus size={16} strokeWidth={2.2} /> Add class
          </button>
        </>
      )}
    </section>
  );
}

function SectionAddForm({ onAdd, onCancel }) {
  const [draft, setDraft] = useState({ name: "", days: [], timeIn: "", timeOut: "" });

  const submit = () => {
    if (!draft.name.trim()) return;
    onAdd({ id: uid(), name: draft.name.trim(), days: draft.days, timeIn: draft.timeIn, timeOut: draft.timeOut });
  };

  return (
    <div className="pp-card flex flex-col gap-2.5">
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Section name</label>
        <input
          type="text"
          value={draft.name}
          placeholder="e.g. Section A"
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
        />
      </div>
      <DaysTimeFields days={draft.days} timeIn={draft.timeIn} timeOut={draft.timeOut} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-[1.5px] border-[var(--pp-line)] py-2 text-[0.78rem] font-bold text-[var(--pp-ink-soft)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="flex-1 rounded-xl py-2 text-[0.78rem] font-bold text-[var(--pp-surface)]"
          style={{ background: "var(--pp-ink)" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function SectionRow({ section, entryCount, onOpen, onDelete }) {
  const meta = [fmtDaysTime(section), `${entryCount} ${entryCount === 1 ? "entry" : "entries"}`].filter(Boolean).join(" · ");
  return (
    <div className="flex items-center gap-2.5 border-b border-[var(--pp-line)] py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.83rem] font-semibold text-[var(--pp-ink)]">{section.name}</p>
        <p className="truncate text-[0.68rem] text-[var(--pp-ink-soft)]">{meta}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex shrink-0 items-center gap-1 rounded-full border-[1.5px] border-[var(--pp-line)] px-2.5 py-1.5 text-[0.68rem] font-bold text-[var(--pp-ink-soft)]"
      >
        <FileText size={13} strokeWidth={2} /> Open
      </button>
      <button type="button" onClick={onDelete} aria-label="Delete section" className="shrink-0 text-[var(--pp-ink-soft)]">
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

function SectionsList({ classItem, sections, sectionLogs, setClassSections, setSectionLogs, onOpenLog, onBack }) {
  const [adding, setAdding] = useState(false);

  const addSection = (section) => {
    setClassSections((prev) => ({ ...prev, [classItem.id]: [...(prev[classItem.id] || []), section] }));
    setAdding(false);
  };
  const deleteSection = (sectionId) => {
    setClassSections((prev) => ({ ...prev, [classItem.id]: (prev[classItem.id] || []).filter((s) => s.id !== sectionId) }));
    setSectionLogs((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  };

  return (
    <section>
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1 text-[0.76rem] font-bold text-[var(--pp-ink-soft)]">
        <ChevronLeft size={14} strokeWidth={2.2} /> Back to Class Schedule
      </button>
      <p className="mb-3 -mt-1 text-[0.9rem] font-semibold text-[var(--pp-ink)]">{classItem.className}</p>
      <SectionTitle icon={Users} fill="var(--pp-seafoam)" ink="var(--pp-seafoam-ink)" title="Sections" />
      {adding ? (
        <SectionAddForm onAdd={addSection} onCancel={() => setAdding(false)} />
      ) : (
        <>
          <div className="pp-card">
            {sections.length === 0 ? (
              <p className="py-3 text-center text-[0.78rem] text-[var(--pp-ink-soft)]">No sections yet.</p>
            ) : (
              sections.map((sec) => (
                <SectionRow
                  key={sec.id}
                  section={sec}
                  entryCount={(sectionLogs[sec.id] || []).length}
                  onOpen={() => onOpenLog(sec.id)}
                  onDelete={() => deleteSection(sec.id)}
                />
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--pp-line)] py-3 text-[0.8rem] font-bold text-[var(--pp-ink-soft)]"
          >
            <Plus size={16} strokeWidth={2.2} /> Add section
          </button>
        </>
      )}
    </section>
  );
}

function LogEntryRow({ entry, onDelete }) {
  const dateLabel = entry.date ? `${fmtShortDate(entry.date)} · ${dayOfWeekFromDate(entry.date)}` : "";
  return (
    <div className="flex items-start gap-2.5 border-b border-[var(--pp-line)] py-2.5 last:border-b-0">
      <span
        className="shrink-0 rounded-full px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[.03em]"
        style={{ background: "var(--pp-sky)", color: "var(--pp-sky-ink)" }}
      >
        {entry.type}
      </span>
      <div className="min-w-0 flex-1">
        {dateLabel && <p className="text-[0.68rem] font-bold text-[var(--pp-ink-soft)]">{dateLabel}</p>}
        {entry.notes && <p className="whitespace-pre-wrap text-[0.78rem] leading-[1.4] text-[var(--pp-ink)]">{entry.notes}</p>}
      </div>
      <button type="button" onClick={onDelete} aria-label="Delete entry" className="shrink-0 text-[var(--pp-ink-soft)]">
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function SectionLogView({ section, entries, setSectionLogs, onBack }) {
  const [type, setType] = useState(ACTION_TYPES[0]);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const addEntry = () => {
    const entry = { id: uid(), type, date, notes: notes.trim() };
    setSectionLogs((prev) => ({ ...prev, [section.id]: [...(prev[section.id] || []), entry] }));
    setDate("");
    setNotes("");
  };
  const deleteEntry = (entryId) => {
    setSectionLogs((prev) => ({ ...prev, [section.id]: (prev[section.id] || []).filter((e) => e.id !== entryId) }));
  };

  return (
    <section>
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1 text-[0.76rem] font-bold text-[var(--pp-ink-soft)]">
        <ChevronLeft size={14} strokeWidth={2.2} /> Back to Sections
      </button>
      <p className="mb-3 -mt-1 text-[0.9rem] font-semibold text-[var(--pp-ink)]">{section.name}</p>
      <SectionTitle icon={ClipboardList} fill="var(--pp-blush)" ink="var(--pp-blush-ink)" title="Activity Log" />

      <div className="pp-card mb-3">
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Action</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-2.5 w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
        >
          {ACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
        />
        {date && <p className="mt-1 text-[0.68rem] font-semibold text-[var(--pp-ink-soft)]">{dayOfWeekFromDate(date)}</p>}
        <label className="mb-1 mt-2.5 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add notes for this entry..."
          className="w-full resize-none rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2.5 text-[0.82rem] leading-[1.45] text-[var(--pp-ink)]"
        />
        <button
          type="button"
          onClick={addEntry}
          className="mt-2.5 w-full rounded-xl py-2.5 text-[0.82rem] font-bold text-[var(--pp-surface)]"
          style={{ background: "var(--pp-ink)" }}
        >
          Add Entry
        </button>
      </div>

      <div className="pp-card">
        {entries.length === 0 ? (
          <p className="py-3 text-center text-[0.78rem] text-[var(--pp-ink-soft)]">No entries yet.</p>
        ) : (
          [...entries].reverse().map((entry) => <LogEntryRow key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />)
        )}
      </div>
    </section>
  );
}

function TeacherWorkspace({
  classSchedule,
  setClassSchedule,
  courseOutlines,
  setCourseOutlines,
  classSections,
  setClassSections,
  sectionLogs,
  setSectionLogs,
  activeClassId,
  setActiveClassId,
  outlineJumpWeek,
  setOutlineJumpWeek,
  activeSectionsClassId,
  setActiveSectionsClassId,
  activeSectionId,
  setActiveSectionId,
}) {
  const activeClass = classSchedule.find((c) => c.id === activeClassId);

  if (activeClass) {
    const existing = courseOutlines[activeClassId];
    const outline = existing && existing.weeks ? existing : freshCourseOutline();
    const setOutline = (updater) =>
      setCourseOutlines((prev) => {
        const prevExisting = prev[activeClassId];
        const prevOutline = prevExisting && prevExisting.weeks ? prevExisting : freshCourseOutline();
        return { ...prev, [activeClassId]: typeof updater === "function" ? updater(prevOutline) : updater };
      });

    return (
      <section>
        <button
          type="button"
          onClick={() => setActiveClassId(null)}
          className="mb-3 flex items-center gap-1 text-[0.76rem] font-bold text-[var(--pp-ink-soft)]"
        >
          <ChevronLeft size={14} strokeWidth={2.2} /> Back to Class Schedule
        </button>
        <p className="mb-3 -mt-1 text-[0.9rem] font-semibold text-[var(--pp-ink)]">
          {activeClass.className}
          <span className="ml-1.5 text-[0.72rem] font-medium text-[var(--pp-ink-soft)]">{fmtDaysTime(activeClass)}</span>
        </p>
        <TeacherOutline
          key={activeClassId}
          outline={outline}
          setOutline={setOutline}
          initialWeek={outlineJumpWeek}
          onConsumeJumpWeek={() => setOutlineJumpWeek(null)}
        />
      </section>
    );
  }

  const sectionsClass = classSchedule.find((c) => c.id === activeSectionsClassId);
  if (sectionsClass) {
    const activeSection = (classSections[activeSectionsClassId] || []).find((s) => s.id === activeSectionId);
    if (activeSection) {
      return (
        <SectionLogView
          section={activeSection}
          entries={sectionLogs[activeSectionId] || []}
          setSectionLogs={setSectionLogs}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }
    return (
      <SectionsList
        classItem={sectionsClass}
        sections={classSections[activeSectionsClassId] || []}
        sectionLogs={sectionLogs}
        setClassSections={setClassSections}
        setSectionLogs={setSectionLogs}
        onOpenLog={(id) => setActiveSectionId(id)}
        onBack={() => setActiveSectionsClassId(null)}
      />
    );
  }

  return (
    <ClassScheduleList
      classSchedule={classSchedule}
      setClassSchedule={setClassSchedule}
      setCourseOutlines={setCourseOutlines}
      classSections={classSections}
      setClassSections={setClassSections}
      setSectionLogs={setSectionLogs}
      onOpenOutline={(id) => setActiveClassId(id)}
      onOpenSections={(id) => {
        setActiveSectionsClassId(id);
        setActiveSectionId(null);
      }}
    />
  );
}

function TeacherOutline({ outline, setOutline, initialWeek, onConsumeJumpWeek }) {
  const [activeWeek, setActiveWeek] = useState(initialWeek || 1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const saveTimerRef = useRef(null);
  const week = outline.weeks[activeWeek];

  useEffect(() => {
    if (initialWeek) onConsumeJumpWeek?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveWeek = () => {
    setJustSaved(true);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setJustSaved(false), 1500);
  };

  const updateWeek = (key, val) =>
    setOutline((prev) => ({
      ...prev,
      weeks: { ...prev.weeks, [activeWeek]: { ...prev.weeks[activeWeek], [key]: val } },
    }));
  const updateWeekFiveE = (key, val) =>
    setOutline((prev) => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [activeWeek]: { ...prev.weeks[activeWeek], fiveEs: { ...prev.weeks[activeWeek].fiveEs, [key]: val } },
      },
    }));
  const addTopic = () =>
    setOutline((prev) => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [activeWeek]: { ...prev.weeks[activeWeek], topics: [...prev.weeks[activeWeek].topics, { id: uid(), title: "" }] },
      },
    }));
  const updateTopic = (id, title) =>
    setOutline((prev) => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [activeWeek]: {
          ...prev.weeks[activeWeek],
          topics: prev.weeks[activeWeek].topics.map((t) => (t.id === id ? { ...t, title } : t)),
        },
      },
    }));
  const removeTopic = (id) =>
    setOutline((prev) => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [activeWeek]: { ...prev.weeks[activeWeek], topics: prev.weeks[activeWeek].topics.filter((t) => t.id !== id) },
      },
    }));
  const toggleDay = (day) =>
    setOutline((prev) => {
      const current = prev.weeks[activeWeek].days;
      const days = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
      return { ...prev, weeks: { ...prev.weeks, [activeWeek]: { ...prev.weeks[activeWeek], days } } };
    });

  return (
    <section>
      <SectionTitle icon={BookOpen} fill="var(--pp-seafoam)" ink="var(--pp-seafoam-ink)" title="Course Outline" />

      <div className="pp-card">
        <div className="mb-3.5 flex gap-2">
          <select
            value={activeWeek}
            onChange={(e) => setActiveWeek(Number(e.target.value))}
            className="flex-1 rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2.5 text-[0.84rem] font-bold text-[var(--pp-ink)]"
          >
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] px-3.5 py-2.5 text-[0.76rem] font-bold"
            style={
              summaryOpen
                ? { background: "var(--pp-gold)", borderColor: "var(--pp-gold)", color: "var(--pp-gold-ink)" }
                : { background: "var(--pp-surface)", borderColor: "var(--pp-line)", color: "var(--pp-ink-soft)" }
            }
          >
            {summaryOpen ? <X size={13} strokeWidth={2.2} /> : <AlignLeft size={13} strokeWidth={2.2} />}
            {summaryOpen ? "Close" : "Summary"}
          </button>
        </div>

        {summaryOpen ? (
          <OutlineSummaryList
            weeks={outline.weeks}
            onBack={() => setSummaryOpen(false)}
            onSelectWeek={(w) => {
              setActiveWeek(w);
              setSummaryOpen(false);
            }}
          />
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Topic / Lesson</label>
              <div className="mb-2 flex flex-col gap-1.5">
                {week.topics.length === 0 && (
                  <p className="text-[0.78rem] italic text-[var(--pp-ink-soft)]">No topics/lessons yet.</p>
                )}
                {week.topics.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--pp-line)] bg-[var(--pp-paper)] px-2.5 py-2"
                  >
                    <span className="shrink-0 text-[0.72rem] font-extrabold text-[var(--pp-ink-soft)]">{i + 1}.</span>
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => updateTopic(t.id, e.target.value)}
                      placeholder="e.g. Cell structure"
                      className="min-w-0 flex-1 bg-transparent text-[0.8rem] font-medium text-[var(--pp-ink)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeTopic(t.id)}
                      aria-label="Remove topic"
                      className="shrink-0 text-[var(--pp-ink-soft)]"
                    >
                      <X size={13} strokeWidth={2.2} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTopic}
                className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--pp-line)] py-2 text-[0.76rem] font-bold text-[var(--pp-ink-soft)]"
              >
                <Plus size={13} strokeWidth={2.2} /> Add topic / lesson
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Learning Outcome</label>
              <OutlineTextarea
                value={week.outcomes}
                onChange={(v) => updateWeek("outcomes", v)}
                placeholder="Detail student competencies and objectives..."
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Assessments</label>
              <OutlineTextarea
                value={week.assessments}
                onChange={(v) => updateWeek("assessments", v)}
                placeholder="Quizzes, exams, rubrics, grading criteria..."
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">
                Lab Activity <span className="font-medium italic text-[var(--pp-ink-soft)]">(optional)</span>
              </label>
              <OutlineTextarea
                value={week.labs}
                onChange={(v) => updateWeek("labs", v)}
                placeholder="Practical experiments, specimen lists..."
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Date</label>
              <input
                type="date"
                value={week.date}
                onChange={(e) => updateWeek("date", e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2.5 text-[0.85rem] font-semibold text-[var(--pp-ink)]"
              />
              <label className="mb-1.5 mt-2.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Days</label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d) => {
                  const active = week.days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className="rounded-full border-[1.5px] px-3 py-1.5 text-[0.72rem] font-bold"
                      style={
                        active
                          ? { background: "var(--pp-lavender)", borderColor: "var(--pp-lavender)", color: "var(--pp-lavender-ink)" }
                          : { background: "var(--pp-surface)", borderColor: "var(--pp-line)", color: "var(--pp-ink-soft)" }
                      }
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">Remarks</label>
              <OutlineTextarea
                value={week.remarks}
                onChange={(v) => updateWeek("remarks", v)}
                placeholder="Post-lesson adjustments, class progress observations..."
              />
            </div>

            <div>
              <p className="mb-2.5 text-[0.72rem] font-bold text-[var(--pp-ink-soft)]">{"5E's Instructional Framework"}</p>
              <div className="flex flex-col gap-2">
                {FIVE_ES.map((f) => (
                  <div key={f.key} className="rounded-xl border border-[var(--pp-line)] bg-[var(--pp-surface)] px-2.5 py-2">
                    <span className="mb-0.5 block text-[0.68rem] font-bold text-[var(--pp-lavender-ink)]">{f.label}</span>
                    <input
                      type="text"
                      value={week.fiveEs[f.key]}
                      onChange={(e) => updateWeekFiveE(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-transparent text-[0.8rem] text-[var(--pp-ink)] outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveWeek}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border-none py-2.5 text-[0.82rem] font-bold"
              style={
                justSaved
                  ? { background: "var(--pp-mint)", color: "var(--pp-mint-ink)" }
                  : { background: "var(--pp-seafoam)", color: "var(--pp-seafoam-ink)" }
              }
            >
              <Check size={14} strokeWidth={2.4} /> {justSaved ? "Saved!" : `Save Week ${activeWeek}`}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function summaryCellText(val) {
  return val && val.trim() ? val : "—";
}

function OutlineSummaryList({ weeks, onBack, onSelectWeek }) {
  const cols = ["Week", "Topic", "Learning Outcome", "Assessments", "Lab Activity", "Date & Day", "Remarks", "5E's", ""];
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-1.5 text-[0.74rem] font-bold text-[var(--pp-ink-soft)]"
      >
        <ChevronLeft size={13} strokeWidth={2.2} /> Back
      </button>
      <div className="overflow-x-auto rounded-xl border-[1.5px] border-[var(--pp-line)]">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap border-b border-[var(--pp-line)] bg-[var(--pp-paper)] px-2.5 py-2 text-left text-[0.62rem] font-extrabold uppercase tracking-[0.03em] text-[var(--pp-ink-soft)]"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => {
              const week = weeks[w];
              const topicList = week.topics.map((t, i) => `${i + 1}. ${t.title || "(untitled)"}`);
              const dateLabel = week.date ? fmtShortDate(week.date) : "";
              const daysLabel = week.days.length ? week.days.map((d) => d.slice(0, 3)).join(", ") : "";
              const dateDayText = [dateLabel, daysLabel].filter(Boolean).join(" · ");
              const fiveEsList = FIVE_ES.filter((f) => week.fiveEs[f.key] && week.fiveEs[f.key].trim()).map(
                (f) => `${f.label}: ${week.fiveEs[f.key]}`
              );
              return (
                <tr key={w}>
                  <td className="min-w-[90px] max-w-[220px] whitespace-nowrap border-b border-[var(--pp-line)] px-2.5 py-2 pp-font-display text-[0.72rem] font-bold text-[var(--pp-ink)]">
                    Week {w}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {topicList.length ? topicList.map((t, i) => <div key={i}>{t}</div>) : "—"}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {summaryCellText(week.outcomes)}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {summaryCellText(week.assessments)}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {summaryCellText(week.labs)}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {dateDayText || "—"}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {summaryCellText(week.remarks)}
                  </td>
                  <td className="min-w-[130px] max-w-[220px] border-b border-[var(--pp-line)] px-2.5 py-2 text-[0.72rem] leading-[1.45] text-[var(--pp-ink)]">
                    {fiveEsList.length ? fiveEsList.map((t, i) => <div key={i}>{t}</div>) : "—"}
                  </td>
                  <td className="min-w-[90px] border-b border-[var(--pp-line)] px-2.5 py-2">
                    <button
                      type="button"
                      onClick={() => onSelectWeek(w)}
                      className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-2.5 py-1 text-[0.68rem] font-bold text-[var(--pp-ink-soft)]"
                    >
                      <PencilLine size={11} strokeWidth={2.2} /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmtShortDate(dateStr) {
  if (!dateStr) return "";
  return dateFromISO(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function officeItemSubtext(tabKey, item) {
  const parts = [];
  if (item.date) parts.push(fmtShortDate(item.date));
  if (tabKey === "meetings" && item.time) parts.push(fmtTime(item.time).num + " " + fmtTime(item.time).ampm);
  if (item.location) parts.push(item.location);
  return parts.join(" · ");
}

function OfficeAddForm({ tabKey, onAdd, onCancel }) {
  const fields = OFFICE_TAB_FIELDS[tabKey];
  const [draft, setDraft] = useState(() => Object.fromEntries(fields.map((f) => [f.key, ""])));

  const submit = () => {
    if (!draft.title.trim()) return;
    onAdd({ id: uid(), done: false, ...draft, title: draft.title.trim() });
  };

  return (
    <div className="pp-card flex flex-col gap-2.5">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-[0.7rem] font-bold text-[var(--pp-ink-soft)]">{f.label}</label>
          <input
            type={f.type}
            value={draft[f.key]}
            placeholder={f.placeholder}
            onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
            className="w-full rounded-xl border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-surface)] px-3 py-2 text-[0.82rem] font-medium text-[var(--pp-ink)]"
          />
        </div>
      ))}
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-[1.5px] border-[var(--pp-line)] py-2 text-[0.78rem] font-bold text-[var(--pp-ink-soft)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="flex-1 rounded-xl py-2 text-[0.78rem] font-bold text-[var(--pp-surface)]"
          style={{ background: "var(--pp-ink)" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function OfficeItemRow({ tabKey, item, onToggle, onDelete }) {
  const subtext = officeItemSubtext(tabKey, item);
  return (
    <div className="flex items-center gap-2.5 border-b border-[var(--pp-line)] py-2.5 last:border-b-0">
      <CheckBox checked={item.done} onClick={onToggle} size={20} />
      <div className="min-w-0 flex-1">
        <p className={"truncate text-[0.83rem] font-semibold text-[var(--pp-ink)]" + (item.done ? " line-through opacity-50" : "")}>
          {item.title}
        </p>
        {subtext && <p className="truncate text-[0.68rem] text-[var(--pp-ink-soft)]">{subtext}</p>}
      </div>
      <button type="button" onClick={onDelete} aria-label="Delete" className="shrink-0 text-[var(--pp-ink-soft)]">
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

function OfficeHeadDashboard({ officeHead, setOfficeHead, activeOfficeTab, setActiveOfficeTab }) {
  const [adding, setAdding] = useState(false);
  const tab = OFFICE_HEAD_TABS.find((t) => t.key === activeOfficeTab) || OFFICE_HEAD_TABS[0];
  const swatch = swatchByKey(tab.accent);
  const items = officeHead[activeOfficeTab] || [];

  const selectTab = (key) => {
    setActiveOfficeTab(key);
    setAdding(false);
  };
  const addItem = (item) => {
    setOfficeHead((prev) => ({ ...prev, [activeOfficeTab]: [...(prev[activeOfficeTab] || []), item] }));
    setAdding(false);
  };
  const toggleItem = (id) =>
    setOfficeHead((prev) => ({
      ...prev,
      [activeOfficeTab]: (prev[activeOfficeTab] || []).map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
    }));
  const deleteItem = (id) =>
    setOfficeHead((prev) => ({ ...prev, [activeOfficeTab]: (prev[activeOfficeTab] || []).filter((it) => it.id !== id) }));

  return (
    <section>
      <SectionTitle icon={Briefcase} fill="var(--pp-seafoam)" ink="var(--pp-seafoam-ink)" title="Office Head Workspace" />

      <div className="mb-3 flex gap-1.5">
        {OFFICE_HEAD_TABS.map((t) => {
          const active = t.key === activeOfficeTab;
          const s = swatchByKey(t.accent);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[0.72rem] font-bold"
              style={
                active
                  ? { background: s.fill, color: s.ink }
                  : { background: "var(--pp-surface)", border: "1.5px solid var(--pp-line)", color: "var(--pp-ink-soft)" }
              }
            >
              <t.Icon size={13} strokeWidth={2.2} /> {t.label}
            </button>
          );
        })}
      </div>

      {adding ? (
        <OfficeAddForm tabKey={activeOfficeTab} onAdd={addItem} onCancel={() => setAdding(false)} />
      ) : (
        <>
          <div className="pp-card">
            {items.length === 0 ? (
              <p className="py-3 text-center text-[0.78rem] text-[var(--pp-ink-soft)]">Nothing here yet.</p>
            ) : (
              items.map((item) => (
                <OfficeItemRow
                  key={item.id}
                  tabKey={activeOfficeTab}
                  item={item}
                  onToggle={() => toggleItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[var(--pp-line)] py-3 text-[0.8rem] font-bold text-[var(--pp-ink-soft)]"
            style={{ color: swatch.ink }}
          >
            <Plus size={16} strokeWidth={2.2} /> Add {tab.singular}
          </button>
        </>
      )}
    </section>
  );
}

function CustomizeSheet({ customize, setCustomize, onClose, onReset }) {
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

        <section className="mb-4.5">
          <p className="mb-2.5 text-[0.72rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Reset</p>
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-[14px] border-[1.5px] py-3 text-[0.82rem] font-bold"
            style={{ borderColor: "color-mix(in srgb, var(--pp-blush-ink) 45%, var(--pp-line))", color: "var(--pp-blush-ink)" }}
          >
            Clear all planner data
          </button>
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

function SyncedTimelineRow({ item, isFirst, isLast, onOpen }) {
  const cat = CATS[item.cat];
  const t = fmtTime(item.time24);
  return (
    <div className="pp-row-grid relative grid gap-x-0.5 px-0.5 py-2.5">
      <div className="pr-2 text-right text-[0.72rem] font-bold leading-tight text-[var(--pp-ink-soft)] tabular-nums">
        <div>{t.num}</div>
        <div>{t.ampm}</div>
      </div>
      <div className="relative flex justify-center">
        <span className={`pp-rail-line ${isFirst ? "first" : ""} ${isLast ? "last" : ""}`} aria-hidden="true" />
        <span
          className="relative z-[1] mt-1 h-[11px] w-[11px] rounded-full border-2"
          style={{ borderColor: "var(--pp-surface)", boxShadow: `0 0 0 1.5px ${cat.ink}` }}
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        className="flex cursor-pointer items-center gap-2.5 rounded-[14px] border border-dashed px-2.5 py-2.5"
        style={{ borderColor: "var(--pp-line)" }}
      >
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[10px] text-[16px] leading-none" style={{ background: cat.fill, color: cat.ink }}>
          <cat.Icon size={16} strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.83rem] font-semibold text-[var(--pp-ink)]">{item.title}</span>
          <span className="text-[0.66rem] font-bold uppercase tracking-[.03em]" style={{ color: cat.ink }}>
            Work Notes
          </span>
        </span>
        <Folder size={14} strokeWidth={2} className="shrink-0 text-[var(--pp-ink-soft)]" />
      </div>
    </div>
  );
}

function TimelineRow({ item, isFirst, isLast, editing, onToggleDone, onToggleSub, onStartEdit, onSave, onCancel, onDelete }) {
  const [draftTime, setDraftTime] = useState(item.time24);
  const [draftTitle, setDraftTitle] = useState(item.title);
  const [draftCat, setDraftCat] = useState(item.cat);
  const [draftDays, setDraftDays] = useState(item.days || []);
  const [draftDate, setDraftDate] = useState(item.date || "");
  const [draftVenue, setDraftVenue] = useState(item.venue || "");
  const [draftSubs, setDraftSubs] = useState(() => item.subs || (item.sub?.title ? [{ ...item.sub, id: uidAtt() }] : []));
  const [openSubColorIndex, setOpenSubColorIndex] = useState(null);
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
      setDraftDays(item.days || []);
      setDraftDate(item.date || "");
      setDraftVenue(item.venue || "");
      setDraftSubs(item.subs || (item.sub?.title ? [{ ...item.sub, id: uidAtt() }] : []));
      setOpenSubColorIndex(null);
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

  function toggleDraftDay(day) {
    setDraftDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function addSub() {
    setDraftSubs((prev) => [...prev, { id: uidAtt(), title: "", done: false, color: null }]);
  }
  function updateSubTitle(i, title) {
    setDraftSubs((prev) => prev.map((s, idx) => (idx === i ? { ...s, title } : s)));
  }
  function updateSubColor(i, color) {
    setDraftSubs((prev) => prev.map((s, idx) => (idx === i ? { ...s, color: color || null } : s)));
    setOpenSubColorIndex(null);
  }
  function removeSub(i) {
    setDraftSubs((prev) => prev.filter((_, idx) => idx !== i));
    setOpenSubColorIndex(null);
  }

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

          <p className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Day</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d) => {
              const active = draftDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDraftDay(d)}
                  className="rounded-full border-[1.5px] px-2.5 py-1 text-[0.68rem] font-bold"
                  style={
                    active
                      ? { background: "var(--pp-lavender)", borderColor: "var(--pp-lavender)", color: "var(--pp-lavender-ink)" }
                      : { background: "var(--pp-surface)", borderColor: "var(--pp-line)", color: "var(--pp-ink-soft)" }
                  }
                >
                  {d.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <div className="mb-2 flex gap-2">
            <input
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] px-2 py-1.5 text-[0.78rem] font-bold text-[var(--pp-ink)]"
            />
            <input
              type="text"
              value={draftVenue}
              onChange={(e) => setDraftVenue(e.target.value)}
              placeholder="Venue"
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[var(--pp-line)] bg-[var(--pp-paper)] px-2.5 py-2 text-[0.83rem] font-medium text-[var(--pp-ink)]"
            />
          </div>

          <p className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">Sub-blocks</p>
          <div className="mb-2 flex flex-col gap-1.5">
            {draftSubs.map((s, i) => {
              const swatch = s.color ? swatchByKey(s.color) : null;
              return (
                <div key={s.id} className="rounded-[10px] border-[1.5px] border-dashed border-[var(--pp-line)] bg-[var(--pp-paper)] p-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setOpenSubColorIndex((v) => (v === i ? null : i))}
                      aria-label="Sub-block color"
                      className="h-5 w-5 shrink-0 rounded-full border-[1.5px]"
                      style={{ background: swatch ? swatch.fill : "transparent", borderColor: swatch ? swatch.fill : "var(--pp-line)" }}
                    />
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) => updateSubTitle(i, e.target.value)}
                      placeholder="Sub-block title"
                      className="min-w-0 flex-1 bg-transparent text-[0.8rem] font-medium text-[var(--pp-ink)] outline-none"
                    />
                    <button type="button" onClick={() => removeSub(i)} aria-label="Remove sub-block" className="shrink-0 text-[var(--pp-ink-soft)]">
                      <X size={13} strokeWidth={2.2} />
                    </button>
                  </div>
                  {openSubColorIndex === i && (
                    <div className="mt-1.5 flex flex-wrap gap-1 border-t border-dashed border-[var(--pp-line)] pt-1.5">
                      <ColorSwatchRow size={16} value={s.color || ""} onChange={(key) => updateSubColor(i, key)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addSub}
            className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[var(--pp-line)] py-2 text-[0.74rem] font-bold text-[var(--pp-ink-soft)]"
          >
            <Plus size={12} strokeWidth={2.2} /> Add sub-block
          </button>

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
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
                {EMOJI_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setEmojiTab(t.key)}
                    className="w-[34px] shrink-0 rounded-[10px] border-[1.5px] py-1.5 text-[15px]"
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
                  days: draftDays,
                  date: draftDate,
                  venue: draftVenue.trim(),
                  subs: draftSubs.map((s) => ({ ...s, title: s.title.trim() })).filter((s) => s.title),
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
  const metaParts = [];
  if (item.venue) metaParts.push(item.venue);
  if (item.days && item.days.length) metaParts.push(item.days.map((d) => d.slice(0, 3)).join(", "));
  if (item.date) metaParts.push(fmtShortDate(item.date));
  const metaLine = metaParts.join(" · ");

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
            {metaLine && <span className="block text-[0.66rem] font-semibold text-[var(--pp-ink-soft)]">{metaLine}</span>}
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
        {item.subs?.length > 0 && (
          <div className="ml-10 flex flex-col gap-1">
            {item.subs.map((s) => {
              const subSwatch = s.color ? swatchByKey(s.color) : null;
              return (
                <div
                  key={s.id}
                  className="flex min-h-[26px] items-center gap-2 border-l-2 border-dashed pl-2.5"
                  style={{ borderColor: subSwatch ? subSwatch.ink : "var(--pp-line)" }}
                >
                  <CheckBox
                    checked={s.done}
                    onClick={() => onToggleSub(s.id)}
                    size={18}
                    tone={subSwatch ? subSwatch.ink : "var(--pp-mint-ink)"}
                    label={`Mark ${s.title} done`}
                  />
                  <span className="text-[0.76rem] font-medium text-[var(--pp-ink-soft)]" style={s.done ? { textDecoration: "line-through" } : undefined}>
                    {s.title}
                  </span>
                </div>
              );
            })}
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

function TodoGroup({ label, dotColor, items, checked, onToggle, onOpenSource }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dotColor }} />
        <span className="text-[0.72rem] font-extrabold uppercase tracking-[.04em] text-[var(--pp-ink-soft)]">{label}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-[0.8rem] italic text-[var(--pp-ink-soft)]">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <li key={item.id} className="flex select-none items-start gap-2.5">
                <CheckBox checked={isChecked} onClick={() => onToggle(item.id)} size={20} tone="var(--pp-mint-ink)" label={item.text} />
                <p
                  className="cursor-pointer text-[0.83rem] font-medium leading-[1.38] text-[var(--pp-ink)]"
                  style={isChecked ? { color: "var(--pp-ink-soft)", textDecoration: "line-through" } : undefined}
                  onClick={() => (item.sourceClassId && onOpenSource ? onOpenSource(item) : onToggle(item.id))}
                >
                  {item.text}
                  {item.due && <span className="mt-0.5 block text-[0.7rem] font-semibold text-[var(--pp-ink-soft)]">{item.due}</span>}
                </p>
              </li>
            );
          })}
        </ul>
      )}
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
        --pp-paper: #F8F3F6; --pp-frame: transparent; --pp-surface: #FFFFFF; --pp-surface-alt: #F3ECFA;
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
          --pp-paper: #1E1926; --pp-frame: transparent; --pp-surface: #2A2334; --pp-surface-alt: #322A40;
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
        --pp-paper: #1E1926; --pp-frame: transparent; --pp-surface: #2A2334; --pp-surface-alt: #322A40;
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

      @keyframes pp-bell-pulse {
        0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--pp-gold-ink) 45%, transparent); }
        50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--pp-gold-ink) 0%, transparent); }
      }
      .pp-bell-pulse { animation: pp-bell-pulse 1.4s ease-in-out infinite; }
    `}</style>
  );
}
