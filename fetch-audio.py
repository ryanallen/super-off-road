"""Fetch recordings of the original NES score for local reference playback."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

CATALOG = "https://www.vgmpf.com/Wiki/index.php?title=Ivan_%22Ironman%22_Stewart%27s_Super_Off_Road_(NES)"
NAMES = [
    "title", "race-start", "fandango", "sidewinder", "wipeout",
    "big-dukes", "blaster", "cliffhanger", "huevos-grande",
    "hurricane-gulch", "race-end", "usa", "italy", "germany",
    "britain", "france", "japan", "canada", "australia",
]
DEST = Path(__file__).parent / "assets" / "music"


class RecordingLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = {}

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        if not href.endswith(".ogg"):
            return
        name = href.rsplit("/", 1)[-1]
        if len(name) >= 3 and name[:3].isdigit():
            self.links[int(name[:3])] = urljoin(CATALOG, href)


def fetch(url):
    req = Request(url, headers={"User-Agent": "SuperOffRoadReference/1.0"})
    with urlopen(req, timeout=30) as response:
        return response.read()


def main():
    parser = RecordingLinks()
    parser.feed(fetch(CATALOG).decode("utf-8"))
    missing = [number for number in range(101, 120) if number not in parser.links]
    if missing:
        raise RuntimeError(f"Catalog is missing recordings: {missing}")
    DEST.mkdir(parents=True, exist_ok=True)
    for number, name in enumerate(NAMES, 101):
        path = DEST / f"{name}.ogg"
        if not path.exists():
            data = fetch(parser.links[number])
            if not data.startswith(b"OggS"):
                raise RuntimeError(f"Recording {number} was not an Ogg file")
            path.write_bytes(data)
        print(path.name)


if __name__ == "__main__":
    main()
