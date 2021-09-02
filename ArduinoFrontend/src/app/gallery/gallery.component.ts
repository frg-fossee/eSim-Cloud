import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { filter, map } from 'rxjs/operators';
import { Login } from '../Libs/Login';
import { AlertService } from '../alert/alert-service/alert.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material';

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
   * Determines whether staff is
   */
  isStaff = false;

  /**
   * Gallery Page Constructor
   * @param api API Service
   */
  constructor(
    private api: ApiService,
    private alertService: AlertService,
    private snackbar: MatSnackBar,
  ) { }

  /**
   * On Init Page
   */
  ngOnInit() {
    this.api.login().then(() => {
      const token = Login.getToken();
      if (token) {
        this.api.getRole(token).subscribe((result: any) => {
          result.is_arduino_staff === true ? this.isStaff = true : this.isStaff = false;
        });
      }
    }).catch(() => {

    });
    // Add Page Title
    document.title = 'Gallery | Arduino On Cloud';
    // Show Loading animation
    window['showLoading']();
    // Fetch Samples
    this.api.fetchSamples().subscribe((samples: any[]) => {
      samples.map(d => {
        if (!environment.production) {
          this.samples.push(Object.assign({}, d, { media: environment.IMG_URL + d.media }));
        } else {
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

  getUserInfo() {
    // this.api.getRole(Login).subscribe()
  }

  /**
   * Deletes project from gallery
   * @param saveId component Id
   * @param name name of the component
   */
  DeleteCircuit(saveId: any, name: any) {
    this.api.deleteProjectFromGallery(saveId, Login.getToken()).subscribe((done) => {
      this.samples = [];
      this.ngOnInit();
      this.snackbar.open('Circuit Deleted.', null, {
        duration: 2000
      });
    }, (e) => {
      console.log(e);
    });
  }
  /**
   * Delete the Project from Database
   * @param id Project id
   * @param name Project's name
   */
  deleteProjectFromGallery(id, name) {
    // ASK for user confirmation
    AlertService.showConfirm('Are You Sure You want to Delete Circuit', () => this.DeleteCircuit(id, name), () => { });
  }
}
