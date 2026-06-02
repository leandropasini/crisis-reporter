import { IconHome, IconBuildingCommunity, IconMap2 } from "@tabler/icons-react";

interface Props {
  active: "home" | "report" | "map";
  onHome?: () => void;
  onReport?: () => void;
  onMap?: () => void;
}

export default function BottomNav({ active, onHome, onReport, onMap }: Props) {
  const items = [
    { id: "home" as const, Icon: IconHome, label: "Home", onClick: onHome },
    { id: "report" as const, Icon: IconBuildingCommunity, label: "Report", onClick: onReport },
    { id: "map" as const, Icon: IconMap2, label: "Map", onClick: onMap },
  ];

  return (
    <nav
      style={{
        flexShrink: 0,
        display: "flex",
        borderTop: "1px solid var(--cr-border)",
        background: "var(--cr-bg)",
      }}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "10px 0",
              minHeight: "var(--min-touch)",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: isActive ? "var(--cr-primary)" : "rgba(255,255,255,0.4)",
              transition: "color 0.15s",
            }}
          >
            <item.Icon size={22} />
            <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
