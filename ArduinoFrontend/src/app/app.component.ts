import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'ArduinoFrontend';
  ngAfterViewInit() {
    document.getElementById('loadanim').style.display = 'none';
  }
}
