import type { Metadata } from "next"
import { registerAdapter } from "@better-seo/core"
import { toNextMetadata } from "./to-next-metadata.js"

registerAdapter<Metadata>({
  id: "next",
  toFramework: toNextMetadata,
})
