# Maker's Studio Room (self-hosted)

Your 3D Maker's Studio, hosted on Cloudflare Pages, with Claude, saved data and hand control.

What's in here:

- `public/` is the site itself: the room, the stations, the browser side of the Claude connection and storage (`js/claude-shim.js`), and hand control (`js/gestures.js`).
- `functions/api/` holds four small server functions:
  - `claude.js` passes requests to Claude and keeps your API key on the server.
  - `items.js` saves and loads your studio from a D1 database.
  - `_middleware.js` and `unlock.js` (with `lib/lock.js`) keep everyone out who doesn't have your passcode.
- `schema.sql` creates the one database table.
- `wrangler.toml` holds the project settings.

## Set it up (about 20 minutes)

Cloudflare's dashboard menus get renamed now and then, so a label below might be slightly different.

1. **Make the GitHub repo.** Create a private repo called `jedmakerstudio` and upload everything in this folder. Never upload a `.dev.vars` file.
2. **Create the database.**
   1. In the Cloudflare dashboard, go to Storage & Databases, then D1, then Create, and name it `makers-studio`.
   2. Copy its Database ID into `wrangler.toml` where it says `PASTE-YOUR-D1-DATABASE-ID-HERE`, and commit that change.
   3. Open the database's Console tab, paste in the contents of `schema.sql`, and run it.
3. **Create the Pages project.**
   1. Go to Workers & Pages, then Create, then the Pages tab, then Connect to Git, and pick the repo.
   2. Set the framework preset to None, leave the build command empty, and set the build output directory to `public`.
   3. Deploy. Your address will be something like `jedmakerstudio.pages.dev`.
4. **Add your secrets.** In the Pages project, go to Settings, then Variables and Secrets, and add two Secrets:
   - `ANTHROPIC_API_KEY` (optional): create one at console.anthropic.com and set a monthly spend limit there. Without it, everything works except the Claude features (conversations, Claude-written concepts, readings and crits), which fall back to simpler built-in versions. Hand control never needs it.
   - `STUDIO_PASSCODE`: a long passphrase only you know, such as four random words. The studio asks for it once per browser, then remembers it for a year.

   Then redeploy: open Deployments, then the latest one, and choose Retry deployment.
5. **Optional, a stronger lock: Cloudflare Access.** Zero Trust Free costs $0 but asks for a payment card. If you set it up, add an Access application for `jedmakerstudio.pages.dev` that allows only your email, and add `ALLOWED_EMAIL` as a variable. Both locks work together.
6. **Bring your studio over.**
   1. In the claude.ai versions (Maker's Studio and Maker's Studio Room), open any station, scroll to the bottom and choose **Export my studio**.
   2. On the hosted site, scroll to the bottom of any station, choose **Import a studio file**, and import both files.
7. **Turn on hand control.** Choose **Hand control** at the top right and allow the camera. Video is processed in your browser and never uploaded.

## Gestures

| Gesture | What it does |
|---|---|
| Point with your index finger | Moves the glowing cursor |
| Pinch thumb and index finger | Click: opens a station, pets a pet, presses a button |
| Pinch and drag, or move an open palm sideways | Looks around the room |
| Hold a closed fist (about half a second) | Back to the room |
| Pinch thumb, index and middle finger together, then drag up or down | Grabs the open page and scrolls it |
| Hold a thumbs up | Saves what you're working on |

For the best tracking, face a light source, keep your hand 40 to 70 cm from the laptop, and keep the background plain.

## Test on your laptop first (optional)

```
cp .dev.vars.example .dev.vars        # then put your real key in .dev.vars
npx wrangler d1 execute makers-studio --local --file schema.sql
npx wrangler pages dev
```

Open http://localhost:8788. The camera works on localhost too.

## Costs

Cloudflare Pages, Functions, D1 and Access are free at this size. Claude is billed per use through your Anthropic account. Quick tasks use the Haiku model, conversations use Sonnet, and the monthly crit uses Opus. You can change these in Variables with `MODEL_QUICK`, `MODEL_DEFAULT` and `MODEL_COMPLEX`.
