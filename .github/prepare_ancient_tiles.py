"""Build static, same-origin map tiles; keep original north-up scan coordinates."""
import hashlib
import json
from pathlib import Path

W,H,T=12540,18448,768
LEVELS=(1,2,4,8)

def build(root, matches):
    source=root/'media/pingjiang-user-original.jpg'
    folder=root/'media/ancient-tiles-v1'
    digest=hashlib.sha256(source.read_bytes()+json.dumps(matches['bridges'],sort_keys=True).encode()).hexdigest()
    names=['overview.jpg']+[f'{b["id"]}.jpg' for b in matches['bridges']]
    for d in LEVELS:
        names.extend(f'{d}/{x}-{y}.jpg' for y in range((H+T*d-1)//(T*d)) for x in range((W+T*d-1)//(T*d)))
    stamp=folder/'index.json'
    if stamp.exists() and json.loads(stamp.read_text())['digest']==digest and all((folder/n).is_file() for n in names):
        return [folder/n for n in names+['index.json']]
    from PIL import Image
    folder.mkdir(parents=True,exist_ok=True)
    cap=Image.MAX_IMAGE_PIXELS
    try:
        Image.MAX_IMAGE_PIXELS=W*H
        with Image.open(source) as raw:
            assert raw.size==(W,H)
            for b in matches['bridges']:
                p=b['ancient_position']
                x=max(0,min(W-1300,round(p['x'])-650));y=max(0,min(H-832,round(p['y'])-416))
                raw.crop((x,y,x+1300,y+832)).resize((1000,640),Image.Resampling.LANCZOS).save(folder/(b['id']+'.jpg'),quality=89)
            level=raw
            for d in LEVELS:
                dest=folder/str(d);dest.mkdir(exist_ok=True)
                for y in range(0,level.height,T):
                    for x in range(0,level.width,T):
                        level.crop((x,y,min(x+T,level.width),min(y+T,level.height))).save(dest/f'{x//T}-{y//T}.jpg',quality=87)
                smaller=level.reduce(2)
                if level is not raw: level.close()
                level=smaller
            level.save(folder/'overview.jpg',quality=85);level.close()
        stamp.write_text(json.dumps(dict(digest=digest,width=W,height=H,tile=T,levels=LEVELS)),encoding='utf-8')
    finally:
        Image.MAX_IMAGE_PIXELS=cap
    return [folder/n for n in names+['index.json']]

if __name__ == '__main__':
    root=Path('static')
    paths=build(root,json.loads((root/'data/pingjiang-bridge-matches.json').read_text(encoding='utf-8')))
    assert len(paths)==599 and all(p.stat().st_size for p in paths)
