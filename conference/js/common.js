try{
let screenLock;
navigator.wakeLock.request('screen').then(lock => {
  screenLock = lock;
});
// Or you can make an await call
// let screenLock = await navigator.wakeLock.request('screen');
}catch(e){
  alert("Active Screen Permission denied");
}

function getAllDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
    return;
  }

  if (window.navigator.platform.includes("Linux")) {
    // $(".Audiotesting").hide();
    navigator.mediaDevices
      .enumerateDevices()
      .then((dinfo) => {
        gotDevices(dinfo);
      })
      .catch(errorCallback);

    function errorCallback(e) {
      alert(e.message);
      console.log(e.message);
    }
  } else {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        navigator.mediaDevices
          .enumerateDevices()
          .then((dinfo) => {
            gotDevices(dinfo);
          })
          .catch(errorCallback);

        function errorCallback(e) {
          alert(e.message);
          console.log(e.message);
        }
      })
      .catch((e) => {
        alert(e.message);
        console.log(e);
      });
  }
}

function audioTest(mediaStream) {
  try {
    if (mediaStream) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(mediaStream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);
      javascriptNode.onaudioprocess = function () {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        var average = values / length;

        colorPids(average);
      };
    }
  } catch (e) {
    alert(e.message);
  }
}

function colorPids(vol) {
  try {
    let all_pids = $(".pid");
    let amout_of_pids = Math.round(vol / 5);
    let elem_range = all_pids.slice(0, amout_of_pids);
    for (var i = 0; i < all_pids.length; i++) {
      all_pids[i].style.backgroundColor = "#57EAB2";
    }
    for (var i = 0; i < elem_range.length; i++) {
      elem_range[i].style.backgroundColor = "#092675";
    }
  } catch (error) {
    alert(e.message);
  }
}

function gotDevices(deviceInfos) {
  let c = 1,
    m = 1,
    s = 1;
  for (let d of deviceInfos) {
    if (d.kind === "videoinput") {
      if (!VideoDevice) VideoDevice = d.deviceId;
      vs.push(d.deviceId);
      $("#video-sources").append(
        // `<option value='${d.deviceId}'>${d.label || "Camera " + c++}</option>`
        `<option value='${d.deviceId}'>${"Camera " + c++}</option>`
      );
    } else if (d.kind === "audioinput") {
      if (!VideoDevice) AudioDevice = d.deviceId;
      $("#audio-sources").append(
        `<option value='${d.deviceId}'>${"Mic " + m++}</option>`
        // `<option value='${d.deviceId}'>${d.label || "Mic " + m++}</option>`
      );
    } else if (d.kind === "audiooutput") {
      $("#speakers").append(
        // `<option value='${d.deviceId}'>${d.label || "Speaker " + m++}</option>`
        `<option value='${d.deviceId}'>${"Speaker " + s++}</option>`
      );
    }
  }
}

function changeStream() {
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        deviceId: AudioDevice,
      },
      video: {
        width: parseInt(resolution.split("x")[0]) || 1920,
        height: parseInt(resolution.split("x")[1]) || 1080,
        deviceId: VideoDevice,
      },
    })
    .then(function (stream) {
      let myTrack = stream.getVideoTracks()[0];
      publisher
        .replaceTrack(myTrack)
        .then(() => {
          console.log("New track has been published");
        })
        .catch((error) => console.error("Error replacing track", error));
    });
}

// Copy and share meeting link
$("#link").click(async function () {
  let val = "https://" + location.hostname + "/conference/?id=" + SESSION_ID; // $(".link").html();

  // For android only
  if (window.navigator.platform.includes("Linux")) {
    try {
      Android.shareLink(val);
    } catch (e) {
      copyToClipboard(val);
    }
  } else {
    copyToClipboard(val);
  }
});

function copyToClipboard(val) {
  try {
    navigator.clipboard
      .writeText(val)
      .then(() => {
        alert("successfully copied");
      })
      .catch(() => {
        alert("something went wrong while copy");
      });
  } catch (e) {
    console.log(e.message + " in #link click");
  }
}

