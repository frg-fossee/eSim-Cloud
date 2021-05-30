import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';
import { ArduinoUno } from './Arduino';

/**
 * MotorDriver L298N class
 */
export class L293D extends CircuitElement {
  /**
   * Pin Name mapped to Pins
   */
  pinNamedMap: any = {};
  /**
   * Speed of Motor A in range of 0 to 5.
   */
  speedA = 5;
  /**
   * Speed of Motor B in range of 0 to 5
   */
  speedB = 5;
  /**
   * Previous values of the pins.
   */
  prevValues: any = {
    IN1: -1,
    IN2: -1,
    IN3: -1,
    IN4: -1
  };

  /**
   * MotorDriver L298N constructor
   * @param canvas Raphael Canvas (Paper)
   * @param x  position x
   * @param y  position y
   */
  constructor(public canvas: any, x: number, y: number) {
    super('L293D', x, y, 'L293D.json', canvas);
  }
  /**
   * Initialize motor class.
   */
  init() {
    for (const node of this.nodes) {
      this.pinNamedMap[node.label] = node;
    }
    this.pinNamedMap['VS'].addValueListener(v => {
      this.pinNamedMap['GND'].setValue(v, this.pinNamedMap['GND']);
      if (v >= 5) {
        this.pinNamedMap['NSS'].setValue(5, this.pinNamedMap['NSS']);
      }
      this.update();
    });

    this.pinNamedMap['IN1'].addValueListener(v => {
      if (v !== this.prevValues.IN1) {
        this.prevValues.IN1 = v;
        this.update();
      }
    });
    this.pinNamedMap['IN2'].addValueListener(v => {
      if (v !== this.prevValues.IN2) {
        this.prevValues.IN2 = v;
        this.update();
      }
    });
    this.pinNamedMap['IN3'].addValueListener(v => {
      if (v !== this.prevValues.IN3) {
        this.prevValues.IN3 = v;
        this.update();
      }
    });
    this.pinNamedMap['IN4'].addValueListener(v => {
      if (v !== this.prevValues.IN4) {
        this.prevValues.IN4 = v;
        this.update();
      }
    });
  }
  /**
   * Simulation Logic For L298N motor driver
   */
  update() {
    setTimeout(() => {
      if (this.pinNamedMap['IN1'].value > 0 && this.pinNamedMap['IN2'].value > 0) {
        window['showToast']('Both IN1 and IN2 Pins are High!');
        return;
      }

      if (this.pinNamedMap['IN3'].value > 0 && this.pinNamedMap['IN4'].value > 0) {
        window['showToast']('Both IN3 and IN4 Pins are High!');
        return;
      }
    }, 100);

    if (this.pinNamedMap['IN1'].value > 0) {
      this.pinNamedMap['OUT2'].setValue(
        this.pinNamedMap['VS'].value * (this.speedA / 5),
        this.pinNamedMap['OUT2']
      );
    } else if (this.pinNamedMap['IN2'].value > 0) {
      this.pinNamedMap['OUT1'].setValue(
        this.pinNamedMap['VS'].value * (this.speedA / 5),
        this.pinNamedMap['OUT1']
      );
    } else {
      this.pinNamedMap['OUT1'].setValue(
        0,
        this.pinNamedMap['OUT1']
      );
    }

    if (this.pinNamedMap['IN3'].value > 0) {
      this.pinNamedMap['OUT4'].setValue(
        this.pinNamedMap['VS'].value * (this.speedB / 5),
        this.pinNamedMap['OUT4']
      );
    } else if (this.pinNamedMap['IN4'].value > 0) {
      this.pinNamedMap['OUT3'].setValue(
        this.pinNamedMap['VS'].value * (this.speedB / 5),
        this.pinNamedMap['OUT3']
      );
    } else {
      this.pinNamedMap['OUT3'].setValue(
        0,
        this.pinNamedMap['OUT3']
      );
    }
  }
  /**
   * Function provides component details
   * @param keyName Unique Class name
   * @param id Component id
   * @param body body of property box
   * @param title Component title
   */
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    body.innerText = 'If you Don\'t Connect The EN1 and EN2 Pins it automatically connects to the 5V suppy';
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor Driver (L293D)'
    };
  }
  /**
   * Return the node which is connected to arduino
   * @param node The Node which need to be checked
   */
  private getArduino(node: Point) {
    if (
      node.connectedTo &&
      node.connectedTo.start &&
      node.connectedTo.start.parent.keyName === 'ArduinoUno'
    ) {
      return node.connectedTo.start;
    }
    if (
      node.connectedTo &&
      node.connectedTo.end &&
      node.connectedTo.end.parent.keyName === 'ArduinoUno'
    ) {
      return node.connectedTo.end;
    }
    return null;
  }
  /**
   * Called on Start Simulation
   */
  initSimulation(): void {
    const arduinoEnd: any = this.getArduino(this.pinNamedMap['EN1']);
    if (arduinoEnd) {
      const arduino = arduinoEnd.parent;
      (arduino as ArduinoUno).addPWM(arduinoEnd, (v, p) => {
        this.speedA = v / 100;
        this.update();
      });
    }

    const arduinoEnd1: any = this.getArduino(this.pinNamedMap['EN2']);
    if (arduinoEnd1) {
      const arduino = arduinoEnd1.parent;
      (arduino as ArduinoUno).addPWM(arduinoEnd1, (v, p) => {
        this.speedB = v / 100;
        this.update();
      });
    }

  }
  /**
   * Called on Stop Simulation
   */
  closeSimulation(): void {
    this.pinNamedMap['IN1'].value = -1;
    this.pinNamedMap['IN2'].value = -1;
    this.pinNamedMap['IN3'].value = -1;
    this.pinNamedMap['IN4'].value = -1;
    this.speedA = 5;
    this.speedB = 5;
    this.prevValues = {
      IN1: -1,
      IN2: -1,
      IN3: -1,
      IN4: -1
    };
  }
}

