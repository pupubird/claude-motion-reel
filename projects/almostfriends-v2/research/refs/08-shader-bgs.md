# 08 — 2,200 animated shader backgrounds (OpenShaders)

| | |
|---|---|
| Title / author | 2200个动态shader背景 / SF Studio |
| Link | http://xhslink.com/o/89pHA6zzBpv |
| Site shown | **OpenShaders**: https://openshaders.com (explore: https://openshaders.com/explore), repo https://github.com/openshaders/openshaders |
| Duration | 39.45 s |
| Resolution / fps | 1330×720, 30 fps (a screen recording of a macOS window on a warm orange-to-blue desktop gradient) |
| Cuts | 6 scene-score hits (21.17, 22.87, 24.70, 27.10, 37.87, 37.93). Only three are edit points: site → code editor at about 15.8 s, editor → running demo page at 21.17 s, and demo → site at 27.10 s. The others are dark/light theme flips. That gives about 4 shots, averaging about 10 s each. |
| Loudness | −11.1 LUFS integrated. A continuous bed sits at about −11 to −14 dBFS RMS peak per 0.5 s from 3 s to 32 s, then fades from 32 s to 38.5 s (−16 down to −48). There are no transient hits. |

**What it is:** a screen-recorded tour of OpenShaders. It browses the grid of procedurally generated, name-seeded shader cards, opens one full size, filters by "rarity" (effect type), copies the code (WebGL / WebGPU / React variants), pastes it into VS Code, and runs it as a full-page background behind a frosted-glass card. Then it toggles dark and light themes, which the shader follows live.

**Licence (checked on the web, not taken from the caption):** the platform is MIT (`LICENSE`: "MIT License, Copyright (c) 2026 Open Shaders", repo `openshaders/openshaders`, 262★, last pushed 2026-09-09). The repo holds only README and LICENSE so far. The README says the platform is "in development" and states: *"The platform's license covers the platform. Creators will choose the licenses for their own shaders."* The About page says the same: *"Authors keep their credit everywhere a shader travels, and choose the license their own pieces carry."* It also promises a base library that is *"free and open source, yours to use anywhere."* **Practical reading:** the caption's "MIT" covers the platform, not every card. Before we ship any specific card's code in the film, check its own page, or claim our own username (`openshaders.com/?claim`) and use the shader generated for us. Better still, write our own versions of these effects (see §4). None of them is hard.

---

## 2. Why it reads high-end

The shaders themselves do the heavy lifting. Each is one **soft, luminous ribbon of light** (a domain-warped band with an exponential falloff) on near-black. It has a hot white core that bleeds into one saturated hue and dies to black at about 60 % of the frame. That gives an anamorphic-flare / aurora look with real dynamic range. They move slowly and continuously: no loop seam, no cut, just drift. Each card adds **one texture treatment** on top (grain, ASCII glyphs, halftone dots, mosaic pixels, sparkles), and this keeps a smooth gradient from reading as a "default CSS gradient". The light-theme versions (23 s, 38 s) turn the same fields into pastel pink/lilac/cyan silk on white, and that is almost exactly our palette.

The video itself is not crafted motion design. It is a cursor tour. The lesson is the material, not the edit.

## 3. Beat sheet

