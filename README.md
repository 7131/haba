# House Arranged BNF Analyzer

This is a LALR(1) parser.
You can analyze BNF-like grammars and get syntax trees, parsing tables, and JavaScript programs based on them.
The generated JavaScript program can be parsed by parser.js located here.
Please refer to sample.html and sample.js for how to use it.

# File list

<dl>
  <dt>index.html</dt>
    <dd>This is the main page for HABA.</dd>
  <dt>default.css</dt>
    <dd>The style sheet for the main page.</dd>
  <dt>grammar.js</dt>
    <dd>The grammar object and the syntax converter.</dd>
  <dt>parser.js</dt>
    <dd>Classes for parser, token, syntax tree, and state stack.</dd>
  <dt>compiler.js</dt>
    <dd>Classes for compiler, production rule, LR item, closure, state transition, and symbol set.</dd>
  <dt>generator.js</dt>
    <dd>This is a generator that generates a JavaScript program from the syntax tree and processing results.</dd>
  <dt>controller.js</dt>
    <dd>This is a controller that receives the input of the main page and outputs the analysis result.</dd>
  <dt>notation.html</dt>
    <dd>This page explains how to write HABA.</dd>
  <dt>notation.css</dt>
    <dd>The style sheet for the notation page.</dd>
  <dt>explanation.html</dt>
    <dd>This page explains the details of HABA analysis.</dd>
  <dt>sample.html</dt>
    <dd>This is a sample page of HABA grammar.</dd>
  <dt>sample.js</dt>
    <dd>This is a controller that receives the input of the sample page and outputs the result.</dd>
  <dt>multi.js</dt>
    <dd>This is a sample grammar that accepts multiple additions.</dd>
  <dt>test.html</dt>
    <dd>This is a page for testing HABA.</dd>
  <dt>test.css</dt>
    <dd>The style sheet for the test page.</dd>
  <dt>test.js</dt>
    <dd>This is a controller that receives the input of the test page and outputs the test result to the table.</dd>
</dl>

# Why another new grammar?

The grammar which extended BNF is used here.
It is neither ABNF nor EBNF.
The reason I defined another grammar is because I am dissatisfied with ABNF mainly in the following three points.

1. The notation of terminal symbols is redundant.
2. It is not free format.
3. It can not be parsed by simple lexical analysis and syntactic analysis.

On the other hand, EBNF has different ways of extension depending on the person, and there are several grammars with the same name.
I thought that different extensions with the same name would only increase confusion.

