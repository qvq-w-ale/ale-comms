// 🔒 Force dark mode at all times
document.documentElement.setAttribute("saved-theme", "dark")
localStorage.setItem("theme", "dark")

const emitThemeChangeEvent = (theme: "dark") => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  })
  document.dispatchEvent(event)
}

// Immediately emit dark mode event on load
emitThemeChangeEvent("dark")

document.addEventListener("nav", () => {
  // 🔒 Disable theme switching entirely
  const lockTheme = () => {
    document.documentElement.setAttribute("saved-theme", "dark")
    localStorage.setItem("theme", "dark")
    emitThemeChangeEvent("dark")
  }

  // Ensure all dark mode buttons exist but do nothing functional
  for (const darkmodeButton of document.getElementsByClassName("darkmode")) {
    // visually keep it, but disable interactivity
    darkmodeButton.style.opacity = "0.5"
    darkmodeButton.style.cursor = "not-allowed"
    darkmodeButton.title = "Dark mode locked"

    // override click to do nothing except reassert dark mode
    const noop = (e: Event) => {
      e.preventDefault()
      lockTheme()
    }
    darkmodeButton.addEventListener("click", noop)
    window.addCleanup(() => darkmodeButton.removeEventListener("click", noop))
  }

  // 🔒 Ignore system theme changes completely
  const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  colorSchemeMediaQuery.removeEventListener?.("change", () => {})
})