| Time | What we see | Camera | Transition into next | Sound |
|---|---|---|---|---|
| 0.0–1.9 | Grid view, "The ones who didn't wait.", 3×2 cards: @eduh (cyan), @haddybhaiya (lilac), @kwcto (blue), @edgaras (amber), @wisse (ice), @mavorparker (rose). Filter: "Pure field". Cursor hovers over @eduh and a "Copy code" pill lights up. | Locked screen capture | Grid fades to black (about 0.2 s) | Silent until about 0.9 s, then the bed comes in |
| 1.9–3.6 | Black, then @eduh card fades up from black over about 0.4 s (2.1→2.5) to a large modal. The name "@eduh" fades in last (about 2.4 s). The field keeps drifting: the cyan arc slides and breathes. | Locked | Card fades to black at about 3.7 s | Bed |
| 3.7–5.3 | **Immersive** mode: two stacked cards (@elonmusk in front, @moazamdotdev peeking behind) fade up and scale up about 10 % over about 0.8 s, with "The ones who didn't wait." above | Locked | Toggle back to Grid | Bed |
| 5.3–15.5 | Scrolling the "All rarities" grid (2,235→2,251 names claimed). Cards stream in with a soft top/bottom mask fade. Effect types are visible: ASCII (@saheer 6.2 s, @vercel 10.3 s), Grain (@logga 6.2 s, @m_agustinm 10.3 s), Halftone (@anuj 10.3 s, @failuretocomply 8.5 s), Mosaic (@vani 8.5 s). At 13.5 s the "Copy code" dropdown opens: **WebGL / WebGPU / React·WebGL / React·WebGPU**. | Locked, page scroll | Hard switch to VS Code at about 15.8 s | Bed, small bump at 10 s (−9) |
| 15.8–21.1 | VS Code: `shader.webgpu.js` (387 lines) and `webgpu.html`. Visible code: `animate(options, (time, theme, pixelRatio) => {...})` writes uniforms `[width, height, time, theme, dark.rgb, pixelRatio, light.rgb]`, then `pass.draw(3)` (one fullscreen triangle). CSS vars `html[data-theme="dark"|"light"]`, `transition: color .3s, background-color .3s`, colour picker on `--muted #a3a3a3`. | Locked | Cut to the browser (21.17 s, detected) | Bed |
| 21.1–23.0 | Running page `127.0.0.1:5500/demo/webgpu.html`: full-bleed violet/white ribbon on black, with a frosted-glass card in the centre ("着色器背景已写入网页", "OPENSHADERS · WEBGPU" pill) | Locked | Theme toggle (深色→白色) | Bed |
| 23.0–24.6 | **Light theme**: the same field becomes pastel pink/lilac/peach silk on off-white. The glass card turns light. | Locked | Toggle back. The mid-blend passes through flat grey (24.6 s) over about 0.3 s. | Bed |
| 24.7–27.0 | Dark again: the ribbon re-forms and drifts | Locked | Cut to site (27.1 s) | Bed |
| 27.1–37.8 | Site again. The rarity dropdown opens (32.5 s), showing **Pure field 39 % · Grain 13 % · ASCII 12 % · Dither 10 % · Halftone 9 % · Sparkle 7 % · Liquid 5 % · Mosaic 4 % · Chroma 1 %**. Selects Sparkle (143 names): aurora fields with tiny star points. Then Mosaic (95 names): pixel-quantised fields. | Locked | Theme flip to light (37.87 s) | Bed fades out from 32 s |
| 37.9–39.4 | Light theme Mosaic grid: @instinct (mint), @mtths (cyan), @dylan (pale aqua), lilac and pink cards above. All read as pastel watercolour fields on white. | Locked | End | Near silent (−45), last 0.5 s back at −19 (outro tail) |

## 4. Signature moves (特效): the effect catalogue

There is no motion "move" here beyond fades. What is worth studying is the **shader vocabulary**. Below are what each type looks like on screen, how to build it, and where it would land in *almost friends*.

