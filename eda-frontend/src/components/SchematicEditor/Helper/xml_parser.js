let pinData,metadata,pinList
let width,height

// we need to divide the svg width and height by the same number in order to maintain the aspect ratio.
const fixed_number = 5

function extractData(xml){

    pinData = []
        metadata = xml.getElementsByTagName('metadata');
        let width = metadata[0]["attributes"][0].nodeValue
        let height = metadata[0]["attributes"][1].nodeValue
        
        pinList = metadata[0]["childNodes"]
        // console.log(metadata)
        // console.log(xmlDoc)
        // console.log(width,height)
        pinList.forEach(function(pin) {
  
            let pinNumber = pin.tagName.split('-').pop()
            let  pinX = pin.getElementsByTagName("x")[0].innerHTML
            let pinY = pin.getElementsByTagName("y")[0].innerHTML
            let pinType = pin.getElementsByTagName('type')[0].innerHTML.trim()
            pinData.push({"pinNumber":pinNumber,"pinX":pinX,"pinY":pinY,"type":pinType})
            console.log(pinNumber, pinX, pinY, pinType)
        } )
        return {"width" : width,
                "height" : height,
                "pinData" : pinData};
  }
  
  function getMetadataXML(path,graph,parent,evt,target,x,y){
  fetch(path)
  .then(function(response){
      return response.text();
  })
  .then(function(data){
      let parser = new DOMParser(),
      xml = parser.parseFromString(data,'text/xml');
      // console.log(xmlDoc);
      var data = extractData(xml);
      // console.log(data)
      return data;
      
  }).then(function(data){

    // MX GRAPHS TRY BLOCK HAS BEEN SHIFTED HERE.
      width = data["width"]
      height = data["height"]

      width  = width/fixed_number
      height = height/fixed_number


      let v1 = graph.insertVertex(
        parent,
        null,
        "",
        x,
        y,
        width,
        height,
        "shape=image;image=" + path + ";"
      );
      v1.setConnectable(false);
  
  })
  
  }

  export default getMetadataXML;