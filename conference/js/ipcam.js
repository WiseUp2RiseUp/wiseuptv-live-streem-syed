$(function () {
  if (ID && ID.length > 7) {
    SESSION_ID = ID;
    host = false;
    $(".hide").show();
  } else stop();

  let TOKEN =
    "wss://" +
    location.hostname +
    ":4443/openvidu/?sessionId=" +
    SESSION_ID +
    "&secret=" +
    SECRET;

  var OV = new OpenVidu();
  var session = OV.initSession();
  let con;

  // session.on('streamCreated', event => {
  //     let s = session.subscribe(event.stream, 'container');
  //     s.on('videoElementCreated', event => {
  //     });
  // });

  session
    .connect(TOKEN, { clientData: USER_ID })
    .then((r) => console.log(r))
    .catch((error) => console.error(error));

  $("#connect").click(function () {
    let v = $("#rtsp").val();
    // if (v.length > 10 & v.indexOf('rtsp') != -1) {
    callConnect(this, v);
    // } else showToast('Invalid rtsp URL.');
  });

  $("#adfile").change(function () {
    $(this).val();
  });

  $("#demo-connect").click(function () {
    let v = "rtsp://admin:Hewlett0@115.186.167.167:554";
    callConnect(this, v);
  });

  $("#leave").click(function () {
    if (con)
      leaveCam(con)
        .then((r) => showToast("Leaved successfully."))
        .catch((e) => showToast("Error leaving: " + e.message));
    else showToast("Nothing to close.");
  });

  function callConnect(t, v) {
    $(t).prop("disabled", true);
    Loading.start();
    connect(v)
      .then((r) => {
        con = r.connectionId;
        Loading.stop();
        showToast("Connected successfully.");
      })
      .catch((e) => {
        Loading.stop();
        showToast("Connection error: " + e.message);
      });
  }

  function connect(rtspURI) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/sessions/" + SESSION_ID + "/connection",
        data: JSON.stringify({
          type: "IPCAM",
          rtspUri: rtspURI,
          adaptativeBitrate: false,
          onlyPlayWithSubscribers: false,
          networkCache: 500,
          data: "IP-CAM",
        }),
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => resolve(response),
        error: (error) => resolve(error),
      });
    });
  }

  function leaveCam(c) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "DELETE",
        url: SERVER_URL + "/api/sessions/" + SESSION_ID + "/connection/" + c,
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => resolve(response),
        error: (error) => resolve(error),
      });
    });
  }
});
