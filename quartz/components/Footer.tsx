import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { OptionType } from "../plugins/types"
import style from "./styles/footer.scss"

interface Optionss {
  links: Record<string, string>
}

export default ((opts?: Optionss) => {
  function Footer({ displayClass }: QuartzComponentProps) {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []

    return (
      <footer class={`${displayClass ?? ""}`} style={{ fontFamily: "'Courier Prime'" }}>
        <hr />
        <p class="footer-created">
          <img src="/static/discord.png" alt="Discord" class="discord-icon" />
          <b>@qvq_ale | {year} | Powered by</b>{" "}
          <a href="https://quartz.jzhao.xyz/" target="_blank" rel="noopener noreferrer">
            Quartz
          </a>
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
