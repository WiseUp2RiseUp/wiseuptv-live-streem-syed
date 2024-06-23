$(function () {
    function getSessions() {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: SERVER_URL + "/api/sessions",
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + SECRET),
                    "Content-Type": "application/json"
                },
                success: response => resolve(response),
                error: error => reject(error)
            });
        });
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
                success: response => resolve(response),
                error: error => reject(error)
            });
        });
    }

    function killConnection(id, con) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: SERVER_URL + `/api/sessions/${id}/connection/${con}`,
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + SECRET),
                    "Content-Type": "application/json"
                },
                success: response => resolve(response),
                error: error => reject(error)
            });
        });
    }

    function populateSessions() {
        getSessions().then(r => {
            $('.total-sessions').html(r.numberOfElements)
            $('.sessions-list').html('');
            for (let v of r.content) {
                let d = '', f = false, g = false;
                for (let u of v.connections.content) {
                    d += `<li class="list-group-item d-flex justify-content-between align-items-start">
          <div class="ms-2 me-auto">
          <div class="fw-bold">User ID - ${u.clientData.length > 1 ? JSON.parse(u.clientData).clientData : 'NA'}
            <span id='${v.sessionId}-${u.connectionId}' class="badge bg-danger rounded-pill kill-connection">Kill</span>  
          </div>
          Connected at: ${(new Date(u.createdAt).toString()).substr(4,17)}
        </div>
          </li>`;
                }
                $('.sessions-list').append(`<li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
          <div class="fw-bold">Session - ${v.sessionId}
            <span id='sw-${v.sessionId}' class="badge bg-success rounded-pill switch-session">Switch</span>  
            <span id='${v.sessionId}' class="badge bg-danger rounded-pill kill-session">Kill</span>  
          </div>
          Created at: ${(new Date(v.createdAt).toString()).substr(4,17)}
        </div>
        <span class="badge bg-primary rounded-pill participants">${v.connections.numberOfElements}</span>
        <ol class="list-group list-group-numbered session-detail" style='max-height:200px; overflow:scroll;display:none;'>${d}</ol>
      </li>`);
            }
        });
    }

    $(document).on('click', '.kill-session', function () {
        killSession($(this).attr('id')).then(r => {
            populateSessions();
        });
    });

    $(document).on('click', '.kill-connection', function () {
        killConnection(...$(this).attr('id').split('-')).then(r => {
            $(this).closest('li').remove();
            if ($('.session-detail li').length) $('.participants').html($('.session-detail li').length);
            else {
                $('.total-sessions').html(0)
                $('.sessions-list').html('');
            }
        });
    });

    $(document).on('click', '.participants', function () {
        $('.session-detail').hide();
        $(this).next().show();
    });

    $(document).on('click', '.switch-session', function () {
        let id = $(this).attr("id").replace("sw-","");
        SESSION_ID = id
        if(session) session.disconnect();
        $("#container").html("");
        Join.join();
    });

    $('.reload').click(function () {
        populateSessions();
    });

    $(".hide-show").click(function(){
        $("#active-sessions").toggle("slow");
    });

    populateSessions();
    setInterval(() => {
        populateSessions();
    }, 5000);
});