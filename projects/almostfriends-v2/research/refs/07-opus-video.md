# 07 — "opus5.5的视频能力涌现出越来越多的创意" (made with Claude)

| | |
|---|---|
| Title | "opus5.5的视频能力涌现出越来越多的创意" — a character-animation "SHOWREEL 2026", end card reads "directed & coded by CLAUDE" |
| Author / link | SkylineX (268 likes) — http://xhslink.com/o/WgS9wudpG0 |
| Duration | 15.0 s |
| Format | 1280×720, 30 fps, 16:9 |
| Cuts | 22 detected hard cuts → 23 shots, **average shot 0.65 s**. From 8.0 to 11.27 s the cuts are exactly 0.467 s apart, i.e. **128 BPM**. The on-screen ticker even says "128BPM". |
| Loudness | **−7.8 LUFS** integrated (brick-walled club master). Intro 0–1.4 s sits at −26 to −30 dB RMS; it rises 1.4–1.8 s; the kick sits at −6 to −7 dB on each beat from 1.9 s; there is a **pre-drop dip at 7.1–7.4 s** (down to −24 dB); the **drop at 7.5–7.7 s** peaks at −3 dB |

**What it is:** a 15 s kinetic-type showreel built around one keyed-out anime dancer (a character video with alpha), composited by code (HTML/Canvas, per the caption) into eight graphic "chapters" cut to a 128 BPM track: outline words, MOVE, SPIN, LAYERS, VECTOR TRACE, DROP (踊れ), LOOP grid, FRAME BY FRAME, then the SHOW REEL 2026 end card.

## Why it reads high-end

One moving subject is reused in maybe twelve different graphic treatments, so it looks lavish while being cheap: silhouette, outline, halftone, echo trails, mirrors, panel multiples, a grid of 30. Every chapter change sits on a beat and the kick is felt as a visual event: a background colour flip, a slam of type, or an RGB split. The type is *architecture*. Words are as big as the frame and the subject stands inside or in front of them, so type and subject make one image instead of a caption under a picture. A strict three-colour system (acid lime, violet, ink black, plus cream) holds the chaos together. It reads "cool" through **density of ideas per second**, and that is the axis our current film is weakest on.

## Beat sheet

Timings come from a 10 fps strip of the whole video (`ffmpeg fps=10`), the cut list and the RMS envelope.

