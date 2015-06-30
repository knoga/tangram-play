function loadKeys(cm, configFile) {

    // Initialize array
    if (cm.suggestedKeys) {
        // Clean key list
        while (cm.suggestedKeys.length > 0) {
            cm.suggestedKeys.pop();
        }
    } else {
        cm.suggestedKeys = [];
    }

    // Load Json
    cm.suggestedKeys = JSON.parse(fetchHTTP(configFile))["keys"];

    //  Initialize tokens
    for (var i = 0; i < cm.suggestedKeys.length; i++) {
        cm.suggestedKeys[i].token = addToken(cm.suggestedKeys[i]);
    }
}

//  TODO:
//          -- Replace global scene by a local
//
function suggestKeys(cm) {
    var top = cm.getScrollInfo().top;

    // Erase previus keys
    if (cm.suggestedKeysMenu) {
        cm.suggestedKeysMenu.clear();
        cm.focus();
    }

    // Get line address
    cursor = cm.getCursor(true);
    var nline = cursor.line;
    var address = getKeyAddress(cm,nline);

    var presentKeys = [];

    if (scene) {
        var obj = getAddressSceneContent(scene,address);
        presentKeys = obj? Object.keys(obj) : [];
    }

    // Search for matches
    for (var i = 0; i < cm.suggestedKeys.length; i++) {
        if (cm.suggestedKeys[i].token(scene,cm,nline)) {

            var suggestedKeysList = [];

            if (cm.suggestedKeys[i].options) {
                Array.prototype.push.apply(suggestedKeysList, cm.suggestedKeys[i].options);
            }

            if (cm.suggestedKeys[i].source) {
                var obj = getAddressSceneContent(scene, cm.suggestedKeys[i].source);
                var keyFromSource = obj? Object.keys(obj) : [];
                Array.prototype.push.apply(suggestedKeysList, keyFromSource);
            }


            for (var j = suggestedKeysList.length-1; j >= 0; j--) {
                if (presentKeys.indexOf(suggestedKeysList[j]) > -1) {
                    suggestedKeysList.splice(j, 1);
                }
            }

            if (suggestedKeysList.length > 0) {
                addSuggestedKeysList(suggestedKeysList,cm,nline);
            }
            break;
        }
    }

    cm.focus();
    cm.scrollTo(null,top);
}

function addSuggestedKeysList( suggestedKeysList, cm, nLine ) {
    var options = {
        position: "top"
    }

    if (cm.suggestedKeysMenu) {
        cm.suggestedKeysMenu.clear();
        options.replace = cm.suggestedKeysMenu;
    }

    var node = makeSuggestedKeyMenu(suggestedKeysList, nLine);
    // cm.suggestedKeysMenu = cm.addPanel(node, options);
    cm.suggestedKeysMenu = cm.addLineWidget(nLine, node, {coverGutter: false, noHScroll: true});
    updateWidgets(cm);
}

function makeSuggestedKeyMenu(suggestedKeysList, nLine) {
    var node = document.createElement("div");
    node.className = "cm-suggested-keys-menu";

    var widget, label;

    var close = node.appendChild(document.createElement("a"));
    close.className =  "cm-suggested-keys-menu-remove";
    close.textContent = "✖";

    CodeMirror.on(close, "click", function() {
        editor.suggestedKeysMenu.clear();
    });

    for (var i = 0; i < suggestedKeysList.length; i++) {
        var btn = document.createElement('button');
        var text = document.createTextNode(suggestedKeysList[i]);
        btn.value = nLine;
        btn.className = 'cm-suggested-keys-menu-btn';
        btn.setAttribute('onclick', 'addKey(this)');
        btn.appendChild(text);
        node.appendChild(btn);
    }

    return node;
}

//  TODO:
//          -- Replace global editor by local
//
function addKey(div) {
    editor.suggestedKeysMenu.clear();

    var tabs = getLineInd( editor, parseInt(div.value) )+1;
    var text = '\n';
    for (var i = 0; i < tabs; i++) {
        text += Array(editor.getOption("indentUnit") + 1).join(" ");
    }
    text += div.innerText+": ";

    var doc = editor.getDoc();
    var cursor = doc.getCursor();           // gets the line number in the cursor position
    var line = doc.getLine(cursor.line);    // get the line contents
    var pos = {                             // create a new object to avoid mutation of the original selection
        line: cursor.line,
        ch: line.length                     // set the character position to the end of the line
    }
    doc.replaceRange(text, pos);            // adds a new line

    updateWidgets(editor);
}