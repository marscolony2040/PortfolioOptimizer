import React from 'react';
import Plot from 'react-plotly.js';

import go from './images/go.png'

const rd = (x) => {
  return Math.round(x*1000)/1000;
}

export default class App extends React.Component {

  constructor(){
    super();

    this.state = { response: null,
                   sock: null,
                   N: 0,
                   RF: 0.0388,
                   MKT: 0.12,
                   risk_tol: 1.2,
                   ret_tol: 0.13,
                   balance: 100000,
                   tickers: {},
                   weights: {},
                   shares: [],
                   shares_sum: 0,
                   w_beta: 0,
                   w_retn: 0}

    this.handleChange = this.handleChange.bind(this)
    this.buildTicks = this.buildTicks.bind(this)
    this.changeVal = this.changeVal.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.Tab1 = this.Tab1.bind(this)
    this.Tab2 = this.Tab2.bind(this)
    this.Tab3 = this.Tab3.bind(this)
    this.changeWeight = this.changeWeight.bind(this)
  }

  componentDidMount(){
    const socket = new WebSocket("ws://localhost:8080")
    socket.onmessage = (evt) => {
      this.setState({ response: JSON.parse(evt.data) })
    }
    this.setState({ sock: socket })
  }

  handleSubmit(evt){
    const { tickers, RF, MKT, sock, N, risk_tol, ret_tol, balance } = this.state;
    var ticks = {}
    for(var i = 0; i < N; i++){
      const tag = "S" + i.toString()
      ticks[tag] = tickers[tag]
    }
    const msg = {'tickers': ticks, 
                 'rf': RF, 
                 'mkt': MKT, 
                 'risk_tol': risk_tol,
                 'ret_tol': ret_tol,
                 'balance': balance}
    
    sock.send(JSON.stringify(msg))
    this.setState({ weights: {} })
    evt.preventDefault();
  }

  changeVal(evt) {
    const { tickers } = this.state;
    tickers[evt.target.name] = evt.target.value
    this.setState({ tickers: tickers })
  }

  changeWeight(evt){
    const { weights, response, balance } = this.state
    weights[evt.target.name] = parseFloat(evt.target.value)
    const share = []
    var total_shares = 0
    var total_beta = 0
    var total_rtn = 0
    Object.keys(weights).map((key, ii) => {
      const price = response['price'][ii]
      const beta = response['beta'][ii]
      const capx = response['capm'][ii]
      const weight = weights[key]/100
      total_shares += weight
      total_beta += weight*beta 
      total_rtn += weight*capx
      share.push(Math.round(weight*balance/price))
    })
    this.setState({ w_beta: total_beta, w_retn: total_rtn, weights: weights, shares: share, shares_sum: total_shares })
  }

  handleChange(evt){
    this.setState({ [evt.target.name]: parseFloat(evt.target.value) })
  }

  buildTicks(bg, fg){
    const { N } = this.state;
    const hold = []
    var namez = ""
    for(var i = 0; i < N; i++){
      namez = "S" + i.toString()
      hold.push(
        <input name={namez} type="text" onChange={this.changeVal} style={{backgroundColor: bg, color: fg, width: 100, fontSize: 18, textAlign: "center"}}/>
      )
    }
    return hold
  }

