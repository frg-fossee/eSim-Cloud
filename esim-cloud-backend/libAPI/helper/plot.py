import drawSvg as draw


STROKE_COLOR = "black"

def drawCircle(d,x,y,r,fill="red",pen=2,stroke=STROKE_COLOR):

    if(fill == 'f'):
        kwargs = {"fill_opacity" : 0.3}
    elif(fill == 'F'):
        kwargs = {'fill':stroke}
    else:
        kwargs = {}
    d.append(draw.Circle(x, y, r,
             stroke_width=pen, stroke=STROKE_COLOR,**kwargs))

    return d


def drawRec(d,x1,y1,x2,y2,fill="f",pen='5',stroke=STROKE_COLOR):

    # 'f'->filled shape in background color
    # 'F' -> filled shape in pen color
    # 'N' -> unfilled shape
    #pen->stroke_width

    x1 = int(x1)
    y1 = int(y1)
    x2 = int(x2)
    y2 = int(y2)
    if(fill == 'f'):
        kwargs = {"fill_opacity" : 0.3}
    elif(fill == 'F'):
        kwargs = {'fill':stroke}
    else:
        kwargs = {}
    d.append(draw.Lines(x1,y1,x2,y1,x2,y2,x1,y2,x1,y1,
                        stroke_width=pen, stroke=STROKE_COLOR,
                        **kwargs))

    return d

# A X Y radius start end part dmg pen fill Xstart Ystart Xend Yend
def drawArc():
    pass

# P count part dmg pen X Y ... fill
def drawPolygon(d,vertices_count,pen=5,vertices_list = [],fill='f'):
    
    pen = int(pen)
    
    for i in range(1,len(vertices_list)):
        point_1 = vertices_list[i]
        point_2 = vertices_list[i-1]

        x1 = int(point_1[0])
        y1 = int(point_1[1])
        x2 = int(point_2[0])
        y2 = int(point_2[1])
        d.append(draw.Line(x1,y1,x2,y2,stroke=STROKE_COLOR, stroke_width=pen))
    
    if fill == 'f':
        # join the last vertex and the first vertex
        point_1 = vertices_list[len(vertices_list)-1]
        point_2 = vertices_list[0]

        x1 = int(point_1[0])
        y1 = int(point_1[1])
        x2 = int(point_2[0])
        y2 = int(point_2[1])
     
        d.append(draw.Line(x1,y1,x2,y2,stroke=STROKE_COLOR, stroke_width=pen))
     
    return d
        
    

def drawPin(d,pinName,pinNumber,x1,y1,pin_name_offset,length=0,orientation='R',stroke=STROKE_COLOR,pen=5):

    x1 = int(x1)
    y1 = int(y1)
    text_size = 50
    length = int(length)
    pin_name_offset=int(pin_name_offset)
    if(orientation=="R"):
        x2 = x1+length
        y2 = y1

        #to position pin number properly 
        x = x1 + (length/2)
        y = y1 + 30
        # x = x1
        if pinName != "~":
            d.append(draw.Text(pinName,text_size,x1+length+pin_name_offset,y1,center=0.6,fill='black'))
        d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill='black'))
    elif(orientation=="L"):
        x2 = x1-length
        y2 = y1

        #to position pin number properly 
        x = x1 - (length/2)
        y = y1 + 30
        # x = x1

        d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill='black'))
        if pinName != "~":
            d.append(draw.Text(pinName,text_size,x1-length-pin_name_offset,y1,center=0.6,fill='black'))
    elif(orientation=="U"):
        x2 = x1
        y2 = y1 + length

        #to position pin number properly 
        x = x1 - 40
        y = y1 + (length/2)
        # y = y1
        d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill='black'))
        if pinName != "~":
            d.append(draw.Text(pinName,text_size,x1,y1+length+pin_name_offset,center=0.6,fill='black'))

    else:
        x2 = x1
        y2 = y1 - length
        # y2 = y1
        #to position pin number properly 
        x = x1 - 40
        y = y1 - (length/2)
        d.append(draw.Text(pinNumber,text_size, x,y, center=0.6, fill='black'))
        if pinName != "~":
            d.append(draw.Text(pinName,text_size,x1,y1-length-pin_name_offset,center=0.6,fill='black'))

    d.append(draw.Line(x1,y1,x2,y2,stroke=stroke, stroke_width=pen))
    
    

    return d