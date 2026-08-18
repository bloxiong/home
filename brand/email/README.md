# Bloxio email kit

Same design language as the letterhead, rebuilt for email.

| File | What it is |
|---|---|
| `template.html` | Full branded email — masthead, gold spine, star rule, footplate |
| `signature.html` | Compact signature block for Gmail |
| `plain-text.txt` | Plain-text signature + message, for the Gmail mobile app |

Images live in `public/brand/` and are served from `https://bloxio.tech/brand/`.

---

## 1. Deploy the images first

Email clients **strip `data:` URIs**, so the logo and stars have to load from a
public URL. They are already in `public/brand/`, but they only work once the
site is redeployed:

```
npm run build      # then deploy as usual
```

Check they are live before sending anything:

```
curl -I https://bloxio.tech/brand/wordmark.png
```

Until that returns `200`, the images show as broken boxes in every email.

---

## 2. Sending *as* contact@bloxio.tech

Cloudflare's **Email Routing** only handles mail coming *in* — it forwards
`contact@bloxio.tech` to your Gmail inbox. To *send* from that address you need
Cloudflare's newer **Email Sending**, which exposes an authenticated SMTP
endpoint that Gmail can use directly.

**In Cloudflare:** dashboard → **Email Service → Email Sending** → onboard
`bloxio.tech` as a sending domain (it adds the SPF/DKIM records for you, since
your DNS is already there). Then create an API token with the
**Email Sending: Edit** permission and copy it.

**In Gmail (web):** Settings → **Accounts and Import** → *Send mail as* →
**Add another email address**.

| Field | Value |
|---|---|
| Email address | `contact@bloxio.tech` |
| SMTP server | `smtp.mx.cloudflare.net` |
| Port | `465` |
| Username | `api_token` — the literal string, not your token |
| Password | your Cloudflare API token |
| Security | **SSL** (implicit TLS) |

Port 465 with SSL is the only outbound option Cloudflare offers — 587/STARTTLS
and plain 25 are not supported for sending.

Gmail then emails a confirmation code to `contact@bloxio.tech`; Email Routing
forwards it straight to your inbox, so you can confirm in a minute.

Worth knowing: Email Sending is in **beta**, new accounts start on a
conservative daily quota that grows with your sending reputation, and a message
is capped at 50 recipients / 5 MiB. Fine for business correspondence; if you
ever do bulk campaigns, use a dedicated ESP instead.

---

## 3. Using the template in Gmail (web)

The template is deliberately built with **inline styles on every element and no
`<style>` block**, because Gmail's compose window strips stylesheets on paste.
That means a plain copy-paste keeps the whole design.

1. Open `template.html` in a browser.
2. Select the whole card (Ctrl+A works), copy.
3. In Gmail, click **Compose** and paste.
4. Edit the text between the `EDIT: message body` markers.

To keep it permanently: with the pasted design in the compose window, click the
**⋮** (bottom-right) → **Templates → Save draft as template → Save as new
template**. After that it is two clicks to start any branded email.

If *Templates* is missing, turn it on in Settings → **Advanced** → *Templates →
Enable*.

## 4. Installing the signature (web)

1. Open `signature.html`, replace `[Your Name]` and `[Your Title]`.
2. Select the block, copy.
3. Gmail → Settings → **General → Signature** → create one, paste, save.

Set it to apply to *new emails* and *replies* in the dropdowns underneath.

---

## 5. The Gmail mobile app — what does and doesn't work

**Sending as contact@bloxio.tech: yes.** Once step 2 is done on the web, the
address appears in the *From* picker in the Android and iOS app. Nothing extra
to configure on the phone.

**The HTML template and signature: no.** This is a Gmail limitation, not a
problem with these files:

- the mobile app's signature setting is **plain text only** — it has its own
  "Mobile Signature" that ignores the rich one you set on the web;
- the **Templates** feature does not exist in the mobile app;
- the app's compose window cannot paste styled HTML.

So the practical split is: **compose branded emails on Gmail web** (or desktop),
and on the phone use the plain-text signature from `plain-text.txt`
(Gmail app → Settings → your account → Mobile Signature).

One thing that *does* carry to mobile: a branded email composed and sent from
the web renders correctly when the **recipient** opens it in the Gmail app. The
limitation is only on composing, never on receiving.

---

## 6. Design notes

- **Degrades cleanly when images are blocked.** The spine has a solid gold
  `bgcolor` under the gradient image, the rule and step-mark are coloured table
  cells rather than pictures, and every word — including the footer — is live
  text. With images off you lose the wordmark and stars, not the layout.
- **Tables, not divs**, and no `position`/`flex`/`grid`: Outlook's rendering
  engine ignores them.
- **Fonts** are a system stack (Segoe UI → Roboto → Helvetica → Arial). Email
  clients ignore `@font-face`, so Inter and Equinox cannot be used here; the
  wordmark carries the brand type instead.
- **600px wide**, the standard that fits every client without scrolling, and it
  reflows on phones.
- Colours match the letterhead exactly: gold `#BD8A4C`, deep gold `#8F5F28`,
  ink `#17120C`, body `#4A4038`.
