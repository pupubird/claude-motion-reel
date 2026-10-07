# Friend app: UI research for the mock iOS UI

Prepared 2026-10-07 for the 60-second vertical (1080 × 1920) motion-graphics product film.

**Scope.** This report covers three things:

- real iOS reference screens for eight pattern categories (a–h);
- iOS 26 specs for a realistic mock;
- a screen plan for the film's mock app.

**App summary.** You set your life priorities in a chat with an AI. The AI matches you with like-minded people. You chat anonymously for 3 days, and profiles unlock only if both people tap Unlock. The app is for making friends, not dating.

---

## 0. Method, tools and caveats (read first)

| Source | What it provided | Status |
| --- | --- | --- |
| Mobbin MCP: 23 screen searches (3 timed out and were retried), 1 flow search | Real iOS screenshots. Each is a 3x capture of a 393 × 852 pt iPhone: 1179 × 2556 px, plus a 120 px Mobbin footer (measured). | OK |
| Apple iTunes Search API | Timeleft's official App Store screenshots (app id 6466442949). Timeleft is **not** in Mobbin's library. | OK |
| Apple Human Interface Guidelines (HIG) | Apple's own text, read from the apple-design skill's local mirror (pulled from developer.apple.com 2026-09-22). The Layout page was re-checked live on 2026-10-07. | OK |
| Apple developer documentation (JSON endpoints) | "Adopting Liquid Glass" and the `glassProminent` button style | OK |
| Use Your Loaf, learnui.design, Apple Developer Forums, Apple Support | Screen sizes, safe areas, tab-bar insets, iPhone 18 Pro display | OK |
| Pixel measurement of first-party iOS 26 screens (Apple Messages, Apple Music) | Geometry for bubbles, composer, keyboard, navigation bar and tab bar | **Measured**, ±1 pt |
| AppKittie MCP (`search_onboarding_screens`) | Onboarding design tokens | **Failed.** Both calls returned HTTP 401 "Invalid or missing API key", and no data came back. The connector needs re-authentication. |
| WebSearch | General lookups | The session's search budget ran out near the end, so the idle Dynamic Island size is **not sourced**. |

Caveats:

- **Mobbin appears to blur real users' faces.** Real-user photos show a consistent face-shaped blur, while Mobbin's own test personas ("Alex Smith", "Sam Lee") are sharp. Treat blurred faces in these captures as redaction, not app design. Intentional anonymity designs are listed under (d).
- **Mobbin `img` links expire 30 days after retrieval.** The durable copies are the local files in `research/ui-refs/`. Cite the `mobbin.com/screens/...` links.
- **How "measured" values were produced.** A script segments pixels in the downloaded first-party screenshots (3 px = 1 pt), and I checked each crop visually on a 1–4 pt grid. Values are accurate to about ±1 pt. They describe Apple's own apps on iOS 26 at capture time, on a 393 × 852 pt device. I scaled them to the 402 × 874 pt canvas only where marked "inferred".
- **Apple has removed the device-size table from HIG › Layout.** The page's change log still reads "September 9, 2025: Added specifications for iPhone 17, iPhone Air, iPhone 17 Pro, iPhone 17 Pro Max…". The live page (JSON) no longer contains the table after Apple's 2026-09-09 update, so screen sizes are cited from Use Your Loaf and learnui.design instead.

---

## 1. Key patterns (what the best references share)

1. **Interest and value pickers are emoji + label pills in a wrapping layout.**
   - A counter makes the choice feel finite: Bumble shows "0/5 selected", BeReal "1/10 selected" and Digg "19/19".
   - There is one strong selected state, a filled black, brand or glass chip (BFF, Locals, Replika).
   - Bumble's chips measure about 36 pt tall, fully rounded, with an 18 pt emoji.
2. **Ranking takes one of two forms.**
   - Tap-to-number (Babbel, Ten Percent Happier): big numerals appear in tap order.
   - Long-press-lift with grab handles (The Weather Channel, Klarna, YNAB): the dragged row rises with a shadow or outline.
   - Tap-to-number reads faster on film.
3. **AI onboarding is either a mascot with a speech bubble or a true chat with quick replies.**
   - Mascot plus speech bubble above answer cards: Duolingo, Speak, BitePal, Yazio.
   - True chat with quick-reply pills: American Airlines, and Perplexity's inline chip questions.
   - Tolan's friend quiz has a **"Wavelength" meter**, a ready-made compatibility metaphor.
   - Google Health's AI coach opens with the closest copy to our pitch: "…built around what matters most to you, let's look at the big picture."
4. **"Searching" loaders circle the user's own avatar.**
   - Monese uses a radar sweep, Starling a pulsing halo, Monzo concentric rings.
   - Starling makes the search mutual: "Make sure they're looking for you too."
   - Apple's Generative AI guidance says to replace "Processing…" with specific progress copy (§4.7).
5. **Anonymity is designed, not blurred.**
   - Clubhouse swaps your photo for an emoji: "others see your emoji instead."
   - Timeleft shows your group as pastel emoji faces with only aggregate facts (jobs, nationalities).
   - KOHO generates adjective-plus-animal names ("Supposed Reindeer", "Academic Goldfish").
   - Luma and Open use gradient orb avatars.
6. **Timers wrap the avatar.**
   - Bumble draws a depleting yellow ring around each match. The chat header reads "72 hours left to message", which matches our 3 days. It turns red at "Less than one hour left to message", then offers "Extend".
   - Runbuds shows a raw "80h 21m 59s" with Joined/Pending rows.
7. **Mutual consent shows two slots and who is pending.**
   - DICE: "You want to go / Jane wants to go".
   - Bond: "Requested", plus "…will unlock once your request is approved!"
   - Telegram: "Waiting for Jane to come online…"
   - Timeleft lets you choose freely; a connection forms only if it's mutual.
8. **Friendship celebrations use overlapping circles and a plain sentence, not hearts.**
   - Tolan: "You and Sam are friends!"
   - Duolingo: "Friend Streak with Sam Lee"
   - Runbuds adds a burst of 3D emoji.
   - Dating looks to avoid: Bumble's two tilted photo cards with "What a match!", Paired's floating hearts, and Tinder's flame gradient.
9. **Friend profile cards lead with intent and shared ground.**
   - BFF: "Looking for friends to hang out with in the city", with a big wave button.
   - Bumble: "We have things in common".
   - Tinder: "Looking for: New friends".
   - Hinge's prompt cards pair a small label with a large bold answer.
10. **The iOS 26 look already appears in the wild.**
    - Floating Liquid Glass tab bar capsules: Apple Music, Luma, Meetup, Mesh.
    - 44 pt glass circle buttons at the top: Messages, Apple Music.
    - Glass dropdown menus: Meetup.

---

## 2. References by category

Each row is a single screen. "Why it works" is written from the screenshot itself, not from metadata. Links: **M** is the Mobbin page, **img** is the high-res image (expires), and **file** is the local copy.

