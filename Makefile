
BIN := node_modules/.bin

NODE_FLAGS ?=
MOCHA_FLAGS ?=

SRC := index.js
TESTS := $(wildcard test/*.js)

node_modules: package.json
	npm install
	touch $@

test: node_modules
	$(BIN)/mocha $(MOCHA_FLAGS) $(NODE_FLAGS)

coverage: $(SRC) $(TESTS) node_modules
	node $(NODE_FLAGS) $(BIN)/istanbul cover $(BIN)/_mocha $(MOCHA_FLAGS) ./test

clean:
	rm -rf coverage

.PHONY: coverage clean test
