/* This contains the scripts required for dragging and dropping
  components */
const $ = require("jquery");
window.$ = $;
window.jQuery = $;
require("jquery-ui-bundle/jquery-ui.min.js");

$(document).ready(function () {
  $("#res").draggable({
    grid: [25, 25], //Snapping to grid
    helper: "clone",
    snap: true,
  });
  $(".Grid").droppable({
    accept: "#res",
    drop: function (event, ui) {
      var dropPositionX = event.pageX - $(this).offset().left;
      var dropPositionY = event.pageY - $(this).offset().top;
      // Get mouse offset relative to dragged item:
      var dragItemOffsetX = event.offsetX;
      var dragItemOffsetY = event.offsetY;
      // Get position of dragged item relative to drop target:
      var dragItemPositionX = dropPositionX - dragItemOffsetX;
      var dragItemPositionY = dropPositionY - dragItemOffsetY;
      //alert("DROPPED IT AT " + dragItemPositionX + ", " + dragItemPositionY);
      var droppeditem = $(ui.draggable).clone().draggable();
      //Setting position of dropped item inside div
      var styles = { top: dragItemPositionY, left: dragItemPositionX };
      droppeditem.css(styles);
      $(".Grid").append(droppeditem);
    },
  });
});
