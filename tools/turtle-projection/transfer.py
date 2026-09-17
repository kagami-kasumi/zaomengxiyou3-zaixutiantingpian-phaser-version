"""Decode native per-channel response data; never synthesize source geometry."""
from functools import lru_cache
import zlib
import numpy as np


@lru_cache(maxsize=8)
def table(payload, height, width, channels):
    return np.frombuffer(zlib.decompress(payload),dtype=np.uint8).reshape((256,height,width,channels))


def apply_response(destination, source, spec, work):
    h,w=spec['height'],spec['width']
    rgb=table((work/spec['rgbDelta']['path']).read_bytes(),h,w,3)
    alpha=table((work/spec['alphaDelta']['path']).read_bytes(),h,w,1)
    ys,xs=np.indices((h,w))
    before=destination.copy()
    normal=source+before*(256-source[:,:,3:4])//256
    for c in range(3):
        destination[:,:,c]=(normal[:,:,c]+rgb[before[:,:,c],ys,xs,c])%256
    destination[:,:,3]=(normal[:,:,3]+alpha[before[:,:,3],ys,xs,0])%256