| Time | What we see | Camera | Into next | Sound sync |
|---|---|---|---|---|
| 0.0–0.4 | Ink-black screen, camera-viewfinder corners. "SHOWREEL_2026" types on above a thin lime timeline bar | static | hard cut | quiet pad, −28 dB |
| 0.5–0.6 | **"MOTION"** in lime outline type at about 35% frame height; lime **silhouette** of the dancer in front, with an olive drop-shadow copy offset down-right | static | cut | — |
| 0.7–0.9 | **"DESIGN"** violet outline + violet silhouette (new pose) | static | cut | — |
| 1.0–1.1 | **"SHOW"** white outline + white silhouette | static | cut | — |
| 1.2–1.3 | **"REEL"** lavender | static | cut | riser starts 1.4 |
| 1.4–1.6 | **"2026"** lime | static | **letterbox open**: a cream band expands from a thin horizontal slit (1.7) | riser |
| 1.8–2.0 | Cream stage, dancer in T-pose, dashed baseline. A giant black **"M"** slams in from the left at 1.9, then "ME_" with an underscore cursor at 2.0 | static | letters complete | **first downbeat 1.9 s** |
| 2.1–2.7 | **"MOVE"** fills the frame (letters about 65% of frame height). A lime disc sits behind the dancer's head and her body covers the "O". Lime ✕ and violet ○ stickers. Top/bottom marquee tickers | static | colour swap | kicks 2.4 |
| 2.8–3.5 | MOVE swaps to **violet with a lime offset shadow**; a black star and a circle orbit sticker appear | static | **whip pan** | kicks 2.9, 3.3 |
| 3.6–3.8 | Horizontal motion-blur whip (about 0.3 s) to a dark field | whip L→R | cut to SPIN | 3.8 |
| 3.9–5.4 | **"02 SPIN"**: the dancer spins 360° at the centre. **Time-echo trails** in lime and pink lag behind her. Two **mirrored ghost copies** sit left and right, tinted violet at about 60%. A circular text ring "SPIN • TURN • FLOW" rotates around her, with radial speed lines and dashed inner rings | static, slight push | **diagonal stripe wipe** | kicks 4.3, 4.7, 5.2 |
| 5.5–5.6 | 45° bands (violet / lavender / black / lime) slide across | — | reveal triptych | 5.7 |
| 5.7–6.0 | **"LAYERS"** triptych: dancer / black silhouette / dancer in three vertical panels, "×03 LAYERS" chip | static | panels fly out | — |
| 6.1–7.0 | On black, panels **fly in from different directions** (staggered) → 5 panels (×05) → 9 panels numbered **01–09** in outline numerals, alternating real / lime / black / violet silhouettes, all in sync | static | cut to black | kicks 6.1, 6.6 |
| 7.0–7.4 | **"VECTOR TRACE"**: on black, a lime glowing stroke **draws the dancer's outline** (0 → 100%). A pink **"HEY!" starburst sticker** pops in at 7.3 | static | **glitch flash** | **pre-drop dip** |
| 7.5 | Drop frame: white-washed, heavy **RGB split** of 踊れ (odore, "dance!") and the dancer | — | — | **DROP 7.5–7.7, −3 dB** |
| 7.6–7.9 | **"03 DROP"**: huge violet 踊れ, the dancer jumping in front, RGB split decaying, rotating **sunburst rays**, outlined "DANCE DANCE" / "DROP • DROP" marquee rows top and bottom | static, slight shake | **bg flip on beat** | — |
| 8.0–8.4 | Lime bg: 踊れ goes to **outline only**, the dancer becomes a **violet halftone** silhouette | static | flip | beat 8.0 |
| 8.5–8.9 | Dark rays: solid lime 踊れ, full-colour dancer | static | flip | beat 8.47 |
| 8.9–9.1 | Violet bg: lime 踊れ | static | **slice glitch** | beat 8.93 |
| 9.2–9.3 | Horizontal slice displacement and RGB split on the whole frame | — | hard cut | — |
| 9.4–9.8 | **"T-17"** polaroid-style card on black → pull back as cards tile outward | **zoom out** | grid | beat 9.4 |
| 9.9–11.1 | **"04 LOOP / REPEAT"**: a 5×6 grid of the dancer in sync, cells alternating real / lime / violet / black silhouettes. **Cell colours re-shuffle on every beat** | static | zoom into one card | beats 9.87, 10.33, 10.8 |
| 11.2–11.3 | Push back into a single card → blur | push-in | blur dissolve | 11.27 |
| 11.4–12.9 | **"05 FRAME BY FRAME"**: dark violet stage with a **synthwave grid floor**, a face-tracking box with readout, an audio meter, a giant ghost "FRAME BY FRAME" marquee behind | static | blur | — |
| 13.0 | Blur frame | — | cut | — |
| 13.1–13.9 | Lime bg: **"SHOW"** rises from a baseline mask (13.1–13.2), **"REEL"** (13.5), **"2026"** outline (13.8–13.9). The dancer stands right with a violet offset-shadow silhouette behind | static | hard cut | — |
| 14.1–15.0 | End card on **dark violet sunburst**: lime SHOW REEL / outline 2026, RGB split decaying over about 6 frames, credit "directed & coded by CLAUDE" | static | end | last hit 14.07, tail 14.8 |

## Signature moves (特效)

### 1. Figure-ground architecture type ("MOVE")
- **When:** 1.9–3.5 s ([frame](frames/07-opus-video-2.3s.jpg)).
- **Frame by frame:** 1.9: a black "M" slams in at full size (no scale-up; it appears with a 1-frame position overshoot). 2.0: "ME_" with a typing cursor. 2.1: "MOVE" complete. The letters run edge to edge and top to bottom between the marquee rows. Behind the dancer's head sits a lime **disc** that is the same size as the "O" and sits on it. Her body hides the O, so the word reads by inference. 2.8: the whole word recolours to violet with a lime offset shadow (about 8 px down-right) and the stickers swap.
- **Construction:** three layers: (1) bg + giant word, (2) accent disc, (3) alpha subject. Offset shadows are a duplicate glyph layer translated with no blur.
- **Why it's cool:** the subject and the word lock into one composition, which is the poster-design move that makes type feel designed rather than captioned.

### 2. Outline word + flat silhouette flash cards (intro)
- **When:** 0.5–1.6 s, five cards at about 0.2 s each (about 12 frames at 60 fps) ([frame](frames/07-opus-video-0.6s.jpg)).
- **Frame by frame:** each card is a different word (MOTION / DESIGN / SHOW / REEL / 2026) in a 2 px outline at about 35% frame height, a flat silhouette of a *different* pose in the matching colour, and a darker offset shadow. The silhouette crosses the word, so outline strokes show through gaps.
- **Construction:** the alpha matte of the character video, filled with a solid colour. The outline is `stroke` only, no fill.
- **Why it's cool:** a fast promise of what's coming, made from almost nothing.

