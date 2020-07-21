// Production rule class
var Rule = function(symbol, definition) {
    // non-terminal symbol
    if (symbol == null) {
        this.symbol = "";
    } else {
        this.symbol = symbol;
    }

    // definition symbols
    this.definition = [];
    if (definition != null) {
        if (Array.isArray(definition)) {
            Array.prototype.push.apply(this.definition, definition);
        } else {
            this.definition.push(definition);
        }
    }
}

// Production rule prototype
Rule.prototype = {

    // convert to string
    "toString": function() {
        var symbols = [ this.symbol, "::=" ].concat(this.definition);
        symbols.push(";");
        return symbols.join(" ");
    },

}

// LR item class
var LrItem = function(rule, position) {
    // properties
    this.rule = rule;
    this.position = Math.max(0, Math.min(position, rule.definition.length));
    if (this.position < rule.definition.length) {
        this.next = rule.definition[this.position];
    } else {
        this.next = "";
    }
    this.look = new Set();

    // LR(0) item
    var symbols = [ rule.symbol, "::=" ];
    Array.prototype.push.apply(symbols, rule.definition.slice(0, this.position));
    symbols.push("&bull;");
    Array.prototype.push.apply(symbols, rule.definition.slice(this.position));
    this._lr0 = symbols.join(" ");
}

// LR item prototype
LrItem.prototype = {

    // go to the next position
    "goAhead": function() {
        // confirm current position
        if (this.rule.length <= this.position) {
            return null;
        }

        // create next LR item
        return new LrItem(this.rule, this.position + 1);
    },

    // add lookahead symbols
    "addLook": function(collection) {
        collection.forEach(function(value) { this.look.add(value); }, this);
    },

    // get item string
    "getItem": function() {
        return this._lr0;
    },

    // whether another instance is equal to this instance
    "equals": function(other) {
        return other.getItem() == this.getItem();
    },

}

// Closure class
var Closure = function(rules, represent) {
    // fields
    this._rules = rules;
    if (Array.isArray(represent)) {
        this.represent = represent;
    } else {
        this.represent = [ represent ];
    }

    // properties
    this.items = [];
    for (var i = 0; i < this.represent.length; i++) {
        this._setItems(this.represent[i]);
    }

    // get the next items for each item
    this._creation = new Map();
    for (var i = 0; i < this.items.length; i++) {
        var key = this.items[i];
        var value = this.items.filter(function(elem) { return elem.rule.symbol == key.next; });
        this._creation.set(key, value);
    }
}

// Closure prototype
Closure.prototype = {

    // go to the next position
    "goAhead": function(symbol) {
        if (symbol == "") {
            return null;
        }

        // get next LR items
        var nexts = [];
        var items = this.items.filter(function(elem) { return elem.next == symbol; });
        for (var i = 0; i < items.length; i++) {
            var ahead = items[i].goAhead();
            if (ahead != null) {
                nexts.push(ahead);
            }
        }
        if (nexts.length == 0) {
            return null;
        }

        // create next closure
        return new Closure(this._rules, nexts);
    },

    // add lookahead set
    "addLookSet": function(collections, first) {
        // set lookahead set for representative items
        for (var i = 0; i < this.represent.length; i++) {
            var item = this.represent[i];
            if (!collections.has(item)) {
                return;
            }
            item.addLook(collections.get(item));
        }

        // propagate to derived items
        for (var i = 0; i < this.items.length; i++) {
            var current = this.items[i];
            var look = this._getNextLook(current, first);
            var items = this._creation.get(current);
            items.forEach(function(value) { value.addLook(look); });
        }
    },

    // whether another instance is equal to this instance
    "equals": function(other) {
        if (other.items.length != this.items.length) {
            return false;
        }
        for (var i = 0; i < other.items.length; i++) {
            if (!other.items[i].equals(this.items[i])) {
                return false;
            }
        }
        return true;
    },

    // set LR items
    "_setItems": function(current) {
        // whether it is the same as an existing item
        if (this.items.some(function(elem) { return elem.equals(current); })) {
            return;
        }

        // add the current LR item
        this.items.push(current);

        // production rule starting with the following symbol
        for (var i = 0; i < this._rules.length; i++) {
            var rule = this._rules[i];
            if (rule.symbol == current.next) {
                this._setItems(new LrItem(rule, 0));
            }
        }
    },

    // get the next lookahead set
    "_getNextLook": function(current, first) {
        // is the next symbol non-terminal?
        var follow = new Set();
        if (!first.has(current.next)) {
            return follow;
        }

        // get next next symbols
        var index = current.position + 1;
        while (index < current.rule.definition.length) {
            var next = current.rule.definition[index];
            if (!first.has(next)) {
                // terminal symbol
                follow.add(next);
                return follow;
            }

            // non-terminal symbol
            var symbols = first.get(next);
            symbols.forEach(function(value) { follow.add(value); });
            if (!symbols.has("&epsilon;")) {
                // when not including epsilon transition
                return follow;
            }

            // remove epsilon
            follow.delete("&epsilon;");
            index++;
        }

        // reach the end of production rule
        current.look.forEach(function(value) { follow.add(value); });
        return follow;
    },

}

