// import { LCDPixel } from './LCDPanel';
// import { LCD16X2 } from '../Display';

// declare  var Raphael;

// describe('LCDPanel', () => {
//   let lcdPixel: LCDPixel;
//   let lcd: LCD16X2;
//   let canvas: any;

//   beforeEach(() => {
//     canvas = Raphael('holder', '100%', '100%');
//     lcd = new LCD16X2(window['canvas'].set(), 300, 350);
//     lcdPixel = new LCDPixel([5, 5], [6, 6], 100, 100, 300, 350, 5, 5, '#000', '#FFF');
//   });

//   it('shifting pixel by 2 and hiding it', () => {
//     lcdPixel.shift(2, true);
//     expect(lcdPixel.canvas.x).toBe(100 + 300 + 5);
//     expect(lcdPixel.canvas.y).toBe(6);
//     expect(this.posX).toBe(7);
//     expect(lcdPixel.hidden).toBe(true);
//   });

//   it('shifting pixel by 2 and not hiding it', () => {
//     lcdPixel.shift(2, false);
//     expect(lcdPixel.canvas.x).toBe(400);
//     expect(lcdPixel.canvas.y).toBe(6);
//     expect(lcdPixel.hidden).toBe(false);
//   });

// });
