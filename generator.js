// Program generator class
var Generator = function() {
    this.ignoreCase = false;
}

// Program generator prototype
Generator.prototype = {

    // create the JavaScript program
    "createScript": function(compiler, tree) {
        // create lists of symbols
        var flagBlock = this._getFlags();
        var termBlock = this._getStrings("terminals", compiler.terminals);
        var dummyBlock = this._getStrings("dummies", compiler.dummies);
        var ruleBlock = this._getRules(compiler.rules);
        var tableBlock = this._getTable(compiler.table);

        // grammar
        var lines = [];
        Array.prototype.push.apply(lines, [ "// Grammar object", "var Grammar = {", "" ]);
        Array.prototype.push.apply(lines, this._getBlock(flagBlock));
        Array.prototype.push.apply(lines, this._getBlock(termBlock));
        Array.prototype.push.apply(lines, this._getBlock(dummyBlock));
        Array.prototype.push.apply(lines, this._getBlock(ruleBlock));
        Array.prototype.push.apply(lines, this._getBlock(tableBlock));
        Array.prototype.push.apply(lines, [ "}", "" ]);

        // converter
        var converters = this._getConverters(compiler.nonterminals, tree);
        Array.prototype.push.apply(lines, [ "// Syntax converter", "var Converter = {", "" ]);
        Array.prototype.push.apply(lines, this._getBlock(converters));
        Array.prototype.push.apply(lines, [ "}", "", "" ]);
        return lines.join("\n");
    },

    // get the flags
    "_getFlags": function() {
        var flag = "";
        if (this.ignoreCase) {
            flag = "i";
        }
        var lines = [];
        lines.push("\"flag\": \"" + flag + "\",");
        lines.push("");
        return lines;
    },

    // get a list of strings
    "_getStrings": function(title, collection) {
        var symbols = [];
        var fixes = /^'((''|[^'])+)'$/;
        var regex = /^"((""|[^"])+)"$/;
        for (var i = 0; i < collection.length; i++) {
            var text = collection[i];
            if (fixes.test(text)) {
                // fixed string
                var inside = fixes.exec(text)[1];
                var escape = inside.replace(/\\/g, "\\\\\\\\").replace(/[\[\]\^\$\.\|\?\*\+\(\)]/g, "\\\\$&");
                text = escape.replace(/"/g, "\\\"").replace(/''/g, "'");
            } else if (regex.test(text)) {
                // regular expression
                var inside = regex.exec(text)[1];
                var escape = inside.replace(/\\/g, "\\\\");
                text = escape.replace(/""/g, "\\\"");
            }
            symbols.push(text);
        }

        // create row list
        var after = symbols.map(function(elem) { return "\"" + elem + "\","; });
        return this._getArray(title, after);
    },

    // get a list of production rules
    "_getRules": function(rules) {
        var lines = [];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            lines.push("\"" + rule.symbol + "=" + rule.definition.length + "\",");
        }
        return this._getArray("rules", lines);
    },

    // get the parsing table
    "_getTable": function(table) {
        var lines = [];
        for (var i = 0; i < table.length; i++) {
            var quote = table[i].map(function(elem) { return "\"" + elem + "\""; });
            lines.push("[ " + quote.join(", ") + " ],");
        }
        return this._getArray("table", lines);
    },

    // get array elements
    "_getArray": function(title, collection) {
        // title
        var lines = [];
        if (title == "") {
            lines.push("[");
        } else {
            lines.push("\"" + title + "\": [");
        }

        // block
        Array.prototype.push.apply(lines, this._getBlock(collection));
        lines.push("],");
        lines.push("");
        return lines;
    },

    // get block
    "_getBlock": function(collection) {
        var lines = [];
        for (var i = 0; i < collection.length; i++) {
            // indent
            var text = collection[i];
            if (text.trim() == "") {
                lines.push("");
            } else {
                lines.push("    " + text);
            }
        }
        return lines;
    },

    // get syntax converters
    "_getConverters": function(nonterms, tree) {
        var lines = [];
        for (var i = 0; i < nonterms.length; i++) {
            var name = nonterms[i];
            var rules = tree.children.filter(function(elem) { return elem.symbols[0] == name; });
            if (0 < rules.length) {
                for (var j = 0; j < rules.length; j++) {
                    lines.push("// " + this._getDefinition(rules[j]));
                }
                lines.push("\"" + name + "\": function(tree) {");
                lines.push("},");
                lines.push("");
            }
        }
        return lines;
    },

    // get the definition string of the tree
    "_getDefinition": function(tree) {
        if (tree.text != "") {
            return tree.text;
        }

        // concatenation of child elements
        var symbols = tree.children.map(function(elem) { return this._getDefinition(elem); }, this);
        var delim = " ";
        if (tree.label == "Term" || tree.label == "Quot") {
            delim = "";
        }
        return symbols.join(delim);
    },

}

