import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Download, GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportKeelBoard, parseKeelImport, readFileAsJson, snapshotFromState } from "@/lib/keel/io";
import { isDoneColumn, useKeel } from "@/lib/keel/store";
import type { KeelCard, KeelColumn } from "@/lib/keel/types";
import { formatDayYear } from "@/lib/ledger/format";
import { cn } from "@/lib/utils";

function CardFace({ card, muted }: { card: KeelCard; muted?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]",
        muted && "opacity-60",
      )}
    >
      <p className="text-sm font-medium leading-snug">{card.title}</p>
      {card.note ? (
        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{card.note}</p>
      ) : null}
      {card.doneAt ? (
        <p className="mt-1.5 text-[11px] font-medium tracking-wide text-subtle">
          Done {formatDayYear(card.doneAt)}
        </p>
      ) : null}
    </div>
  );
}

function SortableCard({
  card,
  onOpen,
}: {
  card: KeelCard;
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
          aria-label="Drag card"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpen(card)}
        >
          <CardFace card={card} />
        </button>
      </div>
    </div>
  );
}

function ColumnDrop({
  column,
  cards,
  onOpen,
  onAdd,
}: {
  column: KeelColumn;
  cards: KeelCard[];
  onOpen: (card: KeelCard) => void;
  onAdd: (columnId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });
  const renameColumn = useKeel((s) => s.renameColumn);
  const deleteColumn = useKeel((s) => s.deleteColumn);
  const [title, setTitle] = useState(column.title);

  useEffect(() => {
    setTitle(column.title);
  }, [column.title]);

  return (
    <section
      className={cn(
        "flex w-full flex-col rounded-2xl bg-muted/60 p-3",
        isOver && "shadow-[var(--shadow-border-hover)]",
      )}
    >
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
      <div ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onOpen={onOpen} />
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
    </section>
  );
}

type EditorState =
  | { mode: "new"; columnId: string; title: string; note: string; doneAt: string }
  | { mode: "edit"; card: KeelCard; title: string; note: string; doneAt: string };

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
  const replaceBoard = useKeel((s) => s.replaceBoard);

  const [active, setActive] = useState<KeelCard | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [newCol, setNewCol] = useState("");
  const [ioMsg, setIoMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
      : columns.find((c) => c.id === editor.card.columnId)
    : undefined;
  const editorIsDone = editorColumn ? isDoneColumn(editorColumn) : Boolean(editor?.doneAt);

  function onDragStart(event: DragStartEvent) {
    const card = event.active.data.current?.card as KeelCard | undefined;
    if (card) setActive(card);
  }

  function onDragEnd(event: DragEndEvent) {
    setActive(null);
    const { active: a, over } = event;
    if (!over) return;
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
      if (created && editor.doneAt) updateCard(created.id, { doneAt: editor.doneAt });
    } else {
      updateCard(editor.card.id, {
        title,
        note: editor.note,
        doneAt: editor.doneAt || null,
      });
    }
    setEditor(null);
  }

  async function onExport() {
    const result = await exportKeelBoard(snapshotFromState(columns, cards));
    if (result === "empty") setIoMsg("Nothing to export yet.");
    else if (result === "downloaded" || result === "shared") setIoMsg("Board exported.");
    else setIoMsg(null);
  }

  async function onImportFile(file: File | undefined) {
    if (!file) return;
    try {
      const raw = await readFileAsJson(file);
      const snap = parseKeelImport(raw);
      if (!replaceBoard(snap)) {
        setIoMsg("That file is not a Keel board backup.");
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <AppNav book="keel" persistOk={persistOk} />
          <div className="flex shrink-0 items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
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
              Export
            </Button>
          </div>
        </div>
        {ioMsg ? (
          <p className="mx-auto max-w-6xl px-4 pb-2 text-xs text-muted-foreground sm:px-6">{ioMsg}</p>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActive(null)}
          >
            {columns.map((column) => (
              <ColumnDrop
                key={column.id}
                column={column}
                cards={cardsByCol.get(column.id) ?? []}
                onOpen={(card) =>
                  setEditor({
                    mode: "edit",
                    card,
                    title: card.title,
                    note: card.note ?? "",
                    doneAt: card.doneAt ?? "",
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
                  });
                }}
              />
            ))}
            <DragOverlay>
              {active ? <CardFace card={active} /> : null}
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

      <Drawer open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editor?.mode === "edit" ? "Edit card" : "New card"}</DrawerTitle>
            <DrawerDescription>Saved on this device with the rest of Keel.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-5">
            <div className="grid gap-1.5">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={editor?.title ?? ""}
                onChange={(e) => setEditor((cur) => (cur ? { ...cur, title: e.target.value } : cur))}
                maxLength={120}
                placeholder="What needs doing"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="card-note">Note</Label>
              <Input
                id="card-note"
                value={editor?.note ?? ""}
                onChange={(e) => setEditor((cur) => (cur ? { ...cur, note: e.target.value } : cur))}
                maxLength={400}
                placeholder="Optional"
              />
            </div>
            {editorIsDone ? (
              <div className="grid gap-1.5">
                <Label htmlFor="card-done">Done date</Label>
                <Input
                  id="card-done"
                  type="date"
                  value={editor?.doneAt ?? ""}
                  onChange={(e) => setEditor((cur) => (cur ? { ...cur, doneAt: e.target.value } : cur))}
                />
              </div>
            ) : null}
          </div>
          <DrawerFooter>
            {editor?.mode === "edit" ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (editor.mode === "edit") deleteCard(editor.card.id);
                  setEditor(null);
                }}
              >
                <Trash2 />
                Delete
              </Button>
            ) : null}
            <Button type="button" onClick={saveEditor} disabled={!editor?.title.trim()}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
