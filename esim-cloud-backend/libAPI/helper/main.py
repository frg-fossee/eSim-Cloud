from plotter import SvgPlotter
from parser import Parser
# import drawSvg as draw
import drawSvg as draw

class SvgGenerator():

    def __init__(self):
        self.CANVAS_HEIGHT = 2000
        self.CANVAS_WIDTH = 1500

        self.PART_NUMBER = ['0','1']
        self.DMG_NUMBER = ['0','1']

        self.DEFAULT_PEN_WIDTH = '6'
        self.PIN_NAME_PADDING = 13 

        self.SHOW_TEXT = False

        self.SVG_SCALE = 0.1

    
        self.plotter = SvgPlotter()
        self.parser = Parser()

        


    def match_part_dmg(self,part,dmg):

        """ Check if part and dmg matches or not
        """
        
        if part in self.PART_NUMBER and dmg in self.DMG_NUMBER:
            return True

        return False


    def save_svg(self,d,name_of_symbol):
        
        """ save svg"""

        d.saveSvg(f'./symbols/{name_of_symbol}.svg')



    def generate_svg_from_lib(self,file_path):

        """ Takes .lib file as input and generates
            svg from the .lib file.
        """

        data = self.parser.extract_data_from_lib(file_path)

        

        for i in range(len(data)):#loop through all the components in that library file.


            # initialize the drawing canvas.we need to initialize and save svg for each components.
        
            d = draw.Drawing(self.CANVAS_WIDTH,self.CANVAS_HEIGHT, origin='center', displayInline=False)
            d.setPixelScale(s=self.SVG_SCALE)
        
         
        
            DEF_LINE = data[i]["def"]
     
            F0_LINE  = data[i]["fn"][0]
        
            F1_LINE = data[i]["fn"][1]
           
            F2_LINE = data[i]["fn"][2]
           
            F3_LINE = data[i]["fn"][3]

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
            # is_power_symbol = F0_LINE[1].startswith('#')
            # position of text field in milli.
            # posx = F0_LINE[2]
            # posy = F0_LINE[3]
            # text_size = F0_LINE[4]
            # orientation - 'H' horizontal, 'V' - vertical
            # orientation = F0_LINE[5]
            # isVisible = F0_LINE[6] == "V" 
            # hjustify = F0_LINE[7] 
            # vjustify = F0_LINE[8][0] 
            # isItalic   = F0_LINE[8][1] == "I"
            # isBold     = F0_LINE[8][2] == "B"

    


            fn_instructions = data[i]["fn"]
            for z in range(len(fn_instructions)):
                text =  fn_instructions[z][1]
                x    = fn_instructions[z][2]
                y    = fn_instructions[z][3]
                text_size = fn_instructions[z][4]
                orientation = fn_instructions[z][5]
                isVisible = fn_instructions[z][6] == "V" 
                hjustify =  fn_instructions[z][7] 
                vjustify = fn_instructions[z][8][0] 
                isItalic   = fn_instructions[z][8][1] == "I"
                isBold     = fn_instructions[z][8][2] == "B"

                if(isVisible and self.SHOW_TEXT):
                    d = self.plotter.draw_text(d,text,x,y,text_size,orientation)


            draw_instructions = data[i]["draw"]
            for x in range(len(draw_instructions)):
            
                # print(data[i][x])
                current_instruction = draw_instructions[x]
                shape = current_instruction[0]

                # (d,pinName,pinNumber,x1,y1,length=0,orientation='R',stroke="black",stroke_width=5)
                if shape == 'X':
                    # its a pin 
                    # drawing using a line
                    pinName = current_instruction[1]
                    pinNumber = current_instruction[2]
                    x_pos   = current_instruction[3]
                    y_pos = current_instruction[4]
                    pin_length = current_instruction[5]
                    pin_orientation = current_instruction[6]

                    part = current_instruction[9] 
                    dmg = current_instruction[10]

                    if(not self.match_part_dmg(part,dmg)):
                        continue

                
                    pin_name_ofset = str(int(pin_name_offset) + len(pinName) * self.PIN_NAME_PADDING)
            

                    d = self.plotter.drawPin(d,pinName,pinNumber,x_pos,y_pos
                                ,pin_name_ofset,length=pin_length
                                ,orientation=pin_orientation,text_size=text_size)
                
                # (d,x1,y1,x2,y2,fill="f",pen='5',stroke='black')
                elif shape == 'S':
                    # its a rectangle
                    x1 = current_instruction[1]
                    y1 = current_instruction[2]
                    x2 = current_instruction[3]  
                    y2 = current_instruction[4]
                    fill_shape = current_instruction[8]
                    pen_width = current_instruction[7]

                    if(pen_width == '0'):
                        pen_width = self.DEFAULT_PEN_WIDTH

                    part = current_instruction[5] 
                    dmg = current_instruction[6]

                    if(not self.match_part_dmg(part,dmg)):
                        continue

                    d = self.plotter.drawRec(d,x1,y1,x2,y2,fill_shape,pen_width)
            
                # d,x,y,r,fill="red",pen=2,stroke="black"
                elif shape == 'C':
                    # its a circle
                    cx = current_instruction[1]
                    cy = current_instruction[2]
                    r = current_instruction[3]
                    pen_width = current_instruction[6]
                    fill_shape = current_instruction[7]

                    if(pen_width == '0'):
                        pen_width = self.DEFAULT_PEN_WIDTH

                    part = current_instruction[4] 
                    dmg = current_instruction[5]

                    if(not self.match_part_dmg(part,dmg)):
                        continue

                    d = self.plotter.drawCircle(d,cx,cy,r,fill=fill_shape,pen=pen_width)

                # (d,cx,cy,r,start_deg,end_deg,pen = 5,fill='f')
                elif shape == 'A':
                    # its an arc
                    cx = current_instruction[1]
                    cy = current_instruction[2]
                    r  = current_instruction[3]
                    start_deg = current_instruction[4]
                    end_deg   = current_instruction[5]

                    pen_width = current_instruction[8]
                    fill = current_instruction[9]

                    if(pen_width == '0'):
                        pen_width = self.DEFAULT_PEN_WIDTH

                    part = current_instruction[6]
                    dmg = current_instruction[7]

                    if(not self.match_part_dmg(part,dmg)):
                        continue
                    d = self.plotter.drawArc(d,cx,cy,r,start_deg,end_deg,pen_width,fill)
                    


                # (d,vertices_count,pen=5,vertices_list = [],fill='f')
                elif shape == 'P':

                    # its a polygon
                    # P 2 2 1 10 -150 -175 -25 -175 f

                    vertices_count = current_instruction[1]
                    pen_width = current_instruction[4]

                    if(pen_width == '0'):
                        pen_width = self.DEFAULT_PEN_WIDTH

                    part = current_instruction[2] 
                    dmg = current_instruction[3]

                    if(not self.match_part_dmg(part,dmg)):
                        continue


                    fill = current_instruction[len(current_instruction)-1]

                    vertices_list = []
                    for j in range(5,len(current_instruction)-1,2):
                        point = (current_instruction[j],current_instruction[j+1])
                        vertices_list.append(point)
            
                    d = self.plotter.drawPolygon(d,vertices_count,pen_width,vertices_list,fill)
                    

                elif shape == 'T':
                    # its a text
                    pass

                elif shape == 'B':
                    # its a bezier curve
                    pass

                else:
                    pass
        

            self.save_svg(d,name_of_symbol)


if __name__ == "__main__":
    print("plotting to svg..")
    svg_gen = SvgGenerator()
    # svg_gen.SHOW_TEXT = True
    svg_gen.generate_svg_from_lib("./sample_lib/4xxx.lib")
    print("done!!")