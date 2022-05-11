window.addEventListener("DOMContentLoaded", function () {
  checkBanner();
});

function setCookie(nume, val, timpExp, path = "/") {
  d = new Date();
  d.setTime(new Date().getTime() + timpExp);
  document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=${path}`;

}
setCookie("a", "b", 6000)

function getCookie(nume) {
  var vectCookies = document.cookie.split(";");
  // remove whitespaces
  for (let c of vectCookies) {
    c = c.trim();
    if (c.startsWith(nume + "=")) {
      return c.substring(nume.length + 1);
    }
  }
  return false;
}

function deleteCookie(nume) {
  setCookie(nume, "", 0);
}

function deleteAllCookies() {
  var vectCookies = document.cookie.split(";");
  for (let c of vectCookies) {
    c = c.trim();
    nume = c.split("=")[0];
    deleteCookie(nume);
  }
}

function checkBanner() {
  if (getCookie("acceptat_banner")) {
    document.getElementById("banner_cookies").style.display = "none";
  } else {
    document.getElementById("banner_cookies").style.display = "block";
    document.getElementById("ok_cookies").onclick = function () {
      document.getElementById("banner_cookies").style.display = "none";
      setCookie("acceptat_banner", "true", 5000);
    };
  }
}
