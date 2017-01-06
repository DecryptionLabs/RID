var api = "http://localhost:4567/api/ask?q=";
var player;
var recognition = new webkitSpeechRecognition();
var client = new WebTorrent();

client.on('error', function(err) {
    console.error('ERROR: ' + err.message)
})


/** Voice Recognition **/

recognition.continuous = true;

recognition.lang = "en-GB";

recognition.onresult = function(event) {



    var inputString = event.results['0']['0'].transcript;

    push_statment(inputString);

    if (inputString != null && typeof inputString != undefined) {
        if (player && inputString.indexOf('pause') != -1) {
            pause_song();
        } else if (player && inputString.toUpperCase().trim() == 'PLAY') {
            play_song();
        } else if (player && inputString.indexOf('stop') != -1) {
            stop_song();
        } else {
            get_resp(api + inputString, inputString);
        }
    } else {
        console.log('testing');
    }

    if (player) {
        if (player.getPlayerState() == 1 || player.getPlayerState() == 2 || player.getPlayerState() == 0) {
            // document.getElementById("resp_text").className = "top";
            console.log('added top');
        }
    }

    annyang.start({
        autoRestart: true,
        continuous: false
    });

    console.log(inputString);
};

function hasExtension(inputID, exts) {
    var fileName = inputID;
    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
}


function load_torrent(url) {
	push_movie_response();

    console.log('torrent working');
    client.add(url, function(torrent){

        torrent.files.forEach(function(file) {

            if (hasExtension(file.name, ['.mkv', '.mp4', '.mov', '.avi'])){
                console.log(file.name);
                file.appendTo('#movie');
                file.getBlobURL(function(err, url) {
                    if (err) return log(err.message)
                })
            }
            
        })
    });
}

var delay = (function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

recognition.onerror = function(event) {
    console.log(event.error);

    if (player) {
        if (player.getPlayerState() == 1 || player.getPlayerState() == 2 || player.getPlayerState() == 0) {}
    }
    if (event.error != 'aborted') {
        annyang.start({
            autoRestart: true,
            continuous: false
        });
    }
};

/** Response Helper Functions **/

function speak_response(msg) {
    var worte = new SpeechSynthesisUtterance(msg);
    worte.lang = "en-UK";
    window.speechSynthesis.speak(worte);
}

function display_response(msg) {
    push_response(msg);
}

function display_greeting() {
    var dt = new Date().getHours();

    var response;

    if (dt >= 0 && dt <= 11) {
        response = 'Good Morning!';
    } else if (dt >= 12 && dt <= 17) {
        response = 'Good Afternoon!';
    } else {
        response = 'Good Evening!';
    }

    delay(function() {
        push_response(response);
    }, 600);
}

function observe_speech() {

    speak_response('Yes?');

    annyang.abort();

    delay(function() {
        pause_song();
        recognition.start();
    }, 600);


}

function log_speech(speech) {

    console.log(speech);

    push_statment(speech);

    if (player && speech.indexOf('pause') != -1) {
        pause_song();
    } else if (player && speech.toUpperCase().trim() == 'PLAY') {
        play_song();
    } else if (player && speech.indexOf('stop') != -1) {
        stop_song();
    } else {
        get_resp(api + speech, speech);
    }

}

function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
}


function get_resp(api, q) {
    var xmlhttp;

    display_response('Just a second...');

    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            $(".loading").remove();

            if (!isURL(xmlhttp.responseText)) {
                if (xmlhttp.responseText.length <= 0 || xmlhttp.responseText == 'error') {
                    display_response("I Don't Understand '" + q + "'");
                    speak_response("I Don't Understand '" + q + "'");
                } else {
                    display_response(xmlhttp.responseText);
                    speak_response(xmlhttp.responseText);
                }

                play_song();
            } else {
            	if (xmlhttp.responseText.indexOf('torrent') != -1){
                    load_torrent(xmlhttp.responseText)
                } else {
                    var id = xmlhttp.responseText.replace('https://www.youtube.com/watch?v=', '');
                    console.log('id =' + id);
                    play_yt(id);                
                }


            }

        } else {
            console.log('Failed To Get Response');
        }
    };

    if (api.indexOf('+') != -1) {
        api = api.replace('+', 'plus');
    } else if (api.indexOf('÷') != -1) {
        api = api.replace('÷', 'divided by');
    } else if (api.indexOf('√') != -1) {
        api = api.replace('√', 'square root of');
    }


    xmlhttp.open("GET", api, true);
    xmlhttp.send();
}

function pause_song() {
    if (player) {
        player.pauseVideo();
    }
}

function play_song() {
    if (player) {
        player.playVideo();
    }
}

function stop_song() {
    if (player) {
        player.stopVideo();
    }
}

function onPlayerStateChange(event) {
    if (event.data == 0) {
        player.nextVideo();
    } else if (event.data == 1) {
        console.log(player.getPlaylist());
    }
}


function play_yt(id) {

    push_yt_response(id);

    stop_song();

    if (player) {
        player.stopVideo();
        var frame = document.getElementById("player_container");
        frame.innerHTML = '<div id="player"></div>';
    }

    player = new YT.Player('player' + id, {
        height: '300',
        width: '600',
        videoId: id,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}