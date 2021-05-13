import randomstring from "randomstring";

export default function textToFile (data) {
  // create a file from a blob

  var myblob = new Blob([data], {
    type: 'text/plain'
  })
  var fileName = randomstring.generate({length: 15}) + '.cir'
  var file = new File([myblob], fileName, { type: 'text/plain', lastModified: Date.now() })
  return file
}
