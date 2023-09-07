// Grammar object
const Grammar = {

    "flag": "",

    "terminals": [
        "::=",
        ";",
        "\\|",
        "\\(",
        "\\)",
        "\\?",
        "\\*",
        "\\+",
        "[a-zA-Z_][a-zA-Z_0-9]*",
        "'(''|[^'])+'",
        "\"(\"\"|[^\"])+\"",
    ],

    "dummies": [
        "\\s+",
        "//[^\\n]*(\\n|$)",
        "/\\*((?!\\*/)[\\s\\S])*\\*/",
    ],

    "rules": [
        "#0#=1",
        "Gram=1",
        "#1#=2",
        "#1#=1",
        "Rule=4",
        "#2#=1",
        "#2#=0",
        "Name=1",
        "Expr=2",
        "#3#=3",
        "#3#=0",
        "List=1",
        "#4#=2",
        "#4#=1",
        "Term=2",
        "#5#=1",
        "#5#=0",
        "Fact=1",
        "#6#=1",
        "#6#=1",
        "#6#=1",
        "#6#=1",
        "Fixd=1",
        "Flex=1",
        "Quot=3",
        "Rept=1",
        "#7#=1",
        "#7#=1",
        "#7#=1",
    ],

    "table": [
        [ "", "", "", "", "", "", "", "", "s28", "", "", "", "g1", "g2", "g34", "", "g4", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "", "", "", "", "", "", "", "", "r0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "", "", "", "", "", "s28", "", "", "r1", "", "", "g3", "", "g4", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "", "", "", "", "", "r2", "", "", "r2", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "s5", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r6", "", "s30", "", "", "", "", "s28", "s24", "s26", "", "", "", "", "g6", "g27", "g8", "", "g9", "g13", "g33", "", "g15", "g22", "g23", "g25", "g29", "", "" ],
        [ "", "s7", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "", "", "", "", "", "r4", "", "", "r4", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r5", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r10", "r10", "", "r10", "", "", "", "", "", "", "", "", "", "", "", "", "", "g10", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r8", "s11", "", "r8", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "s30", "", "", "", "", "s28", "s24", "s26", "", "", "", "", "", "g27", "", "", "g12", "g13", "g33", "", "g15", "g22", "g23", "g25", "g29", "", "" ],
        [ "", "r9", "r9", "", "r9", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r11", "r11", "s30", "r11", "", "", "", "s28", "s24", "s26", "", "", "", "", "", "g27", "", "", "", "", "g14", "", "g15", "g22", "g23", "g25", "g29", "", "" ],
        [ "", "r12", "r12", "r12", "r12", "", "", "", "r12", "r12", "r12", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r16", "r16", "r16", "r16", "s19", "s20", "s21", "r16", "r16", "r16", "", "", "", "", "", "", "", "", "", "", "", "g16", "", "", "", "", "", "g17", "g18" ],
        [ "", "r14", "r14", "r14", "r14", "", "", "", "r14", "r14", "r14", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r15", "r15", "r15", "r15", "", "", "", "r15", "r15", "r15", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r25", "r25", "r25", "r25", "", "", "", "r25", "r25", "r25", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r26", "r26", "r26", "r26", "", "", "", "r26", "r26", "r26", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r27", "r27", "r27", "r27", "", "", "", "r27", "r27", "r27", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r28", "r28", "r28", "r28", "", "", "", "r28", "r28", "r28", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r17", "r17", "r17", "r17", "r17", "r17", "r17", "r17", "r17", "r17", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r18", "r18", "r18", "r18", "r18", "r18", "r18", "r18", "r18", "r18", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r22", "r22", "r22", "r22", "r22", "r22", "r22", "r22", "r22", "r22", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r19", "r19", "r19", "r19", "r19", "r19", "r19", "r19", "r19", "r19", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r23", "r23", "r23", "r23", "r23", "r23", "r23", "r23", "r23", "r23", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r20", "r20", "r20", "r20", "r20", "r20", "r20", "r20", "r20", "r20", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "r7", "r7", "r7", "r7", "r7", "r7", "r7", "r7", "r7", "r7", "r7", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r21", "r21", "r21", "r21", "r21", "r21", "r21", "r21", "r21", "r21", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "s30", "", "", "", "", "s28", "s24", "s26", "", "", "", "", "", "g27", "g31", "", "g9", "g13", "g33", "", "g15", "g22", "g23", "g25", "g29", "", "" ],
        [ "", "", "", "", "s32", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r24", "r24", "r24", "r24", "r24", "r24", "r24", "r24", "r24", "r24", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "r13", "r13", "r13", "r13", "", "", "", "r13", "r13", "r13", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
        [ "", "", "", "", "", "", "", "", "r3", "", "", "r3", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
    ],

}

// Syntax converter
const Converter = {

    // Gram ::= Rule+ ;
    "Gram": function(tree) {
        for (const child of tree.children) {
            this._addSymbols(tree, child.symbols);
            this._addRules(tree, child.rules);
        }
        this._number = 0;
    },

    // Rule ::= Name '::=' Expr? ';' ;
    "Rule": function(tree) {
        const name = tree.children[0].symbols[0];
        this._addSymbols(tree, name);
        if (3 < tree.children.length) {
            // with Expr
            this._addNewRule(tree, name, tree.children[2].symbols);
            this._addRules(tree, tree.children[2].rules);
        } else {
            // without Expr
            this._addNewRule(tree, name);
        }
    },

    // Name ::= "[a-zA-Z_][a-zA-Z_0-9]*" ;
    "Name": function(tree) {
        const symbol = tree.children[0].text;
        tree.text = symbol;
        this._addSymbols(tree, symbol);
    },

    // Expr ::= List ('|' List)* ;
    "Expr": function(tree) {
        if (tree.children.length == 1) {
            // only one element
            this._addSymbols(tree, tree.children[0].symbols);
            this._addRules(tree, tree.children[0].rules);
        } else {
            // two elements or more
            const name = this._createSymbol();
            this._addSymbols(tree, name);

            // expand alternate symbols
            for (let i = 0; i < tree.children.length; i += 2) {
                this._addNewRule(tree, name, tree.children[i].symbols);
                this._addRules(tree, tree.children[i].rules);
            }
        }
    },

    // List ::= Term+ ;
    "List": function(tree) {
        for (const child of tree.children) {
            this._addSymbols(tree, child.symbols);
            this._addRules(tree, child.rules);
        }
    },

    // Term ::= Fact Rept? ;
    "Term": function(tree) {
        if (tree.children.length < 2) {
            // without Rept
            this._addSymbols(tree, tree.children[0].symbols);
            this._addRules(tree, tree.children[0].rules);
            return;
        }

        // with Rept
        const name = this._createSymbol();
        this._addSymbols(tree, name);

        // expand repeat symbols
        const definition = tree.children[0].symbols.concat();
        definition.unshift(name);
        switch (tree.children[1].symbols[0]) {
            case "?":
                this._addNewRule(tree, name, tree.children[0].symbols);
                this._addNewRule(tree, name);
                break;

            case "*":
                this._addNewRule(tree, name, definition);
                this._addNewRule(tree, name);
                break;

            case "+":
                this._addNewRule(tree, name, definition);
                this._addNewRule(tree, name, tree.children[0].symbols);
                break;
        }
        this._addRules(tree, tree.children[0].rules);
    },

    // Fact ::= Fixd | Flex | Name | Quot ;
    "Fact": function(tree) {
        this._addSymbols(tree, tree.children[0].symbols);
        this._addRules(tree, tree.children[0].rules);
    },

    // Fixd ::= "'(''|[^'])+'" ;
    "Fixd": function(tree) {
        const symbol = tree.children[0].text;
        tree.text = symbol;
        this._addSymbols(tree, symbol);
    },

    // Flex ::= """(""""|[^""])+""" ;
    "Flex": function(tree) {
        const symbol = tree.children[0].text;
        tree.text = symbol;
        this._addSymbols(tree, symbol);
    },

    // Quot ::= '(' Expr ')' ;
    "Quot": function(tree) {
        this._addSymbols(tree, tree.children[1].symbols);
        this._addRules(tree, tree.children[1].rules);
    },

    // Rept ::= '?' | '*' | '+' ;
    "Rept": function(tree) {
        const symbol = tree.children[0].text;
        tree.text = symbol;
        this._addSymbols(tree, symbol);
    },

    // current number for automatically generating symbol
    "_number": 0,

    // create a new non-terminal symbol
    "_createSymbol": function() {
        this._number++;
        return "#" + this._number + "#";
    },

    // add symbols
    "_addSymbols": function(tree, symbols) {
        // no symbols yet
        if (!Array.isArray(tree.symbols)) {
            tree.symbols = [];
        }
        if (symbols == null) {
            return;
        }

        // add symbol(s) to the tree
        if (Array.isArray(symbols)) {
            Array.prototype.push.apply(tree.symbols, symbols);
        } else {
            tree.symbols.push(symbols);
        }
    },

    // add rules
    "_addRules": function(tree, rules) {
        // no rules yet
        if (!Array.isArray(tree.rules)) {
            tree.rules = [];
        }
        if (rules == null) {
            return;
        }

        // add rule(s) to the tree
        if (Array.isArray(rules)) {
            Array.prototype.push.apply(tree.rules, rules);
        } else {
            tree.rules.push(rules);
        }
    },

    // create and add a new production rule
    "_addNewRule": function(tree, name, definition) {
        // no rules yet
        if (!Array.isArray(tree.rules)) {
            tree.rules = [];
        }

        // add a new rule to the tree
        tree.rules.push(new Rule(name, definition));
    },

}

