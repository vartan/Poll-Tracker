"use strict";
var https = require("https");
var url = "https://www.idpcaucuses.com/api/statecandidateresults";
var notifier = require("node-notifier");
let lastReporting = undefined;
const REFRESH_INTERVAL_SECONDS = 5;

setInterval(refresh, REFRESH_INTERVAL_SECONDS*1000);
refresh();



function refresh() {
    https.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var response = JSON.parse(body);
            if(response.PrecinctsReporting > lastReporting) {
                lastReporting = response.PrecinctsReporting;
                let winning = response.StateResults[0];
                let next = response.StateResults[1];
                let amt = Math.round((winning.WinPercentage-next.WinPercentage)*10000)/100;
                let msg = winning.Candidate.DisplayName+" is ahead by "+amt+"% with "+Math.round(winning.WinPercentage*10000)/100+" to "+Math.round(next.WinPercentage*10000)/100;
                let percentIn = Math.round(response.PrecinctsReporting/response.TotalPrecincts*10000)/100;
                notifier.notify({
                  'title': percentIn+'% Reporting In',
                  'message': msg
                });
                process.stdout.write('\x07');


                console.log("---");
                console.log(response.PrecinctsReporting+"/"+response.TotalPrecincts)
                console.log(msg)
            }
        });

    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
}
