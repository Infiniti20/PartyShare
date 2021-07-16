const schedule = require('node-schedule');
var date = new Date();
date.setMinutes(1)
console.log(date)
let text="eeeeeeeeeeeeeeeeeeee"


var j = schedule.scheduleJob(date, function(){
  console.log(text);
});