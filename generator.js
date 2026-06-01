// Program generator class
class Generator {

    // constructor
    constructor() {
        this.ignoreCase = false;
    }

    // create the JavaScript program
    createScript(compiler, tree) {
        // create lists of symbols
        const flagBlock = this.#getFlags();
        const termBlock = this.#getStrings("terminals", compiler.terminals);
        const dummyBlock = this.#getStrings("dummies", compiler.dummies);
        const ruleBlock = this.#getRules(compiler.rules);
        const tableBlock = this.#getTable(compiler.table);

        // grammar
        let lines = [];
        lines = lines.concat([ "// Grammar object", "const Grammar = {", "" ]);
        lines = lines.concat(this.#getBlock(flagBlock));
        lines = lines.concat(this.#getBlock(termBlock));
        lines = lines.concat(this.#getBlock(dummyBlock));
        lines = lines.concat(this.#getBlock(ruleBlock));
        lines = lines.concat(this.#getBlock(tableBlock));
        lines = lines.concat([ "}", "" ]);

        // converter
        const converters = this.#getConverters(compiler.nonterminals, tree);
        lines = lines.concat([ "// Syntax converter", "const Converter = {", "" ]);
        lines = lines.concat(this.#getBlock(converters));
        lines = lines.concat([ "}", "", "" ]);
        return lines.join("\n");
    }

    // get the flags
    #getFlags() {
        let flag = "";
        if (this.ignoreCase) {
            flag = "i";
        }
        const lines = [];
        lines.push(`"flag": "${flag}",`);
        lines.push("");
        return lines;
    }

    // get a list of strings
    #getStrings(title, collection) {
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
        return this.#getArray(title, after);
    }

    // get a list of production rules
    #getRules(rules) {
        const lines = rules.map(elem => `"${elem.symbol}=${elem.definition.length}",`);
        return this.#getArray("rules", lines);
    }

    // get the parsing table
    #getTable(table) {
        const lines = table.map(row => `[ ${row.map(elem => `"${elem}"`).join(", ")} ],`);
        return this.#getArray("table", lines);
    }

    // get array elements
    #getArray(title, collection) {
        // title
        let lines = [];
        if (title == "") {
            lines.push("[");
        } else {
            lines.push(`"${title}": [`);
        }

        // block
        lines = lines.concat(this.#getBlock(collection));
        lines.push("],");
        lines.push("");
        return lines;
    }

    // get block
    #getBlock(collection) {
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
    }

    // get syntax converters
    #getConverters(nonterms, tree) {
        let lines = [];
        for (const name of nonterms) {
            const rules = tree.children.filter(elem => elem.symbols[0] == name);
            if (0 < rules.length) {
                lines = lines.concat(rules.map(elem => `// ${this.#getDefinition(elem)}`));
                lines.push(`"${name}": function(tree) {`);
                lines.push("},");
                lines.push("");
            }
        }
        return lines;
    }

    // get the definition string of the tree
    #getDefinition(tree) {
        if (tree.text != "") {
            return tree.text;
        }

        // concatenation of child elements
        const symbols = tree.children.map(this.#getDefinition, this);
        let delim = " ";
        if (tree.label == "Term" || tree.label == "Quot") {
            delim = "";
        }
        return symbols.join(delim);
    }

}

