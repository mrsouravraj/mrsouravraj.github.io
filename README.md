# Sourav Chourasia — personal portfolio

A dark violet portfolio for backend engineering, distributed systems, and applied AI. Static HTML, CSS, and JavaScript; no package installation or frontend build required.

## Preview

Open `index.html` directly, or run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit http://127.0.0.1:8000. Writing and all core content are embedded in HTML, so direct-file viewing and JavaScript-disabled browsers work too.

## Publish on GitHub Pages

1. Push this repository to `main`.
2. In GitHub **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Run **Actions → Deploy portfolio and refresh writing → Run workflow**, or push another commit.

The workflow publishes to https://mrsouravraj.github.io/. It also runs daily at 06:23 UTC to refresh Medium articles and redeploy. It uploads only the site files and public assets; development documentation and scripts are excluded from the site artifact.

The workflow has been prepared locally; deployment requires pushing the files and enabling Pages. The schedule uses GitHub's best-effort scheduling and may be delayed or disabled after extended repository inactivity.

## Writing updates

`python3 scripts/update_medium.py` retrieves the public RSS feed and renders up to six articles directly into `index.html`. Medium publication domains are supported. If Medium fails, checked-in articles remain visible. Scheduled builds update the deployed site without committing bot changes to the repository.

For an offline rebuild:

```sh
python3 scripts/update_medium.py --offline
```

For a saved feed:

```sh
python3 scripts/update_medium.py --feed-file /path/to/feed.xml
```

On this Mac, Python's local certificate trust store could not validate Medium. The initial live feed was fetched with the system `curl` and rendered through `--feed-file`. TLS verification remains enabled; GitHub's hosted Python environment runs the normal refresh command.

## Editing

- `index.html`: profile, work, projects, timeline, skills, contact, and metadata.
- `styles.css`: responsive violet theme; no external fonts or trackers.
- `main.js`: mobile navigation, project filtering, portrait interaction, and active navigation.
- `data/articles.json`: checked-in article fallback. Render after editing it with `--offline`.
- `scripts/update_medium.py`: feed importer and static article renderer.
- `assets/`: public résumé, favicon, and social image.
- `.github/workflows/deploy.yml`: Pages deployment and daily writing refresh.

Do not hand-edit the HTML between the `ARTICLES` markers; the importer owns that section. If the domain changes, update canonical, Open Graph, structured data, sitemap, and robots URLs.

Architecture illustrations are conceptual teaching examples. Professional work is summarized without internal metrics or customer names. The public résumé is the user-selected `downloads/Sourav_Chourasia_Backend_Applied_AI_CV (1).pdf`, copied unchanged to `assets/Sourav-Chourasia-Resume-Public.pdf` so both résumé links retain their existing URL.

## Validation performed

Chromium checks at 320, 390, 768, 1024, and 1440 pixels: no horizontal overflow, project filtering, mobile menu and Escape handling, and no JavaScript runtime errors. Also checked reduced-motion behavior, résumé access, no-JavaScript content, and direct-file loading. The RSS importer was exercised with the actual Medium feed and offline/error cases.
