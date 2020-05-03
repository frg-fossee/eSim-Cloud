import { CircuitElement } from './CircuitElement';
import { Point } from './Point';

export class ArduinoUno extends CircuitElement {
  static pointHalf = 4;
  /// Cordinate of Nodes with respect to the body
  NodesCordinates = [
    [91, 13], [99, 13], [106, 13], [113, 13], [120, 13], [127, 13],
    [135, 13], [142, 13], [154, 13], [161, 13], [168, 13],
    [175, 13], [182, 13], [189, 13], [197, 13], [204, 13],
    [117, 150], [124, 150], [132, 150], [139, 150], [146, 150], [153, 150],
    [168, 150], [175, 150], [182, 150], [189, 150], [196, 150], [204, 150]
  ];
  // Label for each node
  pinLabels: string[] = [
    'AREF', 'GND', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'TX0', 'RX0',
    'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'
  ];
  // on select use this glow details
  glowdetails: any = {
    width: 2,
    color: '#286bad'
  };
  constructor(public canvas: any, x: number, y: number) {
    super('ArduinoUno', x, y);
    this.elements.push(
      this.canvas.image('assets/images/components/ArduinoUno.svg', this.x, this.y, 456, 334)
    );

    for (let i = 0; i < this.NodesCordinates.length; ++i) {
      const cord = this.NodesCordinates[i];
      this.nodes.push(new Point(
        this.canvas,
        this.x + cord[0] * 2,
        this.y + cord[1] * 2,
        this.pinLabels[i],
        ArduinoUno.pointHalf,
        this
      ));
    }

    this.setDragListeners();
    this.setHoverListener();
    this.setClickListener(null);
  }
  save() {
  }
  load(data: any): void {
  }
  getNode(x: number, y: number): Point {
    return null;
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      title: 'Arduino Uno',
      body
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
