from plot import *
from parser import *


def generate_svg_from_lib(file_path):

    """ Takes .lib file as input and generates
        svg from the .lib file.
    """

    data = extractDataFromLib(file_path)

    

    for i in range(len(data)):#loop through all the components in that library file.

     
        # DEF is at position 0 of data[i]
        DEF_LINE = data[i][0]
        # F0 is at position 1 of data[i]
        F0_LINE  = data[i][1]
        # F1 is at position 2 of data[i]
        F1_LINE = data[i][2]
        # F2 is at position 3 of data[i]. footprint name
        F2_LINE = data[i][3]
        # F3 is at position 4 of data[i]. Relative path to datasheet
        F3_LINE = data[i][4]

        # DEF 14529 U 0 40 Y Y 1 L N
        # ['DEF', '14529', 'U', '0', '40', 'Y', 'Y', '1', 'L', 'N']
        name_of_symbol = DEF_LINE[1]
        # symbol_prefix is 'U' for integrated circiut and 'R' for resister
        symbol_prefix = DEF_LINE[2] 
        # The third paramater is always 0
        pin_name_offset = DEF_LINE[4]
        show_pin_number = DEF_LINE[5]
        show_pin_name  = DEF_LINE[6]
        number_of_parts_in_symbol = DEF_LINE[7]

        # ['F0', '"U"', '-300', '750', '50', 'H', 'V', 'C', 'CNN']
        # if ref starts with a '#' then its a virtual symbol/
        is_power_symbol = F0_LINE[1].startswith('#')
        # position of text field in milli.
        posx = F0_LINE[2]
        posy = F0_LINE[3]
        text_size = F0_LINE[4]
        # orientation - 'H' horizontal, 'V' - vertical
        orientation = F0_LINE[5]
        isVisible = F0_LINE[6] == "V" 
        hjustify = F0_LINE[7] 
        vjustify = F0_LINE[8][0] 
        italic   = F0_LINE[8][1] == "I";
        bold     = F0_LINE[8][2] == "B";

        


        # initialize the drawing canvas.we need to initialize and save svg for each components.
        d = draw.Drawing(1500, 2500, origin='center', displayInline=False)


        # below are the draw instructions.
        start_index_for_DRAW = 9
        
        #did -1 to drop the last element which is['ENDDRAW']
        for x in range(9,len(data[i])-1):

            """ some indexes are listed below. """
         
            
            # print(data[i][x])
            current_instruction = data[i][x]
            shape = current_instruction[0]

            # (d,pinName,pinNumber,x1,y1,length=0,orientation='R',stroke="black",stroke_width=5)
            if shape == 'X':
                # its a pin 
                # drawing using a line
                pinName = current_instruction[1]
            
                d = drawPin(d,pinName,current_instruction[2],current_instruction[3],
                            current_instruction[4],pin_name_offset,length=current_instruction[5],orientation=current_instruction[6],text_size=text_size)
            
            # (d,x1,y1,x2,y2,fill="f",pen='5',stroke='black')
            elif shape == 'S':
                # its a rectangle
        
                d = drawRec(d,current_instruction[1],current_instruction[2],
                            current_instruction[3],current_instruction[4],fill=current_instruction[8],pen=current_instruction[7])
        
             # d,x,y,r,fill="red",pen=2,stroke="black"
            elif shape == 'C':
                # its a circle
                d = drawCircle(d,current_instruction[1],current_instruction[2],current_instruction[3],pen=current_instruction[6],fill=current_instruction[7])

            # (d,cx,cy,r,start_deg,end_deg,pen = 5,fill='f')
            elif shape == 'A':
                # its an arc
                cx = current_instruction[1]
                cy = current_instruction[2]
                r  = current_instruction[3]
                start_deg = current_instruction[4]
                end_deg   = current_instruction[5]

                part = current_instruction[6]
                dmg = current_instruction[7]
                pen = current_instruction[8]
                fill = current_instruction[9]

                d = drawArc(d,cx,cy,r,start_deg,end_deg,pen,fill)
                


            # (d,vertices_count,pen=5,vertices_list = [],fill='f')
            elif shape == 'P':

                # its a polygon
                # P 2 2 1 10 -150 -175 -25 -175 f

                vertices_count = current_instruction[1]
                pen = current_instruction[4]

                fill = current_instruction[len(current_instruction)-1]

                vertices_list = []
                for j in range(5,len(current_instruction)-1,2):
                    point = (current_instruction[j],current_instruction[j+1])
                    vertices_list.append(point)
         
                d = drawPolygon(d,vertices_count,pen,vertices_list,fill)
                

            elif shape == 'T':
                # its a text
                pass

            elif shape == 'B':
                # its a bezier curve
                pass

            else:
                print("shape not found")
       

        # saving to svg
        d.saveSvg(f'./symbols/{name_of_symbol}.svg')


if __name__ == "__main__":
    print("plotting to svg..")
    generate_svg_from_lib("./sample_lib/14529.lib")
    print("done!!")