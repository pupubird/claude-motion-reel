# Sound and music research: friend-app film (60 s, 9:16, 120 BPM)

Research for the score, the sound design and the UI foley of a 60-second vertical product film for a new
friend-making app (AI onboarding chat about priorities → AI match → 3 days of anonymous chat → mutual "unlock"
→ profiles revealed; explicitly not dating). Read on 2026-10-07. Nothing was generated and no credits were spent.

**Evidence base.** Current ElevenLabs docs (Context7 `/websites/elevenlabs_io`, the raw `.md` docs pages, the
changelog and the live OpenAPI spec), web research with sources at the end of each section, and measurements
of the four ElevenLabs takes shipped in reels 04 and 05 (`projects/novapitch`, `projects/feiyuehui`).

---

## 0. The answer on one screen

| Decision | Recommendation | Why |
|---|---|---|
| Concept | **"The conversation is the song."** Every UI sound is a note in the score's key and on its grid; the two anonymous people are two instruments that trade phrases, play in unison when both tap unlock, and complete one motif at the reveal | Turns the product's mechanic (two people, mutual consent, reveal) into music, so the sound tells the story without a voice-over |
| Genre | **Sunlit disco-funk with a mallet hook**: a nu-disco / disco-soul groove (four-on-the-floor, off-beat open hats, fingered octave bass, Rhodes, muted funk guitar, disco strings) carrying a marimba + vibraphone hook | Groove-led and warm (friendly), real-player feel and restraint (premium), and the mallets give the UI foley a home timbre (see §1) |
| Tempo, key | **120 BPM, A minor**, the reveal leaning on the relative major (C); **no key change** | One pitch set, C D E G A, fits every bar of both, so foley never has to switch (§2.3) |
| Score | ElevenLabs `music_v2_5` (+ `music_v2` as a control), a **9-chunk plan with a 2 s pre-roll** so the three big hits (2 s, 44 s, 56 s) sit on chunk boundaries; the 2 s breath is made in the mix | Chunks must be ≥ 3 s, and hits land on chunk boundaries (§3.6) |
| Foley | 20 cues: **12 synthesised** (pitched, quantised, many instances), **6 generated** (organic textures: latch, scribble, air, glass), **2 hybrids** at the reveal and the logo | Synthesis owns pitch and timing; generation owns realism (§4.5) |
| Master | −14 LUFS integrated, ≤ −1.5 dBTP measured on the encoded MP4 | House standard from reels 04–05 (AAC overshoot lesson) |

---

## 1. Sonic directions

### 1.1 Friendly and cool, not the corporate explainer

**The trap has a name, and it fits this product exactly.** In 2007 Creative Review described ads that had become
"soft, fluffy, handmade-looking things for products that just want to be your friend. And invariably, the choice of
music or soundtrack follows suit: arpeggiated acoustic guitar? Check. Softly spoken, whimsical vocals? Check."
([cr-twee]). A friend-making app is the product that literally wants to be your friend, so it is the most exposed.

**The instrument is not the sin; the arrangement is.** The glockenspiel came into tech ads to humanise them: Orba
Squara, whose song was in the first iPhone ad, said Apple "liked that the song was so human" ([globe]). Apple's
own Messages tone is still "a C on a glockenspiel" ([20k-apple]). What reads as corporate is a cute melody on top
with no groove, no low end, no dynamics, and stock-library defaults (ukulele strum, whistle, glock, claps in a row).