### 4.0 The base field ("Pure field", 39 %): everything else is this plus a post pass
- **Seen:** @eduh (0.5 s, 2.8 s), @haddybhaiya, @edgaras, @zelewolfy (13.6 s), @sirus. One or two curved light ribbons, each with a white-hot core of about 2–4 % of frame width, a saturated hue halo of about 15–25 %, and a pure black floor. Motion is a slow warp (the @eduh arc slides about 5 % of the frame per second), never a translation of the whole image.
- **Build (GLSL, one fullscreen triangle as in their code):** `uv` → 2–3 octaves of domain warp (`p += 0.35*vec2(fbm(p+t*0.05), fbm(p+4.1-t*0.04))`). Distance to a parametric curve (`d = abs(p.y - 0.4*sin(p.x*1.3+t*0.2))`). Intensity `I = exp(-d*k1)*a + exp(-d*k2)*b` (k1≈40 for the core, k2≈6 for the halo). Colour `= mix(dark_bg, hue, I_halo) + white*I_core^2`. Tonemap with ACES or `1-exp(-x)`, which is where the "expensive" bloom-like rolloff comes from. Uniforms `theme` (0..1) and `dark`/`light` RGB pairs drive the theme blend, as in their `uniformData.set([...])`.
- **Our render:** we render headless frame-by-frame, so `time` must be **our frame clock** (`t = frame/60`), not `performance.now()`. Their `animate()` wrapper uses rAF time, so we drive the uniform ourselves.
- **Why it reads cool:** HDR-like falloff. The hot core clips to white while everything else is colour, which is what lens flares and neon do.

### 4.1 Grain (13 %)
- **Seen:** @logga (6.2 s): a lilac ribbon dissolved into fine sparkly sand. @m_agustinm (10.3 s): magenta smoke with visible noise. @olamatu (13.6 s): grain plus RGB speckle.
- **Build:** after the field, `col += (hash(uv*res + frame) - 0.5) * amt * luma(col)^0.5`. Grain is luminance-weighted, so it shows in the bright ribbon and not in the black. Use per-frame seed (animated grain), `amt` 0.06–0.12. Optionally use per-channel hashes for colour grain (@olamatu).
- **almost friends:** **yes, everywhere, at about 3–4 %**, on every background and over the liquid bubbles. It is the cheapest single change that stops our flat pastel gradients from looking like a CSS `linear-gradient`. Too much (≥10 %) on light backgrounds reads as dirty or compressed.

### 4.2 ASCII (12 %)
- **Seen:** @saheer (6.2 s): a magenta field rendered as columns of `0`, `8` and `@` glyphs, bright where the field is bright. @vercel (10.3 s): teal digits in a dense grid at the top of the card.
- **Build:** quantise screen into cells (e.g. 8×12 px). Sample field luminance at the cell centre. Index into a glyph atlas texture (`" .:-=+*#%@"`). Multiply by field colour.
- **almost friends:** reads "hacker/terminal". It **only** fits the **Bub search** beat as a 0.3–0.5 s "AI is computing" flash: the crowd momentarily turns into glyphs as Bub scans, then snaps back. As a sustained background it is wrong for a warm friendship app, and on light backgrounds it looks like a 2010s Matrix template. **Cheap if held.**

### 4.3 Dither (10 %)
- **Seen:** not isolated by filter in the video. Ordered dot textures appear on @dabai and the #2,183 card (13.6 s, top row), which are probably dither. I did not see a clean dither card, so treat this as a hypothesis.
- **Build:** Bayer 4×4 / 8×8 threshold on luminance, `step(bayer(cell), luma)`, two-colour (bg + hue) palette.
- **almost friends:** a nice one-shot **transition texture**: a dissolve between phone UI and the bubble world where pixels flip by Bayer order over about 12 frames. As a background it is too lo-fi and gamer.

### 4.4 Halftone (9 %)
- **Seen:** @anuj (10.3 s): a gold ribbon made of round dots whose radius follows brightness, in a clean grid. @failuretocomply (8.5 s): orange/violet halftone. The #2,182 card (13.6 s): a green halftone patch.
- **Build:** rotate uv 15–45°, `cell = fract(uv*N)-0.5`, `r = sqrt(luma)*0.5`, `dot = smoothstep(r, r-aa, length(cell))`. Colour = field hue.
- **almost friends:** good for **SAME!!**. On the hit frame, a pastel halftone burst radiates behind the word (dots scale from 0 to full in about 6 frames, then fade), like a pop-art "comic impact". Our current SAME!! (31.5–33 s) is a flat blue pill with a few dots. Halftone in coral/blue on white reads as playful print, not tech. **Keep dot count low (N≈30 across the frame)**: dense fine halftone becomes a trypophobia-adjacent dot field.

