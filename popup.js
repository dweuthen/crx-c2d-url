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

function doRefreshDisplay() {
    var urlDisplay = buildUrl(localStorage["urlDisplay"]);
    var displayRefresh = localStorage["displayRefresh"];
    
    if (urlDisplay) {
        var xhr = new XMLHttpRequest()

        // Initial request of display
        xhr.open('GET', urlDisplay, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
           if (this.status == 200) {
               var img = document.getElementById("phonedisplay")
               img.onload = function(e) {
                   resizeWindow(img.width, img.height);
                   window.URL.revokeObjectURL(img.src); // Clean up after yourself.
               };
               img.src = window.URL.createObjectURL(xhr.response);
           } else {
               setStatus("An error occured while retrieving display :<br/>" + req.responseText, 5000);
           }
        };
        xhr.send();

        // Refresh display in given interval 
        setInterval(function () { 
            xhr.open("GET",urlDisplay, true);
            xhr.send();
        }, displayRefresh);
    } else {
        document.getElementById("display").innerHTML = 'No display URL configured.';
    }
}


// Send credential if authentication is required 
chrome.webRequest.onAuthRequired.addListener(
    function() { return {authCredentials: {username: localStorage["phoneUsername"], password: localStorage["phonePassword"]}} }, 
    {urls: ["<all_urls>"]}, 
    ['blocking']
);

// Bind event listener for hangup and dial button and enter key
document.querySelector('#hangup').addEventListener('click', doHangup);
document.querySelector('#dial').addEventListener('click', doCall);
document.querySelector('#number').addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
        doCall();
        event.preventDefault();
    }
}, false);

// If there is a query string parameter "number" try to normalize that number
try {
    var number = unescape(getQuerystring('number'));
    if (number) {
        document.getElementById("number").value = normalizePhoneNumber(number);   
    }
} catch(err) {
    alert(err)
}

// Show display
doRefreshDisplay();
