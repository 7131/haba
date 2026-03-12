// Controller class
class Controller {
    #test;
    #parser = new Parser(Grammar, Converter);
    #compiler = new Compiler();
    #generator = new Generator();

    // constructor
    constructor() {
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the page
    #initialize(e) {
        const main = document.getElementById("test");
        const table = main.querySelector("table");
        if (table == null || table.tBodies.length == 0) {
            return;
        }
        const button = main.querySelector("button");

        // test settings
        this.#test = new TestTable(main.id, table.tBodies[0]);
        this.#test.create(TestData);
        this.#test.completeEvent = () => button.disabled = false;
        button.addEventListener("click", this.#start.bind(this));
    }

    // start all tests
    #start(e) {
        const button = e.currentTarget;
        button.disabled = true;
        this.#test.start(this.#execute.bind(this));
    }

    // execute a test
    #execute(text) {
        // lexical analysis
        const result = this.#parser.tokenize(text);
        if (result.tokens == null) {
            return `unknown character(s): ${result.invalid}`;
        }

        // syntactic analysis
        const outcome = this.#parser.parse(result.tokens);
        if (outcome.tree == null) {
            return `no action defined: ${outcome.invalid}`;
        }

        // compile
        const message = this.#compiler.execute(outcome.tree.rules);
        if (message != "") {
            return message;
        }
        return this.#generator.createScript(this.#compiler, outcome.tree);
    }

}

// start the controller
new Controller();

