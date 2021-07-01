/**
 * Class for adding a Slider during simulation.
 * Used by temperature sensor and photo resistor
 */
export class Slider {
  /**
   * Value Of the Slider
   */
  value = 0;
  /**
   * Value Change Listener
   */
  private listener: (value: number) => void;
  /**
   * The Circle which slides around the bar
   */
  control: any;
  /**
   * Minimum X Value
   */
  minx: number;
  /**
   * Maximum X Value
   */
  maxx: number;
  /**
   * The Rectaungular path wehre control slides
   */
  rect: any;
  /**
   * Constructor For adding a Slider
   * @param canvas Raphael Paper
   * @param x The X position of Slider
   * @param y The Y Position Of Slide
   */
  constructor(public canvas: any, public x: number, public y: number) {
    // Draw the slider
    this.rect = this.canvas.rect(this.x - 60, this.y - 40, 120, 20, 15);
    this.minx = this.x - 60 + 6;
    this.maxx = this.x + 60 - 6;
    // Draw the control knob
    this.control = this.canvas.circle(this.x, this.y - 30, 12)
      .attr({
        fill: '#000'
      });

    let tmp;
    // On Dragging knob
    this.control.drag((dx, _) => {
      // Change only in x direction
      const cx = Math.min(Math.max(tmp.cx + dx, this.minx), this.maxx);
      this.control.attr({
        cx
      });
      // Calculate value and call the listener
      this.value = (cx - this.minx) / (this.maxx - this.minx);
      if (this.listener) {
        this.listener(this.value);
      }
    }, () => {
      tmp = this.control.attr();
    }, () => {
    });
  }
  /**
   * Set Gradient to the slider
   * @param start Start Hex Color
   * @param end End Hex Color
   */
  setGradient(start: string, end: string) {
    this.rect.attr({
      fill: `0-${start}-${end}`
    });
  }
  /**
   * Set value change Listener
   * @param listener Value Change Listener
   */
  setValueChangeListener(listener: (value: number) => void) {
    this.listener = listener;
  }
  /**
   * Hide Slider
   */
  hide() {
    this.control.hide();
    this.rect.hide();
  }
  /**
   * Show Slider
   */
  show() {
    this.control.show();
    this.rect.show();
  }
  /**
   * Remove Slider From Dom
   */
  remove() {
    this.control.remove();
    this.rect.remove();
    this.control = null;
    this.rect = null;
  }
}
