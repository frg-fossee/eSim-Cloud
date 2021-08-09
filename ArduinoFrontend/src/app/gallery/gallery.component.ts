import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

/**
 * For Handling Time ie. Prevent moment error
 */
declare var moment;

/**
 * Class For Galley Page (Component)
 */
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  /**
   * Store Samples
   */
  samples: any[] = [];
  /**
   * Gallery Page Constructor
   * @param api API Service
   */
  constructor(private api: ApiService) { }

  /**
   * On Init Page
   */
  ngOnInit() {
    this.api.login().then(() => {

    });
    // Add Page Title
    document.title = 'Gallery | Arduino On Cloud';
    // Show Loading animation
    window['showLoading']();
    // Fetch Samples
    this.api.fetchSamples().subscribe(samples => {
      this.samples = samples;
      // Hide Loading Animation
      window['hideLoading']();
    }, err => {
      // show error and hide animation
      console.log(err);
      window['hideLoading']();
    });

    // TODO: Fetch Published Circuit
  }
  /**
   * Returns the time difference from now in a string
   * @param item Gallery Card item
   */
  DateTime(item) {
    item.time = moment(item.create_time).fromNow();
  }
}
