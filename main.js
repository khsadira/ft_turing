var fs = require("fs")

String.prototype.replaceAt = function(index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }
 
    return this.substring(0, index) + replacement + this.substring(index + 1);
}

function checkJson(data) {
	if (data.name == undefined || typeof(data.name) != "string"
	|| data.alphabet == undefined || typeof(data.alphabet) != "object"
	|| data.blank == undefined || typeof(data.blank) != "string"
	|| data.states == undefined || typeof(data.states) != "object"
	|| data.initial == undefined || typeof(data.initial) != "string"
	|| data.finals == undefined || typeof(data.finals) != "object" 
	|| data.transitions == undefined || typeof(data.transitions) != "object") {
		console.log("Some JSON fields are missing or not well formatted.")
		return 1
	}
	for (var i = 0; i < data.alphabet.length; i++) {
		if (typeof(data.alphabet[i]) != "string" || data.alphabet[i].length > 1) {
			console.log("Each character of the alphabet must be a string of length strictly equal to 1.")
			return 1
		}
	}
	if (data.alphabet.indexOf(data.blank) == -1) {
		console.log("Blank should be part of the alphabet.")
		return 1
	}
	for (var i = 0; i < data.states.length; i++) {
		if (typeof(data.states[i]) != "string") {
			console.log("Each element of the statest must be a string.")
			return 1
		}
	}
	for (var i = 0; i < data.finals.length; i++) {
		if (typeof(data.finals[i]) != "string") {
			console.log("Each element of the statest must be a string.")
			return 1
		}
	}
	for (var transition in data.transitions) {
		if (data.states.indexOf(transition) == -1) {
			console.log("Each transition should be part of states.")
			return 1
		}

		var metaInstruction = data.transitions[transition]

		for (var instruction of metaInstruction) {
			if (instruction.read == undefined || typeof(instruction.read) != "string"
			|| instruction.to_state == undefined || typeof(instruction.to_state) != "string"
			|| instruction.write == undefined || typeof(instruction.write) != "string"
			|| instruction.action == undefined || typeof(instruction.action) != "string") {
				console.log("JSON Transitions field is not well formatted.")
				return 1
			}
		}
	}
	return 0
}


function checkInputAlphabet(input, alphabet) {
	for (var i = 0; i < input.length; i++) {
		if (alphabet.indexOf(input[i]) == -1) {
			console.log("Input have different character than Alphabet field");
			return 1
		}
	}
	return 0
}

function printState(input, index, currentState, nextState, toWrite, action) {
	process.stdout.write("[")
	for (var i = 0; i < input.length; i++) {
		if (i == index) {
			process.stdout.write("<" + input[i] + ">")
		} else {
			process.stdout.write(input[i])
		}
	}
	// for (var i = 0; i < 20 - input.length; i++) {
	// 	process.stdout.write(".")
	// }
	process.stdout.write("] ")
	process.stdout.write("(" + currentState + ", " + input[index] + ") " + "(" + nextState + ", " + toWrite + ", " + action + ")\n")
}

function runMachine(input, index, blank, state, instructions, finals) {
	if (finals.indexOf(state) == 0) {
		console.log("*************************************************************************\nResult : [" + input + "]\n*************************************************************************")
		return
	}
	for (var instruction of instructions[state]) {
		if (instruction.read == input[index]) {
			printState(input, index, state, instruction.to_state, instruction.write, instruction.action)
			if (instruction.action == "RIGHT" && index + 1 == input.length) {
				input += blank
			}
			
			return runMachine(input.replaceAt(index, instruction.write), index + (instruction.action == "RIGHT" ? 1 : -1), blank, instruction.to_state, instructions, finals)
		}
	}
	console.log("Machine finished without final state reached")
}

/**
 * 
 * @param {*} input 
 * @param {*} data 
 */
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

		var data = JSON.parse(fs.readFileSync(args[0]));
		var input = args[1];
		
		if (checkJson(data) || checkInputAlphabet(input, data.alphabet)) {
			return
		}

		for (var i = 0; i < 20 - args[1].length; i++) {
			input += data.blank
		}
		
		showEnv(input, data)
		runMachine(input, 0, data.blank, data.initial, data.transitions, data.finals)
	} catch (e) {
		console.log(e.message);
	}
}

main()