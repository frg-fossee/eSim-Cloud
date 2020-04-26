$(document).ready(function(){
   // $('.LeftBox').draggable();
    $("#res").draggable({
        grid:[25,25],
        helper:"clone",
        snap:true
    });
    $('.Grid').droppable({
        accept:"#res",
        drop:function(event,ui){
            var dropPositionX = event.pageX - $(this).offset().left;
            var dropPositionY = event.pageY - $(this).offset().top;
            // Get mouse offset relative to dragged item:
            var dragItemOffsetX = event.offsetX;
            var dragItemOffsetY = event.offsetY;
            // Get position of dragged item relative to drop target:
            var dragItemPositionX = dropPositionX-dragItemOffsetX;
            var dragItemPositionY = dropPositionY-dragItemOffsetY;
            alert('DROPPED IT AT ' + dragItemPositionX + ', ' + dragItemPositionY);
            var leftpos=dragItemPositionX+'px';
            var rightpos=dragItemPositionY+'px';
            console.log(leftpos);
            var droppeditem = $(ui.draggable).clone().draggable();
            var styles = {'top':dragItemPositionY,'left':dragItemPositionX};
            droppeditem.css(styles);
            console.log(droppeditem)
            //var droppeditem=$(ui.draggable).clone();
            $('.Grid').prepend(droppeditem);
            console.log($('This').html)
            $('.Grid'.droppeditem).css(styles);
            $('.Grid'.droppeditem).draggable();
        }
    })
});