### 3. Time-echo trails + mirrored ghosts (SPIN)
- **When:** 3.9–5.4 s ([frame](frames/07-opus-video-4.4s.jpg)).
- **Frame by frame:** the centre dancer turns. Behind her, two or three copies of her matte from earlier frames (lagging about 2–6 frames) are drawn in lime and pink at about 50–70% opacity, so fast parts (hair, skirt) smear into colour bands. Left and right, two mirror copies sit at about 85% scale, tinted violet at about 60%, as a stage chorus. Around her a text-on-a-circle ring rotates at a constant speed; radial speed lines flicker.
- **Construction:** keep a ring buffer of the last N frames of the matte. Draw frame t−k filled with colour k, with `globalCompositeOperation='screen'` or plain alpha. Mirror copies are `scale(-1,1)` with a hue tint. The circular text uses glyphs placed along an arc and rotates about 30°/s.
- **Why it's cool:** motion becomes colour. It is the cheapest strong "VFX" signal there is.

### 4. Panel multiplication (LAYERS ×03 → ×05 → ×09)
- **When:** 5.7–7.0 s ([frame](frames/07-opus-video-6.5s.jpg)).
- **Frame by frame:** a triptych (real / black silhouette / real). At 6.1 the frame goes black and panels fly in from top, bottom and sides with about 2-frame staggers, landing as 5 equal vertical strips. By 6.4 there are 9 strips with big outline numerals 01–09 at the top; fills alternate violet / lime / cream / black. All copies play the same dance in sync.
- **Construction:** N clipped viewports of the same video; per-panel fill or silhouette mode; numerals as outline type.
- **Why it's cool:** a count-up ("×03 → ×09") builds energy into the drop, and the sync gives a kaleidoscope feeling.

### 5. Vector trace draw-on (pre-drop)
- **When:** 7.0–7.4 s.
- **Frame by frame:** black screen. A single lime stroke with a soft glow traces the character's contour from the top of her head clockwise, about 25% per 0.1 s. The tiny label reads 0% → 100%. At 7.3 a pink starburst "HEY!" pops with overshoot (scale about 0 → 1.15 → 1 over about 4 frames, tilted −10°).
- **Construction:** contour extracted from the matte (marching squares), drawn as a path with `dashoffset`. Glow is a blurred duplicate in additive mode.
- **Why it's cool:** the tension frame before the drop. Darkness plus one thin line equals anticipation.

### 6. Drop hit: white flash + RGB split + sunburst
- **When:** 7.5–7.9 s ([frame](frames/07-opus-video-7.6s.jpg)).
- **Frame by frame:** 7.5: the frame is washed toward white with R / G / B channel copies offset by about 10–20 px horizontally. 7.6: the colour returns, the split is still about 10 px, and huge violet 踊れ sits behind the jumping dancer. 7.7–7.9: the split decays to 0 over about 6 frames while the sunburst rays rotate slowly. The marquee rows of outline "DANCE" / "DROP" scroll.
- **Construction:** post-process pass; sample R at uv+d, B at uv−d, with d = d0·exp(−t/τ), τ ≈ 0.1 s. Exposure kick +1 stop on the first frame.
- **Why it's cool:** the eye feels the kick. It lasts **under 0.4 s**; it is a hit, not a style.

### 7. Beat-flip treatment cycling (DROP)
- **When:** 8.0–9.1 s, one state per beat (0.467 s).
- **States:** (a) violet bg, violet solid 踊れ, full-colour dancer → (b) lime bg, **outline-only** 踊れ, **halftone violet silhouette** dancer ([frame](frames/07-opus-video-8.2s.jpg)) → (c) dark rays, lime solid 踊れ, full colour → (d) violet bg, lime 踊れ.
- **Construction:** one composition with swappable fill, stroke and dancer-render modes (normal / silhouette / halftone dot screen via a threshold on luma × dot pattern), switched on beat with no tween.
- **Why it's cool:** maximum change with no new layout. The layout holds still while the "skin" flips on each kick.

### 8. Card → grid → card (LOOP)
- **When:** 9.4–11.3 s ([frame](frames/07-opus-video-10.5s.jpg)).
- One "T-17" card centred → zoom out (about 0.4 s, ease-out) as neighbouring cards appear → a 5×6 grid. On each beat the cell colour assignments shuffle. Then a push back into one card and a blur dissolve.

