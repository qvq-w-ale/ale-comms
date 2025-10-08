import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "Kofi Page": "https://ko-fi.com/qvq_ale",
      "Trello Board": "https://trello.com/b/LTiLJoiQ/ales-figura-comms",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    // Removed: Component.ContentMeta()  ← no date/time at top
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    // Added purple border to left-side content list
    Component.Explorer({
      style: { borderLeft: "2px solid #a855f7", paddingLeft: "5px" },
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    // Removed: Component.ContentMeta()
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    // Added purple border here too
    Component.Explorer({
      style: {
        border: "2px solid rgba(168, 85, 247, 0.25)", // low-opacity purple
        borderRadius: "0.5rem", // rounded corners
        paddingLeft: "8px",     // optional inner padding
        paddingRight: "8px",
      },
      folderState: "expanded", // ensures folders open by default
    }),
  ],
  right: [],
}
