import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

type MaybeHTMLElement = HTMLElement | undefined

interface ParsedOptions {
  folderClickBehavior: "collapse" | "link"
  folderDefaultState: "collapsed" | "open"
  useSavedState: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: "sort" | "filter" | "map"[]
}

type FolderState = {
  path: string
  collapsed: boolean
}

let currentExplorerState: Array<FolderState>
function toggleExplorer(this: HTMLElement) {
  const nearestExplorer = this.closest(".explorer") as HTMLElement
  if (!nearestExplorer) return
  const explorerCollapsed = nearestExplorer.classList.toggle("collapsed")
  nearestExplorer.setAttribute(
    "aria-expanded",
    nearestExplorer.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )

  if (!explorerCollapsed) {
    document.documentElement.classList.add("mobile-no-scroll")
  } else {
    document.documentElement.classList.remove("mobile-no-scroll")
  }
}

function toggleFolder(evt: MouseEvent) {
  evt.stopPropagation()
  const target = evt.target as MaybeHTMLElement
  if (!target) return

  const isSvg = target.nodeName === "svg"

  const folderContainer = (
    isSvg
      ? target.parentElement
      : target.parentElement?.parentElement
  ) as MaybeHTMLElement
  if (!folderContainer) return
  const childFolderContainer = folderContainer.nextElementSibling as MaybeHTMLElement
  if (!childFolderContainer) return

  childFolderContainer.classList.toggle("open")

  const isCollapsed = !childFolderContainer.classList.contains("open")
  setFolderState(childFolderContainer, isCollapsed)

  const currentFolderState = currentExplorerState.find(
    (item) => item.path === folderContainer.dataset.folderpath,
  )
  if (currentFolderState) {
    currentFolderState.collapsed = isCollapsed
  } else {
    currentExplorerState.push({
      path: folderContainer.dataset.folderpath as FullSlug,
      collapsed: isCollapsed,
    })
  }

  const stringifiedFileTree = JSON.stringify(currentExplorerState)
  localStorage.setItem("fileTree", stringifiedFileTree)
}

// 🧩 Define a mapping between note names and GIF icon file names
function getIconPathForNote(title: string): string {
  switch (title) {
    case "Animations":
      return "/static/animations.gif"
    case "Models":
      return "/static/models.gif"
    case "[ Completed Comms ]":
      return "/static/comms.gif"
    default:
      return ""
  }
}

function createFileNode(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const template = document.getElementById("template-file") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const a = li.querySelector("a") as HTMLAnchorElement
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug

  const iconPath = getIconPathForNote(node.displayName)

  // Clear default text first
  a.textContent = ""

// Add title first (above the image)
const title = document.createElement("div")
title.textContent = node.displayName
title.style.textAlign = "left"
title.style.fontWeight = "600"
title.style.margin = "0.3rem 0 0.3rem 0.5rem"
title.style.display = "block"
a.appendChild(title)

  // Add large GIF icon below the title (if applicable)
  if (iconPath) {
    const img = document.createElement("img")
    img.src = iconPath
    img.alt = `${node.displayName} icon`
    img.style.display = "block"
    img.style.width = "90%" // nearly as wide as the explorer box
    img.style.margin = "0 auto"
    img.style.borderRadius = "8px"
    img.style.opacity = "0.7"
    img.style.transition = "opacity 0.3s ease"

    // Optional hover highlight
    img.addEventListener("mouseenter", () => (img.style.opacity = "1"))
    img.addEventListener("mouseleave", () => (img.style.opacity = "0.7"))

    a.appendChild(img)
  }

if (currentSlug === node.slug) {
  a.classList.add("active")
  a.style.color = "var(--secondary)"
  a.style.fontWeight = "600"
}


  return li
}

function createFolderNode(
  currentSlug: FullSlug,
  node: FileTrieNode,
  opts: ParsedOptions,
): HTMLLIElement {
  const template = document.getElementById("template-folder") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const folderContainer = li.querySelector(".folder-container") as HTMLElement
  const titleContainer = folderContainer.querySelector("div") as HTMLElement
  const folderOuter = li.querySelector(".folder-outer") as HTMLElement
  const ul = folderOuter.querySelector("ul") as HTMLUListElement

  const folderPath = node.slug
  folderContainer.dataset.folderpath = folderPath

  // folders non-clickable
  const span = titleContainer.querySelector(".folder-title") as HTMLElement
  span.textContent = node.displayName
  span.classList.add("folder-label") // optional for more styling
  span.style.color = "var(--tertiary)" // keep the purple color
  span.style.cursor = "default"

  const isCollapsed =
    currentExplorerState.find((item) => item.path === folderPath)?.collapsed ??
    opts.folderDefaultState === "open"

  const simpleFolderPath = simplifySlug(folderPath)
  const folderIsPrefixOfCurrentSlug =
    simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)

  if (!isCollapsed || folderIsPrefixOfCurrentSlug) {
    folderOuter.classList.add("open")
  }

  for (const child of node.children) {
    const childNode = child.isFolder
      ? createFolderNode(currentSlug, child, opts)
      : createFileNode(currentSlug, child)
    ul.appendChild(childNode)
  }

