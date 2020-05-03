import drawSvg as draw




class SvgPlotter():


    def __init__(self):
        self.STROKE_COLOR  = 'black'
        self.PIN_NAME_COLOR = 'black'
        self.PIN_NUMBER_COLOR = 'black'
        self.PIN_NUMBER_OFFSET = 40

    # self.STROKE_COLOR  = "black"
    # self.PIN_NAME_COLOR = "black"
    # self.PIN_NUMBER_COLOR = "black"

    # self.PIN_NUMBER_OFFSET = 40


    '''pen-parameter is the thickness of the pen,when
    zero the default pen width is used.
    The fill parameter is “f” for a filled shape in the 
    background colour, “F” for a filled shape in
    the pen colour, or “N” for an unfilled shape.
    '''


    def normalize_angle(self,angle):
        return 360 + angle



    def drawCircle(self,d,x,y,r,fill="red",pen=5):

        pen = int(pen)

        if(fill == 'f'):
            kwargs = {"fill_opacity" : 0}
        elif(fill == 'F'):
            kwargs = {'fill':self.STROKE_COLOR }
        else:
            kwargs = {"fill_opacity" : 0}
        d.append(draw.Circle(x, y, r,
                stroke_width=pen, stroke=self.STROKE_COLOR ,**kwargs))

        return d


    def drawRec(self,d,x1,y1,x2,y2,fill="f",pen=5):

        # 'f'->filled shape in background color
        # 'F' -> filled shape in pen color
        # 'N' -> unfilled shape
        #pen->stroke_width
        pen = int(pen)
        x1 = int(x1)
        y1 = int(y1)
        x2 = int(x2)
        y2 = int(y2)
        if(fill == 'f'):
            kwargs = {"fill_opacity" : 0}
        elif(fill == 'F'):
            kwargs = {'fill':self.STROKE_COLOR }
        else:
            kwargs = {"fill_opacity" : 0}
        d.append(draw.Lines(x1,y1,x2,y1,x2,y2,x1,y2,x1,y1,
                            stroke_width=pen, stroke=self.STROKE_COLOR ,
                            **kwargs))

        return d

    # A X Y radius start end part dmg pen fill Xstart Ystart Xend Yend
    def drawArc(self,d,cx,cy,r,start_deg,end_deg,pen = 5,fill='f'):

        cx = int(cx)
        cy = int(cy)
        r = int(r)
        pen = int(pen)
        start_deg   = int(start_deg) * 0.1 
        end_deg     = int(end_deg) * 0.1

        if start_deg < 0:
            start_deg = self.normalize_angle(start_deg)

        if end_deg < 0:
            end_deg = self.normalize_angle(end_deg)

        if(start_deg > end_deg):
            # swap
            temp = start_deg
            start_deg = end_deg
            end_deg = temp
        
        difference = end_deg - start_deg
        cw = False

        if(abs(difference) > 180):
            
            cw = True

        if(fill == 'f'):
            kwargs = {"fill_opacity" : 0}
        elif(fill == 'F'):
            kwargs = {'fill':self.STROKE_COLOR }
        else:
            kwargs = {"fill_opacity" : 0}

        d.append(draw.Arc(cx,cy,r,start_deg,end_deg,cw=cw,
                stroke=self.STROKE_COLOR , stroke_width=pen,**kwargs))
        return d

    # P count part dmg pen X Y ... fill
    def drawPolygon(self,d,vertices_count,pen=5,vertices_list = [],fill='f'):
        
        
        # if(fill == 'f'):
        #     kwargs = {"fill_opacity" : 0}
        # elif(fill == 'F'):
        #     kwargs = {'fill':self.STROKE_COLOR }
        # else:
        #     kwargs = {"fill_opacity" : 0}
        
        pen = int(pen)

        for i in range(1,len(vertices_list)):
            point_1 = vertices_list[i]
            point_2 = vertices_list[i-1]

            x1 = int(point_1[0])
            y1 = int(point_1[1])
            x2 = int(point_2[0])
            y2 = int(point_2[1])

            
            # d.append(draw.Line(x1,y1,x2,y2,stroke=self.STROKE_COLOR , stroke_width=pen,**kwargs))
            d.append(draw.Line(x1,y1,x2,y2,stroke=self.STROKE_COLOR , stroke_width=pen))
        # if fill == 'f':
        #     # a filled polygon is implicitly closed.
        #     # join the last vertex and the first vertex
        #     point_1 = vertices_list[len(vertices_list)-1]
        #     point_2 = vertices_list[0]

        #     x1 = int(point_1[0])
        #     y1 = int(point_1[1])
        #     x2 = int(point_2[0])
        #     y2 = int(point_2[1])
        
        #     d.append(draw.Line(x1,y1,x2,y2,stroke=self.STROKE_COLOR , stroke_width=pen,**kwargs))


        
        return d
            
        

    def drawPin(self,d,pinName,pinNumber,x1,y1,pin_name_offset,length=0,orientation='R',pen=5,text_size=50):

        x1 = int(x1)
        y1 = int(y1)
        text_size = int(text_size)
        length = int(length)
        pin_name_offset=int(pin_name_offset)
        pen = int(pen)
        if(orientation=="R"):
            x2 = x1+length
            y2 = y1

            #to position pin number properly 
            x = x1 + (length/2)
            y = y1 + self.PIN_NUMBER_OFFSET
            # x = x1
            d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill=self.PIN_NUMBER_COLOR))
            if pinName != "~":
                d.append(draw.Text(pinName,text_size,x1+length+pin_name_offset,y1,center=0.6,fill=self.PIN_NAME_COLOR))

        elif(orientation=="L"):
            x2 = x1-length
            y2 = y1

            #to position pin number properly 
            x = x1 - (length/2)
            # y = y1 + 30
            y = y1 + self.PIN_NUMBER_OFFSET
            # x = x1

            d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill=self.PIN_NUMBER_COLOR))
            if pinName != "~":
                d.append(draw.Text(pinName,text_size,x1-length-pin_name_offset,y1,center=0.6,fill=self.PIN_NAME_COLOR))

        elif(orientation=="U"):
            x2 = x1
            y2 = y1 + length

            #to position pin number properly 
            x = x1 - 40
            x = x1 - self.PIN_NUMBER_OFFSET
            y = y1 + (length/2)
            # y = y1
            d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill=self.PIN_NUMBER_COLOR))
            if pinName != "~":
                d.append(draw.Text(pinName,text_size,x1,y1+length+pin_name_offset,center=0.6,fill=self.PIN_NAME_COLOR))

        else:
            x2 = x1
            y2 = y1 - length
            # y2 = y1
            #to position pin number properly 
            # x = x1 - 40
            x = x1 - self.PIN_NUMBER_OFFSET
            y = y1 - (length/2)
            d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill=self.PIN_NUMBER_COLOR))
            if pinName != "~":
                d.append(draw.Text(pinName,text_size,x1,y1-length-pin_name_offset,center=0.6,fill=self.PIN_NAME_COLOR))

        d.append(draw.Line(x1,y1,x2,y2,stroke=self.STROKE_COLOR , stroke_width=pen))
        
        

        return d