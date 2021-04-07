var fs = require("fs")

String.prototype.replaceAt = function(index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }
 
    return this.substring(0, index) + replacement + this.substring(index + 1);
}

/**
 * @param {*} data 
 * @returns 
 */
function checkJson(data) {
	return 0
}

/**
 * @param {*} input 
 * @param {*} alphabet 
 * @returns 
 */
function checkInputAlphabet(input, alphabet) {
	for (var i = 0; i < input.length; i++) {
		if (alphabet.indexOf(input[i]) == -1) {
			console.log("Input have different character than Alphabet field");
			return 1
		}
	}
	return 0
}

/**
 * @param {*} input
 * @param {*} index
 * @param {*} currentState
 * @param {*} nextState
 * @param {*} toWrite
 * @param {*} action
 */
function printState(input, index, currentState, nextState, toWrite, action) {
	process.stdout.write("[")
	for (var i = 0; i < input.length; i++) {
		if (i == index) {
			process.stdout.write("<" + input[i] + ">")
		} else {
			process.stdout.write(input[i])
		}
	}
	for (var i = 0; i < 20 - input.length; i++) {
		process.stdout.write(".")
	}
	process.stdout.write("] ")
	process.stdout.write("(" + currentState + ", " + input[index] + ") " + "(" + nextState + ", " + toWrite + ", " + action + ")\n")
}

/**
 * @param {*} input
 * @param {*} index
 * @param {*} state
 * @param {*} instructions
 */
function algo(input, index, state, instructions, finals) {
	if (state == finals) {
		return
	}
	for (var instruction of instructions[state]) {
		if (instruction.read == input[index]) {
			printState(input, index, state, instruction.to_state, instruction.write, instruction.action)
			return algo(input.replaceAt(index, instruction.write), index + (instruction.action == "RIGHT" ? 1 : -1), instruction.to_state, instructions, finals)
		}
	}
}

function showEnv(input, data) {
	console.log("*************************************************************************")
	console.log("Input:", input, "\n")
	console.log("Machine:", data.name)
	console.log("Alphabet:", data.alphabet)
	console.log("States:", data.states)
	console.log("Initial:", data.initial)
	console.log("Finals:", data.finals)

	for (var transition in data.transitions) {
		var metaInstruction = data.transitions[transition]

		for (var instruction of metaInstruction) {
			console.log("(" + transition + ", " + instruction.read + ")", "->", "(" + instruction.to_state + ", " + instruction.write + ", " + instruction.action + ")")
		}
	}

	console.log("*************************************************************************")
}

/**
 * @description
 */
function main() {
	try {
		var args = process.argv.slice(2, process.argv.length)

		if (args.length < 2 || args[0] == "-h" || args[0] == "--help") {
			console.log("usage: ft_turing [-h] jsonfile input\n\npositional arguments:\n  jsonfile\tjson description of the machine\n\n  input\tinput of the machine\n\noptional arguments:\n  -h, --help\tshow this help message and exit")
			return
		}

		var input = args[1]
		var data = JSON.parse(fs.readFileSync(args[0]));

		if (checkJson(data) || checkInputAlphabet(input, data.alphabet)) {
			return
		}

		showEnv(input, data)
		algo(input, 0, data.initial, data.transitions, data.finals)
	} catch (e) {
		console.log(e.message);
	}
}

main()