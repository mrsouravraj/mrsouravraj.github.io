#!/usr/bin/env python3
"""Refresh Medium writing and render static HTML. No browser API or dependencies."""
from __future__ import annotations
import argparse
import datetime as dt
import email.utils
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FEED = 'https://medium.com/feed/@mr.sourav.raj'
DATA = ROOT / 'data/articles.json'
PAGE = ROOT / 'index.html'
START = '<!-- ARTICLES:START -->'
END = '<!-- ARTICLES:END -->'


def clean_text(value):
    value = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', value, flags=re.S | re.I)
    return ' '.join(html.unescape(re.sub(r'<[^>]*>', ' ', value)).split())


def valid_url(value):
    url = urllib.parse.urlsplit(value)
    # Medium publications use custom domains; restrict the scheme, not the publisher.
    return url.scheme == 'https' and bool(url.hostname) and not url.username and not url.password


def parse_feed(raw):
    root = ET.fromstring(raw)
    articles = []
    for item in root.findall('./channel/item'):
        title = clean_text(item.findtext('title', ''))[:200]
        url = item.findtext('link', '').strip()
        categories = [clean_text(c.text or '') for c in item.findall('category')]
        # Medium replies appear in RSS too; articles have topics or a substantive title.
        if not title or not valid_url(url) or (not categories and len(title) < 35):
            continue
        try:
            date = email.utils.parsedate_to_datetime(item.findtext('pubDate', '')).date().isoformat()
        except (ValueError, TypeError, OverflowError):
            date = ''
        description = clean_text(item.findtext('description', ''))
        if not description:
            description = ' · '.join(category.replace('-', ' ').title() for category in categories[:3])
        if not description:
            description = 'Engineering notes and practical lessons. Read the full story on Medium.'
        articles.append({'title': title, 'url': url, 'date': date, 'description': description[:155].rstrip()})
    if not articles:
        raise ValueError('No valid articles in feed; retaining existing writing.')
    return sorted(articles, key=lambda item: item['date'], reverse=True)[:6]


def render_articles(articles):
    rows = []
    for item in articles[:6]:
        if not valid_url(item.get('url', '')):
            continue
        date = item.get('date', '')
        date_markup = ''
        if date:
            try:
                parsed = dt.date.fromisoformat(date)
                date_markup = f'<time datetime="{parsed.isoformat()}">{parsed:%b %Y}</time>'
            except ValueError:
                pass
        if not date_markup:
            date_markup = '<span class="article-date"></span>'
        esc = lambda value: html.escape(str(value), quote=True)
        rows.append(f'<a class="article-row" href="{esc(item["url"])}" target="_blank" rel="noopener"><span class="article-number">{len(rows)+1:02d}</span><div><h3>{esc(item["title"])}</h3><p>{esc(item.get("description", ""))}</p></div>{date_markup}<span class="article-arrow" aria-hidden="true">↗</span></a>')
    if not rows:
        raise ValueError('No valid writing to render.')
    page = PAGE.read_text(encoding='utf-8')
    before, remainder = page.split(START, 1)
    _, after = remainder.split(END, 1)
    PAGE.write_text(before + START + '\n' + '\n'.join(rows) + '\n      ' + END + after, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--offline', action='store_true', help='Render checked-in articles without fetching Medium.')
    parser.add_argument('--feed-file', type=Path, help='Read a saved RSS file.')
    args = parser.parse_args()
    existing = json.loads(DATA.read_text(encoding='utf-8'))
    articles = existing['items']
    if not args.offline:
        try:
            if args.feed_file:
                raw = args.feed_file.read_bytes()
            else:
                request = urllib.request.Request(FEED, headers={'User-Agent': 'Mozilla/5.0 (SouravPortfolio RSS)'})
                with urllib.request.urlopen(request, timeout=25) as response:
                    raw = response.read(2_000_000)
            articles = parse_feed(raw)
            if articles != existing['items']:
                payload = {'updated_at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'), 'source': FEED, 'items': articles}
                DATA.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print(f'Loaded {len(articles)} Medium articles.')
        except (OSError, ValueError, ET.ParseError) as error:
            print(f'Medium unavailable ({error}); using checked-in articles.')
    render_articles(articles)
    print('Rendered static writing in index.html.')


if __name__ == '__main__':
    main()