### 9. Mask-rise end title
- **When:** 13.1–14.3 s ([frame](frames/07-opus-video-14.3s.jpg)).
- Each line rises out of an invisible baseline mask (glyph tops appear first, about 3 frames per line), stacked SHOW / REEL / 2026 with the last line in outline. A hard cut to the dark-ray version with an RGB split decaying over about 6 frames makes the final hit.

## Type

- **Scale:** hero words are 35–65% of frame height (MOVE, 踊れ, SHOW REEL). They are the background architecture, not captions.
- **Styles:** a condensed heavy grotesk (MOVE, SHOW REEL); outline versions of the same face for secondary or "ghost" words; Japanese display type for 踊れ. Mixing solid and outline in one stack (SHOW REEL solid / 2026 outline) is a recurring device.
- **Placement:** the word is centred behind the subject (MOVE, 踊れ), or flush left with the subject on the right (end card). The subject always overlaps the type.
- **Entries:** slam in at full size (1-frame), type-on with a cursor ("ME_"), rise from a baseline mask (SHOW / REEL), or a colour flip on beat. **No fades.**
- **Holds:** intro words about 0.2 s; MOVE about 1.6 s (with a colour change halfway); 踊れ about 1.6 s across four beat-flips; end title about 1.9 s.
- **Noise layer (do not copy):** micro-labels everywhere — "CUT_01/05", timecode, "REC", "SPEED x1.77", "×05 LAYERS", "T-17", "FACE_01 0.97", and tickers like "1920×1080 — 01 / MOVE — 128BPM — 30FPS".

## Colour, light, material

