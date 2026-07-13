# Designer's Guide to the Neritix Website

This guide is for editing the Neritix website **without needing to know how to code**. You'll
use an AI coding assistant (like Claude Code or ChatGPT) in a terminal: you describe the
change in plain English, it edits the files, and then it pushes your change — which
automatically publishes the site.

You don't need to understand the code. You do need to do a **one-time setup**, then the
day-to-day loop is: *open the project → ask the AI for a change → it publishes it.*

---

## One-time setup (do this once)

1. **Install the tools** (macOS example):
   - [Node.js](https://nodejs.org) (the "LTS" version) — lets the site build and preview.
   - [Git](https://git-scm.com/downloads) — usually already installed on Mac.
   - An AI coding assistant in the terminal — e.g. **Claude Code**
     (`npm install -g @anthropic-ai/claude-code`, then run `claude` and log in).

2. **Get access to push.** Ask Peter to add your GitHub username as a **collaborator** on
   the repository. Without this, you can look but you can't publish.

3. **Sign in to GitHub from the terminal** so you're allowed to push:
   ```bash
   gh auth login
   ```
   (Install the GitHub CLI first if needed: https://cli.github.com)

4. **Download the project** to your computer:
   ```bash
   git clone https://github.com/PeterMastnak/neritix.git
   cd neritix
   npm install
   ```

5. **Get the Mapbox token** from Peter and create a file named `.env.local` in the
   project folder containing:
   ```
   VITE_MAPBOX_TOKEN=the-token-peter-gives-you
   ```
   (This is only so the map shows up while you preview locally. Never share this file.)

---

## The everyday loop

1. Open a terminal, go into the project, and **grab the latest version** first:
   ```bash
   cd neritix
   git pull
   ```
2. Start your AI assistant in that folder (e.g. type `claude`).
3. **Tell it what you want** in plain language. It will read `CLAUDE.md`, make the change,
   and can publish it for you.
4. Optionally preview locally before publishing: ask it to "run the site so I can see it,"
   or run `npm run dev` and open the link it prints.

### Example things to ask the AI

- "Change the hero headline to *'Real-time ocean data for the Adriatic'* and update the
  subtitle to match."
- "Make the teal accent color a bit brighter across the whole site."
- "In the footer, update the copyright year to 2026 and fix the disclaimer wording."
- "The 'Target Audience' section has four cards — reword the 'Offshore Energy' one to focus
  on wind farms."
- "Change the body font from Inter to something more rounded, and load it properly."
- "Update the pricing copy in the data portal so the top tier says 'Enterprise'."
- "After the change, build the site to make sure nothing broke, then publish it."

Always ask it to **build first** (`npm run build`) — if the build fails, publishing fails.

---

## How publishing works

When the AI (or you) pushes the change to the `main` branch, GitHub automatically builds
the site and uploads it to our host (Neoserv). **Nobody zips or uploads files by hand.**

- It takes about **1–2 minutes** to go live.
- You can watch it on GitHub under the **Actions** tab: a green ✓ means it's live; a red ✗
  means something failed (ask the AI to look at the error and fix it).

If you ever want to publish manually, the command the AI runs is just:
```bash
git add -A
git commit -m "what you changed"
git push origin main
```

---

## Do / Don't

**Do**
- `git pull` before you start, so you're editing the latest version.
- Ask the AI to preview or build before publishing.
- Write a short note of what you changed when it asks for a commit message.

**Don't**
- Don't edit the `dist/` folder — it's throwaway output that gets rebuilt.
- Don't share or commit the `.env.local` file or the Mapbox token.
- Don't worry about breaking things permanently — every change is versioned on GitHub and
  can be undone. If in doubt, ask the AI to "undo my last change."

---

Questions about hosting, access, or tokens → ask Peter. Questions about *how to make a
specific visual/text change* → just ask your AI assistant inside the project folder.
