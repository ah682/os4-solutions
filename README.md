# OS4 Solutions frontend

A static service-site frontend for Ava Hall's OS4 Solutions presentation. It uses
HTML, CSS and vanilla JavaScript for responsive navigation, service tabs, FAQ
accordions, section highlighting and contact interactions. Local fonts and an
abstract system illustration are included in `assets/`.

## Run locally

No build tool or dependency installation is required:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. Keep `index.html`, `styles.css`, `script.js` and
`assets/` together when serving statically.

## Working behavior and limits

The contact form validates locally and opens a prepared `mailto:` draft; it does
not submit to a server or confirm message delivery. Copy-email uses the browser
clipboard when available. The repository has a `CNAME` for `os4solutions.tech`;
that configuration alone does not verify current DNS, hosting or a live business
service. This repository demonstrates the frontend implementation, not client
engagements or independently validated operational capabilities.

Run `node --check script.js` after JavaScript changes. Manually check keyboard
navigation, tabs, FAQs, reduced-motion behavior and contact validation in a browser.
No automated test/build command is configured.

Preserve the included Manrope and DM Mono licence notices in `assets/fonts/`.
Review the provenance/permissions of illustrations and other assets before reuse;
no new source-code or asset licence is granted by this README.
