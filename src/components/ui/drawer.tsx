import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

function Drawer({
  shouldScaleBackground = false,
  repositionInputs = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      repositionInputs={repositionInputs}
      {...props}
    />
  );
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-background/80", className)}
      {...props}
    />
  );
}

function useLiftForKeyboard(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const apply = () => {
      const el = ref.current;
      if (!el) return;
      // Ignore a bogus viewport (common in the iOS preview). A 0 height
      // was collapsing the sheet so Add looked like a dead button.
      if (vv.height < 160) {
        el.style.removeProperty("--keyboard-inset");
        el.style.maxHeight = "";
        el.style.marginTop = "";
        return;
      }
      const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      const keyboard = inset > 140 ? inset : 0;
      el.style.setProperty("--keyboard-inset", `${keyboard}px`);
      if (keyboard > 0) {
        el.style.maxHeight = `${Math.max(240, Math.round(vv.height - 12))}px`;
        el.style.marginTop = "0px";
      } else {
        el.style.maxHeight = "";
        el.style.marginTop = "";
      }
    };

    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    window.addEventListener("focusin", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      window.removeEventListener("focusin", apply);
    };
  }, [ref]);
}

function scrollFocusedField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return;
  if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") return;
  window.setTimeout(() => {
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }, 280);
}

function DrawerContent({
  className,
  children,
  onFocusCapture,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  useLiftForKeyboard(sheetRef);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={sheetRef}
        className={cn(
          "drawer-sheet fixed inset-x-0 bottom-0 z-50 mt-16 flex flex-col overflow-hidden rounded-t-2xl bg-card text-card-foreground shadow-[var(--shadow-border)] outline-none",
          className,
        )}
        {...props}
        onFocusCapture={(e) => {
          onFocusCapture?.(e);
          scrollFocusedField(e.target);
        }}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex shrink-0 flex-col gap-1 px-5 pt-4 pb-2", className)} {...props} />;
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-2 px-5 pt-2 safe-bottom",
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
