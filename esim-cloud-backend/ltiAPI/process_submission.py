def parseJSON(json):
    list = json['data']
    results = {}
    for ele in list:
        results[ele[0]] = ele[2]
    return results

def differentiateGraphResults(expected,given):
    expected=expected['data']
    given=given['data']
    if expected != given:
        results={'same':[],'different':[],'missing':[],'added':[]}
        for index in range(0,len(expected)):
            expected_labels=expected[index]['labels']
            given_labels=given[index]['labels']
            results['added'] = results['added'] + list(set(given_labels) - set(expected_labels))
            for i in  range(0,len(expected_labels)):
                if i != 0:
                    if expected_labels[i] in given_labels:
                        if set(expected[index]['y'][i-1]) == set(given[index]['y'][i-1]):
                            results['same'].append(expected_labels[i])
                        else:
                            results['different'].append(expected_labels[i])
                    else:
                        results['missing'].append(expected_labels[i])
        return results
    return "Same Values"

def differentiateTabularResults(expected,given):
    expected = parseJSON(expected)
    given = parseJSON(given)
    if expected != given:
        results={'same':[],'different':[],'missing':[],'added':[]}
        for key,value in expected.items():
            if key in given.keys():
                if value == given[key]:
                    results['same'].append(key)
                else:
                    results['different'].append(key)
            else:
                results['missing'].append(key)
        for key,value in given.items():
            if key not in expected.keys():
                results['added'].append(key)
        # marks = str(len(results['same']))+"/"+str(len(expected))
        return results
    else:
        return "Same Values"


def process_submission(expected_simulation, given_simulation):
    score = 0
    if expected_simulation['graph'] == "true":
        comparison_result = differentiateGraphResults(expected_simulation, given_simulation)
    else:
        comparison_result = differentiateTabularResults(expected_simulation, given_simulation)
    if comparison_result == "Same Values":
        score = 1        
    else:
        total = len(comparison_result['same']) + \
            len(comparison_result['different']) + \
            len(comparison_result['missing'])
        score += len(comparison_result['same'])/total
    return score