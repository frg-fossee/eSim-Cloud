export class ImageToByteArray {
    static result = '';

    static getDataURLForm(url: string) {
        this.result = '';
        const image = this.createImage(url);
        image.onload = () => {
            this.result = this.convertImage(image);
        };
    }

    static createImage(url: string) {
        const image = document.createElement('img');
        image.setAttribute('src', url);
        image.setAttribute('visibility', 'hidden');
        return image;
    }

    static convertImage(image) {
        const canvas = this.drawImageToCanvas(image);
        return canvas.toDataURL();
    }

    static drawImageToCanvas(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
        return canvas;
    }
}
