import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  closestCorners,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Download, GripVertical, ListTodo, Plus, Trash2, Upload, X } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { keelExportName, keelFromCsv, keelToCsv, parseKeelImport, snapshotFromState } from "@/lib/keel/io";
import { isDoneColumn, useKeel } from "@/lib/keel/store";
import type { KeelCard, KeelCheck, KeelColumn } from "@/lib/keel/types";
import { cn } from "@/lib/utils";

function ListMark({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "flex size-[1.35rem] items-center justify-center rounded-full border-[1.5px]",
        done ? "border-[#e3b23c] bg-[#e3b23c] text-[#1a1404]" : "border-[#8e96a0] bg-transparent",
      )}
      aria-hidden
    >
      {done ? <Check className="size-3" strokeWidth={3} /> : null}
    </span>
  );
}

function listHint(checks: KeelCheck[]): string {
  const done = checks.filter((item) => item.done).length;
  return `${done}/${checks.length}`;
}

function CardFace({ card, muted }: { card: KeelCard; muted?: boolean }) {
  return (
    <div className={cn("rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]", muted && "opacity-60")}>
      <p className="truncate text-sm font-medium leading-snug">{card.title}</p>
      {card.checks?.length ? (
        <p className="mt-1 text-xs text-muted-foreground">{listHint(card.checks)}</p>
      ) : card.note ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.note}</p>
      ) : null}
    </div>
  );
}

function SortableCard({
  card,
  dndReady,
  onOpen,
}: {
  card: KeelCard;
  dndReady: boolean;
  onOpen: (card: KeelCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")}>
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          className="flex w-8 shrink-0 items-center justify-center rounded-lg text-subtle touch-none"
          style={{ touchAction: "none" }}
          aria-label="Drag card"
          {...(dndReady ? attributes : {})}
          {...(dndReady ? listeners : {})}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 rounded-xl bg-card px-3 py-3 text-left shadow-[var(--shadow-border)]"
          onClick={() => onOpen(card)}
        >
          <p className="truncate text-sm font-medium leading-snug">{card.title}</p>
          {card.checks?.length ? (
            <p className="mt-1 text-xs text-muted-foreground">{listHint(card.checks)}</p>
          ) : card.note ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.note}</p>
          ) : null}
        </button>
      </div>
    </div>
  );
}

function ColumnDrop({
  column,
  cards,
  dndReady,
  onOpen,
  onAdd,
}: {
  column: KeelColumn;
  cards: KeelCard[];
  dndReady: boolean;
  onOpen: (card: KeelCard) => void;
  onAdd: (columnId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: column.id,
      data: { type: "column", column },
    });
  const renameColumn = useKeel((s) => s.renameColumn);
  const deleteColumn = useKeel((s) => s.deleteColumn);
  const [title, setTitle] = useState(column.title);

  useEffect(() => {
    setTitle(column.title);
  }, [column.title]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex w-full rounded-2xl bg-muted/60",
        isDragging && "z-10 opacity-40",
        isOver && !isDragging && "shadow-[var(--shadow-border-hover)]",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="flex w-11 shrink-0 touch-none items-center justify-center self-stretch rounded-l-2xl text-subtle active:scale-100"
        style={{ touchAction: "none" }}
        aria-label={`Move ${column.title}`}
        {...(dndReady ? attributes : {})}
        {...(dndReady ? listeners : {})}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col py-3 pr-3">
        <div className="mb-2 flex items-center gap-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim() && title.trim() !== column.title) renameColumn(column.id, title);
              else setTitle(column.title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="h-10 min-h-10 border-transparent bg-transparent px-2 text-sm font-medium shadow-none"
            aria-label={`${column.title} column name`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-subtle hover:text-expense"
            aria-label={`Delete ${column.title}`}
            onClick={() => deleteColumn(column.id)}
          >
            <Trash2 />
          </Button>
        </div>
        <div className="flex min-h-24 flex-1 flex-col gap-2">
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} dndReady={dndReady} onOpen={onOpen} />
            ))}
          </SortableContext>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 justify-start text-muted-foreground"
          onClick={() => onAdd(column.id)}
        >
          <Plus />
          Add card
        </Button>
      </div>
    </section>
  );
}

type EditorState = {
  mode: "new" | "edit";
  columnId: string;
  card?: KeelCard;
  title: string;
  note: string;
  doneAt: string;
  checks: KeelCheck[];
  list: boolean;
};

