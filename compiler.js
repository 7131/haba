// Production rule class
class Rule {

    // constructor
    constructor(symbol, definition) {
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
                this.definition = this.definition.concat(definition);
            } else {
                this.definition.push(definition);
            }
        }
    }

    // convert to string
    toString() {
        const symbols = [ this.symbol, "::=" ].concat(this.definition);
        symbols.push(";");
        return symbols.join(" ");
    }

}

// LR item class
class LrItem {
    #lr0;

    // constructor
    constructor(rule, position) {
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
        const before = rule.definition.slice(0, this.position);
        const after = rule.definition.slice(this.position);
        const symbols = [ rule.symbol, "::=" ].concat(before, [ "\u2022" ], after);
        this.#lr0 = symbols.join(" ");
    }

    // go to the next position
    goAhead() {
        // confirm current position
        if (this.rule.length <= this.position) {
            return null;
        }

        // create next LR item
        return new LrItem(this.rule, this.position + 1);
    }

    // add lookahead symbols
    addLook(collection) {
        collection.forEach(this.look.add, this.look);
    }

    // get item string
    getItem() {
        return this.#lr0;
    }

    // whether another instance is equal to this instance
    equals(other) {
        return other.getItem() == this.getItem();
    }

}

// Closure class
class Closure {
    #rules;
    #creation = new Map();

    // constructor
    constructor(rules, represent) {
        // fields
        this.#rules = rules;
        if (Array.isArray(represent)) {
            this.represent = represent;
        } else {
            this.represent = [ represent ];
        }

        // properties
        this.items = [];
        this.represent.forEach(this.#setItems, this);

        // get the next items for each item
        for (const key of this.items) {
            const value = this.items.filter(elem => elem.rule.symbol == key.next);
            this.#creation.set(key, value);
        }
    }

    // go to the next position
    goAhead(symbol) {
        if (symbol == "") {
            return null;
        }

        // get next LR items
        const nexts = [];
        for (const item of this.items.filter(elem => elem.next == symbol)) {
            const ahead = item.goAhead();
            if (ahead != null) {
                nexts.push(ahead);
            }
        }
        if (nexts.length == 0) {
            return null;
        }

        // create next closure
        return new Closure(this.#rules, nexts);
    }

    // add lookahead set
    addLookSet(collections, first) {
        // set lookahead set for representative items
        for (const item of this.represent) {
            if (!collections.has(item)) {
                return;
            }
            item.addLook(collections.get(item));
        }

        // propagate to derived items
        for (const current of this.items) {
            const look = this.#getNextLook(current, first);
            this.#creation.get(current).forEach(elem => elem.addLook(look));
        }
    }

    // whether another instance is equal to this instance
    equals(other) {
        if (other.items.length != this.items.length) {
            return false;
        }
        for (let i = 0; i < other.items.length; i++) {
            if (!other.items[i].equals(this.items[i])) {
                return false;
            }
        }
        return true;
    }

    // set LR items
    #setItems(current) {
        // whether it is the same as an existing item
        if (this.items.some(elem => elem.equals(current))) {
            return;
        }

        // add the current LR item
        this.items.push(current);

        // production rule starting with the following symbol
        for (const rule of this.#rules.filter(elem => elem.symbol == current.next)) {
            this.#setItems(new LrItem(rule, 0));
        }
    }

    // get the next lookahead set
    #getNextLook(current, first) {
        // is the next symbol non-terminal?
        const follow = new Set();
        if (!first.has(current.next)) {
            return follow;
        }

        // get next next symbols
        let index = current.position + 1;
        while (index < current.rule.definition.length) {
            const next = current.rule.definition[index];
            if (!first.has(next)) {
                // terminal symbol
                follow.add(next);
                return follow;
            }

            // non-terminal symbol
            const symbols = first.get(next);
            symbols.forEach(follow.add, follow);
            if (!symbols.has("#epsilon#")) {
                // when not including epsilon transition
                return follow;
            }

            // remove epsilon
            follow.delete("#epsilon#");
            index++;
        }

        // reach the end of production rule
        current.look.forEach(follow.add, follow);
        return follow;
    }

}

// State transition class
class Transition {

    // constructor
    constructor(symbol, from, to) {
        // properties
        this.symbol = symbol;
        this.from = from;
        this.to = to;
        this.relation = this.#createRelation();
    }

