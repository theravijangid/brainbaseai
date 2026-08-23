import { cn } from "@/lib/utils";

export function CitationChip({
  citationId,
  label,
  active,
  onClick,
}: {
  citationId: string;
  label: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Open source for citation ${label}`}
      onClick={onClick}
      className={cn(
        "citation-chip",
        active && "citation-chip-active",
        "hover:border-foreground/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {label}
    </button>
  );
}
