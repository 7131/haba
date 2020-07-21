// Controller class
var Controller = function() {
    // fields
    this._parser = new Parser(Grammar, Converter);
    this._compiler = new Compiler();
    this._generator = new Generator();

    // events
    window.addEventListener("load", this._initialize.bind(this), false);
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields
    "_initialize": function() {
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
        var analyzeButton = document.getElementById("analyze");
        var treeCheck = document.getElementById("view-tree");
        var elementCheck = document.getElementById("view-element");
        var dummyCheck = document.getElementById("view-dummy");
        var ruleCheck = document.getElementById("view-rule");
        var closureCheck = document.getElementById("view-closure");
        var transitionCheck = document.getElementById("view-transition");
        var tableCheck = document.getElementById("view-table");
        var scriptCheck = document.getElementById("view-script");

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
        analyzeButton.addEventListener("click", this._analyze.bind(this), false);
        this._map.forEach(function(value, key) { key.addEventListener("click", this._show.bind(this), false); }, this);
    },

    // "Analyze" button process
    "_analyze": function(e) {
        // initialize
        this._clearAll();
        var grammarArea = document.getElementById("grammar");
        var ignoreCheck = document.getElementById("ignore");
        this._generator.ignoreCase = ignoreCheck.checked;

        // lexical and syntax analyze
        var result = this._parser.tokenize(grammarArea.value);
        if (result.tokens == null) {
            this._setError("unknown character(s)", result.valid, result.invalid);
            return;
        }
        result = this._parser.parse(result.tokens);
        if (result.tree == null) {
            this._setError("syntax error", result.valid, result.invalid);
            return;
        }

        // compile
        var message = this._compiler.execute(result.tree.rules);
        if (message != "") {
            this._setError("compile error", "", message);
        } else {
            var success = document.createElement("li");
            success.innerHTML = "Success";
            this._resultArea.appendChild(success);
        }

        // set the results
        this._setTree(this._treeArea, result.tree);
        this._setElement();
        this._setDummy();
        this._setRule();
        this._setClosures();
        this._setTransition();
        this._setSyntax();
        this._setScript(result.tree);
        this._map.forEach(function(value, key) { key.disabled = false; });
    },

    // show or hide the result
    "_show": function(e) {
        // get the display area
        var check = e.currentTarget;
        var area = this._map.get(check);
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
        // create a range from the element
        var text = e.currentTarget.nextSibling.firstChild;
        var range = document.createRange();
        range.selectNode(text);

        // select a range
        var current = window.getSelection();
        current.removeAllRanges();
        current.addRange(range);

        // copy
        document.execCommand("copy");
        current.removeAllRanges();
    },

    // clear all results
    "_clearAll": function() {
        this._resultArea.innerHTML = "";
        this._map.forEach(function(value, key) { this._clearResult(key); }, this);
    },

    // clear a result
    "_clearResult": function(check) {
        // checkbox
        check.checked = false;
        check.disabled = true;

        // display area
        var area = this._map.get(check);
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
        var head = document.createElement("li");
        var ok = document.createElement("li");
        var ng = document.createElement("li");
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
        var text = tree.label;
        if (tree.text != "") {
            var fixes = /^'((''|[^'])+)'$/;
            if (fixes.test(text)) {
                text = fixes.exec(text)[1];
            } else {
                text += ": " + tree.text;
            }
        }

        // list item
        var item = document.createElement("li");
        item.innerHTML = text;
        parent.appendChild(item);
        if (tree.children.length == 0 || tree.text != "") {
            return;
        }

        // child node
        var list = document.createElement("ul");
        item.appendChild(list);
        for (var i = 0; i < tree.children.length; i++) {
            this._setTree(list, tree.children[i]);
        }
    },

    // create lexical analysis elements
    "_setElement": function() {
        // create a table
        var table = [];
        for (var i = 0; i < this._compiler.terminals.length; i++) {
            var symbol = this._compiler.terminals[i];
            var type = "";
            if (symbol.charAt(0) == "'") {
                type = "Fixed";
            } else if (symbol.charAt(0) == "\"") {
                type = "RegExp";
            }
            table.push([ type, symbol ]);
        }

        // write
        var title = [ "type", "element" ];
        this._setTable(this._elementArea, table, title, 1);
    },

    // create dummy elements
    "_setDummy": function() {
        // create a table
        var table = [];
        for (var i = 0; i < this._compiler.dummies.length; i++) {
            var symbol = this._compiler.dummies[i];
            var type = "";
            if (symbol.charAt(0) == "'") {
                type = "Fixed";
            } else if (symbol.charAt(0) == "\"") {
                type = "RegExp";
            }
            table.push([ type, symbol ]);
        }

        // write
        var title = [ "type", "element" ];
        this._setTable(this._dummyArea, table, title, 1);
    },

    // create production rules
    "_setRule": function() {
        // create a table
        var table = [];
        for (var i = 0; i < this._compiler.rules.length; i++) {
            var rule = this._compiler.rules[i];
            table.push([ rule.toString() ]);
        }

        // write
        var title = [ "expanded rule" ];
        this._setTable(this._ruleArea, table, title);
    },

    // create closures
    "_setClosures": function() {
        var parent = this._closureArea;
        parent.innerHTML = "";

        // column titles
        var head = document.createElement("tr");
        parent.appendChild(head);
        var title = [ "No.", "item", "next symbols" ];
        for (var i = 0; i < title.length; i++) {
            var th = document.createElement("th");
            th.innerHTML = title[i];
            head.appendChild(th);
        }

        // values
        for (var i = 0; i < this._compiler.closures.length; i++) {
            var row = document.createElement("tr");
            parent.appendChild(row);

            // No.
            var closure = this._compiler.closures[i];
            var count = closure.items.length;
            var num = document.createElement("td");
            num.innerHTML = i;
            num.rowSpan = count;
            num.className = "number";
            row.appendChild(num);

            // item
            var item = document.createElement("td");
            item.innerHTML = closure.items[0].getItem();
            row.appendChild(item);

            // next symbols
            var next = document.createElement("td");
            var text = "";
            closure.items[0].look.forEach(function(value) { text += value + " "; });
            next.innerHTML = text.trim();
            row.appendChild(next);

            // from the second time
            for (var j = 1; j < count; j++) {
                row = document.createElement("tr");
                parent.appendChild(row);

                // item
                item = document.createElement("td");
                item.innerHTML = closure.items[j].getItem();
                row.appendChild(item);

                // next symbols
                next = document.createElement("td");
                text = "";
                closure.items[j].look.forEach(function(value) { text += value + " "; });
                next.innerHTML = text.trim();
                row.appendChild(next);
            }
        }
    },

    // create transitions
    "_setTransition": function() {
        // create a table
        var table = [];
        for (var i = 0; i < this._compiler.transitions.length; i++) {
            var trans = this._compiler.transitions[i];
            var from = this._compiler.closures.indexOf(trans.from);
            var to = this._compiler.closures.indexOf(trans.to);
            table.push([ from, trans.symbol, to ]);
        }

        // write
        var title = [ "from", "symbol", "to" ];
        var type = [ "number", "", "number" ];
        this._setTable(this._transitionArea, table, title, 1, type);
    },

    // create the parsing table
    "_setSyntax": function() {
        this._setTable(this._tableArea, this._compiler.table, this._compiler.symbols);
    },

    // create the JavaScript program
    "_setScript": function(tree) {
        // add a copy button
        var button = document.createElement("input");
        button.type = "button";
        button.value = "Copy";
        button.addEventListener("click", this._copy.bind(this), false);
        this._scriptArea.appendChild(button);

        // write
        var code = document.createElement("pre");
        code.innerHTML = this._generator.createScript(this._compiler, tree);
        this._scriptArea.appendChild(code);
   },

    // create a table
    "_setTable": function(parent, table, title, start, type) {
        // set default values
        if (isNaN(start)) {
            start = 0;
        }
        if (!Array.isArray(type)) {
            type = [];
        }
        parent.innerHTML = "";

        // column titles
        if (Array.isArray(title)) {
            var tr = document.createElement("tr");
            parent.appendChild(tr);

            // add the No. column
            var th = document.createElement("th");
            th.innerHTML = "No.";
            tr.appendChild(th);
            for (var j = 0; j < title.length; j++) {
                th = document.createElement("th");
                th.innerHTML = title[j];
                tr.appendChild(th);
            }
        }

        // values
        for (var i = 0; i < table.length; i++) {
            var row = table[i];
            var tr = document.createElement("tr");
            parent.appendChild(tr);

            // add the No.
            var td = document.createElement("td");
            td.innerHTML = i + start;
            td.className = "number";
            tr.appendChild(td);
            for (var j = 0; j < row.length; j++) {
                td = document.createElement("td");
                td.innerHTML = row[j];
                if (type[j] != null) {
                    td.className = type[j];
                }
                tr.appendChild(td);
            }
        }
    },

}

// start the controller
new Controller();

