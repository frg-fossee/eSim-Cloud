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
