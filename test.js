// Column number constants
const ColNum = {
    "NUMBER": 0,
    "TARGET": 1,
    "EXPECT": 2,
    "RESULT": 3,
}

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
        this._rows = document.getElementById("patterns").rows;
        for (let i = 1; i < this._rows.length; i++) {
            // No.
            const number = this._rows[i].cells[ColNum.NUMBER];
            number.innerText = i;
            number.classList.add("symbol");

            // expected values
            const expects = this._rows[i].cells[ColNum.EXPECT].childNodes;
            expects[0].id = "view-" + i;
            expects[0].addEventListener("click", this._show.bind(this));
            expects[1].htmlFor = expects[0].id;
            expects[2].id = "code-" + i;
        }

        // get the last row
        let last = this._rows[this._rows.length - 1];
        if (last.cells[ColNum.TARGET].innerText != "") {
            last = last.parentNode.appendChild(last.cloneNode(true));
        }
        last.cells[ColNum.NUMBER].innerText = "total";
        last.cells[ColNum.TARGET].innerText = "";
        last.cells[ColNum.EXPECT].innerText = "";
        last.cells[ColNum.RESULT].innerText = "";

        // button events
        const execute = document.getElementById("execute");
        execute.addEventListener("click", this._start.bind(this));
    },

    // show or hide the result
    "_show": function(e) {
        // get the display area
        const check = e.currentTarget;
        const area = check.nextSibling.nextSibling;
        if (check.checked) {
            // show
            area.classList.remove("hidden");
        } else {
            // hide
            area.classList.add("hidden");
        }
    },

    // start all tests
    "_start": function(e) {
        // disable the "Execute" button
        this._button = e.currentTarget;
        this._button.disabled = true;

        // initialize table
        for (let i = 1; i < this._rows.length; i++) {
            this._rows[i].cells[ColNum.RESULT].innerHTML = "";
        }
        this._errors = [];

        // execute the first test
        this._index = 1;
        this._execute();
    },

    // execute a test
    "_execute": function() {
        // lexical analysis
        const cell = this._rows[this._index].cells[ColNum.TARGET];
        const result = this._parser.tokenize(cell.innerText);
        if (result.tokens == null) {
            this._showResult("unknown character(s): " + result.invalid, "Lexical analysis");
            return;
        }

        // syntactic analysis
        const outcome = this._parser.parse(result.tokens);
        if (outcome.tree == null) {
            this._showResult("no action defined: " + outcome.invalid, "Syntactic analysis");
            return;
        }

        // compile
        const message = this._compiler.execute(outcome.tree.rules);
        if (message != "") {
            this._showResult(message, "Compile");
            return;
        }

        // generate the JavaScript program
        const script = this._generator.createScript(this._compiler, outcome.tree);
        this._showResult(script, "JavaScript program");
    },

    // show the result string
    "_showResult": function(actual, title) {
        // unify line breaks
        actual = actual.trim().replace(/\r?\n/g, "\n");
        const element = document.getElementById("code-" + this._index);
        const expect = element.innerText.trim().replace(/\r?\n/g, "\n");

        // get the result string
        const cell = this._rows[this._index].cells[ColNum.RESULT];
        if (actual == expect) {
            cell.innerText = "OK";
            cell.classList.remove("error");
        } else {
            const pre = document.createElement("pre");
            pre.innerText = title + " error\n\n" + actual;
            cell.appendChild(pre);
            cell.classList.add("error");
            this._errors.push(this._index);
        }

        // execute the next test
        this._index++;
        if (this._index < this._rows.length && this._rows[this._index].cells[ColNum.TARGET].innerText != "") {
            setTimeout(this._execute.bind(this), 10);
            return;
        }

        // finished
        const last = this._rows[this._rows.length - 1];
        if (this._errors.length == 0) {
            last.cells[ColNum.RESULT].innerText = "All OK";
            last.cells[ColNum.RESULT].classList.remove("error");
        } else {
            last.cells[ColNum.RESULT].innerText = "NG : " + this._errors.join();
            last.cells[ColNum.RESULT].classList.add("error");
        }
        this._button.disabled = false;
    },

}

// start the controller
new Controller();

