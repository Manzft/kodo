import json
from pathlib import Path

DATA_DIR = Path.home() / ".local" / "share" / "kodo"


class Storage:
    def __init__(self, filename: str):
        self.path = DATA_DIR / filename
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("[]")

    def read(self) -> list:
        return json.loads(self.path.read_text())

    def write(self, data: list) -> None:
        self.path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
