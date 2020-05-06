import re


class Parser:
    def extract_data_from_lib(self, filename):

        def_flag = False
        with open(filename) as file:
            file_contents = file.readlines()
            data = []
            for line in file_contents:

                # check for blank lines.
                if line.strip() != "":

                    if line.find("DEF") == 0:
                        instruction = {"def": [], "fn": [], "draw": []}

                        instruction["def"] = line.strip().split(" ")

                        def_flag = True

                    elif line.find("ENDDEF") == 0:
                        data.append(instruction)
                        def_flag = False

                    elif re.match(r"F[0-9]+", line):
                        instruction["fn"].append(line.strip().split(" "))

                    elif line.startswith(("A", "C", "P", "S", "T", "B", "X")):
                        instruction["draw"].append(line.strip().split(" "))

                    else:
                        pass

        return data


if __name__ == "__main__":
    parser = Parser()
    data = parser.extract_data_from_lib("./sample_lib/4002.lib")
    print(data)
