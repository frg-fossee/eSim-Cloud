import { Component, OnInit } from '@angular/core';
import { Download, ImageType } from '../Libs/Download';
import { Title } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Class For Export Dialog Component
 */
@Component({
  selector: 'app-exportfile',
  templateUrl: './exportfile.component.html',
  styleUrls: ['./exportfile.component.css']
})
export class ExportfileComponent {
  /**
   * Constructor For Export Dialog
   * @param title Project Title
   * @param dialog Material Dialog Reference
   */
  constructor(private title: Title, private dialog: MatDialogRef<ExportfileComponent>) { }
  /**
   * Export Workspace to image
   * @param svg SVG Radio element
   * @param png PNG Radio element
   * @param jpg JPG Radio element
   */
  Export(svg, png, jpg) {
    // Show Loading animation
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
      // Hide loading animation
      window.hideLoading();
    }
    // Close Dialog
    this.dialog.close();
  }
}
