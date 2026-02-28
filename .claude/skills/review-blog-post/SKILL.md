---
name: review-blog-post
description: When adding new pages or blog posts, updates sitemap.xml and llms.txt so the site stays visible to Google and AI search (ChatGPT, Claude, Perplexity). Use when creating or publishing new pages, blog posts, or sections.
---

# Review blog post / new page

When you add new pages or blog posts to this site, keep discoverability in sync.

## Checklist

1. **sitemap.xml**
   Add a `<url>` entry for the new page:
   - `<loc>https://denree.nl/</loc>` (trailing slash for homepage)
   - Use `https://denree.nl/path` (no trailing slash) for other pages, e.g. `/journal`, `/journal/my-note`.
   - Set `<changefreq>` (e.g. `weekly` for journal notes, `monthly` for static).
   - Set `<priority>` (e.g. 0.6–0.8 for notes, 1.0 for homepage).

2. **llms.txt**
   Keep the AI-readable overview up to date:
   - If adding a new main section: add a bullet and link under "Main sections".
   - If adding notable content (e.g. a key journal note or project): add a short line and link in the relevant section or a new subsection.
   - Use absolute URLs: `https://denree.nl/...`.

3. **journal/index.html** — add a card to `#journalGrid`
   Each note needs a card entry. Copy this structure:

   ```html
   <div class="card card--blog-row" data-thread="THREAD_KEY" data-status="STATUS">
       <div class="card-meta">
           <small class="card-date">Mon DD, YYYY</small>
           <small class="card-date">City</small>
       </div>
       <div class="card-body">
           <span class="card-status card-status--STATUS">SYMBOL STATUS</span>
           <h3 class="card-title">
               <a href="/journal/note-slug">Note Title</a>
           </h3>
           <div class="card-badges">
               <span class="badge badge--thread badge--THREAD_KEY">THREAD LABEL</span>
               <span class="badge">context-tag</span>
           </div>
       </div>
   </div>
   ```

   **Thread keys and badge classes:**
   | Thread label | `data-thread` | badge class | color |
   |---|---|---|---|
   | livecoding music | `livecoding` | `badge--livecoding` | `#52D0FA` light blue |
   | working with AI | `ai` | `badge--ai` | `#2073FF` dark blue |
   | new media art | `newmedia` | `badge--newmedia` | `#FF82D2` pink |

   **Status values:**
   | Status | `data-status` | `card-status` class | symbol |
   |---|---|---|---|
   | Live | `live` | `card-status--live` | `●` |
   | Upcoming | `upcoming` | `card-status--upcoming` | `◌` |
   | Finished | `finished` | `card-status--finished` | (hidden) |

   Note: Live = happening now / actively updating. Upcoming cards have their title muted and link disabled automatically via CSS.

4. **Note page** — use `journal/_template.html` as the starting point
   - Copy `_template.html` to `journal/note-slug/index.html`
   - Fill in the metadata comment block at the top
   - Update `<head>` meta tags (title, description, canonical, og:*)
   - **Date format:** Mon DD, YYYY (e.g. Feb 28, 2026) — abbreviated month
   - Location icon is already in the template — just replace the city name
   - Default location is Rotterdam

5. **First mention of “blanche”** — use a preview link
   In the note body, the **first** occurrence of the word “blanche” in the article should be a preview link to the [Why blanche?](/journal/why-blanche) post. Wrap only that first “blanche” in:

   ```html
   <a href="/journal/why-blanche" class="preview-link"
      data-preview-title="Why blanche?"
      data-preview-desc="I call AI blanche, inspired by R.Williams"
      data-preview-image="/assets/why_blanche.jpeg">blanche</a>
   ```

   Later mentions of “blanche” in the same post stay plain text (no link). The preview-link script shows a compact hover tooltip; the page already includes `preview-link.js` when using the journal template.

## Note metadata comment block

Each note file starts with:

```html
<!--
  title: Note Title
  date: YYYY-MM-DD
  location: City
  thread: livecoding music         (one of: working with AI / livecoding music / new media art)
  thread-key: livecoding           (one of: ai / livecoding / newmedia)
  status: live                     (one of: live / upcoming / finished)
  tags: performance, residency     (optional, comma-separated)
-->
```

## Example (new note)

**sitemap.xml** — add inside `<urlset>`:

```xml
  <url>
    <loc>https://denree.nl/journal/finding-algoraves</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

**llms.txt** — if the note is notable, add under Journal:

```markdown
- [Finding Algoraves](https://denree.nl/journal/finding-algoraves): On discovering the algorave scene and what changes when the music is written live on stage.
```

**journal/index.html** card example:

```html
<div class="card card--blog-row" data-thread="livecoding" data-status="live">
    <div class="card-meta">
        <small class="card-date">Jan 18, 2026</small>
        <small class="card-date">Amsterdam</small>
    </div>
    <div class="card-body">
        <span class="card-status card-status--live">● live</span>
        <h3 class="card-title">
            <a href="/journal/finding-algoraves">Finding Algoraves</a>
        </h3>
        <div class="card-badges">
            <span class="badge badge--thread badge--livecoding">livecoding music</span>
            <span class="badge">performance</span>
            <span class="badge">algorave</span>
        </div>
    </div>
</div>
```
