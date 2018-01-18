  $("#asset").draggable();
  $("#asset").resizable({
      aspectRatio : 16/9,
      minHeight: 400,
      minWidth: 400,
      containment : "#content"
  });

  $("#assetExplore").draggable();
  $("#ww").draggable();


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

// 에셋 익스플로러

$(function(){
    function ExploreAppClose(){
        $( "#assetExplore" ).hide( "fold", {}, "slow" );
    }
      function ExploreAppToggle() {
         $("#assetExplore").toggle("fold");
     };
    
     $("#iconLo3").on("click", function () {
         ExploreAppToggle();
     });
    
    $("#explorer_exit").on("click", function () {
         ExploreAppClose();
     });
})

// 마이페이지

$(function(){
    function mySpaceAppClose(){
        $( "#ww" ).hide( "fold", {}, "slow" );
    }
      function mySpaceAppToggle() {
         $("#ww").toggle("fold");
     };
    
     $("#iconLo2").on("click", function () {
         mySpaceAppToggle();
     });
    
    $("#mySpaceExit").on("click", function () {
         mySpaceAppClose();
     });
})

