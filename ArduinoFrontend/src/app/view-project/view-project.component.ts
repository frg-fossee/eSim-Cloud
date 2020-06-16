import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { SaveOnline } from '../Libs/SaveOnline';
import { Login } from '../Libs/Login';
import { Title, Meta } from '@angular/platform-browser';
declare var moment;


@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {
  constructor(
    private aroute: ActivatedRoute,
    private api: ApiService,
    private title: Title,
    private meta: Meta) { }
  data: any;
  shareURL: string;
  shareName: string;

  redirect() {
    window.open('../../../404', '_self');
  }
  setMetaTags(data: any) {
    const description = `${data.name}.${data.description}.By ${data.owner} at ${data.create_time}`;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.removeTag('property="og:type"');
    this.meta.addTag({
      property: 'og:type',
      content: 'Electronic Simulation'
    });
    this.meta.removeTag('property="og:title"');
    this.meta.addTag({
      property: 'og:title',
      content: data.name
    });
    this.meta.removeTag('property="og:description"');
    this.meta.addTag({
      property: 'og:description',
      content: description
    });
    this.meta.removeTag('property="og:image"');
    this.meta.addTag({
      property: 'og:image',
      content: data.base64_image
    });
    this.meta.removeTag('property="og:url"');
    this.meta.addTag({
      property: 'og:url',
      content: window.location.href
    });
    this.meta.removeTag('property="og:site_name"');
    this.meta.addTag({
      property: 'og:site_name',
      content: 'Arduino On Cloud'
    });
  }
  ngOnInit() {
    window['showLoading']();
    const token = Login.getToken();
    if (!token) {
      Login.redirectLogin();
      return;
    }
    this.shareURL = window.location.href;
    this.aroute.paramMap.subscribe((v: any) => {
      const slug: string = v.params.slug;
      const pos = slug ? slug.indexOf('-') : -1;
      if (pos > -1) {
        let id = slug.substr(0, pos);
        id = id.replace(/_/g, '-');
        if (SaveOnline.isUUID(id)) {
          this.api.readProject(id, token).subscribe((output: any) => {
            this.shareName = `${output.name} | Arduino On Cloud`;
            this.title.setTitle(this.shareName);
            output.save_time = moment(output.save_time).format('LLLL');
            output.create_time = moment(output.create_time).format('LLLL');
            this.setMetaTags(output);
            this.data = output;
            window['hideLoading']();
          }, err => {
            if (err.status === 401) {
              this.redirect();
            }
            console.log(err);
          });
        } else {
          this.redirect();
        }
      } else {
        this.redirect();
      }
    });
  }

}
