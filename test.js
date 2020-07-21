// Column number constants
var ColNum = {
    "NUMBER": 0,
    "TARGET": 1,
    "EXPECT": 2,
    "RESULT": 3,
}

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
        this._rows = document.getElementById("patterns").rows;
        for (var i = 1; i < this._rows.length; i++) {
            // No.
            var number = this._rows[i].cells[ColNum.NUMBER];
            number.innerText = i;
            number.className = "symbol";

            // expected values
            var expects = this._rows[i].cells[ColNum.EXPECT].childNodes;
            expects[0].id = "view-" + i;
            expects[0].addEventListener("click", this._show.bind(this), false);
            expects[1].htmlFor = expects[0].id;
            expects[2].id = "code-" + i;
        }

        // button events
        var execute = document.getElementById("execute");
        execute.addEventListener("click", this._start.bind(this), false);
    },

    // show or hide the result
    "_show": function(e) {
        // get the display area
        var check = e.currentTarget;
        var area = check.nextSibling.nextSibling;
        if (check.checked) {
            // show
            area.className = "";
        } else {
            // hide
            area.className = "hidden";
        }
    },

    // start all tests
    "_start": function(e) {
        // disable the "Execute" button
        this._button = e.currentTarget;
        this._button.disabled = true;

        // initialize table
        for (var i = 1; i < this._rows.length; i++) {
            this._rows[i].cells[ColNum.RESULT].innerHTML = "";
        }

        // execute the first test
        this._index = 1;
        this._execute();
    },

    // execute a test
    "_execute": function() {
        // lexical analysis
        var cell = this._rows[this._index].cells[ColNum.TARGET];
        var result = this._parser.tokenize(cell.innerText);
        if (result.tokens == null) {
            this._showResult("unknown character(s): " + result.invalid, "Lexical analysis");
            return;
        }

        // syntactic analysis
        result = this._parser.parse(result.tokens);
        if (result.tree == null) {
            this._showResult("no action defined: " + result.invalid, "Syntactic analysis");
            return;
        }

        // compile
        var message = this._compiler.execute(result.tree.rules);
        if (message != "") {
            this._showResult(message, "Compile");
            return;
        }

        // generate the JavaScript program
        var script = this._generator.createScript(this._compiler, result.tree);
        this._showResult(script, "JavaScript program");
    },

    // show the result string
    "_showResult": function(actual, title) {
        // unify line breaks
        actual = actual.trim().replace(/\r?\n/g, "\n");
        var element = document.getElementById("code-" + this._index);
        var expect = element.innerText.trim().replace(/\r?\n/g, "\n");

        // get the result string
        var cell = this._rows[this._index].cells[ColNum.RESULT];
        if (actual == expect) {
            cell.innerText = "OK";
            cell.className = "";
        } else {
            var pre = document.createElement("pre");
            pre.innerText = title + " error\n\n" + actual;
            cell.appendChild(pre);
            cell.className = "error";
        }

        // execute the next test
        this._index++;
        if (this._rows.length <= this._index || this._rows[this._index].cells[ColNum.TARGET].innerText == "") {
            // finished
            this._button.disabled = false;
            return;
        }
        setTimeout(this._execute.bind(this), 10);
    },

}

// start the controller
new Controller();

