#include <string>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>

/*
encoded function names: ABCD
alphabet max size: 4
side separator: #
current input pos: I
*/
std::string encoded_func_names("ABCDEFS");

std::string							utm("");
std::string							input_alphabet("1.+=-0ijyn"); // alphabet other than UTM alphabet
std::string							alphabet("1.+=-0ijyn");
std::vector<std::string>			states{"start"};
std::map<std::string, std::string>	transitions;

std::string	addline(std::string str, int nbtab = 0)
{
	std::string ret("");

	for (int i = 0; i < nbtab; i++)
		ret += "\t";
	ret += str;
	return ret;
}

std::string	make_transition(char read, std::string state, char write, std::string action = "RIGHT")
{
	return "\t\t\t{ \"read\" : \"" + std::string(1, read) + "\", \"to_state\": \"" + state + "\", \"write\": \""+ std::string(1, write) +"\", \"action\": \""+ action +"\"},\n";
}

std::string	str(char c)
{
	return std::string(1, c);
}

void addstatestransitions()
{
	std::string	RL("RL");

	// start goto first input with A
	for (int i = 0; i < alphabet.length(); i++)
	{
		if (alphabet[i] != '#')
			transitions["start"] += make_transition(alphabet[i], "start", alphabet[i], "RIGHT");
		else
			transitions["start"] += make_transition(alphabet[i], "first_input", alphabet[i], "RIGHT");
	}
	states.push_back("first_input");
	for (int i = 0; i < input_alphabet.length(); i++)
	{
		transitions["first_input"] += make_transition(input_alphabet[i], str(input_alphabet[i]) + "_find_A", 'I', "LEFT");
	}
	// learn functions
	for (int o = 0; o < input_alphabet.length(); o++)
	{
		for (int i = 0; i < encoded_func_names.length(); i++)
		{
			states.push_back(str(input_alphabet[o]) + "_find_" + str(encoded_func_names[i]));
			if (encoded_func_names[i] == 'S')
			{
				for (int j = 0; j < alphabet.length(); j++)
				{
					if (alphabet[j] != 'I')
						transitions[states.back()] += make_transition(alphabet[j], states.back(), alphabet[j], "RIGHT");
					else
						transitions[states.back()] += make_transition('I', "HALT", input_alphabet[o], "RIGHT");
				}
			}
			else
			{
				for (int j = 0; j < alphabet.length(); j++)
				{
					if (alphabet[j] != encoded_func_names[i])
						transitions[states.back()] += make_transition(alphabet[j], states.back(), alphabet[j], "LEFT");
					else
						transitions[states.back()] += make_transition(alphabet[j], str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]), alphabet[j], "RIGHT");
				}
			}
			states.push_back(str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]));
			for (int j = 0; j < input_alphabet.length(); j++)
			{
				if (input_alphabet[j] != input_alphabet[o])
					transitions[states.back()] += make_transition(input_alphabet[j], states.back(), input_alphabet[j], "RIGHT");
				else
					transitions[states.back()] += make_transition(input_alphabet[j], str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]) + str(input_alphabet[o]), input_alphabet[j], "RIGHT");
			}
			transitions[states.back()] += make_transition(':', str(input_alphabet[o]) + "_nextInstr_" + str(encoded_func_names[i]), ':', "RIGHT");
			states.push_back(str(input_alphabet[o]) + "_nextInstr_" + str(encoded_func_names[i]));
			for (int j = 0; j < alphabet.length(); j++)
			{
				if (alphabet[j] != ':' && alphabet[j] != '|')
					transitions[states.back()] += make_transition(alphabet[j], states.back(), alphabet[j], "RIGHT");				
			}
			transitions[states.back()] += make_transition(':', str(alphabet[o]) + "_learn_" + str(encoded_func_names[i]), ':', "LEFT");
			transitions[states.back()] += make_transition('|', "ERROR", '|', "RIGHT");
			states.push_back(str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]) + str(input_alphabet[o]));
			for (int j = 0; j < encoded_func_names.length(); j++)
			{
				transitions[states.back()] += make_transition(encoded_func_names[j]+32, str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]) + str(input_alphabet[o]) + str(encoded_func_names[j]), encoded_func_names[j]+32, "RIGHT");
			}
			transitions[states.back()] += make_transition(':', states.back(), ':', "RIGHT");
			for (int j = 0; j < encoded_func_names.length(); j++)
			{
				{
					states.push_back(str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]) + str(input_alphabet[o]) + str(encoded_func_names[j]));
					for (int k = 0; k < input_alphabet.length(); k++)
					{
						transitions[states.back()] += make_transition(input_alphabet[k], states.back() + str(input_alphabet[k]), input_alphabet[k], "RIGHT");
					}
					for (int k = 0; k < input_alphabet.length(); k++)
					{
						states.push_back(str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]) + str(input_alphabet[o]) + str(encoded_func_names[j]) + str(input_alphabet[k]));
						transitions[states.back()] += make_transition('R', states.back() + "R", 'R', "RIGHT");
						transitions[states.back()] += make_transition('L', states.back() + "L", 'L', "RIGHT");
					}
					for (int k = 0; k < input_alphabet.length(); k++)
					{
						for (int m = 0; m < RL.length(); m++)
						{
							states.push_back(str(input_alphabet[o]) + "_learn_" + str(encoded_func_names[i]) + str(input_alphabet[o]) + str(encoded_func_names[j]) + str(input_alphabet[k]) + str(RL[m]));
							for (int f = 0; f < alphabet.length(); f++)
							{
								if (alphabet[f] != 'I')
									transitions[states.back()] += make_transition(alphabet[f], states.back(), alphabet[f], "RIGHT");
								else
									transitions[states.back()] += make_transition(alphabet[f], "read_input_" + str(encoded_func_names[j]), input_alphabet[k], (RL[m] == 'R') ? "RIGHT" : "LEFT");
							}
						}
					}
				}
			}
		}
	}
	for (int i = 0; i < encoded_func_names.length(); i++)
	{
		states.push_back("read_input_" + str(encoded_func_names[i]));
		for (int j = 0; j < input_alphabet.length(); j++)
		{
			transitions[states.back()] += make_transition(input_alphabet[j], str(input_alphabet[j]) + "_find_" + str(encoded_func_names[i]), 'I', "LEFT");
		}
		transitions[states.back()] += make_transition('#', "ERROR", '#', "RIGHT");
	}
}

