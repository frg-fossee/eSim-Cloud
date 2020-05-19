from .plotter import SvgPlotter
from .parser import Parser
import os
import sys

# import drawSvg as draw
import drawSvg as draw


class SvgGenerator:
    def __init__(self):
        self.CANVAS_HEIGHT = 2000
        self.CANVAS_WIDTH = 1500

        self.PART_NUMBER = "1"
        self.DMG_NUMBER = "1"

        self.DEFAULT_PEN_WIDTH = "6"
        self.PIN_NAME_PADDING = 13

        self.SHOW_TEXT = True

        self.SVG_SCALE = 1

        # some symbols dont have dmg 2.
        # assuming dmg 2 is present.
        # this will be changed to False later if we find
        # that dmg 2 is not present.
        self.IS_DMG_2_PRESENT = False

        self.plotter = SvgPlotter()
        self.parser = Parser()

    def match_part_dmg(self, part, dmg):
        """ Check if part  matches or not
        """
        if (part == "0" or part == self.PART_NUMBER) and (
            dmg == "0" or dmg == self.DMG_NUMBER
        ):
            return True

        return False

    def save_svg(self, d, name_of_symbol, save_path, pin_number_positions,
                 dimension):
        """ save svg"""
        # print(pin_number_positions)
        # check if symbols directory is present or not.
        path_to_svg = f"{save_path}/{name_of_symbol}.svg"
        d.saveSvg(path_to_svg)
        # after saving svg open it again and embedd metadata.
        # print(pin_number_positions)
        elem = ""
        for x in range(len(pin_number_positions)):
            pin = pin_number_positions[x]
            pin_number = pin["pinNumber"]
            x = pin['x']
            y = pin['y']
            pin_type = pin['type']
            elem += f"""<p-{pin_number}><x>{x}</x><y>{y}</y><type>{pin_type}
                     </type></p-{pin_number}>"""

        # save the above elem in the same svg file.
        fd = open(path_to_svg, 'r')
        s = fd.readlines()
        if(s[-1].strip('\n') != '</svg>'):
            while s[-1].strip("\n") != '</svg>':
                s.pop(-1)
        s.pop(-1)

        fd = open(path_to_svg, 'w')
        for i in range(len(s)):
            fd.write(s[i])
        fd.write(f'<metadata width="{dimension[0]}" height="{dimension[1]}">')
        fd.write(elem)
        fd.write("</metadata></svg>")
        fd.close()

    def generate_svg_from_lib(self, file_path, output_path):
        """ Takes .lib file as input and generates
            svg from the .lib file.
        """

        data = self.parser.extract_data_from_lib(file_path)
        dcm_path = file_path.rsplit(".", 1)
        dcm_path = dcm_path[0] + ".dcm"
        folder_name = file_path.split('/')[-1].split(".")[0]

        dcm_data = self.parser.extract_data_from_dcm(dcm_path)
        # folder_name is also same as the file name without extension

        component_data = {}
        # loop through all the components in that library file.
        for i in range(len(data)):

            # initialize the drawing canvas.we need to initialize and save svg
            # for each components.

            DEF_LINE = data[i]["def"]

            F0_LINE = data[i]["fn"][0]  # noqa

            F1_LINE = data[i]["fn"][1]  # noqa

            # footprint name if present
            F2_LINE = data[i]["fn"][2]  # noqa

            # relative path to datasheet if prsent
            F3_LINE = data[i]["fn"][3]  # noqa

            # DEF 14529 U 0 40 Y Y 1 L N
            # ['DEF', '14529', 'U', '0', '40', 'Y', 'Y', '1', 'L', 'N']
            name_of_symbol = DEF_LINE[1]

            # symbol_prefix is 'U' for integrated circiut and 'R' for resister
            symbol_prefix = DEF_LINE[2]  # noqa

            # The third paramater is always 0
            pin_name_offset = DEF_LINE[4]
            show_pin_number = DEF_LINE[5]   # noqa
            show_pin_name = DEF_LINE[6]     # noqa

            # this tells the number of parts in the symbol.
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

            draw_instructions = data[i]["draw"]
            for dm in range(1, 2 + 1):

                self.DMG_NUMBER = str(dm)

                if not self.IS_DMG_2_PRESENT and dm == 2:
                    break

                for z in range(1, int(number_of_parts_in_symbol) + 1):

                    pin_number_positions = []
                    my_height = 0
                    my_width = 0
                    for run in range(0, 2):

                        # initialize canvas here.
                        d = draw.Drawing(
                            my_width,
                            my_height,
                            origin="center",
                            displayInline=False,
                        )

                        d.setPixelScale(s=self.SVG_SCALE)

                        self.PART_NUMBER = str(z)

                        fn_instructions = data[i]["fn"]
                        for index in range(len(fn_instructions)):
                            text = fn_instructions[index][1]
                            x = fn_instructions[index][2]
                            y = fn_instructions[index][3]
                            text_size = fn_instructions[index][4]
                            orientation = fn_instructions[index][5]  # noqa
                            isVisible = fn_instructions[index][6] == "V"
                            hjustify = fn_instructions[index][7]    # noqa
                            vjustify = fn_instructions[index][8][0]  # noqa
                            isItalic = fn_instructions[index][8][1] == "I"  # noqa
                            isBold = fn_instructions[index][8][2] == "B"    # noqa

                            if fn_instructions[index][0] == "F0":
                                text = text.strip('"')
                                # convert to alphabet equivalent of number
                                # ascii 65 -> A
                                text = f"{text}{dm}:{chr(64+z)}"

                            if isVisible and self.SHOW_TEXT:

                                d = self.plotter.draw_text(d, text, x,
                                                           y, text_size)

                        for x in range(len(draw_instructions)):

                            # print(data[i][x])
                            current_instruction = draw_instructions[x]
                            shape = current_instruction[0]

                            # (d,pinName,pinNumber,x1,y1,length=0,orientation='R',stroke="black",stroke_width=5)
                            if shape == "X":
                                # its a pin
                                # drawing using a line
                                pinName = current_instruction[1]
                                pinNumber = current_instruction[2]
                                x_pos = current_instruction[3]
                                y_pos = current_instruction[4]
                                pin_length = current_instruction[5]
                                pin_orientation = current_instruction[6]

                                part = current_instruction[9]
                                dmg = current_instruction[10]

                                type_of_pin = current_instruction[11]  # noqa

                                if dmg == "2":
                                    self.IS_DMG_2_PRESENT = True
                                # The 12th index may or maynot be present
                                #  in every
                                # instruction.
                                try:
                                    shape_of_pin = current_instruction[12]
                                except IndexError:
                                    shape_of_pin = ""

                                if not self.match_part_dmg(part, dmg):
                                    continue

                                pin_name_ofset = str(
                                    int(pin_name_offset)
                                    + len(pinName) * self.PIN_NAME_PADDING
                                )

                                if run == 1:
                                    pin_number_positions.append({
                                        "pinNumber": pinNumber,
                                        "x": x_pos,
                                        "y": y_pos,
                                        "type": type_of_pin,
                                    })

                                d = self.plotter.drawPin(
                                    d,
                                    pinName,
                                    pinNumber,
                                    x_pos,
                                    y_pos,
                                    pin_name_ofset,
                                    length=pin_length,
                                    orientation=pin_orientation,
                                    text_size=text_size,
                                    shape_of_pin=shape_of_pin,
                                )

                            # (d,x1,y1,x2,y2,fill="f",pen='5',stroke='black')
                            elif shape == "S":
                                # its a rectangle
                                x1 = current_instruction[1]
                                y1 = current_instruction[2]
                                x2 = current_instruction[3]
                                y2 = current_instruction[4]
                                fill_shape = current_instruction[8]
                                pen_width = current_instruction[7]

                                part = current_instruction[5]
                                dmg = current_instruction[6]

                                if dmg == "2":
                                    self.IS_DMG_2_PRESENT = True

                                if pen_width == "0":
                                    pen_width = self.DEFAULT_PEN_WIDTH

                                if not self.match_part_dmg(part, dmg):
                                    continue

                                d = self.plotter.drawRec(
                                    d, x1, y1, x2, y2, fill_shape, pen_width
                                )

                            # d,x,y,r,fill="red",pen=2,stroke="black"
                            elif shape == "C":
                                # its a circle
                                cx = current_instruction[1]
                                cy = current_instruction[2]
                                r = current_instruction[3]
                                pen_width = current_instruction[6]
                                fill_shape = current_instruction[7]

                                part = current_instruction[4]
                                dmg = current_instruction[5]

                                if dmg == "2":
                                    self.IS_DMG_2_PRESENT = True

                                if pen_width == "0":
                                    pen_width = self.DEFAULT_PEN_WIDTH

                                if not self.match_part_dmg(part, dmg):
                                    continue

                                d = self.plotter.drawCircle(
                                    d, cx, cy, r, fill=fill_shape,
                                    pen=pen_width
                                )

                            # (d,cx,cy,r,start_deg,end_deg,pen = 5,fill='f')
                            elif shape == "A":
                                # its an arc
                                cx = current_instruction[1]
                                cy = current_instruction[2]
                                r = current_instruction[3]
                                start_deg = current_instruction[4]
                                end_deg = current_instruction[5]

                                pen_width = current_instruction[8]
                                fill = current_instruction[9]

                                part = current_instruction[6]
                                dmg = current_instruction[7]

                                if dmg == "2":
                                    self.IS_DMG_2_PRESENT = True

                                if pen_width == "0":
                                    pen_width = self.DEFAULT_PEN_WIDTH

                                if not self.match_part_dmg(part, dmg):
                                    continue
                                d = self.plotter.drawArc(
                                    d, cx, cy, r, start_deg, end_deg,
                                    pen_width,
                                    fill
                                )

                            elif shape == "P":

                                # its a polygon
                                # P 2 2 1 10 -150 -175 -25 -175 f

                                vertices_count = current_instruction[1]
                                pen_width = current_instruction[4]

                                part = current_instruction[2]
                                dmg = current_instruction[3]

                                if dmg == "2":
                                    self.IS_DMG_2_PRESENT = True

                                if pen_width == "0":
                                    pen_width = self.DEFAULT_PEN_WIDTH

                                if not self.match_part_dmg(part, dmg):
                                    continue

                                fill = current_instruction[
                                    len(current_instruction) - 1
                                ]

                                vertices_list = []
                                for j in range(5,
                                               len(current_instruction) - 1,
                                               2):
                                    point = (
                                        current_instruction[j],
                                        current_instruction[j + 1],
                                    )
                                    vertices_list.append(point)

                                d = self.plotter.drawPolygon(
                                    d, vertices_count, pen_width,
                                    vertices_list, fill
                                )

                            elif shape == "T":
                                # its a text
                                pass

                            else:
                                pass
                            # check if user inputed path exists or not

                            if not os.path.exists(output_path):
                                try:
                                    os.mkdir(output_path)
                                except OSError as error:
                                    print(error)

                            # create a folder with the name of the input
                            # file if not already exist.
                            save_path = f"{output_path}/{folder_name}"
                            if not os.path.exists(save_path):
                                try:
                                    os.mkdir(save_path)
                                except OSError as error:
                                    print(error)

                            svg_boundary = self.plotter.get_svg_boundary()
                            top = svg_boundary["top"]
                            right = svg_boundary["right"]
                            bottom = svg_boundary["bottom"]
                            left = svg_boundary["left"]

                            height = abs(top - bottom)
                            width = abs(left - right)
                            my_height = height
                            if width <= 0:
                                width = 400
                            my_width = width

                        if(run == 1):
                            self.save_svg(d,
                                          f"{symbol_prefix}" +
                                          f"-{name_of_symbol}-{dm}-" +
                                          f"{chr(64+z)}",
                                          save_path, pin_number_positions,
                                          (width, height))
                            # reset svg_boundary set all paramerers to 0
                            self.plotter.reset_svg_boundary()
                            cmp_data = {}
                            for co in range(0, len(dcm_data)):
                                comp = dcm_data[co]
                                if(name_of_symbol == comp["name"]):
                                    cmp_data["name"] = comp["name"]
                                    cmp_data["full_name"] = (f"{symbol_prefix}-" # noqa
                                                            +
                                                            f"{name_of_symbol}"
                                                            f"-{dm}-" +
                                                            f"{chr(64+z)}")
                                    cmp_data["keyword"] = comp["K"]
                                    cmp_data["description"] = comp["D"]
                                    cmp_data["data_link"] = comp["F"]
                                    cmp_data["symbol_prefix"] = symbol_prefix
                                    cmp_data["dmg"] = dm
                                    cmp_data["part"] = chr(64+z)
                                    component_data[cmp_data["full_name"]] = cmp_data # noqa
        # print(component_data)
        return component_data


def generate_svg_and_save_to_folder(input_file, output_folder):
    svg_gen = SvgGenerator()
    return svg_gen.generate_svg_from_lib(input_file, output_folder)


if __name__ == "__main__":
    # Takes Libraries as command line arguments,
    # Only if script is run on command line
    if(len(sys.argv)) != 3:
        print("Usage: script.py <Path to library> <Output Directory>")
        sys.exit(1)
    generate_svg_and_save_to_folder(sys.argv[1], sys.argv[2])
    print('Processed', sys.argv[1])
