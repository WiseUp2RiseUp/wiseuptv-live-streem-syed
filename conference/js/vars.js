let params = new URL(window.location.href).searchParams;
let ID = params.get("id");
let join = params.get("join") || 0;

// let SERVER_URL = "https://livestream.wiseup.club/openvidu"; 
// let SECRET = "WUE-2280";

let SERVER_URL = "https://" + location.hostname + ":4443/openvidu";
let SECRET = "OV_WU";

let sessions = [
  "WiseUp-" + Math.floor(Math.random() * 10000),
  "cayman-sports",
  "front-stage",
  "bigger-picture",
  "345-business-spotlight",
];
let SESSION_ID = params.get("channel_id");
let TOKEN;

let OV,
  session,
  publisher,
  host = true;
let VideoDevice = undefined,
  AudioDevice = undefined;

let resolutions = {
    LD: "320x240",
    SD: "640x480",
    HD: "1280x720",
    FHD: "1920x1080",
    FK: "3840x2160",
  },
  resolution = resolutions.FHD;

let framRates = {
    low: 24,
    med: 30,
    high: 60,
    UH:120
  },
  frameRate = framRates.high;

let prevLayout = "AVM";
let rId;
let API_URL = "https://" + location.hostname + ":3001";
let WISEUP_URL = "https://wiseup.club/";
let VISITOR_ID = params.get("visitor_id") || 0;
let USER_ID = VISITOR_ID || ID || "U" + Math.floor(Math.random() * 10000);

let vs = [];
let states = new Map();
let visitorType = { request: 1, participant: 2 };

let socket,
  url = {
    conference: "https://wiseupconnect.wiseup.club/embed/layout/?sessionId=",
    live: "https://wiseupconnect.wiseup.club/streams/hls/",
    local: "https://wiseupconnect.wiseup.club/",
  };
data = {
  msgType: "message",
  live: "live.m3u8",
  local: ".m3u8",
};

let score = {
  teamA: {
    name: "TEAM-A",
    score: 0,
    fouls: 0,
    timeout: 0,
  },
  teamB: {
    name: "TEAM-B",
    score: 0,
    fouls: 0,
    timeout: 0,
  },
};

let news = {
  headline1: "Headline 1",
  headline2: "Headline 2",
  headline3: "Headline 3",
  headline4: "Headline 4",
  headline5: "Headline 5",
};

let advertising = false;
let recordLive = false;

let localRecorder;
let presenter = 0;
