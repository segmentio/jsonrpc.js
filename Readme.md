
# jsonrpc.js

 Simple JSON-RPC implementation for node.js and eventually the browser.

```js
var Client = require('jsonrpc.js');
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
```

## Installation

```
$ npm install segmentio/jsonrpc.js
```

## Transports

 Transports are specified via the protocol in the address given to `new Client()` – currently only "tcp" is supported.

## Debugging

```
DEBUG=jsonrpc
```

## Notes

This is primarily for use with Go's net/rpc/jsonrpc implementation – which seems to ignore the 2.0 spec, as errors are strings not objects.

# License

MIT