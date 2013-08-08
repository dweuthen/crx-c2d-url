function getClickHandler() {
    return function(info, tab) {
        window.open("popup.html?number=" + escape(info.selectionText), 'Dial ' + info.selectionText , 'scrollbars=0,toolbar=0,location=0,resizable=0,status=0,width= 270,height=225,top=200,left=200');
    };
};

chrome.contextMenus.create({
  "title" : "Dial \"%s\"...",
  "type" : "normal",
  "contexts" : ["selection"],
  "onclick" : getClickHandler()
});
