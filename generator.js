// Program generator class
const Generator = function() {
    this.ignoreCase = false;
}

// Program generator prototype
Generator.prototype = {

    // create the JavaScript program
    "createScript": function(compiler, tree) {
        // create lists of symbols
        const flagBlock = this._getFlags();
        const termBlock = this._getStrings("terminals", compiler.terminals);
        const dummyBlock = this._getStrings("dummies", compiler.dummies);
        const ruleBlock = this._getRules(compiler.rules);
        const tableBlock = this._getTable(compiler.table);

        // grammar
        const lines = [];
        Array.prototype.push.apply(lines, [ "// Grammar object", "const Grammar = {", "" ]);
        Array.prototype.push.apply(lines, this._getBlock(flagBlock));
        Array.prototype.push.apply(lines, this._getBlock(termBlock));
        Array.prototype.push.apply(lines, this._getBlock(dummyBlock));
        Array.prototype.push.apply(lines, this._getBlock(ruleBlock));
        Array.prototype.push.apply(lines, this._getBlock(tableBlock));
        Array.prototype.push.apply(lines, [ "}", "" ]);

        // converter
        const converters = this._getConverters(compiler.nonterminals, tree);
        Array.prototype.push.apply(lines, [ "// Syntax converter", "const Converter = {", "" ]);
        Array.prototype.push.apply(lines, this._getBlock(converters));
        Array.prototype.push.apply(lines, [ "}", "", "" ]);
        return lines.join("\n");
    },

    // get the flags
    "_getFlags": function() {
        let flag = "";
        if (this.ignoreCase) {
            flag = "i";
        }
        const lines = [];
        lines.push("\"flag\": \"" + flag + "\",");
        lines.push("");
        return lines;
    },

    // get a list of strings
    "_getStrings": function(title, collection) {
        const symbols = [];
        const fixes = /^'((''|[^'])+)'$/;
        const regex = /^"((""|[^"])+)"$/;
        for (let text of collection) {
            if (fixes.test(text)) {
                // fixed string
                const inside = fixes.exec(text)[1];
                const escape = inside.replace(/\\/g, "\\\\\\\\").replace(/[\[\]\^\$\.\|\?\*\+\(\)]/g, "\\\\$&");
                text = escape.replace(/"/g, "\\\"").replace(/''/g, "'");
            } else if (regex.test(text)) {
                // regular expression
                const inside = regex.exec(text)[1];
                const escape = inside.replace(/\\/g, "\\\\");
                text = escape.replace(/""/g, "\\\"");
            }
            symbols.push(text);
        }

        // create row list
        const after = symbols.map(elem => "\"" + elem + "\",");
        return this._getArray(title, after);
    },

    // get a list of production rules
    "_getRules": function(rules) {
        const lines = [];
        for (const rule of rules) {
            lines.push("\"" + rule.symbol + "=" + rule.definition.length + "\",");
        }
        return this._getArray("rules", lines);
    },

    // get the parsing table
    "_getTable": function(table) {
        const select = elem => "\"" + elem + "\"";
        const lines = [];
        for (const row of table) {
            lines.push("[ " + row.map(select).join(", ") + " ],");
        }
        return this._getArray("table", lines);
    },

    // get array elements
    "_getArray": function(title, collection) {
        // title
        const lines = [];
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
        const lines = [];
        for (const text of collection) {
            // indent
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
        const lines = [];
        for (const name of nonterms) {
            const rules = tree.children.filter(elem => elem.symbols[0] == name);
            if (0 < rules.length) {
                for (const rule of rules) {
                    lines.push("// " + this._getDefinition(rule));
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
        const symbols = tree.children.map(this._getDefinition, this);
        let delim = " ";
        if (tree.label == "Term" || tree.label == "Quot") {
            delim = "";
        }
        return symbols.join(delim);
    },

}

