import { Buzzer } from './Buzzer';
import { Battery9v } from './Battery';

export class Utils {
  static componentBox = {
    input: [],
    power: [
      ['Battery9v'] // Row
    ],
    controllers: [],
    output: [
      ['Buzzer'], // Row
    ]
  };

  static components = {
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
