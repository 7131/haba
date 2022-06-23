// Grammar object
const Grammar = {

    "flag": "",

    "terminals": [
        "\\+",
        "[0-9]+",
    ],

    "dummies": [
        "\\s+",
    ],

    "rules": [
        "#0#=1",
        "Multi=2",
        "#1#=3",
        "#1#=0",
        "Num=1",
    ],

    "table": [
        [ "", "s6", "", "g1", "", "g2" ],
        [ "", "", "r0", "", "", "" ],
        [ "r3", "", "r3", "", "g3", "" ],
        [ "s4", "", "r1", "", "", "" ],
        [ "", "s6", "", "", "", "g5" ],
        [ "r2", "", "r2", "", "", "" ],
        [ "r4", "", "r4", "", "", "" ],
    ],

}

// Syntax converter
const Converter = {

    // Multi ::= Num ('+' Num)* ;
    "Multi": function(tree) {
        tree.result = tree.children[0].result;
        for (let i = 2; i < tree.children.length; i += 2) {
            tree.result += tree.children[i].result;
        }
    },

    // Num ::= "[0-9]+" ;
    "Num": function(tree) {
        tree.result = parseInt(tree.children[0].text, 10);
    },

}

