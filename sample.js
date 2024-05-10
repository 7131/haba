// Controller class
const Controller = function() {
    // fields
    this._parser = new Parser(Grammar, Converter);

    // events
    window.addEventListener("load", this._initialize.bind(this));
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields
    "_initialize": function(e) {
        // DOM elements
        this._resultArea = document.getElementById("result");
        const executeButton = document.getElementById("execute");

        // button events
        executeButton.addEventListener("click", this._execute.bind(this));
    },

    // "Execute" button process
    "_execute": function(e) {
        // initialize
        this._resultArea.innerHTML = "";

        // lexical and syntax analyze
        const inputArea = document.getElementById("input");
        let result = this._parser.tokenize(inputArea.value);
        if (result.tokens == null) {
            this._setError("unknown character(s)", result.valid, result.invalid);
            return;
        }
        result = this._parser.parse(result.tokens);
        if (result.tree == null) {
            this._setError("syntax error", result.valid, result.invalid);
            return;
        }

        // set the results
        const success = document.createElement("li");
        success.innerHTML = result.tree.result;
        this._resultArea.appendChild(success);
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
    },

}

// start the controller
new Controller();