// State transition class
var Transition = function(symbol, from, to) {
    // properties
    this.symbol = symbol;
    this.from = from;
    this.to = to;
    this.relation = this._createRelation();
}

// State transition prototype
Transition.prototype = {

    // create transition item relationships
    "_createRelation": function() {
        var relation = new Map();
        var items = this.from.items.filter(function(elem) { return elem.next == this.symbol; }, this);
        for (var i = 0; i < items.length; i++) {
            // before transition
            var prev = items[i];
            var next = null;
            var j = 0;
            while (next == null && j < this.to.items.length) {
                var candidate = this.to.items[j];
                if (candidate.rule == prev.rule && candidate.position == prev.position + 1) {
                    // after transition
                    next = candidate;
                }
                j++;
            }
            relation.set(prev, next);
        }
        return relation;
    },

}

// Set of symbols class
var SymbolSet = function(rules) {
    // non-terminal symbols
    var first = new Map();
    rules.forEach(function(value) { first.set(value.symbol, new Set()); });
    var nrs = rules.filter(function(elem) { return 0 < elem.definition.length && first.has(elem.definition[0]); });
    var trs = rules.filter(function(elem) { return nrs.indexOf(elem) < 0; });

    // FIRST set whose definition symbol starts with a terminal symbol
    for (var i = 0; i < trs.length; i++) {
        var rule = trs[i];
        var term = "&epsilon;";
        if (0 < rule.definition.length) {
            // terminal symbol
            term = rule.definition[0];
        }

        // add a symbol
        var symbols = first.get(rule.symbol);
        symbols.add(term);
    }

    // FIRST set whose definition symbol starts with a non-terminal symbol
    var before = 0;
    var after = 0;
    first.forEach(function(value) { after += value.size; });
    while (before < after) {
        for (var i = 0; i < nrs.length; i++) {
            this._addFirsts(first, nrs[i]);
        }
        before = after;
        after = 0;
        first.forEach(function(value) { after += value.size; });
    }
    this.first = first;
}

// Set of symbols prototype
SymbolSet.prototype = {

    // add FIRST set
    "_addFirsts": function(first, rule) {
        // FIRST set of the production rule
        var self = first.get(rule.symbol);
        var i = 0;
        while (i < rule.definition.length) {
            var symbol = rule.definition[i];
            if (!first.has(symbol)) {
                // terminal symbol
                self.add(symbol);
                return;
            }

            // non-terminal symbol
            var other = first.get(symbol);
            other.forEach(function(value) { self.add(value); });
            if (!other.has("&epsilon;")) {
                // when not including epsilon transition
                return;
            }
            i++;
        }
    },

}

