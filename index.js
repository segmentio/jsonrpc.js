/**
 * Module dependencies.
 */

var debug = require('debug')('jsonrpc');
var Promise = require('bluebird');
var split = require('split2');
var uid = require('uid2');
var url = require('url');
var net = require('net');

/**
 * Expose `Client`.
 */

module.exports = Client;

/**
 * JSON-RPC client.
 *
 * The given `addr` must be a url specifying the transport
 * to be used. Currently only `tcp://` is supported.
 */

function Client(addr) {
  this.reqs = {};
  this.addr = url.parse(addr);
  this.addr.port = this.addr.port || 80;
  this.sock = net.connect(this.addr.port, this.addr.hostname);
  this.sock.pipe(split(JSON.parse)).on('data', this.onresponse.bind(this));
}

/**
 * Call `method` with zero or more arguments.
 *
 * @param {String}
 * @return {Promise}
 */

Client.prototype.call = function(method){
  var params = [].slice.call(arguments, 1);
  var self = this;

  var req = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: uid(16)
  };

  debug('<-- %j', req);
  this.sock.write(JSON.stringify(req));

  return new Promise(function(resolve, reject){
    self.reqs[req.id] = function(res){
      if (res.error) {
        var err = null;
        // per the spec, `.error` is an object
        // http://www.jsonrpc.org/specification#error_object
        if (typeof res.error == 'object') {
          err = new Error(res.error.message);
          err.code = res.error.code;
          err.data = res.error.data;
        } else {
          // we don't follow specifications for some reaosn
          err = new Error(res.error);
        }
        reject(err);
      } else {
        resolve(res.result);
      }
    };
  });
};

/**
 * Handle response.
 */

Client.prototype.onresponse = function(res){
  debug('--> %j', res);
  this.reqs[res.id](res);
  delete this.reqs[res.id];
};
