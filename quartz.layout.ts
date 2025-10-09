import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      //"Kofi Page": "https://ko-fi.com/qvq_ale",
      //"Trello Board": "https://trello.com/b/LTiLJoiQ/ales-figura-comms",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.TagList(),
  ],

  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        { Component: Component.Darkmode() },
        {
          Component: Component.Search(),
          grow: true,
        },
      ],
    }),
    // Added purple border to left-side content list
    Component.Explorer({
      sortFn: (a, b) => {
        const emojis =
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g
        const a_name = a.data?.title.replace(emojis, "").trim()
        const a_dname = a.displayName.replace(emojis, "").trim()
        const b_name = b.data?.title.replace(emojis, "").trim()
        const b_dname = b.displayName.replace(emojis, "").trim()
        // Sort order: folders first, then files. Sort folders and files alphabetically
        if (/^.*Home$/.test(a_dname)) {
          return -1
        }
        if (/^.*Home$/.test(b_dname)) {
          return 1
        }
        if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
          // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
          // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
          return a_dname.localeCompare(b_dname, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }

        if (!a.isFolder && b.isFolder) {
          return 1
        } else {
          return -1
        }
      },
    }),
  ],
  right: [
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
        { Component: Component.Darkmode() },
        {
          Component: Component.Search(),
          grow: true,
        },
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
