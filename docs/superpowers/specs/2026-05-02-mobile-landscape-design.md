# Mobile Landscape Design

## Goal

Adapt the game for touch devices that are already in landscape orientation. The priority is combat readability and control comfort: keep the canvas as large as possible, keep core HUD data visible, and prevent touch controls or dialogs from blocking the center of the battlefield.

## Scope

- Add a dedicated stylesheet: `src/styles/mobile-landscape.css`.
- Load it after `src/styles/app.css` from `index.html` so its narrow mobile-landscape overrides are easy to find and reason about.
- Keep the existing desktop and tablet layout behavior in `app.css`.
- Do not change game rules, canvas rendering, data, wave balance, or input semantics.

## Layout Design

Use a narrow media query for touch landscape devices, based on coarse pointer, landscape orientation, and low viewport height.

In that mode:

- Reduce the app shell to a compact top HUD plus full-height arena.
- Hide the right dock so the battlefield gets the available horizontal space.
- Compress the top bar into one short row with the brand and four stat cards.
- Shrink action buttons into a compact icon strip in the arena corner.
- Keep touch controls visible, with movement on the lower left and combat actions on the lower right.
- Move buffs and toast messages away from the touch controls.

## Dialog Design

Brief, ship selection, shop, codex, and armory dialogs must fit in low-height landscape screens.

- Cap dialog height to the viewport and allow internal scrolling where needed.
- Reduce padding, button height, and grid gaps.
- Keep primary action buttons reachable without covering the battlefield center.
- Keep armory trees scrollable horizontally rather than forcing them to shrink into unreadable nodes.

## Testing

- Run the existing automated tests with `npm test`.
- Serve the static app locally and manually inspect a landscape mobile-sized viewport.
- Check at least one low-height viewport around `812x375` and one wider small tablet landscape viewport around `1024x600`.

## Non-Goals

- No portrait layout redesign.
- No new mobile-only gameplay mode.
- No JavaScript device detection unless CSS proves insufficient.
