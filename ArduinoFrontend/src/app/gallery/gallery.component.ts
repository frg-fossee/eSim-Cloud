import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { filter, map } from 'rxjs/operators';
import { Login } from '../Libs/Login';
import { AlertService } from '../alert/alert-service/alert.service';
import { environment } from 'src/environments/environment';

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
    this.api.fetchSamples().subscribe((samples: any[]) => {
      samples.map(d => {
          if(!environment.production){
            this.samples.push(Object.assign({}, d, {'media':environment.IMG_URL+d.media}));
          }else{
            this.samples.push(d);
          }
      });

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

  getUserInfo(){
    // this.api.getRole(Login).subscribe()
  }

  /**
   * Deletes project from gallery
   * @param save_id
   * @param name  
   */
  deleteProjectFromGallery(save_id: any, name: any) {

    let isDelete = confirm('Delete' + ' ' + name);
    if (isDelete == true) {
      this.api.deleteProjectFromGallery(save_id, Login.getToken()).subscribe((done) => {
        this.samples = [];
        this.ngOnInit();
      }, (e) => {
        console.log(e);
      })
    }

  }
}