### 4.5 Sparkle (7 %)
- **Seen:** 33.3 s and 35.7 s: @vadim984, @rajveer, @ivank, @krrish, @dzgh0st. Aurora fields with tiny sharp white star points (1–2 px) scattered **inside the bright regions only**, twinkling.
- **Build:** stars = `hash(cell)` threshold in a grid, size jitter, brightness `*= field_luma` so they live in the light. Twinkle = `sin(t*f + hash*6.28)`.
- **almost friends:** **match / unlock / reveal**. When Bub finds the match (around 20–21 s) and when the padlock opens (49–50 s), the background aurora brightens and sparkles appear only along the ribbon. That is subtle magic that reads as "special" without confetti. Our current confetti at 50.5–51.5 s is generic; replace or underlay it.

### 4.6 Liquid (5 %)
- **Seen:** not identifiable in the frames I sampled (no Liquid filter view). By name, it is likely a stronger domain warp / metaball-like fluid.
- **almost friends:** we already have raymarched liquid bubbles. A liquid field background would compete with the hero material. Skip it, or use it only at very low contrast behind the end mark.

### 4.7 Mosaic (4 %)
- **Seen:** 37.5 s dark: @tobiasvee, @pilinho, @neuform, @cipher416, @ravir_s show the field quantised to about 40-px squares, with a smooth field still visible through it. @vani (8.5 s) is the same. 38.6 s **light**: @instinct mint, @mtths cyan, @dylan aqua, with soft pastel pixel blocks on white.
- **Build:** `uvq = (floor(uv*N)+0.5)/N` before sampling the field. Animate N (e.g. 12 → 400) to "resolve" an image.
- **almost friends:** **reveal of faces (51–55 s)**. Faces arrive as coarse mosaic blocks of their own colours and resolve to sharp over about 0.6 s (N doubles every 4 frames: 8, 16, 32, 64, 128, full), the classic "unblur the anonymous profile". That says *anonymous → revealed* literally, which is the product's promise. Much stronger than our current fade-in of circles.

### 4.8 Chroma (1 %, "rarest")
- **Seen:** not shown in the video.
- **Build (by name):** chromatic aberration, offsetting R/G/B samples radially (`uv ± dir*0.004*r²`).
- **almost friends:** use as a **2–3 frame accent on hits** (SAME!! slam, padlock snap, logo land): RGB split of about 6 px decaying to 0. Constant chroma looks cheap and VHS.

### 4.9 Theme-following background (the real trick in the demo, 21–27 s)
- **Seen:** the same shader re-renders with `theme` blended 0↔1. Dark = ribbons on black. Light = pastel silk on white (23.3 s). The midpoint passes through flat grey (24.6 s) because they lerp both bg and ribbon colour linearly.
- **Build/steal:** a single `theme` uniform driven by our timeline. **Avoid the grey midpoint** by blending in OKLab or crossfading via the bright ribbon (raise the ribbon intensity to fill the frame white, then come down into the light theme). That makes a "flash through light" transition instead of a muddy one.

### 4.10 Frosted-glass card over the field (21.5 s, 23.3 s)
- A centred translucent card (`rgba(255,255,255,0.06)` dark, `rgba(0,0,0,0.04)` light, 1 px border at 0.12 alpha, backdrop blur) sits over the moving field. The field shows through blurred.
- **almost friends:** this is exactly how our **phone** should sit in the world. Our phone sections (8–14 s, 23–50 s) sit on an almost static pale gradient. Put a slow pastel field behind them, and make the phone glass and our UI cards pick up the blurred colour.

## 5. Type

