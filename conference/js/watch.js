$(function () {
    if (ID && ID.length > 7) {
        SESSION_ID = ID;
        if (join == 1) {
            $("#join").show();
        }
    } else stop();

    Loading.start();
    TOKEN = 'wss://' + location.hostname + ':4443/openvidu/?sessionId=' + SESSION_ID + '&secret=' + SECRET;

    OV = new OpenVidu();
    session = OV.initSession();

    session.on('streamCreated', event => {
        let u = event.stream.connection.data == 'IP-CAM' ? 'IP-CAM' : JSON.parse(event.stream.connection.data).clientData,
            s = session.subscribe(event.stream, createStreamElement(u, false));

        s.on('videoElementCreated', event => {
            // updateStreamName(u);
            // setupBlocks();
        });
    });

    session.on('streamDestroyed', event => {
        let u = event.stream.connection.data == 'IP-CAM' ? 'IP-CAM' : JSON.parse(event.stream.connection.data).clientData;
        $('#str-' + u).remove();
        // setupBlocks();
    });

    session.on('signal:switch', (event) => {
        // setLayout(event.data);
        // setupBlocks();
        $("#" + event.data).prependTo('#container');
    });

    session.on('signal:select', (event) => {
        selectStream(event.data);
    });

    session.on('signal:control', (event) => {
        let d = JSON.parse(event.data);
        $('#' + d.id).removeClass(d.old);
        $('#' + d.id).addClass(d.new);
    });

    session.on('signal:zoom', (event) => {
        let d = JSON.parse(event.data);
        $('#str-' + d.id + ' video').css('transform', 'scale(' + d.scale + ')');
    });

    session.on('signal:allowed', (event) => {
        let d = JSON.parse(event.data);
        if (VISITOR_ID == d.id) {
            location.replace("https://wiseupconnect.wiseup.club/conference/?id=" + ID + "&visitor_id=" + VISITOR_ID);
        }
    });

    session.on('signal:rejected', (event) => {
        let d = JSON.parse(event.data);
        if (VISITOR_ID == d.id) {
            $("#join").html("Join");
            $("#join").prop("disabled", false);
        }
    });

    session.connect(TOKEN)
        .then(() => {
            console.log('Session connected');
            $('.hide').show();
            Loading.stop();
        }).catch(error => { console.error(error) });
});

function leave() {
    if (session) session.disconnect();
    close();
}

function setupBlocks() {
    let c = 0;
    $("#container .usr-str").each(function () {
        c++;
        let l = $("#container .usr-str").length;
        switch (prevLayout) {
            case "AVM":
                let w = (l == 2 || l == 4 || (l == 3 && c < 3) || (l == 5 && c > 3) || (l == 8 && c > 6)) ? "50%" : (((l == 7 || l == 8) && c <= 6) || l == 9 || l == 5 || l == 6) ? "33%" : "100%";
                let h = (l < 3) ? "100vh" : (l > 2 && l < 7) ? "50vh" : "33vh";
                $(this).css("width", w);
                $(this).css("height", h);
                break;
            case "SVM":
                $(this).attr('style', 'width:100% !important');
                return;
            case "HGM":
                if (c == 1 || c == 2) {
                    $(this).css("width", "50%");
                    $(this).css("height", "100vh");
                } else return;
                break;
            case "PNP":
                if (c == 1) $(this).attr('style', 'width:100% !important; height:100vh !important;');
                if (c == 2) {
                    $(this).css('height', 'unset');
                    $(this).firstChild().attr('style', 'height: unset !important; object-fit: contain !important; margin-top:27% !important;');
                    return;
                }
                break;
            case "SPM":
                if (c == 1) $(this).attr('style', 'width:75% !important; height:75vh !important;');
                else $(this).attr('style', 'width:25% !important;');
                break;
            default: break;
        }
    });

    $("#container .usr-str video").each(function () {
        let e = document.getElementById($(this).attr('id'));
        e.setAttribute('playsinline', 'playsinline');
    });
}

$("#join").click(function () {
    if (session) {
        sendMsg(JSON.stringify({ id: VISITOR_ID }), 'allow');
        $(this).html("Request Sent");
        $(this).prop("disabled", true);
    }
});

$("#leave").click(function(){
    location.replace(WISEUP_URL);
});