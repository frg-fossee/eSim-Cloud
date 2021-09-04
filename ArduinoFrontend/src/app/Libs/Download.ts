// Declare an Enumeration For Image Type
export enum ImageType { PNG, JPG, SVG }
/**
 * Canvg used For Rendering SVG
 */
declare var canvg;
/**
 * Download Class
 */
export class Download {
  /**
   * Downloads Image From Base64 Data
   * @param data Base64 Image Data
   * @param filename Filename For Download
   * @param type Type of the image
   */
  static DownloadImage(data: any, filename: string, type: ImageType) {
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    const a = document.createElement('a');
    const ext = (type === ImageType.PNG) ? 'png' : 'jpg';
    a.setAttribute('download', `${filename}.${ext}`);
    a.setAttribute('href', data);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
  }
  /**
   * Download Text File
   * @param filename Filename of the download
   * @param data Data inside the download
   * @param options Extra Options for mime
   */
  static DownloadText(filename: string, data: any[], options: any) {
    const blob = new Blob(data, options);
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    const a = document.createElement('a');
    a.setAttribute('download', `${filename}`);
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
  }
  /**
   * Asynchronous Function for Export Image to a Base64 Format.
   * @param type Type of the Image
   */
  static async ExportImage(type: ImageType) {
    // Get SVG from Workspace an Clone it
    const svg = (document.querySelector('#holder > svg').cloneNode(true) as SVGSVGElement);
    svg.getElementsByTagName('g')[0].removeAttribute('transform'); // Remove any transformation

    // Extract all image from svg
    const images = (svg.getElementsByTagName('image') as any);
    for (const image of images) {
      // Fetch each image and convert image into base64
      let data = await fetch(image.getAttribute('href'))
        .then((v) => {
          return v.text();
        });
      data = (data.replace('<svg ', `<svg width="${image.getAttribute('width')}" height="${image.getAttribute('height')}" `));
      image.setAttribute(
        'href',
        'data:image/svg+xml;base64,' + window.btoa(data)
      );
    }
    // Return a new Promise
    return new Promise((res, _) => {
      // Get the client pixel ratio
      const pixelRatio = 1.25;
      // get The Bounding box of the circuit
      const gtag = (document.querySelector('#holder > svg > g') as SVGSVGElement).getBBox();
      if (gtag.width === 0 || gtag.height === 0) {
        gtag.width = 100;
        gtag.height = 100;
      }
      // Add transformation to the g tag
      svg.getElementsByTagName('g')[0].setAttribute('transform', `scale(1,1)translate(${-gtag.x + 10},${-gtag.y + 10})`);
      // if type is svg then return new svg
      if (type === ImageType.SVG) {
        res(svg.outerHTML);
        return;
      }
      // if type is not svg then render svg using canvg
      const canvas = document.createElement('canvas');
      // set canvas width and height
      canvas.width = (gtag.width + gtag.x + 20) * pixelRatio;
      canvas.height = (gtag.height + gtag.y + 20) * pixelRatio;
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.width + 'px';
      // change the width and height of svg
      svg.setAttribute('width', '' + canvas.width);
      svg.setAttribute('height', '' + canvas.height);

      // Get Canvas Context
      const ctx = (canvas.getContext('2d') as any);
      // enable smoothing
      ctx.mozImageSmoothingEnabled = true;
      ctx.webkitImageSmoothingEnabled = true;
      ctx.msImageSmoothingEnabled = true;
      ctx.imageSmoothingEnabled = true;
      // Apply tranformation
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      // render for modified svg
      const v = canvg.Canvg.fromString(ctx, svg.outerHTML);
      v.render().then(() => {
        let image;
        if (type === ImageType.JPG) {
          // if type is jpg remove the black background
          const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imgdata.data.length; i += 4) {
            if (imgdata.data[i + 3] === 0) {
              imgdata.data[i] = 255;
              imgdata.data[i + 1] = 255;
              imgdata.data[i + 2] = 255;
              imgdata.data[i + 3] = 255;
            }
          }
          // Add Image to canvas
          ctx.putImageData(imgdata, 0, 0);
          image = canvas.toDataURL('image/jpeg');
        } else {
          // Get The base64
          if (type === ImageType.PNG) {
            image = canvas.toDataURL('image/png');
          }
        }
        res(image);
      });
    });
  }
}
