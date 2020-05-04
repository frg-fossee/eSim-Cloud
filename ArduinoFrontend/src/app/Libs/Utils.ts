import { Buzzer } from './Buzzer';
import { Battery9v } from './Battery';
import { PushButton } from './PushButton';
import { ArduinoUno } from './Arduino';
import { LED } from './Led';
import { UltrasonicSensor } from './UltrasonicSensor';
import { PIRSensor } from './PIRSensor';

export class Utils {
  static componentBox = {
    input: [
      ['PushButton', 'UltrasonicSensor', 'PIRSensor']// Row
    ],
    power: [
      ['Battery9v'] // Row
    ],
    controllers: [
      ['ArduinoUno'] // Row
    ],
    output: [
      ['Buzzer', 'LED'], // Row
    ]
  };

  static components = {
    PIRSensor: {
      name: 'PIR Sensor',
      image: './assets/images/components/PIRSensor.png',
      className: PIRSensor
    },
    UltrasonicSensor: {
      name: 'Ultrasonic Distance Sensor',
      image: './assets/images/components/UltrasonicSensor.png',
      className: UltrasonicSensor
    },
    LED: {
      name: 'LED',
      image: './assets/images/components/led.png',
      className: LED
    },
    ArduinoUno: {
      name: 'Arduino UNO',
      image: './assets/images/components/ArduinoUno.png',
      className: ArduinoUno
    },
    PushButton: {
      name: 'Push Button',
      image: './assets/images/components/PushButton.png',
      className: PushButton
    },
    Battery9v: {
      name: '9v Battery',
      image: './assets/images/components/Battery9v.png',
      className: Battery9v
    },
    Buzzer: {
      name: 'Buzzer',
      image: './assets/images/components/Buzzer.png',
      className: Buzzer
    }
  };
}
