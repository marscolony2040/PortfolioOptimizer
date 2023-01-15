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

def portfolio(w, b):
    return np.sum([i*j for i, j in zip(w, b)])

def calcshares(w, price, balance):
    return [round(weight*balance/cost, 0) for weight, cost in zip(w, price)]


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

                balance = resp['balance']

                for i in ('rf','mkt','risk_tol','ret_tol','balance'):
                    items[i] = resp[i]

                tickers = cleanup(resp)
                beta, capmx, price, mktcap, risk_opt, tol_opt = await Port(tickers, items, sess)
                
                min_risk_beta = portfolio(risk_opt, beta)
                min_risk_rtns = portfolio(risk_opt, capmx)
                min_risk_shares = calcshares(risk_opt, price, balance)
                
                max_ret_beta = portfolio(tol_opt, beta)
                max_ret_rtns = portfolio(tol_opt, capmx)
                max_risk_shares = calcshares(tol_opt, price, balance)

                msg = {'tickers': tickers,
                       'beta': beta,
                       'capm': capmx,
                       'price': price,
                       'mktcap': mktcap,
                       'risk_weights': risk_opt,
                       'ret_weights': tol_opt,
                       'min_risk_beta': min_risk_beta,
                       'min_risk_rtns': min_risk_rtns,
                       'min_risk_shares': min_risk_shares,
                       'max_ret_beta': max_ret_beta,
                       'max_ret_rtns': max_ret_rtns,
                       'max_risk_shares': max_risk_shares}

                await ws.send(json.dumps(msg))


Server().turn_on()