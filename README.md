# OS4 Solutions

Ava Hall's OS4 Solutions website, built with HTML, CSS and vanilla JavaScript.
It includes service tabs, FAQ accordions, responsive navigation and contact tools,
with local fonts and a system illustration in `assets/`.

## Run locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. No build or dependency installation is needed. Keep
`index.html`, `styles.css`, `script.js` and `assets/` together when serving the site.

## Contact form

The form checks the fields and opens an email draft in the visitor's mail app.
The visitor sends the message from there. The copy-email button copies the address
when the browser supports clipboard access.

## Development

Run `node --check script.js` after JavaScript changes. Check the navigation, service
tabs, FAQs, reduced-motion setting and contact form in a browser after interface
changes.

The Manrope and DM Mono licences are included in `assets/fonts/`.
