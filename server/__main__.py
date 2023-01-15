import asyncio
import aiohttp
import websockets
import json
import numpy as np
from portfolio import Port

def extract_ticks(f):
    def handle(*a, **b):
        z = f(*a, **b)
        x, y = np.array(z).T.tolist()
        return y
    return handle

@extract_ticks
def cleanup(x):
    k = []
    for i, j in x['tickers'].items():
        tag = int(i.replace('S',''))
        k.append([tag, j])
    return list(sorted(k, key=lambda z: z[0]))

class Server:

    def __init__(self, host='localhost', port=8080):
        self.host = host
        self.port = port

    def turn_on(self):
        server = websockets.serve(self.serving, self.host, self.port)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(server)
        loop.run_forever()

    async def serving(self, ws, path):
        items = {}
        async with aiohttp.ClientSession() as sess:
            while True:
                resp = await ws.recv()
                resp = json.loads(resp)
                for i in ('rf','mkt','risk_tol','ret_tol','balance'):
                    items[i] = resp[i]
                tickers = cleanup(resp)
                await Port(tickers, items, sess)
            


Server().turn_on()