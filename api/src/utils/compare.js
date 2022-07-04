var Algebrite = require('algebrite');

/**
 * Compares the numerical values of two numbers
 * @param {String} a - Can be negative
 * @param {String} b - Can be negative
 * @param {Integer} distance - The max distance between a and b
 * @returns True if a and b are within a certain distance of each other
 */
function compareNumericalValues(a, b, distance) {
    a = parseFloat(a);
    b = parseFloat(b);

    return Math.abs(a - b) <= Math.pow(10, distance);
}

/**
 * Returns true if the parameter str is not equal to any operation or the bonus parameter
 */
function notEqual(str, bonus) {
    let ignore = ['*', '/', '-', '+', '^'];

    for (let i = 0; i < ignore.length; i++) {
        if (ignore[i] === str) {
            return false;
        }
    }

    return str !== bonus;
}

//Trie - used for finding functions in an expression

function Node(data) {
    this.data = data;
    this.isEnd = true;
    this.children = {};
}

function Trie() {
    this.root = new Node('');
}

Trie.prototype.insert = function (word) {
    let node = this.root;

    for (char of word) {
        if (node.children[char]) {
            node = node.children[char];
        } else {
            node.isEnd = false;
            node.children[char] = new Node(node.data + '' + char);
            node = node.children[char];
        }
    }
};

let trie = new Trie();
let functions = ['sin', 'cos', 'tan', 'log', 'sqrt'];

for (func of functions) {
    trie.insert(func);
}

/**
 * Reformats expression by adding * (multiplication sign) in between parenthesis
 * @param {String} expression - The expression that we have to change
 * @returns reformatted expression
 */
function addMult(expression) {
    //we start by finding the beginning of the expression
    var i = 0;
    while (expression[i] === ' ') {
        i += 1;
    }

    //set the previous character to the first char in the expression
    let prevChar = i;
    i += 1;

    let func = trie.root;

    //we iterate until we reach the end of the expression
    while (i < expression.length) {
        //if the expression contains a space, we skip it
        if (expression[i] === ' ') {
            i += 1;
            continue;
        } else {
            //update trie
            if (func.children[expression[prevChar]]) {
                //go deeper
                func = func.children[expression[prevChar]];
            } else {
                //return to root
                func = trie.root;
            }

            /*There are 3 cases where we would want to add a * sign
              1. (x+2)_(x+3)
              2. x_(x+2)
              3. (x+2)_x
              The location is indicated by the _. We just have to make sure that another operation
              doesn't already exist at that location.
              */

            if (
                expression[i] === '(' &&
                notEqual(expression[prevChar], '(') &&
                !func.isEnd
            ) {
                //we can add in the multiplication sign
                expression =
                    expression.substring(0, i) +
                    '*(' +
                    expression.substring(i + 1, expression.length);
                //skip over the multiplication sign, so the next prevChar is "("
                prevChar = i + 1;
                i += 2;
            } else if (
                expression[prevChar] === ')' &&
                notEqual(expression[i], ')') &&
                !func.isEnd
            ) {
                expression =
                    expression.substring(0, prevChar) +
                    ')*' +
                    expression.substring(prevChar + 1, expression.length);
                //set the next prevChar to the current location
                prevChar = i;
                i += 1;
            } else {
                //regular character (number, letter, etc...), so we can skip
                prevChar = i;
                i += 1;
            }
        }
    }

    return expression;
}

function replaceTrig(expression) {
    //replaces any inverse trig with regular trig

    expression = expression.split('cot').join('1/tan');
    expression = expression.split('sec').join('1/cos');
    expression = expression.split('csc').join('1/sin');

    return expression;
}

function replaceLogs(expression) {
    //Algebrite.js considers log as natural log
    expression = expression.split('ln').join('log');
    return expression;
}

/* Simplifies an expression (String) */
function simplifyExpression(expression) {
    let simplified;

    try {
        //replace ⋅ with *

        simplified = expression.split('⋅').join('*');

        //replace xx (multiplication sign on virtual keyboard) with *

        simplified = simplified.split('xx').join('*');

        //remove white space

        //replace the inverse trig functions and log functions

        simplified = replaceTrig(simplified);

        simplified = replaceLogs(simplified);

        //TODO: replace calc functions

        //second, add in * where needed

        simplified = addMult(simplified);

        //next, removes any ...
        simplified = Algebrite.simplify(simplified).toString();
        simplified = simplified.split('...').join('');
        //third, to convert to a decimal, we will use a trick. We will take the simplified version and add, then subtract 0.5
        //this will turn any fractions into decimals
        simplified = Algebrite.simplify(simplified + ' + 0.5 - 0.5').toString();
        //removes any dots at the end, in the event that the number is a decimal
        simplified = simplified.split('...').join('');

        return simplified;
    } catch (error) {
        console.error(error);
        return expression;
    }
}

function removeWhiteSpace(expression) {
    let simplified = expression.split('"').join('');
    simplified = simplified.split('\\').join('');

    simplified = simplified.replace(/\s+/g, ' ').trim();

    return simplified;
}

/* Compares two expressions - Returns true if the expressions are mathematically equivalent*/
function compareExpressions(a, b, isAlg) {
    //remove any extra whitespace and quotation marks

    a = removeWhiteSpace(a);
    b = removeWhiteSpace(b);

    //Safety: in the event something goes wrong, we always get true if a and b are equivalent strings
    let aLower = a.toLowerCase();
    var bLower = b.toLowerCase();

    if (aLower === bLower) {
        return true;
    }

    //Algebraic - factoring or expansion, which gives us a problem because simplification turns any expression
    //into the simplest form. Thus, we won't be able to tell if the user's answer is factored or expanded.

    if (isAlg) {
        //Double check for factoring or expansion problems
        if (!countNumbers(a, b)) {
            return false;
        }
    }

    //Continue with comparing expressions...

    //start by simplifying
    let simplifiedA = simplifyExpression(a);
    let simplifiedB = simplifyExpression(b);

    //a or b aren't actual numerical values
    if (isNaN(simplifiedA) || isNaN(simplifiedB)) {
        return simplifiedA === simplifiedB; //compare the two strings
    }

    return compareNumericalValues(simplifiedA, simplifiedB, -3);
}

/** Returns true if the number of integers in both a (String) and b (String) are equal
 * Used for validating factoring and expansion problems
 */
function countNumbers(a, b) {
    let characters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    //first, count the number of integers in a
    for (let i = 0; i < a.length; i++) {
        if (!isNaN(a[i]) && a[i] != ' ' && a[i] != '') {
            characters[parseInt(a[i])] += 1;
        }
    }

    //next, count the number of integers in b
    for (let i = 0; i < b.length; i++) {
        if (!isNaN(b[i]) && b[i] != ' ' && b[i] != '') {
            characters[parseInt(b[i])] -= 1;
        }
    }

    //finally, compare counts
    for (let j = 0; j < characters.length; j++) {
        if (characters[j] != 0) {
            return false;
        }
    }

    return true;
}

module.exports = {
    compareExpressions: compareExpressions,
};