function ChecklistFields({
  items,
  onChange,
}: {
  items: KeelCheck[];
  onChange: (next: KeelCheck[]) => void;
}) {
  const rowRefs = useRef(new Map<string, HTMLInputElement>());
  const focusId = useRef<string | null>(null);

  useEffect(() => {
    const id = focusId.current;
    if (!id) return;
    focusId.current = null;
    const el = rowRefs.current.get(id);
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  });

  function focus(id: string) {
    focusId.current = id;
  }

  function addFromDraft(value: string) {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 40 - items.length);
    if (!lines.length) return;
    const added = lines.map((text) => ({ id: crypto.randomUUID(), text, done: false }));
    onChange([...items, ...added]);
    focus(added[added.length - 1]!.id);
  }

  function remove(id: string) {
    const index = items.findIndex((item) => item.id === id);
    const next = items.filter((item) => item.id !== id);
    onChange(next);
    const prev = next[index - 1];
    focus(prev ? prev.id : "draft");
  }

  const rows = [...items, { id: "draft", text: "", done: false }];

  return (
    <ul>
      {rows.map((item, index) => {
        const isDraft = item.id === "draft";
        return (
          <li key={item.id} className="flex items-center">
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              aria-label={isDraft ? "New item" : item.done ? `Uncheck ${item.text}` : `Check ${item.text}`}
              className="flex size-11 shrink-0 items-center justify-center"
              onClick={() => {
                if (isDraft) return;
                onChange(items.map((row) => (row.id === item.id ? { ...row, done: !row.done } : row)));
              }}
            >
              <ListMark done={item.done} />
            </button>
            <input
              ref={(node) => {
                if (node) rowRefs.current.set(item.id, node);
                else rowRefs.current.delete(item.id);
              }}
              value={item.text}
              aria-label={isDraft ? "New item" : `Item ${index + 1}`}
              maxLength={80}
              className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-subtle"
              onChange={(event) => {
                const value = event.target.value;
                if (isDraft) {
                  addFromDraft(value);
                  return;
                }
                onChange(items.map((row) => (row.id === item.id ? { ...row, text: value.slice(0, 80) } : row)));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  const next = items[index + 1];
                  if (!isDraft && next) focus(next.id);
                  else rowRefs.current.get("draft")?.focus();
                  return;
                }
                if (event.key === "Backspace" && !isDraft && item.text === "") {
                  event.preventDefault();
                  remove(item.id);
                }
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}

function CardEditor({
  editor,
  columnTitle,
  showDone,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  editor: EditorState;
  columnTitle?: string;
  showDone: boolean;
  onChange: (next: EditorState) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => titleRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = editor.title.trim().length > 0;

  function toggleList() {
    if (editor.list) {
      const lines = editor.checks.map((item) => item.text.trim()).filter(Boolean);
      const note = [editor.note.trim(), ...lines].filter(Boolean).join("\n").slice(0, 400);
      onChange({ ...editor, list: false, checks: [], note });
      return;
    }
    const lines = editor.note
      .split(/\r?\n/)
      .map((line) => line.trim().slice(0, 80))
      .filter(Boolean);
    const checks = editor.checks.length
      ? editor.checks
      : lines.map((text) => ({ id: crypto.randomUUID(), text, done: false }));
    onChange({ ...editor, list: true, checks, note: "" });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex bg-background/80 sm:items-start sm:justify-center sm:px-4 sm:pt-[10dvh] sm:pb-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-editor-title"
        className="flex min-h-0 w-full flex-1 flex-col bg-card text-card-foreground sm:max-h-[min(40rem,80dvh)] sm:max-w-md sm:flex-none sm:rounded-2xl sm:shadow-[var(--shadow-border)]"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) onSave();
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-2 pt-[max(0.35rem,env(safe-area-inset-top))] sm:rounded-t-2xl sm:pt-2">
          <div className="flex w-16 justify-start">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="min-w-0 flex-1 text-center">
            <h2 id="card-editor-title" className="truncate text-sm font-medium">
              {editor.mode === "edit" ? "Edit card" : "New card"}
            </h2>
            {columnTitle ? (
              <p className="truncate text-xs text-muted-foreground">{columnTitle}</p>
            ) : null}
          </div>
          <div className="flex w-16 justify-end">
            <Button type="submit" variant="ghost" size="sm" disabled={!canSave}>
              Save
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          <input
            ref={titleRef}
            id="card-title"
            value={editor.title}
            onChange={(event) => onChange({ ...editor, title: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.form?.querySelector<HTMLInputElement>('input[aria-label="New item"]')?.focus();
              }
            }}
            maxLength={120}
            placeholder="Title"
            autoComplete="off"
            aria-label="Title"
            className="w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground outline-none placeholder:text-subtle"
          />
          {editor.list ? (
            <ChecklistFields items={editor.checks} onChange={(checks) => onChange({ ...editor, checks })} />
          ) : (
            <textarea
              id="card-note"
              value={editor.note}
              onChange={(event) => onChange({ ...editor, note: event.target.value })}
              maxLength={400}
              placeholder="Scrie"
              aria-label="Note"
              className="min-h-40 w-full flex-1 resize-none bg-transparent py-2 text-base text-foreground outline-none placeholder:text-subtle"
            />
          )}
          {showDone ? (
            <div className="grid gap-1.5">
              <Label htmlFor="card-done">Done date</Label>
              <Input
                id="card-done"
                type="date"
                value={editor.doneAt}
                onChange={(event) => onChange({ ...editor, doneAt: event.target.value })}
              />
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-border px-3 pt-2 safe-bottom sm:rounded-b-2xl">
          <div className="mb-1 flex items-center">
            <button
              type="button"
              aria-pressed={editor.list}
              aria-label="Listă"
              onClick={toggleList}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium",
                editor.list ? "bg-[#e3b23c] text-[#1a1404]" : "text-foreground",
              )}
            >
              <ListTodo className="size-5" />
              Listă
            </button>
          </div>
          {editor.mode === "edit" ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-11 items-center gap-2 px-2 text-sm font-medium text-expense"
            >
              <Trash2 className="size-4" />
              Delete card
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export function KeelBoard() {
  const hydrate = useKeel((s) => s.hydrate);
  const persistOk = useKeel((s) => s.persistOk);
  const columns = useKeel((s) => s.columns);
  const cards = useKeel((s) => s.cards);
  const addColumn = useKeel((s) => s.addColumn);
  const addCard = useKeel((s) => s.addCard);
  const updateCard = useKeel((s) => s.updateCard);
  const deleteCard = useKeel((s) => s.deleteCard);
  const moveCard = useKeel((s) => s.moveCard);
  const moveColumn = useKeel((s) => s.moveColumn);
  const replaceBoard = useKeel((s) => s.replaceBoard);

  const [activeCard, setActiveCard] = useState<KeelCard | null>(null);
  const [activeColumn, setActiveColumn] = useState<KeelColumn | null>(null);
  const [dndReady, setDndReady] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [newCol, setNewCol] = useState("");
  const [ioMsg, setIoMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setDndReady(true);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  );

  const cardsByCol = useMemo(() => {
    const map = new Map<string, KeelCard[]>();
    for (const col of columns) map.set(col.id, []);
    for (const card of cards) {
      const list = map.get(card.columnId);
      if (list) list.push(card);
    }
    return map;
  }, [columns, cards]);

  const editorColumn = editor
    ? editor.mode === "new"
      ? columns.find((c) => c.id === editor.columnId)
      : columns.find((c) => c.id === editor.card?.columnId)
    : undefined;
  const editorIsDone = editorColumn ? isDoneColumn(editorColumn) : Boolean(editor?.doneAt);

  const collisionDetection: CollisionDetection = (args) => {
    if (args.active.data.current?.type === "column") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.data.current?.type === "column",
        ),
      });
    }
    return closestCorners(args);
  };

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "column") {
      setActiveColumn(data.column as KeelColumn);
      return;
    }
    const card = data?.card as KeelCard | undefined;
    if (card) setActiveCard(card);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    setActiveColumn(null);
    const { active: a, over } = event;
    if (!over || a.id === over.id) return;
    if (a.data.current?.type === "column") {
      const from = columns.findIndex((c) => c.id === String(a.id));
      const to = columns.findIndex((c) => c.id === String(over.id));
      if (from < 0 || to < 0) return;
      moveColumn(String(a.id), to);
      return;
    }
    const cardId = String(a.id);
    const overId = String(over.id);
    const overColumn = columns.some((c) => c.id === overId)
      ? overId
      : cards.find((c) => c.id === overId)?.columnId;
    if (!overColumn) return;
    const list = cardsByCol.get(overColumn) ?? [];
    let index = list.findIndex((c) => c.id === overId);
    if (index < 0) index = list.length;
    else if (a.id !== over.id) {
      const fromCol = cards.find((c) => c.id === cardId)?.columnId;
      if (fromCol === overColumn) {
        const fromIndex = list.findIndex((c) => c.id === cardId);
        if (fromIndex >= 0 && fromIndex < index) index -= 1;
      }
    }
    moveCard(cardId, overColumn, index);
  }

  function saveEditor() {
    if (!editor) return;
    const title = editor.title.trim();
    if (!title) return;
    if (editor.mode === "new") {
      const created = addCard(editor.columnId, title, editor.note);
      if (created) {
        updateCard(created.id, {
          doneAt: editor.doneAt || null,
          checks: editor.list ? editor.checks : [],
        });
      }
    } else if (editor.card) {
      updateCard(editor.card.id, {
        title,
        note: editor.note,
        doneAt: editor.doneAt || null,
        checks: editor.list ? editor.checks : [],
      });
    }
    setEditor(null);
  }

  async function onExport() {
    const snap = snapshotFromState(columns, cards);
    if (snap.cards.length === 0) {
      setIoMsg("Add a card, then export.");
      return;
    }
    const csv = keelToCsv(snap);
    const filename = keelExportName();
    const file = new File([csv], filename, { type: "text/csv" });
    if (typeof navigator.share === "function") {
      let canShare = true;
      try {
        canShare = !navigator.canShare || navigator.canShare({ files: [file] });
      } catch {
        canShare = false;
      }
      if (canShare) {
        try {
          await navigator.share({ files: [file], title: "Keel" });
          setIoMsg("Pick Save to Files. Keel stays open.");
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(csv);
      setIoMsg("CSV copied. Paste it into Numbers.");
    } catch {
      setIoMsg("Couldn't share the file from this screen.");
    }
  }

  async function onImportFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const trimmed = text.replace(/^\uFEFF/, "").trim();
      const snap = trimmed.startsWith("{") ? parseKeelImport(JSON.parse(trimmed)) : keelFromCsv(text);
      if (!replaceBoard(snap)) {
        setIoMsg("That file is not a Keel board.");
        return;
      }
      setIoMsg(`Imported ${snap.cards.length} cards.`);
    } catch (err) {
      setIoMsg(err instanceof Error ? err.message : "Could not import that file.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <AppNav book="keel" persistOk={persistOk} />
          <div className="flex shrink-0 items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="sr-only"
              onChange={(e) => {
                void onImportFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload />
              Import
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void onExport()}>
              <Download />
              Export CSV
            </Button>
          </div>
        </div>
        {ioMsg ? (
          <p
            role="status"
            className="mx-auto mb-2 max-w-6xl rounded-lg border border-[#8fa89a] bg-[#1c2822] px-4 py-2 text-sm text-[#e7f2ea] sm:px-6"
          >
            {ioMsg}
          </p>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
              setActiveCard(null);
              setActiveColumn(null);
            }}
          >
            <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {columns.map((column) => (
                <ColumnDrop
                  key={column.id}
                  column={column}
                  cards={cardsByCol.get(column.id) ?? []}
                  dndReady={dndReady}
                  onOpen={(card) =>
                    setEditor({
                      mode: "edit",
                      columnId: card.columnId,
                      card,
                      title: card.title,
                      note: card.note ?? "",
                      doneAt: card.doneAt ?? "",
                      checks: card.checks ?? [],
                      list: Boolean(card.checks?.length),
                    })
                  }
                  onAdd={(columnId) => {
                    const col = columns.find((c) => c.id === columnId);
                    const today = new Date();
                    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                    setEditor({
                      mode: "new",
                      columnId,
                      title: "",
                      note: "",
                      doneAt: col && isDoneColumn(col) ? iso : "",
                      checks: [],
                      list: false,
                    });
                  }}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeCard ? <CardFace card={activeCard} /> : null}
              {activeColumn ? (
                <div className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border-hover)]">
                  <p className="text-sm font-medium">{activeColumn.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <form
            className="flex w-full flex-col gap-2 rounded-2xl border border-dashed border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (addColumn(newCol)) setNewCol("");
            }}
          >
            <Label htmlFor="new-col" className="text-xs text-muted-foreground">
              New column
            </Label>
            <Input
              id="new-col"
              value={newCol}
              onChange={(e) => setNewCol(e.target.value)}
              placeholder="Waiting, later…"
              maxLength={40}
              className="h-11 min-h-11"
            />
            <Button type="submit" variant="outline" size="sm" disabled={!newCol.trim()}>
              <Plus />
              Add column
            </Button>
          </form>
        </div>
      </main>

      {editor ? (
        <CardEditor
          editor={editor}
          columnTitle={editorColumn?.title}
          showDone={editorIsDone}
          onChange={setEditor}
          onClose={() => setEditor(null)}
          onSave={saveEditor}
          onDelete={() => {
            if (editor.mode === "edit" && editor.card) deleteCard(editor.card.id);
            setEditor(null);
          }}
        />
      ) : null}
    </div>
  );
}
