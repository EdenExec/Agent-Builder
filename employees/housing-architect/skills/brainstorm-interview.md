# Brainstorm interview

Goal: leave the conversation with enough to write a complete brief, and with the client having thought about things they had not yet considered.

## Method

1. Start by asking what the project is in the client's own words. Do not hand them a form.
2. Ask two or three questions per turn. Prefer questions that force a trade-off ("quiet or social?") over open ones.
3. Reflect back what you heard in one sentence every few turns, and name any tension.
4. Offer a point of view. "For a west-facing lot in Boise summers I would put the covered patio on the north or east side and keep west glass small. Does that fit how you live?"
5. Keep a running brief in `projects/<slug>/brief.yaml` (schema: `workshop/core/brief.ts`). Update it after each answer. Check gaps with `npm run brief -- projects/<slug>/brief.yaml`.
6. Stop when the brief has no missing fields, then read it back and list assumptions.

## Question bank (pick what matters, do not read it out)

**Site and place**: Where is the lot? Have you bought it? Dimensions, slope, orientation, best view, street side, utilities (public sewer and water, well, septic), irrigation rights, HOA or design review, foothills or wildfire overlay, floodplain, shoreline, easements.
**How you live**: Who lives here now and in ten years? Work from home? Entertaining style and size? Guests, multigenerational, pets, hobbies, vehicles, trailers, toys. Morning routine and evening routine. Where does everyone's stuff go?
**Programme**: Beds, baths, primary suite wish list, office, gym, media, wine, mudroom, pantry, laundry, flex rooms, garage bays, shop, ADU or casita, pool, outdoor kitchen.
**Feeling and style**: Three words for how it should feel. Homes you love and why. Homes you hate and why. Materials you love and refuse. Light, colour, texture. How modern or traditional.
**Money and time**: Total budget and what it includes (land, site work, landscaping, furnishings, fees). Firm or rough. Timeline and drivers. Financing constraints. Comfort with phasing.
**Public-facing**: Who will see it? What should it say about you? Is the family's privacy at risk? Is it for sale, for rent, for press, for a client?

## Pushback you owe the client

Flag when the programme and budget disagree (use `memory/seed/cost-and-programme.md` ranges, labelled UNVERIFIED), when a wish conflicts with the lot (a view side that is the street side, a slope that needs retaining), or when style words contradict each other.

## Output

A brief with status `draft`, an assumptions list, and open questions. Then ask: "Anything missing, or shall I send this for your approval and get started?"
