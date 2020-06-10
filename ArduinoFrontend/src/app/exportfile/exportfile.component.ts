import { Component, OnInit } from '@angular/core';
import { Download, ImageType } from '../Libs/Download';
import { Title } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material';

declare var window;

@Component({
  selector: 'app-exportfile',
  templateUrl: './exportfile.component.html',
  styleUrls: ['./exportfile.component.css']
})
export class ExportfileComponent implements OnInit {

  constructor(private title: Title, private dialog: MatDialogRef<ExportfileComponent>) { }

  ngOnInit() {
  }
  Export(svg, png, jpg) {
    window.showLoading();
    if (svg.checked) {
      Download.ExportImage(ImageType.SVG)
        .then(v => {
          Download.DownloadText(this.title.getTitle() + '.svg', [v], {
            type: 'data:image/svg+xml;charset=utf-8;'
          });
          window.hideLoading();
        });
    } else if (png.checked) {
      Download.ExportImage(ImageType.PNG)
        .then(v => {
          Download.DownloadImage(v, this.title.getTitle(), ImageType.PNG);
          window.hideLoading();
        });
    } else if (jpg.checked) {
      Download.ExportImage(ImageType.JPG)
        .then(v => {
          Download.DownloadImage(v, this.title.getTitle(), ImageType.JPG);
          window.hideLoading();
        });
    } else {
      window.hideLoading();
    }
    this.dialog.close();
  }
}
