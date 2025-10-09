import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See [https://quartz.jzhao.xyz/configuration](https://quartz.jzhao.xyz/configuration) for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Ale's FIGURA COMMISSIONS!",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",

    // 🧩 IMPORTANT: use your actual GitHub Pages URL
    baseUrl: "https://qvq-w-ale.github.io/ale-comms",

    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",

    // ✅ ensures your /static folder is copied into /public/static
    assets: ["static"],

    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Courier Prime",
        body: "Doto",
        code: "IBM Plex Mono",
        title: "Dokdo",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#a855f7", // purple
          tertiary: "#c084fc",  // lighter purple
          highlight: "rgba(168, 85, 247, 0.15)",
          textHighlight: "#a855f788",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#c084fc",
          tertiary: "#e9d5ff",
          highlight: "rgba(192, 132, 252, 0.15)",
          textHighlight: "#c084fc88",
        },
      },
    },
  },

  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(), // ✅ Copies /static → /public/static
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
