import { h } from "preact"
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
    // 👇 Added small grey text below footer links
    slotAfter: (
      <div
        style={{
          fontSize: "0.75rem",
          color: "gray",
          marginTop: "0.5rem",
          textAlign: "center",
          opacity: 0.7,
        }}
      >
        Created with Quartz v4.5.2 © 2025
      </div>
    ),
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
        { Component: Component.ReaderMode() },
      ],
    }),
    // Added purple border & expanded folder list
    Component.Explorer({
      style: { borderLeft: "2px solid #a855f7", paddingLeft: "5px" },
      folderState: "expanded", // 👈 show all folders open by default
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
    // Added purple border & expanded folder list
    Component.Explorer({
      style: { borderLeft: "2px solid #a855f7", paddingLeft: "10px" },
      folderState: "expanded", // 👈 show all folders open by default
    }),
  ],
  right: [],
}
