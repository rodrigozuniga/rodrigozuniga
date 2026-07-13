# Aurora Coffee - a simple website with usage tracking

A minimal, self-contained demo: one page with a picture, a photo carousel,
pull-down menus, radio selectors, sliders, text, and buttons, plus a small
analytics layer that records how people use every one of those controls and
stores the results on the server.

No external dependencies. The picture is an inline SVG and the server is plain
Node, so nothing is fetched from the network.

## Run it

```bash
cd tracking-site
node server.js
```

Then open:

- http://localhost:3000 - the website
- http://localhost:3000/dashboard - a summary of everything tracked
- http://localhost:3000/events - the raw stored events as JSON

Click the buttons and scroll to generate events, then refresh the dashboard.

## How the tracking works

1. `public/tracker.js` runs in the browser and watches for several signals:
   button/link clicks, pull-down menu changes, radio selections, slider
   releases, carousel slide changes, scroll depth, and page exit.
2. `public/carousel.js` drives the image carousel and reports each slide
   change back to the tracker.
3. Each signal is sent as a small JSON object to `POST /track`.
4. `server.js` appends one JSON object per line to `data/events.jsonl`
   (JSON Lines - an append-only log). This file is the stored result.

## What gets stored, and what it means as tracking data

Every stored event looks roughly like this:

```json
{
  "type": "click",
  "timestamp": "2026-07-13T18:04:11.512Z",
  "visitorId": "l9k2c1x8ab3d",
  "sessionId": "l9k2c0zzq1",
  "path": "/",
  "referrer": "(direct)",
  "language": "en-US",
  "userAgent": "Mozilla/5.0 ...",
  "screen": "1920x1080",
  "viewport": "1440x812",
  "label": "cta-order",
  "text": "Order a bag",
  "receivedAt": "2026-07-13T18:04:11.640Z"
}
```

Here is what each field tells you as an analyst, and why tracking systems
collect it:

| Field | What it is | What it means for tracking |
|-------|-----------|----------------------------|
| `type` | The kind of event: `page_view`, `click`, `select_change`, `radio_change`, `slider_change`, `carousel_change`, `scroll_depth`, or `page_exit` | The core behaviour being measured. Page views count reach; clicks and control changes measure engagement; scroll and exit measure attention. |
| `timestamp` / `receivedAt` | When the browser fired the event / when the server stored it | Lets you order events, measure time between actions, and detect clock tampering. The server time is the trustworthy one. |
| `visitorId` | A random ID kept in `localStorage`, persists across visits | Distinguishes a **new visitor** from a **returning** one. It is not a name - just a stable random label for one browser. |
| `sessionId` | A random ID kept in `sessionStorage`, lasts one browsing session | Groups events into a single visit, so you can reconstruct a user's journey through the page. |
| `path` | The page URL path | Which page the event happened on. On a bigger site this powers per-page metrics. |
| `referrer` | Where the visitor came from, or `(direct)` | Attribution: did they arrive from Google, a link, or by typing the URL? Drives "traffic source" reports. |
| `language`, `screen`, `viewport`, `userAgent` | Browser and device characteristics | Audience segmentation: mobile vs desktop, screen sizes to design for, locale, browser share. |
| `label` / `text` (clicks only) | Which tracked element was clicked | Conversion tracking. `cta-order` clicks vs `cta-menu` clicks tell you which call-to-action works. |
| `name` / `value` (`select_change`, `radio_change`, `slider_change`) | Which control changed and the option the visitor settled on | Preference and configuration data. Tells you which roast, size, or sweetness people actually pick - the raw material for "most popular options" reports and for pre-selecting sensible defaults. Sliders log on release, so you get the final value, not every drag. |
| `carousel`, `slide`, `index`, `method` (`carousel_change`) | Which carousel, which image became visible, its position, and how it was reached (`arrow-prev` / `arrow-next` / `dot` / `auto`) | Content interest and interaction style. Which slides people linger on, and whether they navigate deliberately (arrows/dots) or just let it auto-advance. |
| `depth` (scroll events only) | 25 / 50 / 75 / 100 percent | How far down people read. A big drop between 25 and 50 means they lose interest early. |
| `timeOnPageMs` (exit only) | Milliseconds from load to leaving | Dwell time / engagement. Short times can signal a bounce; long times, real interest. |

### The bigger picture

Individually each row is trivial. The point of tracking is what you can
**derive** when you aggregate the log:

- **Funnel / conversion rate** - of everyone who did `page_view`, what
  fraction reached a `click` on `cta-order`?
- **Engagement** - average scroll depth and time on page.
- **New vs returning** - count distinct `visitorId`s and how many appear more
  than once.
- **Journeys** - group by `sessionId` and order by `timestamp` to see the exact
  path each visit took.
- **Segments** - break any of the above down by device, language, or referrer.

That is the trade every analytics system makes: cheap, low-detail events, made
valuable by volume and aggregation. Because `visitorId` is a persistent random
identifier, this data is *pseudonymous* rather than fully anonymous - a real
deployment would need a privacy notice and, depending on jurisdiction, consent
before collecting it.
