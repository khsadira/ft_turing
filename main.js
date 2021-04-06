var fs = require("fs")

function main() {
	var args = process.argv.slice(2, process.argv.length)

	if (args.length < 2 || args[0] == "-h" || args[0] == "--help") {
		console.log("usage: ft_turing [-h] jsonfile input\n\npositional arguments:\n  jsonfile\tjson description of the machine\n\n  input\tinput of the machine\n\noptional arguments:\n  -h, --help\tshow this help message and exit")
		return
	}

	var state = args[1]
	console.log("INPUT:", state, "\n")
	
	var data = JSON.parse(fs.readFileSync(args[0]));

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
}

main()