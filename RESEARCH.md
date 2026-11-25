# Ivan “Ironman” Stewart’s Super Off-Road (NES): remake reference

**Target:** faithfully remake the 1990 NES game: its tracks, progression, handling, rules, screens, trucks, pixel art, music and sound. The NES cartridge is the reference. The 1989 arcade game is historical context, not a source of extra features. No new tracks, drivers, modes, online play, setting, visual redesign or replacement soundtrack.

## Original material

| Reference | What it supplies |
|---|---|
| [Tradewest NES instruction manual](https://www.digitpress.com/library/manuals/nes/Ivan%20%27Iron%20Man%27%20Stewart%27s%20Super%20Off-Road.pdf) | Original controls, rules, HUD, shop, prizes and screen illustrations |
| [High-resolution scans of the NES manual, box and cartridge](https://www.gamingalexandria.com/wp/2024/12/ivan-ironman-stewarts-super-off-road-2/) | Original art, typography, packaging and manual details |
| [NES gameplay footage](https://www.youtube.com/watch?v=-iKQIYK1AuI) | Track layouts, motion, colors, menus and sound in the running game |
| [NES course sprite sheet](https://www.spriters-resource.com/nes/ivanironmanstewartssuperoffroad/asset/190797/) and [title-screen sheet](https://www.spriters-resource.com/nes/ivanironmanstewartssuperoffroad/asset/94445/) | Pixel-exact source images for course and title references |
| [NES screen gallery](https://www.mobygames.com/game/4444/ivan-ironman-stewarts-super-off-road/screenshots/nes/) | Screenshots of the title, player count, name and nationality entry, races, results, awards and upgrade shop |
| [Full-resolution NES screen captures](https://classicgamesdb.com/platform/nes/ivan-ironman-stewart-s-super-off-road/) | Original player count, name, nationality, podium and shop images used as remake references |
| [Complete 99-race NES recording](https://tasvideos.org/5294M) | Every race, shop transition and the ending; this is a tool-assisted run, so its pickup luck and driving are atypical |
| [Four-player original NES cartridge capture](https://www.youtube.com/watch?v=sszhZMIDYfM) | Four-controller behavior on actual hardware |
| [NES race-structure analysis](https://www.speedrun.com/ivan_ironman_stewarts_super_off_road_nes/forums/la3l1) | Track names and order, 99-race progression and difficulty observations |
| [US NES cartridge and PCB record](https://nescartdb-mirror.netlify.app/profiles/2862/ivan-ironman-stewarts-super-off-road) | Original cart: mapper 7, 128 KB PRG ROM, 8 KB CHR RAM, no battery |
| [Leland arcade owner’s manual](https://arcarc.xmission.com/PDF_Arcade_Manuals_and_Schematics/Off%20Road.pdf), [1989 sales flyer](https://flyers.arcade-museum.com/videogames/show/2047), [MAME driver](https://github.com/mamedev/mame/blob/master/src/mame/cinematronics/leland.cpp) | Arcade history and a way to identify features that do not belong to the NES version |

Local NES screen references: [title](assets/title.png), [player count](assets/player-count.png), [name entry](assets/name-entry.png), [nationality](assets/country-select.png), [qualifying intro](assets/race-intro.png), [podium](assets/results-podium.png), [Speed Shop](assets/shop-base.png), [totals](assets/totals-base.png), and [Ironman Club header](assets/trophy-header.png). The [audio fetch script](fetch-audio.py) retrieves the original soundtrack recordings for local playback.

## NES game to reproduce

### Race and controls

- One fixed overhead stadium track fills the playfield. The scoreboard sits above it. Four colored trucks race at once; unused human seats are computer controlled. The original supports one or two controllers directly and up to four through the NES Satellite or Four Score.
- D-pad steers; **A** accelerates; **B** spends one nitro unit per press while A remains held; **Start** pauses. Measure the original steering, sliding, wall contact, truck collisions, jumps and mud behavior from gameplay. The manual gives no numerical physics values.
- The first truck to finish **four laps** wins. Eight tracks run in both directions for **16 configurations**. Match each layout, start position, barrier, terrain feature, shortcut, decoration, color and name.
- The HUD shows the track name, each truck’s lap and nitro stock, and elapsed time. Each player’s stats use the truck color. [Source: NES manual](https://www.digitpress.com/library/manuals/nes/Ivan%20%27Iron%20Man%27%20Stewart%27s%20Super%20Off-Road.pdf).

### Tracks and race order

The NES track names and sequence are recorded in the [race-structure analysis](https://www.speedrun.com/ivan_ironman_stewarts_super_off_road_nes/forums/la3l1). Check each track’s visual layout and starting direction against the running NES game.

| Order | Original track | NES course capture |
|---:|---|---|
| 1 | Fandango | [Image](assets/fandango.png) |
| 2 | Sidewinder | [Image](assets/sidewinder.png) |
| 3 | Wipe Out | [Image](assets/wipeout.png) |
| 4 | Big Dukes | [Image](assets/big-dukes.png) |
| 5 | Blaster | [Image](assets/blaster.png) |
| 6 | Cliffhanger | [Image](assets/cliffhanger.png) |
| 7 | Huevos Grande | [Image](assets/huevos-grande.png) |
| 8 | Hurricane Gulch | [Image](assets/hurricane-gulch.png) |

| Races | Facing at start | Tracks in order |
|---|---|---|
| 1–2 | Left | 1–2 |
| 3–5 | Right | 1–3 |
| 6–9 | Left | 1–4 |
| 10–14 | Right | 1–5 |
| 15–20 | Left | 1–6 |
| 21–26 | Right | 1–7 |
| 27–34 | Left | 1–8 |
| 35–42 | Right | 1–8 |
| 43–99 | Alternating | Repeat the 27–42 pattern |

After race **99**, the game goes to its high-score screen. The race analysis also reports a hidden difficulty value beginning at 32 and increasing by two on most races; verify its actual effect in the NES game before reproducing it.

### Money, shop and lives

- Players start with **$0 and three lives**. The Speed Shop appears between races with four player columns showing cash, lives, accessories and the next track. Keep its original menu and purchase flow.
- Track bonus targets award **$10,000–$40,000**. Nitro pickups grow from **one to five units**. Match their original look, placement, timing and escalation from the running game; the manual does not fully specify the pickup cycle.
- Finishing prizes are **$150,000 / $130,000 / $110,000 / $100,000**, first through fourth. A player beaten by a computer truck has **$30,000** deducted. High-score points are separate from cash: one point per $1,000 won in a race.

| Accessory | Price | Limit | Effect |
|---|---:|---:|---|
| Nitro fuel | $10,000 per unit | 99 | Speed above normal top speed |
| Tires | $40,000 | 6 | More grip, less skid |
| Shocks | $60,000 | 6 | Less bouncing, tighter cornering |
| Acceleration | $80,000 | 6 | Faster acceleration |
| Top speed | $100,000 | 6 | Higher normal speed |

- A win restores one life, capped at three. **Fourth place** costs one life; second and third do not. A permitted continue keeps upgrades and restores three lives, but resets cash and points.
- **Continue cutoff requires direct gameplay verification:** the NES manual says both “no restart after race 20” and “no continue once the tournament starts at race 15.” A contemporary [NES player FAQ](https://gamefaqs.gamespot.com/nes/587666-ivan-ironman-stewarts-super-off-road/faqs/3104) independently says race 15. Test races 15–20 in the original before treating that as settled.

### Original presentation

- Recreate the title and demo, player-name entry, country and flag selection, race intro, scoreboard, results and awards, Speed Shop, continue prompt and high-score screen. Capture each screen from the NES game before reproducing it.
- Match the NES track backgrounds, hazards, colored truck sprites and rotations, HUD lettering, shop illustration, flags, screen proportions and sprite scale. Arcade art and the Track Pak are separate references.
- Match the NES music and sound cues by screen and event: title/menu, tracks, engine, nitro, skid, collision, pickup, finish and shop. Hear and record the game before assigning cues; the [NES soundtrack catalog](https://www.vgmpf.com/Wiki/index.php?title=Ivan_%22Ironman%22_Stewart%27s_Super_Off_Road_%28NES%29) is a useful index.
- Match the original computer trucks and their changes over a season from NES gameplay. Arcade operator settings do not establish NES opponent behavior.

## Original-game capture checklist

1. Capture all eight NES tracks in both directions, including nameplates, start grids, boundaries, hazards, jumps, decorations and pickups.
2. Record full four-lap races with steering, collisions, nitro, pickup cycles, lap changes and results.
3. Capture every screen from boot to high scores with one through four human players and each finish position.
4. Check shop prices and caps, prize arithmetic, lives, continues at races 14–21, difficulty progression and the race-99 ending.
5. Record music and sound cues by screen and action. Compare the remake’s image, motion, timing and sound directly with the original.

## Version boundary

The 1989 Leland arcade cabinet has three human steering wheels and pedals. Its **Track Pak** adds eight arcade tracks and a dune buggy. Those belong to the arcade lineage; this remake follows the NES cartridge’s content and controls. [Leland manual](https://arcarc.xmission.com/PDF_Arcade_Manuals_and_Schematics/Off%20Road.pdf), [MAME arcade sets](https://github.com/mamedev/mame/blob/master/src/mame/cinematronics/leland.cpp).