$("select").change(function () {
  switch ($(this).attr("id")) {
    case "video-sources":
      VideoDevice = $(this).val();
      if (publisher) {
        changeStream();
        sendMsg(
          JSON.stringify({
            name: `vid-${USER_ID}`,
            rotate: vs.indexOf(VideoDevice) == 0 ? true : false,
          }),
          "vsChanged"
        );
      }
      break;
    case "audio-sources":
      AudioDevice = $(this).val();
      if (publisher) changeStream();
      break;
    case "resolutions":
      resolution = resolutions[$(this).val()];
      break;
    default:
      break;
  }
});

$(".frame-rate").change(function () {
  frameRate = framRates[$(this).val()];
});

$(document).on("click", "#smallVideos video", function () {
  if (!isHost()) return;
  let nm = $(this).attr("name");
  sendMsg(JSON.stringify({ name: nm }), "videoSwitched");
});

$(document).on("click", ".vid-src", function () {
  let id = $(this).attr("id");
  if (VideoDevice == id) return;

  VideoDevice = id;
  if (publisher) changeStream();
});

$(document).on("click", ".usr-str", function () {
  if (isHost()) {
    // if ($(this).parent().hasClass("AVM")) $("#SVM").click();
    // else $("#AVM").click();
    let id = $(this).attr("id");
    sendMsg(id, "switch");
  }
});

$(".btn-primary").click(function () {
  // let id = $(this).attr("id");
  // if (id == 'AVM') $('.p-list').addClass('hidden');
  // else $('.p-list').removeClass('hidden');
  // sendMsg(id, "switch");
  // setLayout(id);
});

$(document).on("click", ".aud-src", function () {
  let id = $(this).attr("id");
  if (AudioDevice == id) return;

  AudioDevice = id;
  if (publisher) changeStream();
});

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

function setLayout(l) {
  // $("#container").removeClass(prevLayout).addClass(l);
  // prevLayout = l;
}

function updateStreamName(u) {
  $(`#str-${u}`).append(`<div class='str-ctrl'>
                            <span id='nam-${u}'><strong>${u}</strong></span>
                            <span><i id='mic-${u}' class="fa fa-microphone usr-mic"></i></span>
                            <span><i id='cam-${u}' class="fa fa-video usr-cam"></i></span>
                            ${
                              isHost()
                                ? `<input type="range" class="form-range" min="1" max="5" step='0.01' value='1' id="z-${u}" oninput="zoomChange(this.value, this.id);">`
                                : ""
                            }
                        </div>`);
}

function updateParticipantList(u, id) {
  $("#participants").append(
    `<li class='sel-usr' id='${id}'><a class="dropdown-item" href="#">${id}</a><i class='fas fa-volume-up mute-party' style='margin:7px'></i></li>`
  );
}

$(document).on("click", ".sel-usr", function () {
  if ($(this).find("i").hasClass("fa-volume-up")) {
    $(this).find("i").removeClass("fa-volume-up");
    $(this).find("i").addClass("fa-volume-mute");
    sendMsg(
      JSON.stringify({ id: $(this).attr("id"), publish: false }),
      "muteUnmute"
    );
  } else {
    $(this).find("i").removeClass("fa-volume-mute");
    $(this).find("i").addClass("fa-volume-up");
    sendMsg(
      JSON.stringify({ id: $(this).attr("id"), publish: true }),
      "muteUnmute"
    );
  }
});

function createStreamElement(u, h) {
  // if (h) return "container";
  const id = `video-${u}`;
  $("#smallVideos").append(`<div class="thumb_box_in_box" id="${id}"></div>`);
  return id;
}

function showToast(msg) {
  $(".toast-body").html(msg || "");
  $(".toast").show();
  setTimeout(() => {
    $(".toast").hide();
  }, 3000);
}

function selectStream(id) {
  switch (prevLayout) {
    case "SVM":
    case "SPM":
      $("#str-" + id).prependTo("#container");
      break;
    case "PNP":
      $(".hst-usr").prependTo("#container");
      $("#str-" + id).prependTo("#container");
      break;
    case "HGM":
      $("#str-" + id).prependTo("#container");
      $(".hst-usr").prependTo("#container");
      break;
    default:
      break;
  }
}

function crtlChange(id, cls, nCls) {
  $("#" + id).removeClass(cls);
  $("#" + id).addClass(nCls);
}

function isHost(id) {
  if (id) return id.indexOf("Host") == 0;
  else return host;
}

function zoomChange(z) {
  sendMsg(JSON.stringify({ scale: z }), "zoom");
}