- **Palette:** acid lime (about #D4F53C), electric violet (about #6A35E8), lavender, ink black (about #0E0A18), and cream paper (about #ECE9E2). Pink (about #F03C78) is used only for the "HEY!" sticker and echo trails.
- **Light:** none in a 3D sense. Graphic only, plus a vignette, a **film-grain overlay** on every frame and a soft vignette on the cream stage. Glow appears only on the vector-trace stroke.
- **Material:** flat fills, halftone dots, outline strokes and paper grain. The character art is cel-shaded.

## Tempo & sound

- 128 BPM, with a visual change on **every** beat from 1.9 s. Big changes (new chapter) land on bar lines: 3.8 SPIN, 5.7 LAYERS, 7.5 DROP, 9.4 LOOP, 11.3 FRAME, 13.1 END.
- Energy curve: quiet flash cards (0–1.6) → riser and letterbox reveal → constant 128 BPM groove → **one bar of near-silence with the vector trace (7.0–7.4)** → drop at 7.5 (loudest) → sustained → end title → final hit at 14.07.
- The pre-drop dip and the black frame are the most transferable rhythm idea: **take things away for half a bar before the biggest moment.**

## Steal for almost friends

Mapped against the current release sheets (`research/current-special/`), translated into our pastel blue / coral / cream world and 1080×1920 at 60 fps:

1. **Hook as figure-ground type** (hook, 0:00–0:02). Replace the small top-third "How to make more friends" over a centred Bub with flash cards on the beat: "HOW" / "TO" / "MAKE" / "MORE" in giant outline type (about 30% frame height), each about 12–14 frames, with Bub's silhouette filled blue / coral / cream crossing each word. Then **"FRIENDS"** slams in solid, filling the width. Bub sits in front, its glass body taking the place of the "O" (the MOVE trick), with a coral disc behind it. *Change vs current:* 0:00–0:01.5 currently shows small type above a static Bub; this makes frame 0 kinetic and the type architectural.
2. **Bub search with time-echo trails** (Bub search, 0:15–0:21). When Bub darts, draw 3 lagged copies (2 / 4 / 6 frames behind at 60 fps) in blue and coral at 40–60%, screen-blended, so the glass bubble smears into a two-tone comet. *Change vs current:* Bub's motion through the pink field is currently illegible; the trail makes speed and intent visible and adds a clear 特效 layer without adding density.
3. **Pre-match silence + vector trace** (match, about 0:19.5–0:20.5). For half a bar (about 0.45 s), drop the crowd to near-black-transparent / desaturate it, kill the music to a pad, and trace a single glowing coral line round the matched bubble's contour (dashoffset 0 → 100%). Then **hit**. *Change vs current:* the match now arrives inside an unchanged busy field (0:19.5–0:20 frames). Contrast is what makes the hit read.
4. **Drop hit for SAME!!** (SAME!!, 0:32). On the downbeat: a 1-frame exposure kick, an RGB split of about 16 px decaying with τ ≈ 6 frames, and "SAME!!" at about 40% frame width becoming *architecture* behind the phone (the phone overlaps the type), not a sticker in front of it. Then do **beat-flips** for 3–4 beats: background blue → coral → cream → blue; SAME!! solid → outline → solid; phone normal → coral silhouette → normal. *Change vs current:* SAME!! is currently a blue pill sticker over the phone for about 1 s (0:32–0:33) with confetti dots; it reads like UI, not an event.
5. **Panel multiplication for "friends gather"** (friends, 0:56–1:01). Our vertical frame suits **horizontal bands**: the pair's photo repeats in 3 → 5 → 9 bands on successive beats, alternating real photo / coral silhouette / blue silhouette / cream, then collapses back to the pair, which morphs into the end mark. *Change vs current:* 0:57–1:01 is a loose float of 20+ faces with no beat structure; this gives "more friends" a count-up rhythm.
6. **Beat-locked chapter changes** (all beats). Put every beat change of our film on a bar line of the track, and every intra-beat change (colour, fill mode, type state) on a beat. *Change vs current:* the current transitions (e.g. 0:06.5 fade, 0:22.5 whip, 0:43.5 blur) float off-grid.
7. **Mask-rise end lockup** (end mark, 1:02–1:05). "almost" rises out of a baseline mask, then "friends.ai" solid, 3 frames apart; final hit with a short RGB split decay, then a clean hold. *Change vs current:* the end mark currently scales/fades in politely (1:02–1:02.5).
8. **Solid + outline pairing in the type system** (values / day cards). For "Day 1 / Day 2 / Day 3" (0:34.5–0:39), set the number huge in outline and the line in solid, flip on beat. *Change vs current:* these are small, left-aligned text blocks beside a phone.

## Don't copy

- **All the HUD micro-labels**: CUT_01/05, timecode, REC, SPEED x1.77, FACE_01 boxes, T-17, ×05 LAYERS chips, "128BPM — 30FPS" tickers. These are an explicit known rejection.
- **The dark ink / violet-black world** (0–1.6, 3.9–5.4, 7.0–7.4, 11.4–12.9, 14.1–15). Our brand is a light pastel sky; use darkness only as a 0.3–0.5 s pre-hit dip, never as a setting.
- **The 5×6 grid of 30 identical figures** and dense dot halftones over large areas. They border on the dense-field / trypophobic look we were told to avoid. Halftone, if used at all, only on one small silhouette for one beat.
- **The acid lime + violet palette.** Map the device, not the colours, to our brand blue / coral / cream (take the exact values from the brand files).
- **Sustained RGB split or glitch.** Here each glitch lasts ≤ 0.4 s; anything longer looks cheap.
- **Anime character, sunburst manga rays as a background** (off-brand), the Japanese 踊れ and marquee tickers.
- **The −7.8 LUFS brick-wall master.** Keep our mix around −14 LUFS for platform normalisation; get punch from transients and silence-before-hit, not limiting.

## Key frames

![MOTION outline + silhouette](frames/07-opus-video-0.6s.jpg)
*0.6 s: outline word at about 35% height with a flat lime silhouette and an offset shadow crossing it; a 12-frame flash card. (Note the HUD chrome we will not copy.)*

![MOVE figure-ground](frames/07-opus-video-2.3s.jpg)
*2.3 s: frame-filling "MOVE". The lime disc behind the head stands in for the "O" and the subject locks type and image together.*

![SPIN echo trails](frames/07-opus-video-4.4s.jpg)
*4.4 s: time-echo trails (lime/pink lagged mattes), mirrored violet ghosts and a rotating text ring. Motion turned into colour.*

![LAYERS ×05](frames/07-opus-video-6.5s.jpg)
*6.5 s: the same subject in 5 synced panels alternating real and silhouette fills, counting up toward ×09 before the drop.*

![Drop RGB split](frames/07-opus-video-7.6s.jpg)
*7.6 s: drop hit. RGB split at about 10 px, decaying over about 6 frames, giant 踊れ behind the jumping subject.*

![Halftone beat flip](frames/07-opus-video-8.2s.jpg)
*8.2 s: one beat later, the same layout reskinned: lime ground, outline-only glyphs, halftone violet silhouette.*

![LOOP grid](frames/07-opus-video-10.5s.jpg)
*10.5 s: the 5×6 synced grid whose cell colours reshuffle on each beat. Useful as rhythm grammar, too dense for us as an image.*

![End card](frames/07-opus-video-14.3s.jpg)
*14.3 s: end lockup with solid SHOW REEL and outline 2026 flush left, the subject right with a violet offset-shadow silhouette, the RGB split nearly decayed.*
