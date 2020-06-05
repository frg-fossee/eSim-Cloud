
export default function textToFile (data) {
  var myblob = new Blob([data], {
    type: 'text/plain'
  })
  var file = new File([myblob], 'netlist.cir', { type: 'text/plain', lastModified: Date.now() })
  return file
}
