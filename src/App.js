import React from 'react';
import Plot from 'react-plotly.js';

import go from './images/go.png'

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
                   tickers: {}}

    this.handleChange = this.handleChange.bind(this)
    this.buildTicks = this.buildTicks.bind(this)
    this.changeVal = this.changeVal.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.Tab1 = this.Tab1.bind(this)
    this.Tab2 = this.Tab2.bind(this)
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
    evt.preventDefault();
  }

  changeVal(evt) {
    const { tickers } = this.state;
    tickers[evt.target.name] = evt.target.value
    this.setState({ tickers: tickers })
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
    var hold = []
    var tab = []
    const names = ['tickers', 'price', 'beta', 'capm', 'risk_weights', 'ret_weights']
    tab.push(
      
    )

    hold.push(
        <tr style={style}>
            <td>Ticker</td>&nbsp;
            <td>Price</td>&nbsp;
            <td>Beta</td>&nbsp;
            <td>Return</td>&nbsp;
            <td>MinRiskWeight</td>&nbsp;
            <td>MaxRetWeight</td>
        </tr>
    )

    if(response != null){
      for(var i = 0; i < N; i++){
        var row = []
        names.forEach((ix) => {
          row.push(
            <td style={style}>
              {response[ix][i]}
            </td>
          )
          row.push(
            <td>&nbsp;</td>
          )
        })
        hold.push(
          <tr>{row}</tr>
        )
      }
    }

    return hold
  }

  Tab2(style, bg, fg){
    const { response } = this.state 
    var hold = []
    var temp = []
    if(response != null){
      temp.push(<td style={style}>Min-Risk Beta</td>)
      temp.push(<td style={style}>{response['min_risk_beta']}</td>)
      temp.push(<td style={style}>Min-Risk Return</td>)
      temp.push(<td style={style}>{response['min_risk_rtns']}</td>)
    }

    hold.push(
      <tr>{temp}</tr>
    )

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
                <td><input name="risk_tol" type="number" step="0.1" min="0" value={this.state.risk_tol} onChange={this.handleChange} style={inp_style}/></td>&nbsp;
                <td><input name="ret_tol" type="number" step="0.1" min="0" value={this.state.ret_tol} onChange={this.handleChange} style={inp_style}/></td>&nbsp;
                <td><input name="balance" type="number" step="1" min="0" value={this.state.balance} onChange={this.handleChange} style={inp_style}/></td>
              </tr>
              </center>
          `</table>
          <div>{this.buildTicks(bg, fg)}</div>
          <br/>
          <br/>
          <table>{this.Tab1(inp_style2, bg, fg)}</table>
          <br/>
          <table>{this.Tab2(inp_style3, bg, fg)}</table>
          </center>
      </React.Fragment>
    );
  }
}