**What makes music read as friendly *and* cool** (each point tied to a source or to the owner's past notes):

1. **The groove carries it, not a cute tune.** Bass and drums with a real-player feel; warmth comes from Rhodes,
   tape and swing, not from toy timbres. Antfood's Instacart logo rests on "layers of swung and warm textures" ([af-found]).
2. **Colour in the harmony.** Minor-7 and 9th chords, "unexpected chords from outside the key" ([af-found]), with the
   bright major lift saved for the payoff.
3. **Restraint and space.** Room for the words on screen and for the UI sounds; one deliberate breath (the house
   rule since the reel 04 review: fast cutting, with one deliberate breath).
4. **Own a motif, not a mood.** "A genre isn't an identity … You're not crafting a brand sound, you're renting a
   reference, a style, a mood" (Wilson Brown, Antfood, 2026) ([af-cheap]). A short recurring motif is ownable (§1.4).
5. **Sound design and music are one system.** UI sounds as instruments in the key and on the beat, the way games do
   it (§2.2).
6. **It is not dating.** Keep romance codes out (slow-jam R&B, sultry saxophone, ballad strings, heartbeats); prefer
   group energy: claps, call and response, a band playing together.

### 1.2 Six directions at about 120 BPM

BPM and key from songbpm.com (Spotify analysis data). Six of the sixteen values were re-checked by hand, and all six
matched (✓). The brief's own Jungle examples mostly sit off 120 BPM, so "Jungle-style at 120" means borrowing their
production, not their tempo.

| Direction | References (BPM, key) | Traits to write in a prompt (no artist names) | Fit for this film | Risk |
|---|---|---|---|---|
| **A. Disco-soul (Jungle-style)** | Jungle "Time" 120, F major ✓ · "Casio" 116, B♭ ✓ · "Candle Flame" 123, A minor · off-grid: "Back On 74" 146 (73 half-time), "Busy Earnin'" 100, "Keep Moving" 111 | Four-on-the-floor with live congas and tambourine; muted funk-guitar chops; round melodic bass; 70s string stabs; tape warmth (the band's falsetto vocals are out) | Warm, human, "friends in a room" | Without its vocals it can sound like library disco; it needs a hook instrument |
| **B. Swung bounce (Kaytranada-style)** | Kaytranada "Lite Spots" 120, C♯ ✓ · "You're the One" 118, D major | Heavily swung drums sitting behind the beat; sidechain pump; chopped, filtered stabs; rubbery synth bass; Rhodes | The coolest option | Night-club mood, less "friendly"; the swing must be measured and the foley quantised to it |
| **C. Nu-disco / French touch** | Daft Punk "One More Time" 123, D major ✓ · Purple Disco Machine "Fireworks" 118, C♯ minor | A low-pass filter slowly opening on a looped disco phrase; octave bass; string swells; choppy rhythm guitar | The filter opening is a ready-made "reveal" | Can read as a generic fashion ad |
| **D. Modern indie-pop** | Two Door Cinema Club "Something Good Can Work" 120, C ✓ · MGMT "Kids" 123, A major · Phoenix "If I Ever Feel Better" 120, F♯ minor | Staccato palm-muted guitar arpeggios; straight eighth hats; bright analog synth hook; dry, close drums | Youthful, open, friendly | Without a singer it becomes a bed; dates fast |
| **E. Playful house** | Fred again.. "adore u" 124, C major · Disclosure "White Noise" 120, B♭ minor | Shuffled garage hats and rimshots; organ or Rhodes house chords; a filtered build into a euphoric drop | Energy for 60 s | The genre's hook is usually a chopped vocal, which we exclude |
| **F. Mallets and pizzicato over a modern beat** | Bonobo "Cirrus" 119, D ✓ ("the decaying tails of two notes of that thumb piano … against this kick drum": Bonobo, NPR via [wfit]) · Antfood's Starbucks score "featuring kalimba plinks, coconut hits and glass bottle klinks" and Goldman Sachs' "A pulsing kick drum provides a contemporary beat, while pizzicato and spiccato strings add elegance and precision" ([af-starbucks], [af-gs]) | Mallet or kalimba decays used as rhythm; syncopated pizzicato sixteenths; deep kick and crisp shaker | Precise, playful, premium; gives the UI an instrument family | The closest to the twee cliché if the drums are light |

**The pick: A + C + F**, "sunlit disco-funk with a mallet hook" (§4.1). A brings the warmth and the band, C the
filter move that opens the film (muffled cold open → full band at 2 s), F the marimba/vibraphone hook that the UI
foley is built from. B's swing is a seasoning at most: a straight sixteenth grid keeps every UI sound on the beat.

### 1.3 Reference films and ads, and what their sound does

| Film | Sound | Take-away for us |
|---|---|---|
| **Apple, "A Critter Carol"** (Dec 2025, iPhone 17 Pro; TBWA\Media Arts Lab; dir. Mark Molloy) ([aotw-critter]) | Woodland puppets sing Flight of the Conchords' "Friends"; music composition Walker, editorial Model Citizen, sound design Barking Owl, mix Racket Club | Friendship played with specificity and humour, crafted by four sound houses, not stock. (A licensed song, though: "the equity accumulates in the artist, not in you" ([af-cheap]).) |
| **Instagram logo launch** (BUCK, 2016; Antfood original music and sound design) ([af-insta]) | "This iconic score inspired a generation of high-gloss explainer videos" | The nearest precedent for a motion-graphics product reveal: music and sound built to the animation frame by frame |
| **Headspace Germany TVC** (BUCK; agency Koto; music Antfood) ([buck-hs]) | Calm category, music and sound from one studio | One studio for music and sound gives one sonic system |
| **Duolingo, Super Bowl 2024** (5 s, in-house) ([duo-sb]) | The creative director "recorded more than 200 clips of his own armpit fart sounds because we weren't happy with the fart sound effects available for purchase … We knew we had found the right sound when we hit on a fart with a smile." | For a playful brand, the hero sound is the joke, so it is made, not bought. Same rule for our latch, match and reveal |
| **Duolingo, in-app** (measured, §2.1) | Correct: F♯6 → A♯6, a major third up, 99 ms apart; incorrect: F♯5 → C5, a tritone down | Up means yes, a falling tritone means no, two notes a sixteenth apart |
| **YouTube sonic logo** (Antfood) ([af-yt]) | "A two-note melodic phrase echoes the two syllables in the name" + "a champagne pop sound" + "a warm synth pad plays a major 7th chord"; "3 seconds" | Tie the motif to the name's syllables once the app has one |
| **AirPods Pro 3 with Vini Jr.** (2026; secondary source) ([aural]) | The main cut has no music: the silence demonstrates noise cancellation | Silence as a statement: the breath before the reveal |

Not found: Partiful has no brand film or credited music that we could find; Bumble For Friends, Hinge, Timeleft
and the newer friend apps had no music credits to learn from.

### 1.4 Sonic-logo principles

- **Simple is remembered, complex is recognised.** A 2026 study of 90 unpublished sonic logos (Silas et al., with
  SoundOut) found that "complexity helps recognition of sonic logos but hinders recall". Green Giant's "simple 3-note
  melody built over a descending major triad" is easy to sing back; TikTok's "bass hit followed by a 4-note ascending
  melody … with a wide intervallic leap" is instantly recognised; McDonald's sits between, with "a unique
  syncopation, but also a clear rising scale" ([massive]).
- **Sync it to the picture.** "Begin visual movement precisely at the top of your sonic logo"; "Consider syncing your
  sonic logo's key notes with animated accents"; "Let outgoing music resolve naturally before the sonic logo plays"
  (Made Music Studio, [mms]).
- **Our Friend cell** (G–C–E, §4.2) follows that: three notes of a *rising* major triad (recall; rising reads as
  "openness, positivity" in Material's terms, §2.2), an opening leap of a fourth and a syncopated last statement
  (recognition), and at 56 s the score's final hit *is* the resolution it lands on.

**Sources for §1.** [cr-twee] Mark Sinclair, "The Rise of the Twee", Creative Review, 2007-07-04,
https://www.creativereview.co.uk/the-rise-of-the-twee/ · [globe] "Rockin' the glockenspiel", The Globe and Mail,
2009-10-09, https://www.theglobeandmail.com/report-on-business/rockin-the-glockenspiel/article4288503 · [af-cheap]
Wilson Brown, "In a World of Cheap Music, What's Valuable?", Antfood, 2026-04-20,
https://www.antfood.com/labs/in-a-world-of-cheap-music-what-is-valuable · [af-found] Antfood, "The foundation of a
high-impact sonic brand", 2023-03-01, https://www.antfood.com/labs/the-foundation-of-a-high-impact-sonic-brand ·
[af-insta] https://www.antfood.com/work/instagram-logo-launch · [af-yt] https://www.antfood.com/work/youtube-sonic-brand ·
[af-starbucks] https://www.antfood.com/work/starbucks-shake · [af-gs] https://www.antfood.com/work/goldman-sachs ·
[buck-hs] https://buck.co/work/headspace-germany · [aotw-critter] https://www.adsoftheworld.com/campaigns/a-critter-carol ·
[duo-sb] https://blog.duolingo.com/super-bowl-commercial-2024/ · [aural] https://auralcrave.com/en/2026/06/26/why-apples-vinicius-jr-airpods-commercial-has-no-music-and-how-the-internet-is-filling-the-void/ ·
[wfit] https://www.wfit.org/2013-04-05/bonobo-challenging-musics-borders-finding-a-new-frontier ·
[massive] https://massivemusic.com/soundboard/recall-recognition-sonic-logos ·
[mms] https://www.mademusicstudio.com/blog/5-expert-tips-for-using-your-sonic-logo-in-advertising ·
BPM/key: songbpm.com pages for each track, e.g. https://songbpm.com/@kaytranada/lite-spots-e205580e-978c-404f-8fc2-65c9d46f19a2,
https://songbpm.com/@jungle/time-no0ad, https://songbpm.com/@jungle/casio-7d2e2e53-5ecb-45b9-aea5-5cf2b6470ee9,
https://songbpm.com/@daft-punk/one-more-time-121ce59d-e8c9-4ee0-ba8c-da54bd104d93, https://songbpm.com/@bonobo/cirrus,
https://songbpm.com/@two-door-cinema-club/something-good-can-work-amb6s, https://songbpm.com/@jungle/candle-flame-Naq5aGTVJT,
https://songbpm.com/@jungle/back-on-74-b5eA1ruz0D, https://songbpm.com/@jungle/busy-earnin-ic12h,
https://songbpm.com/@jungle/keep-moving-4t5NFdaXWG, https://songbpm.com/@kaytranada/you-re-the-one-b8a56df5-4995-4a39-95b2-37cb7bfbe4bc,
https://songbpm.com/@purple-disco-machine/fireworks-jvn2l, https://songbpm.com/@mgmt/kids-c2e0d4de-9c25-4c20-b5bd-b1ea05546edf,
https://songbpm.com/@phoenix/if-i-ever-feel-better, https://songbpm.com/@fred-again/adore-u-k1f55,
https://songbpm.com/@disclosure/white-noise-dzkk8.

---

## 2. Musical chat foley

### 2.1 What the chat apps and Duolingo actually do

Pitches marked **measured** were taken from the shipped files (macOS system sounds, Duolingo's CDN) by the research
agent and then re-measured here with a second method: spectral peaks after each onset, plus a 10 ms dominant-pitch
track. The two methods agree. A third method, pYIN, put Duolingo's notes one to two octaves low, because the sound
stacks lower octaves under the note at −18 and −23 dB, which is a recipe in itself (§2.6).

| Sound | What it is (pitches and gaps measured) | Design intent (source) |
|---|---|---|
| **iPhone Tri-tone** (Kelly Jacklin's "158-marimba", 1999) | D4 → A4 → D5 (scale degrees 1-5-8), onsets 0.023, 0.151, 0.250 s | "I wanted a happy feel, so notes from the major scale, focussing on I, III, IV, V, and VIII"; "fixed eighth-note timing"; "preferred the ascending sounds"; the name "Tri-Tone" is "not actually accurate, from a music theory perspective" ([jacklin]) |
| **iOS "Note"** (Messages default since iOS 7) | C7 ≈ 2,114 Hz (+17 cents), one sustained bell | "It's a C on a glockenspiel"; the aim is to be "very audible … pleasing to hear, even if it's a more quiet environment" (Hugo Verweij, [20k-apple]) |
| **iOS 17 "Rebound"** | C6 for about 60 ms, then F5: a falling fifth | "two very short notes … this muted reverb in the end, that makes it sound like a little bit of droplet" (Verweij); "about being gentle, and being respectful … we don't want you to turn your sounds off" (Billy Sorrentino) ([20k-apple]) |
| **macOS `SentMessage` / `ReceivedMessage` files** | Sent: a rising glide F4 → A♯4 (350 → 458 Hz); received: a falling glide G4 → about D4 (393 → 285 Hz) | Matched to the Messages app by file name only |
| **Apple Pay success** | D6 → D7, an octave up, 113 ms apart | — |
| **Duolingo correct** | F♯6 → A♯6, a major third up, 99 ms apart; F♯4 and F♯5 stacked underneath at −23 and −18 dB | — |
| **Duolingo incorrect** | F♯5 → C5, a tritone down, 108 ms apart | — |
| **Telegram** | Android client: an incoming chat sound is skipped if one played in the last 500 ms; an outgoing one within 100 ms (`NotificationsController.java`, lines 3340 and 5932) | Throttling so a burst of messages does not become a machine-gun ([tg-src]) |
| **Windows 11** | "a set of calm, informative sounds" that "needed to traverse the entire 250 – 8000 Hz range in order to be audible to people who are hard of hearing", after users called the old ones "aggressive" ([win11]) | — |

**Patterns worth stealing.** The notes of these earcons sit **99–128 ms apart**, and at 120 BPM a sixteenth is
125 ms, so the classic spacing *is* our grid. **Yes goes up** (a major third, a fourth, a fifth, an octave, 1-5-8); **no goes down
a tritone**. **Frequent sounds are low, soft and short** (Apple's sent/received glides live at 285–458 Hz), and
**bright, high sounds are rare and important** (Note at C7, Apple Pay at D7).

### 2.2 Principles from UI-sound guidelines and games

**Google Material Design, sound** ([m-apply], [m-attr], [m-chor]):
- Hero sounds "occur infrequently"; notification sounds "should generally be shorter than hero sounds and crafted in a
  way that is suitable for being played multiple times"; sound may be unsuitable for "Actions that are performed
  frequently".
- "Sounds that are played in close proximity to one another should use the same or complementary key signatures."
  Peer sounds "should have related attributes (like timbre, melody, or envelope)". Repeated interactions "should
  include minor variations in sound timbre". Sounds "should play at a consistent level of loudness depending on
  their position in the sound hierarchy".
- "Upward motion commonly indicates starting, openness, positivity, or assurance … Downward motion commonly
  indicates ending or closedness." "Use unresolved melodies with caution as it can make things sound ambiguous."
- Tonal sounds "work best to communicate personality, emotion, and state changes, whereas atonal sounds better
  support motion transitions". "A sharper attack is more energetic." "Use softer, quieter timbres for low-priority
  sounds." "Treatments that isolate, duck, mix, and balance some sounds at specific moments can help focus user
  attention."

**Apple** ([hig-audio], [wwdc17]):
- HIG: "the system subtly varies the pitch and volume of the virtual keyboard's sounds … An efficient way to achieve a
  pleasing variation in sound is to randomize a sound file's pitch and volume during playback, instead of creating
  different files." "Your app can adjust relative, independent volume levels to achieve a great mix of audio."
- WWDC17 "Designing Sound" (Hugo Verweij): "pushing it back or forward by as little as ten milliseconds sometimes makes
  a difference"; "When you type faster, we bring down the volume of the sound ever so slightly"; "It makes sense to
  filter out those frequencies that you don't use"; a long notification sound "ducks for a very long time, so it
  becomes annoying".

**Games that make actions musical:**
- **Quantise:** "The magic that happened is quantization. Even if a player wasn't great at matching their
  interactions with the beat, quantization would synch the rhythms of play and make you feel good" (Tetsuya
  Mizuguchi on *Rez*, GDC 2016, [rez]).
- **Stay in the key:** "Pegs follow the scale tones that are defined by the underlying music segments"; the session
  "kicks off in D then moves up by a fifth after each ball shot", with stingers "one for each key center" (Guy
  Whitmore, *Peggle Blast*, [peggle]). "I kept everything in the key of C to keep a general harmony across the whole
  game. Everything uses the same scales" (Gus Callahan, *Blackbox*, [blackbox]). A "randomised hang drum note (that
  is tuned sympathetically to each level in the game)" (Todd Baker, *Monument Valley 2*, [mv2]).
- **The coin:** Super Mario Bros.' coin is B5 → E6, a fourth up. The research agent derived it from the game code
  (timer $071 then $054) and the NES pulse formula f = f_CPU / (16 (t + 1)); re-checked here: 1,789,773 / (16 × 114)
  = 981 Hz (B5 −12 cents) and 1,789,773 / (16 × 85) = 1,316 Hz (E6 −3 cents) ([nes-apu], [smb-src]).

### 2.3 Pitch strategy: every pop is a note in the score's key

**Tune to the take, not to the prompt.** On four ElevenLabs takes from reels 04 and 05, tuning sat within ±3 cents
of A = 440 Hz (well under what anyone hears in a mix) and tempo within ±0.2 BPM. The two takes that asked for a key
kept its tonic, but one came back in the *parallel mode* (D major for "D minor") (§3.4). So: measure key, mode and
tuning on the picked take, then fix the set.

**The set: C D E G A** (C major pentatonic = A minor pentatonic), all octaves.

- **Why the pentatonic is safe.** Against A minor / C major it leaves out exactly the two notes (F and B) that sit a
  semitone from a note of the tonic chords (F against E; B against C) and that form the tritone F–B. Over Am, C,
  Dm and F every note in the set is a chord tone or a soft extension (6th, 9th, 11th, major 7th). Over G and Em one
  note, C, sits a semitone above the chord's B: fine as a passing pop, but check the chord under any *held* hero
  note (read it from the stems' chroma at that bar).
- **It survives the reveal's lift** to C major unchanged, because C major and A minor share the set.
- **If the take reads A major** (the parallel mode), switch to A B C# E F#. **If the mode is unclear**, use the
  mode-proof subset A B D E (scale degrees 1, 2, 4, 5 are the same in A major and A minor) until it is resolved.
- **Register.** Pop fundamentals from C5 to G6 (523–1,568 Hz): above the kick and bass, inside the band phone
  speakers reproduce well, and clear of the Rhodes' body. Sparkles may go to C7 (2,093 Hz) and above.
- **Hero moments use chord tones**, not just scale tones: the Friend cell G–C–E is the top of Am7 and the whole of
  C, so it sounds *resolved* wherever the score sits on those two chords; place it there.
- **Pitch ladders tell the story.** A run of messages climbs the set (C → D → E → G → A → C…) and resets at each
  scene; the other person answers an octave lower; the two unlock taps take the first two notes of the cell, and the
  reveal completes it.

| Note | C4 | D4 | E4 | G4 | A4 | C5 | D5 | E5 | G5 | A5 | C6 | D6 | E6 | G6 | A6 | C7 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hz | 261.6 | 293.7 | 329.6 | 392.0 | 440.0 | 523.3 | 587.3 | 659.3 | 784.0 | 880.0 | 1046.5 | 1174.7 | 1318.5 | 1568.0 | 1760.0 | 2093.0 |
| MIDI | 60 | 62 | 64 | 67 | 69 | 72 | 74 | 76 | 79 | 81 | 84 | 86 | 88 | 91 | 93 | 96 |

f = 440 × 2^((m − 69)/12). Sub layers on the root: A1 55.0 Hz, A2 110.0 Hz, C3 130.8 Hz.

**Lesson from reel 04 (a contract the code did not keep).** `novapitch/src/audio.js` says "pitched foley sits in
C-major pentatonic", but only its bells and sparkles used the `PENTA` table; its pops took free frequencies: 300 Hz
(D4 +37 cents), 280 Hz (C#4, outside the set), ladders stepped in linear hertz (`640 + i * 90`). **Prevention:** every
pitched call takes a scale *degree*, never a frequency (`note(deg, octave)`), and a test renders the foley stem
alone and checks each event's measured pitch against the set (±15 cents).

### 2.4 Timbre: one family of instruments, built in Web Audio

Give the UI the score's own instruments, so a pop sounds like part of the band, not like an app on top of it:
**wood (marimba) = people, metal (vibraphone) = the app and the match, glass = the AI.**

| Voice | Recipe (all oscillators sine unless noted) | Source |
|---|---|---|
| Marimba (sent pops, chips, taps) | Partials at 1, 4.0 and about 9.2 × f, at 0, −18 and −30 dB; decays about 250, 80 and 30 ms; 2 ms attack; for the "bubble", glide from 0.94 f to f over 15 ms | Marimba bars: "second partial … a ratio of 4.0 … third partial … around 9.2 times the fundamental" ([ccrma]) |
| Vibraphone (match chime, reveal, logo) | Partials 1 and 4.0; decay 1.2–2 s; 5–6 Hz amplitude modulation at about 20 % for the motor | "first overtone tuned to a two-octave interval … much longer decay times"; "vibrato introduced by motor-driven discs" ([ccrma]) |
| Woodblock (day ticks) | Partials 1 and 3.0; 60 ms | Xylophone: "first overtone is tuned to a twelfth (a ratio of 3.0)" ([ccrma]) |
| Glass (the AI) | Inharmonic partials 1, 2.76, 5.4; decays 0.9, 0.5, 0.25 s | reel 04 `glass()` |
| Pluck (received pops) | Karplus–Strong **computed into an `AudioBuffer`** (or an AudioWorklet), or a triangle wave through a fast-closing low-pass | A `DelayNode` inside a feedback loop "is clamped to a minimum of one render quantum" ([webaudio]): 128 frames = 2.67 ms at 48 kHz, so a delay-loop pluck cannot go above about 375 Hz |
| Ticks and air | Band-passed white noise (ticks: about 3–4 kHz, Q 4, 0.5 ms attack, 12 ms decay; whoosh: 0.8 → 5 kHz over 180 ms) | Adapted from reel 04 `tick()` (4.2 kHz) and `whoosh()` |

**Envelopes without clicks.** `exponentialRampToValueAtTime` "does not work if the current value or the target
value is 0" ([mdn-target]), so start from 0.0001; for releases use `setTargetAtTime(0, t, τ)`, which covers 95 % of
the way in 3τ and 99.3 % in 5τ ([mdn-target]). Fading to −60 dB takes about 6.9τ, so τ = 15 ms gives a 100 ms tail.

**Render offline.** An `OfflineAudioContext` "doesn't render the audio to the device hardware; instead, it generates
it, as fast as it can, and outputs the result to an AudioBuffer" ([mdn-offline]). The foley is then deterministic
and driven by the same score map as the picture. Reuse reel 04's primitives (`whoosh`, `riser`, `suck`, `impact`,
`tick`, `pop`, `bell`, `glass`, `sparkle`) behind the `note()` rule above.

### 2.5 Timing: on the grid, transient first

- **Quantise to the sixteenth** (125 ms; 6,000 samples at 48 kHz). Ticks go in the gaps between the score's hats
  (find them in the drum stem), or they flam against them.
- **Sounds that move toward a point end on the grid:** a whoosh's peak, a swell's stop and a riser's top land on
  the beat; the pop fires there.
- **Generated sounds start early by their onset**: measure where the transient is in the file and start it that
  much before the frame (reel 05's `meta.json` technique).
- **Picture vs sound.** At 60 fps a sixteenth is 7.5 frames, so visual hits on odd sixteenths round by half a frame
  (8.3 ms). Keep audio sample-accurate and let the picture round: ITU-R BT.1359 puts the threshold of
  detectability at +45 ms (audio early) to −125 ms (audio late) ([itu]). Never let audio lead by more than a frame.

### 2.6 Level and transients against a mastered score

**What the platforms do.** Spotify adjusts tracks "to -14 dB LUFS, according to the ITU 1770 standard" and asks
for masters "below -1dB TP (True Peak) max" ([spotify]). For YouTube, −14 LUFS is a third-party figure (iZotope with
MeterPlugs data, 2025; Apple Music −16) ([izotope]); neither TikTok nor Instagram publishes one that we could find.
House standard: **−14 LUFS integrated, ≤ −1.5 dBTP measured on the encoded MP4**.

**What happened last time (measured).** In reel 04 the synthesised foley sat **20–35 dB under the mastered groove**
and was inaudible; the fix was a per-section foley bus of up to 4.5× (+13 dB) in the groove, and the gate became
"foley transients within ±6 dB of the local score", measured per event on stems. A mastered score has no headroom
left, so plan the foley level from the start, by section.

**Three tiers** (Material: loudness consistent with "position in the sound hierarchy"). The dB figures are our house
targets, relative to the score's local short-term level; no published standard gives numbers for this.

| Tier | Cues | Target | Treatment |
|---|---|---|---|
| Texture | Typing ticks, typing dots, air, the glass bed | −12 to −6 dB | Level varied ±1.5 dB; ticks get quieter when typing speeds up (Apple's keyboard rule) |
| Feedback | Pops, chips, day ticks, unlock taps, plucks | −6 to 0 dB | Pitch from the set; timbre varied a little ("minor variations in sound timbre") |
| Hero | Match chime, latch, reveal, logo | +3 to +6 dB | Duck the drums and bass stems 2–4 dB for about 100 ms instead of pushing the hero sound: Material's "duck, mix, and balance", and Apple's warning about long ducks |

**Transients.** A softer attack is more ambient, a sharper attack more energetic (Material): 0.5 ms for ticks,
1–3 ms for pops and mallets, never a 0 ms step (it clicks). Start envelopes from 0.0001, not 0 (§2.4).

**Spectrum.**
- High-pass every UI sound below what it uses ("filter out those frequencies that you don't use", WWDC17): around
  200–250 Hz for pops and ticks.
- Frequent sounds live low and soft (Apple's sent/received glides sit at 285–458 Hz); keep **2–5 kHz brightness for
  hero sounds**, where "the human ear is most sensitive" ([iso226]).
- Design inside **250–8,000 Hz**, the band Windows 11 set so that sounds stay audible to people who are hard of hearing
  ([win11]); it is also where phone speakers work. A sub thump needs upper harmonics or a click to be heard on a phone:
  the brain infers the missing fundamental from the harmonics ([faderpro]).
- For body without mud, stack the note's lower octaves 18–23 dB down, as Duolingo's "correct" does (measured, §2.1).

**Variation without detuning.** Apple randomises "pitch and volume" for keyboard clicks; do that only for the
**unpitched** ticks (±3 % pitch, ±1.5 dB). Tuned pops vary by scale degree and timbre, never by random pitch, or they
leave the key.

**Density.** At most one tonal pop per beat. Telegram throttles incoming chat sounds to one per 500 ms
([tg-src]), which is exactly one beat at 120 BPM. Ticks are texture and are exempt.

**Stereo.** Keep UI sounds near the centre (pan within ±0.3; the frame is 9:16); give the two people −0.2 and +0.2
so the call and response has a direction; the score stays wide.

**Sources for §2.** [jacklin] https://jacklinstudios.com/docs/making-of-158-marimba.html · [20k-apple] "The Sound of
Apple", Twenty Thousand Hertz, 2024-07-31, https://www.20k.org/episodes/the-sound-of-apple ·
[tg-src] https://github.com/DrKLO/Telegram (`TMessagesProj/src/main/java/org/telegram/messenger/NotificationsController.java`) ·
[win11] Carolina Hernandez, Windows Experience Blog, 2021-10-04, https://blogs.windows.com/windowsexperience/?p=176289 ·
[m-apply] https://m2.material.io/design/sound/applying-sound-to-ui.html · [m-attr]
https://m2.material.io/design/sound/sound-attributes.html · [m-chor] https://m2.material.io/design/sound/sound-choreography.html
(client-rendered; read via headless Chrome) · [hig-audio] https://developer.apple.com/design/human-interface-guidelines/playing-audio ·
[wwdc17] https://developer.apple.com/videos/play/wwdc2017/803/ · [rez]
https://www.gamedeveloper.com/audio/oral-history-of-i-rez-i-recounts-a-marriage-of-game-and-music · [peggle]
https://www.audiogang.org/scoring-peggle-blast-new-dog-old-tricks/ · [blackbox]
https://blog.prosoundeffects.com/inside-the-sleek-interactive-sound-design-of-award-winning-ios-puzzle-app-blackbox ·
[mv2] https://www.asoundeffect.com/behind-beautiful-sound-monument-valley-2-todd-baker/ · [nes-apu]
https://www.nesdev.org/wiki/APU_Pulse · [smb-src] https://gist.github.com/1wErt3r/4048722 · [ccrma]
https://ccrma.stanford.edu/CCRMA/Courses/150/percussion.html · [webaudio] W3C Web Audio API, DelayNode,
https://webaudio.github.io/web-audio-api/#DelayNode · [mdn-target]
https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime · [mdn-offline]
https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext · [itu] ITU-R BT.1359-1 as reported by Randy
Hoffner, TV Technology, 2003-05-14, https://www.tvtechnology.com/opinions/av-synchronization-how-bad-is-bad ·
[spotify] https://support.spotify.com/us/artists/article/loudness-normalization/ · [izotope]
https://www.izotope.com/en/learn/mastering-for-streaming-platforms.html · [iso226]
https://en.wikipedia.org/wiki/Equal-loudness_contour · [faderpro] Doug Lanza, 2023-08-05,
https://blog.faderpro.com/mixing/mixing-bass-for-all-speaker-sizes/ · Duolingo sounds:
https://d35aaqx5ub95lt.cloudfront.net/sounds/37d8f0b39dcfe63872192c89653a93f6.mp3 (correct),
https://d35aaqx5ub95lt.cloudfront.net/sounds/f0b6ab4396d5891241ef4ca73b4de13a.mp3 (incorrect) · Apple files:
`/System/Library/PrivateFrameworks/ToneLibrary.framework/…/AlertTones` and
`/System/Library/Components/CoreAudio.component/…/SystemSounds/system` on macOS.

---

## 3. ElevenLabs Music and Sound Effects: what the current docs say

All of this was read on 2026-10-07 from the sources listed in §3.12. Where docs pages disagree, §3.11 says so.

### 3.1 Models and endpoints

| Item | Current fact | Source |
|---|---|---|
| Music model ids | `music_v1`, `music_v2`, `music_v2_5`. The API **default is still `music_v1`**, and the OpenAPI spec now marks `music_v1` *deprecated*. Always pass `model_id` | [compose], [openapi] |
| `music_v2_5` | "our most advanced music model … improved audio quality and prompt adherence"; same workflows as v2 (composition plans, Audio Reference, inpainting). API support added 2026-09-14 | [music], [cl-0914] |
| `music_v2` | Introduced 2026-06-15 with chunk-based plans (`GenerationChunk`, `AudioRefChunk`); adds Audio Reference, mid-track genre transitions, "sound effects embedded inside tracks" | [cl-0615], [music] |
| Generate | `POST /v1/music` (audio bytes; the `song-id` response header identifies the song) | [compose] |
| Generate with details | `POST /v1/music/detailed` (multipart: JSON metadata + audio; adds `with_timestamps`, `with_waveform_visual` at 4 samples/s) | [detailed], [cl-0831] |
| Plan only | `POST /v1/music/plan`: "does not cost any credits but is subject to rate limiting"; `model_id` also defaults to `music_v1` here | [plan] |
| Video to music | `POST /v1/music/video-to-music`: up to 10 videos, 200 MB, 600 s total; `description` ≤ 1,000 chars; `tags` ≤ 10; accepts `music_v2_5` | [v2m], [cl-0914] |
| Stems | `POST /v1/music/stem-separation`: `stem_variation_id` = `two_stems_v1` or `six_stems_v1` (default six); returns a ZIP. The docs do not name the stems, so inspect the ZIP on the first call | [stems], [openapi] |
| Sound effects | `POST /v1/sound-generation`, only model `eleven_text_to_sound_v2` | [sfx] |

### 3.2 The composition-plan schema (`music_v2`, `music_v2_5`)

A plan is `{"chunks": [ … ]}`, an ordered list where each item is **one of** two types ([openapi], [inpaint]):

**Generation chunk** (required: `text`, `duration_ms`, `positive_styles`)

| Field | Type and limits | Meaning |
|---|---|---|
| `text` | string, ≤ 6,132 chars, ≤ 30 lines, each line ≤ 200 chars; optional `[Section name]` first (1–100 chars) | Section name, lyric lines, `{inline directions}`, `(phonetic sounds)` |
| `duration_ms` | integer, 3,000–120,000 | Always enforced on v2/v2.5 (`respect_sections_durations` only applies to v1) |
| `positive_styles` | ≤ 50 strings, English | "The styles for the first chunk are the most important as they set the overall tone and genre … Aim to have at least 6–7 styles in early chunks" |
| `negative_styles` | ≤ 50 strings, optional | "Use negative styles liberally to prevent unwanted sounds" (guide); "Leaving empty is a good default" (API reference) |
| `context_adherence` | `low` / `medium` / `high` (default) | How closely the chunk follows its neighbours; `low` = more freedom to break away |
| `conditioning_ref` | `{song_id, range:{start_ms,end_ms}}`, ≤ 30 s | Condition this chunk on a slice of a stored song |
| `condition_strength` | `low` / `medium` (default) / `high` / `xhigh` | How closely to follow that reference |

**Audio reference chunk**: `{"song_id": "...", "range": {"start_ms": 0, "end_ms": 30000}}` inserts a slice of a
stored song **unchanged** (minimum range 50 ms).

Request body around the plan ([compose]): `composition_plan` (mutually exclusive with `prompt`), `model_id`, `seed`
(0–2,147,483,647; "exact reproducibility is not guaranteed"; plans only, not prompts), `store_for_inpainting`
(store it so later plans can reference it), `finetune_id`, `sign_with_c2pa`. Query: `output_format`.

### 3.3 Limits (one table)

| Limit | Value | Source |
|---|---|---|
| Chunks per plan | ≤ 30 | [plans], [openapi] |
| Chunk duration | 3–120 s | [plans] |
| Song duration | 3 s–10 min via the API (`music_length_ms` 3,000–600,000) | [plans], [compose] |
| Text per chunk | ≤ 6,132 chars, ≤ 30 lines × ≤ 200 chars | [cl-0914], [compose] |
| Styles | ≤ 50 positive, ≤ 50 negative per chunk | [plans] |
| Conditioning reference | ≤ 30 s | [inpaint] |
| Prompt (prompt mode) | ≤ 4,100 chars | [openapi] (`Body_Compose_music_v1_music_post.prompt.maxLength`) |
| Concurrency | 2 parallel generations on the Creator tier (`429 concurrent_limit_exceeded`) | reel 04 LEARNING.md |

**What the limits mean on a 120 BPM grid (1 bar = 2 s):** a chunk can never be a single bar (2 s < 3 s). Keep
every chunk a whole number of bars from 2 bars (4 s) up, or the chunk boundaries (where hits land) drift off the
bar lines. A one-bar breath therefore cannot be its own chunk (§3.6).

### 3.4 BPM, key, instrumentation, inline directions

- **BPM and key go in `positive_styles`** as plain strings, as in the docs' own example: `"120 BPM"`, `"C major"`
  ([plans]). "The model accurately follows BPM and often captures the intended musical key … holds a stated BPM and
  key precisely enough to layer the output with other material" ([best]).
- **Measured on four takes from reels 04 and 05** (reel 04's shipped t6 and its t4; reel 05 v4's shipped c6 and its
  t4): tempo 119.93 / 120.18 / 120.05 BPM on the three checked (onset-envelope autocorrelation, hop 64, parabolic
  peak; librosa's default estimator said 117.5 or 123.0, a binning artefact); tuning −3 to +3 cents from A = 440 Hz
  (`librosa.estimate_tuning`); key by Krumhansl–Kessler profiles on CQT chroma. Where a key was asked for (both
  reel-05 takes, "D minor pentatonic") the tonic D held, but **the mode flipped once** (c6 measured D major,
  r = 0.84 vs 0.71 for D minor). So tune foley to A = 440, but measure every take's key and mode before fixing pitch
  sets. (Scripts: `measure_key.py`, `fine_tempo.py` in this session's scratchpad, not yet in the repo.)
- **Instrumentation and production** also go in styles. The best-practices page says a prompt answers five
  questions, "genre, mood, instrumentation, tempo, and production era"; any you leave open the model answers
  "with the most statistically likely choice — which is to say, the most average one". Studio words move real
  levers: "sidechained", "close-mic'd", "bone-dry", "tape saturation", "plate reverb" ([best]).
- **Inline directions** go in `text` inside braces: `{guitar solo}`, `{instrumental break}`. Braces are for "short,
  inline cues"; anything that describes the whole chunk belongs in `positive_styles` ([plans]).
- **Arrangement in order**: "The model follows instructions about time. Narrate the arrangement in order … The
  load-bearing words are small: *start with*, *just*, *then*, *bring in*" ([best]).
- **No artist or band names** anywhere. Copyrighted material in styles returns `bad_composition_plan` (and
  `bad_prompt` for prompts) with a suggested rewrite; "this includes mentioning a band or musician by name"
  ([plans], [quick]). So "Jungle-style" must be written as the traits (§1).
- **Styles in English**; lyrics can be any language ([plans]).

### 3.5 A clean instrumental

`force_instrumental: true` exists but "can only be used with `prompt`", not with a composition plan ([compose]).
With a plan, instrumental is a matter of writing:

1. `"instrumental"` in the positive styles of every chunk, and `"vocals", "singing", "lyrics", "spoken word",
   "choir"` in the negative styles of every chunk (the docs' ad example does exactly this: [plans]).
2. `text` holds **only** a `[Section]` tag and `{directions}`: no lyric lines.
3. **No parentheses** in `text`: parentheses mean "phonetic sounds" to be sung, such as `(ooh)` ([plans]).
4. Add `"vocal chops"` to the negatives: house and nu-disco styles invite chopped vocals.
5. Gate it: run Scribe on the score and require zero words (reel 04's check).

### 3.6 A breakdown before the reveal, and a final hit

The docs have no section on this; what follows combines what they do say with what reels 04 and 05 measured.

**What the docs give you:** `{instrumental break}`-style directions, negative styles, and the instruction to mark
silence explicitly: "Without the *just*, the model fills the silence — mark the silences explicitly" ([best]).

**What we measured:**

| Finding | Evidence |
|---|---|
| **Hits land on chunk boundaries**; the model fades chunk 1 in | reel 05 v1: no hit at 2.0 s until a 3 s intro chunk was put before it |
| Chunk-1 styles set the whole song, so a chunk 1 that mentions drums makes the intro loud | reel 04 takes 1–2 |
| A model-made breakdown reaches about **11 dB under the peak**, not silence | reel 04 take t6 |
| A plan can leave a hole where you did not want one | reel 04 t7: "a 2-bar silent hole mid-groove" |

**Recipe for this film:**

- **The breath (42–44 s) is one bar, below the 3 s minimum.** Fold it into the end of the build chunk (34–44 s)
  with an explicit direction (`{then for the final bar the whole band stops: just a soft reversed swell, no drums,
  no bass}`), and then **enforce it in the mix**: pull the score bus down about 24 dB over 30 ms at 42.0 s, or keep
  only a pad stem from `six_stems_v1` at −12 dB. The model makes the gesture; the mix makes it silent.
- **The reveal drop (44.0 s) starts a new chunk**, with `context_adherence: "low"` so it is free to jump, and the
  text `{massive hit on beat one: the full band returns, brighter and bigger than before}`. Negatives: `"fade in"`,
  `"quiet start"`, `"build"`.
- **The final hit (56.0 s) also starts a chunk**: `{one final full-band hit on beat one, then a ringing major chord …
  that decays to silence}`, negatives `"new groove"`, `"drum loop"`, `"abrupt cut"`. Add a 0.5 s safety fade at the
  very end in the mix.
- **A hit at the very start** needs a pre-roll: open the plan 1 bar before film time 0 so the first downbeat you
  use is a chunk boundary, not a fade-in (reel 05 used a 1 s offset, `plan.OFFSET_S = −1`; here 2 s keeps the grid).

### 3.7 Fixing one section without re-rolling the song (inpainting)

Generate every take with `store_for_inpainting: true` and keep its `song-id`. To fix one miss, send a new plan
that keeps the good parts as audio reference chunks and regenerates only the bad chunk ([inpaint]):

```json
{"chunks": [
  {"song_id": "<take id>", "range": {"start_ms": 0, "end_ms": 46000}},
  {"text": "[Drop]\n{massive hit on beat one …}", "duration_ms": 6000,
   "positive_styles": ["instrumental", "120 BPM", "…"], "context_adherence": "high"},
  {"song_id": "<take id>", "range": {"start_ms": 52000, "end_ms": 62000}}
]}
```

`context_adherence: "high"` is the docs' advice for "smooth transitions between kept and regenerated audio". To
make a new take that sounds like a liked one, put `conditioning_ref` (≤ 30 s of the liked take) on **the first
chunk**: "the first chunk influences the generation of all subsequent chunks" ([inpaint]).

### 3.8 Other music endpoints worth knowing

- **`/v1/music/plan` costs nothing**: send the brief with `music_length_ms: 62000` and `model_id: "music_v2_5"` to see
  how the model itself would cut it into chunks, then compare with our plan ([plan]).
- **Video to music** can score a locked animatic directly (`description` + up to 10 `tags`). It gives no control over
  chunk boundaries or BPM, so use it to explore ideas, not for the master ([v2m]).
- **Stem separation** helps the mix: duck the drums and bass stems (not the whole score) under hero foley, and build
  the breath and the stop-time from stems instead of gain rides ([stems]).
- **Audio Reference** (upload ≤ ~30 s to steer sound and groove) is documented as a UI feature of Music v2/v2.5 ([music]);
  over the API the equivalent is `conditioning_ref`, which needs a stored song (generated with `store_for_inpainting`
  or sent through `POST /v1/music/upload`) ([inpaint]).

### 3.9 Sound Effects API (`POST /v1/sound-generation`)

| Param | Values | Notes |
|---|---|---|
| `text` (required) | the prompt | Playground limit 450 chars ([sfx-pg]); the API reference states none |
| `duration_seconds` | 0.5–30, or `null` = the model guesses | ([sfx]); "40 credits per second when duration is specified" ([sfx-ov]) |
| `prompt_influence` | 0–1, **default 0.3** | "A higher prompt influence makes your generation follow the prompt more closely while also making generations less variable" ([sfx]) |
| `loop` | boolean, default `false` | "Whether to create a sound effect that loops smoothly. Only available for the 'eleven_text_to_sound_v2 model'" ([sfx]) |
| `model_id` | `eleven_text_to_sound_v2` (only value) | ([sfx]) |
| `output_format` (query) | `mp3_44100_*`, `pcm_8000`…`pcm_48000`, `opus_48000_*`, μ-law/A-law | "MP3 with 192kbps bitrate requires … Creator tier or above. PCM with 44.1kHz … Pro tier or above" ([sfx]). There is **no `mp3_48000_*`** for SFX (reel 05 hit a 422 on `mp3_48000_192`) |

Prompting ([sfx-ov], [sfx-help]): simple, concrete descriptions ("Glass shattering on concrete"); sequences
can be described ("…, then …"), but the help centre recommends "generating individual sound effects and then
combining them in an audio editor"; adding "high-quality, professionally recorded …, sound effects foley" helps;
the model knows audio terms (*impact, whoosh, one-shot, loop, stem, braam, glitch, drone*) and musical
elements ("Vintage brass stabs in F minor"). The playground makes four variants per click; the API returns one,
so loop the call for variants.

House rules from reel 05's `sfx.py`: two calls at a time (Creator tier), print each take's RMS and **flag anything
under −45 dB RMS** (a "drone" came back at −61 dB), and **measure each effect's onset** and start it early by that
much, so the transient, not the file start, lands on the frame.

### 3.10 Output formats, tiers and licence

- **Music formats** include `pcm_48000` and `mp3_48000_*`; `auto` gives `mp3_48000_192` on v2 models ([compose]).
  **Ask for `pcm_48000`.** The shipped MP3 takes decode 32–40 ms longer than planned (44.040 s for a 44.000 s plan;
  40.032 s for 40.000 s), which looks like encoder padding, and reel 04 measured its downbeats at +21 ms. PCM
  removes that question from the beat grid. (Whether PCM needs the Pro tier is documented for SFX and stems, not for
  music; try it and fall back to `mp3_48000_320`.)
- **Licence** (Eleven Music model terms, updated 2026-05-26): self-serve plans, Free to Business, allow "All online
  and offline commercial use … except film, TV, radio, & Studio Games"; no attribution on paid plans; streaming
  rights from Creator up ([terms]). A social and product film is covered; a TV spot would need Enterprise Music.

### 3.11 Inconsistencies in the docs (go by the API reference)

| Topic | Says | Elsewhere | Use |
|---|---|---|---|
| Max music length | "maximum duration of 5 minutes" ([music] FAQ) | 3 s–10 min ([plans]), 600,000 ms ([compose]) | 10 min (moot at 62 s) |
| SFX minimum | "0.1 to 30 seconds" ([sfx-ov]) | "at least 0.5" ([sfx], OpenAPI) | 0.5 s |
| Stem endpoint path | `/v1/music/separate-stems` (Context7 SDK copy) | `/v1/music/stem-separation` ([stems], OpenAPI) | `stem-separation` |
| Negative styles | "use liberally" ([plans]) | "leaving empty is a good default" ([compose]) | Liberal on chunk 1, short lists after |
| Undocumented fields | The OpenAPI body also lists `generation_mode`, `music_prompt`, `lyrics_text` (≤ 4,000), `finetune_strength` (≤ 2.0) and `use_phonetic_names` | Not in the API reference | Do not rely on them |

### 3.12 Sources for §3

- [plans] https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans
- [compose] https://elevenlabs.io/docs/api-reference/music/compose
- [detailed] https://elevenlabs.io/docs/api-reference/music/compose-detailed
- [plan] https://elevenlabs.io/docs/api-reference/music/create-composition-plan
- [inpaint] https://elevenlabs.io/docs/eleven-api/guides/how-to/music/inpainting
- [best] https://elevenlabs.io/docs/overview/capabilities/music/best-practices
- [music] https://elevenlabs.io/docs/overview/capabilities/music
- [quick] https://elevenlabs.io/docs/eleven-api/guides/cookbooks/music
- [v2m] https://elevenlabs.io/docs/api-reference/music/video-to-music
- [stems] https://elevenlabs.io/docs/api-reference/music/separate-stems
- [sfx] https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
- [sfx-ov] https://elevenlabs.io/docs/overview/capabilities/sound-effects
- [sfx-pg] https://elevenlabs.io/docs/eleven-creative/playground/sound-effects
- [sfx-help] https://elevenlabs.io/docs/help-center/product/core-capabilities/sound-effects/how-do-i-prompt-for-sound-effects
- [cl-0615] https://elevenlabs.io/docs/changelog/2026/6/15 · [cl-0831] https://elevenlabs.io/docs/changelog/2026/8/31 · [cl-0914] https://elevenlabs.io/docs/changelog/2026/9/14
- [openapi] https://api.elevenlabs.io/openapi.json (schemas `GenerationChunk-Input`, `AudioRefChunk`, `CompositionPlan`, `MusicModelID`, `Body_Stem_separation_v1_music_stem_separation_post`)
- [terms] https://elevenlabs.io/eleven-music-model-specific-terms
- Context7: `ctx7 docs /websites/elevenlabs_io "music API composition plan schema …"`

---

## 4. Recommendation

### 4.1 Genre, tempo, key, instrumentation

**Sunlit disco-funk with a mallet hook, 120 BPM, A minor, with the reveal leaning on C major. No key change.**

| Layer | Part | Role in the story |
|---|---|---|
| Drums | Tight four-on-the-floor kick, off-beat open hats, tambourine sixteenths; snare and clap on 2 and 4 from step 2 | Forward motion; the typing ticks sit in the gaps between its hats |
| Bass | Fingered electric bass with disco octave runs | Its upper harmonics carry the bass line on phone speakers (§2.6) |
| Keys | Rhodes, minor-7 voicings in the verses | Warmth; the AI's "voice" never fights it, because the AI cues are glassy and high |
| Guitar | Clean muted funk chops | **"Them"**: the other anonymous person in the call and response |
| Mallets | Marimba (wood) and vibraphone (metal) hook | **"You"** (marimba) and **the app/the match** (vibraphone); the UI foley is built from the same two timbres |
| Strings | Disco swells and stabs | Lift: step 2, the reveal, the logo |
| Production | Warm tape saturation, punchy and wide, "great production quality" | Premium; the docs say studio words move real levers ([best]) |

**Out (negative styles):** vocals, vocal chops, ukulele, whistling, glockenspiel, stock "corporate" music,
children's cartoon, romantic ballad and sultry saxophone (it is not dating), EDM supersaw drops, dubstep, trap
hats, lo-fi hiss, key change.

**Why A minor.** The minor-7 groove is the "cool" half of friendly-cool; the reveal can lean on the relative major
(C) for its lift **without changing pitch set**, so every foley note in §2.3 stays valid for the whole film. Reel 04's
take, prompted with no key at all, came out in A minor (r = 0.72): one data point, but A minor is not against the
model's grain. Fallbacks if a take lands elsewhere: transpose the foley set to the measured tonic and mode (§2.3).

### 4.2 The 30-bar section map

Bar *n* starts at (n − 1) × 2 s. The score is generated from −2 s (a one-bar pre-roll, trimmed) to 60 s.

| Bars | Time (s) | Film | Score chunk | Musical and foley events (times on the grid) |
|---|---|---|---|---|
| pre-roll | −2–0 | — | C1 Intro (4 s, sets the genre) | Generated, trimmed |
| 1 | 0–2 | **Hook**: cold open in a chat | C1's second bar, ducked about 12 dB and low-passed at 800 Hz | Typing ticks play the hi-hat on sixteenths; three message pops on beats 2–4 (0.5, 1.0, 1.5 s) spell the **Friend cell** G5–C6–E6 |
| 2–4 | 2–8 | **Hook**: drop, name the app by about 8 s | C2 Hook (`low` adherence): full band and mallet hook | 2.0 downbeat hit; titles land on bar downbeats (4.0, 6.0); swipe air on cuts |
| 5–8 | 8–16 | **Step 1**: tell the AI what matters | C3 Verse: thin groove, space in the upper mids | AI bubbles (glass), typing dots, priority chips family/wealth/career on C5, E5, G5, confirm on C6 |
| 9–12 | 16–24 | **Step 2**: the AI matches like-minded people | C4 Verse 2: claps, string stabs | 16.0–17.875 matching scan (rising pentatonic sixteenths); **18.0 match chime** (Friend cell on vibraphone) with a haptic buzz; 20–24 connection plucks on eighths |
| 13–17 | 24–34 | **Step 3**: 3 days anonymous | C5 Call and response: guitar asks, marimba answers | Day ticks at 24.0, 28.0, 32.0 (A4, C5, E5); time-lapse air between days; frosted-glass bed under masked avatars; your pops are marimba, theirs are plucks an octave lower |
| 18–21 | 34–42 | **Step 4 set-up**: unlock only if you both tap | C6 Build: unison, snare roll, filter sweep | Sparse pops; the build carries it |
| 22 | 42–44 | **Breath** | C6's last bar, forced near-silent in the mix | 42.5 tap one (G5, pan −0.2) · 43.0 tap two (C6, pan +0.2) · 43.125→43.875 reverse swell, stops dead · 43.875 latch click · one sixteenth of silence |
| 23–25 | 44–50 | **Reveal** | C7 Drop (`low` adherence): the biggest moment, C-major lift | **44.0 reveal sting**: impact, vibraphone Cadd9 and E6, which completes the Friend cell the two taps began; unblur sweep 44.0–44.5 |
| 26–28 | 50–56 | **Payoff**: not dating, friends | C8 Chorus: stop-time at 50.0, groove back on beat 3 | 50.0 band hit · 50.25–50.75 "dating" struck through (scribble) in the gap · "friends" lands with the groove · optional warm laughter 52–55 |
| 29–30 | 56–60 | **Logo** | C9 Outro: final hit, ringing chord | Friend cell in octaves landing on the hit: G on the and-of-4 (55.75), C on the last sixteenth (55.875), E on 56.0; air swell 55.0→56.0; ring-out; 0.5 s safety fade |

**The Friend cell** (G–C–E, a rising fourth then a major third) is the film's sonic logo. Its three notes are all
chord tones of Am7 and of C, the chords it is placed on (check the chord under each placement from the stems, §2.3). It is heard four times: spelled slowly by the first three
messages (0.5–1.5 s), as the match chime (18 s), split between two people at the unlock (G, C) and completed
by the reveal (E at 44 s), and compressed into the logo hit (56 s). The opening and the ending rhyme.

### 4.3 The composition plan (validated)

Send as `POST /v1/music?output_format=pcm_48000` with
`{"composition_plan": <below>, "model_id": "music_v2_5", "seed": <n>, "store_for_inpainting": true}`;
trim the first 2.000 s (film time = take time − 2 s).

```json
{"chunks": [
  {
    "text": "[Intro]\n{a filtered, muffled groove, as if heard through a phone speaker in the next room}\n{the filter stays closed; the full band is held back}",
    "duration_ms": 4000,
    "positive_styles": ["instrumental", "sunlit disco-funk", "modern nu-disco production", "120 BPM", "4/4", "A minor", "tight four-on-the-floor kick", "crisp off-beat open hi-hats and tambourine sixteenths", "fingered electric bass with octave runs", "Rhodes electric piano", "clean muted funk guitar chops", "bright marimba and vibraphone hook", "lush disco strings", "warm analog tape saturation", "playful, confident, warm", "low-pass filtered intro", "great production quality"],
    "negative_styles": ["vocals", "singing", "lyrics", "spoken word", "choir", "vocal chops", "ukulele", "whistling", "glockenspiel", "corporate stock music", "cheesy", "children's cartoon", "romantic ballad", "sultry saxophone", "EDM supersaw drop", "dubstep", "trap hi-hats", "lo-fi hiss", "key change"],
    "context_adherence": "high"
  },
  {
    "text": "[Hook]\n{the full band drops in on beat one with a big downbeat hit}\n{a catchy, bouncy marimba and vibraphone hook over the groove}",
    "duration_ms": 6000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "filter fully open", "big downbeat on beat one", "punchy and bright", "catchy mallet hook", "driving four-on-the-floor groove"],
    "negative_styles": ["vocals", "lyrics", "fade in", "quiet start", "muffled"],
    "context_adherence": "low"
  },
  {
    "text": "[Verse]\n{the groove thins out: kick, bass, soft Rhodes chords and muted guitar}\n{leave space in the upper mids}",
    "duration_ms": 8000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "lighter groove", "sparse and bouncy", "room for sound effects", "curious and friendly"],
    "negative_styles": ["vocals", "lyrics", "busy lead melody", "loud strings"],
    "context_adherence": "high"
  },
  {
    "text": "[Verse 2]\n{snappy claps join on two and four, string stabs answer the hook}",
    "duration_ms": 8000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "building energy", "disco string stabs", "snare and clap backbeat", "optimistic"],
    "negative_styles": ["vocals", "lyrics", "breakdown", "silence"],
    "context_adherence": "medium"
  },
  {
    "text": "[Call and Response]\n{two lead instruments trade one-bar phrases: muted funk guitar asks, marimba answers}\n{playful conversation between the two, steady groove underneath}",
    "duration_ms": 10000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "call and response", "muted funk guitar phrases", "marimba answers", "playful and cheeky", "steady groove"],
    "negative_styles": ["vocals", "lyrics", "loud strings", "breakdown"],
    "context_adherence": "medium"
  },
  {
    "text": "[Build]\n{guitar and marimba come together in unison, a snare roll and filter sweep climb for four bars}\n{then for the final bar the whole band stops: just a soft reversed swell, no drums, no bass}",
    "duration_ms": 10000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "rising build", "accelerating snare roll", "filter sweep opening", "tension and anticipation", "sudden stop before the drop"],
    "negative_styles": ["vocals", "lyrics", "EDM supersaw", "dubstep"],
    "context_adherence": "high"
  },
  {
    "text": "[Drop]\n{massive hit on beat one: the full band returns, brighter and bigger than before}\n{octave bass, soaring disco strings, mallet hook in octaves}",
    "duration_ms": 6000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "massive downbeat hit", "euphoric", "C major lift", "soaring disco strings", "full band at maximum energy", "joyful"],
    "negative_styles": ["vocals", "lyrics", "fade in", "quiet start", "build", "key change"],
    "context_adherence": "low"
  },
  {
    "text": "[Chorus]\n{the band hits on beat one and stops for two beats, then the groove kicks straight back in}",
    "duration_ms": 6000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "stop-time break", "full groove", "confident", "warm and joyful"],
    "negative_styles": ["vocals", "lyrics", "breakdown", "key change"],
    "context_adherence": "medium"
  },
  {
    "text": "[Outro]\n{one final full-band hit on beat one, then a ringing major chord with a mallet sparkle that decays to silence}",
    "duration_ms": 4000,
    "positive_styles": ["instrumental", "120 BPM", "sunlit disco-funk", "final hit on beat one", "ringing chord", "mallet sparkle", "decays to silence by the end"],
    "negative_styles": ["vocals", "lyrics", "new groove", "drum loop", "fade in", "abrupt cut"],
    "context_adherence": "medium"
  }
]}
```

Checked with `check_plan.py` (it encodes the limits in §3.3 plus the house rules; see §4.7 for where it lives)
before writing it here:

```
 # film start film end     ms bars  section
 1      -2.0s     2.0s   4000    2  Intro
 2       2.0s     8.0s   6000    3  Hook
 3       8.0s    16.0s   8000    4  Verse
 4      16.0s    24.0s   8000    4  Verse 2
 5      24.0s    34.0s  10000    5  Call and Response
 6      34.0s    44.0s  10000    5  Build
 7      44.0s    50.0s   6000    3  Drop
 8      50.0s    56.0s   6000    3  Chorus
 9      56.0s    60.0s   4000    2  Outro
total 62.0 s generated; film 60 s from film 0 to 60.0 s
PASS
```

The checker also failed a deliberately broken copy on all three planted faults (a 2 s breath chunk, a 203-character
line, an artist name), so it is not a rubber stamp. Notes on the plan:

- Chunk 1 carries 17 positive styles (the docs ask for at least 6–7) and the long negative list, because it sets
  the genre for the whole song. Later chunks repeat only `instrumental`, `120 BPM` and the genre tag.
- Chunk 1 names the full band on purpose. Reel 04 learned that this makes chunk 1 loud, and here that does not
  matter: its first bar is trimmed, and its second bar (the cold open) is muffled in the mix (−12 dB, low-pass
  800 Hz) rather than trusted to the model's "filtered intro".
- `low` adherence only where the music must break from what came before (the 2 s drop, the 44 s reveal).
- The brace directions are full sentences. The docs prefer short cues; sentences worked in reels 04 and 05, and
  every one of them here is a short instruction, not a description of the whole chunk.
- "C major lift" is the relative major: the same pitch classes, so it is not the "key change" banned in chunk 1.

### 4.4 Generation protocol

1. **Lock the animatic first** and take section lengths from the edit (reel 04's "next time" note). The map above
   is the starting grid; if a step grows by a bar, change the chunk, not the picture.
2. **Four takes**, two at a time (the Creator tier allows two): `music_v2_5` with two seeds and `music_v2` with two
   seeds, all with `store_for_inpainting: true` and `output_format=pcm_48000`. Use the `ELEVENLABS_API_KEY` in the
   repo-root `.env`: per reels 04–05, the Keychain key `hypit.elevenlabs` has speech permissions but not music. Reels 04 and 05 shipped one of each
   model, and reel 05 v1 had one v2.5 take that played a triplet feel (measured 80 BPM), so measure, never trust.
3. **Measure each take** with reel 04's `tools/beats.py`, `tools/kicks.py` and the new `measure_key.py`: tempo by
   fine autocorrelation (librosa's default estimator returned 117.5 or 123.0 on takes that measure 120.0, a binning
   artefact); grid phase from the low band (reel 04's lesson: full-band onsets put the phase 268 ms off); key, mode
   and tuning; per-bar RMS; onset strength at 2, 44, 50 and 56 s; Scribe on the score returns no words.
4. **Pick** by those checks, then by ear on a phone speaker.
5. **Fix, don't re-roll**: regenerate only a failing chunk with audio reference chunks around it (§3.7).
6. **Split the pick into stems** (`six_stems_v1`) for the mix (§4.6).
7. **Set the foley pitch set from the measurement** (§2.3), not from the prompt.

**Budget.** Reel 04's ledger shows 3,288 credits for two 62 s takes, so about 1,650 a take: four takes ≈ 6,600,
one or two inpaint fixes ≈ 1,500–3,000, generated effects ≈ 1,200 (about 29 s of audio at 40 credits a second, three
variants for the short ones). **About 9,000–11,000 credits in all**; reel 05's account had about 235,000 left on
2026-10-01.

### 4.5 The 20 sound effects

S = synthesise in Web Audio (`OfflineAudioContext`, rendered with the picture's clock). G = generate with
`POST /v1/sound-generation` (`model_id: eleven_text_to_sound_v2`). H = both, layered. Pitches use the C D E G A set
(§2.3); synthesis recipes are in §2.4.

| # | Cue | When | What it is | Decision and why | Pitch, or generation parameters |
|---|---|---|---|---|---|
| 1 | Typing ticks | 0–2, steps 1 and 3 | Soft key ticks that double as hi-hats | **S**: hundreds of instances, must sit on the sixteenth grid between the score's hats | Unpitched: band-passed noise near 3.2 kHz |
| 2 | Typing dots ("…") | AI and anonymous chats | Three quiet blips while someone is typing | **S**: in key, loops on eighths | E6, G6, A6 at a whisper |
| 3 | Send whoosh | each sent message | A short air sweep that ends exactly on the beat | **S**: its end must hit the grid | Unpitched sweep 0.8 → 5 kHz, 180 ms |
| 4 | Sent pop ("you") | each sent message | A round marimba "bloop" with a tiny rising glide | **S**: pitch ladder through the set | Ascending C D E G A, octave 5–6 |
| 5 | Received pop ("them") | each received message | A plucked answer an octave lower | **S**: the other voice of the call and response | A4–E5 |
| 6 | AI bubble | step 1 | A quick glassy three-note sparkle, the AI's signature | **S**: must be audibly different from humans (glass, not wood) | D6, E6, A6 in thirty-seconds |
| 7 | Priority chips | step 1 | Family, wealth, career each tap a note; confirm rings | **S**: three notes and a resolve | C5, E5, G5, confirm C6 |
| 8 | Screen swipe air | cuts and slides | A clean airy swish for panel moves | **G**: organic air texture; three variants, rotate them | `text`: "quick soft airy swipe, a clean smooth UI transition swoosh, short, close and dry, no tonal content"; 0.6 s; `prompt_influence` 0.5 |
| 9 | Matching scan | 16.0–17.875, 20–24 | A rising pentatonic arpeggio that "searches", then plucks as matches connect | **S**: tempo-locked, must land on the match | Sixteenths C5 → E6, low-pass opening; plucks on eighths |
| 10 | Match chime | 18.0 | The Friend cell on vibraphone, with a phone-buzz layer | **S**: the brand motif, so pitch must be exact | G5, C6, E6 (sixteenth, sixteenth, quarter); buzz 175 Hz, two 80 ms pulses |
| 11 | Day ticks | 24.0, 28.0, 32.0 | Three wooden ticks counting days | **S**: rising, one per downbeat | A4, C5, E5 |
| 12 | Time-lapse air | between days | A day passing in a second | **G**: organic, with a shimmer tail | "smooth airy time-lapse whoosh, like a day passing in a second, soft shimmering tail, no music, no voices"; 1.5 s; 0.5 |
| 13 | Frosted-glass bed | 24–34 (masked avatars) | A delicate crystalline texture for anonymity | **G**: texture, and a use for `loop` | "soft frosted glass shimmer, delicate crystalline air texture, gentle and steady, no melody, no rhythm"; 4 s; 0.4; `loop: true` |
| 14 | Unlock taps | 42.5 and 43.0 | You tap, they tap: two soft taps with notes | **S**: they are the first two notes of the Friend cell | G5 (pan −0.2), C6 (pan +0.2) |
| 15 | Reverse swell | 43.125 → 43.875 | Air sucked in, stopping dead on the latch | **S**: must stop to the sample (reel 04's `suck`) | Noise low-pass 300 Hz → 9 kHz with a rising 40 → 110 Hz sine |
| 16 | Latch click | 43.875 | A small premium metal latch opening | **G**: mechanical realism; onset-aligned | "a small high-quality metal latch unlocking, one crisp satisfying click, close-mic, dry studio recording, no reverb"; 0.5 s; 0.7 |
| 17 | Reveal sting | 44.0 | Impact, the completing E6 and a Cadd9 bloom, an unblur sweep | **H**: generated body and air, synthesised pitch | G: "bright airy cinematic impact with a glittering sparkle tail, light and joyful, no deep boom, no braam"; 2 s; 0.5. S: vibraphone C6 E6 G6 D7, sub on the bar's measured root, 0.5 s sweep |
| 18 | Strike-through | 50.25–50.75 | "Dating" crossed out with a marker in the stop-time gap | **G**: a real pen stroke reads instantly | "one fast marker pen stroke across paper, crisp and close, dry, single stroke"; 0.5 s; 0.7 |
| 19 | Friends' laughter (optional) | 52–55 | Warm group laughter, far back | **G**: human texture; keep it about 20 dB down and check that Scribe finds no words | "a small group of friends laughing warmly together in a cosy café, natural and candid, no words, short"; 2.5 s; 0.4 |
| 20 | Logo hit | 55.0 → 56.0 | Air swell into the Friend cell in octaves on the final hit | **H**: generated air, synthesised motif | G: "soft air whoosh rising into a hit, smooth, airy, ends sharply"; 1 s; 0.5. S: marimba G5 C6 E6 + vibraphone an octave up at 55.75, 55.875, 56.0 |

Totals: 12 synthesised, 6 generated, 2 hybrid. For every generated cue, run reel 05's `sfx.py` rules: two at a time,
flag takes under −45 dB RMS, measure the onset and start the file early by that much, and ask for `pcm_48000` (Pro
tier) or `mp3_44100_192` (Creator).

### 4.6 Mix plan

- **Buses.** Score stems (or the stereo score) → a duck stage; a foley bus with a per-bar gain list, as reel 04's
  `FX_BARS` (reel 04 needed up to 4.5×, about +13 dB, in the groove); a hero bus for the match, latch, reveal and logo;
  one shared short room so foley sits in the score's space (generated cues are asked for dry for that reason).
- **Targets.** Pops at −6 to 0 dB of the local score level; ticks and dots −12 to −6 dB (texture); hero hits +3 to
  +6 dB, helped by a 2–4 dB, ~100 ms dip on the drums and bass stems rather than more foley gain. Reel 04's gate:
  foley transients within ±6 dB of the local score, measured per event on stems.
- **The breath.** At 42.0 the score bus falls about 24 dB in 30 ms (or only a pad stem stays, at −12 dB); it returns
  on the 44.0 chunk boundary, where the new chunk's attack hides the edit.
- **The stop-time at 50.0.** After the hit, mute the drums and bass stems until beat 3 (50.1–51.0 s) and let the
  hit's tail ring in the other stems; the scribble sits in that hole and the groove returns at 51.0.
- **Master.** −14 LUFS integrated and ≤ −1.5 dBTP **measured on the encoded MP4**: reel 05's first mux overshot to
  −0.9 dBTP in the AAC encode.
- **Gates before "done".** `check_audio.py` (loudness, true peak, no empty bars); per-event transient vs local score;
  Scribe on the score (no words) and on the mix; a listen on a phone speaker at 50 % volume.

### 4.7 Decisions needed, then next actions

**Decisions for the owner:**
1. The direction: sunlit disco-funk with a mallet hook (recommended) or one of the alternatives in §1.
2. The Friend cell as the sonic logo (G–C–E), heard four times.
3. Whether to keep the optional laughter (cue 19).

**Then, in order:**
1. Port the three helper scripts into `projects/almostfriends/tools/`: `check_plan.py` (plan validator), `measure_key.py`
   (key, mode, tuning) and `fine_tempo.py` (tempo). They were written for this research in the session's temporary
   scratchpad (all three now live in `tools/`).
2. Lock the animatic on the 30-bar map; re-run `check_plan.py` on any change.
3. Call `/v1/music/plan` (free) with the brief to compare the model's own chunking.
4. Generate four takes, measure, pick, inpaint, split stems.
5. Build the 12 synthesised cues as one `foley.js` driven by the score map, with the `note(deg, octave)` rule and its
   pitch test (§2.3); generate the six G cues.
6. Mix, gate, and review on a phone.

