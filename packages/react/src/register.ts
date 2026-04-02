import { registerAdapter } from "@better-seo/core"
import { toHelmetProps, type HelmetSEOProps } from "./to-helmet-props.js"

registerAdapter<HelmetSEOProps>({
  id: "react",
  toFramework: toHelmetProps,
})
