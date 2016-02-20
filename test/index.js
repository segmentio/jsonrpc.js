
'use strict';

const mitm = require('mitm');
const assert = require('assert');
const Client = require('..');

describe('Client', function() {
  let mock = null;

  beforeEach(function() {
    mock = mitm();
  });

  afterEach(function() {
    mock.disable();
  });

  describe('.call(method, ...)', function() {
    it('should call the correct method', function*() {
      let called = false;

      mock.on('connection', function(socket) {
        socket.on('data', function(buf) {
          const json = JSON.parse(buf);

          assert.equal(json.method, 'Foo.Bar');
          called = true;

          socket.write(JSON.stringify({
            id: json.id,
            jsonrpc: '2.0',
            result: 42
          }));

          socket.destroy();
        });
      });

      const client = new Client('tcp://segment.dev:4003/rpc');
      yield client.call('Foo.Bar', { foo: 'bar' });
      client.sock.end();

      assert(called, 'called the method');
    });

    describe('if the method errors', function() {
      it('should throw the error', function*() {
        mock.on('connection', function(s) {
          s.on('data', function(buf) {
            const json = JSON.parse(buf);

            assert.equal(json.method, 'Foo.Bar');

            s.write(JSON.stringify({
              id: json.id,
              jsonrpc: '2.0',
              error: 'boom!'
            }));

            s.destroy();
          });
        });

        let err = null;
        const client = new Client('tcp://segment.dev:4003/rpc');
        try {
          yield client.call('Foo.Bar', { foo: 'bar' });
        } catch (e) {
          err = e;
        }

        client.sock.end();

        assert(err);
        assert.equal(err.message, 'boom!');
      });

      describe('if the method\'s error follows the rpc spec', function() {
        describe('the thrown error', function() {
          it('should follow the spec too', function*() {
            mock.on('connection', function(s) {
              s.on('data', function(buf) {
                const json = JSON.parse(buf);

                assert.equal(json.method, 'Foo.Bar');

                s.write(JSON.stringify({
                  id: json.id,
                  jsonrpc: '2.0',
                  error: {
                    message: 'boom!',
                    code: 42,
                    data: 'data'
                  }
                }));

                s.destroy();
              });
            });

            let err = null;
            const client = new Client('tcp://segment.dev:4003/rpc');
            try {
              yield client.call('Foo.Bar', { foo: 'bar' });
            } catch (e) {
              err = e;
            }

            client.sock.end();

            assert(err);
            assert.equal(err.message, 'boom!');
            assert.equal(err.code, 42);
            assert.equal(err.data, 'data');
          });
        });
      });
    });
  });
});
