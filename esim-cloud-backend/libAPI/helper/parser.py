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
                        instruction = {"def": [], "fn": [],
                                       "alias": [], "draw": []}

                        instruction["def"] = line.strip().split(" ")

                        def_flag = True

                    elif line.find("ALIAS") == 0:
                        instruction["alias"] = line.strip().split(" ")
                        if len(instruction["alias"]) > 0:
                            # remove the first element which is text ALIAS
                            instruction["alias"].pop(0)

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

                if('$CMP' in line):
                    # line = line.strip().split(' ')
                    s2 = ' '.join(line.split()[1:])
                    dcm_component = {"name": s2}
                elif('$ENDCMP' in line):
                    # line = line.strip().split(' ')
                    s2 = ' '.join(line.split()[1:])
                    dcm_data.append(dcm_component)
                elif(line[0] == 'D'):
                    # description

                    s2 = ' '.join(line.split()[1:])
                    dcm_component["D"] = s2
                elif(line[0] == 'K'):
                    # keyword
                    # line = line.strip().split(' ')
                    s2 = ' '.join(line.split()[1:])
                    dcm_component["K"] = s2
                elif(line[0] == 'F'):
                    # datasheet_link
                    # line = line.strip().split(' ')
                    s2 = ' '.join(line.split()[1:])
                    dcm_component["F"] = s2

        return dcm_data


if __name__ == "__main__":
    parser = Parser()
    # data = parser.extract_data_from_lib("./sample_lib/4002.lib")
    data = parser.extract_data_from_lib("./sample_lib/4xxx.lib")
    # print(data)
    print(data)
