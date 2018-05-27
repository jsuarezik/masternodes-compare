const express = require('express');
const app = express();
const rp = require('request-promise');
const cheerio = require('cheerio');

app.set('view-engine', 'ejs');

const masternodesOptions = {
  uri: `https://masternodes.online/`,
  transform: function (body) {
    return cheerio.load(body);
  }
};
const coinMarketCapOptions = {
    uri: 'https://api.coinmarketcap.com/v2/listings/'
};

var masterNodesCoins = [];
var coinMarketCapCoins = []
var html = '';

app.listen(3000, function () {
    console.log('App Listening on port 3000!');
});

app.get('/', function (req, res) {
    //Get the coins of master nodes to scrappe it 
    rp(masternodesOptions)
        .then(($) => {
        //console.log($);
        $('tr', '#masternodes_table').each(function(i , elem){
            masterNodesCoins.push($(this));
        });
        //Get the coins of coin market cap
        rp(coinMarketCapOptions)
            .then((data) => {
                allowedCoins = JSON.parse(data).data;
                allowedCoins.forEach(element => {
                    coinMarketCapCoins.push(element.name);
                });
                for (let i = 0; i < masterNodesCoins.length; i++) {
                    if (i == 0) { //Modify the header
                        createHeader();
                        continue;
                    }
                    tokens = sanitize(masterNodesCoins[i].text());
                    createTRElement(tokens);
                }
                
                return res.render('index.ejs', {"tableData" : html});
            })
            .catch((err) => {
                console.log(err);
            });
            })
        .catch((err) => {
            console.log(err);
    });
});


function sanitize(string) {
    tokens = string.replace(/\t/g, '').trim().split('\n');
    return tokens;
}

function createTRElement(array) {  
    html += '<tr style="padding-left:100px">';
    for (let i = 0; i < array.length; i++) {
        html += '<td style="width:100px">' + array[i] + '</td>';
    }
    name = getNameFromCoin(array[0]);

    if (coinExists(name)) {
        html += '<td style="width:100px"> SI </td> </tr>';
    } else {
        html += '<td style="width:100px"> NO </td> </tr>' 
    }

    return html;
}

function getNameFromCoin(string) {
    index = string.indexOf('(');
    return string.substring(0, index).trim();
}

function coinExists(string) {
    for (let i = 0; i < coinMarketCapCoins.length; i++) {
        if (coinMarketCapCoins[i].toLowerCase() == string.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function createHeader() {
    html += '<thead> <th style="width:100px"> Coin </th> <th style="width:100px"> Price </th> <th style="width:100px"> Change </th> <th style="width:100px"> Volume </th> <th style="width:100px"> MarketCap</th> <th style="width:100px"> ROI </th> <th style="width:100px"> Nodes </th> <th style="width:100px"> # Required </th> <th style="width:100px"> Mn Worth </th> <th style="width:100px"> CoinMarketCap </th> </tr> </thead>'
}