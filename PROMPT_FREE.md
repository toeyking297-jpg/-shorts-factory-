# PROMPT_FREE.md: free mode (no Claude Code needed)

How to use (ภาษาไทยอยู่ใน SETUP_TH.md):
1. Open a free AI chat that can search the web (Gemini at gemini.google.com is best for fact-checking; ChatGPT or Claude free also work).
2. Copy EVERYTHING between the two lines below, paste it into the chat, and change the last line (TOPIC).
3. Copy the JSON the AI sends back into `inbox.json` (open with Notepad, paste, save).
4. Double-click `make_clip.bat`. The finished video appears in `final\`.

------------------------------------------------------------ COPY FROM HERE
You are the head writer of a faceless English YouTube Shorts channel (HIDDEN ATLAS: strange places, weird borders,
extreme locations, why countries are rich or poor - always explaining WHY). Audience: English speakers 18-45, US first.
Search the web for the facts. Write ONE Short as a JSON script for my video engine, following these rules:

FACTS REGISTRY (mandatory, one source of truth)
- Put every fact the video states in "facts": [{"id":"f1","claim":"one sentence","value":"1,670 miles",
  "source":"https://exact-url","source_name":"NOAA"}]. Use ONLY facts supported by the RESEARCH, and only source
  URLs listed under ALLOWED SOURCES. At least 2 different reliable sources per video.
- Every number shown on screen (overlay, map distance label, headline, cover text, title) must be the "value" of a
  fact, written the same way everywhere. The narration says the same number (spelled for the ear is fine).
- Precision beats drama. Keep qualifiers that make a claim true ("about", "when it passes overhead", "people on
  land"). Never say "always", "only", "first", "closest" unless the source says exactly that. Myths count as wrong.
- Never name an organisation as the source of a number unless that source actually says it.

AUDIENCE: AMERICANS FIRST (highest-paying viewers)
- American English spelling and idioms. Imperial units first: "about 1,670 miles". Metric only if it helps.
- Make sizes and distances relatable to Americans: "bigger than Texas", "New York to LA". Never insult any country.

STORY (one question, answered)
- ONE main question per video, raised by the hook and clearly answered before the end. Cut side stories (save them
  for another Short).
- Spine: hook (the surprising claim) -> where/what (1-2 scenes) -> escalation (2-4 scenes: numbers, comparisons,
  twist) -> the WHY -> payoff that answers the hook.
- Scene 1 = hook, under 8 words. Never start with "Did you know", "So", "And", "Hi".
- Write for the ear: short sentences, contractions, no parentheses. One scene = 6-14 words (2-5 seconds).
- 90-140 words total (35-50 seconds). NO outro, no "subscribe", no "comment".

FORMAT (follow the FORMAT given with the topic)
- "shock_fact": one surprising true fact, then why it is true.
- "myth_vs_fact": open with the popular belief, then reveal what is actually true.
- "three_things": three escalating surprising facts about one subject (list overlay).
- "versus": compare two places/things (compare overlay or a map "compare"); the twist is who wins and why.
- "map_explains": the map explains why a place is the way it is.

LOOP (preferred, never at the cost of good English)
- If it reads naturally, the LAST scene is a 2-6 word unfinished phrase (no final . ! ?) so "<last scene> <scene 1>"
  is ONE grammatical, natural sentence. Example: last "And that's why" + first "this town bans dying."
  Its visual is {"type": "loop"}.
- If no natural bridge exists, set "loop": false and end with a normal payoff sentence and a normal visual.

ON-SCREEN TEXT (typography only: the channel never uses boxes, cards or panels)
- Headlines and labels are 2-5 words. NEVER put a narration sentence on screen (captions already show it).
- One overlay per scene at most, and at most one number per scene.
- No overlay on map scenes: a map has its own "headline" (2-5 words) and "kicker" (small line above).

VISUALS
- EVERY scene shows real moving pictures: stock footage, a real photo, or the animated globe map.
  NEVER use full-screen graphic cards ("type":"graphic" does not exist).
- Scene 1 must be instantly understandable motion: dramatic footage of the subject or the globe diving in.
- At least half of the scenes are footage/photos; never more than 2 map scenes in a row.
- Stock footage: {"type":"footage","query":"what is SEEN","alt":["broader backup words"],
  "must_show":["open ocean"],"must_not_show":["beach","coastline","people"]}
  must_show / must_not_show = what the picture MUST and MUST NOT contain so it does not contradict the narration
  (open ocean -> no beach; a desert town -> no snow; a space station -> the whole station, not just a panel).
- Photo of a specific landmark: {"type":"image","query":"exact landmark name","source":"wikimedia"}
- Stock sites contain staged and AI-generated people. Prefer places, objects, nature, vehicles.
- Space topics: add "source":"nasa".
- GLOBE MAP (the channel's signature, 1-3 per video). Coordinates are [longitude, latitude], accurate:
  {"type":"map","pins":[{"label":"Point Nemo","lon":-123.39,"lat":-48.88}],"headline":"LONELIEST SPOT ON EARTH",
   "kicker":"THE MIDDLE OF NOWHERE","zoom":"in"}
  countries: "focus":["Singapore"] (highlighted), "context":["Malaysia"] (outlined)
  route: "route":[[56.3,26.5],[80.5,5.9],[103.8,1.2]],"route_from":"Middle East","route_to":"China","vehicle":"ship"|"plane"
  distance: "distance":{"from":[-123.39,-48.88],"to":[-124.79,-24.68],"label":"1,670 MI","fact":"f1"}
  ring of real radius: "ring":{"center":[-123.39,-48.88],"radius_km":2688}
  true-size comparison: "compare":{"shape":"USA48","onto":"Australia","label":"USA (LOWER 48)"}
  zoom: "in" (camera dives from space, best for scene 1), "out" (pull back to show distance), "none".
- OVERLAYS on footage (typography, no boxes):
  headline:  {"type":"label","text":"2-5 WORDS","kicker":"optional small line","pos":"top"}
  number:    {"type":"stat","value":"1,670 mi","label":"to the nearest land","source":"NOAA","fact":"f1"}
  compare:   {"type":"compare","title":"GDP per person","items":[{"label":"Singapore","value":90700,"display":"$90,700"},
             {"label":"USA","value":85800,"display":"$85,800"}],"source":"World Bank","fact":"f2"}
  icons:     {"type":"icons","title":"NO OIL. NO WATER.","items":[{"icon":"oil-well","label":"OIL","state":"no"}]}
  also: list (max 3 short items), timeline (max 3 items), location {"place","region"}.
  Every stat/compare carries "source" (short name) and "fact" (id in facts).
  Allowed icon names: anchor, apple-whole, arrow-trend-down, arrow-trend-up, baby, ban, battery-full, bed, beer-mug-empty, biohazard, bolt, book, bottle-water, bowl-rice, box, bridge, bug, building-columns, bus, calendar, camera, campground, car, cat, chart-column, chart-line, check, church, city, clock, cloud-rain, coins, compass, cow, crosshairs, crow, crown, dna, dog, dove, dragon, droplet, dungeon, earth-africa, earth-americas, earth-asia, earth-europe, earth-oceania, eye, faucet-drip, film, fire, fish, flag, flask, gas-pump, gavel, gem, globe, gopuram, graduation-cap, hand-holding-dollar, handcuffs, heart-pulse, hippo, horse, hospital, hourglass, house, hurricane, icicles, id-card, igloo, industry, key, landmark, language, laptop, leaf, lemon, location-dot, lock, map, map-location-dot, microphone, microscope, mobile-screen, money-bill, monument, moon, mosque, mountain, mountain-city, mountain-sun, mug-hot, music, oil-well, otter, passport, people-group, pepper-hot, person, piggy-bank, pizza-slice, plane, plug, question, radiation, recycle, road, robot, rocket, route, ruler-horizontal, ruler-vertical, sack-dollar, satellite, scale-balanced, seedling, shield-halved, ship, shop, skull, skull-crossbones, smog, snowflake, solar-panel, spider, stamp, stopwatch, sun, syringe, temperature-high, temperature-low, tent, ticket, torii-gate, tornado, tower-observation, tractor, train, trash, tree, tree-city, truck, umbrella, unlock, users, utensils, vihara, virus, volcano, water, weight-hanging, wheat-awn, wifi, wind, wine-bottle, wrench, xmark

META (upload kit)
- "title": 40-70 characters, curiosity + names the subject, not ALL CAPS, pays off in the video.
- "title_options": 3 different titles. "description": 1-2 sentences. "hashtags": 3-5, first is "shorts".
- "tags": 6-10. "cover_text": 2-5 words. "pinned_comment": one short question that invites viewers to answer.

Return ONLY the JSON (no explanation), exactly in this format (a complete, correct example):
{
  "id": "EP000",
  "topic": "Why Singapore is so rich",
  "format": "map_explains",
  "loop": true,
  "facts": [
    {
      "id": "f1",
      "claim": "Singapore's GDP per person was about $90,700 in 2024.",
      "value": "$90,700",
      "source": "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=SG-US",
      "source_name": "World Bank"
    },
    {
      "id": "f2",
      "claim": "US GDP per person was about $85,800 in 2024.",
      "value": "$85,800",
      "source": "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=SG-US",
      "source_name": "World Bank"
    },
    {
      "id": "f3",
      "claim": "Singapore separated from Malaysia and became independent in 1965.",
      "value": "1965",
      "source": "https://en.wikipedia.org/wiki/History_of_Singapore",
      "source_name": "Wikipedia"
    },
    {
      "id": "f4",
      "claim": "The Strait of Malacca is one of the busiest shipping lanes, linking the Indian Ocean and the Pacific.",
      "value": "",
      "source": "https://en.wikipedia.org/wiki/Strait_of_Malacca",
      "source_name": "Wikipedia"
    }
  ],
  "sources": [
    "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=SG-US",
    "https://en.wikipedia.org/wiki/History_of_Singapore",
    "https://en.wikipedia.org/wiki/Strait_of_Malacca"
  ],
  "meta": {
    "title": "How a Tiny Island With No Resources Got Richer Than the US",
    "description": "Singapore has no oil, almost no farmland and imports much of its water. Its location on the Strait of Malacca changed everything.",
    "hashtags": [
      "shorts",
      "geography",
      "singapore",
      "economy",
      "maps"
    ],
    "tags": [
      "Singapore",
      "Strait of Malacca",
      "geography",
      "economy",
      "why is singapore rich",
      "maps"
    ],
    "cover_text": "No oil. Still rich?",
    "title_options": [
      "How a Tiny Island With No Resources Got Richer Than the US",
      "Singapore Has No Oil. So Why Is It So Rich?",
      "The Shipping Lane That Made Singapore Rich"
    ],
    "pinned_comment": "Which country do you think is the next Singapore?"
  },
  "scenes": [
    {
      "text": "No oil. No farms. Not even enough water.",
      "visual": {
        "type": "map",
        "focus": [
          "Singapore"
        ],
        "pins": [
          {
            "place": "Singapore"
          }
        ],
        "headline": "NO OIL. NO WATER.",
        "kicker": "A TINY ISLAND",
        "zoom": "in"
      }
    },
    {
      "text": "Yet Singapore is one of the richest countries on Earth.",
      "visual": {
        "type": "footage",
        "query": "singapore skyline aerial",
        "alt": [
          "modern city skyline"
        ],
        "must_show": [
          "modern skyline"
        ],
        "must_not_show": [
          "people close-up",
          "text"
        ]
      },
      "overlay": {
        "type": "stat",
        "value": "$90,700",
        "label": "GDP per person",
        "source": "World Bank",
        "fact": "f1"
      }
    },
    {
      "text": "In 1965, it split from Malaysia and was suddenly on its own.",
      "visual": {
        "type": "map",
        "focus": [
          "Singapore"
        ],
        "context": [
          "Malaysia"
        ],
        "pins": [
          {
            "place": "Singapore"
          }
        ],
        "headline": "1965",
        "kicker": "ON ITS OWN",
        "zoom": "none"
      }
    },
    {
      "text": "Its secret is location.",
      "visual": {
        "type": "footage",
        "query": "aerial view container port ships",
        "alt": [
          "container terminal cranes"
        ],
        "must_show": [
          "container ships or port cranes"
        ],
        "must_not_show": [
          "people"
        ]
      }
    },
    {
      "text": "A huge share of ships between the Middle East and East Asia sail right past it.",
      "visual": {
        "type": "map",
        "route": [
          [
            56.3,
            26.5
          ],
          [
            72.8,
            19.0
          ],
          [
            80.5,
            5.9
          ],
          [
            95.3,
            5.8
          ],
          [
            103.8,
            1.2
          ],
          [
            110.0,
            5.0
          ],
          [
            121.5,
            31.2
          ]
        ],
        "route_from": "Middle East",
        "route_to": "China",
        "vehicle": "ship",
        "pins": [
          {
            "label": "Strait of Malacca",
            "lon": 100.5,
            "lat": 3.0
          }
        ],
        "headline": "THE WORLD'S SHORTCUT",
        "zoom": "none"
      }
    },
    {
      "text": "So it became the world's pit stop.",
      "visual": {
        "type": "footage",
        "query": "container ship docked port cranes",
        "alt": [
          "cargo ship harbor"
        ],
        "must_show": [
          "ship at a port"
        ]
      },
      "overlay": {
        "type": "icons",
        "title": "THE WORLD'S PIT STOP",
        "items": [
          {
            "icon": "gas-pump",
            "label": "REFUEL"
          },
          {
            "icon": "wrench",
            "label": "REPAIR"
          },
          {
            "icon": "box",
            "label": "RELOAD"
          }
        ],
        "pos": "top"
      }
    },
    {
      "text": "Then it added banks, low taxes, and famously strict rules.",
      "visual": {
        "type": "footage",
        "query": "singapore financial district skyline",
        "alt": [
          "modern city skyscrapers"
        ]
      },
      "overlay": {
        "type": "icons",
        "title": "THE SMART MOVE",
        "items": [
          {
            "icon": "building-columns",
            "label": "BANKS"
          },
          {
            "icon": "arrow-trend-down",
            "label": "LOW TAXES"
          },
          {
            "icon": "scale-balanced",
            "label": "STRICT RULES"
          }
        ],
        "pos": "top"
      }
    },
    {
      "text": "Money from all over the world followed.",
      "visual": {
        "type": "footage",
        "query": "city skyline at night lights",
        "alt": [
          "night city skyline"
        ]
      }
    },
    {
      "text": "Today, it earns more per person than the United States.",
      "visual": {
        "type": "footage",
        "query": "marina bay singapore night",
        "alt": [
          "city skyline at night"
        ]
      },
      "overlay": {
        "type": "compare",
        "title": "GDP per person",
        "items": [
          {
            "label": "Singapore",
            "value": 90700,
            "display": "$90,700"
          },
          {
            "label": "USA",
            "value": 85800,
            "display": "$85,800"
          }
        ],
        "source": "World Bank",
        "fact": "f1"
      }
    },
    {
      "text": "All from a tiny island that had",
      "visual": {
        "type": "loop"
      }
    }
  ]
}

TOPIC: <write your topic here>
------------------------------------------------------------ COPY TO HERE
