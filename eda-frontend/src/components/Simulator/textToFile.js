
export default function textToFile (data) {
  // create a file from a blob

  var myblob = new Blob([data], {
    type: 'text/plain'
  })
  var file = new File([myblob], 'netlist.cir', { type: 'text/plain', lastModified: Date.now() })
  return file
}
