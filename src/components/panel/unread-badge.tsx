import { badgeLabel } from "@/lib/unread";
import { usePanelI18n } from "@/lib/panel-i18n";

export function UnreadBadge({ count }: { count: number }) {
  const { p } = usePanelI18n();
  const label = badgeLabel(count);
  if (!label) return null;
  return (
    <span className="unread-badge">
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">{p.chat.unread(label)}</span>
    </span>
  );
}
