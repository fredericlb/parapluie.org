import os
import json
import eyed3
import eyed3.plugins.jsontag
from mutagen.id3 import ID3
from mutagen.mp3 import MP3
import time
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
from PIL import Image
from io import BytesIO
import hashlib
import unicodedata

TARGET_FOLDER = "/Users/flb/Documents/DJSet/Mariage";

def update(self = None):
    dbContent = []
    files = os.listdir(TARGET_FOLDER)
    all = []

    for f in files:
        p = TARGET_FOLDER + "/" + f
        if not p.endswith('mp3'):
            continue
        print(p)
        audio = ID3(p)
        data = {}
        data["id"] = hashlib.md5(f.encode()).hexdigest()

        for frame in audio.getall("VJING"):
            data["vjing"] = frame.text[0].strip()
        for frame in audio.getall("TXXX"):
            if frame.desc == "MISC":
                data["tags"] = list(map(lambda n: n.strip(), frame.text[0].split(' & ')))
            elif frame.desc == "TRANSITIONS":
                data[frame.desc.lower()] = list(filter(lambda n: len(n) > 0, frame.text[0].split('\n')))
            else:
                data[frame.desc.lower()] = frame.text[0].strip()
        for frame in audio.getall("TBPM"):
            data["bpm"] = float(frame.text[0].strip())
        for frame in audio.getall("TLAN"):
            data["language"] = frame.text[0].strip()
        for frame in audio.getall("TIT2"):
            data["title"] = frame.text[0].strip()
        for frame in audio.getall("TPE1"):
            data["artist"] = frame.text[0].strip()
        for frame in audio.getall("TDRC"):
            data["year"] = int(str(frame.text[0]).strip().split("-")[0])
        for frame in audio.getall("TKEY"):
            data["key"] = frame.text[0].strip()
        for frame in audio.getall("TCON"):
            data["genres"] = list(map(lambda n: n.strip(), frame.text[0].split(' & ')))
        file = MP3(p)
        data["duration"] = file.info.length
        data["file"] = f

        if audio.get("APIC:") != None:
            pict = audio.get("APIC:").data
            im = Image.open(BytesIO(pict))
            imname = "art_" + hashlib.md5(f.encode()).hexdigest() + ".jpg"
            im.save("../server/resources/songsdata/" + imname)
            data["albumart"] = imname
        all.append(data)
    with open('../server/resources/songsdata/data.json', 'w', encoding="utf-8") as f:
        jsondata = json.dumps(all, sort_keys=True, indent=2, ensure_ascii=False)
        jsondata = unicodedata.normalize("NFC", jsondata)
        f.write(jsondata)

if __name__ == "__main__":
    print("START")
    update()
    patterns = ["*"]
    ignore_patterns = None
    ignore_directories = False
    case_sensitive = True
    my_event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)
    my_event_handler.on_created = update
    my_event_handler.on_deleted = update
    my_event_handler.on_modified = update
    my_event_handler.on_moved = update
    go_recursively = True
    my_observer = Observer()
    my_observer.schedule(my_event_handler, TARGET_FOLDER, recursive=go_recursively)
    my_observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        my_observer.stop()
        my_observer.join()
