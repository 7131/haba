// Controller class
class Controller {
    #resultArea;
    #parser = new Parser(Grammar, Converter);

    // constructor
    constructor() {
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the private fields
    #initialize(e) {
        // DOM elements
        this.#resultArea = document.getElementById("result");
        const executeButton = document.getElementById("execute");

        // button events
        executeButton.addEventListener("click", this.#execute.bind(this));
    }

    // "Execute" button process
    #execute(e) {
        // initialize
        this.#resultArea.textContent = "";

        // lexical and syntax analyze
        const inputArea = document.getElementById("input");
        const result = this.#parser.tokenize(inputArea.value);
        if (result.tokens == null) {
            this.#setError("unknown character(s)", result.valid, result.invalid);
            return;
        }
        const outcome = this.#parser.parse(result.tokens);
        if (outcome.tree == null) {
            this.#setError("syntax error", outcome.valid, outcome.invalid);
            return;
        }

        // set the results
        const success = document.createElement("li");
        success.textContent = outcome.tree.result;
        this.#resultArea.appendChild(success);
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

}

// start the controller
new Controller();

