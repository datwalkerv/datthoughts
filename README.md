<div align="center">

<img src="./src/app/icon.svg" width="10%" alt="datthoughts" style="border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);" />

# datthoughts

**A quiet archive of thoughts.**

A personal, markdown-first place to publish thoughts on life, lessons, and the small things worth noticing. No database, no CMS: just folders and words.

</div>

## ✨ Key Features

- **📁 Folders Are Posts**: Every folder in `content/` is a published thought, and the folder name becomes its URL. Create a folder, write markdown, deploy.
- **🖼️ Images Live Next to Words**: Drop images into the same folder and reference them with `./photo.jpg`. Dimensions are read at build time, so nothing shifts while the page loads.
- **📝 Frontmatter Optional**: A bare markdown file is a valid thought. The title, date, and excerpt fall back to sensible defaults.
- **✍️ Rich Markdown**: Tables, footnotes, task lists, smart quotes, syntax-highlighted code with titles and line highlights, and anchor-linked headings.
- **🔎 ⌘K Search**: A command palette that searches titles, excerpts, and topics. Open it with ⌘K, Ctrl+K, or `/`.
- **🧭 Reader Comforts**: Reading time, a sticky frosted table of contents, a scroll-driven progress line, previous/next navigation, and topic pages.
- **🌐 Syndication & SEO**: RSS, a sitemap, canonical URLs, JSON-LD, and a generated Open Graph card for every thought.
- **🙈 Drafts**: Mark a thought `draft: true` to preview it locally. Production builds never include drafts.
- **🛡️ An Honest Build**: Invalid frontmatter or a clashing folder name fails the build with the file and field named. A missing image or missing alt text prints a warning.
- **🌟 Premium Minimal UI**: A monochrome, editorial interface with restrained motion from [React Bits](https://reactbits.dev): shiny text, blur reveals, a cursor spotlight, and a soft reading edge.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/), fully static
- **Runtime & View Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) and [Zod](https://zod.dev/)
- **Markdown**: [unified](https://unifiedjs.com/) with [remark](https://remark.js.org/) & [rehype](https://github.com/rehypejs/rehype), plus [gray-matter](https://github.com/jonschlinkert/gray-matter) for frontmatter
- **Code Highlighting**: [Shiki](https://shiki.style/) via [rehype-pretty-code](https://rehype-pretty.pages.dev/)
- **Motion**: [React Bits](https://reactbits.dev/) and [Motion](https://motion.dev/)
- **Social Cards**: [`next/og`](https://nextjs.org/docs/app/api-reference/functions/image-response)
- **Fonts**: [Geist & Geist Mono](https://vercel.com/font), self-hosted

### Frontmatter

| Field         | Default when missing                                               |
| ------------- | ------------------------------------------------------------------ |
| `title`       | The leading `# Heading`, then the folder name                      |
| `date`        | File modified time, with a build warning                           |
| `description` | The first paragraph, trimmed. Used in the archive, SEO, and RSS    |
| `tags`        | None. A list or a comma-separated string                           |
| `cover`       | None. A local image shown above the post and on its social card    |
| `coverAlt`    | Empty                                                              |
| `draft`       | `false`                                                            |
| `toc`         | Automatic: shown when a post has 3 or more `##`/`###` headings     |
| `updated`     | None. Used for `dateModified` and the sitemap                      |

## ⚖️ Privacy & Security

### Static by Design
- Every page, image, and feed is rendered at build time. At runtime there's no server logic, no database, and no API to attack.
- Only files inside a thought's own folder can be served. Paths that try to escape it (`../`) fail the build.
- The markdown source itself is never served. Requests for `.md` files return `404`.
- Drafts and private `_folders` are left out of production builds entirely.

### Privacy Policy
- datthoughts collects **nothing**. No analytics, no tracking, no cookies, and no third-party scripts.
- Fonts are self-hosted, so reading a thought makes no requests to other services.
- Search runs in your browser. What you type never leaves the page.

<br>

**Written slowly, kept honestly, shared quietly. 🖤**  
*A quiet archive of thoughts.*
