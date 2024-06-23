$(function () {
  getAllDevices();

  if (ID && ID.length > 7) {
    SESSION_ID = ID;
    USER_ID = "User-" + USER_ID; // + Math.floor(Math.random() * 1000);
    host = false;
    $(".before-start").hide();
    $(".after-start").hide();
    $(".close_thumbnillinner").hide();
    $("#thumbboxclick").hide();
    join();
  } else {
    $(".after-start").hide();
    // $("#channelModel").click();
    $("#liveModalBtn").click();
    // join();
  }


  // Slect channel to stream to
  $("#chModal").on("hide.bs.modal", function () {
    if (!SESSION_ID) {
      SESSION_ID = sessions[0];
      join();
    }

    $(".session-id").html(SESSION_ID);
    $(".session-id").show();
  });

  $("#chDone").click(function () {
    let v = $('input[name="1"]:checked').val();
    if (v != 0) {
      let c = $('input[name="2"]:checked').val();
      updateCountDown(c);
    }
    SESSION_ID = sessions[v];
    $("#chModal").modal("hide");
    join();
  });


  // Show Live on time line or not
  $("#liveModal").on("hide.bs.modal", function () {
    if (recordLive) return;
    if (!SESSION_ID) redirect()
    join();

    // $(".before-start").hide();

    $(".session-id").html(SESSION_ID);
    $(".session-id").show();
  });

  $("#liveDone").click(function () {
    if (!SESSION_ID) redirect();
    recordLive = true;
    $("#liveModal").modal("hide");
    join();
  });

  // Hide presenter or not
  $("#HPModal").on("hide.bs.modal", function () {
  });

  $("#HPDone").click(function () {
    $("#HPModal").modal("hide");
    presenter = 1;
    sendMsg(JSON.stringify({ id: "video-" + USER_ID }), "showAll");
  });

  function updateCountDown(v) {
    let cI = setInterval(function () {
      if (v-- > 0) {
        $("#liveToTv").html("Live to TV (" + v + ")");
      } else {
        clearInterval(cI);
        $("#liveToTv").html("Live to TV");
        $("#liveToTv").click();
        $("#liveToTv").prop("disabled", true);
      }
    }, 1000);
  }

  $("#liveToTv").click(function () {
    // alert("Live to TV");
  });

  $(document).on("click", ".usr-mic", function () {
    let id = $(this).attr("id");
    if (id.replace("mic-", "") != USER_ID) {
      showToast("You can only control your own stream.");
      return;
    }
    if ($(this).hasClass("fa-microphone")) {
      $(this).removeClass("fa-microphone");
      $(this).addClass("fa-microphone-slash");
      if (publisher) publisher.publishAudio(false);
      sendMsg(
        JSON.stringify({
          id: id,
          old: "fa-microphone",
          new: "fa-microphone-slash",
        }),
        "control"
      );
    } else {
      $(this).removeClass("fa-microphone-slash");
      $(this).addClass("fa-microphone");
      if (publisher) publisher.publishAudio(true);
      sendMsg(
        JSON.stringify({
          id: id,
          old: "fa-microphone-slash",
          new: "fa-microphone",
        }),
        "control"
      );
    }
  });

  $(document).on("click", ".usr-cam", function () {
    let id = $(this).attr("id");
    if (id.replace("cam-", "") != USER_ID) {
      showToast("You can only control your own stream.");
      return;
    }
    if ($(this).hasClass("fa-video")) {
      $(this).removeClass("fa-video");
      $(this).addClass("fa-video-slash");
      if (publisher) publisher.publishVideo(false);
      sendMsg(
        JSON.stringify({ id: id, old: "fa-video", new: "fa-video-slash" }),
        "control"
      );
    } else {
      $(this).removeClass("fa-video-slash");
      $(this).addClass("fa-video");
      if (publisher) publisher.publishVideo(true);
      sendMsg(
        JSON.stringify({ id: id, old: "fa-video-slash", new: "fa-video" }),
        "control"
      );
    }
  });

  // $(document).on("click", ".sel-usr", function () {
  //   let id = $(this).html();
  //   sendMsg(id, "select");
  //   selectStream(id);
  // });

  $("#create").click(function () {
    $(".before-start").hide();
    $(".after-start").show();

    if (isHost()) {

      // OV.getUserMedia({
      //   audioSource: AudioDevice,
      //   videoSource: VideoDevice,
      //   publishAudio: true,
      //   publishVideo: true,
      //   resolution: "1920x1080",
      //   frameRate: 60,
      //   insertMode: "APPEND",
      //   mirror: false,
      //   videoSimulcast: true
      // }).then(r => {
      //   localRecorder = OV.initLocalRecorder(publisher.stream);
      //   var options = {
      //     mimeType: 'video/webm;codecs=vp8',
      //     audioBitsPerSecond: 128000,
      //     videoBitsPerSecond: 2500000
      //   };
      //   localRecorder.record(options);
      // })


      Loading.start();

      startBroadcast().then(r=>{
        console.log("Broadcast started \n",r);
      })

      startRecording().then((r) => {
        if (r) rId = r;
        Loading.stop();
        if (recordLive) startNotification();
      });
    }
  });

  $("#reporting").click(reporting);
  $("#leave").click(leaveSession);

  $("#ipcam").click(function () {
    window.open("/conference/html/ipcam.html?id=" + SESSION_ID, "_blank");
  });

  $("#watch").click(function () {
    let val =
      "https://" +
      location.hostname +
      "/conference/html/watch.html?id=" +
      SESSION_ID;

    // For android only
    if (window.navigator.platform.includes("Linux")) {
      try {
        Android.shareLink(val);
      } catch (e) { }
    } else {
      window.open(val, "_blank");
    }
  });

  $("#switch").click(function () {
    let val =
      "https://" +
      location.hostname +
      "/conference/html/switch.html?id=" +
      SESSION_ID;

    // For android only
    if (window.navigator.platform.includes("Linux")) {
      try {
        Android.shareLink(val);
      } catch (e) { }
    } else {
      window.open(val, "_blank");
    }
  });

  $(window).on("beforeunload", function () {
    leaveSession();
  });

  function join() {
    Loading.start();

    if (isHost()) USER_ID = "Host-" + USER_ID;
    else if (!VISITOR_ID)
      location.replace(
        "https://wiseup.club/login?last_url=https://wiseupconnect.wiseup.club/conference/" +
        SESSION_ID
      );

    try {
      Android.startMeeting();
    } catch (e) { }

    OV = new OpenVidu();
    session = OV.initSession();

    session.on("sessionDisconnected", (event) => {
      if (!isHost()) {
        const d = new Date();
        location.replace("https://wiseup.club/?cache=" + d.getTime());
      }
    });

    session.on("streamCreated", (e) => {
      let u =
        e.stream.connection.data == "IP-CAM"
          ? "IP-CAM"
          : JSON.parse(e.stream.connection.data).clientData;
      if (isHost()) {
        states[USER_ID] = true;
        sendMsg(JSON.stringify({ uid: u, states: states }), "states");
      }
      fetchVisitorDetails(u.split("-")[1], visitorType.participant);

      let s = session.subscribe(e.stream, createStreamElement(u, isHost(u)));
      s.on("videoElementCreated", (event) => {
        event.element.setAttribute("name", `vid-${u}`);

        if (isHost(u)) {
          $("#" + event.element.id).addClass("mainfullvideo");
        } else {
          $("#" + event.element.id).addClass("thumbvideo");
        }
        setTimeout(() => {
          if (states["selected"] === "vid-" + u) {
            document.querySelector("#container video").srcObject =
              event.element.srcObject;
            document
              .querySelector("#container video")
              .setAttribute("name", `vid-${u}`);
          }
          if (states[u])
            $("video[name='" + `vid-${u}` + "']").addClass("vsChanged");
          else $("video[name='" + `vid-${u}` + "']").removeClass("vsChanged");
        }, 1000);
      });
    });

    session.on("streamDestroyed", (event) => {
      let u =
        event.stream.connection.data == "IP-CAM"
          ? "IP-CAM"
          : JSON.parse(event.stream.connection.data).clientData;
      $("#video-" + u).remove();
      if (isHost(u)) {
        session.disconnect();
      }
    });

    session.on("signal:switch", (event) => {
      // setLayout(event.data);
      $("#" + event.data).prependTo("#container");
    });

    session.on("signal:select", (event) => {
      selectStream(event.data);
    });

    session.on("signal:control", (event) => {
      let d = JSON.parse(event.data);
      if (d.id != USER_ID) {
        $("#" + d.id).removeClass(d.old);
        $("#" + d.id).addClass(d.new);
      }
    });

    session.on("signal:zoom", (event) => {
      let d = JSON.parse(event.data);
      $("#container video")
        .first()
        .css("transform", "scale(" + d.scale + ")");
    });

    session.on("signal:allow", (event) => {
      if (host) {
        let d = JSON.parse(event.data);
        fetchVisitorDetails(d.id, visitorType.request);
      }
    });

    session.on("signal:videoSwitched", (event) => {
      let d = JSON.parse(event.data);
      document.querySelector("#container video").srcObject =
        document.getElementsByName(d.name)[0].srcObject;
      document.querySelector("#container video").setAttribute("name", d.name);
      states["selected"] = d.name;
      if (states[d.name.replace("vid-", "")])
        $("video[name='" + d.name + "']").addClass("vsChanged");
      else $("video[name='" + d.name + "']").removeClass("vsChanged");
    });

    session.on("signal:muteUnmute", (event) => {
      let d = JSON.parse(event.data);
      if (USER_ID.split("-")[1] == d.id) publisher.publishAudio(d.publish);
    });

    session.on("signal:showAll", (event) => {
      let d = JSON.parse(event.data);
      if (host) {
        // Manage presenter
        if (presenter && d.id) {
          $("#" + d.id).hide();
        }
        else if (presenter && d.vid) {
          $("#" + d.vid).show();
        }
        return;
      }
      if (d.id) $("#thumbboxclick").click();
      else $(".close_thumbnillinner").click();
    });

    session.on("signal:vsChanged", (event) => {
      let d = JSON.parse(event.data);
      if (d.rotate) $("video[name='" + d.name + "']").addClass("vsChanged");
      else $("video[name='" + d.name + "']").removeClass("vsChanged");

      states[d.name.replace("vid-", "")] = d.rotate;
    });

    session.on("signal:states", (event) => {
      let d = JSON.parse(event.data);
      if (d.uid) {
        if (d.uid === USER_ID) states = d.states;
      } else states = d.states;
    });

    session.on('networkQualityLevelChanged', event => {
      if (event.connection.connectionId === session.connection.connectionId) {
        console.log("Now my network quality level is " + event.newValue + ". Before was " + event.oldValue);

        let clrs = ["dark-red", "red", "orange", "yellow", "green", "dark-green"];
        // $(".session-id").html("Network rating: " + event.newValue + "/5");
        // $(".session-id").show();
        // $(".session-id").css("background", clrs[event.newValue]);

      } else {
        console.log("Network quality level of connection " + event.connection.connectionId
          + " is " + event.newValue + ". Previous one was " + event.oldValue);

        // Do stuff

      }
    });


    getToken(SESSION_ID).then((token) => {
      session
        .connect(token, { clientData: USER_ID })
        .then(() => {
          startPublishing();
        })
        .catch((error) => {
          console.log(
            "There was an error connecting to the session:",
            error.code,
            error.message
          );
        });
    });
  }

  function reporting() {
    if (vs.length > 1) {
      join();
      setTimeout(() => {
        VideoDevice = vs[1];
        join();
      }, 5555);
    } else {
      showToast("Reporting option needs more than one camera sources.");
    }
  }

  function startPublishing() {
    const pub = OV.initPublisher(createStreamElement(USER_ID, isHost()), {
      audioSource: AudioDevice,
      videoSource: VideoDevice,
      publishAudio: true,
      publishVideo: true,
      resolution: resolution,
      frameRate: frameRate,
      insertMode: "APPEND",
      mirror: false,
      videoSimulcast: true
    });

    session.publish(pub).then(() => {
      publisher = pub;
      Loading.stop();
    });

    pub.on("videoElementCreated", function (event) {
      try {
        audioTest(event.element.srcObject);
        event.element["muted"] = true;

        event.element.setAttribute("name", `vid-${USER_ID}`);

        fetchVisitorDetails(USER_ID.split("-")[1], visitorType.participant);

        if (isHost()) $("#" + event.element.id).addClass("mainfullvideo ");
        else {
          $("#" + event.element.id).addClass("thumbvideo");
          $(".leave-option").show();
        }

        if (isHost()) {
          document.querySelector("#container video").srcObject =
            event.element.srcObject;
          document
            .querySelector("#container video")
            .setAttribute("name", `vid-${USER_ID}`);

          states["selected"] = `vid-${USER_ID}`;
          states[USER_ID] = true;

          setInterval(() => {
            sendMsg(JSON.stringify({ uid: false, states: states }), "states");
          }, 1000);

        }

        sendMsg(
          JSON.stringify({ name: `vid-${USER_ID}`, rotate: true }),
          "vsChanged"
        );
      } catch (e) {
        alert(e.message);
      }
    });
  }

  function getToken(mySessionId) {
    return createSession(mySessionId).then((sessionId) =>
      createToken(sessionId)
    );
  }

  function createSession(sessionId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/sessions",
        data: JSON.stringify({
          customSessionId: sessionId,
          recordingMode: "MANUAL",
        }),
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => resolve(response.id),
        error: (error) => {
          if (error.status === 409) {
            resolve(sessionId);
          } else {
            console.warn(
              "No connection to OpenVidu Server. This may be a certificate error at " +
              SERVER_URL
            );
            if (
              window.confirm(
                'No connection to OpenVidu Server. This may be a certificate error at "' +
                SERVER_URL +
                '"\n\nClick OK to navigate and accept it. ' +
                'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                SERVER_URL +
                '"'
              )
            ) {
              location.assign(SERVER_URL + "/accept-certificate");
            }
          }
        },
      });
    });
  }

  function createToken(sessionId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/tokens",
        data: JSON.stringify({ session: sessionId }),
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => resolve(response.token),
        error: (error) => reject(error),
      });
    });
  }

  function downloadFile(v) {
    window.open(v, '_blank');
    // const downloadLink = document.createElement('a');
    // downloadLink.href = v;
    // downloadLink.download = 'Recording.mp4'; // Optional: Set a custom filename
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink); // Clean up after download
  }

  function leaveSession() {
    try {
      Android.endMeeting();
    } catch (e) { }

    if (isHost()) {
      $(".loading-title").html("Redirecting, please wait.");

      // localRecorder.stop().then(r => {
      //   localRecorder.download();
      // });

      if (rId) {
        Loading.start();

        stopBroadcast().then(r=>{
          console.log("Broadcast stopped ",r);
        })

        stopRecording().then((r) =>
          getS3Link().then((v) => {
            let r = rId ? true : false;
            rId = undefined;

            downloadFile(v);
            if (recordLive) {
              endNotification(v, r);
            } else stopLoadingAndRedirect();
          })
        );
      } else redirect();
      killSession(SESSION_ID).then((r) => console.log("Session ended: " + r));
    } else {
      if (session) {
        session.disconnect();
      }
      const d = new Date();
      location.replace("https://wiseup.club/?cache=" + d.getTime());
    }
  }

  function killSession(id) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "DELETE",
        url: SERVER_URL + "/api/sessions/" + id,
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => resolve(true),
        error: (error) => reject(false),
      });
    });
  }

  function startNotification() {
    $.ajax({
      type: "POST",
      url: WISEUP_URL + "requests.php?f=broadcast&s=start_meeting_broadcast",
      data: {
        user_id: ID,
        watchLink: `https://${location.hostname}/conference/html/watch.html?id=${SESSION_ID}&join=1`,
      },
      dataType: "JSON",
      success: function (response) {
        if (response.status == 200) {
          PostId = response.postId;
          console.log("broadcast successfully started.");
        } else {
          console.log(response.message);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  function stopLoadingAndRedirect() {
    $(".loading-title").html("Loading...");
    Loading.stop();
    redirect();
  }

  function redirect() {
    const d = new Date();
    location.replace("https://wiseup.club/?cache=" + d.getTime());
  }

  function endNotification(v, r) {
    $.ajax({
      type: "POST",
      url: WISEUP_URL + "requests.php?f=broadcast&s=end_meeting_broadcast",
      data: { user_id: ID, PostId: PostId, filePath: v, record: r },
      dataType: "JSON",
      success: function (response) {
        if (response.status == 200) {
          console.log("broadcast end successfully.");
        } else {
          console.log(response.message);
        }
        stopLoadingAndRedirect();
      },
      error: (error) => {
        console.log(error);
        stopLoadingAndRedirect();
      },
    });
  }

  function startRecording() {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/recordings/start",
        data: JSON.stringify({
          session: SESSION_ID,
          // outputMode: "INDIVIDUAL",
          // "recordingLayout": "BEST_FIT",
          outputMode: "COMPOSED",
          recordingLayout: "CUSTOM",
          resolution: resolution,
          frameRate: frameRate,
        }),
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => {
          resolve(response.id);
        },
        error: (error) => {
          resolve(false);
          console.log(error);
        },
      });
    });
  }

  function stopRecording() {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/recordings/stop/" + rId,
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => {
          resolve(response);
        },
        error: (error) => {
          resolve(false);
          console.log(error);
        },
      });
    });
  }

  function startBroadcast() {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/broadcast/start",
        data: JSON.stringify({
          session: SESSION_ID,
          recordingLayout: "CUSTOM",
          resolution: resolution,
          frameRate: frameRate,
          "broadcastUrl": "rtmp://otteducation.livebox.co.in:1935/wiseuptv/live?psk=stream",
          // "broadcastUrl": "rtmp://wiseupconnect.wiseup.club/live/"+SESSION_ID,
          "hasAudio": true,
          "shmSize": 1006870912,
        }),
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => {
          resolve(response.id);
        },
        error: (error) => {
          resolve(false);
          console.log(error);
        },
      });
    });
  }

  function stopBroadcast() {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: SERVER_URL + "/api/broadcast/stop",
        data: JSON.stringify({
          session: SESSION_ID,
        }),
        headers: {
          Authorization: "Basic " + btoa("OPENVIDUAPP:" + SECRET),
          "Content-Type": "application/json",
        },
        success: (response) => {
          resolve(response.id);
        },
        error: (error) => {
          resolve(false);
          console.log(error);
        },
      });
    });
  }

  function getS3Link() {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        url: API_URL + "/uploadToS3/?id=" + SESSION_ID,
        dataType: "JSON",
        success: function (response) {
          resolve(response.path);
        },
        error: (error) => {
          console.log(error);
        },
      });
    });
  }

  function fetchVisitorDetails(id, type) {
    $.ajax({
      type: "POST",
      url: WISEUP_URL + "requests.php?f=broadcast&s=fetch_visitor_details",
      data: { visitor_id: id },
      dataType: "JSON",
      success: function (response) {
        if (response.status == 200) {
          if (visitorType.request == type) {
            $(".users-list").append(`<li class="onlineuser u_chat02">
                    <div class="u_chat ">
                        <div class="u_chatuser">
                            <img src="${response.user_image}" alt="">
                        </div>
                        <div class="u_chat_text "><h4 class="text-truncate">${response.user_name}</h4></div>                    
                    </div>
                    <div class="u_chat_buttons">
                            <button id="${id}" class="u_allow">Allow </button>
                            <butto id="r-${id}" class="u_reject">Reject  </button>
                        </div>
                        
                </li>`);
            $(".u_chatuser img").attr("src", response.user_image);
            $(".text-truncate").html(response.user_name);
            $(".u_allow").attr("id", id);

            $(".user-count").html($(".users-list li").length);
          } else if (visitorType.participant == type) {
            updateParticipantList(response.user_name, id);
          }
        } else {
          console.log(response.message);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  $(document).on("click", ".u_allow", function () {
    sendMsg(JSON.stringify({ id: $(this).attr("id") }), "allowed");
    $(this).closest("li").remove();
    $(".user-count").html($(".users-list li").length);
    $(".closechat").click();
  });

  $(document).on("click", ".u_reject", function () {
    let id = $(this).attr("id").replace("r-", "");
    sendMsg(JSON.stringify({ id: id }), "rejected");
    $(this).closest("li").remove();
    $(".user-count").html($(".users-list li").length);
    $(".closechat").click();
  });
});
