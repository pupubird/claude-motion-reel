# almost friends — the Apple way: what was decided, what went wrong, what prevents it

## Decisions

| decision | why |
|---|---|
| A new film from scratch, not a fork of the release, the special edition or v2 | the owner: "do not affected by the previous few versions"; their diagnosis of all of them: "the design taste, no morph between scene … complete AI slop, especially the font and text was super immature" |
| Pure motion graphics, path-traced in Blender from Python | the owner: "only do motion graphic to the max, no AI video generation". Glass, light and water at film quality needed a path tracer; code keeps every frame a pure function of time |
| Research before any frame | `research/`: Apple's HIG on motion and the WWDC spring talks, Apple's films measured frame by frame, the owner's 12 references filtered for fit, how top studios go all out |
| Real renders for every taste call, not boards | the HTML storyboards were read as the style ("too plain … too 克制, 我想要的是那种高端大厂会做的"), and the phone mockup at their centre was rejected ("why are we so 執著 about the phone mockup"); scenes 1–2 were built for real and judged before the rest |
| The score is a Suno song with MIDI | the owner rejected two generated tracks ("too soft", "too 大众 no vibe") and picked "Sunny Groove"; its stems and per-stem MIDI give exact bars, so the picture is cut to the song's own tempo map, and the bar before the reveal is stripped to strings and vocal for the breath |
| A sunny world | the first full preview was called plain ("like a junior 3d intern"), then the moody real-sky pass "very depressing". Now: eleven photographic CC0 skies blended at matched exposure and turned so the sun lands where a shot wants it, a turquoise sea, no night; the wait sits in cloud shade and the reveal is the sun breaking out behind her |
| One camera path for the whole film, smoothed as one | "camera some frames jumpy": per-act camera functions hand their last state to the next, the whole path is smoothed with a variable sigma (wider where acts meet, tight on the designed fast moves), and the build prints the worst linear and angular acceleration |
| A WOW map with a new picture at least every 2 s | "the special and v2 version was handling quite well — yours linear all the way … every 1.5–2s must have a WOW!". `WOWMAP.md` lays 42 moments on the beats, each a different kind of move; `tools/energy.py` measures it |
| Every line of type moves | "the way you show the text is like very immature, no handling in motion": each line is set once by Chrome (HarfBuzz kerning) and cut into one plane per glyph, so letters or words fly, slam or rise in and whip or scatter out; the step numerals 1–4 are glossy 3D |
| Titles are placed on the frame by the final camera | a title placed in the world drifts out of frame when the camera moves (the 2 and the 4 were cropped). An act asks for a group to sit at a screen spot at a reference frame, square to the lens, riding the camera by `follow`; the build places it after the camera is final |
| The picks: a dial and a ring that fills, one steady camera | "ok la a bit cheesy … the 3 tags flying into the ring, i think maybe is camera issue". The first version cut to a macro, a top-down and a tilted low angle on the beats, kicked the camera on every hit and fired the tags into you as spinning comets with spark bursts. Now the tags sit upright on a dial around you, the camera circles a few degrees as the dial turns, each pick steps toward you and glides into your ring and fills its third with its colour, and the horizon takes that colour. Your ring is silver until you choose. The camera does not cut in this act |
| The overlap is a gold duotone of the faces | the flat emissive fill blew out to peach under the film's view transform; the faces now show through it as a warm gel, with a fine line of light where the discs cross |
| After the reveal the camera goes to the faces | the first preview went still for 4.7 s after the faces appeared (the camera parked, small type changing). The camera now circles in close on both faces, "almost friends" is set across the frame, and on bar 21 a hard pull back finds three more pairs opening |
| No object casts a shadow | the sky's sun painted dark blots on the sea under every floating coin, which read as dirt |

## Bugs and their prevention

