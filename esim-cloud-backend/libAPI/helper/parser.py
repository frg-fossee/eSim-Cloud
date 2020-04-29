
def extractDataFromLib(filename):
    

    defFlag = False
    with open(filename) as file:
        file_contents = file.readlines()
        data = []
        for line in file_contents:
            
            if(line.find("DEF") == 0):
                instruction = []
                defFlag = True
            
            if(line.find("ENDDEF") == 0):
                data.append(instruction)
            
                defFlag = False


            if(defFlag == True):
                instruction.append(line.strip().split(" "))

    
    return data


