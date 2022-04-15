if (window.safari !== undefined || (window.navigator?.userAgentData?.platform ?? window.navigator.platform).includes("mac")) {

    html = document.querySelector(".post-content").innerHTML
    to_replace = {
        "<kbd>Alt</kbd>": "<kbd>⌥Opt</kbd>",
        "<kbd>Ctrl</kbd>": "<kbd>⌘Cmd</kbd>",
    }
    for (const [key, value] of Object.entries(to_replace)) {
        html = html.replace(new RegExp(key, 'g'), value);
    }
    document.querySelector(".post-content").innerHTML = html
}
