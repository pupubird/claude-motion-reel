# Friend-app naming research

Checked 2026-10-07. Scope: the 20 candidate names, 10 names I'm proposing, and 54 more ideas of mine that I screened and dropped (Appendix A). That's 84 names in total.

The app: you set your life priorities in a chat with an AI, it matches you with like-minded people, you chat anonymously for 3 days, and you only see each other's profiles if both tap "unlock". It's for friends, not dating. The brand should be friendly, fun and global, with Southeast Asia (SEA) in mind.

## TL;DR

**Top 5 clearest (ranked):** 1. **Mindred** · 2. **Almost Friends** · 3. **Unlikely Friends** · 4. **Simpatico** · 5. **Whoa Same**. Reasons are in [Top 5](#top-5-ranked).

- **None of the 20 candidates is fully clear.** 18 are *avoid* and 2 are *caution* (Simpatico, Samesies).
- **Two candidates are already live friend-making products under that exact domain:**
  - **heysame.com** hosts an app called **"Same"** whose tagline is *"No dating, just friendships."*
  - **unmet.app** hosts **"Unmet"**: *"Lunch with 3 strangers from across your campus."*
- **Many candidates are already used by friend or dating apps:**
  - Friend apps: **Venn** ("Venn – Friends & Activities"), **Knock Knock** ("KnocKnock - Meet People & Chat", a Singapore company), **Alike**, **Bubbl**, **Akin** (launched 2026-09-16).
  - Dating apps: **Mutuals** ("Mutual LDS Dating", "Cerca Dating: Meet Mutuals"), **Overlap** (a Play app published by "Overlap Dating"), **Ditto** (AI dating, $9.2M raised).
- **Any "Same…" name now carries confusion risk.** Besides heysame.com, there's a Chinese social app called **same** (Shanghai Baozi, since 2012, claims 16M users), and the App Store has "SameHere Scale" and "SameSame: Stick with Friends".

## Method

| Check | Exactly what was run |
|---|---|
| App Store | `curl "https://itunes.apple.com/search?term=<name>&entity=software&limit=25&country=<cc>"`. US and SG for every name; MY, ID and PH as well for the shortlist. A result counts as near-name if its title contains the name or is at least 80% similar (difflib). Apps that are now delisted were confirmed with `itunes.apple.com/lookup?id=…`. |
| Google Play | `curl "https://play.google.com/store/search?q=<name>&c=apps&hl=en&gl=US"`, parsing the title and developer of each result. Specific apps were read from their `…/store/apps/details?id=<pkg>` pages. |
| Web | One web search per name for companies or products using it (sources linked per name). |
| .com | `whois -h whois.verisign-grs.com <name>.com`. "No match for domain" means unregistered. |
| .app | `whois <name>.app` only returns IANA's record for the TLD: IANA lists **no** whois server for .app (`refer:` is blank) and `whois.nic.google` does not resolve. So I used Google Registry's RDAP instead: `curl https://pubapi.registry.google/rdap/domain/<name>.app` (HTTP 200 = registered, 404 = "not found"). |
| What the domain shows | For the shortlist, `curl -L https://<domain>` to see whether a registered domain runs a live product, a for-sale page, or nothing. This step found the Same, Unmet, TwoKey, Mindkin and Daythree conflicts. |
| Language | Dictionary pages where I could get them (Wiktionary, tagalog.com, Malaysia's official DBP dictionary). Anything from my own knowledge is marked *(unverified)*. |

**Limits. Read these before relying on a verdict.**
- **Trademark registers were not searched** (USPTO, WIPO Global Brand Database, MyIPO, IPOS, DGIP, IPOPHL). An empty app store does not mean a name is free to use.
- **The session's web-search budget ran out near the end.** All 20 candidates and all 10 proposals got a web search. Some ideas in Appendix A only got store and domain checks; they're marked there.
- **App Store search is fuzzy.** "0 near-name" means nothing in the first 25 results contains or closely resembles the name.
- **"Registered" doesn't always mean unavailable.** Several .com domains are parked or listed for sale; this is noted per name.

## Master table: the 30 names

S = social, D = dating, F = friend-making. App Store counts are near-name hits in the first 25 results.

| # | Name | From | App Store | Google Play (US) | Web | .com | .app | Language | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Likewise | list | "Likewise: Movie, TV, Book Recs" (Likewise, Inc., 46,678 ratings) **S** | "Likewise: Entertainment Picks" **S** | Gates-backed social recommendations company, has a Wikipedia article | reg. 1998 | reg. 2018 | none found | **Avoid** |
| 2 | Same Here | list | "SameHere Scale" (share how you're doing with people) **S** | "Samehere" (SameHere Studios: "connect with people who think and feel like you do") **S/F** | #SameHere mental-health movement | reg. 1999 | reg. 2025-06 | none; "same" clash in Chinese | **Avoid** |
| 3 | Samesies | list | 0 (US/SG/MY/ID/PH) | 0 | Old student-built "meet people" app (dormant); 2023 "Samesies!" word game (iOS listing gone) | reg. 2009 (redirects to a fashion brand's page) | reg. 2023 (word-game site) | US slang, opaque to many non-native speakers | **Caution** |
| 4 | Akin | list | "Akin" (Kinspace Wellness, released **2026-09-16**: "discover events and people around you") **S/F**; Akin Gump; Akinator | Akinator, Avakin… | Kin (London family social network) | reg. 1997 | reg. 2024 | Tagalog *akin* = "mine/my" (neutral) | **Avoid** |
| 5 | Psst | list | 6 (e.g. "PSST Forum", Social Networking) | 12 (e.g. "Psst..!", "Pssst!") | Psst (anonymous chat platform); "Psst" university-crush app | reg. 1996 | reg. 2022 | secretive/crush feel; same hiss is used in catcalling *(unverified)* | **Avoid** |
| 6 | Venn | list | 13, incl. "Venn – Friends & Activities" **F**, "Venn Social: Find Your People" **S**, "Venn: Find where you belong" **S**, "Venn+" **S**, "Venn: AI Compatibility Test" **D** | 24, incl. "Venn - Love Compatibility Test" **D** | Venn, a neighbourhood social platform ($60M round, ~$100M total reported) | reg. 1996 | reg. 2018 | none found | **Avoid** |
| 7 | Hey Same | list | 0 (5 storefronts) | 0 | **heysame.com is a live friendship app called "Same"**; Chinese social app "same" | reg. 2026-01-28 (**live "Same" app**) | reg. **2026-10-04** | none found | **Avoid** |
| 8 | Popin | list | 14, incl. "Poppin - The Party Platform", "pop.in - it's game night!", "Popin Social", "Pop In Be Social" **S** | 13 | Popin' (India video commerce), pop.in (Smiletime), popIn (Japan) | reg. 2000 | reg. 2018 | none found | **Avoid** |
| 9 | Kinly | list | 9, incl. "Kinly." (LGBTQ+ social app for making friends, released 2026-05) **S/F**, "Kinly – Call & Connect" | 2 | Kinly (Amsterdam workplace-AV company); a Kinly "keep in touch" app on Product Hunt | reg. 2005 | reg. 2018 | none found | **Avoid** |
| 10 | Amity | list | 15, incl. "Amity" (Copiri) **S**, "Amity University", "beSocial at Amity Online" **S** | 21 | **Amity Social Cloud** (social-features toolkit for apps; offices incl. Bangkok); Amity University (India) | reg. 1995 | reg. 2022 | Indian users will read "Amity University" | **Avoid** |
| 11 | Mutuals | list | "Mutuals - Experiences & People" **S/F**; "Mutual LDS Dating" (39,821 ratings) **D**; "Cerca Dating: Meet Mutuals" (5,595) **D** | 10, incl. Mutual LDS Dating **D** | Cerca, Mutual (dating) | reg. 1997 | reg. 2021 | also means mutual funds | **Avoid** |
| 12 | Alike | list | 11, incl. "Alike Travel"; looks like **Likee** (562,608 ratings, Singapore company) | "Alike" (Alike Group), "ALIKE" (Algorythm Inc.) | Alike (dating & friendship app for Asian & Pacific Islander users), Alike Health, AlikeProff (friends) | reg. 1997 | reg. 2018 | none found | **Avoid** |
| 13 | Unmet | list | 0 exact ("uMeet" only) | 0 | **unmet.app is a live "lunch with 3 strangers" friend-making product** | reg. 2010 (no site) | reg. **2026-09-20** (**live Unmet**) | negative English sense ("unmet needs") | **Avoid** |
| 14 | Overlap | list | 8, incl. "LetsOverlap" | "Overlap" **by "Overlap Dating"** **D**; "Overlap – Travel Together" **F** | Overlap travel-friends app (acquired by Pangea, Nov 2025) | reg. 1996 | reg. 2019 | none found | **Avoid** |
| 15 | Knock Knock | list | "KnocKnock - Meet People & Chat" (METAZ Technology Pte. Ltd.) **S/F**; "Knock Knock - 5 Minute Dates" **D**; "KnocKnocK - Home Services" (Singapore) | 12 | Knockk (friends app, 400k members); Humin's Knock Knock (2015) | reg. 1996 | reg. 2024 | none found | **Avoid** |
| 16 | Simpatico | list | 0 exact ("Simpatia FM" only). The earlier "Simpatico – It's a small world" (id1274203099) is **delisted** | 0 | That old app matched nearby people on shared interests; simpatico.com is an IT firm | reg. 2003 (Simpatico Systems, managed IT) | reg. 2022 (blank page) | **positive**: English "compatible", Spanish/Italian "nice, likeable", Tagalog *simpatiko* "charming" | **Caution** |
| 17 | Kith | list | "Kith" (Kith Retail LLC, 38,951 ratings), "Kith Ivy" | "KITH", "Kith Rabbit" (people-network app) | Kith, the streetwear brand | reg. 2000 | reg. 2024 | archaic word ("kith and kin") | **Avoid** |
| 18 | Bubbl | list | "Bubbl - Life Offline" **S**, "Bubbl Widget" (812 ratings) **S/F**, K-pop "bubble" chat apps | "Bubbl Widget", "Bubbl OS" | Bubbl best-friends widget | reg. 2004 | reg. 2024 | looks like **Bumble** (dating) | **Avoid** |
| 19 | Wavelength | list | "Wavelength" party game (63,195 ratings); "Wavelength • Build & Find Love" **D** | "Wavelength" (game) | Wavelength group-chat app | reg. 1994 | reg. 2018 | none found | **Avoid** |
| 20 | Ditto | list | 18, incl. "Ditto - Your life in lists" **S**, "Ditto Live-Match&meet someone" **D**, "Ditto - Social AI Chat" **S**, "DITO" (Philippine telecom) | "Ditto. Live Video Connections" **D** | Ditto AI dating app ($9.2M) | reg. 1999 | reg. 2018 | Vietnamese *địt* is vulgar; DITO telecom in PH | **Avoid** |
| 21 | **Mindred** | proposed | 0 exact (only fuzzy "Mindr…" apps), 5 storefronts | 0 exact | nothing found | reg. 2009, **for sale** (BuyDomains) | **unregistered** | could be misread as "Mildred" | **Clear** |
| 22 | **Almost Friends** | proposed | 0 (5 storefronts) | 0 | a 2017 film | reg. 2010 (no site; HTTP 502) | **unregistered** | none found | **Clear** |
| 23 | **Unlikely Friends** | proposed | 0 (5 storefronts) | 0 | "Unlikely Friends" celebrity video podcast | reg. 2011 ("Ready for Development" lease/sale page) | **unregistered** | none found | **Clear** (minor caveat) |
| 24 | Whoa Same | proposed | 0 results (5 storefronts) | 0 | nothing for "Whoa Same", but the "Same" friendship app and Chinese "same" exist | **unregistered** | **unregistered** | echoes Malay/Indonesian *"Wah, sama!"* *(unverified)*; people may type "woah" | **Caution** |
| 25 | Sekepala | proposed | 0 | 0 | nothing found | **unregistered** | **unregistered** | colloquial Malay for "like-minded" *(unverified; not in DBP's dictionary)*; means nothing outside Malay | **Caution** |
| 26 | Samesake | proposed | 0 (5 storefronts) | 0 exact | nothing found | reg. 2011 (blank) | **unregistered** | *sake* = rice wine, an alcohol hint in Muslim-majority MY/ID; pun needs fluent English | **Caution** |
| 27 | Mindkin | proposed | 0 | 0 | **mindkin.app is a live self-therapy product called "Mindkin"** | reg. 2018 (no site) | reg. 2026-01 (**live Mindkin**) | none found | **Caution** |
| 28 | Preface | proposed | "Preface: Clinical AI" (Preface Health), "Preface.ai" (Preface Academy, education), "PreFace: Screen Time Control" (MY) | 0 exact | no social app called Preface | reg. 2001 | reg. 2026-03, **for sale** (Atom) | none found | **Caution** |
| 29 | Newfound | proposed | "Newfound News" | no friend apps (Newfoundland apps) | no friend app found | reg. 1997 (Newfound Woodworks, boat kits) | reg. 2026-06, **for sale** (Spaceship) | suggests Newfoundland | **Caution** |
| 30 | Palship | proposed | 0 | 0 | nothing; nearby names are shipping firms (Shippal, FreightPal) | reg. 2011 (blank) | **unregistered** | "ship" reads as fandom "shipping" (romantic pairing) or freight | **Caution** |

## Candidates in detail

### 1. Likewise: Avoid
- **App Store (US):**
  - "Likewise: Movie, TV, Book Recs" — Likewise, Inc. — Entertainment — 46,678 ratings — **social** (recommendations from friends). [link](https://apps.apple.com/us/app/likewise-movie-tv-book-recs/id1264195462)
  - Also "Likewise Dispensary", "Likewise Coffee" and "Do Likewise" (a Bible app). None are social.
- **Google Play:** "Likewise: Entertainment Picks" (Likewise, Inc.).
- **Web:** Likewise, Inc. came out of Bill Gates' private office, with Gates as sole investor, and is a social recommendations app. Sources: [Wikipedia](https://en.wikipedia.org/wiki/Likewise,_Inc.), [GeekWire](https://www.geekwire.com/2018/recommendations-app-likewise-spins-bill-gates-private-office-focused-picks-friends/), [Axios](https://www.axios.com/2018/10/03/bill-gates-is-backing-a-new-social-recommendation-engine).
- **Domains:** .com registered 1998-12-03 (GoDaddy); .app registered 2018-05-08.
- **Language:** none found.
- **Verdict: Avoid.** An established, well-funded *social* app already owns this name.

### 2. Same Here: Avoid
- **App Store:** "SameHere Scale" — 5-IN-5 Inc. — Health & Fitness — **social** (request and share how you're doing with friends and family; private chats). [link](https://apps.apple.com/us/app/samehere-scale/id1564682569)
- **Google Play:**
  - "Samehere" — SameHere Studios — a diary plus to-do app that also helps you *"connect with people who think and feel like you do"*. **Friend-making concept.** [link](https://play.google.com/store/apps/details?id=in.samehere.app)
  - "SameHere Scale" — #SameHere Global Mental Health Movement.
- **Web:** #SameHere is a global mental-health movement. Search also surfaced "SameSame: Stick with Friends" ([App Store](https://apps.apple.com/us/app/id6446126353)).
- **Domains:** .com registered 1999-12-29; .app registered 2025-06-05.
- **Language:** none found. Chinese-speaking users may already know the social app **same** ([App Store CN](https://apps.apple.com/cn/app/id531761928): Shanghai Baozi Information Technology, Social Networking, released 2012-06-10, updated 2026-09-02, describes itself as having 16 million users).
- **Verdict: Avoid.** Both a mental-health social app and a "people who think like you" app already use it.

### 3. Samesies: Caution
- **App Store:** 0 near-name hits in US, SG, MY, ID and PH. The 2023 word game "Samesies!" (id6464222616) now returns 0 from `lookup`.
- **Google Play:** 0 near-name in search. samesies.app links to a Play listing `com.blueblindbox.samesies` for the word game.
- **Web:** Samesies was a student-built app, *"A new way to meet people… in your community"* ([Macalester DevGarden](https://devgarden.macalester.edu/projects/18)). It's no longer in either store.
- **Domains:**
  - .com registered 2009; it redirects to `samelosangeles.com/pages/samesies`, a fashion brand's "SAMESIES" page.
  - .app registered 2023-08-31 (Squarespace); it is the "Samesies!" word game's developer site (BlueBlindBox).
- **Language:** American playground slang that many non-native English speakers in SEA won't recognise. Also sits next to the "Same" apps.
- **Verdict: Caution.** No live friend-app conflict, but both domains are held by others, the name was used before for "meet people", and the "Same" apps blur it.

### 4. Akin: Avoid
- **App Store:**
  - **"Akin"** — Kinspace Wellness Private Limited (India) — Lifestyle — **released 2026-09-16**. *"Akin is an invite-only community app for finding classes, workshops, and social gatherings near you, and for meeting the people who actually show up to them."* **Social/friends.** [link](https://apps.apple.com/us/app/akin/id6801451390)
  - Also: "Akin Events" (the Akin Gump law firm), "Akin Residences", and "Akinator" (423,542 ratings), which dominates search.
- **Google Play:** Akinator, Avakin Life, Akinda (none exact).
- **Web:** no friend app called "Akin"; [Kin](https://www.uktech.news/news/facebook-families-kin-pre-launch-europe-20210303) is a London family/friends social network.
- **Domains:** .com registered 1997; .app registered 2024-07-26.
- **Language:** Tagalog *akin* = "me/my/mine" ([tagalog.com](https://tagalog.com/dictionary/mine), [tagalognow](https://tagalognow.com/dictionary/akin)). Neutral. No issues found in Malay, Indonesian, Spanish, Hindi or Chinese.
- **Verdict: Avoid.** A social-discovery app called "Akin" launched on 2026-09-16.

### 5. Psst: Avoid
- **App Store:**
  - "PSST Forum" — Center for Artistic Activism — Social Networking.
  - "Psst!" and "Psst! NO" — KEY Experience Scandinavia — Lifestyle.
  - "Psst: Shared Lists & Tasks" — Productivity.
  - Also "Psst Cue Cards" and "Psst..!".
- **Google Play:** 12 near-name hits, including "Psst..!", "Pssst!" and "Psst: Shared Lists & Tasks".
- **Web:**
  - Psst, an anonymous chat platform where posts disappear after 48 hours ([hongkiat](https://www.hongkiat.com/blog/anonymous-mobile-chat-apps/)).
  - "Psst", a university **crush** app ([stateofmind13](https://stateofmind13.com/tag/psst-app/)).
- **Domains:** .com registered 1996 (Cloudflare); .app registered 2022.
- **Language:**
  - Universal "get your attention" sound, but it signals secrets, gossip and crushes.
  - In the Philippines the same hiss is also a common catcall *(unverified)*. Catcalling is punishable under the Safe Spaces Act, RA 11313 ([Senate PDF](https://legacy.senate.gov.ph/republic_acts/ra%2011313.pdf)).
- **Verdict: Avoid.** Crowded, and the tone leans secretive or crush-y, which suits dating more than friendship.

### 6. Venn: Avoid
- **App Store:** 13 near-name hits, including:
  - "Venn – Friends & Activities" — Friendr AS — Social Networking — **friends**. [link](https://apps.apple.com/us/app/venn-friends-activities/id1466472703)
  - "Venn Social: Find Your People" — Venn Network LLC — **social**
  - "Venn: Find where you belong" — Lex Social LLC — **social**
  - "Venn+" — Venn Corporation — **social**
  - "Venn - Human Connection"
  - "Life at Venn" (neighbourhood platform)
  - "Venn: AI Compatibility Test" (SG) — **dating-adjacent**
- **Google Play:** 24 near-name hits, including "Venn - Love Compatibility Test" (**dating**).
- **Web:**
  - Venn, a neighbourhood social platform (Tel Aviv/NYC) that raised a $60M round ([CRETech](https://discover.cretech.com/news/venn-a-social-networking-and-services-platform-for-hyperlocal-neighborhood-groups-raises-60m)); total funding reported at ~$100M ([TechCrunch](https://techcrunch.com/?p=2159986))
  - Norway's Venn friend app ([dealroom](https://app.dealroom.co/companies/venn_))
  - Venn Social
- **Domains:** .com registered 1996; .app registered 2018.
- **Language:** none found.
- **Verdict: Avoid.** At least five social or friend apps already use this name.

### 7. Hey Same: Avoid
- **App Store:** 0 near-name hits in all five storefronts.
- **Google Play:** 0.
- **Web/domain:** `https://heysame.com` is **live**:
  - `<title>Same</title>`, `<meta name="description" content="No dating, just friendships.">`
  - Pages include Activities, Events, Event Chat, Group Chat and Onboarding. It's a Base44-built web app with an EU-style Imprint page.
  - **This is a direct competitor using your exact positioning.**
- **Domains:**
  - .com registered **2026-01-28** (InterNetX GmbH); this is the live "Same" app.
  - .app registered **2026-10-04** (Cloudflare); it doesn't respond. *If you registered it, note that the .com belongs to the "Same" app.*
- **Language:** none found. Chinese social app "same" (see #2).
- **Verdict: Avoid.**

### 8. Popin: Avoid
- **App Store:** 14 near-name hits, including:
  - "Poppin - The Party Platform" (Poppin Technologies, Social Networking, 356 ratings)
  - "pop.in - it's game night!" (Smiletime, Social Networking)
  - "PopIn", "Pop In Be Social", "PopIn: Live Streams & Chat", "Popin Social" (all **social**)
- **Google Play:** 13 hits (Poppin, PopIn Events, Popin Designer…).
- **Web:** [Popin'](https://www.g2.com/products/popin-2026-01-16/reviews) (India video commerce), [pop.in](https://www.descubre.vc/popin) (group video and games), [popIn](https://www.ut-ec.co.jp/english/our_companies/popin/) (Japan).
- **Domains:** .com registered 2000; .app registered 2018.
- **Language:** none found.
- **Verdict: Avoid.**

### 9. Kinly: Avoid
- **App Store:** 9 near-name hits, including:
  - "Kinly." — WGF TECH s.r.o. — Social Networking — released 2026-05-18 — *"LGBTQ+ Social App & Community Space… make friends"* — **social/friends**. [link](https://apps.apple.com/us/app/kinly/id6744326607)
  - "Kinly – Call & Connect" (**friends** keep-in-touch)
  - "Kinly Family", "Kinly Time"
- **Google Play:** "Kinly.", "Kinlily".
- **Web:** [Kinly](https://www.kinly.com/employee-app) is a large Amsterdam-based workplace-AV company. Product Hunt also lists a [Kinly](https://www.producthunt.com/products/kinly/makers) "keep in touch" relationship app ("Don't let relationships drift when life gets busy").
- **Domains:** .com registered 2005; .app registered 2018.
- **Language:** none found.
- **Verdict: Avoid.**

### 10. Amity: Avoid
- **App Store:** 15 hits (US) and 20 (SG), including "Amity" (Copiri, **social**), "Amity University", "beSocial at Amity Online" (**social**).
- **Google Play:** 21 hits.
- **Web:** **Amity Social Cloud** sells plug-in social features (chat, feeds) to other apps, with offices including Bangkok, 250+ staff, active since 2012 ([wellfound](https://wellfound.com/company/amity-12), [nodeflair](https://nodeflair.com/companies/amity)). Also Amity University (India).
- **Domains:** .com registered 1995; .app registered 2022.
- **Language:** no negative meaning, but Hindi and Indian audiences will read it as the university.
- **Verdict: Avoid.**

### 11. Mutuals: Avoid
- **App Store:**
  - "Mutuals - Experiences & People" — Mutuals AI — Social Networking — **social/friends**
  - "Mutual LDS Dating" — 39,821 ratings — **dating**
  - "Cerca Dating: Meet Mutuals" — 5,595 ratings — **dating**
- **Google Play:** "Mutual LDS Dating" plus banks and funds.
- **Web:** [Mutuals event app](https://hunted.space/product/mutuals), [Cerca](https://apps.apple.com/us/app/cerca-meet-your-mutuals/id6738100998), [Mutual LDS dating](https://kealakai.byuh.edu/students-say-they-used-the-mutual-lds-dating-app-to-meet-people-during-the-pandemic).
- **Domains:** .com registered 1997; .app registered 2021.
- **Language:** also means mutual funds or insurers (several finance apps in SG results).
- **Verdict: Avoid.** The name is strongly associated with dating.

### 12. Alike: Avoid
- **App Store:** 11 near-name hits, including "Alike Travel" and celebrity look-alike apps. It sits next to **Likee** (Likeme Pte. Ltd., 562,608 ratings), which is very large in SEA.
- **Google Play:** "Alike" (Alike Group), "ALIKE" (Algorythm Inc.), "Match Alike".
- **Web:**
  - Alike, a **dating & friendship** app for Asian & Pacific Islander users ([YPulse](https://www.ypulse.com/newsfeed/2021/11/09/alike-is-a-new-dating-and-friendship-app-bringing-together-asians-and-pacific-islanders-to-find-community-and-belonging/))
  - Alike Health, which anonymously matches people with similar health profiles ([alike.health](https://alike.health/support))
  - AlikeProff, a friends app ([App Store](https://apps.apple.com/us/app/-/id6499347085))
- **Domains:** .com registered 1997; .app registered 2018.
- **Language:** none found.
- **Verdict: Avoid.**

### 13. Unmet: Avoid
- **App Store:** 0 exact hits ("uMeet" only), in all five storefronts.
- **Google Play:** 0.
- **Web/domain:** `https://unmet.app` is **live**:
  - `<title>Unmet</title>`, *"Lunch with 3 strangers from across your campus. Every week, one table of four… We email you the day, the place and one reason to talk."*
  - Available in English, Spanish and Catalan.
  - **A friend-making product using this exact name.**
- **Domains:**
  - .com registered 2010 (Alpine Domains, a domain investor); no site.
  - .app registered **2026-09-20** (Cloudflare); this is the live Unmet product.
- **Language:** the English sense is negative ("unmet needs", "unmet expectations"). No issues found in the other languages.
- **Verdict: Avoid.**

### 14. Overlap: Avoid
- **App Store:** "LetsOverlap" (Travel, **friends**), "Overlap: World Clock" (Bonobo Pte Ltd), "Overlap Sports", "Overlap Politics"…
- **Google Play:**
  - **"Overlap" published by "Overlap Dating"** (`com.kindredlabs.overlap`) — **dating**
  - "Overlap – Travel Together" — **friends**
- **Web:** Overlap travel-friends app ([PhocusWire](https://www.phocuswire.com/startup-stage-Overlap-helps-travelers-track-friends)), acquired by Pangea in Nov 2025 ([Signalbase](https://www.trysignalbase.com/news/acquisitions/overlap-app-acquired-by-pangea-acquisition)).
- **Domains:** .com registered 1996; .app registered 2019.
- **Language:** none found.
- **Verdict: Avoid.**

### 15. Knock Knock: Avoid
- **App Store:**
  - "KnocKnock - Meet People & Chat" — METAZ Technology Pte. Ltd. — Social Networking — **social/friends**
  - "Knock Knock - 5 Minute Dates" (SG) — **dating**
  - "KnocKnocK - Home Services" (Knocknock Technologies Asia, Singapore)
  - Joke and game apps
- **Google Play:** 12 hits.
- **Web:** Knockk, a friends app with 400k members ([App Store](https://apps.apple.com/us/app/-/id1511493936)); Humin's Knock Knock, 2015 ([Engadget](https://www.engadget.com/2015-08-19-knock-knock-app.html)).
- **Domains:** .com registered 1996; .app registered 2024.
- **Language:** none found.
- **Verdict: Avoid.**

### 16. Simpatico: Caution
- **App Store:** 0 exact hits ("Simpatia FM" only) in US, SG, MY, ID and PH. The 2017 app "Simpatico – It's a small world" (id1274203099) returns **0 from lookup**, so it's delisted.
- **Google Play:** 0.
- **Web:** that delisted app connected nearby people who shared hometown, school or hobbies ([appfollow](https://appfollow.io/ios/simpatico-its-a-small-world/1274203099?country=us)). That's the same idea as yours, but it's dormant.
- **Domains:**
  - .com registered 2003; it's **Simpatico Systems**, a managed-IT and cybersecurity firm.
  - .app registered 2022; the page is blank.
- **Language:** positive everywhere I could check:
  - English: *simpatico* = "having a compatible temperament" or "compatible" ([Wiktionary](https://en.wiktionary.org/wiki/simpatico))
  - Spanish and Italian: "nice, likeable"
  - Tagalog: *simpatiko* = charming, likeable ([tagalog.com](https://www.tagalog.com/dictionary/simpatika))
  - Malay/Indonesian: *simpati* = sympathy (positive)
- **Verdict: Caution.** The meaning fits perfectly, but both domains are taken and the word is common in business names. You'd need a domain with a modifier.

### 17. Kith: Avoid
- **App Store:** "Kith" (Kith Retail LLC, Shopping, 38,951 ratings), "Kith Ivy".
- **Google Play:** "KITH"; "Kith Rabbit" (Haah, Inc.), an app for mapping your personal network.
- **Web:** Kith, Ronnie Fieg's streetwear brand ([App Store](https://apps.apple.com/app/kith/id931358573)); Kith Rabbit ([appgoblin](https://appgoblin.info/apps/6787476031)).
- **Domains:** .com registered 2000; .app registered 2024.
- **Language:** archaic English ("kith and kin") that most non-native speakers won't know.
- **Verdict: Avoid.** A major fashion brand owns the name.

### 18. Bubbl: Avoid
- **App Store:** 24 near-name hits, including:
  - "Bubbl - Life Offline" — Bubbl, Inc. — Social Networking
  - "Bubbl Widget" — Social Networking — 812 ratings — best-friends feed (**friends**)
  - "bubble for JYPnation" — K-pop fan chat
  - many bubble-shooter games
- **Google Play:** "Bubbl Widget", "Bubbl OS"…
- **Web:** [Bubbl Widget](https://apps.apple.com/app/id6450650265).
- **Domains:** .com registered 2004; .app registered 2024.
- **Language:** none found, but it looks and sounds like **Bumble**, the dating app.
- **Verdict: Avoid.**

### 19. Wavelength: Avoid
- **App Store:** "Wavelength" party game (Palm Court, 63,195 ratings); "Wavelength • Build & Find Love" (**dating**).
- **Google Play:** "Wavelength" (Palm Court).
- **Web:** Wavelength, an end-to-end-encrypted group-chat app ([TechCrunch](https://techcrunch.com/2023/04/20/wavelength-is-a-new-app-trying-to-make-group-chat-suck-less)).
- **Domains:** .com registered 1994; .app registered 2018.
- **Language:** none found (it's long, at 10 letters).
- **Verdict: Avoid.**

### 20. Ditto: Avoid
- **App Store:** 18 near-name hits, including:
  - "Ditto - Your life in lists" (Social Networking)
  - "Ditto Live-Match&meet someone" (**dating**)
  - "Ditto: Fun Social Media", "Ditto - Social AI Chat" (**social**)
  - "**DITO**" (DITO Telecommunity Corporation, a Philippine telecom company)
- **Google Play:** "Ditto. Live Video Connections" (Iso Date Holdings, **dating**), "Ditto Live"…
- **Web:** Ditto AI dating app for college students, $9.2M raised ([Global Dating Insights](https://www.globaldatinginsights.com/featured/ai-powered-dating-app-ditto-gains-ground-on-california-campuses/), [Sovereign](https://www.sovereignmagazine.com/article/ditto-raises-9-2-million-to-replace-swiping-with-ai-planned-dates-for-college-students)).
- **Domains:** .com registered 1999; .app registered 2018.
- **Language:** Vietnamese *địt* is vulgar ("to fuck" in the North, "to fart" in the South; [Wiktionary](https://en.wiktionary.org/wiki/%C4%91%E1%BB%8Bt)). "DITO" is a Philippine telecom brand.
- **Verdict: Avoid.**

## My proposals in detail

### 21. Mindred: Clear
- **Idea:** "kindred minds". People who share your priorities. A coined word, so easier to own.
- **App Store:** no app named Mindred in US, SG, MY, ID or PH. The only fuzzy hits are four "Mindr…" productivity/affirmation apps.
- **Google Play:** no exact hit (fuzzy: "Mildred's", "Kindred…", "Mind Reader").
- **Web:** no company, app or product found.
- **Domains:**
  - **mindred.app unregistered** (RDAP 404).
  - mindred.com registered 2009 (Annulet LLC); it redirects to a **BuyDomains for-sale page**.
- **Language:** no meaning found in Malay, Indonesian, Spanish, Hindi or Chinese. Some may read it as "Mildred" or "mind-red".
- **Verdict: Clear.**

### 22. Almost Friends: Clear
- **Idea:** names the 3 anonymous days. You start as almost friends, and unlocking makes it real. "Friends" makes it clear this isn't dating.
- **App Store:** 0 in all five storefronts.
- **Google Play:** 0.
- **Web:** only the 2017 film *Almost Friends* ([listing](https://watch.mewayz.com/movie/436459)).
- **Domains:**
  - **almostfriends.app unregistered.**
  - almostfriends.com registered 2010 (Sea Wasp LLC); no site (HTTP 502).
- **Language:** plain English. No issues found.
- **Verdict: Clear.** It's descriptive, so the trademark would be weaker than a coined word.

### 23. Unlikely Friends: Clear (minor caveat)
- **Idea:** friends from outside your circle; people you'd never otherwise meet.
- **App Store:** 0 in all five storefronts.
- **Google Play:** 0.
- **Web:** "Unlikely Friends", a celebrity video podcast (Emma Bunton, Jade Jones, Leigh & Jill Francis) on Global ([global.com](https://global.com/emma-bunton-leigh-francis-jade-jones-and-jill-francis-team-up-for-an-open-honest-and-occasionally-outrageous-video-podcast-unlikely-friends-from-global-studios/)). That's media, not apps.
- **Domains:**
  - **unlikelyfriends.app unregistered.**
  - unlikelyfriends.com registered 2011; it shows a "Ready for Development" lease/sale page.
- **Language:** none found. It's 15 letters.
- **Verdict: Clear.** Mention the podcast to your trademark counsel.

### 24. Whoa Same: Caution
- **Idea:** the "whoa, same!" moment when a stranger shares your priorities. Playful and nothing like dating. Malay/Indonesian speakers would hear *"Wah, sama!"* *(unverified)*.
- **App Store:** 0 results in all five storefronts.
- **Google Play:** 0.
- **Web:** nothing for "Whoa Same". **But** the friendship app "Same" at heysame.com ("No dating, just friendships.") and the Chinese social app "same" share the main word.
- **Domains:** **whoasame.com is unregistered** (`No match for domain "WHOASAME.COM"`), and **whoasame.app is unregistered**. It's the only name checked with both free.
- **Language:** people will mistype it as "woah"; buy woahsame too.
- **Verdict: Caution.** It's free to register, but it's likely to be confused with "Same" in the same niche.

### 25. Sekepala: Caution
- **Idea:** colloquial Malay for like-minded people, as in *kawan sekepala* *(unverified)*.
- **Stores:** 0 hits anywhere.
- **Web:** no uses found.
- **Domains:** **.com and .app are both unregistered.**
- **Language:** not in DBP's standard dictionary (PRPM search returns *"Carian kata tiada di dalam kamus terkini"*, "not in the current dictionary"). Indonesians may read it literally as "one head". It means nothing outside Malay.
- **Verdict: Caution.** It's a good SEA in-joke, maybe for a feature or local campaign, but not the global name.

### 26. Samesake: Caution
- **Idea:** a pun on "namesake": people who are the same at heart.
- **Stores:** 0 exact hits in all five storefronts. Play fuzzy hits: "SameSame" and "Samesee" (couples).
- **Web:** nothing found.
- **Domains:**
  - **samesake.app unregistered.**
  - samesake.com registered 2011; blank page.
- **Language:** *sake* reads as Japanese rice wine, an alcohol hint in Muslim-majority Malaysia and Indonesia. The pun needs fluent English. It also sits near the "Same" apps.
- **Verdict: Caution.**

### 27. Mindkin: Caution
- **Idea:** kin of the mind.
- **Stores:** 0 hits anywhere.
- **Web:** nothing in search, **but** `https://mindkin.app` is live as **"Mindkin — Self-led parts work for personal development"**, a self-therapy practice based on Internal Family Systems.
- **Domains:**
  - mindkin.com registered 2018; no site.
  - mindkin.app registered 2026-01-14 (Porkbun); this is the live product.
- **Language:** none found.
- **Verdict: Caution.** A different category, but the exact name is in use by a consumer wellness product.

### 28. Preface: Caution
- **Idea:** "pre-face": the conversation comes before you see each other's faces. Also, a preface is how a story begins.
- **App Store:**
  - "Preface: Clinical AI" (Preface Health, Medical)
  - "Preface.ai" (Preface Academy, Education)
  - "PreFace: Screen Time Control" (MY)
  - Search is also crowded with the very large face-swap app "Reface".
- **Google Play:** no exact hit.
- **Web:** no social app called Preface.
- **Domains:**
  - preface.com registered 2001.
  - preface.app registered 2026-03-28; it redirects to an Atom marketplace **for-sale** page.
- **Language:** none found.
- **Verdict: Caution.** The pun is clever, but the exact name is already used by health and education apps.

### 29. Newfound: Caution
- **Idea:** newfound friends.
- **App Store:** "Newfound News" only.
- **Google Play:** Newfoundland apps; nothing about friends.
- **Web:** no friend app found.
- **Domains:**
  - newfound.com is **Newfound Woodworks** (cedar-strip boat kits).
  - newfound.app registered 2026-06-05; it's **for sale** on Spaceship.
- **Language:** none found. It suggests Newfoundland.
- **Verdict: Caution.** The meaning is warm, but the domains are taken and the name is easy to read past.

### 30. Palship: Caution
- **Idea:** pal + -ship, as in friendship.
- **Stores:** 0 hits.
- **Web:** nothing called Palship; nearby names are shipping companies (Shippal, FreightPal).
- **Domains:**
  - **palship.app unregistered.**
  - palship.com registered 2011; blank page.
- **Language:** "ship" can read as freight, or as fandom "shipping" (pairing people romantically).
- **Verdict: Caution.** It's clear, but a weaker brand.

## Top 5 (ranked)

Ranked on how clear they are of conflicts first, then fit with the brief (friendly, global, not dating, SEA-safe).

1. **Mindred**
   - The cleanest record of all 30: no app, company or media use found anywhere.
   - One coined word, so the strongest trademark candidate.
   - .app is free and .com is listed for sale.
   - "Kindred minds" matches priority-based matching. It needs a one-line explainer.
2. **Almost Friends**
   - Zero store hits and .app is free.
   - The name tells the product story (3 anonymous days, then unlock), and "Friends" rules out any dating reading.
   - Weaker as a trademark because it's descriptive. Its only namesake is a 2017 film.
3. **Unlikely Friends**
   - Zero store hits, .app is free, and the .com is offered for lease or sale.
   - It sells the "outside your social circle" promise better than any other name here.
   - Caveats: a UK celebrity podcast with the same name, and 15 letters.
4. **Simpatico** (from your list)
   - Store-clear today; the earlier 2017 app is delisted.
   - Positive meaning in English, Spanish, Italian and Tagalog ("compatible", "likeable"), which helps in the Philippines.
   - Both domains are taken (an IT firm owns the .com), so you'd need something like getsimpatico.app.
5. **Whoa Same**
   - The only name with **both .com and .app unregistered**, zero store hits, and the most playful fit.
   - Ranked last only because "Same" (a friendship web app) and Chinese "same" share its main word. Get a trademark opinion before committing.

Not top 5:
- **Sekepala** is fully clear but means nothing outside Malay.
- **Samesake** has the alcohol reading.
- **Mindkin** and **Preface** are already used by live products with the exact name.

## Appendix A: other ideas I screened and dropped

These got the App Store (US+SG), Google Play and domain checks. Most were dropped on store evidence alone, so a web search wasn't needed. "Web" is noted where one was done.

| Name | Why it was dropped (evidence) |
|---|---|
| Day Three | `daythree.com` is **"© 2026 Daythree Digital Berhad"**, a Malaysian customer-experience firm serving APAC; App Store "Day Three — Bible & Chat"; .app registered 2026-07. (web: no friend app) |
| Twokey | `twokey.app` is **"TwoKey — a private messenger for people you've met in person"** (I Totally Need That LLC); .com registered 2006. (web: nothing else) |
| Friendish | 2016 Orlando startup Friendish, interest-based friend-finding with "faceless swiping" ([gust](https://gust.com/companies/friendish), [Indiegogo](https://indiegogo.com/projects/friendish)) |
| Unstranger | App Store "Unstranger" (Lifestyle); Play "Unstranger: Icebreaker AI"; domains registered 2025/2026 |
| Kinsome | Kinsome, a kids–grandparents connection app, $1.2M pre-seed ([TechCrunch](https://techcrunch.com/2024/09/05/kinsome-new-communication-app-for-kids-and-grandparents)) |
| Sameish | App Store "Sameish" (utility); .com registered 2024-12, .app 2026-07; also the "Same" clash (web: nothing else) |
| Keypal | "KeyPal - Smart Key Hub" (Australia); KeyPal crypto hardware wallet (web) |
| Mindfirst | MindFirst CBT app; Mindfirst therapy platform (Portugal); MindFirst Health & Fitness (web) |
| Samewave | Play "SameWave"; App Store "SameWave-Chat" (Social Networking) |
| Same Same | "SameSame: Stick with Friends" (Sodality Technologies) |
| Jinx | Play "JINX – Pick Someone" (Bondit Community, social) |
| Kinda | "Kinda - AI Character Chat" (both stores) |
| Liken | "Liken: Image Remix"; one letter away from Likee |
| Outer Circle | App Store "Outer Circle" (Social Networking); Play "OuterCircle" |
| Ayo | 15 App Store hits, incl. "AYO: Games & Voice Rooms" and Indonesia's "AYO: Super Sport Community App" |
| Jom | crowded with Malaysian apps (JomCharge, JomParking, HeyJom…) |
| Kita | "Kita Chat" (Social Networking, Indonesia), "KITA" (Malaysia), Kitabisa |
| Kawan | Play "Kawan - Concert & Rave Buddies"; App Store "Kawan" (Social Networking) |
| Kenalan | "Kenalan.app" (PT Frisidea Tech Indonesia, Social Networking: friends and dating); Indonesian dating apps use the word |
| Amiko | "Amiko: Chat to Learn Languages", "Amiko AI" (chat) |
| Hullo | "Hullo - Dating App, Friends" (Hullo Dating Co.) |
| Platonic | Play "Platonic - make local friends" |
| Befriend | "BeFriend - Make new friends" (Orbitech Pte. Ltd., 36,816 ratings) |
| Chummy | Play "Chummy - Find Real Friends" |
| Likemind | "LikeMind. Match values." (Social Networking); LikeMinds |
| Kindred | 25 hits, incl. "Kindred - Dating", "Kindred Home Swapping" |
| Bondfire | "Bondfire: Shared Reflections", "Bondfire Society" (Social Networking) |
| Vibe Check | 28 hits, incl. "Vibe Check - AI Social App", "VibeCheck: Love & Dating Help" |
| Lowkey | "Lowkey – Group chat" (Key Revolution) |
| Heyo | "Heyo Chat-Party games", "Heyo- Chat & Message" |
| Tomo | "Tomo: Anime AI Friend", TomoCredit, 16 hits |
| Nakama | crowded (anime/card-game apps) |
| Pally | Pallyy, Pally Companion, "Pally - Party Games" |
| Peekaboo | children's games; "Peekaboo - Random Photo Dump" (Social) |
| Unmask | caller-ID / people-search apps; "Unmask: Couples & Friends Game" |
| Unveil | "Unveil: Relationship Journal", 14 hits |
| Faceup | "FaceUp: Safe reporting" (FaceUp Technology) |
| Same Page | "Samepage: Team Collaboration" (Paylocity), "SamePageApp" (Social) |
| Revelry | Revelry events/party apps |
| Clink | 26 hits (fintech, keyboards, "Clink - Your Social Sommelier") |
| Compadre | coaching app, restaurants, radio |
| Ohai | "Ohai.ai: Household Assistant" |
| Thinkalike | "ThinkAlike - Word Association" game |
| Twinning | weak; "Twinning Padel" |
| Common Thread | "Common Thread Game", "Common Threads Market" |
| Kinlo / Kinfold / Kinlock | Kinlo apps; Kinfolk apps and "Kinfold: Passport & ID Vault"; "KinLocker" |
| Thrice / Trust Fall / Keymates / Prefriend | weak names or near-name apps ("Thrice: Recipes", "TrustFall App", "KeyMate", "BeFriend") |
| Samebrain / Samasama | **0 store hits** (samebrain.app unregistered; samasama.app registered 2026-04). **No web check (search budget ran out).** "Samebrain" is worth a web search if you like it. |

## Appendix B: key raw evidence

```text
$ whois -h whois.verisign-grs.com whoasame.com
No match for domain "WHOASAME.COM".

$ curl -s -o /dev/null -w "%{http_code}" https://pubapi.registry.google/rdap/domain/whoasame.app
404      # same 404 for mindred.app, almostfriends.app, unlikelyfriends.app, sekepala.app, samesake.app, palship.app

$ whois likewise.app        # IANA has no whois server for .app, hence RDAP
refer:
domain:       APP
organisation: Charleston Road Registry Inc.

$ curl -sL https://heysame.com   -> <title>Same</title> <meta name="description" content="No dating, just friendships.">
$ curl -sL https://unmet.app     -> <title>Unmet</title> "Lunch with 3 strangers from across your campus."
$ curl -sL https://twokey.app    -> "TwoKey — a private messenger for people you've met in person"
$ curl -sL https://mindkin.app   -> "Self-led parts work for personal development – Mindkin"
$ curl -sL https://daythree.com  -> "© 2026 Daythree Digital Berhad. All Rights Reserved"
$ curl -sL https://mindred.com   -> redirects to www.buydomains.com/lander/mindred.com
$ curl -sL https://unlikelyfriends.com -> "Unlikelyfriends.com - Ready for Development"

$ curl -s "https://itunes.apple.com/lookup?id=1274203099&country=us"  -> resultCount=0  (old Simpatico app delisted)
$ curl -s "https://itunes.apple.com/lookup?id=6801451390&country=us"  -> "Akin | KINSPACE WELLNESS PRIVATE LIMITED | Lifestyle | released 2026-09-16"
$ curl -s "https://itunes.apple.com/lookup?id=531761928&country=cn"   -> "same-再小的情绪都有人共鸣 | Shanghai Baozi Information Technology Co., Ltd. | Social Networking | released 2012-06-10"
```

## Next steps

1. **Trademark search** on the top 5 in classes 9 (apps), 42 (software services) and 45 (social networking): USPTO, WIPO Global Brand Database, MyIPO (Malaysia), IPOS (Singapore), DGIP (Indonesia), IPOPHL (Philippines).
2. **Register the free .app domains now**, since they're cheap: mindred.app, almostfriends.app, unlikelyfriends.app, whoasame.app (plus whoasame.com). Ask BuyDomains for a price on mindred.com.
3. **Native-speaker check** of the top 5 in Malay, Indonesian, Mandarin/Cantonese/Hokkien, Spanish, Hindi, Tagalog and Vietnamese. The language notes above marked *(unverified)* come from my own knowledge.
4. **Check social handles** (Instagram, TikTok, X) for the top 5.
