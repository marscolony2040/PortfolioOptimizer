import asyncio
import json
from bs4 import BeautifulSoup
from scipy.optimize import minimize
import numpy as np

def min_risk(beta, returns, mkt):
    def objective(x):
        bot = np.sum([w*b for w, b in zip(x, beta)])
        return bot
    def constraint(x):
        return np.sum(x) - 1
    def rate_c(x):
        return np.sum([w*r for w, r in zip(x, returns)]) - mkt
    def zeros(x):
        return x

    cons = {'type':'eq', 'fun': constraint}
    cons3 = {'type':'ineq', 'fun':rate_c}
    cons2 = {'type':'ineq', 'fun': zeros}
    w = [0 for i in beta]
    result = minimize(objective, w, method='SLSQP', bounds=None, constraints=[cons, cons2, cons3])
    return result.x.tolist()

def max_return(beta, returns, risk_tolerance):
    def objective(x):
        return -np.sum([w*r for w, r in zip(x, returns)])
    def constraint(x):
        return np.sum(x) - 1
    def rate_c(x):
        return risk_tolerance - np.sum([w*b for w, b in zip(x, beta)])
    def zeros(x):
        return x
    w = [0 for i in beta]
    cons = {'type':'eq', 'fun': constraint}
    cons3 = {'type':'ineq', 'fun': rate_c}
    cons2 = {'type':'ineq', 'fun':zeros}
    result = minimize(objective, w, method='SLSQP', bounds=None, constraints=[cons, cons2, cons3])
    return result.x.tolist()


def dataset(r):
    bf = BeautifulSoup(r, 'html.parser')

    pb = bf.find('div', attrs={'class': 'financial-summary'})
    data = pb.text.strip()

    data = data.split(' ')

    price = float(data[3].replace('$',''))
    beta = float(data[6])
    if 'B' in data[12]:
        mktcap = float(data[12].replace('B',''))*1000000000
    elif 'T' in data[12]:
        mktcap = float(data[12].replace('T',''))*1000000000000
    else:
        mktcap = float(data[12])
    return price, beta, mktcap

async def fetch_data(ticker, session):
    url = 'https://site.financialmodelingprep.com/financial-summary/{}'.format(ticker)
    async with session.get(url) as resp:
        r = await resp.text()
        rs = dataset(r)
        return rs

def CAPM(rf, mkt, beta):
    return rf + beta*(mkt - rf)

#async def Port(tickers, rf, mkt, rt, target, session):
async def Port(tickers, items, session):
    capmx = []
    beta = []
    for t in tickers:
        dp, db, mt = await fetch_data(t, session)
        print(dp, db, mt)
        bt = CAPM(items['rf'], items['mkt'], db)
        beta.append(db)
        capmx.append(bt)
    risk_opt = min_risk(beta, capmx, items['ret_tol'])
    tol_opt = max_return(beta, capmx, items['risk_tol'])
    return beta, capmx, risk_opt, tol_opt
