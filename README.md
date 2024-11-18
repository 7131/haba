# House Arranged BNF Analyzer

https://7131.github.io/haba/

This is a LALR(1) parser.
You can analyze BNF-like grammars and get syntax trees, parsing tables, and JavaScript programs based on them.

The generated program has a Grammar object and a Converter object.
The Grammar object contains terminal symbols, production rules, parsing table, etc.
The Converter object defines only frames of functions with the same name as the non-terminal symbols.
So you must implement the contents of the functions.

# How to use the generated program

First, save the program to a file (e.g., mygrammar.js).
To use from HTML, load the saved file and HABA's own parser (parser.js).

```HTML
<script src="./mygrammar.js"></script>
<script src="./parser.js"></script>
```

The generated objects are passed as arguments to the constructor of the Parser object in parser.js.

```JavaScript
const parser = new Parser(Grammar, Converter);
```

You can now perform lexical and syntactic analysis.

```JavaScript
const result = parser.tokenize("...");
const outcome = parser.parse(result.tokens);
```

Passing the input string to the tokenize() method returns a token array, and passing the token array to the parse() method returns a syntax tree.
You can process the syntax tree according to your grammar.
See also sample.html and sample.js (and multi.js) for an example of actual use.

# Why another new BNF-like grammar?

The grammar which extended BNF is used here.
It is neither ABNF nor EBNF.
The reason I defined another grammar is because I am dissatisfied with ABNF mainly in the following three points.

1. The notation of terminal symbols is redundant.
2. It is not free format.
3. It can not be parsed by simple lexical analysis and syntactic analysis.

On the other hand, EBNF has different ways of extension depending on the person, and there are several grammars with the same name.
I thought that different extensions with the same name would only increase confusion.