- The site's display type is a neo-grotesk (Inter-like) in white, about 4.5 % of frame height for the H1 ("The ones who didn't wait."), left-aligned to the grid. The card names (@eduh) are about 4 % of frame height, **centred dead on the brightest part of the field**, with no shadow. They read because the field's dark falloff surrounds the white core.
- In the full-size card (2.8 s) the name fades in about 0.2 s **after** the field fades up. Field first, then words. The caption claims "标题字压上去就成立": put a title on it and it works. That holds true because the field is mostly dark or low-detail where the type sits.
- Micro-labels (#2,246, "Copy code") are UI chrome. Not for us.
- **Lesson:** big type centred on a luminous field works if the field's brightest point sits **behind or near** the type, not across the letterforms at equal value. On light theme, use our navy (#1b2340-ish) type. On a pastel field at 60–70 % lightness, white type fails.

## 6. Colour, light, material

- **Dark set:** black floor (#000–#0a0a0a), single-hue ribbons: cyan #2ee6e0, magenta #e05ad8, violet #8a5cf0, amber #f0a020, rose #e06080, mint #30e090. A white core is always present.
- **Light set (the one we want):** off-white #f5f5f5 floor. Ribbons become pastel pink #f0a8d8, lilac #c8a8f0, peach #f8c8b0, cyan #80e8f0, mint #80f0c0. The core goes **white-on-white**, so the field reads as soft silk folds with no hard edges (23.3 s, 38.6 s).
- **Light model:** emissive only, no surfaces and no reflections. The "material" is light itself. Value range: the dark set uses 0–100 %, the light set about 75–100 %.
- That is why the light set can sit *behind* our raymarched glass bubbles: glass needs something with variation to refract. Our current backgrounds are a near-uniform gradient, so the bubbles have nothing interesting to refract. That is a big part of why they look "CG default".

## 7. Tempo & sound

- No edit rhythm to speak of: about 4 shots in 39 s, all cursor-paced. A constant, compressed bed (−11 LUFS) runs with no hits synced to anything. The bed fades out from 32 s to 38.5 s.
- **What we take:** the **shader motion tempo**. The fields drift slowly (a ribbon travels about 5 % of frame per second) and never stop. Under a fast-cut film, a slow continuous field reads as "alive world", and the cuts and hits ride on top. Speed up the field (`t*3` for about 10 frames) on hits as a "surge".

## 8. Steal for almost friends

1. **Hook (0–3 s): pastel light-theme field behind "How to make more friends".** Now the hook sits on a flat pale-blue/peach gradient with a blurry ball pit at the bottom (sheet_01, 0–2.5 s). Change: a light-theme Pure field with one coral ribbon and one blue ribbon (our two brand bubbles' colours), crossing behind the word "friends". The white-hot core sits behind "friends" so the word gets a glow without a drop shadow. Frame 0 is already moving.
2. **Values pick (7.5–14 s): a field behind the phone, which picks up the selected value colour.** Now the phone floats on an almost blank gradient. Change: as each chip is tapped (Family = red, Career = blue, Adventure = amber), the background field's ribbon hue lerps toward that chip colour over about 0.4 s. The field ends as a three-ribbon blend, so the background visibly "learns" your values.
3. **Bub search (15–22 s): 0.4 s ASCII/halftone "scan" pass.** Now: a dense pastel bubble field (sheet_02) that the client found not 特效 enough. Change: as Bub's scan ring sweeps, the bubbles inside the ring momentarily quantise to halftone dots (or ASCII glyphs) and snap back. That is visible "AI computation" in one effect, limited to the ring area so the frame doesn't fill with dots.
4. **Match / SAME!! (31.5–33 s): halftone burst plus 3-frame chroma.** Now: a blue pill "SAME!!" over the phone with a few coloured dots. Change: on the hit frame, coral/blue halftone dots (N≈30) burst radially from behind the word, and RGB split runs 6 px→0 over 3 frames. The field behind does a hue surge (time ×3 for 10 frames).
5. **Unlock (49–50 s): sparkle-in-the-ribbon.** Now: a padlock opens, then generic confetti (50.5–51.5 s). Change: the background field brightens to a white-hot core behind the padlock, and sparkle points appear only inside the bright ribbon and twinkle out over about 1 s. Drop the confetti or keep it to under 12 pieces.
6. **Reveal (51–55 s): mosaic de-pixelation of the two faces.** Now: two face circles fade in under "You're both in!". Change: the faces enter as about 8×8 block mosaics of themselves and resolve over 0.6 s (8→16→32→64→full on a stepped curve, one step per 4 frames, at 60 fps). Anonymous → revealed, told in the material itself.
7. **Theme blend as a transition device.** For the bubble world ↔ phone UI cuts (e.g. 22–23 s, which now goes through a pink blur frame), blend the field through **white-hot** (raise the ribbon intensity to fill the frame), not through grey. It works as a light-flash transition with no hard cut.
8. **Global finishing: luminance-weighted animated grain at about 3 % on every frame,** with a tonemapped (`1-exp(-x)`) rolloff on all emissive elements. This is the single cheapest move toward "not CSS".

## 9. Don't copy

- **Dark/black-floor fields.** The whole site's default look is a dark ink world, which is a known rejection for us. Use only the light-theme variants.
- **Sustained ASCII, dense halftone, dense mosaic.** Fine dot or glyph fields covering the frame read as trypophobic or "hacker". Keep them as brief, area-limited accents.
- **The UI chrome**: "#2,246", "Copy code", "names claimed" are HUD micro-labels, which are rejected.
- **Linear theme lerp through grey** (24.6 s): muddy. Blend in OKLab or through white.
- **Type slapped centre-card with no relationship to the field**: on this site it works only because the field is dark around the name. On our light fields, place type where the field's value is lowest-contrast with the type colour, or let the ribbon pass *behind* the word on purpose.
- **Using a random user's card code as is**: per-shader licences are author-chosen (see header). Write our own field (about 60 lines of GLSL) or claim our own.

## 10. Key frames

![Pure-field grid](frames/08-shader-bgs-0.5s.jpg)
`frames/08-shader-bgs-0.5s.jpg`: Pure-field grid. Single luminous ribbons on black, each with a white-hot core and one hue, and names centred on the brightest area.

![Single card full size](frames/08-shader-bgs-2.8s.jpg)
`frames/08-shader-bgs-2.8s.jpg`: @eduh full size. You can read the exp falloff: core → cyan halo → black by about 60 % of the frame.

![ASCII and grain](frames/08-shader-bgs-6.2s.jpg)
`frames/08-shader-bgs-6.2s.jpg`: effect types side by side. Grain (@logga, sand-like sparkle), ASCII (@saheer, glyph columns), and pure fields.

![Halftone ASCII grain](frames/08-shader-bgs-10.3s.jpg)
`frames/08-shader-bgs-10.3s.jpg`: Halftone (@anuj gold dots), ASCII (@vercel teal digits), and Grain/smoke (@m_agustinm).

![Shader as page background](frames/08-shader-bgs-21.5s.jpg)
`frames/08-shader-bgs-21.5s.jpg`: the pasted WebGPU shader running full-bleed behind a frosted-glass card (dark theme).

![Light theme](frames/08-shader-bgs-23.3s.jpg)
`frames/08-shader-bgs-23.3s.jpg`: **the same shader in light theme**: pastel pink/lilac silk on white. The closest match to the *almost friends* palette.

![Sparkle and rarity list](frames/08-shader-bgs-35.7s.jpg)
`frames/08-shader-bgs-35.7s.jpg`: Sparkle filter (star points only inside bright regions), with the full rarity list: Pure field 39 % … Chroma 1 %.

![Light mosaic](frames/08-shader-bgs-38.6s.jpg)
`frames/08-shader-bgs-38.6s.jpg`: light-theme Mosaic grid. Mint/cyan/aqua pastel pixel-blocks on white, the reference for the face-reveal de-pixelation.
