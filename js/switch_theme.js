function set_dark_theme() {
    html_el = document.documentElement;
    html_el.className = "darkTheme"
}

function set_light_theme() {
    html_el = document.documentElement;
    html_el.className = "lightTheme"
}

function switch_theme() {
    html_el = document.documentElement;
    if (html_el.className == "darkTheme") {
        set_light_theme()
        localStorage.setItem("theme", "light");
    }
    else {
        set_dark_theme()
        localStorage.setItem("theme", "dark");
    }
}
let theme = localStorage.getItem("theme")
if (theme) {
    if (theme == "dark") {
        set_dark_theme()
    }
    else {
        set_light_theme()
    }
}
else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    set_dark_theme()
}