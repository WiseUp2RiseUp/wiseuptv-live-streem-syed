let url = new URL(window.location.href);
let SESSION_ID = url.searchParams.get("sessionId");

let SERVER_URL = "wss://livestream.wiseup.club/openvidu";
let SECRET = "WUE-2280";

// let SERVER_URL = "wss://" + location.hostname + ":4443/openvidu";
// let SECRET = "MY_SECRET";

let TOKEN =
  SERVER_URL +
  "?sessionId=" +
  SESSION_ID +
  "&secret=" +
  SECRET +
  "&recorder=true";
let remoteStreamIds = [];
let allMode = false;
let states = new Map();

$(function () {
  let OV = new OpenVidu();
  let session = OV.initSession();

  session.on("conncetionCreated", (e) => {
    sendMsg(JSON.stringify({}),"statesData");
  });

  session.on("streamCreated", (event) => {
    let u =
        event.stream.connection.data == "IP-CAM"
          ? "IP-CAM"
          : JSON.parse(event.stream.connection.data).clientData,
      s = session.subscribe(event.stream, createStreamElement(u));
    s.on("videoElementCreated", (event) => {
      if (states.get("selected") === "vid-" + u) {
        event.element.setAttribute("name", `vid-${u}`);
        event.element.parent().prependTo("#container");
      }
      if (states.get(u))
        $("video[name='" + `vid-${u}` + "']").addClass("vsChanged");
      else $("video[name='" + `vid-${u}` + "']").removeClass("vsChanged");
      if (allMode) setVideoWidth();
    });
  });

  session.on("streamDestroyed", (event) => {
    let u =
      event.stream.connection.data == "IP-CAM"
        ? "IP-CAM"
        : JSON.parse(event.stream.connection.data).clientData;
    $("#str-" + u).remove();
    if (allMode) setVideoWidth();
    if (isHost(u)) {
      session.disconnect();
    }
  });

  session.on("signal:switch", (event) => {
    $("#" + event.data).prependTo("#container");
  });

  session.on("signal:videoSwitched", (event) => {
    let d = JSON.parse(event.data);
    states.set("selected", d.name);
    let elId = document.getElementsByName(d.name)[0].id;
    $("#" + elId)
      .parent()
      .prependTo("#container");
    if (states.get(d.name.replace("vid-", "")))
      $("video[name='" + d.name + "']").addClass("vsChanged");
    else $("video[name='" + d.name + "']").removeClass("vsChanged");
  });

  session.on("signal:vsChanged", (event) => {
    let d = JSON.parse(event.data);
    if (d.rotate) $("video[name='" + d.name + "']").addClass("vsChanged");
    else $("video[name='" + d.name + "']").removeClass("vsChanged");

    states.set(d.name.replace("vid-", ""), d.rotate);
  });

  session.on("signal:states", (event) => {
    let d = JSON.parse(event.data);
    if (!d.uid) states = d.states;
  });

  session.on("signal:select", (event) => {
    selectStream(event.data);
  });

  session.on("signal:control", (event) => {
    let d = JSON.parse(event.data);
    $("#" + d.id).removeClass(d.old);
    $("#" + d.id).addClass(d.new);
  });

  session.on("signal:zoom", (event) => {
    let d = JSON.parse(event.data);
    $("#container video").each(function () {
      if ($(this).attr("id").includes(event.from.connectionId)) {
        $(this).css("transform", "scale(" + d.scale + ")");
      }
    });
  });

  session.on("signal:showAll", (event) => {
    let d = JSON.parse(event.data);
    if (d.id) {
      $("#container").removeClass("SVM");
      allMode = true;
      setVideoWidth();
    } else {
      $("#container").addClass("SVM");
      allMode = false;
    }
  });

  session.on("signal:newsUpdate", (event) => {
    let d = JSON.parse(event.data);
    if (d) {
      $("#headline1").html(d.headline1);
      $("#headline2").html(d.headline2);
      $("#headline3").html(d.headline3);
      $("#headline4").html(d.headline4);
      $("#headline5").html(d.headline5);
    }
  });

  session.on("signal:boardUpdate", (event) => {
    let d = JSON.parse(event.data);
    if (d) {
      $("#nameTeamA").html(d.teamA.name);
      $("#scoreTeamA").html(d.teamA.score);
      $("#foulsTeamA").html(d.teamA.fouls);
      $("#timeoutTeamA").html(d.teamA.timeout);

      $("#nameTeamB").html(d.teamB.name);
      $("#scoreTeamB").html(d.teamB.score);
      $("#foulsTeamB").html(d.teamB.fouls);
      $("#timeoutTeamB").html(d.teamB.timeout);
    }
  });

  function setVideoWidth() {
    let c = 0;
    $("#container > div").each(function () {
      c++;
      let l = $("#container > div").length;

      ///Version 1.3
      let w =
        l == 2 ||
        l == 4 ||
        (l == 3 && c < 3) ||
        (l == 5 && c > 3) ||
        (l == 8 && c > 6)
          ? "50%"
          : ((l == 7 || l == 8) && c <= 6) || l == 9 || l == 5 || l == 6
          ? "33%"
          : "100%";
      let h = l < 3 ? "100%" : l > 2 && l < 7 ? "50%" : "33%";
      $(this).css({ width: w, height: h, float: "left" });
    });

    setTimeout(() => {
      playAll();
    }, 500);
  }

  function sendMsg(m, t) {
    if (session) {
      session
        .signal({
          data: m,
          to: [],
          type: t,
        })
        .then(() => {
          console.log("Message successfully sent");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  session
    .connect(TOKEN)
    .then(() => {
      console.log("Recorder participant connected");
    })
    .catch((error) => {
      console.error(error);
    });
});
