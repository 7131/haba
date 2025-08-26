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
        let lines = [];
        lines = lines.concat([ "// Grammar object", "const Grammar = {", "" ]);
        lines = lines.concat(this._getBlock(flagBlock));
        lines = lines.concat(this._getBlock(termBlock));
        lines = lines.concat(this._getBlock(dummyBlock));
        lines = lines.concat(this._getBlock(ruleBlock));
        lines = lines.concat(this._getBlock(tableBlock));
        lines = lines.concat([ "}", "" ]);

        // converter
        const converters = this._getConverters(compiler.nonterminals, tree);
        lines = lines.concat([ "// Syntax converter", "const Converter = {", "" ]);
        lines = lines.concat(this._getBlock(converters));
        lines = lines.concat([ "}", "", "" ]);
        return lines.join("\n");
    },

    // get the flags
    "_getFlags": function() {
        let flag = "";
        if (this.ignoreCase) {
            flag = "i";
        }
        const lines = [];
        lines.push(`"flag": "${flag}",`);
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
        const after = symbols.map(elem => `"${elem}",`);
        return this._getArray(title, after);
    },

    // get a list of production rules
    "_getRules": function(rules) {
        const lines = rules.map(elem => `"${elem.symbol}=${elem.definition.length}",`);
        return this._getArray("rules", lines);
    },

    // get the parsing table
    "_getTable": function(table) {
        const lines = table.map(row => `[ ${row.map(elem => `"${elem}"`).join(", ")} ],`);
        return this._getArray("table", lines);
    },

    // get array elements
    "_getArray": function(title, collection) {
        // title
        let lines = [];
        if (title == "") {
            lines.push("[");
        } else {
            lines.push(`"${title}": [`);
        }

        // block
        lines = lines.concat(this._getBlock(collection));
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
                lines.push(`    ${text}`);
            }
        }
        return lines;
    },

    // get syntax converters
    "_getConverters": function(nonterms, tree) {
        let lines = [];
        for (const name of nonterms) {
            const rules = tree.children.filter(elem => elem.symbols[0] == name);
            if (0 < rules.length) {
                lines = lines.concat(rules.map(elem => `// ${this._getDefinition(elem)}`));
                lines.push(`"${name}": function(tree) {`);
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

