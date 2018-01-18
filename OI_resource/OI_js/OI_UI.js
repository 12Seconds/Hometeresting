  $("#asset").draggable();
  $("#asset").resizable({
      aspectRatio : 16/9,
      minHeight: 400,
      minWidth: 400,
      containment : "#content"
  });



// 오른쪽 메뉴 여닫기-----------------------------------------
 $(function () {
     function menutoggle() {
         var options = {};
         options = {
             direction: "right"
         };
         $("#sideinfo").toggle("slide", options, 500);
         $("#button").toggleClass("buttonCloseLo", 500);
     };
     $("#button").on("click", function () {
         menutoggle();
     });
 });


$(function(){
    function assetAppClose(){
        $( "#asset" ).hide( "fold", {}, "slow" );
    }
      function assetAppToggle() {
         $("#asset").toggle("fold");
     };
    
     $("#iconLo1").on("click", function () {
         assetAppToggle();
     });
    
    $("#assetExit").on("click", function () {
         assetAppClose();
     });
})

