
var Client = require('./');
var co = require('co');

var math = new Client('tcp://localhost:5000')

co(function *(){
  var res = yield math.call('Service.Add', { a: 1, b: 5 });
  console.log(res);

  var res = yield math.call('Service.Sub', { a: 5, b: 3 });
  console.log(res);

  var res = yield [
    math.call('Service.Add', { a: 1, b: 5 }),
    math.call('Service.Sub', { a: 1, b: 5 })
  ];
  console.log(res);

  try {
    var res = yield math.call('Service.Something', { a: 5, b: 3 });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
});