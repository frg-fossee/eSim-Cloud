import re
import json

def extractDataFromNgSpiceOutput(pathToFile):

    """
    Parses the output file generated by ngspice and
    returns a json containing points to plot graph.
    """

    try:
        with open(pathToFile,'r') as f:
            fContents = f.readlines()
            jsonData = {}
            depthLevel = 0

            for line in fContents:
                m = re.search('Index',line)
                if(m):
                    headerContents = line.split()
                    #subtract 2 to remove Time and Index from the total length of list
                    totalNumberOfTables = len(headerContents) - 2
                    jsonData['totalNumberOfTables'] = totalNumberOfTables
                    jsonData["headers"] = headerContents
                    jsonData["dataPoints"]= []
                    depthLevel = len(headerContents)
                    for i in range(depthLevel):
                        jsonData['dataPoints'].append([])

                m = re.match('[0-9]+',line)
                if(m):
                    d = (line.split())
                    for i in range(len(headerContents)):
                        jsonData['dataPoints'][i].append(d[i])

        return json.dumps(jsonData)

    except IOError as e:
        return "Cannot open file."

#for testing
if __name__ == "__main__":
    print(extractDataFromNgSpiceOutput("./sample_files/plot_data_v.txt"))
