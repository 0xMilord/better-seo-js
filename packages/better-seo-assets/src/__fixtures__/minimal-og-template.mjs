import { createElement } from "react"

/** Minimal Satori-safe template for tests; keep beside package `node_modules` so `react` resolves. */
export default function MinimalOg(p) {
  return createElement(
    "div",
    {
      style: {
        width: p.width,
        height: p.height,
        background: p.palette.bg,
        color: p.palette.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 56,
        fontFamily: "Inter",
      },
    },
    `${p.title} — ${p.siteName}`,
  )
}
