import { Buzzer } from './Buzzer';
import { Battery9v, CoinCell } from './Battery';
import { PushButton, SlideSwitch } from './inputs/Buttons';
import { ArduinoUno } from './Arduino';
import { LED } from './Led';
import { UltrasonicSensor } from './inputs/UltrasonicSensor';
import { PIRSensor } from './inputs/PIRSensor';
import { Motor, L298N } from './Motors';
import { LCD16X2 } from './Display';
import { Label } from './Miscellaneous';
import { PhotoResistor } from './inputs/PhotoResistor';
import { LM35 } from './inputs/TemperatureSensors';
import { Potentiometer } from './inputs/Potentiometer';
export class Utils {
  static componentBox = {
    input: [
      ['PushButton', 'UltrasonicSensor', 'PIRSensor'], // Row
      ['SlideSwitch', 'PhotoResistor', 'LM35'],
      ['PotentioMeter']
    ],
    power: [
      ['Battery9v', 'CoinCell'] // Row
    ],
    controllers: [
      ['ArduinoUno'] // Row
    ],
    output: [
      ['Buzzer', 'LED', 'Motor'], // Row
      ['LCD16X2']
    ],
    drivers: [
      ['L298N']
    ],
    misc: [
      ['Label']
    ]
  };

  static components = {
    PotentioMeter: {
      name: 'Potentiometer',
      image: './assets/images/components/Potentiometer.png',
      className: Potentiometer
    },
    LM35: {
      name: 'Temperature Sensor LM35',
      image: './assets/images/components/LM35.svg',
      className: LM35
    },
    PhotoResistor: {
      name: 'Photo Resistor',
      image: './assets/images/components/PhotoResistor.svg',
      className: PhotoResistor
    },
    Label: {
      name: 'Label',
      image: './assets/images/components/Text.png',
      className: Label
    },
    CoinCell: {
      name: 'Coin Cell 3V',
      image: './assets/images/components/CoinCell.svg',
      className: CoinCell
    },
    SlideSwitch: {
      name: 'Slide Switch',
      image: './assets/images/components/SlideSwitch.png',
      className: SlideSwitch
    },
    LCD16X2: {
      name: 'LCD 16x2',
      image: './assets/images/components/LCD16X2.png',
      className: LCD16X2
    },
    L298N: {
      name: 'Motor Driver L298N',
      image: './assets/images/components/L298N.png',
      className: L298N
    },
    Motor: {
      name: 'Motor',
      image: './assets/images/components/Motor.png',
      className: Motor
    },
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
