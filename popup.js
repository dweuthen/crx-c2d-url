function getQuerystring(key, default_) {
    if (default_==null) default_=""; 
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs == null)
        return default_;
    else
        return qs[1];
}

function normalizePhoneNumber(number) {
    // Strip "(0)" from number. We pretend pretend this only occurs when 
    // number has also an international prefix.
    number = number.replace(/\(0\)/g,"");

    // Strip some special characters that do not have a real meaning.
    number = number.replace(/(\s|\,|\.|\(|\)|\-)/g,"");

    // Replace the plus sign with the configured international prefix
    number = number.replace("+",localStorage["prefixInternational"]);
  
    // Prepend long distance prefix
    number = localStorage["prefixLongDistance"] + number;
    return number;
}

function buildUrl(url, number) {
    var options = ["phoneUsername","phonePassword","phoneAddress"];
    var len = options.length;
    for(var i = 0; i < len; i++) {
        if (localStorage[options[i]]) {
            url = url.replace("$" + options[i], localStorage[options[i]]);
        }
    }
  
    if (number) {
        url = url.replace("$number", number);
    }
    return url;
}

function doHangup() {
    var req = new XMLHttpRequest();
    var urlHangup = buildUrl(localStorage["urlHangup"]);
 
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            if (req.status == 200) {
                setStatus("Hanging up.", 3000);
                
            } else {
                setStatus("An error occured while hanging up :<br/>" + req.responseText, 5000);
            }
        }
    };
    req.open("GET", urlHangup, true);
    req.send(null);
}

function doCall() {
    var req = new XMLHttpRequest();
    var number = normalizePhoneNumber(document.getElementById("number").value);
    var urlDial = buildUrl(localStorage["urlDial"],number);
    
    req.onreadystatechange = function() {
        if (req.readyState === 4){
            if (req.status == 200) {
                setStatus("Dialing " + number + "...", 3000);
                
            } else {
                setStatus("An error occured while dialing " + number + ":<br/>" + req.responseText, 5000);
            }
        }
    };
    req.open("GET", urlDial, true);
    req.send(null);
}
function setStatus(message, timeout) {
    var status = document.getElementById("status");
    status.innerHTML = message;
    setTimeout(function() {
        status.innerHTML = "";
    }, timeout);
}

function resizeWindow(width, height) {
    document.getElementById("status").style.width = width + 10;
    document.getElementById("number").style.width = width;
    window.resizeTo(width + 40, height + 130); 
}

function doRefreshDisplay() {
    var urlDisplay = buildUrl(localStorage["urlDisplay"]);
    var displayRefresh = localStorage["displayRefresh"];
 
    if (urlDisplay) {
       document.getElementById("display").innerHTML = '<img name="phonedisplay" src="' + urlDisplay + '" />';
       var phoneDisplay = new Image();
       phoneDisplay.src = urlDisplay;
       document.phonedisplay.src = phoneDisplay.src;
       phoneDisplay.onload = resizeWindow(document.phonedisplay.width, document.phonedisplay.height);
      
       setInterval(function () { 
                       phoneDisplay = new Image(); 
                       phoneDisplay.src = urlDisplay; 
                       document.phonedisplay.src = phoneDisplay.src;
                       phoneDisplay.onload = resizeWindow(document.phonedisplay.width, document.phonedisplay.height);
                   }, displayRefresh);
    } else {
         document.getElementById("display").innerHTML = 'Not available.';
    }
}


doRefreshDisplay();
document.querySelector('#dial').addEventListener('click', doCall);
document.querySelector('#number').addEventListener('keypress', function(event) {
    if (event.keyCode === 13)
    {
        doCall();
        event.preventDefault();
    }
}, false );
document.querySelector('#hangup').addEventListener('click', doHangup);

try {
    var number = unescape(getQuerystring('number'));
    if (number) {
        document.getElementById("number").value = normalizePhoneNumber(number);   
    }
} catch(err) {
    alert(err)
}