### a. Values, priorities and interest selection

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| a1 | **Bumble**: "Choose 5 things you're really into" | Search field ("What are you into?") above "You might like…" suggestion chips with emoji. Outlined pills are about 36 pt tall (measured). A "0/5 selected" counter sits next to a round black arrow button, and a progress bar runs across the top. The fixed quota makes each pick meaningful. | [M](https://mobbin.com/screens/8241efd5-46fe-4c8c-8f1b-ad91028e6a19) · [img](https://mobbin.com/api/mcp/short/7BKZFAaf) · `a-bumble-1.jpg` |
| a2 | **Replika** (AI companion): "Your interests" | Frosted, translucent emoji chips sit centered on a soft blurred gradient, with a single "Save" pill. This is the closest existing look to an AI-host onboarding: glassy and calm. | [M](https://mobbin.com/screens/12a43ba9-f73a-4b5c-9f15-d82e6e64ca0a) · [img](https://mobbin.com/api/mcp/short/l7HWuZEF) · `a-replika-1.jpg` |
| a3 | **Locals**: "What are you into?" | Chips are grouped under category headers (Health & sports, Extreme activities, Going out), in staggered rows that scroll horizontally. The selected chip has a yellow fill, with a full-width yellow CTA. Dense but scannable. | [M](https://mobbin.com/screens/af322f88-41d5-4352-97a1-25708beec8a8) · [img](https://mobbin.com/api/mcp/short/FSGMrTyN) |
| a4 | **BeReal**: "What are you into lately?" | Dark mode with a friendly line of copy ("Music, memes, mushroom foraging…"). A "Custom" section holds the user's own added chip. A floating "1/10 selected" counter shows progress. | [M](https://mobbin.com/screens/ed45a20a-0f12-49f6-9729-587023e0914c) · [img](https://mobbin.com/api/mcp/short/3IQm1l5Q) |
| a5 | **BFF**: "Tag your group's interests" | Category headers over chips, with the rule "Choose up to 2". The selected state is a solid black chip with white text, the clearest selected state in this set. | [M](https://mobbin.com/screens/59b92410-a10c-40ea-9ad4-009e3aea01de) · [img](https://mobbin.com/api/mcp/short/U14D6brl) |
| a6 | **Nibble**: "What would you like to learn with us?" | A two-column grid of tiles with emoji; the selected tile has a lavender fill and purple border. Reassuring copy: "Don't worry, you can change it later." | [M](https://mobbin.com/screens/5803f611-6e96-4f39-a48e-29084adeee8a) · [img](https://mobbin.com/api/mcp/short/bg2Tyeaf) |

**Ranking and reordering**

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| a7 | **Babbel**: "Rank your motivations based on their importance" | Tap-to-rank: each tapped row gets a black square number badge (1, 2) in tap order. Large serif headline and orange "Next". Instant and legible, with no drag needed. | [M](https://mobbin.com/screens/d78ed7b6-b6e0-456a-a2ff-2ef666665178) · [img](https://mobbin.com/api/mcp/short/1TFAu78A) · `a-babbel-1.jpg` |
| a8 | **Ten Percent Happier**: "Now select each goal in order of importance" | Big yellow gradient tiles with line icons ("Sleep Better", "More Balanced") and round number badges in the corner. Rank order reads at a glance. | [M](https://mobbin.com/screens/3e372797-e682-47d3-bf7c-f9fee298b33a) · [img](https://mobbin.com/api/mcp/short/sj4xIGKO) · `a-tenpercenthappier-1.jpg` |
| a9 | **The Weather Channel**: "Customize Your Activities" | Drag and drop: large rounded rows with icons and grip handles, and the dragged item shown as a floating ghost mid-move. | [M](https://mobbin.com/screens/5b4d61e9-1fd4-469b-8e32-cd9f9f565fcf) · [img](https://mobbin.com/api/mcp/short/vRESm5qG) |
| a10 | **Klarna**: "Reorder your wallet" | The lifted row gets an outline and shadow while the others stay flat, which is a clean "picked up" state. A floating tab bar sits below. | [M](https://mobbin.com/screens/f6b05568-9203-4f66-9cef-b2726ab8eedf) · [img](https://mobbin.com/api/mcp/short/TwjGN38d) |
| a11 | **Monarch**: "How do you want to prioritize your goals?" | Rows with a "#1" eyebrow label, a thumbnail and a drag handle. | [M](https://mobbin.com/screens/40dcea9a-e0d7-4ce0-b54c-fd8426e46a7b) · [img](https://mobbin.com/api/mcp/short/7ED6YfwO) |

### b. Chat-based or mascot onboarding with quick replies

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| b1 | **Tolan**: friend "Wavelength" quiz chat | White rounded bubbles float over a 3D illustrated scene with the alien host. A **"Wavelength" progress bar** sits top-left. The AI's lines are playful ("Food soulmate energy, love that…"), with one big "Continue". This is a compatibility quiz about a friend, which is the closest concept to ours. | [M](https://mobbin.com/screens/f1474ff0-3e47-4d6b-b9b6-b945415c183e) · [img](https://mobbin.com/api/mcp/short/GakhuxyF) · `b-tolan-1.jpg` |
| b2 | **Perplexity**: inline clarifying questions | The AI asks numbered questions inline, answered with chips. Selected chips are solid dark teal and unselected ones are outlined, with "Other", "Skip" and "Continue". This is a pattern for quick-reply chips inside a chat thread. | [M](https://mobbin.com/screens/f721480e-fc00-48b9-b7c8-230aa6a526a2) · [img](https://mobbin.com/api/mcp/short/pmwobU4e) · `b-perplexity-1.jpg` |
| b3 | **BitePal**: mascot asks a question | A raccoon avatar sits beside a speech-bubble question at the top, above answer cards with emoji faces. The selected card has a green border and tint, with a dark "Next" pill. The chat framing makes a form feel like a conversation. | [M](https://mobbin.com/screens/631ae426-dcac-445a-9f70-656d70d80225) · [img](https://mobbin.com/api/mcp/short/t1qKvxfr) · `b-bitepal-1.jpg` |
| b4 | **Google Health (Fitbit)**: AI coach onboarding | A sparkle AI avatar; the user's reply is a tinted bubble. The AI's copy is "…built around what matters most to you, let's look at the big picture. What is the main outcome…?" There is a "Resume later" escape hatch. This is values-first AI onboarding. | [M](https://mobbin.com/screens/4f02402c-801e-41de-be77-d2af20cddc02) · [img](https://mobbin.com/api/mcp/short/sC8wqyT9) |
| b5 | **Duolingo**: "Just 7 quick questions before we start your first lesson!" | The mascot and speech bubble set the length of onboarding up front, which HIG Onboarding also recommends (brief and enjoyable). | [M](https://mobbin.com/screens/74201708-1b1b-4b6d-b804-92f9eb2d65c9) · [img](https://mobbin.com/api/mcp/short/j572vOhA) |
| b6 | **American Airlines**: assistant chat with suggested replies | Three right-aligned blue pills ("Change my flight", "Check in help", "Upgrade my seat") stacked where the user's bubbles will appear, so tapping one simply "becomes" the reply. | [M](https://mobbin.com/screens/0f98d43a-de94-4268-8239-ef11e6db0125) · [img](https://mobbin.com/api/mcp/short/iujS83KO) |
| b7 | **Pi**: "Hey, welcome! I'm Pi, your AI sidekick who lives for meaningful talks." | A warm serif opener asks "what's shaped who you are today?", which is the tone for a values conversation. | [M](https://mobbin.com/screens/1de76dcb-69b3-491d-a385-aeeb6fdd1074) · [img](https://mobbin.com/api/mcp/short/dY94bbKd) |
| b8 | **Yazio** / **Speak**: mascot greets by name | "Nice to meet you, Alex!" with the mascot's arms up (Yazio). Speak: "Hey there! I'm Speak Tutor. I have a few quick questions…" | [Yazio M](https://mobbin.com/screens/528d7ee1-600a-4132-a9a4-ee364eb20b76) · [Speak M](https://mobbin.com/screens/2ff2142a-53ef-4e63-acf0-24a0b8f137f1) |

### c. "Finding people" and matching loaders

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| c1 | **Monese**: "Finding nearby friends…" | A soft blue radar-sweep wedge rotates around the user's initials avatar inside a faint ring. Minimal and instantly readable as "scanning". | [M](https://mobbin.com/screens/b4727421-8071-4ac3-9dee-78ee2c56841a) · [img](https://mobbin.com/api/mcp/short/CgOTEdke) · `c-monese-1.jpg` |
| c2 | **Starling**: "Looking nearby for the other person…" | A pulsing teal halo ring around the avatar. The subline "Make sure they're looking for you too" frames the search as **mutual**. | [M](https://mobbin.com/screens/c694f3ef-be19-4920-b01a-6b8fc4621fb4) · [img](https://mobbin.com/api/mcp/short/HwN8EuIG) · `c-starling-1.jpg` |
| c3 | **Monzo**: "Searching nearby…" | Concentric circle badge with a signal glyph, sitting low on the screen. | [M](https://mobbin.com/screens/55f5b99d-ad81-4903-a960-40c3edfb9b50) · [img](https://mobbin.com/api/mcp/short/sas3JTvE) |
| c4 | **Azar** (meet strangers): "Searching" | A sun emoji with a huge looping arrow behind it and big bold "Searching", with the line "Let's understand each other through friendly conversations." Playful, not technical. | [M](https://mobbin.com/screens/a476b4cd-87c9-4d8a-acb8-fcc239ddded2) · [img](https://mobbin.com/api/mcp/short/ZrvOTHZT) |
| c5 | **Credit Karma**: "Scanning the market" | A magnifier illustration with bouncing dots and "Your offers are coming right up". The copy sets expectations. | [M](https://mobbin.com/screens/a0c29f00-5e5f-4c1a-8b5c-3e77bc2d4e97) · [img](https://mobbin.com/api/mcp/short/FbiqzWzj) |
| c6 | **Timeleft** (App Store): "We'll match you with people compatible with you" | A personality question ("Are your opinions usually guided by:") with two large emoji answer cards (Logic and facts / Emotions and feelings) and a gradient progress bar. Matching is presented as the payoff of answering. | [img](https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/c8/21/3e/c8213e27-ca24-f101-7d22-3b2125f7d252/02-Iphone-1.png/1290x2796bb.jpg) · [App Store](https://apps.apple.com/us/app/id6466442949) |

### d. Anonymous chat and hidden identities

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| d1 | **Timeleft** (App Store): "Get to know your group the day before" | Participants appear as **overlapping pastel emoji faces** with "New people are waiting for you!". Only aggregate facts are shown (jobs: Technology, Services…; nationalities). Identity stays hidden while curiosity builds, which is exactly our pre-unlock state. | [img](https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/2e/34/aa/2e34aa40-f7ac-2b96-0baa-c581b6af13a3/05-Iphone-1.png/1290x2796bb.jpg) · `d-timeleft-1.jpg` |
| d2 | **Clubhouse**: "you're now anonymous" | A sheet shows your photo, an arrow, then your emoji (a whale), with the copy "others see your emoji instead". The identity swap is drawn as a transformation, which makes it a good motion beat. | [M](https://mobbin.com/screens/42d229e3-3918-49ee-982c-da9e925f148d) · [img](https://mobbin.com/api/mcp/short/KKB5uSYz) · `d-clubhouse-1.jpg` |
| d3 | **KOHO**: generated anonymous names | Feed entries are authored by "Supposed Reindeer" and "Academic Goldfish", each with a letter avatar. A ready-made adjective-plus-animal handle system. | [M](https://mobbin.com/screens/05cfcc58-b81a-44ec-9081-1f3686a77de6) · [img](https://mobbin.com/api/mcp/short/47syopj0) |
| d4 | **NGL**: "anonymous message" | A black circle avatar with the small label "anonymous message" under the handle, and a single question card with Send. The label alone does the anonymity work. | [M](https://mobbin.com/screens/8575d8e6-2a02-43a2-b7fc-3e544443270d) · [img](https://mobbin.com/api/mcp/short/rSFm9uu0) |
| d5 | **Luma** / **Open**: generated avatars | Luma's guests without photos get gradient circles with smiley faces; Open uses gradient orbs. Both are friendly placeholders that still look designed. | [Luma M](https://mobbin.com/screens/63b62ea3-d066-4674-8619-36520bbf5ecd) · `h-luma-1.jpg` · [Open M](https://mobbin.com/screens/832dedb3-6258-44ca-a68d-ba2f3a85e797) |
| d6 | **Telegram**: secret-chat invite | "You invited Jane to join a Secret Chat" with lock-icon rules (self-destruct timer, no forwarding), plus a "Waiting for Jane to come online…" pill. Privacy rules shown as a calm system card. | [M](https://mobbin.com/screens/84e71fd8-2f18-453f-b91a-8f188777b599) · [img](https://mobbin.com/api/mcp/short/7bqWJiI7) · `f-telegram-1.jpg` |
| d7 | **Timeleft** (App Store): "Break the ice with our game" | A big orange question card ("What's the greatest adventure you'd like to experience in the coming year?", 1/16). This is the model for our **AI icebreaker** card. | `d-timeleft-2.jpg` |
| d8 | **Timeleft** (App Store): post-event chat (styling only, not anonymous) | Lavender gradient background with white and pale bubbles; a friendly, non-iMessage chat look. | `d-timeleft-3.jpg` |

### e. Countdown timers on matches and chats

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| e1 | **Bumble**: Chats with expiring-match rings | "Your matches (10)" is a row of avatars, each wrapped in a **yellow ring that depletes into grey** as time runs out. An expired chat shows a grey ring and "Conversation expired yesterday". A "Your move" tag marks whose turn it is. | [M](https://mobbin.com/screens/e38f4506-4dca-4594-a3ce-d04366eeec11) · [img](https://mobbin.com/api/mcp/short/KxraF34q) · `e-bumble-1.jpg` |
| e2 | **Bumble**: new chat header "72 hours left to message" | The timer is written as plain copy under the name, and "72 hours" happens to equal our 3 days. A tip card above the composer, "You get one message to start… ask about their: Hobbies / Guilty pleasures / Next availability", shows **icebreaker chips**. | [M](https://mobbin.com/screens/ad0081dd-60b8-4bbb-9b92-289e4104c044) · [img](https://mobbin.com/api/mcp/short/7lUruQA9) · `e-bumble-2.jpg` |
| e3 | **Bumble**: urgency state | "Less than one hour left to message" in red, with a "Need more time? Extend this match for 24 hours" card. The companion sheet "Extend this match" puts a clock badge on the avatar. | [M](https://mobbin.com/screens/1ff4526d-6ab6-48a2-8e73-dc0b9f5f93de) · [sheet M](https://mobbin.com/screens/3ecc2bc7-04b7-4767-b09c-264055942451) |
| e4 | **Runbuds**: challenge countdown | A raw "80h 21m 59s" set in a dashed rounded box, with a Runners list (alexsmith **Joined**, samlee **Pending**). The countdown and the two-person consent state sit on one screen. | [M](https://mobbin.com/screens/fafb2cb4-9d26-4336-bad1-5c897af1c9ed) · [img](https://mobbin.com/api/mcp/short/drLIhbHa) · `e-runbuds-1.jpg` |
| e5 | **Azar**: Lounge with "Expires in 19:48" | The timer is pinned into the top strip, next to "Pending 1". Always visible, never in the way. | [M](https://mobbin.com/screens/6e8aec07-e35a-4f35-858d-170677a040da) · [img](https://mobbin.com/api/mcp/short/GgZ7UQKg) |
| e6 | **BlaBlaCar**: "Your booking is awaiting the driver's approval" | "…will respond before 15:54 today" under a big clock illustration. The deadline is phrased as a time to respond, not a countdown. | [M](https://mobbin.com/screens/e8084665-d73a-4c3e-b3f7-ad9efc1534ad) · [img](https://mobbin.com/api/mcp/short/AmAdr2zx) |

### f. Mutual consent, waiting, unlock and celebration

**Consent and waiting states**

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| f1 | **Timeleft** (App Store): "Decide who you want to connect with" | Titled "Impressions", with the question "Who had that 'I could talk to you for hours' vibe?" and the hint "Choose as many people as you'd like!" Below is a 2 × 2 grid of person tiles (avatar, name and flag, job, checkbox) with a sunglasses-cat mascot. Consent is private and only mutual picks connect. | [img](https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/89/d7/50/89d75095-01bb-c93e-5dda-6deb68050f7a/07-Iphone-1.png/1290x2796bb.jpg) · `f-timeleft-1.jpg` |
| f2 | **Bond**: "Requested" | The profile shows a grey "Requested" pill. Below, a disabled composer reads "Asking questions will unlock once your request is approved!" The locked feature is visible but greyed out. | [M](https://mobbin.com/screens/0b868c0c-1032-4b4a-85ee-2b0cc3b265a0) · [img](https://mobbin.com/api/mcp/short/r47AS8W8) · `f-bond-1.jpg` |
| f3 | **DICE**: "Who's in?" | "You want to go / Jane wants to go", with initials avatars and check badges. Two slots, each showing a person's intent. | [M](https://mobbin.com/screens/ab22fc2b-2a55-4051-bbfc-2fb4bddd11ed) · [img](https://mobbin.com/api/mcp/short/oCbfbxrJ) |
| f4 | **Too Good To Go**: "Waiting for your friend to accept the invitation" | A dashed rounded card with a person-and-clock icon. The dashed outline reads as "slot not filled yet". | [M](https://mobbin.com/screens/42f3debd-d331-4cbc-b43d-52da5e23a468) · [img](https://mobbin.com/api/mcp/short/o6iE0l6m) |
| f5 | **Telegram**: "Waiting for Jane to come online…" | Glass pill at the bottom of a locked secret chat (see d6). | `f-telegram-1.jpg` |
| f6 | **Feeld**: "You connected with Joe. Feelings are mutual." | Good mutual-consent copy, but it is a dating app; borrow the sentence pattern, not the look. | [M](https://mobbin.com/screens/50025de4-1b77-4439-923f-556430ffd76c) · [img](https://mobbin.com/api/mcp/short/y7BlCF6K) |

**Friend-style celebrations**

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| f7 | **Tolan**: "You and Sam are friends!" | Two **overlapping circle avatars** (initials on pastel cloud gradients) over a blurred scene, with a big serif headline and a dark "Continue" pill. Warm, no hearts. | [M](https://mobbin.com/screens/192a92c9-ebc5-462b-bfea-49e2fc311041) · [img](https://mobbin.com/api/mcp/short/tHGeBfBT) · `f-tolan-1.jpg` |
| f8 | **Duolingo**: "Friend Streak with Sam Lee" | Two overlapping illustrated avatars inside one orange ring, with a flame count of 1. The shared ring around a pair is a friendship symbol. | [M](https://mobbin.com/screens/eebf51b7-7358-477b-ba2b-e2ed8aedbef2) · [img](https://mobbin.com/api/mcp/short/tb9zjeVp) |
| f9 | **Airbuds**: "you are friends" | Chunky purple-to-green gradient type, two tilted rounded-square avatars and doodles on a dark background. The type is fun, but the glowing heart between the avatars leans romantic. | [M](https://mobbin.com/screens/cb8310c8-aea1-4e48-b6b3-5f4b6b6c758a) · [img](https://mobbin.com/api/mcp/short/hrZtRnEo) · `f-airbuds-1.jpg` |
| f10 | **Runbuds**: "Sam Lee is now your friend!" | 3D emoji (sunglasses face, lightning, sneakers) float around the new friend's photo. The emoji themselves are the confetti. | [M](https://mobbin.com/screens/ad902fa1-458a-4392-a337-4301b809d294) · [img](https://mobbin.com/api/mcp/short/6WQwtEdH) |
| (avoid) | **Bumble** "What a match!", **Paired** "Success! You're paired…", **Tinder** | Two tilted photo cards, floating hearts and a flame gradient all read as **dating**. | [Bumble M](https://mobbin.com/screens/0d225721-ea2e-45c2-9f8c-5ad79376be1d) · [Paired M](https://mobbin.com/screens/b3a457f0-79eb-4831-8640-69d221443987) |

### g. Profile cards in friend apps

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| g1 | **BFF** (Bumble For Friends): "Christine M." | A nearly full-bleed photo card (about 8 pt side margins, measured) with the name in large white bold at top-left and a location subline. A yellow "Says hi!" chip, then the intent line "Looking for friends to hang out with in the city". Dark interest chips run along the bottom next to a big round yellow **wave** button. Tabs: People / Groups / Chats / Activity / Me. | [M](https://mobbin.com/screens/3931016e-68b9-4483-8146-2f83ceea9339) · [img](https://mobbin.com/api/mcp/short/qRuhQmca) · `g-bff-1.jpg` |
| g2 | **Bumble** (BFF mode): "We have things in common" | The card has a green "BFF" badge and a "Photo verified" chip. Scrolling down reveals a "We have things in common" card with shared chips (Cafe-hopping, Graduate degree), the strongest pattern for our "you both chose…" moment. An "About me" card shows icon chips. | [card M](https://mobbin.com/screens/53f019f0-38d7-42ff-b365-e0a6d33afa81) · [in-common M](https://mobbin.com/screens/3082e638-fdbf-4ce2-a2d4-52f9423b8cc9) · [about M](https://mobbin.com/screens/438fb535-4a1a-4c90-ba54-eecd56c2d021) |
| g3 | **Hinge**: prompt cards | White cards pair a small label ("A boundary of mine is") with a **large bold answer**, each with a round like button bottom-right. Photo cards are interleaved, with a floating X button. The layout benchmark for profile storytelling. | [M](https://mobbin.com/screens/980caf25-0925-4bb5-ac4f-6f919a61a6dd) · [img](https://mobbin.com/api/mcp/short/8UUNIncr) · `g-hinge-1.jpg` · [alt M](https://mobbin.com/screens/e2772f61-f8ec-45a0-93ff-915ad727c9cd) |
| g4 | **Lex**: friend profile | A "Teach me something about…" prompt, group chips, a "Looking for friends nearby" avatar row, and yellow **"Boop"** and **"Say Hi!"** pill CTAs. The copy sounds like friendship, not dating. | [M](https://mobbin.com/screens/5a9d199e-adc2-470d-8e19-dab0d922cb19) · [img](https://mobbin.com/api/mcp/short/KObQz5xy) · `g-lex-1.jpg` |
| g5 | **Tinder**: "Looking for: New friends" | Interest chips, a "Looking for" card with a glowing wave and "New friends", and "Going Out" icon rows ("My exit strategy looks like… say bye first"). Shows intent as data. | [M](https://mobbin.com/screens/ea7416fd-e259-4eff-bc36-fab55bbeafd2) · [img](https://mobbin.com/api/mcp/short/sHBwWgGj) |
| g6 | **corner**: social profile | A "1 in common" stat pill with overlapping avatars and "2 mutual friends", followed by place chips. A compact way to show shared ground. | [M](https://mobbin.com/screens/1de6a9ec-cdf4-4573-889b-daa3e0bb8a9b) · [img](https://mobbin.com/api/mcp/short/Sqw4tz4K) |

### h. Friends lists, circles and communities

| # | App: screen | Why it works | Links |
| --- | --- | --- | --- |
| h1 | **Meetup**: "Friends" | A two-column grid of friend photo cards. A **Liquid Glass dropdown** filters by Nearby / My groups / Next event / Last event. A **floating glass tab bar** has five tabs with a selected pill (Home, Friends, Explore, Notifications, Messages). | [M](https://mobbin.com/screens/40e0154a-a595-4bcf-9c43-8f4b9b17703c) · [img](https://mobbin.com/api/mcp/short/aBft0xsH) · `h-meetup-1.jpg` |
| h2 | **Luma**: "122 Guests" | A list where people without photos get gradient smiley avatars, with a floating three-tab glass bar. It also has a group screen ("Sing Your Heart Out! 3 Members") with an Info/Members switch. | [M](https://mobbin.com/screens/63b62ea3-d066-4674-8619-36520bbf5ecd) · [img](https://mobbin.com/api/mcp/short/2Wvhj6Fc) · `h-luma-1.jpg` · [group M](https://mobbin.com/screens/874762b7-06b1-4eb0-b657-94b4cb4f14b3) |
| h3 | **Character AI**: Groups | Cards show **clusters of three avatars** with member-count badges, which makes a group of people instantly readable. | [M](https://mobbin.com/screens/545a31c3-e3c5-464e-a850-e9987d104e13) · [img](https://mobbin.com/api/mcp/short/lwMw17Ul) |
| h4 | **Orb Social**: Clubs | A tile grid with glass "N MEMBERS" labels and the line "Explore all 440 groups". | [M](https://mobbin.com/screens/9893a62e-4374-42ba-849b-166267debd25) · [img](https://mobbin.com/api/mcp/short/CZo8sXv0) |
| h5 | **Stardust**: "Edit Friends" | Each friend is a glowing spectrum line (You: "Pink Moon Visionary", Sam: "Silver Moon"). Relationships drawn as light, a creative cue for a "circle" visual. | [M](https://mobbin.com/screens/a9442789-d8b3-428a-bfbf-4fcc05e72d71) · [img](https://mobbin.com/api/mcp/short/ttRddLj0) |
| h6 | **Mesh** / **Telegram**: people and group headers | Mesh shows gradient initial avatars and a floating tab bar. Telegram's group header has a big gradient letter avatar, a member count and action tiles. | [Mesh M](https://mobbin.com/screens/36a334e5-c62c-47d9-a8bf-fd9bcf0a5279) · [Telegram M](https://mobbin.com/screens/b4926c5d-ee7d-4f0b-b1d8-09cc747e74dc) |

### Extra: AI icebreakers and suggestion chips

| App: screen | Why it works | Links |
| --- | --- | --- |
| **Bumble**: "You get one message to start" tip card with topic chips | Icebreaker chips docked above the composer (see e2). | `e-bumble-2.jpg` |
| **Timeleft**: "Dinner game" question card | One big question per card, 1/16 (see d7). | `d-timeleft-2.jpg` |
| **Microsoft Copilot**: suggestion pills above the composer | A large greeting ("Hey Sam, how can I help?") with a horizontal row of suggestion pills above the composer. | [M](https://mobbin.com/screens/ef2922b1-15ce-468e-b028-2ed58480b34f) |
| **Linktree**: AI start screen | A sparkle-orb host, outlined suggestion pills with icons, and the disclosure "AI can sometimes make mistakes", which HIG Generative AI asks for. | [M](https://mobbin.com/screens/1410fe6a-87c5-41c9-8d0c-93204470891c) |
| **WhatsApp** (Meta AI): voice start | A gradient ring orb as the AI's "face", above suggestion rows. A strong, simple AI-host visual. | [M](https://mobbin.com/screens/b034786a-fd92-4c64-adc1-e1b51a8cd845) |

### Extra: first-party iOS 26 captures used for measurement

| Capture | Used for | Links |
| --- | --- | --- |
| **Apple Messages**: thread (light) | Bubble geometry and type, top controls, composer at rest | [M](https://mobbin.com/screens/a4708b67-37de-471e-8b24-268d66750595) · `spec-messages-1.jpg` |
| **Apple Messages**: replying with the keyboard up | Keyboard panel, key grid, composer docked above the keyboard | [M](https://mobbin.com/screens/73c243df-f939-4995-be22-f7dee8ffa2c5) · `spec-messages-2.jpg` |
| **Apple Music**: Playlists | Large title, glass toolbar group, tab bar, search circle, mini-player accessory | [M](https://mobbin.com/screens/f5205195-c3a7-4a63-a183-0b639887b47f) · `spec-applemusic-1.jpg` |

---

## 3. Downloaded screenshots (29 files)

Folder: `projects/almostfriends/research/ui-refs/`. These are private reference copies. Each file was checked twice: as a valid JPEG, and visually on a contact sheet.

| File | App and screen | Source |
| --- | --- | --- |
| `a-bumble-1.jpg` | Bumble: choose 5 interests | Mobbin |
| `a-replika-1.jpg` | Replika: glass interest chips | Mobbin |
| `a-babbel-1.jpg` | Babbel: tap-to-rank motivations | Mobbin |
| `a-tenpercenthappier-1.jpg` | Ten Percent Happier: goals in order | Mobbin |
| `b-tolan-1.jpg` | Tolan: "Wavelength" friend-quiz chat | Mobbin |
| `b-perplexity-1.jpg` | Perplexity: inline chip questions | Mobbin |
| `b-bitepal-1.jpg` | BitePal: mascot question and answer cards | Mobbin |
| `c-monese-1.jpg` | Monese: radar "Finding nearby friends…" (375 × 812 pt capture) | Mobbin |
| `c-starling-1.jpg` | Starling: halo "Looking for the other person…" | Mobbin |
| `d-timeleft-1.jpg` | Timeleft: "Your group" with anonymous emoji faces | App Store |
| `d-timeleft-2.jpg` | Timeleft: icebreaker question card | App Store |
| `d-timeleft-3.jpg` | Timeleft: post-event chat styling | App Store |
| `d-clubhouse-1.jpg` | Clubhouse: photo turns into an emoji, "you're now anonymous" | Mobbin |
| `e-bumble-1.jpg` | Bumble: expiring-match rings | Mobbin |
| `e-bumble-2.jpg` | Bumble: "72 hours left" and icebreaker chips | Mobbin |
| `e-runbuds-1.jpg` | Runbuds: "80h 21m 59s" with Joined/Pending | Mobbin |
| `f-timeleft-1.jpg` | Timeleft: "Decide who you want to connect with" | App Store |
| `f-bond-1.jpg` | Bond: "Requested", unlocks once approved | Mobbin |
| `f-telegram-1.jpg` | Telegram: secret chat, waiting | Mobbin |
| `f-tolan-1.jpg` | Tolan: "You and Sam are friends!" | Mobbin |
| `f-airbuds-1.jpg` | Airbuds: "you are friends" | Mobbin |
| `g-bff-1.jpg` | BFF: friend profile card | Mobbin |
| `g-hinge-1.jpg` | Hinge: prompt cards | Mobbin |
| `g-lex-1.jpg` | Lex: "Boop" / "Say Hi!" profile | Mobbin |
| `h-meetup-1.jpg` | Meetup: friends grid, glass menu and tab bar | Mobbin |
| `h-luma-1.jpg` | Luma: guest list with generated avatars and glass tab bar | Mobbin |
| `spec-messages-1.jpg` | Apple Messages, iOS 26 (measurement) | Mobbin |
| `spec-messages-2.jpg` | Apple Messages with keyboard, iOS 26 (measurement) | Mobbin |
| `spec-applemusic-1.jpg` | Apple Music, iOS 26 (measurement) | Mobbin |

---

## 4. iOS specs for the mock

### 4.1 Canvas

| Device | Points | Pixels | Scale | Source |
| --- | --- | --- | --- | --- |
| **iPhone 17 / iPhone 17 Pro** | **402 × 874** | **1206 × 2622** (460 ppi) | @3x | [Use Your Loaf: iPhone 17 Screen Sizes](https://useyourloaf.com/blog/iphone-17-screen-sizes/) (simulator values); [learnui.design iOS guide](https://learnui.design/blog/ios-design-guidelines-templates.html) (updated 2026-04-22) |
| iPhone 17 Pro Max | 440 × 956 | 1320 × 2868 | @3x | same |
| iPhone Air | 420 × 912 | 1260 × 2736 | @3x | same |
| iPhone 18 Pro (announced 2026-09-09) | 402 × 874 *(inferred: same panel and scale)* | 2622 × 1206 at 460 ppi, 6.3-inch, Dynamic Island | @3x | [Apple Support: iPhone 18 Pro tech specs](https://support.apple.com/en-au/148590) |
| Mobbin captures (iPhone 14 Pro–16) | 393 × 852 | 1179 × 2556 | @3x | measured |

**Recommendation.** Design the mock at **402 × 874 pt**, which matches iPhone 17, iPhone 17 Pro and the newest iPhone 18 Pro. Export at 3x (1206 × 2622 px), or build vector or HTML so push-ins stay sharp (§4.8).

### 4.2 Safe areas, status bar, Dynamic Island and home indicator

| Item | Value | Source |
| --- | --- | --- |
| Status bar height | 54 pt | Use Your Loaf |
| Top safe-area inset (portrait) | **62 pt** on iPhone 17, 17 Pro and 17 Pro Max; 68 pt on iPhone Air. On 393 pt devices the measured glass controls start at y = 59. | Use Your Loaf; measured |
| Bottom safe-area inset | **34 pt** | Use Your Loaf |
| Home-indicator zone | "The home indicator 'owns' its own 21pt tall 'box' that no other fixed elements can be shown in." | learnui.design |
| Home-indicator pill | About 140 × 5 pt, with its bottom edge about 9 pt above the screen bottom | measured (Babbel and Ten Percent Happier captures) |
| Dynamic Island corner radius | 44 pt ("its rounded corner shape matches the TrueDepth camera") | [HIG: Live Activities](https://developer.apple.com/design/human-interface-guidelines/live-activities) |
| Dynamic Island, compact presentation | Height 36.67 pt. Island width when compact or minimal: **230 pt** (17, 17 Pro), 250 pt (17 Pro Max, Air). | HIG: Live Activities |
| Dynamic Island, expanded | Width 371 pt (17, 17 Pro) or 408 pt (17 Pro Max, Air); height 84–160 pt | HIG: Live Activities |
| Idle island (no activity) size | **Not sourced in this pass.** Take it from Apple's iOS 26 UI Kit in [Apple Design Resources](https://developer.apple.com/design/resources/). | open item |

### 4.3 Navigation bar, large title and tab bar (iOS 26, measured)

Measured on 393 × 852 pt captures of Apple Messages and Apple Music, ±1 pt. The column "on 402 × 874" applies the measured offsets to our canvas and is *inferred*.

| Element | Measured value | On 402 × 874 *(inferred)* |
| --- | --- | --- |
| Top controls row (the iOS 26 "nav bar") | 44 pt tall, starting at the safe-area top (y 59 to 103) | y 62 to 106 |
| Back and action buttons | **44 pt Liquid Glass circles**, 16 pt from the screen edges. Grouped actions share one 44 pt glass capsule; Music's 3-icon group is about 154 pt wide. | same |
| Conversation header (Messages) | A 60 pt contact avatar centered in the controls row (y 59 to 119), with the name in a glass pill below it | same |
| Large title | **34 pt Bold**: cap height measured 24.0 pt, which is 34 pt per SF Pro's 0.705 cap ratio. Cap top is 22 pt and the baseline 46 pt below the controls row. Glyphs start about 22 pt from the left edge. The first content row starts about 70 pt below the controls row. | Baseline at y ≈ 152 |
| **Tab bar** | **Floating glass capsule, 62 pt tall, inset 21 pt left, right and bottom.** A separate **62 pt search circle** sits at the trailing end with an 8 pt gap. The selected tab is a pill about 54 pt tall inside the capsule. Icons are about 24 pt and labels **about 10 pt** (cap height 7.0 pt). | Capsule at y 791 to 853 |
| Tab accessory (MiniPlayer) | 48 pt capsule, 8 pt above the tab bar, with the same 21 pt side insets | y 735 to 783 |
| Corroboration | learnui.design says the bar is "inset from the screen edges (21pt on left, right, and bottom)". In the [Apple Developer Forums thread 796986](https://developer.apple.com/forums/thread/796986), a developer measures UITabBar at 62 within an 83 container on iOS 26. | |

Note: learnui.design lists tab labels as 11 pt; Apple Music measures 10 pt. Use 10 pt to match iOS 26.

### 4.4 Text styles (SF Pro)

From [HIG Typography › Specifications](https://developer.apple.com/design/human-interface-guidelines/typography#Specifications), iOS Dynamic Type size **Large (default)**. Values are in points.

| Style | Weight | Size | Leading | Emphasized weight | Tracking at this size (SF Pro) |
| --- | --- | --- | --- | --- | --- |
| Large Title | Regular | 34 | 41 | Bold | +0.40 |
| Title 1 | Regular | 28 | 34 | Bold | +0.38 |
| Title 2 | Regular | 22 | 28 | Bold | −0.26 |
| Title 3 | Regular | 20 | 25 | Semibold | −0.45 |
| Headline | Semibold | 17 | 22 | Semibold | −0.43 |
| Body | Regular | 17 | 22 | Semibold | −0.43 |
| Callout | Regular | 16 | 21 | Semibold | −0.31 |
| Subheadline | Regular | 15 | 20 | Semibold | −0.23 |
| Footnote | Regular | 13 | 18 | Semibold | −0.08 |
| Caption 1 | Regular | 12 | 16 | Semibold | 0.00 |
| Caption 2 | Regular | 11 | 13 | Semibold | +0.06 |

- Tracking comes from HIG › Tracking values (iOS, SF Pro). HIG says to adjust tracking in mockups because the running system font does it automatically at every size.
- The system fonts use **dynamic optical sizes** (Text and Display interpolate continuously). Pick a discrete optical size only if your tool lacks variable-font support (HIG Typography).
- **SF Pro Rounded** is a system variant with its own tracking table in the HIG. It is a natural fit for a "friendly and fun" brand without a custom font.
- Apple's own large titles render in the emphasized **Bold**, as measured in Music.

### 4.5 iMessage-style bubbles (measured from Apple Messages, iOS 26)

| Property | Measured | Notes |
| --- | --- | --- |
| Text | **SF Pro 17 pt (Body)** | "H" cap height 12.0 pt and x-height 9.0 pt, both matching 17 pt |
| Line pitch inside a bubble | **About 20.3 pt** | The font's natural line height, not the 22 pt Body paragraph leading. Bubble heights fit n × 20.3 + 20. |
| Single-line bubble height | **40 pt**, fully rounded (radius 20) | "Hi", "Hello!", "Good!" |
| Multi-line corner radius | About 18–20 pt | Top-left corner of 2- and 3-line bubbles |
| Padding | About **10 pt** vertical; about **15–16 pt** from bubble edge to glyphs horizontally (about 14 pt container padding) | Glyph side-bearing included |
| Screen margin | **16 pt** from the screen edge on both sides | Sent bubbles right, received left |
| Maximum width | The widest wrapped bubble is **255 pt = 65 %** of a 393 pt screen; wrapping happens before about 300 pt (76 %) | Design maximum: about **⅔–¾ of screen width** |
| Tail | A small curl at the bottom corner on the sender's side, dropping about 6 pt below the body | Received tail bottom-left, sent tail bottom-right |
| Fills (sampled from JPEG, approximate) | Sent ≈ rgb(76–85, 185–189, 252), a bright azure that is lighter at the top. Received ≈ rgb(235, 233, 236). | Replace with brand colors; keep the contrast relationship |

### 4.6 Composer and keyboard (measured from Apple Messages, iOS 26)

| Element | Measured |
| --- | --- |
| Composer at rest (no keyboard) | A **40 pt "+" glass circle** next to a **40 pt glass capsule field** ("iMessage" placeholder with a mic glyph), 12 pt apart. Side insets are about 28 pt, and the field's bottom edge is about 28 pt above the screen bottom. |
| Composer with the keyboard up | The same 40 pt elements widen to **16 pt side margins** and sit **17 pt above the keyboard**. The widening from 28 to 16 pt margins is itself a nice motion detail. |
| Keyboard (English QWERTY, no QuickType row shown) | A **floating panel**. Top corners have a radius of about 20 pt, and the bottom corners follow the display corners. **About 307 pt** from the panel top to the screen bottom, home-indicator area included (panel top at y 544.7 of 852). |
| Keys | Letter keys about **32 × 42.5 pt**, with about 6 pt gaps and about 8 pt corner radius, on a 54 pt row pitch. The first row starts 24 pt below the panel top, and the globe/mic row is centered about 41 pt above the screen bottom. |
| Total chat chrome with the keyboard up | 40 + 17 + 307 = **about 364 pt** on an 852 pt screen. Keep the thread's key moment above y ≈ 488 (393 pt device) when the keyboard is visible. |

These numbers come from one iOS 26 capture. With the predictive (QuickType) row enabled the keyboard is taller; that wasn't measured here.

### 4.7 Liquid Glass basics (iOS 26)

Apple's rules, with sources:

- **Two layers.** "Liquid Glass forms a distinct functional layer for controls and navigation elements — like tab bars and sidebars — that floats above the content layer." **Don't use Liquid Glass in the content layer**; use standard materials there. **Use Liquid Glass effects sparingly** on custom controls. ([HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials))
- **Variants.**
  - *Regular* blurs and adjusts luminosity; it's the default and suits text-heavy surfaces.
  - *Clear* is highly translucent and only for controls over photos or video. Over bright content, "consider adding a dark dimming layer of 35% opacity". (HIG Materials)
- **Tab bars.**
  - "A tab bar floats above content at the bottom of the screen. Its items rest on a Liquid Glass background that allows content beneath to peek through."
  - It can **minimize on scroll** with an attached accessory such as Music's MiniPlayer.
  - A **dedicated search tab** can sit at the trailing end.
  - ([HIG Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars); see also [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass): "Key navigation elements like tab bars and sidebars float in this Liquid Glass layer…")
- **Color.**
  - "By default, Liquid Glass has no inherent color, and instead takes on colors from the content directly behind it."
  - "To emphasize primary actions, apply color to the background rather than to symbols or text… Refrain from adding color to the background of multiple controls."
  - Prefer **monochrome tab and toolbar labels** when the content is colorful.
  - ([HIG Color](https://developer.apple.com/design/human-interface-guidelines/color))
- **Buttons.**
  - Keep prominent buttons to **one or two per view**, and give every button a hit region of **at least 44 × 44 pt**. ([HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons))
  - The system button styles are `glass` and `glassProminent` (iOS 26.0+: "A button style that applies a prominent Liquid Glass effect based on the button's context"). ([glassProminent](https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent))
  - Use rounded shapes "concentric to their containers". (Adopting Liquid Glass)
- **Bars without backgrounds.** Use a **scroll edge effect** (content blurs and fades under the bar) instead of a solid or semi-opaque fill. Extend full-screen backgrounds under bars. ([HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout); Adopting Liquid Glass)
- **Sheets.** "Sheets feature an increased corner radius, and half sheets are inset from the edge of the display." (Adopting Liquid Glass)

**For the film render (not native).** These are practical starting points from the apple-design skill's cross-platform translation notes, explicitly not Apple specs; tune by eye.

- Backdrop blur: about 20–40 px for regular glass and about 8–16 px for clear, scaled to the render resolution.
- Translucent fill: about 60–80 % for regular and about 20–40 % for clear.
- A saturation boost of about 1.2–1.5×.
- A one-pixel highlight on the edge.
- Light or dark labels chosen by the luminance underneath.

### 4.8 Converting to the 1080 × 1920 film frame

The arithmetic below assumes a 402 × 874 pt screen.

| Framing | px per pt | Screen size in frame | Body text cap height | Large Title cap height |
| --- | --- | --- | --- | --- |
| Screen fit to frame height (874 pt → 1920 px) | 2.20 | 883 × 1920 | 26 px | 53 px |
| Device "hero" at about 80 % of frame height | 1.76 | 707 × 1536 | 21 px | 42 px |
| Screen fills frame width (402 pt → 1080 px), cropped | 2.69 | 1080 × 2348, so 715 pt of 874 is visible | 32 px | 65 px |
| Component close-up (bubble, chip row, ring) | 4–6 | — | 48–72 px | — |

The earlier reels' feedback calls for every on-screen word to be legible at phone size, and the user has flagged small UI text before. So any line the viewer must actually read should be shown in a **push-in at about 4 px/pt or more**. Full-screen device shots work for layout and motion, not for reading 13–17 pt text.

---

## 5. Screen plan (8 screens)

### Shared system (applies to all screens)

- **Canvas.** 402 × 874 pt in **light mode**, which the user preferred over dark in earlier reels. It uses the iOS 26 chrome from §4.2–4.3: a 54 pt status bar, a 44 pt controls row starting at y 62, a floating 62 pt tab bar 21 pt from the edges, and 34 pt of bottom safe area.
- **AI host.** A small mascot orb with eyes and a sparkle, never a human face. It morphs well (into chips, the radar or the lock), and HIG Generative AI asks to "clearly identify when and where you use AI". The orb is inspired by WhatsApp's Meta AI ring, the Linktree sparkle, Speak's blob and Tolan.
- **Anonymous identity.** Each person is a **gradient orb with an emoji face** (Timeleft, Luma) and an **adjective-plus-animal handle** such as "Curious Otter" (KOHO). There are no names or photos until the unlock.
- **Priority tokens.** Six priorities: Family, Wealth, Career, Health, Faith and Adventure. Each is an emoji plus a label, with **one hue per priority**, used consistently on chips, rings, Venn overlaps and circle groups. This consistency is the film's visual through-line. Labels on glass stay monochrome (HIG Color).
- **Not-dating guardrails.**
  - Use waves, overlapping circles, "click", "crew" and "circle".
  - No hearts, flames, photo-first cards or "It's a match".
  - Celebrate *shared priorities*, not attraction.
- **Type.** SF Pro, or SF Pro Rounded for warmth. Use Title 1 at 28 pt Bold for moments, Body at 17 pt for chat, and the 4.4 tracking values. Show each readable line large, via push-in.

### S1: AI chat onboarding, "What matters most to you?"

**Layout**

- **Header:** a glass back circle (44 pt), the host orb (60 pt, centered), and a glass name pill reading "[Host] · AI". This is the Messages header pattern.
- **Thread:** host bubbles in the received style (17 pt text, 40 pt minimum height, 16 pt margins).
  - "Hey! I find you friends by what matters to you."
  - "What's most important in your life right now? Pick up to 3."
- **Answer dock:** replaces the keyboard. It holds a wrapping set of **emoji + label chips** about 36–40 pt tall (Bumble's measure 36 pt; 44 pt hit region), a "2 of 3" counter and one `glassProminent` "Done".

**Micro-interactions**

1. A tapped chip **flies from the dock into the thread and morphs into a sent bubble** (shared-element transition) with a soft tick.
2. A "**Wavelength**"-style meter (Tolan) under the header fills with each answer. The host's typing dots morph into its next bubble.

**References:** b1, b2, b6, a1, a2.

### S2: Priority ranking, "Which comes first?"

**Layout**

- An **inline card inside the chat** (Perplexity-style) or an iOS 26 inset sheet with the larger corner radius.
- The three chosen priorities appear as rows about 64 pt tall: emoji, label and grab handle, with a number badge.
- Prompt: "Put them in order. This is how I'll match you."
- For film legibility, prefer **tap-to-rank** (Babbel, Ten Percent Happier): big numerals land in tap order.

**Micro-interactions**

1. Long-press **lifts a row**: slight scale-up, soft shadow and tilt. Neighbours slide aside (Weather Channel, Klarna).
2. Number badges **re-count with a rolling-digit flip**. The #1 row gets a glow ring in its priority hue.

**References:** a7–a11.

### S3: AI matching, "Finding people who put Family first…"

**Layout**

- **Centre:** your anonymous orb, about 120 pt, ringed by concentric circles: a radar sweep (Monese) and a pulsing halo (Starling).
- Your priority chips **orbit as satellites**.
- **Below:** **specific** status lines rotate, per HIG Generative AI ("instead of 'Processing…'…").
  - "Looking for people who rank Family #1"
  - "…who also love Adventure"
  - "Checking who's around to chat this week"

**Micro-interactions**

1. Candidate orbs drift in from the edges. Non-matches fade out, and matches **snap into orbit with a flash of the shared hue**.
2. The sweep leaves a fading trail, and ring pulses lock to the score's beat.

**References:** c1–c6.

### S4: Match found (friendship, not dating), "You two click on Family + Adventure"

**Layout**

- Your orb and "Curious Otter" **slide together into a Venn overlap** (Tolan, Duolingo friend streak), and the shared priority chips rise out of the intersection.
- **Title 1:** "Meet Curious Otter". **Subline:** "You both put Family first and love Adventure."
- **Info row with a lock glyph:** "Anonymous for 3 days · no names, no photos."
- **Buttons:** primary "Say hi" with a wave, and secondary "Why we matched".

**Micro-interactions**

1. The overlap fires an **emoji burst made of the shared priority emoji** (Runbuds-style 3D emoji). No hearts.
2. A **three-segment ring draws itself around the pair**, which sets up the timer.

**References:** f7, f8, f10, g2. Avoid the dating patterns listed in §2 f.

### S5: Anonymous chat with the 3-day timer and AI icebreaker

**Layout**

- **Header:**
  - Curious Otter's orb at 60 pt, wrapped in a **depleting ring in three segments, one per day** (Bumble rings).
  - The name pill sits below, with the subline "**2 days 14 h left** · anonymous", echoing Bumble's "72 hours left to message".
- **Thread:** the bubble spec from §4.5.
- **Above the composer:** an **AI icebreaker card**.
  - It shows the host sparkle, "Icebreaker from [Host]" and "What's a family tradition you'd never give up?", plus an "Ask it" chip.
  - This is modeled on Bumble's "You get one message to start" and Timeleft's dinner-game card.
- **Composer:** a 40 pt "+" circle and a 40 pt glass field (§4.6).

**Micro-interactions**

1. The timer ring ticks down, and **each day boundary snaps a segment off**.
2. Tapping the icebreaker **flips the card and drops the question into the composer**. The reply arrives with typing dots and a bubble pop.

**References:** e1, e2, d7, d3, §4.5–4.6.

### S6: Unlock, then waiting, then both unlocked (one screen, three states)

**State A.** An inset half sheet (larger radius) appears: "3 days in. Ready to meet properly?" Two **slots side by side**, You and Curious Otter, each with a lock. The button reads "Unlock my profile", with the rule shown: "**Only if you both tap Unlock.**"

**State B.** Your slot turns to a check. Their slot shows a **dashed, pulsing outline** with "Waiting for Curious Otter…" (Too Good To Go, Telegram, Bond, DICE).

**State C.** Both slots are checked. The **locks spring open** and the two halves of a split badge snap together. "You're both in!"

**Micro-interactions**

1. The lock shackle **springs open with a haptic-style pop**.
2. The orb mask **melts from emoji, to pixel mosaic, to blur, to a sharp photo**. This is the hero reveal moment of the film.

**References:** f1–f5, f6 (the sentence pattern only).

### S7: Revealed profile, "Maya, 29"

**Layout**

- A **BFF-style card**, nearly full-bleed with about 8 pt margins (g1). The name in Title 1 Bold sits over the bottom-left of the photo.
- A "**You both**" row of shared chips in the priority hues (Bumble's "We have things in common").
- Two **Hinge-style prompt cards**: a small label and a large answer.
- A "From your chat" card showing the first icebreaker exchange.
- **Buttons:** primary "Add to Circle" and secondary "Plan a hangout".

**Micro-interactions**

1. The card **grows out of the orb** with a shared-element transition. The photo has gentle parallax.
2. The shared chips **light up in rank order (1, 2, 3)**, echoing S2.

**References:** g1–g6.

### S8: Circle (friends) view, "Your Circle"

**Layout**

- A large title, "Your Circle", in 34 pt Bold.
- An **orbit visual**: you at the centre, with friends' avatars on rings **grouped by shared priority hue**. Small group counts appear, inspired by Stardust's light lines and Orb's clubs.
- Below the orbit, a list (Luma-style rows) with "met on Day 3" and the next hangout.
- The **floating glass tab bar** reads Home · Chats · Circle · You, with a separate search circle (§4.3).

**Micro-interactions**

1. Maya's avatar **flies from S7 into her ring**, and the rings re-balance with spring physics.
2. The tab bar's **selected pill slides and morphs** between tabs, in the Liquid Glass style.

**References:** h1–h6.

### Optional S9: AI hangout nudge

A tip card on Home reads "3 people in your Circle love Adventure. Hike this weekend?", with stacked avatars (Character AI clusters). It works well as the ending beat: from one match to a group.

---

## 6. Open items and next decisions

1. **AppKittie connector returns HTTP 401.** Re-authenticate it if you want measured onboarding design tokens (colors, type, radii) for Timeleft and BFF. That was the only source that would provide them as data.
2. **Idle Dynamic Island geometry is not sourced.** Pull it from Apple's iOS 26 UI Kit before drawing a device frame. The session's WebSearch budget ran out before this could be checked.
3. **Brand decisions needed before look-dev:**
   - app name;
   - one hue per priority;
   - the AI host character (orb or mascot);
   - SF Pro or SF Pro Rounded.
4. **Imagery backend.** The S6 and S7 reveal needs a profile photo, and possibly lifestyle shots. Per the user's routing rule, ask which image backend to use (Higgsfield or chatgpt-imagegen) once for this production.
5. **The Mobbin `img` links expire.** Use the local `ui-refs/` copies; the `mobbin.com/screens` links stay valid.

---

## 7. Sources

**Apple**

- [HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography): Dynamic Type sizes, tracking values, optical sizes (Apple's last change 2025-12-16)
- [HIG: Live Activities](https://developer.apple.com/design/human-interface-guidelines/live-activities): Dynamic Island dimensions and corner radius
- [HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials): Liquid Glass layers, variants and the 35 % dimming layer
- [HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color): Liquid Glass color
- [HIG: Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars): floating tab bar, minimize behavior, search tab (Apple's last change 2026-06-08)
- [HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): 44 × 44 pt hit region, one or two prominent buttons per view
- [HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout): safe areas, scroll edge effect; device table removed in the 2026-09-09 update
- [HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility): 44 × 44 pt default, 28 × 28 pt minimum targets
- [HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) and [HIG: Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)
- [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass) and [SwiftUI `glassProminent`](https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent)
- [Apple Support: iPhone 18 Pro tech specs](https://support.apple.com/en-au/148590)
- [Apple Developer Forums 796986: UITabBar in iOS 26](https://developer.apple.com/forums/thread/796986)
- [Timeleft on the App Store](https://apps.apple.com/us/app/id6466442949), via the iTunes Search API

**Third party**

- [Use Your Loaf: iPhone 17 Screen Sizes](https://useyourloaf.com/blog/iphone-17-screen-sizes/): points, pixels, status bar and safe areas
- [learnui.design: iOS Design Guidelines](https://learnui.design/blog/ios-design-guidelines-templates.html): iOS 26 sizes and the 21 pt tab-bar inset (updated 2026-04-22)
- Mobbin screens: linked per row in §2

**Measured.** Pixel analysis of `spec-messages-1.jpg`, `spec-messages-2.jpg`, `spec-applemusic-1.jpg`, `a-bumble-1.jpg`, `g-bff-1.jpg`, `a-babbel-1.jpg` and `a-tenpercenthappier-1.jpg` (3 px = 1 pt; 393 × 852 pt captures), cross-checked on point-grid crops.
