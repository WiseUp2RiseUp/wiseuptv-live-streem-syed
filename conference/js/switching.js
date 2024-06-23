$(document).ready(function () {
  socket = io("https://wiseupconnect.wiseup.club:8000/").connect();

  socket.on("connect", function () {
    console.log("Connected.");
    // socket.emit('switcher',{});
  });

  socket.on("message", function (e) {
    if (e.url && e.chanel) {
      $.ajax({
        type: "POST",
        url: "https://wiseuptv.club/replace-video-url",
        data: "url=" + e.url + "&channel=" + e.chanel,
        dataType: "json",
        success: function (response) {
          if (response.success) {
            // handleToast("toast-success");
            console.log("video player url replaced successfully");
          } else {
            // handleToast("toast-danger");
          }
        },
      });
    }
  });

  $(".switching").click(function () {
    let id = SESSION_ID,
      type = $(this).attr("id");
    switch (type) {
      case "local":
        socket.emit(data.msgType, {
          chanel: id,
          url: url.local + id + ".mp4?autoplay=1&mute=1&loop=1",
        });
        break;
      case "live":
        socket.emit(data.msgType, {
          chanel: id,
          url: url.live + id.replace("-", "") + data.live,
        });
        break;
      default:
        socket.emit(data.msgType, {
          chanel: id,
          url: url.conference + id,
        });
    }
  });

  function runAd(ad) {
    // return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: API_URL + "/runAd/?uri=" + ad + "&sId=" + SESSION_ID,
      dataType: "JSON",
      success: function (response) {
        // resolve(response.path);
      },
      error: (error) => {
        console.log(error);
      },
    });
    // });
  }

  function runAd1(fileName) {
    try {
      var postData = JSON.stringify({
        type: "IPCAM",
        rtspUri: "file:///var/www/html/recordings/" + fileName + ".mp4",
        adaptativeBitrate: true,
        onlyPlayWithSubscribers: true,
        networkCache: 2000,
        data: "IP-CAM",
      });

      return new Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: SERVER_URL + "/api/sessions/" + SESSION_ID + "/connection",
          data: postData,
          headers: {
            Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
            "Content-Type": "application/json",
          },
          success: (response) => {
            resolve(response.connectionId);
          },
          error: (error) => reject(error),
        });
      });
    } catch (e) {
      console.log(e.message);
    }

    // return new Promise((resolve, reject) => {
    //   $.ajax({
    //     type: "POST",
    //     url: SERVER_URL + "/api/sessions/" + SESSION_ID + "/connection",
    //     data: JSON.stringify({
    //       type: "IPCAM",
    //       rtspUri: "rtsp://admin:Hewlett0@115.186.167.167:554", // rtspURI,
    //       adaptativeBitrate: false,
    //       onlyPlayWithSubscribers: false,
    //       networkCache: 500,
    //       data: "IP-CAM",
    //     }),
    //     headers: {
    //       Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
    //       "Content-Type": "application/json",
    //     },
    //     success: (response) => resolve(response),
    //     error: (error) => resolve(error),
    //   });
    // });
  }

  function killConnection(id, con) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "DELETE",
        url: SERVER_URL + `/api/sessions/${id}/connection/${con}`,
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });
  }

  $(".ads").click(function () {
    if (!advertising) {
      advertising = true;
      let id = $(this).attr("id");
      runAd1(id).then((r) => {
        setTimeout(() => {
          killConnection(SESSION_ID,r).then(() => {
            advertising = false;
            console.log("Ad Connection killed!");
          });
        }, parseInt(id.replace("ad", "")) * 10000);
      });
    }
    // socket.emit(data.msgType, {
    //   chanel: id,
    //   url: url.local + type + ".mp4?autoplay=1&mute=1&loop=1",
    // });
  });
});
