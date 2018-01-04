var clc = require('cli-color');

wrapper = function(fn){
  fn(mztest);
};

var mztest = {
  count: 0,
  passedCnt: 0,
  failedCnt: 0,
  threshold: 66,
  criticalThreshold: 15,
  startTime: new Date()
}

mztest.passed = function (msg = '') {
  this.count++;
  this.passedCnt++;
  console.log(`${msg} ` + clc.green(`Passed`));
};

mztest.failed = function (msg = '') {
  this.count++;
  this.failedCnt++;
  console.log(`${msg} ` + clc.red(`Failed`));
};

mztest.is = function (a, b, name = '') {
  var msg = `${(name != '') ? name + ': ' : ''}Expecting {${a}} to be equal to {${b}}`;
  if (a == b)
    this.passed(msg);
  else
    this.failed(msg);
}

mztest.isNot = function (a, b, name = '') {
  var msg = `${(name != '') ? name + ': ' : ''}Expecting {${a}} to be NOT equal to {${b}}`;
  if (a != b)
    this.passed(msg);
  else
    this.failed(msg);
}

mztest.isStrict = function (a, b, name = '') {
  var msg = `${(name != '') ? name + ': ' : ''}Expecting {${a}} to be strictly equal to {${b}}`;
  if (a === b)
    this.passed(msg);
  else
    this.failed(msg);
}

mztest.end = function() {
  var endTime = new Date() - this.startTime;
  if (this.count > 0) {
    var passed = Math.round(this.passedCnt / this.count * 100);
    var clr = (passed > this.threshold) ? clc.yellow : clc.red;
    clr = (passed == 100) ? clc.green : clr;
    console.log(`\nEnded in ${endTime / 1000} s. Passed: ` + clr(`${passed}% (${this.passedCnt}/${this.count})\n`));
  } else {
    console.log("Nothing to test");
  }
}

//module.exports = mztest;
module.exports = wrapper;
