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
                        def_flag = False  # noqa

                    elif re.match(r"F[0-9]+", line):
                        instruction["fn"].append(line.strip().split(" "))

                    elif line.startswith(("A", "C", "P", "S", "T", "B", "X")):
                        instruction["draw"].append(line.strip().split(" "))

                    else:
                        pass

        return data

    def extract_data_from_dcm(self, filename):

        with open(filename) as file:
            file_contents = file.readlines()
            # data = []
            # print(file_contents)

            dcm_data = []

            for line in file_contents:
                line = line.strip().split(' ')
                if('$CMP' in line):
                    dcm_component = {"name": line[1]}
                elif('$ENDCMP' in line):
                    dcm_data.append(dcm_component)
                elif(line[0] == 'D'):
                    # description
                    dcm_component["D"] = line[1]
                elif(line[0] == 'K'):
                    # keyword
                    dcm_component["K"] = line[1]
                elif(line[0] == 'F'):
                    # datasheet_link
                    dcm_component["F"] = line[1]

        return dcm_data


if __name__ == "__main__":
    parser = Parser()
    # data = parser.extract_data_from_lib("./sample_lib/4002.lib")
    data = parser.extract_data_from_dcm("../../kicad-symbols/4xxx.dcm")
    # print(data)
    for co in range(0, len(data)):
        print(data[co]["name"])
