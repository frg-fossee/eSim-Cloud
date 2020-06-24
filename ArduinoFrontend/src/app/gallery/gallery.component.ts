import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

declare var moment;

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  samples: any[] = [];
  constructor(private api: ApiService) { }


  ngOnInit() {
    document.title = 'Gallery | Arduino On Cloud';
    window['showLoading']();
    this.api.fetchSamples().subscribe(samples => {
      this.samples = samples;
      window['hideLoading']();
    }, err => {
      console.log(err);
      window['hideLoading']();
    });

    // TODO: Fetch Published Circuit
  }

  DateTime(item) {
    item.time = moment(item.create_time).fromNow();
  }
}