    // create transition item relationships
    #createRelation() {
        const relation = new Map();
        const items = this.from.items.filter(elem => elem.next == this.symbol);
        for (const prev of items) {
            // before transition
            let next = null;
            let i = 0;
            while (next == null && i < this.to.items.length) {
                const candidate = this.to.items[i];
                if (candidate.rule == prev.rule && candidate.position == prev.position + 1) {
                    // after transition
                    next = candidate;
                }
                i++;
            }
            relation.set(prev, next);
        }
        return relation;
    }

}

// Set of symbols class
class SymbolSet {

    // constructor
    constructor(rules) {
        // non-terminal symbols
        const first = new Map();
        rules.forEach(elem => first.set(elem.symbol, new Set()));
        const nrs = rules.filter(elem => 0 < elem.definition.length && first.has(elem.definition[0]));
        const trs = rules.filter(elem => nrs.indexOf(elem) < 0);

        // FIRST set whose definition symbol starts with a terminal symbol
        for (const rule of trs) {
            let term = "#epsilon#";
            if (0 < rule.definition.length) {
                term = rule.definition[0];
            }
            first.get(rule.symbol).add(term);
        }

        // FIRST set whose definition symbol starts with a non-terminal symbol
        const sum = (acc, cur) => acc + cur.size;
        let before = 0;
        let after = first.values().reduce(sum, 0);
        while (before < after) {
            nrs.forEach(elem => this.#addFirsts(first, elem));
            before = after;
            after = first.values().reduce(sum, 0);
        }
        this.first = first;
    }

    // add FIRST set
    #addFirsts(first, rule) {
        // FIRST set of the production rule
        const self = first.get(rule.symbol);
        let i = 0;
        while (i < rule.definition.length) {
            const symbol = rule.definition[i];
            if (!first.has(symbol)) {
                // terminal symbol
                self.add(symbol);
                return;
            }

            // non-terminal symbol
            const other = first.get(symbol);
            other.forEach(self.add, self);
            if (!other.has("#epsilon#")) {
                // when not including epsilon transition
                return;
            }
            i++;
        }
    }

}

// Compiler class
class Compiler {

    // constructor
    constructor() {
        this.#clear();
    }

    // compile execution
    execute(rules) {
        this.#clear();
        if (!Array.isArray(rules)) {
            return "There is no production rule.";
        }

        // minimize production rules
        const rest = this.#createMinRules(rules.concat());
        const message = this.#extractSymbols(rest);
        if (message != "") {
            return message;
        }

        // create closures
        const start = new Closure(this.rules, new LrItem(this.rules[0], 0));
        this.#createClosures(start, []);
        this.#setLookAhead();

        // create the parsing table
        return this.#createTable();
    }