if (currentSlug === node.slug) {
  a.classList.add("active")
}

  return li
}

async function setupExplorer(currentSlug: FullSlug) {
  const allExplorers = document.querySelectorAll("div.explorer") as NodeListOf<HTMLElement>

  for (const explorer of allExplorers) {
    const dataFns = JSON.parse(explorer.dataset.dataFns || "{}")
    const opts: ParsedOptions = {
      folderClickBehavior: (explorer.dataset.behavior || "collapse") as "collapse" | "link",
      folderDefaultState: (explorer.dataset.collapsed || "collapsed") as "collapsed" | "open",
      useSavedState: explorer.dataset.savestate === "true",
      order: dataFns.order || ["filter", "map", "sort"],
      sortFn: new Function("return " + (dataFns.sortFn || "undefined"))(),
      filterFn: new Function("return " + (dataFns.filterFn || "undefined"))(),
      mapFn: new Function("return " + (dataFns.mapFn || "undefined"))(),
    }

    const storageTree = localStorage.getItem("fileTree")
    const serializedExplorerState = storageTree && opts.useSavedState ? JSON.parse(storageTree) : []
    const oldIndex = new Map<string, boolean>(
      serializedExplorerState.map((entry: FolderState) => [entry.path, entry.collapsed]),
    )

    const data = await fetchData
    const entries = [...Object.entries(data)] as [FullSlug, ContentDetails][]
    const trie = FileTrieNode.fromEntries(entries)

    for (const fn of opts.order) {
      switch (fn) {
        case "filter":
          if (opts.filterFn) trie.filter(opts.filterFn)
          break
        case "map":
          if (opts.mapFn) trie.map(opts.mapFn)
          break
        case "sort":
          if (opts.sortFn) trie.sort(opts.sortFn)
          break
      }
    }

    const folderPaths = trie.getFolderPaths()
    currentExplorerState = folderPaths.map((path) => {
      const previousState = oldIndex.get(path)
      return {
        path,
        collapsed:
          previousState === undefined ? opts.folderDefaultState === "collapsed" : previousState,
      }
    })

    const explorerUl = explorer.querySelector(".explorer-ul")
    if (!explorerUl) continue

    const fragment = document.createDocumentFragment()
    for (const child of trie.children) {
      const node = child.isFolder
        ? createFolderNode(currentSlug, child, opts)
        : createFileNode(currentSlug, child)

      fragment.appendChild(node)
    }
    explorerUl.insertBefore(fragment, explorerUl.firstChild)


    const explorerButtons = explorer.getElementsByClassName(
      "explorer-toggle",
    ) as HTMLCollectionOf<HTMLElement>
    for (const button of explorerButtons) {
      button.addEventListener("click", toggleExplorer)
      window.addCleanup(() => button.removeEventListener("click", toggleExplorer))
    }

    if (opts.folderClickBehavior === "collapse") {
      const folderButtons = explorer.getElementsByClassName(
        "folder-button",
      ) as HTMLCollectionOf<HTMLElement>
      for (const button of folderButtons) {
        button.addEventListener("click", toggleFolder)
        window.addCleanup(() => button.removeEventListener("click", toggleFolder))
      }
    }

    const folderIcons = explorer.getElementsByClassName(
      "folder-icon",
    ) as HTMLCollectionOf<HTMLElement>
    for (const icon of folderIcons) {
      icon.addEventListener("click", toggleFolder)
      window.addCleanup(() => icon.removeEventListener("click", toggleFolder))
    }
  }
}

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  await setupExplorer(currentSlug)

  for (const explorer of document.getElementsByClassName("explorer")) {
    const mobileExplorer = explorer.querySelector(".mobile-explorer")
    if (!mobileExplorer) return

    if (mobileExplorer.checkVisibility()) {
      explorer.classList.add("collapsed")
      explorer.setAttribute("aria-expanded", "false")
      document.documentElement.classList.remove("mobile-no-scroll")
    }

    mobileExplorer.classList.remove("hide-until-loaded")
  }
})

window.addEventListener("resize", function () {
  const explorer = document.querySelector(".explorer")
  if (explorer && !explorer.classList.contains("collapsed")) {
    document.documentElement.classList.add("mobile-no-scroll")
    return
  }
})

