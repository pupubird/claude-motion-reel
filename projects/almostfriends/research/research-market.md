# Friend-app film: market research

**Prepared:** 2026-10-07 · **For:** 60 s vertical (9:16, 1080×1920, 60 fps) motion-graphics product film, unnamed friend-making app
**Scope:** (1) landscape 2023–2026, (2) user pain points, (3) verified statistics, (4) messaging and on-screen lines

Every claim carries a URL. "Verified (raw)" means I matched the exact wording in the source's own HTML/PDF text. "Verified (page read)" means I read it through a page fetch but could not pull raw text. "Not verified" items are listed in §3.3 and are not used in recommendations.

---

## 0. Decision-relevant findings (read this first)

1. **Our four mechanics already exist, but scattered, and the closest precedent is a dating feature.** Tinder's 2022 "Blind Date" did icebreaker questions, then a timed chat with no profile details, then profiles revealed, then a mutual like ([TechCrunch, 2022-02-10](https://techcrunch.com/2022/02/10/tinder-introduces-a-way-for-members-to-go-on-virtual-blind-dates)). The film must show our flow without that grammar: no blur, no countdown, no hearts, no "match".
2. **AI-chat onboarding is no longer novel.** Wink Social's store copy says: "you talk to Wink AI → it learns your vibe" ([App Store](https://apps.apple.com/us/app/id6465895427)). The same chat-first pattern runs dating matchmakers (Sitch, ~50 questions by text or voice, per [TechCrunch](https://techcrunch.com/2025/06/25/sitch-wants-to-fuse-human-personality-and-ai-for-matchmaking/)) and networking agents (Boardy, Series, the now-inactive Lunchclub). What sets us apart is **what the AI asks (life priorities)** and **what happens next (3 anonymous days, then a mutual unlock)**, so the film should spend its time there.
3. **Among about 30 products reviewed, none combines all four**: priorities-based AI matching, anonymous 1:1 chat, a fixed time window, and a mutual-consent reveal, framed as friends-only. The nearest is **Introvrs**, a web app. It offers anonymous posting, compatibility matches "with what you have in common", and a "weekly reveal" with a 24-hour window ([introvrs.com](https://www.introvrs.com/)).
4. **Friend apps keep sliding into dating perception.** Patook's founder said in 2017 that earlier friend apps "turned into dating apps after short periods" ([TechCrunch](https://techcrunch.com/2017/07/27/patook-wants-to-be-tinder-for-platonic-friendships)). BFF reviews in 2025–26 say the redesign "emphasizes photos like all the dating apps". Anonymity plus priorities is our credible *proof* of "not dating", so show it rather than state it.
5. **Users distrust black-box matching.** Timeleft: "I was matched with people I have nothing in common with". 222: "The selection algorithm is a blackbox". Show *why* two people were paired (shared priorities) at the match moment, as Introvrs does with "Know exactly why you were paired".
6. **"AI is not your friend" is a live public sentiment.** That was graffiti on Friend's $1M NYC subway campaign ([CNN via KVIA, 2025-11-16](https://kvia.com/news/business-technology/cnn-business-consumer/2025/11/16/how-this-tiny-device-became-a-symbol-for-the-backlash-against-ai/)). Cast the AI as the introducer and the humans as the friends. Do not echo Wink's "AI companions… think of it as the warmup".
7. **Blur already means something else in this category.** It signals dating reveals (S'More, Jigsaw) or paywalls ("the ppl that liked me are covered by a blur", Wink Social review). Draw anonymity another way.
8. **The category's own words are worn out.** "Find your people" appears in BFF's H1 and in the 222 and Synchrony app names. "Like-minded" appears in the copy of Timeleft, Boo, Yubo, Meetup, Pie, Les Amis, Meet5 and Wink. "No swiping" is used by Timeleft, 222, Introvrs, Wink Social and Kndrd. Our beat 3 internal label ("like-minded") should not appear on screen.

**Method and limits.**
- **App reviews.** The AppKittie MCP returned `HTTP 401 "Invalid or missing API key"`, so no credits were spent. Instead I used Apple's free public review RSS feeds: 2,660 most-recent US App Store reviews across BFF, Timeleft, 222, Boo, Wink Social and Pie. I added Google Play reviews embedded on the BFF and Timeleft store pages.
- **Reddit.** Reddit is not accessible to this research agent's web tools: the search API rejects the domain and direct requests return 403. I substituted a public forum thread (ResetEra), so there are **no Reddit quotes** in this report.
- **HHS.gov** returned 403 to automated fetches. The Surgeon General figures were matched against the Internet Archive's copy of the same HHS PDF (snapshot 2023-05-03) and cross-checked with AP's report.
- **Web-search budget** ran out near the end. A few secondary checks (Bumble's BFF guidelines wording, Timeleft founder quotes, APA/Cigna/Harvard loneliness polls) were not done.

---

## 1. Landscape (2023–2026)

### 1.1 Named friend apps

**Bumble For Friends → "BFF" (Bumble)**
- *Naming history.* BFF began as a mode inside Bumble in 2016, became a standalone app in 2023, and was redesigned in September 2025 ([TechCrunch roundup, 2026-04-05](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)). The 2025 app is "built on Geneva, the community-focused social platform Bumble acquired last year… the Geneva app will be shutting down" ([TechCrunch, 2025-09-18](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building/)). The App Store listing "BFF: Make friends & meet up" is published by *Geneva Technologies, Inc.* ([App Store](https://apps.apple.com/us/app/id1478573199)).
- *Positioning (verbatim).* Web H1 "Find your people", then "with Bumble For Friends", then "There are friends for every era. Even your messy ones." and "Bumble For Friends is about exactly that, friends." ([bumble.com/bff](https://bumble.com/bff)). App Store subtitle "Friendship app by Bumble". Store copy: "Bumble BFF is built to make finding your people easier and safer." ([App Store](https://apps.apple.com/us/app/id1478573199)).
- *Mechanic.* Photo profiles with interest tags and photo prompts, one-to-one "wave" connections, a Groups tab with chat rooms, and an events calendar. Group discovery arrives in February 2026 ([TechCrunch](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building/)).
- *Notable.* Bumble reports that "47% express a desire for more friends to engage in activities with" (same TechCrunch piece; methodology not given). The new listing has 8,540 ratings, averaging 4.19, per the iTunes lookup on 2026-10-07. The 2025–26 reviews are dominated by complaints about photos-first design, men flirting, face verification and "waves" (§2).

**Timeleft**
- *Positioning (verbatim).* Page title "Timeleft - Turn Strangers into Friends". H1 "The weekly gatherings turning strangers into friends". Then: "No bios. No swiping. No planning. We'll match you with your group and handle the details. All you need to do is show up." ([timeleft.com](https://timeleft.com/), Verified raw). App Store: "The friendship app 3M+ users love… No swiping. No planning. Just show up." and "We match you based on personality, not selfies." ([App Store](https://apps.apple.com/us/app/id6466442949)).
- *Mechanic.* Personality quiz → "Dinners. Every Wednesday with groups of 4-6", plus drinks, coffee, runs and "Women-Only Dinners. Every Tuesday". "The day of, we reveal your venue and a preview of who you'll meet." (App Store.)
- *Notable.* The homepage claims "4M+ Members" and "52 countries and 200+ cities". It reassures with "walk in knowing everyone chose to be there, too." ([timeleft.com](https://timeleft.com/), Verified raw). It has a day-of "reveal", but in real life (IRL) and for venues, not identities.

**222**
- *Positioning (verbatim).* App Store name "222 - find your people.", subtitle "explore serendipity.". The description reads: "this is not a dating app. / this is not a friend-making service. / this is not networking. / this is not mindless scrolling. / this is not random. / this is not a distraction. / this is not the metaverse. / 222 is an opportunity to choose chance. / no profiles, no DMs, no scrolling, no swiping." ([App Store](https://apps.apple.com/us/app/id6450612690)). Web: "let us plan dinner & comedy with your 5 close matches" ([222.place](https://222.place/)).
- *Mechanic.* A long questionnaire "covering his values, interests, drug tolerance, character traits, and other personal criteria" ([AFP via Daily Tribune, 2025-09](https://tribune.net.ph/2025/09/07/ai-powered-meet-up-apps-fight-loneliness)). AI picks the most compatible members per experience. Store copy says "experiences are always in public & in a group setting. each member is vetted". Pricing is a "$22.22 curation fee or monthly subscription" ([TechCrunch 2026](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)).
- *Notable.* The best example of saying "not dating" as a manifesto (§4.1). Still, a 5★ user notes "you can go on a date with people who mutually say they want to date you as well" (review 13707516558, 2026-02-03), so romance is opt-in.

**Pie**
- *Positioning (verbatim).* App Store "Pie: Free Events, Cool People", subtitle "Places to go. People to meet." Copy: "Hi, we're Pie, a social app that helps you get a life." and "…like-minded, actually-fun people you run into so many times that you accidentally become best friends. No pressure, no promises." ([App Store](https://apps.apple.com/us/app/id1509667820)). Web title "Pie | people i enjoy" ([getpie.app](https://www.getpie.app/)).
- *Mechanic.* Free local events. An AI quiz, "Sparked Connections", groups people into sixes and opens a group chat before the event ([TechCrunch, 2025-03-04](https://techcrunch.com/2025/03/04/andy-dunns-new-app-pie-uses-ai-to-help-you-make-friends)).
- *Notable.* Founded by Bonobos co-founder Andy Dunn. $11.5M Series A and 130,000+ MAU (same TechCrunch piece). Andy Dunn on AI: "without the AI inflection point, I think it would be almost unsolvable."

**Wink** (two different products share the name)
- *Teen Snapchat friend-finder.* Common Sense Media's review of "Wink – make new snap friends" sums it up as "Swipe right to find strangers on Snapchat; not for kids." It recommends 17+ and lists the developer as "9 Count" ([Common Sense Media](https://www.commonsensemedia.org/app-reviews/wink-make-new-snap-friends)).
- *Wink Social (Euphorica, Inc., App Store release 2023-09-26).* Subtitle "Meet Your People, Chat & Vibe". Copy: "Wink Social — built for intention, not attention… you talk to Wink AI → it learns your vibe, your interests… mutual interest? Wink slides in with a warm intro. no awkward cold messages. no being left on read." Also: "AI companions matched to your personality… think of it as the warmup." and "no feeds. no followers. no swiping." ([App Store](https://apps.apple.com/us/app/id6465895427)). The same publisher runs **Wink Dating** ("Meet Wink AI — your digital friend") ([App Store](https://apps.apple.com/us/app/id1482681335)).
- *Notable.* Wink Social is the closest competitor to our "chat mode" onboarding. I did **not** verify whether the 9 Count app and Euphorica's listings are the same lineage. One Wink Social reviewer writes "I am someone who used this when wink used to be for teens" (review 13847508660, 2026-03-14).

**Boo**
- *Positioning (verbatim).* App Store "Boo Dating App: Date & Friends", subtitle "Date. Match. Meet New People." Copy: "Boo is for connecting with compatible and like-minded souls… find your best match faster, for dating or friendship." and "Find your soulmate or your best friend." ([App Store](https://apps.apple.com/us/app/id1498407272)). Web: "Boo – Meet New People By Personality and Interests"; tagline "We stand for love." ([boo.world](https://boo.world/), page read).
- *Mechanic.* 16 personality types, Enneagram and zodiac. Interest "universes" (communities). Swipe and match.
- *Notable.* 210,488 ratings. Dating and friends are deliberately mixed, and the listing includes "FLIRTING TIPS". This is the opposite of our positioning.

**Yubo**
- *Positioning (verbatim).* App Store "Yubo: Chat Meet & Make Friends", subtitle "Match. Text. Talk. Be Real NOW". Copy includes "SWIPE TO MAKE NEW FRIENDS" and "FIND YOUR TRIBE" ([App Store](https://apps.apple.com/us/app/id1038653883)).
- *Mechanic.* Swipe plus group livestream rooms.
- *Notable.* 60M sign-ups, "99% being Gen Z users aged 13 to 25". Facial age estimation via Yoti ([TechCrunch, 2022-05-25](https://techcrunch.com/2022/05/25/gen-z-social-app-yubo-rolls-out-age-estimating-technology-to-better-identify-minors-using-its-service)).

**Patook** (appears defunct)
- *Positioning.* "strictly platonic friend making app" ([TechCrunch, 2017-07-27](https://techcrunch.com/2017/07/27/patook-wants-to-be-tinder-for-platonic-friendships)).
- *Mechanic.* Weighted-trait matching and a swipe or list view. An NLP flirt detector bans users. The founder said "Anything that is even a hint more than strictly platonic is immediately banned." He also said "There have been some attempts in the past to create friend-making apps but they've turned into dating apps after short periods." (same article).
- *Status.* On 2026-10-07, patook.com did not resolve (DNS ENOTFOUND). No US App Store match was found, and Google Play `com.patook.patook` returned "Not Found". "Defunct" is my inference from those checks.

**Hey! VINA** (closed)
- *Positioning (verbatim).* "HEY! VINA IS for (girl) Friends!" ([heyvina.com](https://heyvina.com/)). The press framed it as a Tinder clone: "Hey! VINA is a Tinder for girl friends" ([TechCrunch, 2016-01-26](https://techcrunch.com/2016/01/26/hey-vina-is-a-tinder-for-girl-friends)).
- *Mechanic (site copy).* "meet new friends, join communities of people like you, take quizzes, make plans, and live group chat".
- *Status.* The site now reads "BYE! VINA it's been a wonderful 9 years, but it's time to move on to the next chapter! Thanks for the memories." ([heyvina.com](https://heyvina.com/), Verified raw).

**Peanut**
- *Positioning (verbatim).* App Store "Peanut: Find Mom Friends", subtitle "Pregnancy & Motherhood support". Copy: "helping you find your village." ([App Store](https://apps.apple.com/us/app/id1178656034)). Web title "Peanut - Find Friends and Support" ([peanut-app.io](https://www.peanut-app.io/)).
- *Mechanic.* "Swipe to meet local moms", groups, and "Incognito Mode: Ask anything anonymously". Anonymity is used for Q&A, not for meeting people.
- *Notable.* The listing claims "Join over 5 million women". It quotes the NYT line "An app for any mom who missed out on dating apps", a friend app framed by dating.

**Meetup**
- *Positioning (verbatim).* H1 "The people platform. Where interests become friendships." ([meetup.com](https://www.meetup.com/), Verified raw). App Store subtitle "Meet New People & Make Friends", and "With over 60 million members" ([App Store](https://apps.apple.com/us/app/id375990038)).
- *Mechanic.* Interest groups and events.
- *Notable.* Operating since 2002 ([TechCrunch 2026](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)). The affirmative "interests become friendships" framing never mentions dating.

**Lunchclub** (effectively inactive)
- *Positioning (verbatim).* "Lunchclub is an AI superconnector that makes introductions for 1:1 video meetings to advance your career" and "Professional connections reimagined." ([lunchclub.com](https://lunchclub.com/)). App Store subtitle "Career Changing Video Meetings". Copy: "tell us what your professional goals are and our system will automatically connect you with the right person" ([App Store](https://apps.apple.com/us/app/id1538817081)).
- *Status.* The last App Store version is dated 2022-03-03 (iTunes lookup). Fortune reports "But, in 2022, growth plateaued.", and the CEO "pivoted Lunchclub to Lighter, retained 80% of the team" ([Fortune, 2025-11-11](https://fortune.com/2025/11/11/lighter-fundraise-founders-fund-ribbit-capital-haun-ventures-robinhood-vladimir-novakovski/)). It was an early "tell the AI your goals, it introduces you" model, though professional rather than social.

### 1.2 Newer AI, values-based and slow-reveal friend products (2025–2026)

| Product | Positioning (verbatim) | Mechanic | Why it matters to us |
|---|---|---|---|
| **Introvrs** (web app) | "Make real friends who get you." · "Introvrs is the friendship app to find your kind of people." ([introvrs.com](https://www.introvrs.com/)) | "Answer a few private questions…" → "Get up to two highly compatible matches per week in a private one-on-one space" → "Every match comes with what you have in common" → "Show up intentionally for your match within 24 hours after the weekly reveal." Also "Post honestly, stay anonymous." | **Closest concept to ours**: anonymous, compatibility- and values-based, a reveal, a time window, and visible match reasons |
| **Wink Social** | "built for intention, not attention." ([App Store](https://apps.apple.com/us/app/id6465895427)) | Chat with Wink AI → warm intro on mutual interest; AI companions as "warmup" | Same "chat with AI" onboarding; it blurs AI matchmaker and AI companion |
| **Les Amís** | "Your family of girlfriends" ([lesamis.cc](https://www.lesamis.cc/)) | AI assistant "Amis"; "Every two weeks, users can participate in matching rounds"; "The AI determines matches on Mondays"; $70/month in NYC; ~120,000 installs ([TechCrunch, 2025-08-15](https://techcrunch.com/2025/08/15/les-amis-the-european-app-helping-women-form-friendships-launches-in-new-york)) | Cadenced AI matching for women |
| **Series** | "It's a bet that the next social network won't look like a social network at all." ([Founded](https://www.founded.com/series-imessage-ai-social-network-yale-pre-seed/)) | Text an AI in iMessage; it replies with "shares"; "a private conversation opens inside the same chat, without anyone trading their real number"; $5.1M pre-seed; mostly networking | AI-chat onboarding plus privacy-preserving intros |
| **Boardy** | CEO: "If Boardy has spoken with someone he thinks would make a good connection… he will try and facilitate a double-opt-in introduction." ([TechCrunch, 2024-10-24](https://techcrunch.com/2024/10/24/ai-networking-startup-boardy-raises-3m-pre-seed)) | AI voice call → email intro if both accept; $3M pre-seed | Double opt-in by AI (professional) |
| **Synchrony** | App Store title "Synchrony - Find Your People" ([App Store](https://apps.apple.com/us/app/id6755783702)) | Neurodivergent adults; verified; optional AI coach "Jesse"; launched March 2026 ([TechCrunch 2026](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/)) | AI as a conversation helper, not a matchmaker |
| **Slowly** | "Build Authentic Friendships at Your Own Pace" · "No photos, no real names—just your thoughts" ([App Store](https://apps.apple.com/us/app/id1199811908)) | Pen-pal letters that take "anywhere from a few hours to a few days" to arrive; "With no pressure to respond instantly" | Anonymous, slow friendship without dating baggage; there is no reveal step |
| **Wyzr** | "Making friends as an adult shouldn't be this hard." · "Wyzr is built around friendship—not dating." ([App Store](https://apps.apple.com/us/app/id1671396601)) | Activity-based, 40+ | Calm, one-clause "not dating" |
| **Clyx** | "Build Friendships That Click" ([App Store](https://apps.apple.com/us/app/id1550061986)) | Curated events for women in their 20s (Miami and London per TechCrunch 2026) | Events plus friends |
| **Kndrd** | "Stop swiping, stop scrolling, start doing and find your people" ([App Store](https://apps.apple.com/us/app/id6498315234)) | Users propose plans → auto group chat | Plans-first |
| **Meet5** | "Meet5 is the #1 leisure app." ([App Store](https://apps.apple.com/us/app/id1222980795)) | Group activities; targets 40+ (TechCrunch 2026) | Older adults |
| **Friended** | Subtitle "It starts with a conversation"; web: "Friends- first dating." and "Make friends. Make more than friends." ([App Store](https://apps.apple.com/us/app/id1144304244), [friended.com](https://www.friended.com/)) | Conversation-first | **Conversation-first friend app that openly bridges to dating; avoid this ambiguity** |
| Washed Up, Mmotion, Clockout | Listed in TechCrunch's 2025 and 2026 roundups ([2026](https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/), [2025](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building/)) | Event plans (LA), map-based groups (NYC) | Not researched further |

### 1.3 Mechanic map (where the white space is)

| | AI chat onboarding | Values/personality matching | Anonymous 1:1 chat | Time-boxed | Mutual-consent reveal | Friends-only framing |
|---|---|---|---|---|---|---|
| **Our app** | yes (life priorities) | yes (priorities) | yes (3 days) | yes (3 days) | yes (both tap unlock) | yes |
| Introvrs | no (private questions) | yes ("compatible", "values") | partial (anonymous posting) | yes (24 h after weekly reveal) | weekly reveal | yes |
| Wink Social | **yes** | vibe and interests | no | no | mutual interest → intro | no (sister app is dating) |
| Tinder Blind Date (dating) | no | commonalities | **yes (timed)** | **yes** | **yes** (reveal, then mutual like) | no, dating |
| Timeleft / 222 / Pie | no (quiz) | yes (personality/values) | n/a (IRL groups) | weekly/event | no | 222: "not a dating app" |
| BFF (Bumble) | no | interest tags | no (photos, face verification) | no | wave/connect | yes ("about… friends") |
| Slowly | no | interests/languages | yes (no photos/names) | slow by design | no | yes (pen pals) |
| Boardy / Series / Lunchclub | yes (voice/iMessage/goals) | professional goals | Series: private chat | no | Boardy: double opt-in | no, networking |

Sources are as in §1.1–1.2. **Takeaway:** no reviewed product combines all six columns. The combination is the story; individual features are not.

### 1.4 Anonymous / slow-reveal / time-box patterns from DATING apps (learn from them; the film must not resemble them)

| Pattern | Product (year) | How it works (sourced) | Lesson for us | Must not resemble |
|---|---|---|---|---|
| Photos blur, then sharpen with chatting | S'More (2020 feature) | Unblur Meter shows "what each participant in a conversation must do in order to view the pictures and unlock all other visual content" ([Global Dating Insights, 2020-11-20](https://www.globaldatinginsights.com/news/smore-introduces-unblur-meter-and-updated-home-screen/)) | Progress toward a reveal is engaging | **Blur-to-sharp faces** |
| Puzzle reveal | Jigsaw / JigTalk (beta 2016, US 2021) | "a user's profile photo was concealed by a digital jigsaw puzzle that revealed itself piece by piece through message exchanges" ([Wikipedia](https://en.wikipedia.org/wiki/Jigsaw_(dating_app))) | Same | Puzzle-piece faces |
| Timed anonymous chat → reveal → mutual like | Tinder Blind Date (2022) | "a timed chat experience where they won't know any of the details about the person they're messaging… the two members can view each other's profile, then like it if they want to make a match"; "40% more matches than… Fast Chat" ([TechCrunch](https://techcrunch.com/2022/02/10/tinder-introduces-a-way-for-members-to-go-on-virtual-blind-dates)) | Conversation-first reveal **works**: proof the mechanic is compelling | **Countdown timer on chat; "match" at reveal** |
| Anonymous browsing; reveal only on initiative | Pickable (2018) | Women browse with no name or photo; a woman reveals one photo only when she "picks" ([Global Dating Insights, 2018-10-22](https://www.globaldatinginsights.com/news/new-dating-app-pickable-lets-women-browse-anonymously/)) | Anonymity as safety for women | One-sided reveal |
| Mutual secret list | Facebook Dating "Secret Crush" (2019) | Add up to nine friends; "If they also add that user to 'Secret Crush', they will both receive a notification" ([Global Dating Insights, 2019-05-01](https://www.globaldatinginsights.com/news/facebook-dating-launched-in-14-new-countries-and-introduces-secret-crush-feature/)) | Mutual consent feels safe | **"Crush"/heart reveal** |
| Chat expires | Coffee Meets Bagel (2014) | "the IM feature has a seven-day expiration date" ([TechCrunch, 2014-05-23](https://techcrunch.com/2014/05/23/dating-app-coffee-meets-bagel-ditches-twilio-with-new-im-features)) | Time boxes are an established pattern | Ticking clocks |
| AI chat onboarding + double opt-in | Sitch (2025) | App "asks them details using almost 50 questions, which they can answer through text or voice"; "If both users agree to match with each other, the bot adds them to a group chat with the AI"; paid match packs ([TechCrunch, 2025-06-25](https://techcrunch.com/2025/06/25/sitch-wants-to-fuse-human-personality-and-ai-for-matchmaking/)) | Users will share a lot with an AI | **AI-matchmaker-for-romance tone** |
| AI matchmaker | Three Day Rule "Tai" (2025) | Headline only: "Three Day Rule Launches First-Ever Matchmaker-Trained AI Matchmaking App" ([BusinessWire, 2025-10-06](https://www.businesswire.com/news/home/20251006536719/en/Three-Day-Rule-Launches-First-Ever-Matchmaker-Trained-AI-Matchmaking-App)) (headline only, not opened) | Shows the space is crowded | Same |
| **Cautionary:** random anonymous chat | Omegle (shut 2023) | "a video chat service that connects users with strangers at random, is shutting down after 14 years following ample misuse of the platform"; founder: "Operating Omegle is no longer sustainable, financially nor psychologically." ([AP via News4JAX, 2023-11-09](https://www.news4jax.com/business/2023/11/09/video-chat-service-omegle-shuts-down-following-years-of-user-abuse-claims/)) | Anonymity without matching or consent is a known harm | **"Talk to strangers" randomness** |

**Visual translation** (my recommendations, derived from the table above):
- Draw anonymity as **shape avatars tinted by each person's top priorities**, not blurred photos.
- Show the 3 days as **Day 1 · Day 2 · Day 3 chips or a sun/moon cycle**, not a countdown.
- Show the unlock as **two keys turning or two toggles flipping to yes**, not hearts, flames or "It's a match!".
- Show matching as **shared-priority chips** (e.g., Family · Health · Adventure) lighting up on both sides, not swipe cards.

---

## 2. Pain points (what frustrates people about friend apps)

**Sources used.** 2,660 most-recent US App Store reviews, pulled from Apple's public RSS feed (`https://itunes.apple.com/us/rss/customerreviews/page=N/id=<APP_ID>/sortby=mostrecent/json`, pages 1–10):
- BFF: 500 reviews, 2025-12-06 → 2026-10-03
- Boo: 500 reviews, 2026-09-05 → 2026-10-04
- 222: 500 reviews, 2024-10-02 → 2026-10-04
- Wink Social: 500 reviews, 2023-10-09 → 2026-09-23
- Timeleft: 500 reviews, 2024-11-20 → 2026-10-02
- Pie: 160 reviews, 2021-09-10 → 2026-10-01

I also used Google Play reviews embedded on the [Bumble For Friends](https://play.google.com/store/apps/details?id=com.bumblebff.app) and [Timeleft](https://play.google.com/store/apps/details?id=com.timeleft.app) pages, and the ResetEra thread ["Anyone used Bumble BFF (or something similar) to make friends?"](https://www.resetera.com/threads/anyone-used-bumble-bff-or-something-similar-to-make-friends.708302/) (2023-04-13). Reddit could not be accessed (see §0).

### 2.1 Top verbatim quotes (10)

| # | Theme | Quote (verbatim) | Source |
|---|---|---|---|
| 1 | Feels like a dating app | "It emphasizes photos like all the dating apps instead of text." | BFF, App Store, 1★, 2025-12-17, review 13526211436 ([feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortby=mostrecent/json)) |
| 2 | Mistaken for dating / creepy | "Now it's flooded with so many men that flirt and act like they are looking for friends." | BFF, App Store, 2★, 2026-03-18, review 13861138206 ([feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortby=mostrecent/json)) |
| 3 | Mistaken for dating | "both times I met someone, they were instantly interested in turning it sexual" | ResetEra user JaseMath, 2023-04-13 ([thread](https://www.resetera.com/threads/anyone-used-bumble-bff-or-something-similar-to-make-friends.708302/)) |
| 4 | Ghosting / dead chats | "let's say you do have a connection, then they just stop replying." | BFF, App Store, 2★, 2025-12-21, review 13539763318 ([feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortby=mostrecent/json)) |
| 5 | Ghosting | "it always ends up in being ghosted." | ResetEra user Midramble, 2023-04-13 ([thread](https://www.resetera.com/threads/anyone-used-bumble-bff-or-something-similar-to-make-friends.708302/)) |
| 6 | Superficial | "Like you're still picking people off superficial things" | ResetEra user Vic Damone Jr., 2023-04-13 ([thread](https://www.resetera.com/threads/anyone-used-bumble-bff-or-something-similar-to-make-friends.708302/)) |
| 7 | Endless small talk | "better quality chats instead of dead-end small talk" (praise for Boo, naming the pain) | Boo, App Store, 5★, 2026-09-15, review 14555111254 ([feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1498407272/sortby=mostrecent/json)) |
| 8 | Bad matching / flaky | "3 out of 6 people didn't show up. We could not have been more different and have less in common." | 222, App Store, 2★, 2026-05-11, review 14052223578 ([feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6450612690/sortby=mostrecent/json)) |
| 9 | Safety / scams | "15 - yes 15 im not being dramatic - fake profiles MSGed me" | BFF, App Store, 2★, 2026-07-25, review 14346779220 ([feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortby=mostrecent/json)) |
| 10 | Hard as an adult | "It's already hard enough to find friends as an adult, this was supposed to make it easier." | Bumble For Friends, Google Play, 2★, 2024-08-16 ([Google Play](https://play.google.com/store/apps/details?id=com.bumblebff.app)) |

### 2.2 Supporting quotes by theme (all verbatim)

- **Mistaken for dating / creepy**
  - "Many of us women have head [sic] creepy experiences with men on social sites" (BFF 3★, 2026-05-26, review 14107958929).
  - "men trying to hookup with me" (BFF 1★, 2025-12-31, review 13578586195).
  - About the "Maria is waving at you on BFF. Say hi." notification: "it sounds like an escort notification" (BFF 2★, 2026-03-18, review 13861138206).
  - "The current format makes more sense for a dating app" (BFF 4★, 2026-04-02, review 13916387627).
  - "This isn't a dating app…" on mandatory photo verification (BFF 1★, 2026-07-21, review 14329681451).
  - All BFF reviews are from the [BFF feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1478573199/sortby=mostrecent/json).
- **Ghosting / no replies**
  - "I always get matches or people saying Hi 👋🏼 but NEVER get replies to my messages" (BFF 1★, 2026-08-07, review 14400590999).
  - "the conversations die so fast" (BFF 2★, 2026-05-28, review 14116759947).
  - "Literally nobody texts back." (Boo 1★, 2026-09-09, review 14530411888, [Boo feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1498407272/sortby=mostrecent/json)).
  - "I'm sick of ghosting and dealing with transactional relationships built on dating apps." (222 5★, 2024-10-25, review 11874609162).
- **Superficial / photo-first / surface level**
  - "it's easier to just pick based off looks that way" (BFF 2★, 2026-05-28, review 14116759947).
  - "nothing that goes beyond the surface level" (BFF 3★, 2026-07-29, review 14363575821).
- **Black-box / bad matching**
  - "I was matched with people I have nothing in common with" (Timeleft 1★, 2026-05-02, review 14021745189, [Timeleft feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6466442949/sortby=mostrecent/json)).
  - "It seems they just put a bunch of random people together" (Timeleft 1★, 2026-08-04, review 14388002627).
  - "The selection algorithm is a blackbox" (222 1★, 2026-06-20, review 14206085367).
  - On Wink's AI chatbot: "it gave me the opposite of everything" (Wink Social 2★, 2026-09-23, review 14586670839, [Wink Social feed](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6465895427/sortby=mostrecent/json)).
- **AI / verification distrust**
  - "forces you to let AI scan your face to verify. creepy and unnecessary." (BFF 1★, 2026-06-28, review 14237310587).
  - "really funny that a team that vocalizes it doesn't use AI support 1000% uses an AI chat bot for support. So frustrating from a company that preaches about real human connection." (222 1★, 2026-09-08, review 14526382836).
- **Blur = paywall**
  - "the ppl that liked me are covered by a blur" (Wink Social 1★, 2026-02-15, review 13753052081).
  - "having to pay to even see who liked you... Which kind of defeats the whole purpose of the app." (Bumble For Friends, Google Play 2★, 2024-08-16, [Google Play](https://play.google.com/store/apps/details?id=com.bumblebff.app)).
- **Same circle** (the hook)
  - "My existing friends still have the same schedule so I can only fill that downtime with them so much." (222 5★, 2026-08-03, review 14384903012).
  - "meet people out of your normal social circles" (222 5★, 2024-10-25, review 11874609162).
  - "It's hard to make friends as an adult" (222 5★, 2026-05-23, review 14097216740).
- **The emotional cost**
  - "It's sad my last ditch effort to making friends made me feel even more alone than I do now." (BFF 1★, 2026-08-22, review 14460370370).

### 2.3 What delights (positive reviews)

- "It is low pressure because it's in a group in a public place" (222 5★, 2026-02-03, review 13707516558).
- "Low pressure, common ground, well curated." (222 4★, 2025-11-04, review 13358254608).
- "it can be hard to find ones that are the right fit with your values and thinking" (222 5★, 2025-07-12, review 12883812840).

**Directional keyword counts** across 1,161 positive (4–5★) and 1,236 negative (1–2★) reviews. These come from crude regex matching, so use them only for ranking themes:
- *safe / safety / verification:* 1.0% of positive vs **4.0% of negative**. Safety shows up as a pain, often verification friction, not as a delight.
- *genuine / authentic / real / meaningful:* **4.4% positive** vs 2.5% negative. Happy users reach for these words, but they are also marketing clichés (§4.5).
- *moved / new city:* 1.8% positive vs 0.7% negative.
- *introvert / shy / awkward:* 2.0% positive vs 1.2% negative.

### 2.4 Implications for the film

| Pain | What our mechanic answers | Film beat |
|---|---|---|
| Photo-first, looks-based, "feels like dating" | No names or photos for 3 days; matched on priorities | Beats 4 and 6 |
| Creepy messages / men flirting | Anonymous until **both** say yes; friends-only framing | Beats 5 and 6 |
| Dead-end small talk | Conversation starts from shared priorities | Beats 2 and 3 |
| Black-box matching | Show "what you share" at the match moment | Beat 3 |
| Ghosting / chats die | A bounded 3-day window gives a reason to talk now. *Don't overpromise: the product cannot guarantee replies.* | Beat 4 |
| IRL no-shows / flakiness | Not addressed by the product (chat-first). **Don't claim it.** | (none) |

---

## 3. Statistics on adult friendship and loneliness

### 3.1 Verified statistics

| # | Exact statistic (source wording) | Year | Publisher | URL | Status |
|---|---|---|---|---|---|
| S1 | "Recent surveys have found that approximately half of U.S. adults report experiencing loneliness, with some of the highest rates among young adults." | 2023 | Office of the U.S. Surgeon General (HHS), *Our Epidemic of Loneliness and Isolation* | [HHS PDF](https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf), p. 9 | Verified (raw; HHS blocked bots, so checked against the archived PDF; AP/PBS: "About half of U.S. adults say they've experienced loneliness" [PBS/AP](https://www.pbs.org/newshour/health/loneliness-poses-health-risks-as-deadly-as-smoking-u-s-surgeon-general-says)) |
| S2 | "The mortality impact of being socially disconnected is similar to that caused by smoking up to 15 cigarettes a day" | 2023 | Same | Same PDF, p. 4 (also p. 8) | Verified (raw) |
| S3 | "the amount of time respondents engaged with friends socially in-person decreased from 2003 (60-minutes/day, 30-hours/month) to 2020 (20-minutes/day, 10-hours/month)." | data 2003–2020; pub. 2023 | Same (citing the American Time Use Survey analysis) | Same PDF, p. 13 | Verified (raw) |
| S4 | Ages 15–24: "time spent in-person with friends has reduced by nearly 70% over almost two decades, from roughly 150 minutes per day in 2003 to 40 minutes per day in 2020." | Same | Same | Same PDF, p. 13 | Verified (raw) |
| S5 | "Loneliness and social isolation increase the risk for premature death by 26% and 29% respectively." | 2023 | Same | Same PDF, p. 8 | Verified (raw) |
| S6 | "1 in 6 people worldwide is affected by loneliness" | 2025 (30 June) | WHO Commission on Social Connection, global report | [WHO news release](https://www.who.int/news/item/30-06-2025-social-connection-linked-to-improved-heath-and-reduced-risk-of-early-death) | Verified (raw) |
| S7 | "Loneliness is linked to an estimated 100 deaths every hour—more than 871 000 deaths annually." | 2025 | WHO | Same | Verified (raw) |
| S8 | "Between 17–21% of individuals aged 13–29-year-olds reported feeling lonely, with the highest rates among teenagers." / "About 24% of people in low-income countries reported feeling lonely — twice the rate in high-income countries (about 11%)." | 2025 | WHO | Same | Verified (raw) |
| S9 | "Close to half (49 percent) of Americans report having three or fewer [close friends]" vs 1990: "less than one-third (27 percent) said they had three or fewer" | survey May 2021; pub. 2021-06-08 | Survey Center on American Life (AEI), Daniel A. Cox, *The State of American Friendship* | [americansurveycenter.org](https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/) | Verified (page read ×2; the Surgeon General PDF p. 13 independently cites "almost half of Americans (49%) in 2021… only about a quarter (27%)… in 1990" (raw)) |
| S10 | No close friends: "(12 percent)" today vs 1990: "Only 3 percent said they did not have any close friends." · 10+ close friends: "Thirteen percent" vs 1990 "(33 percent)" | 2021 | Same | Same | Verified (page read ×2) |
| S11 | "A majority (54 percent) of Americans with close friends say they met a close friend at their or their spouse's workplace." · "nearly half (46 percent) of Americans report having made a new friend within the past 12 months." | 2021 | Same | Same | Verified (page read ×2). Also in one pass: 47% made a close friend at school; 40% through existing friends |
| S12 | "Some 8% say they have no close friends." · "(53%) say they have between one and four close friends" · "(38%) say they have five or more." | 2023 (Oct 12) | Pew Research Center, Isabel Goddard | [Pew short read](https://www.pewresearch.org/short-reads/2023/10/12/what-does-friendship-look-like-in-america/) | Verified (raw) |
| S13 | "61% of U.S. adults say having close friends is extremely or very important for people to live a fulfilling life" · 49% of adults 65+ have five or more close friends vs 32% of those under 30 | 2023 | Pew | Same | Verified (raw; the under-30 figure by page read) |
| S14 | "About one-in-six Americans (16%) say they feel lonely or isolated from those around them all or most of the time" | 2025 (Jan 16) | Pew Research Center, *Men, Women and Social Connections* | [Pew report](https://www.pewresearch.org/social-trends/2025/01/16/men-women-and-social-connections/) | Verified (raw) |
| S15 | "it takes roughly 50 hours of time together to move from mere acquaintance to casual friend, 90 hours to go from that stage to simple 'friend' status and more than 200 hours before you can consider someone your close friend." | 2018 (KU release dated 03/28/2018) | Jeffrey Hall, *Journal of Social and Personal Relationships*; University of Kansas | [KU News](https://news.ku.edu/2018/03/06/study-reveals-number-hours-it-takes-make-friend) | Verified (raw, press release; journal article itself not opened) |
| S16 | "Nearly one in four people worldwide -- which translates into more than a billion people -- feel very or fairly lonely, according to a recent Meta-Gallup survey of more than 140 countries." · ages 19–29: 27%; 65+: 17%; men and women both 24% | 2023 (Oct 24; report launched Nov 1, 2023) | Gallup (Ellyn Maese) / Meta-Gallup *Global State of Social Connections* | [Gallup](https://news.gallup.com/opinion/gallup/512618/almost-quarter-world-feels-lonely.aspx) | Verified (raw) |
| S17 | "Twenty percent of U.S. adults in Gallup's most recent quarterly data report feeling loneliness 'a lot of the day yesterday'" (≈52 million adults; n = 6,289; Aug 27–Sept 4, 2024) | 2024 (Oct 14) | Gallup (Mary Page James, Dan Witters) | [Gallup](https://news.gallup.com/poll/651881/daily-loneliness-afflicts-one-five.aspx) | Verified (raw) |
| S18 | "while a majority (60%) of respondents want to find new friends, 52% have not made a friend in the last year." · "(43%) respondents agree that they're stuck in outdated friendships" · "78% share that they're a different person now" | Feb 2023 (>1,000 US adults who attended or are in college) | **Bumble-commissioned**, Censuswide | [Bumble Buzz](https://bumble.com/the-buzz/bumble-for-friends-bff-data-friendship-loneliness-online) | Verified (raw). **Sponsor-commissioned, non-probability sample; use with care** |

### 3.2 Best stats for this film (and safe on-screen phrasing)

1. **Hook, trend:** S9. "Nearly half: three close friends, max." This is US-only; keep "close". Optional second card: "1990: about a quarter".
2. **Hook, time:** S3. "Time with friends: down two-thirds." Here 60 → 20 min/day is −67%. It is US data, in-person, 2003→2020.
3. **Why a structured start helps:** S15. "~50 hours to a casual friend." Don't say "to make a friend". The source's wording is "casual friend".
4. **Global alternative:** S6. "1 in 6 people are affected by loneliness" (WHO). It is accurate, but its tone is heavier than "friendly and fun".

Keep sources in the post caption or description rather than as on-screen micro-labels. Avoid health-risk stats (S2, S5, S7) in a fun film; they shift the tone to clinical.

### 3.3 Not verified or excluded (do not use)

- "Just 8% of U.S. adults say they've met a close friend online". This appeared in an AOL article surfaced by search; I could not find the primary source. The Survey Center's "where friends met" chart data has no "online" category ([Datawrapper](https://datawrapper.dwcdn.net/UoK8b/6/)).
- 222 "$22 monthly subscription" and "users split roughly evenly between friends and romance". These came from search summaries of an AFP story and were **absent** from the two AFP copies opened ([Daily Tribune](https://tribune.net.ph/2025/09/07/ai-powered-meet-up-apps-fight-loneliness), [eNCA](https://www.enca.com/lifestyle/ai-powered-meet-apps-fight-loneliness)). Use TechCrunch's "$22.22 curation fee or monthly subscription" instead.
- 222 "$10.1 million" raise (the AOL syndication page returned 404). BFF "completely free, no premium tier" (a competitor's blog). Talker Research "39% haven't made a new friend in over a year". "45% find it difficult to make new friends" (2019, source unknown). None of these were opened or verified.
- APA 2024, Cigna 2025 and Harvard Making Caring Common 2024 loneliness figures were not checked (search budget exhausted).

---

## 4. Messaging

### 4.1 How competitors say "not dating"

| Pattern | Verbatim examples | Read |
|---|---|---|
| **A. Affirm the relationship; never mention dating** | Bumble: "Bumble For Friends is about exactly that, friends." ([bumble.com/bff](https://bumble.com/bff)) · Meetup: "Where interests become friendships." ([meetup.com](https://www.meetup.com/)) · Les Amis: "Your family of girlfriends" ([lesamis.cc](https://www.lesamis.cc/)) · Peanut: "find your village" ([App Store](https://apps.apple.com/us/app/id1178656034)) | **Least defensive.** Names what you get. |
| **B. Negate dating-app *mechanics*, not the motive** | Timeleft: "No bios. No swiping. No planning." and "We match you based on personality, not selfies." ([timeleft.com](https://timeleft.com/), [App Store](https://apps.apple.com/us/app/id6466442949)) · Introvrs: "Meet one person, not a crowd" ([introvrs.com](https://www.introvrs.com/)) · Wink Social: "no feeds. no followers. no swiping." | Signals "not dating" implicitly. Now so common it's a cliché (§4.5). |
| **C. Manifesto of negations (dating buried in a list)** | 222: "this is not a dating app. / this is not a friend-making service. / this is not networking…" ([App Store](https://apps.apple.com/us/app/id6450612690)) | Reads as attitude, not defense. The risk: one 1★ reviewer titled theirs "Pretentious Art Project Masquerading as a Data Collection Scam" (222, 2025-08-22, review 13048844287). |
| **D. One calm clause** | Wyzr: "Wyzr is built around friendship—not dating." ([App Store](https://apps.apple.com/us/app/id1671396601)) | Fine in body copy. Weaker as a headline. |
| **E. Policing (avoid)** | Patook: "strictly platonic"; "Anything that is even a hint more than strictly platonic is immediately banned." ([TechCrunch](https://techcrunch.com/2017/07/27/patook-wants-to-be-tinder-for-platonic-friendships)) | Trust through threat. Sounds defensive, and the product appears defunct. |
| **F. Borrowing dating language (avoid)** | "Hey! VINA is a Tinder for girl friends" ([TechCrunch](https://techcrunch.com/2016/01/26/hey-vina-is-a-tinder-for-girl-friends)) · Patook "Tinder for platonic friendships" (TechCrunch headline) · Friended: "Friends- first dating." ([friended.com](https://www.friended.com/)) · Boo: "for dating or friendship" | Plants the very association you're trying to escape. |

**Recommendation.** Lead with **A** (affirm "friends") and let the mechanics carry **B**. The film shows no photos and no swipe, so the viewer infers "not dating" without our saying it. If the "not dating" beat must be explicit, use one short, warm clause (**D**), never a rule (**E**).

### 4.2 Value props that resonate (evidence)

- **Shared values / "people who get you."** Users praise matches who "share your values" and say "it can be hard to find ones that are the right fit with your values and thinking" (222 reviews, §2.3). Boo sells "meet new people by shared values and interests" ([App Store](https://apps.apple.com/us/app/id1498407272)). Introvrs leads with "friends who get you" ([introvrs.com](https://www.introvrs.com/)). Our "priorities in life" is a sharper, more concrete version.
- **No pressure / own pace.**
  - "Low pressure, common ground, well curated." (222 review)
  - Pie: "No pressure, no promises." ([App Store](https://apps.apple.com/us/app/id1509667820))
  - Slowly: "With no pressure to respond instantly" ([App Store](https://apps.apple.com/us/app/id1199811908))
  - Introvrs: "Warm Up at Your Own Pace"
  - Our anonymous chat plus mutual unlock is a no-pressure mechanic, so say it.
- **Safety (as control, not surveillance).** Safety terms appear 4× more often in negative than in positive reviews. Much of that is friction with face scans ("forces you to let AI scan your face… creepy"). Slowly frames safety as "No photos, no real names" and 222 as "always in public & in a group setting". Our frame: *you decide what to share, and when; nothing is revealed unless you both say yes.*
- **Time-boxed.** The window is an established pattern: Introvrs gives 24 h after the reveal, Timeleft runs weekly, Coffee Meets Bagel chats expire after 7 days, and Tinder Blind Date uses a timer. Frame 3 days as **"enough time to really talk"**, not as a deadline.
- **AI's role.** Public backlash says "AI is not your friend" ([CNN/KVIA](https://kvia.com/news/business-technology/cnn-business-consumer/2025/11/16/how-this-tiny-device-became-a-symbol-for-the-backlash-against-ai/)), and users mock apps that "preach… real human connection" while using bots. So the AI should **introduce**, then **step aside**. Never "AI friend", "your AI that gets you", or companionship.

### 4.3 Candidate on-screen lines (each ≤ 6 words)

Word counts are in brackets. "Grounding" points to the evidence behind each beat.

**Beat 1: Hook (same circle; hard to make friends as an adult)**
- "Same faces. Same chats. Same circle." [6]
- "Friends used to just happen." [5]. Grounding: close friends are mostly made at work (54%) and school (47%), per S11.
- "When did making friends get hard?" [6]. Grounding: "It's hard to make friends as an adult" (user review).
- "Your circle could use new faces." [6]. Expands without rejecting current friends; grounded in the review "My existing friends still have the same schedule…".
- Stat variant: "Nearly half: three close friends, max." [6] (S9) or "Time with friends: down two-thirds." [5] (S3)

**Beat 2: Start with what matters to you**
- "Start with what matters to you." [6]
- "What matters most to you?" [5]. Works as the AI's first chat bubble.
- "Family? Faith? Adventure? You choose." [5]
- "No photos. Just your priorities." [5]
- "Your priorities, in your words." [5]. Natural-language chat mode.

**Beat 3: AI finds like-minded people** (don't put "like-minded" on screen)
- "Same priorities. New people." [4]. A callback to the hook's "Same circle".
- "People who value what you value." [6]
- "Family first? So are they." [5]. Makes the match reason visible (answers "blackbox").
- "AI finds them. Friendship's on you." [6]. AI as introducer, not friend.
- "Here's what you share." [4]. Pairs with shared-priority chips lighting up.

**Beat 4: Chat anonymously for 3 days**
- "No names. No photos. Just talk." [6]
- "Three days. Just words." [4]
- "Three days to really talk." [5]
- "Get to know them first." [5]
- "Know the person, not the profile." [6]. Note: structurally close to Timeleft's "personality, not selfies".

**Beat 5: Unlock only if you both say yes**
- "It takes two yeses." [4]
- "Your yes. Their yes. Unlocked." [5]. Animates well as two keys.
- "Both say yes? Profiles unlock." [5]
- "Not ready? Nothing's revealed." [4]. No-pressure plus safety. Accurate to the mechanic as briefed; confirm what happens if only one person taps.
- "Two yeses. Then the reveal." [5]

**Beat 6: Not dating, friends**
- "Friendship is the whole point." [5]. Pattern A, recommended.
- "Your next friend. That's it." [5]
- "Made for friends, not dates." [5]. Pattern D.
- "Not a date. A friend." [5]. Explicit; use only if the brief insists on naming dating.
- "Platonic, and proud of it." [5]. Playful, but "platonic" is Patook's word; test it.

**Beat 7: End tagline**
- "Same values. New friends." [4]. Bookends the hook. **Top pick.**
- "Start with what matters." [4]. Bookends beat 2.
- "Friends who get what matters." [5]
- "Grow your circle, on purpose." [5]
- "Talk first. Friends next." [4]. Caution: "conversation-first" is a dating-app trope (S'More, Friended).

### 4.4 Recommended through-line (one option)

> **Same faces. Same chats. Same circle.** → **What matters most to you?** → **Family first? So are they.** → **No names. No photos. Just talk.** → **It takes two yeses.** → **Friendship is the whole point.** → **Same values. New friends.**

This is seven lines, under 40 words total, so each line can hold long enough to read.

### 4.5 Clichés to avoid (with evidence of overuse)

| Avoid | Already used by |
|---|---|
| "Find your people" / "your people" | BFF H1 "Find your people" ([bumble.com/bff](https://bumble.com/bff)); "222 - find your people." ([App Store](https://apps.apple.com/us/app/id6450612690)); "Synchrony - Find Your People" ([App Store](https://apps.apple.com/us/app/id6755783702)); Kndrd; Wizz ("you're sure to find your people!", [App Store](https://apps.apple.com/us/app/id1452906710)); Wink "Meet Your People" |
| "Like-minded" | Timeleft (meta description), Boo ("like-minded souls"), Yubo, Meetup, Pie, Les Amis, Meet5, Wink Dating (all in §1 sources) |
| "No swiping" / "stop swiping" / "skip the swiping" | Timeleft ("No swiping."), 222 ("no swiping"), Wink Social ("no swiping."), Kndrd ("Stop swiping"), Introvrs ("skip the swiping") |
| "Turn strangers into friends" | Timeleft title and H1 |
| "Skip the small talk" | Timeleft App Store ("skip the small talk"); Wink Social ("hates small talk") |
| "Meaningful / genuine / real connections" | Bumble ("meaningful & lasting friendships"), Les Amis ("genuine connections"), Clyx ("Genuine Friends", "meaningful connections"), Slowly, Wink ("Start Something Real") |
| "Make friends IRL" | Timeleft and Kndrd app names; thirdspace "IRL sidequests" |
| "Find your tribe" | Yubo ("FIND YOUR TRIBE") |
| "Your village" | Peanut |
| "Tinder for friends" / "swipe right on friendship" | Hey! VINA and Patook press framing; Common Sense on Wink |
| "AI that gets you" / "AI friend" | Wink Social ("Your AI that actually gets you"); Wink Dating ("your digital friend"); Friend pendant backlash |
| "Intention, not attention" | Wink Social |
| "Serendipity" / "choose chance" | 222 |
| "Loneliness epidemic" | Clinical tone; conflicts with friendly and fun |
| Dating vocabulary: *match, spark, chemistry, crush, "It's a match", slide in(to DMs), swipe, blind date*, plus hearts and flames | Tinder, Facebook "Secret Crush", Wink ("Wink slides in") |

### 4.6 Visual and verbal "must not resemble" checklist

- No blurred or puzzle-piece faces (S'More, Jigsaw), and no blurred "who liked you" grids (the paywall pattern).
- No countdown timers on the chat (Tinder Blind Date). Show days passing instead.
- No swipe cards, hearts, flames or "match" overlays. Use keys, toggles, high-fives or "two yeses".
- No candlelit two-person table framing. Show friend activities (coffee, a walk, a gym class); this is my recommendation, not sourced.
- No "stranger" randomness cues (masks, hoodies, roulette spins), which evoke Omegle. Stress *matched by priorities*.
- The AI appears as a brief, friendly host in onboarding. It is never a companion and never the friend.

---

## 5. Source list

**Competitor pages (fetched 2026-10-07)**
- https://bumble.com/bff
- https://apps.apple.com/us/app/id1478573199
- https://timeleft.com/
- https://apps.apple.com/us/app/id6466442949
- https://222.place/
- https://apps.apple.com/us/app/id6450612690
- https://www.getpie.app/
- https://apps.apple.com/us/app/id1509667820
- https://apps.apple.com/us/app/id6465895427
- https://apps.apple.com/us/app/id1482681335
- https://www.winksocial.ai/
- https://www.commonsensemedia.org/app-reviews/wink-make-new-snap-friends
- https://boo.world/
- https://apps.apple.com/us/app/id1498407272
- https://apps.apple.com/us/app/id1038653883
- https://heyvina.com/
- https://www.peanut-app.io/
- https://apps.apple.com/us/app/id1178656034
- https://www.meetup.com/
- https://apps.apple.com/us/app/id375990038
- https://lunchclub.com/
- https://apps.apple.com/us/app/id1538817081
- https://www.introvrs.com/
- https://www.lesamis.cc/
- https://apps.apple.com/us/app/id1673732724
- https://apps.apple.com/us/app/id1199811908
- https://apps.apple.com/us/app/id6755783702
- https://apps.apple.com/us/app/id1550061986
- https://apps.apple.com/us/app/id1222980795
- https://apps.apple.com/us/app/id1671396601
- https://apps.apple.com/us/app/id6498315234
- https://apps.apple.com/us/app/id1144304244
- https://www.friended.com/
- https://apps.apple.com/us/app/id1452906710

**Press**
- https://techcrunch.com/2026/04/05/as-people-look-for-ways-to-make-new-friends-here-are-the-apps-promising-to-help/
- https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building/
- https://techcrunch.com/2025/03/04/andy-dunns-new-app-pie-uses-ai-to-help-you-make-friends
- https://techcrunch.com/2025/08/15/les-amis-the-european-app-helping-women-form-friendships-launches-in-new-york
- https://techcrunch.com/2017/07/27/patook-wants-to-be-tinder-for-platonic-friendships
- https://techcrunch.com/2016/01/26/hey-vina-is-a-tinder-for-girl-friends
- https://techcrunch.com/2022/05/25/gen-z-social-app-yubo-rolls-out-age-estimating-technology-to-better-identify-minors-using-its-service
- https://techcrunch.com/2024/10/24/ai-networking-startup-boardy-raises-3m-pre-seed
- https://techcrunch.com/2025/06/25/sitch-wants-to-fuse-human-personality-and-ai-for-matchmaking/
- https://techcrunch.com/2022/02/10/tinder-introduces-a-way-for-members-to-go-on-virtual-blind-dates
- https://techcrunch.com/2014/05/23/dating-app-coffee-meets-bagel-ditches-twilio-with-new-im-features
- https://www.founded.com/series-imessage-ai-social-network-yale-pre-seed/
- https://fortune.com/2025/11/11/lighter-fundraise-founders-fund-ribbit-capital-haun-ventures-robinhood-vladimir-novakovski/
- https://tribune.net.ph/2025/09/07/ai-powered-meet-up-apps-fight-loneliness
- https://www.globaldatinginsights.com/news/smore-introduces-unblur-meter-and-updated-home-screen/
- https://www.globaldatinginsights.com/news/new-dating-app-pickable-lets-women-browse-anonymously/
- https://www.globaldatinginsights.com/news/facebook-dating-launched-in-14-new-countries-and-introduces-secret-crush-feature/
- https://en.wikipedia.org/wiki/Jigsaw_(dating_app)
- https://www.businesswire.com/news/home/20251006536719/en/Three-Day-Rule-Launches-First-Ever-Matchmaker-Trained-AI-Matchmaking-App
- https://www.news4jax.com/business/2023/11/09/video-chat-service-omegle-shuts-down-following-years-of-user-abuse-claims/
- https://kvia.com/news/business-technology/cnn-business-consumer/2025/11/16/how-this-tiny-device-became-a-symbol-for-the-backlash-against-ai/

**User voice**
- App Store review feeds: `https://itunes.apple.com/us/rss/customerreviews/page=1/id=<1478573199 | 6466442949 | 6450612690 | 1498407272 | 6465895427 | 1509667820>/sortby=mostrecent/json`
- https://play.google.com/store/apps/details?id=com.bumblebff.app
- https://play.google.com/store/apps/details?id=com.timeleft.app
- https://www.resetera.com/threads/anyone-used-bumble-bff-or-something-similar-to-make-friends.708302/

**Statistics**
- https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf
- https://www.pbs.org/newshour/health/loneliness-poses-health-risks-as-deadly-as-smoking-u-s-surgeon-general-says
- https://www.who.int/news/item/30-06-2025-social-connection-linked-to-improved-heath-and-reduced-risk-of-early-death
- https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/
- https://www.pewresearch.org/short-reads/2023/10/12/what-does-friendship-look-like-in-america/
- https://www.pewresearch.org/social-trends/2025/01/16/men-women-and-social-connections/
- https://news.ku.edu/2018/03/06/study-reveals-number-hours-it-takes-make-friend
- https://news.gallup.com/opinion/gallup/512618/almost-quarter-world-feels-lonely.aspx
- https://news.gallup.com/poll/651881/daily-loneliness-afflicts-one-five.aspx
- https://bumble.com/the-buzz/bumble-for-friends-bff-data-friendship-loneliness-online
- https://datawrapper.dwcdn.net/UoK8b/6/
