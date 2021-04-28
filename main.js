const fs = require("fs")

String.prototype.replaceAt = function(index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }
 
    return this.substring(0, index) + replacement + this.substring(index + 1);
}

function checkJsonAlphRec(alphabet, i, length) {
	if (i < length) {
		if (typeof(alphabet[i]) != "string" || alphabet[i].length > 1) {
			console.log("Each character of Alphabet must be a string of length strictly equal to 1.")
			return 1
		}
		return checkJsonAlphRec(alphabet, i+1, length)
	}
	return 0
}

function checkJsonFinalsRec(finals, i, length, states) {
	if (i < length) {
		if (typeof(finals[i]) != "string") {
			console.log("Each element of Finals must be a string.");
			return 1;
		} else if (states.indexOf(finals[i]) == -1) {
			console.log("Each elements of finals should be a part of states.");
			return 1;
		}
		return checkJsonFinalsRec(finals, i+1, length, states)
	}
	return 0
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
	if (checkJsonAlphRec(data.alphabet, 0, data.alphabet.length)) {
		return 1
	}
	if (data.alphabet.indexOf(data.blank) == -1) {
		console.log("Blank should be part of the alphabet.")
		return 1
	}
	data.states.forEach(state => {
		if (typeof(state) != "string") {
			throw new Error("Each element of States must be a string.")
		}
	})
	if (checkJsonFinalsRec(data.finals, 0, data.finals.length, data.states)) {
		return 1
	}
	for (const transition in data.transitions) {
		if (data.states.indexOf(transition) == -1) {
			console.log("Each transition should be part of states.")
			return 1
		}

		for (const instruction of data.transitions[transition]) {
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

function checkInputAlphabetRec(input, alphabet, i, length) {
	if (i < length) {
		if (alphabet.indexOf(input[i]) == -1) {
			console.log("Input have different character than Alphabet field");
			return 1;
		}
		return checkInputAlphabetRec(input, alphabet, i+1, length)
	}
	return 0
}

function checkInputAlphabet(input, alphabet) {
	if (checkInputAlphabetRec(input, alphabet, 0, input.length)) {
		return 1
	}
	return 0
}

function printInputState(input, i, index, length) {
	if (i < length) {
		if (i == index) {
			process.stdout.write("<" + input[i] + ">");
		} else {
			process.stdout.write(input[i]);
		}
		printInputState(input, i+1, index, length);
	}
}

function printEndState(i) {
	if (i > 0) {
		process.stdout.write(".");
		printEndState(i-1);
	}
}

function printState(input, index, currentState, nextState, toWrite, action) {
	process.stdout.write("[");
	printInputState(input, 0, index, input.length);
	printEndState(20 - input.length);
	process.stdout.write("] ");
	process.stdout.write("(" + currentState + ", " + input[index] + ") " + "(" + nextState + ", " + toWrite + ", " + action + ")\n");
}

function runMachine(input, index, blank, state, instructions, finals, iter) {
	if (finals.indexOf(state) == 0) {
		console.log("*************************************************************************");
		console.log("Result : [" + input + "]");
		console.log("Complexity: " + iter + " steps");
		console.log("*************************************************************************");
		return
	}

	for (const instruction of instructions[state]) {
		if (instruction.read == input[index]) {
			printState(input, index, state, instruction.to_state, instruction.write, instruction.action)
			
			return runMachine(input.replaceAt(index, instruction.write), index + (instruction.action == "RIGHT" ? 1 : -1), blank, instruction.to_state, instructions, finals, iter+1)
		}
	}
	console.log("Machine finished without final state reached")
}

function showEnv(input, data) {
	console.log("*************************************************************************")
	console.log("Input:", input)
	console.log("Machine:", data.name)
	console.log("Alphabet:", data.alphabet)
	console.log("States:", data.states)
	console.log("Initial:", data.initial)
	console.log("Finals:", data.finals)

	for (const transition in data.transitions) {
		for (const instruction of data.transitions[transition]) {
			console.log("(" + transition + ", " + instruction.read + ")", "->", "(" + instruction.to_state + ", " + instruction.write + ", " + instruction.action + ")")
		}
	}

	console.log("*************************************************************************")
}

function main() {
	try {
		const args = process.argv.slice(2, process.argv.length)

		if (args.length < 2 || args[0] == "-h" || args[0] == "--help") {
			console.log("usage: ft_turing [-h] jsonfile input\n\npositional arguments:\n  jsonfile\tjson description of the machine\n\n  input\tinput of the machine\n\noptional arguments:\n  -h, --help\tshow this help message and exit")
			return
		}

		const data = JSON.parse(fs.readFileSync(args[0]));
		const input = args[1];
		
		if (checkJson(data) || checkInputAlphabet(input, data.alphabet)) {
			return
		}
		
		showEnv(input, data)
		runMachine(input+data.blank+data.blank+data.blank, 0, data.blank, data.initial, data.transitions, data.finals, 0)
	} catch (e) {
		console.log(e.message);
	}
}

main()