int	main()
{
	alphabet += encoded_func_names;
	alphabet += "#I:|RL";
	for (int i = 0; i < encoded_func_names.length(); i++)
		alphabet += str(encoded_func_names[i] + 32);
	addstatestransitions();
	utm += addline("{\n", 0);
	utm += addline("\"name\" : \"utm\",\n", 1);
	utm += addline("\"alphabet\" : [ ", 1);
	for (int i = 0; i < alphabet.length(); i++)
		utm += "\"" + std::string(1, alphabet[i]) + "\"" + ((i == alphabet.length()-1) ? "" : ", ");
	utm += addline(" ],\n");
	utm += addline("\"blank\" : \".\",\n", 1);
	utm += addline("\"states\" : [ \"HALT\", ", 1);
	for (int i = 0; i < states.size(); i++)
		utm += "\"" + states[i] + "\"" + ((i == states.size()-1) ? "" : ", ");
	utm += addline(" ],\n");
	utm += addline("\"initial\" : \"start\",\n", 1);
	utm += addline("\"finals\" : [ \"HALT\" ],\n", 1);
	utm += addline("\"transitions\" : {\n", 1);
	for (int i = 0; i < states.size(); i++)
	{
		utm += addline("\"" + states[i] + "\": [\n", 2);
		utm += addline(transitions[states[i]]);
		utm = utm.substr(0, utm.size()-2);
		utm += "\n";
		utm += addline("]", 2);
		if (i + 1 < states.size())
			utm += addline(",\n");
		else
			utm += addline("\n");
	}
	utm += addline("}\n", 1);
	utm += addline("}\n");
	std::cout << utm;
	return 0;
}