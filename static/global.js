console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$("nav a");

let currentLink = navLinks.find(a => a.host === location.host && a.pathname === location.pathname);

if (currentLink) {
    currentLink.classList.add("current");
}

let pages = [
    {url: "", title: "Sobre Mim"},
    {url: "projects/", title: "Projetos"},
    {url: "resume/", title: "Currículo"},
    {url: "contact/", title: "Contato"},
    {url: "https://github.com/scrocha", title: "GitHub"}
];

const ARE_WE_HOME = document.documentElement.classList.contains("home");

let h1 = document.createElement("h1");
h1.textContent = document.title;
document.body.prepend(h1);

let nav = document.createElement("nav");
document.body.insertBefore(nav, h1.nextSibling);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    if (!ARE_WE_HOME && !url.startsWith("http")) {
        url = "../" + url;
    }
    
    let ref = document.createElement("a");
    ref.href = url;
    ref.textContent = title;

    if (ref.host === location.host && ref.pathname === location.pathname) {
        ref.classList.add("current");
    }

    if (ref.host !== location.host) {
        ref.target = "_blank";
    }

    nav.append(ref);
}