// Compiler class
var Compiler = function() {
    this._clear();
}

// Compiler prototype
Compiler.prototype = {

    // compile execution
    "execute": function(rules) {
        this._clear();
        if (!Array.isArray(rules)) {
            return "There is no production rule.";
        }

        // minimize production rules
        var rest = this._createMinRules(rules.concat());
        var message = this._extractSymbols(rest);
        if (message != "") {
            return message;
        }

        // create closures
        var start = new Closure(this.rules, new LrItem(this.rules[0], 0));
        this._createClosures(start, []);
        this._setLookAhead();

        // create the parsing table
        return this._createTable();
    },

    // clear properties
    "_clear": function() {
        this.rules = [];
        this.closures = [];
        this.transitions = [];
        this.table = [];
        this.symbols = [];
        this.terminals = [];
        this.nonterminals = [];
        this.dummies = [];
    },

    // create a minimal production rules
    "_createMinRules": function(rules) {
        // add start rule
        var start = new Rule("#0#", rules[0].symbol);
        rules.unshift(start);

        // get all definition symbols
        var all = this._getRuleSymbols(rules);
        all.push("#0#");

        // get only rules where non-terminal symbol appears in definition
        this.rules = rules.filter(function(elem) { return 0 <= all.indexOf(elem.symbol); });

        // returns the remaining invalid production rules
        return rules.filter(function(elem) { return all.indexOf(elem.symbol) < 0; });
    },

    // get all definition symbols
    "_getRuleSymbols": function(rules) {
        var symbols = [];
        for (var i = 0; i < rules.length; i++) {
            Array.prototype.push.apply(symbols, rules[i].definition);
        }
        return symbols.filter(this._distinctArray);
    },

    // extract symbols
    "_extractSymbols": function(rest) {
        if (this.rules.length == 0) {
            return "There is no valid production rule.";
        }

        // non-terminal symbols
        var nonterms = this.rules.map(function(elem) { return elem.symbol; });
        nonterms = nonterms.filter(this._distinctArray);
        this.nonterminals = nonterms;

        // terminal symbols
        var used = this._getRuleSymbols(this.rules);
        var terms = used.filter(function(elem) { return nonterms.indexOf(elem) < 0; });
        var fix = terms.filter(function(elem) { return elem.charAt(0) == "'"; });
        var flex = terms.filter(function(elem) { return elem.charAt(0) == "\""; });
        var unknown = terms.filter(function(elem) { return elem.charAt(0) != "'" && elem.charAt(0) != "\""; });
        if (0 < unknown.length) {
            return "no definition of non-terminal symbol: " + unknown.join(" ");
        }
        this.terminals = fix.concat(flex);
        this.symbols = this.terminals.concat(nonterms);
        this.symbols[this.terminals.length] = "$";

        // definition symbols not used
        var dummies = this._getRuleSymbols(rest);
        var unused = dummies.filter(function(elem) { return elem.charAt(0) != "'" && elem.charAt(0) != "\""; });
        if (0 < unused.length) {
            return "no definition of non-terminal symbol: " + unused.join(" ");
        }
        this.dummies = dummies;
        return "";
    },

    // create closures
    "_createClosures": function(start, exists) {
        // whether it is the same as an existing closure
        if (this.closures.some(function(elem) { return elem.equals(start); })) {
            return;
        }
        this.closures.push(start);

        // get next symbols
        var nexts = start.items.map(function(elem) { return elem.next; });
        var symbols = nexts.filter(this._distinctArray);

        // create a state transition
        for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            var ahead = start.goAhead(symbol);
            if (ahead != null) {
                // whether the closure already exists
                var past = null;
                var index = 0;
                while (past == null && index < exists.length) {
                    if (exists[index].equals(ahead)) {
                        past = exists[index];
                    }
                    index++;
                }
                if (past == null) {
                    exists.push(ahead);
                } else {
                    ahead = past;
                }

                // state transition
                var trans = new Transition(symbol, start, ahead);
                this.transitions.push(trans);

                // next closure
                this._createClosures(ahead, exists);
            }
        }
    },

    // set the lookahead set
    "_setLookAhead": function() {
        var symbols = new SymbolSet(this.rules);

        // get all items
        var all = [];
        for (var i = 0; i < this.closures.length; i++) {
            Array.prototype.push.apply(all, this.closures[i].items);
        }

        // add a lookahead set to the first closure
        var collections = new Map();
        var look = new Set();
        look.add("$");
        collections.set(all[0], look);
        this.closures[0].addLookSet(collections, symbols.first);

        // handle all state transitions
        var before = 0;
        var after = all.reduce(this._sumLookSize, 0);
        while (before < after) {
            for (var i = 0; i < this.transitions.length; i++) {
                var trans = this.transitions[i];
                collections.clear();
                trans.relation.forEach(function(value, key) { collections.set(value, key.look); });
                trans.to.addLookSet(collections, symbols.first);
            }

            // whether the lookahead set has been added
            before = after;
            after = all.reduce(this._sumLookSize, 0);
        }
    },

    // create the parsing table
    "_createTable": function() {
        // create an empty table
        var row = [];
        for (var i = 0; i < this.symbols.length; i++) {
            row.push("");
        }
        for (var i = 0; i < this.closures.length; i++) {
            this.table.push(row.concat());
        }

        // set the action
        var error = new Map();
        this._setReduce(error);
        this._setShift(error);

        // are there any errors?
        if (0 < error.size) {
            return "There are collisions.";
        }
        var action = this.table[0].filter(function(elem) { return elem.charAt(0) == "s" || elem.charAt(0) == "r"; });
        if (action.length == 0) {
            return "There is no shift or reduction from the start symbol.";
        }
        return "";
    },

    // set reductions and an acceptance
    "_setReduce": function(error) {
        for (var i = 0; i < this.closures.length; i++) {
            // closure number is line number
            var reduce = this.closures[i].items.filter(function(elem) { return elem.next == ""; });
            for (var j = 0; j < reduce.length; j++) {
                var item = reduce[j];
                var look = [];
                item.look.forEach(function(value) { look.push(value); });
                for (var k = 0; k < look.length; k++) {
                    var symbol = look[k];
                    var index = this.symbols.indexOf(symbol);
                    var action = "r" + this.rules.indexOf(item.rule);
                    if (this.table[i][index] == "") {
                        // reduce or accept
                        this.table[i][index] = action;
                    } else {
                        // collision
                        this.table[i][index] += "/" + action;
                        if (!error.has(i)) {
                            error.set(i, []);
                        }
                        var list = error.get(i);
                        list.push(symbol);
                    }
                }
            }
        }
    },

    // set shifts and transitions
    "_setShift": function(error) {
        for (var i = 0; i < this.transitions.length; i++) {
            var trans = this.transitions[i];
            var from = this.closures.indexOf(trans.from);
            var index = this.symbols.indexOf(trans.symbol);
            var action = this.closures.indexOf(trans.to);
            if (this.nonterminals.indexOf(trans.symbol) < 0) {
                action = "s" + action;
            } else {
                action = "g" + action;
            }
            if (this.table[from][index] == "") {
                // shift or transition
                this.table[from][index] = action;
            } else {
                // collision
                this.table[from][index] += "/" + action;
                if (!error.has(from)) {
                    error.set(from, []);
                }
                var list = error.get(from);
                list.push(trans.symbol);
            }
        }
    },

    // remove duplicate elements in array
    "_distinctArray": function(elem, idx, arr) {
        return arr.indexOf(elem) == idx;
    },

    // sum of the number of lookahead symbols
    "_sumLookSize": function(acc, cur) {
        return acc + cur.look.size;
    },

}

