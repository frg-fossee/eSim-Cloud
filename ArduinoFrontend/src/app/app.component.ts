import { Component, AfterViewInit } from '@angular/core';

/**
 * The Main App Component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  /**
   * The Title of the app
   */
  title = 'Arduino On Cloud';
  /**
   * Called after everything is loaded
   */
  ngAfterViewInit() {
    // Hide loading animation
    document.getElementById('loadanim').style.display = 'none';
  }
}
