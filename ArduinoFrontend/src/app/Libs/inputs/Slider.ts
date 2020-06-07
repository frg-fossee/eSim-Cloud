export class Slider {
  value = 0;
  listener: any;
  control: any;
  minx: number;
  maxx: number;
  minv = 0;
  maxv = 0;
  rect: any;
  constructor(public canvas: any, public x: number, public y: number) {
    this.rect = this.canvas.rect(this.x - 60, this.y - 40, 120, 20, 15);
    this.rect.attr({
      fill: '0-#03b5fc-#fc6203'
    });
    this.minx = this.x - 60 + 6;
    this.maxx = this.x + 60 - 6;
    this.control = this.canvas.circle(this.x, this.y - 30, 12)
      .attr({
        fill: '#000'
      });
    // this.value = (this.x - this.minx) / (this.maxx - this.minx);
    // console.log(this.value);
    let tmp;
    this.control.drag((dx, _) => {
      const cx = Math.min(Math.max(tmp.cx + dx, this.minx), this.maxx);
      this.control.attr({
        cx
      });
      this.value = (cx - this.minx) / (this.maxx - this.minx);
      // console.log(this.value);
      if (this.listener) {
        this.listener(this.value * (this.maxv - this.minv));
      }
    }, () => {
      tmp = this.control.attr();
    }, () => {
      // console.log('end');
    });
  }
  setMinMax(min: number, max: number) {
    this.minv = min;
    this.maxv = max;
  }
  setValueChangeListener(listener: any) {
    this.listener = listener;
  }
  hide() {
    this.control.hide();
    this.rect.hide();
  }
  show() {
    this.control.show();
    this.rect.show();
  }
  remove() {
    this.control.remove();
    this.rect.remove();
  }
}