function setFolderState(folderElement: HTMLElement, collapsed: boolean) {
  return collapsed ? folderElement.classList.remove("open") : folderElement.classList.add("open")
}

/* ============================================================
   Robust explorer scroll persistence
   Paste at the bottom of explorer.client.ts (or a new client file)
   ============================================================ */

(function () {
  const PREFIX = "quartz:explorer-scroll:"
  let explorerIdCounter = 0

  function makeKeyForExplorer(explorer: HTMLElement) {
    if (!explorer.dataset.explorerId) {
      explorer.dataset.explorerId = `explorer-${explorerIdCounter++}`
    }
    return PREFIX + explorer.dataset.explorerId
  }

  function saveForKey(key: string, ul: HTMLElement) {
    try {
      sessionStorage.setItem(key, String(ul.scrollTop))
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function restoreForKey(key: string, ul: HTMLElement) {
    try {
      const v = sessionStorage.getItem(key)
      if (v !== null) {
        // ensure layout done before applying
        requestAnimationFrame(() => requestAnimationFrame(() => {
          ul.scrollTop = parseInt(v, 10) || 0
        }))
      } else {
        // fallback: bring active into view
        const active = ul.querySelector(".active") as HTMLElement | null
        if (active) {
          requestAnimationFrame(() => active.scrollIntoView({ block: "nearest", behavior: "auto" }))
        }
      }
    } catch (e) { /* ignore */ }
  }

  function wireExplorer(explorer: HTMLElement) {
    // guard so we only attach once
    if ((explorer as any).__scrollPersistenceAttached) return
    ;(explorer as any).__scrollPersistenceAttached = true

    const key = makeKeyForExplorer(explorer)

    // helper to find the scrolling list inside this explorer
    function findUl() {
      return explorer.querySelector(".explorer-ul") as HTMLElement | null
    }

    // when an .explorer-ul appears or gets new children, restore
    const explorerObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length || m.removedNodes.length) {
          const ul = findUl()
          if (ul) restoreForKey(key, ul)
        }
      }
    })
    explorerObserver.observe(explorer, { childList: true, subtree: true })

    // wire the ul if present now, otherwise a small observer waits for it
    function attachToUl(ul: HTMLElement) {
      if ((ul as any).__scrollWired) return
      ;(ul as any).__scrollWired = true

      // debounced live save
      let timer: number | undefined
      ul.addEventListener("scroll", () => {
        if (timer) window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          saveForKey(key, ul)
          timer = undefined
        }, 120)
      })

      // ensure immediate save when clicking links (prevents race on nav)
      ul.addEventListener("click", (ev) => {
        const a = (ev.target as HTMLElement).closest("a")
        if (a) saveForKey(key, ul)
      })

      // restore now (in case content already inserted)
      restoreForKey(key, ul)
    }

    const existingUl = findUl()
    if (existingUl) attachToUl(existingUl)

    // watch for the ul to be inserted if it isn't present yet
    const ulWatcher = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of Array.from(m.addedNodes)) {
          if (!(n instanceof HTMLElement)) continue
          if (n.classList && n.classList.contains("explorer-ul")) {
            attachToUl(n as HTMLElement)
            return
          }
          const found = n.querySelector?.(".explorer-ul") as HTMLElement | null
          if (found) {
            attachToUl(found)
            return
          }
        }
      }
    })
    ulWatcher.observe(explorer, { childList: true, subtree: true })

    // also save on prenav for extra safety
    const prenavSaver = () => {
      const ul = findUl()
      if (ul) saveForKey(key, ul)
    }
    document.addEventListener("prenav", prenavSaver)

    // cleanup support if available
    if (typeof (window as any).addCleanup === "function") {
      (window as any).addCleanup(() => {
        explorerObserver.disconnect()
        ulWatcher.disconnect()
        document.removeEventListener("prenav", prenavSaver)
      })
    }
  }

  // attach to all current explorers
  document.querySelectorAll(".explorer").forEach((el) => wireExplorer(el as HTMLElement))

  // attach to newly created explorers
  const docObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of Array.from(m.addedNodes)) {
        if (!(n instanceof HTMLElement)) continue
        if (n.classList && n.classList.contains("explorer")) {
          wireExplorer(n)
        } else {
          const found = n.querySelector?.(".explorer") as HTMLElement | null
          if (found) wireExplorer(found)
        }
      }
    }
  })
  docObserver.observe(document.body, { childList: true, subtree: true })
  if (typeof (window as any).addCleanup === "function") {
    (window as any).addCleanup(() => docObserver.disconnect())
  }
})()
