const express = require("express");
const fs = require("fs");
const sharp = require("sharp");
const { Client } = require("pg");
const res = require("express/lib/response");

app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

console.log("Director proiect:", __dirname);

app.get(["/", "/index", "/home"], function (req, res) {
  //res.sendFile(__dirname+"/index1.html");
  res.render("pagini/index", { ip: req.ip, imagini: obImagini.imagini });
});

app.get("/eroare", function (req, res) {
  randeazaEroare(res, 1, "Titlu schimbat");
});

app.get("/*.ejs", function (req, res) {
  //res.sendFile(__dirname+"/index1.html");
  // res.status(403).render("pagini/403");
  randeazaEroare(res, 403);
});

/*
app.get("/despre", function(req, res){
    //res.sendFile(__dirname+"/index1.html");
    res.render("pagini/despre");
})
*/

app.get("/ceva", function (req, res, next) {
  res.write("<p style='color:pink'>Salut-1</p>");
  console.log("1");
  next();
  //res.end();
});
app.get("/ceva", function (req, res, next) {
  res.write("Salut-2");

  console.log("2");
  next();
});

app.get("/despre", function (req, res) {
  res.render("pagini/despre");
});

app.get("/*", function (req, res) {
  res.render("pagini" + req.url, function (err, rezRender) {
    if (err) {
      if (err.message.includes("Failed to lookup view")) {
        console.log(err);
        // res.status(404).render("pagini/404");
        randeazaEroare(res, 404);
      } else {
        res.render("pagini/eroare_generala");
      }
    } else {
      console.log(rezRender);
      res.send(rezRender);
    }
  });

  //console.log("generala:",req.url);
  res.end();
});

var obImagini;
function creeazaImagini() {
  var buf = fs
    .readFileSync(__dirname + "/resurse/json/galerie.json")
    .toString("utf8");

  obImagini = JSON.parse(buf); //global

  //console.log(obImagini);
  for (let imag of obImagini.imagini) {
    let nume_imag, extensie;
    [nume_imag, extensie] = imag.fisier.split("."); // "abc.de".split(".") ---> ["abc","de"]
    let dim_mic = 150;

    imag.mic = `${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`; //nume-150.webp // "a10" b=10 "a"+b `a${b}`
    //console.log(imag.mic);

    imag.mare = `${obImagini.cale_galerie}/${imag.fisier}`;
    if (!fs.existsSync(imag.mic))
      sharp(__dirname + "/" + imag.mare)
        .resize(dim_mic)
        .toFile(__dirname + "/" + imag.mic);

    let dim_mediu = 300;
    imag.mediu = `${obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.webp`;
    if (!fs.existsSync(imag.mediu))
      sharp(__dirname + "/" + imag.mare)
        .resize(dim_mediu)
        .toFile(__dirname + "/" + imag.mediu);
  }
}
creeazaImagini();

function creeazaErori() {
  var buf = fs
    .readFileSync(__dirname + "/resurse/json/erori.json")
    .toString("utf8"); // global
  obErori = JSON.parse(buf);
}
creeazaErori();

function randeazaEroare(res, identificator, titlu, text, imagine) {
  var eroare = obErori.erori.find(function (elem) {
    return identificator == elem.identificator;
  });

  titlu = titlu || (eroare && eroare.titlu) || "Eroare - eroare";
  text = text || (eroare && eroare.text) || "Dap, asta e o eroare.";
  imagine =
    imagine ||
    (eroare && obErori.cale_baza + "/" + eroare.imagine) ||
    "resurse/imagini/erori/interzis.png";

  if (eroare && eroare.status) {
    res.status(eroare.identificator).render("pagini/eroare_generala", {
      titlu: titlu,
      text: text,
      imagine: imagine,
    });
  } else {
    res.render("pagini/eroare_generala", {
      titlu: titlu,
      text: text,
      imagine: imagine,
    });
  }
}

app.listen(8080);
console.log("A pornit");
