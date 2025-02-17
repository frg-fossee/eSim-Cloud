import json
from wsgiref.util import request_uri


def parseJSON(json):
    list = json['data']
    results = {}
    for ele in list:
        results[ele[0]] = ele[2]
    return results


def differentiateGraphResults(expected, given, sim_params):
    expected = expected['data']
    given = given['data']
    compare_result_flag = True
    if expected != given:
        results = {'same': [], 'different': [], 'missing': [], 'added': []}
        for index in range(0, len(expected)):
            expected_labels = expected[index]['labels']
            for param in sim_params:
                if param not in expected_labels:
                    continue
                given_labels = given[index]['labels']
                results['added'] = results['added'] + \
                    list(set(given_labels) - set(expected_labels))
                for i in range(0, len(expected_labels)):
                    if i != 0:
                        if expected_labels[i] in given_labels:
                            if set(expected[index]['y'][i-1]) == set(given[index]['y'][i-1]):  # noqa
                                results['same'].append(expected_labels[i])
                            else:
                                results['different'].append(expected_labels[i])
                        else:
                            results['missing'].append(expected_labels[i])
        return results
    return "Same Values"


def differentiateTabularResults(expected, given, sim_params):
    expected = parseJSON(expected)
    given = parseJSON(given)
    if expected != given:
        results = {'same': [], 'different': [], 'missing': [], 'added': []}
        for key, value in expected.items():
            for param in sim_params:
                if param != key:
                    continue
                if key in given.keys():
                    if value == given[key]:
                        results['same'].append(key)
                    else:
                        results['different'].append(key)
                else:
                    results['missing'].append(key)
        for key, value in given.items():
            if key not in expected.keys():
                results['added'].append(key)
        # marks = str(len(results['same']))+"/"+str(len(expected))
        return results
    else:
        return "Same Values"


def process_submission(expected_simulation, given_simulation, sim_params):
    score = 0
    if expected_simulation['graph'] == "true":
        comparison_result = differentiateGraphResults(
            expected_simulation, given_simulation, sim_params)
    else:
        comparison_result = differentiateTabularResults(
            expected_simulation, given_simulation, sim_params)
    if comparison_result == "Same Values":
        score = 1
    else:
        total = len(comparison_result['same']) + \
            len(comparison_result['different']) + \
            len(comparison_result['missing'])
        score += len(comparison_result['same'])/total
    return score, comparison_result

def arduino_eval(original_data, initial_given_data, student_data, con_weight, max_score):
    evaluated = True
    original_data = original_data.replace("\'", "\"")
    student_data = student_data.replace("\'", "\"")
    original_data = json.loads(original_data)
    student_data = json.loads(student_data)
    given_data = json.loads(initial_given_data['data_dump'])

    given_pins = []
    for wire in given_data.get('wires', []):
        start = wire.get('start')
        end = wire.get('end')
        # Check if either start or end has keyName 'ArduinoUno'
        for pin in [start, end]:
            if pin and pin.get('keyName') == 'ArduinoUno':
                pid = pin['pid']
                if 2 <= pid <= 13:
                    given_pins.append(f"D{15 - pid}")  # Map to digital pin (D2 -> D13, D3 -> D12, etc.)
                elif 22 <= pid <= 27:
                    given_pins.append(f"A{pid - 22}")  # Map to analog pin (A22 -> A0, A23 -> A1, etc.)

    # print("Used Pins:", given_pins)

    key = list(original_data.keys())[0]
    org_hexvals = list(original_data[key]['hexVals'])
    st_hexvals = list(student_data[key]['hexVals'])

    org_pins = list(original_data[key]['pinConnected'])
    st_pins = list(student_data[key]['pinConnected'])
    # Extract the pin number from the pin names
    org_pin_num = [pin.split(' - ')[1] for pin in org_pins]
    st_pin_num = [pin.split(' - ')[1] for pin in st_pins]
    print("all studdent Pins:", st_pin_num)

    # Find pins that student needs to connect
    remaining_pins = [pin for pin in org_pin_num if pin not in given_pins]
    print("remaining Pins:", remaining_pins)
    # Find out if student has connected all pins
    new_st_pin = [pin for pin in st_pin_num if pin not in given_pins]
    print("new studdent Pins:", new_st_pin)

    if int(len(org_hexvals)) > int(len(st_hexvals)):
        evaluated = False
        return 0, evaluated
    
    if not remaining_pins:  # If no remaining pins, check if student pins match original pins
        common_pins = list(set(st_pin_num).intersection(org_pin_num))
        print("No remaining, Common Pins:",common_pins)
        con_weightage = (((len(common_pins) / len(org_pin_num)) * con_weight) / 100) * max_score
    else:  # If remaining pins, Calculate connection weightage based on how many common pins are correct
        common_pins = list(set(new_st_pin).intersection(remaining_pins))
        print(print("YES remaining, Common Pins:",common_pins))
        con_weightage = (((len(common_pins) / len(remaining_pins)) * con_weight) / 100) * max_score
    count = 0
    for i in range(int(len(org_hexvals))):
        if st_hexvals[i] == org_hexvals[i]:
            count += 1
    code_weightage = (((count/len(org_hexvals)) * (100-con_weight))/100) \
        * (max_score)
    return round(con_weightage+code_weightage, 2), evaluated
    