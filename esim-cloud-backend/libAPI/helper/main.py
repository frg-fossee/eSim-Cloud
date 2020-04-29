from plot import *
from parser import *


def generate_svg_from_lib(file_path):

    """ Takes .lib file as input and generates
        svg from the .lib file.
    """




    data = extractDataFromLib(file_path)


    for i in range(len(data)):#loop through all the components in that library file.

        name_of_symbol = data[i][0][1]
        pin_name_offset = data[i][0][4]
        show_pin_number = data[i][0][5]
        show_pin_name  = data[i][0][6]

        
        number_of_parts_in_symbol = data[i][0][7]

        if_power_symbol = data[i][1][0] # if ref starts with a '#' then its a virtual symbol/

        # initialize the drawing canvas.we need to initialize and save svg for each components.
        d = draw.Drawing(1500, 2500, origin='center', displayInline=False)


        # below are the draw instructions.
        for x in range(9,len(data[i])-1):#did -1 to drop the last element which is['ENDDRAW']
            """ some indexes are listed below"""
            # data[i][0][1] -> name of the symbol
            # data[i][x][0] -> first character of draw instructions that tells the shape of the drawing.
            # from index 9 i.e data[9] to end of array there is drawing instructions.

            current_instruction = data[i][x]
            shape = current_instruction[0]


            # (d,pinName,pinNumber,x1,y1,length=0,orientation='R',stroke="black",stroke_width=5)
            if shape == 'X':
                # its a pin 
                # drawing using a line
                pinName = current_instruction[1]
            
                d = drawPin(d,pinName,current_instruction[2],current_instruction[3],
                            current_instruction[4],pin_name_offset,length=current_instruction[5],orientation=current_instruction[6])
            
            # (d,x1,y1,x2,y2,fill="f",pen='5',stroke='black')
            if shape == 'S':
                # its a rectangle
        
                d = drawRec(d,current_instruction[1],current_instruction[2],
                            current_instruction[3],current_instruction[4],fill=current_instruction[8],pen=current_instruction[7])
        
             # d,x,y,r,fill="red",pen=2,stroke="black"
            if shape == 'C':
                #its a circle
                d = drawCircle(d,current_instruction[1],current_instruction[2],current_instruction[3],pen=current_instruction[6],fill=current_instruction[7])


            # more shapes will be added soon.

        # saving to svg
        d.saveSvg(f'./symbols/{name_of_symbol}.svg')


if __name__ == "__main__":
    print("plotting to svg..")
    generate_svg_from_lib("./sample_lib/4xxx.lib")
    print("done!!")