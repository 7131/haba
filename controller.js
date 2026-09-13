// Controller class
class Controller {
    #resultArea;
    #treeArea;
    #elementArea;
    #dummyArea;
    #ruleArea;
    #closureArea;
    #transitionArea;
    #tableArea;
    #scriptArea;
    #parser = new Parser(Grammar, Converter);
    #compiler = new Compiler();
    #generator = new Generator();
    #map = new Map();

    // constructor
    constructor() {
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the private fields
    #initialize(e) {
        // DOM elements
        this.#resultArea = document.getElementById("result");
        this.#treeArea = document.getElementById("tree");
        this.#elementArea = document.getElementById("element");
        this.#dummyArea = document.getElementById("dummy");
        this.#ruleArea = document.getElementById("rule");
        this.#closureArea = document.getElementById("closure");
        this.#transitionArea = document.getElementById("transition");
        this.#tableArea = document.getElementById("table");
        this.#scriptArea = document.getElementById("script");
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
        this.#map.set(treeCheck, this.#treeArea);
        this.#map.set(elementCheck, this.#elementArea);
        this.#map.set(dummyCheck, this.#dummyArea);
        this.#map.set(ruleCheck, this.#ruleArea);
        this.#map.set(closureCheck, this.#closureArea);
        this.#map.set(transitionCheck, this.#transitionArea);
        this.#map.set(tableCheck, this.#tableArea);
        this.#map.set(scriptCheck, this.#scriptArea);

        // clear display
        this.#clearAll();

        // button events
        analyzeButton.addEventListener("click", this.#analyze.bind(this));
        this.#map.forEach((value, key) => key.addEventListener("click", this.#show.bind(this)));
    }

    // "Analyze" button process
    #analyze(e) {
        // initialize
        this.#clearAll();
        const grammarArea = document.getElementById("grammar");
        const ignoreCheck = document.getElementById("ignore");
        this.#generator.ignoreCase = ignoreCheck.checked;

        // lexical and syntax analyze
        const result = this.#parser.tokenize(grammarArea.value);
        if (result.tokens == null) {
            this.#setError("unknown character(s)", result.valid, result.invalid);
            return;
        }
        const outcome = this.#parser.parse(result.tokens);
        if (outcome.tree == null) {
            this.#setError("syntax error", outcome.valid, outcome.invalid);
            return;
        }

        // compile
        const message = this.#compiler.execute(outcome.tree.rules);
        if (message != "") {
            this.#setError("compile error", "", message);
        } else {
            const success = document.createElement("li");
            success.textContent = "Success";
            this.#resultArea.appendChild(success);
        }

        // set the results
        this.#setTree(this.#treeArea, outcome.tree);
        this.#setElement();
        this.#setDummy();
        this.#setRule();
        this.#setClosures();
        this.#setTransition();
        this.#setSyntax();
        this.#setScript(outcome.tree);
        this.#map.forEach((value, key) => key.disabled = false);
    }

