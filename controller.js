// Controller class
const Controller = function() {
    // fields
    this._parser = new Parser(Grammar, Converter);
    this._compiler = new Compiler();
    this._generator = new Generator();

    // events
    window.addEventListener("load", this._initialize.bind(this));
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields
    "_initialize": function(e) {
        // DOM elements
        this._resultArea = document.getElementById("result");
        this._treeArea = document.getElementById("tree");
        this._elementArea = document.getElementById("element");
        this._dummyArea = document.getElementById("dummy");
        this._ruleArea = document.getElementById("rule");
        this._closureArea = document.getElementById("closure");
        this._transitionArea = document.getElementById("transition");
        this._tableArea = document.getElementById("table");
        this._scriptArea = document.getElementById("script");
        const analyzeButton = document.getElementById("analyze");
        const treeCheck = document.getElementById("view-tree");
        const elementCheck = document.getElementById("view-element");
        const dummyCheck = document.getElementById("view-dummy");
        const ruleCheck = document.getElementById("view-rule");
        const closureCheck = document.getElementById("view-closure");
        const transitionCheck = document.getElementById("view-transition");
        const tableCheck = document.getElementById("view-table");
        const scriptCheck = document.getElementById("view-script");

        // associate checkboxes with display areas
        this._map = new Map();
        this._map.set(treeCheck, this._treeArea);
        this._map.set(elementCheck, this._elementArea);
        this._map.set(dummyCheck, this._dummyArea);
        this._map.set(ruleCheck, this._ruleArea);
        this._map.set(closureCheck, this._closureArea);
        this._map.set(transitionCheck, this._transitionArea);
        this._map.set(tableCheck, this._tableArea);
        this._map.set(scriptCheck, this._scriptArea);

        // clear display
        this._clearAll();

        // button events
        analyzeButton.addEventListener("click", this._analyze.bind(this));
        this._map.forEach((value, key) => key.addEventListener("click", this._show.bind(this)));
    },

    // "Analyze" button process
    "_analyze": function(e) {
        // initialize
        this._clearAll();
        const grammarArea = document.getElementById("grammar");
        const ignoreCheck = document.getElementById("ignore");
        this._generator.ignoreCase = ignoreCheck.checked;

        // lexical and syntax analyze
        const result = this._parser.tokenize(grammarArea.value);
        if (result.tokens == null) {
            this._setError("unknown character(s)", result.valid, result.invalid);
            return;
        }
        const outcome = this._parser.parse(result.tokens);
        if (outcome.tree == null) {
            this._setError("syntax error", outcome.valid, outcome.invalid);
            return;
        }

        // compile
        const message = this._compiler.execute(outcome.tree.rules);
        if (message != "") {
            this._setError("compile error", "", message);
        } else {
            const success = document.createElement("li");
            success.innerHTML = "Success";
            this._resultArea.appendChild(success);
        }

        // set the results
        this._setTree(this._treeArea, outcome.tree);
        this._setElement();
        this._setDummy();
        this._setRule();
        this._setClosures();
        this._setTransition();
        this._setSyntax();
        this._setScript(outcome.tree);
        this._map.forEach((value, key) => key.disabled = false);
    },

    // show or hide the result
    "_show": function(e) {
        // get the display area
        const check = e.currentTarget;
        const area = this._map.get(check);
        if (check.checked) {
            // show
            area.style.display = "";
        } else {
            // hide
            area.style.display = "none";
        }
    },

    // copy to clipboard
    "_copy": function(e) {
        window.navigator.clipboard.writeText(e.currentTarget.nextSibling.textContent);
    },

    // clear all results
    "_clearAll": function() {
        this._resultArea.innerHTML = "";
        this._map.forEach((value, key) => this._clearResult(key));
    },

    // clear a result
    "_clearResult": function(check) {
        // checkbox
        check.checked = false;
        check.disabled = true;

        // display area
        const area = this._map.get(check);
        area.innerHTML = "";
        area.style.display = "none";
    },

    // write the error string
    "_setError": function(title, valid, invalid) {
        // does the valid text exist?
        if (0 < valid.length) {
            valid = "OK: " + valid;
            invalid = "NG: " + invalid;
        }

        // write to the DOM elements
        const head = document.createElement("li");
        const ok = document.createElement("li");
        const ng = document.createElement("li");
        head.innerHTML = title;
        head.className = "error";
        ok.innerHTML = valid;
        ng.innerHTML = invalid;
        ng.className = "error";
        this._resultArea.appendChild(head);
        this._resultArea.appendChild(ok);
        this._resultArea.appendChild(ng);
        this._resultArea.style.display = "";
    },

    // create the syntax tree
    "_setTree": function(parent, tree) {
        let text = tree.label;
        if (tree.text != "") {
            const fixes = /^'((''|[^'])+)'$/;
            if (fixes.test(text)) {
                text = fixes.exec(text)[1];
            } else {
                text += ": " + tree.text;
            }
        }

        // list item
        const item = document.createElement("li");
        item.innerHTML = text;
        parent.appendChild(item);
        if (tree.children.length == 0 || tree.text != "") {
            return;
        }

        // child node
        const list = document.createElement("ul");
        item.appendChild(list);
        for (const child of tree.children) {
            this._setTree(list, child);
        }
    },

    // create lexical analysis elements
    "_setElement": function() {
        // create a table
        const table = [];
        for (let i = 0; i < this._compiler.terminals.length; i++) {
            const symbol = this._compiler.terminals[i];
            let type = "";
            if (symbol.charAt(0) == "'") {
                type = "Fixed";
            } else if (symbol.charAt(0) == "\"") {
                type = "RegExp";
            }
            table.push([ i + 1, type, symbol ]);
        }

        // write
        const title = [ "priority", "type", "element" ];
        const type = [ "number", "", "" ];
        this._setTable(this._elementArea, table, title, type);
    },

    // create dummy elements
    "_setDummy": function() {
        // create a table
        const table = [];
        for (let i = 0; i < this._compiler.dummies.length; i++) {
            const symbol = this._compiler.dummies[i];
            let type = "";
            if (symbol.charAt(0) == "'") {
                type = "Fixed";
            } else if (symbol.charAt(0) == "\"") {
                type = "RegExp";
            }
            table.push([ i + 1, type, symbol ]);
        }

        // write
        const title = [ "priority", "type", "element" ];
        const type = [ "number", "", "" ];
        this._setTable(this._dummyArea, table, title, type);
    },

    // create production rules
    "_setRule": function() {
        // create a table
        const table = [];
        for (const rule of this._compiler.rules) {
            table.push([ rule.toString() ]);
        }

        // write
        const title = [ "expanded rule" ];
        this._setTable(this._ruleArea, table, title);
    },

    // create closures
    "_setClosures": function() {
        const parent = this._closureArea;
        parent.innerHTML = "";

        // column titles
        const head = document.createElement("tr");
        parent.appendChild(head);
        const title = [ "number", "item", "next symbols" ];
        for (const label of title) {
            const th = document.createElement("th");
            th.innerHTML = label;
            head.appendChild(th);
        }

        // values
        for (let i = 0; i < this._compiler.closures.length; i++) {
            const row = document.createElement("tr");
            parent.appendChild(row);

            // number
            const closure = this._compiler.closures[i];
            const count = closure.items.length;
            const num = document.createElement("td");
            num.innerHTML = i;
            num.rowSpan = count;
            num.className = "number";
            row.appendChild(num);

            // item
            const item = document.createElement("td");
            item.innerHTML = closure.items[0].getItem();
            row.appendChild(item);

            // next symbols
            const next = document.createElement("td");
            let text = "";
            closure.items[0].look.forEach(elem => text += elem + " ");
            next.innerHTML = text.trim();
            row.appendChild(next);

            // from the second time
            for (let j = 1; j < count; j++) {
                const tr = document.createElement("tr");
                parent.appendChild(tr);

                // item
                const td = document.createElement("td");
                td.innerHTML = closure.items[j].getItem();
                tr.appendChild(td);

                // next symbols
                const ahead = document.createElement("td");
                let symbol = "";
                closure.items[j].look.forEach(elem => symbol += elem + " ");
                ahead.innerHTML = symbol.trim();
                tr.appendChild(ahead);
            }
        }
    },

    // create transitions
    "_setTransition": function() {
        // create a table
        const table = [];
        for (const trans of this._compiler.transitions) {
            const from = this._compiler.closures.indexOf(trans.from);
            const to = this._compiler.closures.indexOf(trans.to);
            table.push([ from, trans.symbol, to ]);
        }

        // write
        const title = [ "from", "symbol", "to" ];
        const type = [ "number", "", "number" ];
        this._setTable(this._transitionArea, table, title, type);
    },

    // create the parsing table
    "_setSyntax": function() {
        this._setTable(this._tableArea, this._compiler.table, this._compiler.symbols);
    },

    // create the JavaScript program
    "_setScript": function(tree) {
        // add a copy button
        const button = document.createElement("button");
        button.innerText = "Copy";
        button.addEventListener("click", this._copy.bind(this));
        this._scriptArea.appendChild(button);

        // write
        const code = document.createElement("pre");
        code.innerHTML = this._generator.createScript(this._compiler, tree);
        this._scriptArea.appendChild(code);
   },

    // create a table
    "_setTable": function(parent, table, title, type) {
        // set default values
        const auto = !Array.isArray(type);
        if (auto) {
            type = new Array(title.length).fill("");
            title.unshift("number");
        }
        parent.innerHTML = "";

        // column titles
        if (Array.isArray(title)) {
            const tr = document.createElement("tr");
            parent.appendChild(tr);
            for (const label of title) {
                const th = document.createElement("th");
                th.innerHTML = label;
                tr.appendChild(th);
            }
        }

        // values
        for (let i = 0; i < table.length; i++) {
            const row = table[i];
            const tr = document.createElement("tr");
            parent.appendChild(tr);
            if (auto) {
                // add the number
                const td = document.createElement("td");
                td.innerHTML = i;
                td.className = "number";
                tr.appendChild(td);
            }
            for (let j = 0; j < row.length; j++) {
                const td = document.createElement("td");
                td.innerHTML = row[j];
                if (type[j] != "") {
                    td.className = type[j];
                }
                tr.appendChild(td);
            }
        }
    },

}

// start the controller
new Controller();

