import { Component, OnInit } from '@angular/core';

/**
 * Class For Front page contains Seven Segment animation logic
 */
@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.css']
})
export class FrontPageComponent implements OnInit {
  /**
   * Mapping For Seven Segment animation
   */
  readonly mapping = [
    ['a', 'b', 'c', 'd', 'e', 'f'], // 0
    ['b', 'c'], // 1
    ['a', 'b', 'g', 'e', 'd'], // 2
    ['a', 'b', 'g', 'c', 'd'], // 3
    ['f', 'g', 'b', 'c'], // 4
    ['a', 'f', 'g', 'c', 'd'], // 5
    ['a', 'f', 'g', 'c', 'e', 'd'], // 6
    ['a', 'b', 'c'], // 7
    ['a', 'b', 'c', 'd', 'e', 'f', 'g'], // 8
    ['a', 'b', 'f', 'g', 'c', 'd'], // 9
    ['a', 'b', 'c', 'e', 'f', 'g'], // A
    ['f', 'g', 'c', 'e', 'd'], // b
    ['a', 'd', 'e', 'f'], // c
    ['b', 'c', 'd', 'e', 'g'], // d
    ['a', 'd', 'e', 'f', 'g'], // E
    ['a', 'e', 'f', 'g'], // F
    [] // all off
  ];
  /**
   * Current Digit
   */
  digit = 0;
  /**
   * Constructor For Front page
   */
  constructor() { }
  /**
   * On Init Front page
   */
  ngOnInit() {
    // Set animation Interval
    setInterval(() => {
      // TODO: For optimization glow only those bars which are changed
      // Stop Glow in every bar of seven segment
      for (const className of this.mapping[8]) {
        const els = document.getElementsByClassName(className) as any;
        if (els.length < 3) { continue; }
        els[0].style.opacity = '0';
        els[1].style.opacity = '0';
        els[2].setAttribute('fill', '#b2b2b2');
      }
      // From mapping glow only required bar
      for (const ClassName of this.mapping[this.digit]) {
        const els = document.getElementsByClassName(ClassName) as any;
        if (els.length < 3) { continue; }
        els[0].style.opacity = '0.333';
        els[1].style.opacity = '0.333';
        els[2].setAttribute('fill', '#ffa500');
      }
      // Increment the Digit
      ++this.digit;
      // If digit is big reset the digit
      if (this.digit >= 17) {
        this.digit -= 17;
      }
    }, 1000);
  }
}
