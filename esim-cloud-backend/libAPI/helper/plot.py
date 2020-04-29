import drawSvg as draw

def drawCircle(d,x,y,r,fill="red",pen=2,stroke="black"):

    if(fill == 'f'):
        kwargs = {"fill_opacity" : 0.3}
    elif(fill == 'F'):
        kwargs = {'fill':stroke}
    else:
        kwargs = {}
    d.append(draw.Circle(x, y, r,
             stroke_width=pen, stroke='red',**kwargs))

    return d


def drawRec(d,x1,y1,x2,y2,fill="f",pen='5',stroke='black'):

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
                        stroke_width=pen, stroke='red',
                        **kwargs))

    return d