    // clear properties
    #clear() {
        this.rules = [];
        this.closures = [];
        this.transitions = [];
        this.table = [];
        this.symbols = [];
        this.terminals = [];
        this.nonterminals = [];
        this.dummies = [];
    }

    // create a minimal production rules
    #createMinRules(rules) {
        // add start rule
        const start = new Rule("#0#", rules[0].symbol);
        rules.unshift(start);

        // get all definition symbols
        const all = this.#getRuleSymbols(rules);
        all.push("#0#");

        // get only rules where non-terminal symbol appears in definition
        this.rules = rules.filter(elem => 0 <= all.indexOf(elem.symbol));

        // returns the remaining invalid production rules
        return rules.filter(elem => all.indexOf(elem.symbol) < 0);
    }

    // get all definition symbols
    #getRuleSymbols(rules) {
        const symbols = rules.map(elem => elem.definition).flat();
        return symbols.filter(this.#distinctArray);
    }

    // extract symbols
    #extractSymbols(rest) {
        if (this.rules.length == 0) {
            return "There is no valid production rule.";
        }

        // non-terminal symbols
        const nonterms = this.rules.map(elem => elem.symbol).filter(this.#distinctArray);
        this.nonterminals = nonterms;

        // terminal symbols
        const used = this.#getRuleSymbols(this.rules);
        const terms = used.filter(elem => nonterms.indexOf(elem) < 0);
        const fix = terms.filter(elem => elem.charAt(0) == "'");
        const flex = terms.filter(elem => elem.charAt(0) == "\"");
        const find = elem => elem.charAt(0) != "'" && elem.charAt(0) != "\"";
        const unknown = terms.filter(find);
        if (0 < unknown.length) {
            return `no definition of non-terminal symbol: ${unknown.join(" ")}`;
        }
        this.terminals = fix.concat(flex);
        this.symbols = this.terminals.concat(nonterms);
        this.symbols[this.terminals.length] = "$";

        // definition symbols not used
        const dummies = this.#getRuleSymbols(rest);
        const unused = dummies.filter(find);
        if (0 < unused.length) {
            return `no definition of non-terminal symbol: ${unused.join(" ")}`;
        }
        this.dummies = dummies;
        return "";
    }

    // create closures
    #createClosures(start, exists) {
        // whether it is the same as an existing closure
        if (this.closures.some(elem => elem.equals(start))) {
            return;
        }
        this.closures.push(start);

        // get next symbols
        const nexts = start.items.map(elem => elem.next);
        const symbols = nexts.filter(this.#distinctArray);

        // create a state transition
        for (const symbol of symbols) {
            let ahead = start.goAhead(symbol);
            if (ahead != null) {
                // whether the closure already exists
                let past = null;
                let index = 0;
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
                const trans = new Transition(symbol, start, ahead);
                this.transitions.push(trans);

                // next closure
                this.#createClosures(ahead, exists);
            }
        }
    }

    // set the lookahead set
    #setLookAhead() {
        const symbols = new SymbolSet(this.rules);
        const all = this.closures.map(elem => elem.items).flat();

        // add a lookahead set to the first closure
        const collections = new Map();
        const look = new Set();
        look.add("$");
        collections.set(all[0], look);
        this.closures[0].addLookSet(collections, symbols.first);

        // handle all state transitions
        const sum = (acc, cur) => acc + cur.look.size;
        let before = 0;
        let after = all.reduce(sum, 0);
        while (before < after) {
            for (const trans of this.transitions) {
                collections.clear();
                trans.relation.forEach((value, key) => collections.set(value, key.look));
                trans.to.addLookSet(collections, symbols.first);
            }

            // whether the lookahead set has been added
            before = after;
            after = all.reduce(sum, 0);
        }
    }

    // create the parsing table
    #createTable() {
        const row = new Array(this.symbols.length).fill("");
        this.table = new Array(this.closures.length).fill().map(elem => row.concat());

        // set the action
        const error = new Map();
        this.#setReduce(error);
        this.#setShift(error);

        // are there any errors?
        if (0 < error.size) {
            return "There are collisions.";
        }
        const action = this.table[0].filter(elem => elem.charAt(0) == "s" || elem.charAt(0) == "r");
        if (action.length == 0) {
            return "There is no shift or reduction from the start symbol.";
        }
        return "";
    }

    // set reductions and an acceptance
    #setReduce(error) {
        for (let i = 0; i < this.closures.length; i++) {
            // closure number is line number
            const reduce = this.closures[i].items.filter(elem => elem.next == "");
            for (const item of reduce) {
                for (const symbol of item.look) {
                    const index = this.symbols.indexOf(symbol);
                    const action = `r${this.rules.indexOf(item.rule)}`;
                    if (this.table[i][index] == "") {
                        // reduce or accept
                        this.table[i][index] = action;
                    } else {
                        // collision
                        this.table[i][index] += `/${action}`;
                        if (!error.has(i)) {
                            error.set(i, []);
                        }
                        error.get(i).push(symbol);
                    }
                }
            }
        }
    }

    // set shifts and transitions
    #setShift(error) {
        for (const trans of this.transitions) {
            const from = this.closures.indexOf(trans.from);
            const index = this.symbols.indexOf(trans.symbol);
            let action = this.closures.indexOf(trans.to);
            if (this.nonterminals.indexOf(trans.symbol) < 0) {
                action = `s${action}`;
            } else {
                action = `g${action}`;
            }
            if (this.table[from][index] == "") {
                // shift or transition
                this.table[from][index] = action;
            } else {
                // collision
                this.table[from][index] += `/${action}`;
                if (!error.has(from)) {
                    error.set(from, []);
                }
                error.get(from).push(trans.symbol);
            }
        }
    }

    // remove duplicate elements in array
    #distinctArray(val, idx, arr) {
        return arr.indexOf(val) == idx;
    }

}

