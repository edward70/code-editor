(function () {
    "use strict";
    
    window.onerror = function(message, source, lineno, colno, error) { alert("[Error] " + message + " at line " + lineno); }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').then(function (registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
 
    var editor = document.getElementById('editor');

    function OpenedFile(name, content) {
        this.name = name;
        this.content = content;
        this.syncFileContent = function() {
            this.content = editor.value;
        }
    }

    var app = {
        current: new OpenedFile("untitled", editor.value),
        saveCurrentToDisk: function() {
            try {
                var blob = new Blob([this.current.content], {
                    type: "application/octet-stream;charset=utf-8"
                });
                saveAs(blob, this.current.name);
            } catch (e) {
                alert('An error occurred when trying to save a file.')
                console.log("[Caught Error] " + e)
            }
        }
    }
    
    editor.onchange = function () {
        app.current.syncFileContent();
    }

    var shortcutHandler = function (pressed, keycodes, callback) {
        try {
            var allPressed = keycodes.every(function (code) {
                return code === true ? true :
                    pressed === code ? true :
                    false;
            });

            if (allPressed) {
                callback();
            }
        } catch (e) {
            alert('An error occurred when trying to handle your shortcut.');
        }
    }

    try {
        window.addEventListener('keydown', function (e) {
            const o = 79;
            const s = 83;
            const n = 78;
            const r = 82;
            const key = e.which || e.keyCode || 0;
            shortcutHandler(key, [e.ctrlKey, e.altKey, o], function () {
                try {
                    var input = document.getElementById('fileinput');
                    input.click();
                    input.onchange = function () {
                        var file = input.files[0];
                        try {
                            app.current = new OpenedFile((file.name ? file.name : 'untitled'), "");
                            document.title = app.current.name;
                            var reader = new FileReader();
                            reader.onload = function () {
                                editor.value = (reader.result ? reader.result : '\n');
                                app.current.syncFileContent();
                            }
                            reader.readAsText(file);
                        } catch (e) {
                            alert('Opening files is unsupported by your browser.');
                        }
                    }
                } catch (e) {
                    alert('An error occurred while trying to open a file.');
                }
            });
            shortcutHandler(key, [e.ctrlKey, e.altKey, n], function () {
                editor.value = "";
                app.current = new OpenedFile("untitled", "");
                document.title = app.current.name;
            });
            shortcutHandler(key, [e.ctrlKey, e.altKey, r], function () {
                const newFileName = prompt("Enter a filename");
                app.current.name = (newFileName != null ? newFileName : "untitled");
                document.title = app.current.name;
            });
            shortcutHandler(key, [e.ctrlKey, e.shiftKey, s], function () {
                app.saveCurrentToDisk();
            });
            shortcutHandler(key, [e.ctrlKey, e.altKey, s], function () {
                const newFileName = prompt("Enter a filename");
                app.current.name = (newFileName != null ? newFileName : "untitled");
                document.title = app.current.name;
                app.saveCurrentToDisk();
            });
        });
    } catch (e) {
        alert('An error occurred when trying to register shortcuts.');
    }
}());
