import { Buzzer } from './Buzzer';

export class Utils {
  static componentBox = {
    input: [],
    power: [],
    controllers: [],
    output: [
      ['Buzzer'], // Row
    ]
  };

  static components = {
    Buzzer: {
      name: 'Buzzer',
      image: './assets/images/components/Buzzer.png',
      className: Buzzer
    }
  };
}
