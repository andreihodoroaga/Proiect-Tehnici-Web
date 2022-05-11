window.addEventListener("DOMContentLoaded", function () {
  var tema = localStorage.getItem("tema");
  if (!tema) {
    //nu am setat inca o tema
    localStorage.setItem("tema", "light");
  } else {
    if (tema == "dark") document.body.classList.add("dark");
  }
  btn = document.getElementById("btn_tema");
  if (btn) {
    btn.onclick = function (e) {
      var icon = btn.children[0];
      icon.classList.toggle("fa-sun");
      icon.classList.toggle("fa-moon");
      document.body.classList.toggle("dark");
      if (document.body.classList.contains("dark"))
        localStorage.setItem("tema", "dark");
      else localStorage.setItem("tema", "light");
    };
  }
});
