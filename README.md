# Super Off-Road NES remake

Play at [ryanallen.com/super-off-road](https://ryanallen.com/super-off-road/). For local play, run `python -m http.server 8077 --bind 127.0.0.1` in this folder and open `http://127.0.0.1:8077/`.

The browser build uses captures of all eight original NES courses, the qualifying screen, Speed Shop and ending art from the [99-race NES recording](https://tasvideos.org/5294M), the [original title image](https://www.vgmpf.com/Wiki/index.php?title=Ivan_%22Ironman%22_Stewart%27s_Super_Off_Road_%28NES%29), and [NES menu and podium captures](https://classicgamesdb.com/platform/nes/ivan-ironman-stewart-s-super-off-road/). The race order, four-lap rule, shop prices and limits, prizes and lives follow the [NES manual](https://www.digitpress.com/library/manuals/nes/Ivan%20%27Iron%20Man%27%20Stewart%27s%20Super%20Off-Road.pdf) and the [documented race sequence](https://www.speedrun.com/ivan_ironman_stewarts_super_off_road_nes/forums/la3l1). Original captures and music live in `assets/`. The full recording is not part of this project.

On an Xbox controller, use the **D-pad or left stick** to steer and choose menu items, **A** to accelerate or select, **B** for nitro or name backspace, and **Menu** to pause or finish a name. On the name screen, choose letters with the D-pad or stick and add them with A; Menu accepts the name. Up to four controllers can race. On a keyboard, player one uses **Left/Right**, **X**, **Z**, and **Enter**; player two uses **A/D**, **J**, and **K**. The menus choose one to four players, names and countries.

Run `python fetch-audio.py` to retrieve the [original NES music recordings](https://www.vgmpf.com/Wiki/index.php?title=Ivan_%22Ironman%22_Stewart%27s_Super_Off_Road_%28NES%29) into `assets/music/`. The title, start, track, finish and national anthem music play in the browser.

The physics, computer routes and uncaptured menu screens are approximations. Engine, nitro, collision and pickup sound effects are absent. Four-player controls and the continue cutoff still need comparison with an original cartridge. [RESEARCH.md](RESEARCH.md) lists the original sources and remaining verification work.
