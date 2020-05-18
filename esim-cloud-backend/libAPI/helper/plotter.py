import drawSvg as draw


class SvgPlotter:
    svg_boundary = {
                        "top": 0,
                        "right": 0,
                        "bottom": 0,
                        "left": 0,
                    }

    def __init__(self):
        self.STROKE_COLOR = "black"
        self.PIN_NAME_COLOR = "black"
        self.PIN_NUMBER_COLOR = "black"
        self.PIN_NUMBER_OFFSET = 40
        self.RADIUS_OF_NOT_GATE = 25
        self.FILL_NOT_GATE = "F"

    # def update_svg_boundary(self,value,axis):
    #     # axis can be 'x' or 'y'
    #     if axis == 'x':
    #         # update along x axis
    #         if(value > 0):
    #             # right side
    #             # check if passed value is greater than
    #             # current value
    #             if(value > self.svg_boundary["right"]):
    #                 self.svg_boundary["right"] = value
    #         else:
    #             # left side
    #             # check if passed values is smaller
    #             # than the current value
    #             if(value < self.svg_boundary["left"]):
    #                 self.svg_boundary["left"] = value

    #     if axis == 'y':
    #         # update along y axis
    #         if(value > 0):
    #             # top side
    #             # check if passed value is greater than
    #             # current value
    #             if(value > self.svg_boundary["top"]):
    #                 self.svg_boundary["top"] = value
    #         else:
    #             # bottom side
    #             if(value < self.svg_boundary["bottom"]):
    #                 self.svg_boundary["bottom"] = value

    def update_svg_boundary(self, vertex_list):
        for point in range(len(vertex_list)):
            x_value = int(vertex_list[point][0])
            y_value = int(vertex_list[point][1])

            if(x_value > 0):
                # right side
                # check if passed value is greater than
                # current value
                if(x_value > self.svg_boundary["right"]):
                    self.svg_boundary["right"] = x_value
            else:
                # left side
                # check if passed values is smaller
                # than the current value
                if(x_value < self.svg_boundary["left"]):
                    self.svg_boundary["left"] = x_value

            if(y_value > 0):
                # top side
                # check if passed value is greater than
                # current value
                if(y_value > self.svg_boundary["top"]):
                    self.svg_boundary["top"] = y_value
            else:
                # bottom side
                if(y_value < self.svg_boundary["bottom"]):
                    self.svg_boundary["bottom"] = y_value

    def get_svg_boundary(self,):

        return self.svg_boundary

    def reset_svg_boundary(self,):
        self.svg_boundary = {
                        "top": 0,
                        "right": 0,
                        "bottom": 0,
                        "left": 0,
                    }

    """pen-parameter is the thickness of the pen,when
    zero the default pen width is used.
    The fill parameter is “f” for a filled shape in the
    background colour, “F” for a filled shape in
    the pen colour, or “N” for an unfilled shape.
    """

    def draw_text(self, d, text, x, y, text_size, fill="black"):
        x = int(x)
        y = int(y)
        text_size = int(text_size)
        text = text.strip('"')
        d.append(draw.Text(text, text_size, x, y, center=0.6))
        return d

    def normalize_angle(self, angle):
        return 360 + angle

    def drawCircle(self, d, x, y, r, fill="f", pen=5):


        pen = int(pen)
        if fill == "f":
            kwargs = {"fill_opacity": 0}
        elif fill == "F":
            kwargs = {"fill": self.STROKE_COLOR}
        else:
            kwargs = {"fill_opacity": 0}

        d.append(
            draw.Circle(x, y, r, stroke_width=pen,
                        stroke=self.STROKE_COLOR,
                        **kwargs)
        )

        x = int(x)
        y = int(y)
        r = int(r)
        

        v_list = [(x, y+r),  (x, y-r), (x + r, y), (x - r, y)]

        self.update_svg_boundary(v_list)

        return d

    def drawRec(self, d, x1, y1, x2, y2, fill="f", pen=5,
                ):

        # 'f'->filled shape in background color
        # 'F' -> filled shape in pen color
        # 'N' -> unfilled shape
        # pen->stroke_width
        pen = int(pen)
        x1 = int(x1)
        y1 = int(y1)
        x2 = int(x2)
        y2 = int(y2)

        # self.update_svg_boundary(x1,'x')
        # self.update_svg_boundary(y1,'y')

        # self.update_svg_boundary(x2,'x')
        # self.update_svg_boundary(y2,'y')

        if fill == "f":
            kwargs = {"fill_opacity": 0}
        elif fill == "F":
            kwargs = {"fill": self.STROKE_COLOR}
        else:
            kwargs = {"fill_opacity": 0}
        d.append(
            draw.Lines(
                x1,
                y1,
                x2,
                y1,
                x2,
                y2,
                x1,
                y2,
                x1,
                y1,
                stroke_width=pen,
                stroke=self.STROKE_COLOR,
                **kwargs
            )
        )
        self.update_svg_boundary([(x1, y1), (x2, y2)])

        return d

    # A X Y radius start end part dmg pen fill Xstart Ystart Xend Yend
    def drawArc(self, d, cx, cy, r, start_deg, end_deg, pen=5, fill="f",
                ):

        cx = int(cx)
        cy = int(cy)
        r = int(r)
        pen = int(pen)
        start_deg = int(start_deg) * 0.1
        end_deg = int(end_deg) * 0.1

        if start_deg < 0:
            start_deg = self.normalize_angle(start_deg)

        if end_deg < 0:
            end_deg = self.normalize_angle(end_deg)

        if start_deg > end_deg:
            # swap
            temp = start_deg
            start_deg = end_deg
            end_deg = temp

        difference = end_deg - start_deg
        cw = False

        if abs(difference) > 180:

            cw = True

        if fill == "f":
            kwargs = {"fill_opacity": 0}
        elif fill == "F":
            kwargs = {"fill": self.STROKE_COLOR}
        else:
            kwargs = {"fill_opacity": 0}

        d.append(
            draw.Arc(
                cx,
                cy,
                r,
                start_deg,
                end_deg,
                cw=cw,
                stroke=self.STROKE_COLOR,
                stroke_width=pen,
                **kwargs
            )
        )
        return d

    # P count part dmg pen X Y ... fill
    def drawPolygon(self, d, vertices_count, pen=5,
                    vertices_list=[], fill="f", ):

        # if(fill == 'f'):
        #     kwargs = {"fill_opacity" : 0.3}
        # elif(fill == 'F'):
        #     kwargs = {'fill':self.STROKE_COLOR }
        # else:
        #     kwargs = {"fill_opacity" : 0}

        pen = int(pen)

        for i in range(1, len(vertices_list)):
            point_1 = vertices_list[i]
            point_2 = vertices_list[i - 1]

            x1 = int(point_1[0])
            y1 = int(point_1[1])
            x2 = int(point_2[0])
            y2 = int(point_2[1])

            # d.append(draw.Line(x1,y1,x2,y2,stroke=self.STROKE_COLOR , stroke_width=pen,**kwargs))# noqa
            d.append(
                draw.Line(x1, y1, x2, y2, stroke=self.STROKE_COLOR,
                          stroke_width=pen)
            )

            self.update_svg_boundary(vertices_list)

        return d

    def draw_pin_shape(self, d, x, y, pin_orientation, shape_of_pin):

        # inverted pin draw a circle of radius 10 at the end of the pin.

        if shape_of_pin == "I":

            d = self.drawCircle(
                d, x, y, self.RADIUS_OF_NOT_GATE, fill=self.FILL_NOT_GATE
            )

        return d

    def drawPin(
        self,
        d,
        pinName,
        pinNumber,
        x1,
        y1,
        pin_name_offset,
        length=0,
        orientation="R",
        pen=5,
        text_size=50,
        shape_of_pin="",
    ):

        # C 55 0 10 1 0 6 N ->invertec pin circle shape example.
        x1 = int(x1)
        y1 = int(y1)
        text_size = int(text_size)
        length = int(length)
        pin_name_offset = int(pin_name_offset)
        pen = int(pen)

        v_list = [(x1, y1)]
        self.update_svg_boundary(v_list)

        if orientation == "R":

            x2 = x1 + length
            y2 = y1

            # draw pin shape
            # subtracted 12 just to make the pin look better
            shape_x = x2 - self.RADIUS_OF_NOT_GATE
            shape_y = y2

            # to position pin number properly
            x = x1 + (length / 2)
            y = y1 + self.PIN_NUMBER_OFFSET
            # x = x1
            d.append(
                draw.Text(
                    pinNumber, text_size/2, x, y, center=0.6,
                    fill=self.PIN_NUMBER_COLOR
                )
            )
            d = self.draw_pin_shape(d, shape_x, shape_y, orientation,
                                    shape_of_pin)
            if pinName != "~":
                d = self.draw_text(
                    d,
                    pinName,
                    x1 + length + pin_name_offset,
                    y1,
                    text_size,
                    fill=self.PIN_NAME_COLOR,
                )

                # d.append(draw.Text(pinName,text_size,x1+length+pin_name_offset,y1,center=0.6,fill=self.PIN_NAME_COLOR))

        elif orientation == "L":
            x2 = x1 - length
            y2 = y1

            # draw pin shape
            # added 12 just to make the pin look better
            shape_x = x2 + self.RADIUS_OF_NOT_GATE
            shape_y = y2

            # to position pin number properly
            x = x1 - (length / 2)
            # y = y1 + 30
            y = y1 + self.PIN_NUMBER_OFFSET
            # x = x1

            d.append(
                draw.Text(
                    pinNumber, text_size/2, x, y, center=0.6,
                    fill=self.PIN_NUMBER_COLOR
                )
            )
            d = self.draw_pin_shape(d, shape_x, shape_y, orientation,
                                    shape_of_pin)

            if pinName != "~":
                d = self.draw_text(
                    d,
                    pinName,
                    x1 - length - pin_name_offset,
                    y1,
                    text_size,
                    fill=self.PIN_NAME_COLOR,
                )

                # d.append(draw.Text(pinName,text_size,x1-length-pin_name_offset,y1,center=0.6,fill=self.PIN_NAME_COLOR))

        elif orientation == "U":
            x2 = x1
            y2 = y1 + length

            # draw pin shape

            # draw pin shape
            # subtracted 12 just to make the pin look better
            shape_x = x2
            shape_y = y2 - self.RADIUS_OF_NOT_GATE
            d = self.draw_pin_shape(d, shape_x, shape_y, orientation,
                                    shape_of_pin)

            # to position pin number properly
            x = x1 - 40
            x = x1 - self.PIN_NUMBER_OFFSET
            y = y2 - (length / 3)
            # y = y1
            d.append(
                draw.Text(
                    pinNumber, text_size/2, x, y, center=0.6,
                    fill=self.PIN_NUMBER_COLOR
                )
            )
            d = self.draw_pin_shape(d, x2, y2, orientation, shape_of_pin)

            if pinName != "~":
                d = self.draw_text(
                    d,
                    pinName,
                    x1,
                    y1 + length + pin_name_offset,
                    text_size,
                    fill=self.PIN_NAME_COLOR,
                )
                # d.append(draw.Text(pinName,text_size,x1,y1+length+pin_name_offset,center=0.6,fill=self.PIN_NAME_COLOR))

        else:
            x2 = x1
            y2 = y1 - length

            # draw pin shape
            # d = self.draw_pin_shape(d, x2, y2, orientation, shape_of_pin)

            # draw pin shape
            # subtracted 12 just to make the pin look better
            shape_x = x2
            shape_y = y2 + self.RADIUS_OF_NOT_GATE

            # y2 = y1
            # to position pin number properly
            # x = x1 - 40
            x = x1 - self.PIN_NUMBER_OFFSET
            y = y2 + (length / 3)
            d.append(
                draw.Text(
                    pinNumber, text_size/2, x, y, center=0.6,
                    fill=self.PIN_NUMBER_COLOR
                )
            )
            d = self.draw_pin_shape(d, shape_x, shape_y, orientation,
                                    shape_of_pin)

            if pinName != "~":
                d = self.draw_text(
                    d,
                    pinName,
                    x1,
                    y1 - length - pin_name_offset,
                    text_size,
                    fill=self.PIN_NAME_COLOR,
                )
                # d.append(draw.Text(pinName,text_size,x1,y1-length-pin_name_offset,center=0.6,fill=self.PIN_NAME_COLOR))

        d.append(draw.Line(x1, y1, x2, y2, stroke=self.STROKE_COLOR,
                 stroke_width=pen))

        return d
