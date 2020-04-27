/* This contains the scripts required for dragging and dropping
  components */
const $ = require("jquery");
window.$ = $;
window.jQuery = $;
require("jquery-ui-bundle/jquery-ui.min.js");

$(document).ready(function () {
  $(".drop").draggable({
    grid: [20, 20], //Snapping to grid
    helper: "clone",
    snap: ".dropped",
  });
  $(".Grid").droppable({
    accept: ".drop,.dropped",
    drop: function (event, ui) {
      var dropPositionX = event.pageX - $(this).offset().left;
      var dropPositionY = event.pageY - $(this).offset().top;
      // Get mouse offset relative to dragged item:
      var dragItemOffsetX = event.offsetX;
      var dragItemOffsetY = event.offsetY;
      // Get position of dragged item relative to drop target:
      var dragItemPositionX = dropPositionX - dragItemOffsetX;
      var dragItemPositionY = dropPositionY - dragItemOffsetY;
      if ($(ui.draggable).hasClass('drop')){
        var droppeditem = $(ui.draggable).clone().draggable({
          grid:[20,20],
          snap:".dropped,.drop",
          snapTolerance: 15
        });
        var styles = { top: dragItemPositionY, left: dragItemPositionX };
        droppeditem.attr("class","dropped");
        droppeditem.css(styles);
        $(".Grid").append(droppeditem);
      }
      else{
        //Need to write else part
      }
    },
  });
});