| bug | cause | prevention |
|---|---|---|
| reading the Suno MIDI crashed | a malformed key-signature meta message | `music_film.py` patches mido's decoder to fall back to C |
| `TypeError: 'Vector' object is not callable` in act C | a module-level `M = …` shadowed the toolkit's `M()` node helper | no single-letter names next to `from afx import *` (it became `MEET`) |
| the sky washed beige | a blend defaulted a missing `sun_size` to 0 | `SKY_DEFAULTS` gives every key its default |
| two cues landed a bar late | beat 49 where bar 13 starts at beat 48 | only `bar(n)` and `beat(i)`; bar n starts at beat 4(n − 1) |
| the camera jolted at every act boundary (118 m/s², 105,665 °/s²) | each act's camera started from its own pose | one path smoothed as a whole, segment by segment between cuts; the gate prints the worst values (now 27 m/s² and 963 °/s², both in the designed whip at the match) |
| the skies' sun came out 180° from where it was aimed | Blender's equirect u runs the other way from the assumed convention | every sky's sun is measured (`hdri_info.json`), and `rot_for_sun()` aims it; `SUN_AZ0 = 126` |
| the jump gate failed at 26.23 s and 28.23 s | each time-lapse day restarted the sky's rotation | one continuous rotation and a dawn-to-dawn handover between days |
| faces readable through the frost | frost alone does not hide a face at film resolution | the portraits behind the glass are pre-blurred (`people_blur.py`) |
| letters dropped slices ("a most / fri ends") | the glyph planes shared one depth, and coplanar transparent planes fight | each glyph sits at its own depth |
| "friends" never rendered | dozens of invisible (opacity 0) glyph planes left on screen exhausted Cycles' transparent bounces along the ray | glyphs are hidden outside their life (`set_visible` keys) |
| the 2 and the 4 cropped at the top; titles drifting off frame | titles placed in the world while the camera rose | titles go through `ctx['titles']` |
| SAME!! invisible | the accent orange sat on the amber reply bubble | it bursts in the open sky above the thread; accent type is checked against what is behind it |
| a hairline through your coin at the launch | the trail led the coin and showed through its frosted glass | no trail: the launch is the camera chasing the coin, the horizon dropping and a few sparks |
| your coin rose into its line of type | the title held while the coin kept rising into place | the 2 and its line sit higher and tighter |
| the question tilted as the camera circled | the line's plane did not turn with the camera | it is keyed to turn with the orbit |
| black arcs at the end of the rings of light | an emission-only surface keyed to strength 0 renders black | `glow()`: emission added over a transparent surface, so light fades to nothing |
| intended held keys came back interpolated | `linearize_all()` reset every key, held ones included | it only linearises keys that are not held |
| dark blots on the sea | the sky's sun cast the floating coins' shadows on the water | the build turns shadows off for every object |

## Numbers

- **The camera gate (build):** cuts only at frames 1569 and 1690 (act D's days); worst linear acceleration
  27.1 m/s² and angular 963 °/s², both in the designed whip at the match (frames 1101–1114).
- **The energy, against the two references** (`tools/energy.py`: new pictures per 10 s; still half-seconds; the
  longest stretch without a new picture): special 12.7 · 16.0 % · 5.1 s; v2 11.4 · 17.6 % · 4.7 s.
  - First 14 s, beat-cut picks (rejected as cheesy): 14.2 · 10.7 % · 1.8 s.
  - First 15 s, the dial picks with the orbit and the horizon wash: 12.6 · 13.3 % · 1.5 s, no hard jumps.
  - Full preview v4: 10.5 · 22.4 %; every gap ≤ 1.6 s up to 36 s, then 4.7 s, 3.0 s and 2.1 s after the reveal and
    the end hold, which led to the rebuilt back half.
- **The mix:** −14.2 LUFS integrated, −1.0 dBTP, 123 cues.
- **Render cost:** a 1080 × 1920 frame at 32 samples takes 10–16 s on an M2 Pro (Metal); a half-size preview frame at
  16 samples takes 3–8 s.
