import { ImageToByteArray } from './ImageToByteArray';

export class ConvertJSONFormat {
  /**
   * Converts JSON of cloud-stored circuit into JSON format for storing it temporarily
   * @param id Project Id
   * @param data JSON data of the circuit
   * @returns JSON data of the circuit with format for saving it temporarily
   */
  static async convertToOfflineFormat(id, data) {
    const obj = JSON.parse(data.data_dump);
    const project = {
      name: data.name,
      description: data.description,
      image: data.base64_image,
      created_at: Date.now(),
    };
    obj['id'] = id;
    obj['project'] = project;

    // Correction required for the following two lines of code
    // Image data is recieved after the image gets loaded which is async code
    // In short, for now this function will not return image data but its url.
    ImageToByteArray.getDataURLForm(project.image);
    obj.project.image = ImageToByteArray.result !== '' ? ImageToByteArray.result : project.image;
    return obj;
  }

  /**
   * Converts JSON of temporarily saved circuit to JSON format on Cloud
   * @param data JSON data of the circuit
   * @returns JSON data of the circuit with format for saving it on cloud
   */
  static convertToOnlineFormat(data) {
    const obj = {
      data_dump: '',
      is_arduino: true,
      description: data.project.description,
      name: data.project.name,
      base64_image: data.project.image,
      branch: 'master',
      version: this.getRandomString(20)
    };
    // Remove unwanted props from JSON
    delete data['id'];
    delete data['project'];
    // Data Dump will contain Circuit data
    const dataDump = data;
    // Convert Data Dump to an String and add to Save Object
    obj.data_dump = JSON.stringify(dataDump);
    return obj;
  }

  /**
   * Generate and return a random string
   * @param length Length of random string
   * @returns random string
   */
  static getRandomString(length): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

}
