# Portfolio Optimization Program

## Installation Instructions
1) Clone this repository or download it as a zip file
2) Run the command ```pip install -r requirements.txt```
3) Download the neccessary versions of Node and NPM based on your operating system
4) Once all python and react libraries have installed, simply open two terminals
5) In the first terminal run the command ```python server``` and in the second terminal run ```npm start```

## Snapshot
![alt](https://github.com/marscolony2040/Risk/blob/main/images/rs.png)

## Project Explination
This program runs using a python server and a react.js front-end. To start off, a series of tickers need to be inputted into the top frame and submitted to the server. The server then imports the Beta, Prices, and Market Caps of each inputted stock and performs the CAPM equation on them in order to calculate risk/returns. The program then runs two optimizations in the backend, with the first being the minimization of Portfolio Risk (minimizing the weighted beta subject to target return). The other optimization is maximizing the CAPM return while setting a beta risk tolerance level. Once the algorithm performs those two optimizations, the result is pushed to the front-end; Depending on your inputted balance, the program will spit out a list of calculated shares to purchase in order to have the correct portfolio. There are two pie charts in the output, one being the minimized risk weights and the other being the maximized return weights.

## Optimizations Used In This Program
![alt](https://github.com/marscolony2040/PortfolioOptimizer/blob/main/images/optimizations.png)
