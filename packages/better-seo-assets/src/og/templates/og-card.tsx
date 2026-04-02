import type { ReactNode } from "react"

export interface OgCardPalette {
  readonly bg: string
  readonly fg: string
  readonly muted: string
  readonly accent: string
}

export interface OgCardProps {
  readonly title: string
  readonly description?: string
  readonly siteName: string
  readonly logoDataUrl?: string
  readonly palette: OgCardPalette
  readonly width: number
  readonly height: number
}

/** Root frame for Satori (fixed OG dimensions). */
export function OgCard({
  title,
  description,
  siteName,
  logoDataUrl,
  palette,
  width,
  height,
}: OgCardProps): ReactNode {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: palette.bg,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 28, color: palette.muted, fontWeight: 400 }}>{siteName}</span>
        {logoDataUrl ? (
          <img src={logoDataUrl} width={112} height={112} alt="" style={{ objectFit: "contain" }} />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flexGrow: 1,
          flexShrink: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: palette.fg,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        {description ? (
          <div style={{ fontSize: 28, color: palette.muted, lineHeight: 1.3, maxWidth: 1020 }}>
            {description}
          </div>
        ) : null}
      </div>
      <div style={{ height: 6, width: 160, background: palette.accent, borderRadius: 3 }} />
    </div>
  )
}