    // show or hide the result
    #show(e) {
        // get the display area
        const check = e.currentTarget;
        const area = this.#map.get(check);
        if (check.checked) {
            // show
            area.classList.remove("hidden");
        } else {
            // hide
            area.classList.add("hidden");
        }
    }

    // copy to clipboard
    #copy(e) {
        window.navigator.clipboard.writeText(e.currentTarget.nextSibling.textContent);
    }

    // clear all results
    #clearAll() {
        this.#resultArea.textContent = "";
        for (const [ check, area ] of this.#map) {
            // checkbox
            check.checked = false;
            check.disabled = true;

            // display area
            area.textContent = "";
            area.classList.add("hidden");
        }
    }

    // write the error string
    #setError(title, valid, invalid) {
        // does the valid text exist?
        if (0 < valid.length) {
            valid = `OK: ${valid}`;
            invalid = `NG: ${invalid}`;
        }

        // write to the DOM elements
        const head = document.createElement("li");
        const ok = document.createElement("li");
        const ng = document.createElement("li");
        head.textContent = title;
        head.classList.add("error");
        ok.textContent = valid;
        ng.textContent = invalid;
        ng.classList.add("error");
        this.#resultArea.appendChild(head);
        this.#resultArea.appendChild(ok);
        this.#resultArea.appendChild(ng);
    }

    // set the syntax tree
    #setTree(parent, tree) {
        let text = tree.label;
        if (tree.text != "") {
            const fixes = /^'((''|[^'])+)'$/;
            if (fixes.test(text)) {
                text = fixes.exec(text)[1];
            } else {
                text += `: ${tree.text}`;
            }
        }

        // list item
        const item = document.createElement("li");
        item.textContent = text;
        parent.appendChild(item);
        if (tree.children.length == 0 || tree.text != "") {
            return;
        }

        // child node
        const list = document.createElement("ul");
        item.appendChild(list);
        tree.children.forEach(elem => this.#setTree(list, elem));
    }

    // set the lexical analysis elements
    #setElement() {
        // create a table
        const table = [];
        for (let i = 0; i < this.#compiler.terminals.length; i++) {
            const symbol = this.#compiler.terminals[i];
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
        this.#setTable(this.#elementArea, table, title, type);
    }

    // set the dummy elements
    #setDummy() {
        // create a table
        const table = [];
        for (let i = 0; i < this.#compiler.dummies.length; i++) {
            const symbol = this.#compiler.dummies[i];
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
        this.#setTable(this.#dummyArea, table, title, type);
    }

    // set the production rules
    #setRule() {
        const table = this.#compiler.rules.map(elem => [ elem.toString() ]);
        const title = [ "expanded rule" ];
        this.#setTable(this.#ruleArea, table, title);
    }

    // set the closures
    #setClosures() {
        const parent = this.#closureArea;
        parent.textContent = "";

        // column titles
        const head = document.createElement("tr");
        parent.appendChild(head);
        const title = [ "number", "item", "next symbols" ];
        for (const label of title) {
            const th = document.createElement("th");
            th.textContent = label;
            head.appendChild(th);
        }

        // values
        for (let i = 0; i < this.#compiler.closures.length; i++) {
            const row = document.createElement("tr");
            parent.appendChild(row);

            // number
            const closure = this.#compiler.closures[i];
            const count = closure.items.length;
            const num = document.createElement("td");
            num.textContent = i;
            num.rowSpan = count;
            num.classList.add("number");
            row.appendChild(num);

            // item
            const item = document.createElement("td");
            item.textContent = closure.items[0].getItem();
            row.appendChild(item);

            // next symbols
            const next = document.createElement("td");
            next.textContent = Array.from(closure.items[0].look).join(" ");
            row.appendChild(next);

            // from the second time
            for (let j = 1; j < count; j++) {
                const tr = document.createElement("tr");
                parent.appendChild(tr);

                // item
                const td = document.createElement("td");
                td.textContent = closure.items[j].getItem();
                tr.appendChild(td);

                // next symbols
                const ahead = document.createElement("td");
                ahead.textContent = Array.from(closure.items[j].look).join(" ");
                tr.appendChild(ahead);
            }
        }
    }

    // set the transitions
    #setTransition() {
        // create a table
        const table = [];
        for (const trans of this.#compiler.transitions) {
            const from = this.#compiler.closures.indexOf(trans.from);
            const to = this.#compiler.closures.indexOf(trans.to);
            table.push([ from, trans.symbol, to ]);
        }

        // write
        const title = [ "from", "symbol", "to" ];
        const type = [ "number", "", "number" ];
        this.#setTable(this.#transitionArea, table, title, type);
    }

    // set the parsing table
    #setSyntax() {
        this.#setTable(this.#tableArea, this.#compiler.table, this.#compiler.symbols);
    }

    // set the JavaScript program
    #setScript(tree) {
        // add a copy button
        const button = document.createElement("button");
        button.textContent = "Copy";
        button.addEventListener("click", this.#copy.bind(this));
        this.#scriptArea.appendChild(button);

        // write
        const code = document.createElement("pre");
        code.textContent = this.#generator.generateScript(this.#compiler, tree);
        this.#scriptArea.appendChild(code);
    }

    // set a table
    #setTable(parent, table, title, type) {
        // set default values
        const auto = !Array.isArray(type);
        if (auto) {
            type = new Array(title.length).fill("");
            title.unshift("number");
        }
        parent.textContent = "";

        // column titles
        if (Array.isArray(title)) {
            const tr = document.createElement("tr");
            parent.appendChild(tr);
            for (const label of title) {
                const th = document.createElement("th");
                th.textContent = label;
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
                td.textContent = i;
                td.classList.add("number");
                tr.appendChild(td);
            }
            for (let j = 0; j < row.length; j++) {
                const td = document.createElement("td");
                td.textContent = row[j];
                if (type[j] != "") {
                    td.classList.add(type[j]);
                }
                tr.appendChild(td);
            }
        }
    }

}

// start the controller
new Controller();