  Tab1(style, bg, fg){
    const { response, N } = this.state
    var gold = []
    var hold = []
    var tab = []
    const names = ['tickers', 'price', 'beta', 'capm', 'risk_weights', 'ret_weights', 'risk_shares', 'ret_shares', 'vmkt']

    const style2 = {backgroundColor: fg, color: bg, width: 170, fontSize: 20, textAlign: "center"}

    hold.push(
        <tr>
            <td style={style2}><b>Ticker</b></td>&nbsp;
            <td style={style2}><b>Price</b></td>&nbsp;
            <td style={style2}><b>Beta</b></td>&nbsp;
            <td style={style2}><b>Return</b></td>&nbsp;
            <td style={style2}><b>MinRiskWeight</b></td>&nbsp;
            <td style={style2}><b>MaxRetWeight</b></td>&nbsp;
            <td style={style2}><b>MinRiskShares</b></td>&nbsp;
            <td style={style2}><b>MaxRetShares</b></td>&nbsp;
            <td style={style2}><b>Shares Traded</b></td>&nbsp;
            <td style={style2}><b>Weights(%)</b></td>
        </tr>
    )

    if(response != null){
      for(var i = 0; i < response['tickers'].length; i++){
        const I = "I" + i.toString()
        var row = []
        names.forEach((ix) => {
          row.push(
            <td style={style}>
              {response[ix][i]}
            </td>
          )
          row.push(
            <td style={{backgroundColor: bg}}>&nbsp;</td>
          )
        })
        row.push(
          <center><input name={I} step="0.01" min="0" onChange={this.changeWeight} style={style}/></center>
        )
        
        hold.push(
          <tr>{row}</tr>
        )
      }
      gold.push(
        <table>
          {hold}
        </table>
      )
      const tan = []
      const sin = []
      for(var i = 0; i < this.state.shares.length; i++){
        sin.push(
          <td style={style}><b>{response['tickers'][i]}</b></td>
        )
        tan.push(
          <td style={style}>{this.state.shares[i]}</td>
        )
      }
      gold.push(
        <br/>
      )
      gold.push(
        <br/>
      )
      
      gold.push(
        <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}><b>Portfolio Beta</b></tr></center>  
      )
      gold.push(
        <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}>{rd(this.state.w_beta)}</tr></center>
      )
      gold.push(
        <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}><b>Portfolio Return</b></tr></center>  
      )
      gold.push(
        <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}>{rd(this.state.w_retn)}</tr></center>
      )
      gold.push(
        <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}><b>Custom Shares</b></tr></center>  
      )
      gold.push(
        <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}>{rd(this.state.shares_sum)}</tr></center>
      )
      gold.push(
        <br/>
      )
      gold.push(
        <center>{sin}</center>
      )
      gold.push(
        <center>{tan}</center>
      )
    }
    

    return gold
  }

  Tab2(style, bg, fg){
    const { response } = this.state 
    var hold = []
    var temp = []
    var kemp = []
    if(response != null){
      temp.push(<td style={style}>Min-Risk Beta</td>)
      temp.push(<td style={style}>{response['min_risk_beta']}</td>)
      temp.push(<td style={style}>Min-Risk Return</td>)
      temp.push(<td style={style}>{response['min_risk_rtns']}</td>)
      kemp.push(<td style={style}>Max-Ret Beta</td>)
      kemp.push(<td style={style}>{response['max_ret_beta']}</td>)
      kemp.push(<td style={style}>Max-Ret Return</td>)
      kemp.push(<td style={style}>{response['max_ret_rtns']}</td>)
    }

    hold.push(
      <tr>{temp}</tr>
    )

    hold.push(
      <tr>{kemp}</tr>
    )

    return hold
  }

  Tab3(bg, fg){
    const { response } = this.state
    const hold = []
    if(response != null){
      hold.push(
        <Plot 
          data={[{
            values: response['risk_weights'],
            labels: response['tickers'],
            type: 'pie',
            textinfo: 'label+percent',
            textposition: 'inside',
            automargin: true,
            marker: {
              color: fg
            }
          }]}
          layout={{
            title: {
              text: 'Minimized Risk Allocation',
              font: {
                color: fg,
                size: 20
              }
            },
            paper_bgcolor: bg,
            plot_bgcolor: bg,
            showlegend: false,
            width: 666,
            height: 666
          }}
        />
      )
      hold.push(
        <Plot 
          data={[{
            values: response['ret_weights'],
            labels: response['tickers'],
            type: 'pie',
            textinfo: 'label+percent',
            textposition: 'inside',
            automargin: true,
            marker: {
              color: fg
            }
          }]}
          layout={{
            title: {
              text: 'Maximized Return Allocation',
              font: {
                color: fg,
                size: 20
              }
            },
            paper_bgcolor: bg,
            plot_bgcolor: bg,
            showlegend: false,
            width: 666,
            height: 666
          }}
        />
      )
    }
    return hold
  }

  render() {
    const bg = 'black'
    const fg = 'cyan'
    const title_style = {backgroundColor: bg, color: fg, fontSize: 40}
    const inp_style = {backgroundColor: bg, color: fg, width: 100, fontSize: 18, textAlign: "center"}
    const inp_style2 = {backgroundColor: bg, color: fg, width: 100, fontSize: 20, textAlign: "center"}
    const inp_style3 = {backgroundColor: bg, color: fg, width: 150, fontSize: 20, textAlign: "center"}
    


    return (
      <React.Fragment>
        <center>
          <table>
            <center>
            <tr style={title_style}><b>FinRisk</b></tr>
            <tr><img src={go} alt="gobutton" onClick={this.handleSubmit}></img></tr>
            </center>
          </table>
          <table style={{backgroundColor: bg}}>
              <center>
              <tr>
                <td><div style={{color: fg, fontSize: 20}}># of Stocks</div></td>&nbsp;
                <td><div style={{color: fg, fontSize: 20}}>RF Rate</div></td>&nbsp;
                <td><div style={{color: fg, fontSize: 20}}>Mkt Rate</div></td>&nbsp;
                <td><div style={{color: fg, fontSize: 20}}>TargetRisk</div></td>&nbsp;
                <td><div style={{color: fg, fontSize: 20}}>TargetReturn</div></td>&nbsp;
                <td><div style={{color: fg, fontSize: 20}}>Balance</div></td>
              </tr>
              
              <tr>
                <td><input name="N" type="number" step="1" min="0" value={this.state.N} onChange={this.handleChange} style={inp_style} /></td>&nbsp;
                <td><input name="RF" type="number" step="0.0001" min="0" value={this.state.RF} onChange={this.handleChange} style={inp_style} /></td>&nbsp;
                <td><input name="MKT" type="number" step="0.0001" min="0" value={this.state.MKT} onChange={this.handleChange} style={inp_style} /></td>&nbsp;
                <td><input name="risk_tol" type="number" step="0.01" min="0" value={this.state.risk_tol} onChange={this.handleChange} style={inp_style}/></td>&nbsp;
                <td><input name="ret_tol" type="number" step="0.01" min="0" value={this.state.ret_tol} onChange={this.handleChange} style={inp_style}/></td>&nbsp;
                <td><input name="balance" type="number" step="1" min="0" value={this.state.balance} onChange={this.handleChange} style={inp_style}/></td>
              </tr>
              </center>
          `</table>
          <div>{this.buildTicks(bg, fg)}</div>
          <br/>
          <br/>
          <table>{this.Tab1(inp_style2, bg, fg)}</table>
          <br/>
          <center><tr style={{backgroundColor: bg, color: fg, fontSize: 22}}><b>Risk/Return Metrics</b></tr></center>   
          <br/>
          <table>{this.Tab2(inp_style3, bg, fg)}</table>
          <br/>
          <center>
            <div>{this.Tab3(bg, fg)}</div>
          </center>
          </center>
      </React.Fragment>
    );
  }
}