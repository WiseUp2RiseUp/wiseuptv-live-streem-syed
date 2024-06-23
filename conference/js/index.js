$(function () {
  if (navigator.userAgent.indexOf("Mac") > 0) $("body").addClass("mac-os");

  $(".button_groups a").click(function (e) {
    if ($(this).hasClass("active")) {
      $("body").addClass("hidesections");
      $(this).removeClass("active");
      e.preventDefault();
    } else {
      $("body").removeClass("hidesections");
      $(".button_groups a").removeClass("active");
      $(this).addClass("active");
    }
  });

  function controlSwitch(t, b) {
    $("#commentsbox").addClass("d-none");
    $("#chatbox").addClass("d-none");
    $("#setting_box").addClass("d-none");
    $("#ipcampbox").addClass("d-none");

    // if ($(t).hasClass("active")) {
    //   $(b).addClass("d-none");
    //   if (!$("body").hasClass("hidesections")) {
    //     $("body").addClass("hidesections");
    //   }
    // } else {
    $(b).removeClass("d-none");
    // if (!$("body").hasClass("hidesections")) {
    //   $("body").removeClass("hidesections");
    // }
    // }
  }

  $("#commentsboxclick").click(function () {
    controlSwitch(this, "#commentsbox");
  });

  $("#chatcboxclick").click(function () {
    controlSwitch(this, "#chatbox");
  });

  $("#settingboxclick").click(function () {
    controlSwitch(this, "#setting_box");
  });

  $("#ipcampboxclick").click(function () {
    controlSwitch(this, "#ipcampbox");
  });

  $("#thumbboxclick").click(function () {
    $("#videothumbnill").addClass("d-block");

    $("#smallVideos").appendTo($("#videothumbnill"));
    $("#smallVideos").css({ "top": 0, "position": "absolute" });

    if (isHost()) {
      if ($("#smallVideos video").length > 1) $("#HPModalBtn").click();
      else sendMsg(JSON.stringify({ id: 1 }), "showAll");
    }
  });

  $(".close_thumbnillinner").click(function () {
    $("#videothumbnill").removeClass("d-block");
    $(".button_groups a").removeClass("active");

    $("#smallVideos").prependTo($(".video_conference_left_bottom"));
    $("#smallVideos").css({ "top": "unset", "position": "relative" });

    if (isHost()) {
      sendMsg(JSON.stringify({ id: 0, vid: "video-" + USER_ID }), "showAll");
    }
    presenter = 0;
  });

  $("#fullboxclick").click(function () {
    $("#videofullnill").addClass("d-block");
  });

  $(".close_fullinner").click(function () {
    $("#videofullnill").removeClass("d-block");
    $(".button_groups a").removeClass("active");
  });

  $(".open_fullinnerlist").click(function () {
    $("#videothumbnill").addClass("d-block");
  });

  //////////////
  $("#fullboxclick2nd").click(function () {
    $("body").addClass("fullscreenvideo");
  });

  $(".close_fullinner2").click(function () {
    $("body").removeClass("fullscreenvideo");
  });
});
