# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

```
astro-blog
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ FETCH_HEAD
│  ├─ HEAD
│  ├─ ORIG_HEAD
│  ├─ config
│  ├─ description
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  ├─ sendemail-validate.sample
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ logs
│  │  ├─ HEAD
│  │  └─ refs
│  │     ├─ heads
│  │     │  └─ main
│  │     └─ remotes
│  │        └─ origin
│  │           └─ main
├─ .gitignore
├─ .vscode
│  ├─ extensions.json
│  └─ launch.json
├─ README.md
├─ astro.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ public
│  ├─ favicon.svg
│  ├─ fonts
│  │  ├─ Pretendard-Bold.subset.woff2
│  │  └─ Pretendard-Regular.subset.woff2
│  └─ link.svg
├─ src
│  ├─ assets
│  │  ├─ Moon.tsx
│  │  ├─ Sun.tsx
│  │  └─ external_link.svg
│  ├─ components
│  │  ├─ ThemeIconButton.module.css
│  │  ├─ ThemeIconButton.tsx
│  │  ├─ icons
│  │  │  └─ icons.tsx
│  │  └─ posts
│  │     ├─ BlogPostLink.astro
│  │     ├─ NavHeader.astro
│  │     ├─ PostList.astro
│  │     └─ PostListHeader.astro
│  ├─ env.d.ts
│  ├─ layouts
│  │  ├─ BaseLayout.astro
│  │  ├─ Layout.astro
│  │  ├─ MainLayout.astro
│  │  ├─ MarkdownPostLayout.astro
│  │  └─ PostLayout.astro
│  ├─ pages
│  │  ├─ index.astro
│  │  ├─ library
│  │  │  └─ posts
│  │  ├─ note
│  │  │  ├─ index.astro
│  │  │  └─ posts
│  │  │     ├─ post-1.md
│  │  │     ├─ post-2.md
│  │  │     └─ post-3.md
│  │  └─ util
│  │     └─ posts
│  ├─ style
│  │  ├─ base.css
│  │  ├─ fonts.css
│  │  └─ globalStyle.css
│  └─ types
│     └─ post.d.ts
└─ tsconfig.json

```