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
   - Use `https://denree.nl/path` (no trailing slash) for other pages, e.g. `/blog`, `/blog/my-post`.
   - Set `<changefreq>` (e.g. `weekly` for blog, `monthly` for static).
   - Set `<priority>` (e.g. 0.6–0.8 for posts, 1.0 for homepage).

2. **llms.txt**  
   Keep the AI-readable overview up to date:
   - If adding a new main section: add a bullet and link under "Main sections".
   - If adding notable content (e.g. a key blog series or project): add a short line and link in the relevant section or a new subsection.
   - Use absolute URLs: `https://denree.nl/...`.

## Example (new blog post)

**sitemap.xml** — add inside `<urlset>`:

```xml
  <url>
    <loc>https://denree.nl/blog/my-new-post</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
```

**llms.txt** — if the post is important for how the site should be described, add under a suitable section, e.g.:

```markdown
- [My new post](https://denree.nl/blog/my-new-post): Short description
```

Otherwise, ensuring the blog index link and summary are accurate is enough.
