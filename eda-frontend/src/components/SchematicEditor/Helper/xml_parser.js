/* eslint-disable */
let pinData,metadata,pinList
let currentPin,x_pos,y_pos
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
            // console.log(pinNumber, pinX, pinY, pinType)
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
      data = extractData(xml);
      // console.log(data)
      return data;
      
  }).then(function(data){

    // MX GRAPHS TRY BLOCK HAS BEEN SHIFTED HERE.
    let pins = []
      width = data["width"]
      height = data["height"]
      pinData = data["pinData"]

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
      for(let i = 0; i < pinData.length;i++){
        currentPin = pinData[i]

        // move this to another file

        x_pos = (parseInt(width)/2 + parseInt(currentPin["pinX"])/fixed_number);
        y_pos = (parseInt(height)/2 - parseInt(currentPin["pinY"])/fixed_number);

        // move this to another file
        // eslint-disable-next-line
        pins[i] = graph.insertVertex(v1, null, '', x_pos, y_pos, 0.5, 0.5, 'align=top;verticalAlign=top;shape=circle;'+'fontColor=' + 'black' + ';strokeColor=' + 'black');
                 pins[i].geometry.relative = false;
    }
  
  })
  
  }

  export default getMetadataXML;