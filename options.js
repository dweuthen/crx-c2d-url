// Saves options to localStorage.
function save_options() {
    var options = ["urlDial","urlHangup","urlDisplay","displayRefresh","phoneAddress","phoneUsername","phonePassword","prefixLongDistance","prefixInternational"];
  
    var len = options.length;
    for(var i = 0; i < len; i++) {
        if (document.getElementById(options[i]).value) {
            localStorage[options[i]] = document.getElementById(options[i]).value;
        } else {
            localStorage[options[i]] = "";
        }
    }

    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var options = ["urlDial","urlHangup","urlDisplay","displayRefresh","phoneAddress","phoneUsername","phonePassword","prefixLongDistance","prefixInternational"];

  var len = options.length;
  for(var i = 0; i < len; i++) {
      if (localStorage[options[i]]) {
          document.getElementById(options[i]).value = localStorage[options[i]];
      } else {
          document.getElementById(options[i]).value = "";
      }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
