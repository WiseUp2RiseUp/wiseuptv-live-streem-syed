$(function () {

    getAllDevices();

    if (ID && ID.length > 7) {
        SESSION_ID = ID;
        Join.join();
    } else location.replace(WISEUP_URL);

    $(document).on('click', '.usr-mic', function () {
        let id = $(this).attr('id');
        if (id.replace('mic-', '') != USER_ID) {
            showToast('You can only control your own stream.');
            return;
        }
        if ($(this).hasClass('fa-microphone')) {
            $(this).removeClass('fa-microphone');
            $(this).addClass('fa-microphone-slash');
            if (publisher) publisher.publishAudio(false);
            sendMsg(JSON.stringify({ id: id, old: 'fa-microphone', new: 'fa-microphone-slash' }), 'control');
        } else {
            $(this).removeClass('fa-microphone-slash');
            $(this).addClass('fa-microphone')
            if (publisher) publisher.publishAudio(true);
            sendMsg(JSON.stringify({ id: id, old: 'fa-microphone-slash', new: 'fa-microphone' }), 'control');
        }
    });

    $(document).on('click', '.usr-cam', function () {
        let id = $(this).attr('id');
        if (id.replace('cam-', '') != USER_ID) {
            showToast('You can only control your own stream.');
            return;
        };
        if ($(this).hasClass('fa-video')) {
            $(this).removeClass('fa-video');
            $(this).addClass('fa-video-slash');
            if (publisher) publisher.publishVideo(false);
            sendMsg(JSON.stringify({ id: id, old: 'fa-video', new: 'fa-video-slash' }), 'control');
        } else {
            $(this).removeClass('fa-video-slash');
            $(this).addClass('fa-video');
            if (publisher) publisher.publishVideo(true);
            sendMsg(JSON.stringify({ id: id, old: 'fa-video-slash', new: 'fa-video' }), 'control');
        }
    });

    // $(document).on('click', '.sel-usr', function () {
    //     let id = $(this).html();
    //     sendMsg(id, 'select');
    //     selectStream(id);
    // });

    $(document).on('click', '.vid-src', function () {
        let id = $(this).attr('id');
        if (VideoDevice == id) return;

        VideoDevice = id;
        if (publisher) changeStream();
    });

    $('#create').click(function () {
        window.open('/conference', '_blank');
    });

    $('#leave').click(leaveSession);

    $('#link').click(function () {
        $('.link').html('https://' + location.hostname + '/conference/?id=' + SESSION_ID);
        navigator.clipboard.writeText($('.link').html());
    });

    $('#ipcam').click(function () {
        window.open('/conference/html/ipcam.html?id=' + SESSION_ID, '_blank');
    });

    $('#watch').click(function () {
        window.open('/conference/html/watch.html?id=' + SESSION_ID, '_blank');
    });

    $(window).on('beforeunload', function () {
        leaveSession();
    });

    function leaveSession() {
        // killSession(SESSION_ID).then(r => console.log('Session ended: ' + r));
        // publisher = undefined;
        if (session) {
            session.disconnect();
        }
        location.replace('https://wiseup.club');
    }

    function killSession(id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: SERVER_URL + "/api/sessions/" + id,
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + SECRET),
                    "Content-Type": "application/json"
                },
                success: response => resolve(true),
                error: error => reject(false)
            });
        });
    }
});