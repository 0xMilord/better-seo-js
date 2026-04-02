import type { Metadata } from "next"
import { registerAdapter } from "better-seo.js"
import { toNextMetadata } from "./to-next-metadata.js"

registerAdapter<Metadata>({
  id: "next",
  toFramework: toNextMetadata,
})
