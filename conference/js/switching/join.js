let Join = {
  join: function join() {
    Loading.start();
    // if (isHost()) {
    //     SESSION_ID = 'S876968' + Math.floor(Math.random() * 10000);
    //     USER_ID = 'Host' + USER_ID;
    // }

    // let WSS_URL = "wss://livestream.wiseup.club/openvidu";
    let WSS_URL = "wss://" + location.hostname + ":4443/openvidu";

    TOKEN = WSS_URL + "/?sessionId=" + SESSION_ID + "&secret=" + SECRET;

    OV = new OpenVidu();
    session = OV.initSession();

    session.on("streamCreated", (event) => {
      let u =
        event.stream.connection.data == "IP-CAM"
          ? "IP-CAM"
          : JSON.parse(event.stream.connection.data).clientData;
      let s = session.subscribe(
        event.stream,
        createStreamElement(u, isHost(u))
      );
      s.on("videoElementCreated", (event) => {
        event.element.setAttribute("name", `vid-${u}`);

        if (isHost(u)) {
          $("#" + event.element.id).addClass("mainfullvideo");
          document.querySelector("#container video").srcObject =
            event.element.srcObject;
        } else $("#" + event.element.id).addClass("thumbvideo");
      });
    });

    session.on("streamDestroyed", (event) => {
      let u =
        event.stream.connection.data == "IP-CAM"
          ? "IP-CAM"
          : JSON.parse(event.stream.connection.data).clientData;
      $("#video-" + u).remove();
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
        fetchVisitorDetails(d.id);
      }
    });

    session.on("signal:videoSwitched", (event) => {
      let d = JSON.parse(event.data);
      document.querySelector("#container video").srcObject =
        document.getElementsByName(d.name)[0].srcObject;
    });

    session
      .connect(TOKEN)
      .then(() => {
        console.log("Session connected");
        Loading.stop();
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
