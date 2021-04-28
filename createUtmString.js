const fs = require("fs")

var tag = ["A","B","C","D","E","F","G"]
var tag2= ["a","b","c","d","e","f","g"]

function findTransi(transitions, state) {
    if (state == "HALT") {
        return "S"
    }
    var i = 0;
    for (var transition in transitions) {
        if (transition == state) {
            return tag[i]
        }
        i++;
    }
}

function findTransi2(transitions, state) {
    if (state == "HALT") {
        return "S"
    }
    var i = 0;
    for (var transition in transitions) {
        if (transition == state) {
            return tag2[i]
        }
        i++;
    }
}

function main() {
	try {
		const args = process.argv.slice(2, process.argv.length)
		const data = JSON.parse(fs.readFileSync(args[0]));

        str=""


        var transitions = data.transitions
        for (var transition in transitions) {
            str += findTransi(transitions, transition);
            for (var instruction of transitions[transition]) {
                str+=instruction.read+":"+findTransi2(transitions, instruction.to_state)+instruction.write+instruction.action[0]
            }
            str += "|"
        }

        console.log(str + "#" + args[1])
    } catch (e) {
		console.log(e.message);
	}
}

main()