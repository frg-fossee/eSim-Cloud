import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { SaveOnline } from '../Libs/SaveOnline';
import { Login } from '../Libs/Login';
import { Title, Meta } from '@angular/platform-browser';
/**
 * For Handling Time ie. Prevent moment error
 */
declare var moment;

/**
 * Class For Project Page(Component) Used in sharing.
 */
@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {
  /**
   * View Project Page
   * @param aroute For Url
   * @param api API Service
   * @param title Document Title
   * @param meta Meta Tag handler
   */
  constructor(
    private aroute: ActivatedRoute,
    private api: ApiService,
    private title: Title,
    private meta: Meta) { }
  /**
   * Data Of the Project
   */
  data: any;
  /**
   * Sharing Url
   */
  shareURL: string;
  /**
   * Sharing Title Name
   */
  shareName: string;
  /**
   * Redirect to 404 Page
   */
  private redirect() {
    window.open('../../../404', '_self');
  }

  /**
   * Set Meta Tags For SEO
   * @param data Project Data
   */
  setMetaTags(data: any) {
    // Create Description
    const description = `${data.name}.${data.description}.By ${data.owner} at ${data.create_time}`;
    // Update Description meta tag
    this.meta.updateTag({ name: 'description', content: description });
    // Type of Webpage
    this.meta.removeTag('property="og:type"');
    this.meta.addTag({
      property: 'og:type',
      content: 'Electronic Simulation'
    });
    // Title of page
    this.meta.removeTag('property="og:title"');
    this.meta.addTag({
      property: 'og:title',
      content: data.name
    });
    // Desription of page
    this.meta.removeTag('property="og:description"');
    this.meta.addTag({
      property: 'og:description',
      content: description
    });
    // Image of the Circuit
    this.meta.removeTag('property="og:image"');
    this.meta.addTag({
      property: 'og:image',
      content: data.base64_image
    });
    // Actual URL of Circuit
    this.meta.removeTag('property="og:url"');
    this.meta.addTag({
      property: 'og:url',
      content: window.location.href
    });
    // Site name meta tag
    this.meta.removeTag('property="og:site_name"');
    this.meta.addTag({
      property: 'og:site_name',
      content: 'Arduino On Cloud'
    });
  }
  /**
   * On Init Method
   */
  ngOnInit() {
    window['showLoading'](); // Show Loading animation

    // Get Token if not present then redirect to login
    let token = Login.getToken();
    token = token ? token : null;
    // Sharing url
    token = token ? token : null;
    this.shareURL = window.location.href;

    this.aroute.paramMap.subscribe((v: any) => {
      // From Slug find project id
      const slug: string = v.params.slug;
      const pos = slug ? slug.indexOf('-') : -1;
      let [ id, branch, version, ] = slug.split('-', 3);
      let name = slug.split('-').splice(3).join('-');
      // if project id is found
      if (id && version && branch) {
        id = id.replace(/_/g, '-');
        version = version.replace(/_/g, '-');
        branch = branch.replace(/_/g, '-');
        name = name.replace(/-/g, ' ');
        // Check if project id is uuid
        if (SaveOnline.isUUID(id)) {
          this.api.readProject(id, branch, version, token).subscribe((output: any) => {
            this.shareName = `${output.name} | Arduino On Cloud`; // Set the sharing name
            // Set the page title
            this.title.setTitle(this.shareName);
            // Show Date in more meaningfull format
            output.save_time = moment(output.save_time).format('LLLL');
            output.create_time = moment(output.create_time).format('LLLL');
            // Set meta tags
            this.setMetaTags(output);
            // set the project data
            this.data = output;
            // Hide Loading animation
            window['hideLoading']();
          }, err => {
            if (err.status === 401) {
              // if unauthorized then redirect to 404
              this.redirect();
            }
            console.log(err);
          });
        } else {
          // if project id is not valid return to 404
          this.redirect();
        }
      } else {
        // if Project id not found redirect to 404
        this.redirect();
      }
    });
  }

}
