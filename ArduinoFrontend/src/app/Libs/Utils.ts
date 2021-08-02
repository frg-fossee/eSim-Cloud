import { Buzzer } from './outputs/Buzzer';
import { Battery9v, CoinCell } from './Battery';
import { PushButton, SlideSwitch } from './inputs/Buttons';
import { ArduinoUno } from './outputs/Arduino';
import { LED, RGBLED } from './outputs/Led';
import { UltrasonicSensor } from './inputs/UltrasonicSensor';
import { PIRSensor } from './inputs/PIRSensor';
import { Motor, L298N, ServoMotor } from './outputs/Motors';
import { LCD16X2, SevenSegment } from './outputs/Display';
import { Label } from './Miscellaneous';
import { PhotoResistor } from './inputs/PhotoResistor';
import { TMP36 } from './inputs/TemperatureSensors';
import { Potentiometer } from './inputs/Potentiometer';
import { Relay } from './inputs/Relay';
import { MQ2 } from './inputs/GasSensor';
import { Resistor, BreadBoard } from './General';
import { L293D } from './drivers/L293D';
import { Thermistor } from './inputs/Thermistor';

/**
 * Utils class
 * Contains All components with their section
 */
export class Utils {
  /**
   * Stores an object required by the Side Component Panel
   */
  static componentBox = {
    input: [
      ['PushButton', 'UltrasonicSensor', 'PIRSensor'], // Row
      ['SlideSwitch', 'MQ2', 'TMP36'],
      ['PotentioMeter', 'PhotoResistor', 'Thermistor']
    ],
    power: [
      ['Battery9v', 'CoinCell'] // Row
    ],
    controllers: [
      ['ArduinoUno'] // Row
    ],
    output: [
      ['Buzzer', 'LED', 'Motor'], // Row
      ['RGBLED', 'ServoMotor', 'SevenSegment'],
      ['LCD16X2']
    ],
    drivers: [
      ['L298N', 'L293D']
    ],
    misc: [
      ['Label', 'RelayModule']
    ],
    general: [
      ['Resistor', 'BreadBoard']
    ]
  };

  /** Components with thier name, image, classname */
  static components = {
    BreadBoard: {
      name: 'BreadBoard',
      image: './assets/images/components/Breadboard.svg',
      className: BreadBoard
    },
    Resistor: {
      name: 'Resistor',
      image: './assets/images/components/Resistor.png',
      className: Resistor
    },
    RGBLED: {
      name: 'RGB LED',
      image: './assets/images/components/RGBLED.png',
      className: RGBLED
    },
    SevenSegment: {
      name: 'Seven Segment Display',
      image: './assets/images/components/SevenSegment.png',
      className: SevenSegment
    },
    MQ2: {
      name: 'Gas Sensor MQ2',
      image: './assets/images/components/GasSensor.svg',
      className: MQ2
    },
    ServoMotor: {
      name: 'Servo Motor',
      image: './assets/images/components/Servo.png',
      className: ServoMotor
    },
    RelayModule: {
      name: 'Relay Module',
      image: './assets/images/components/1ChannelRelay.svg',
      className: Relay
    },
    PotentioMeter: {
      name: 'Potentiometer',
      image: './assets/images/components/Potentiometer.png',
      className: Potentiometer
    },
    TMP36: {
      name: 'Temperature Sensor TMP36',
      image: './assets/images/components/TMP36.svg',
      className: TMP36
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
    },
    L293D: {
      name: 'L293D',
      image: './assets/images/components/L293D.png',
      className: L293D
    },
    Thermistor: {
      name: 'Thermistor',
      image: './assets/images/components/Thermistor.png',
      className: Thermistor
    }
  };
}
