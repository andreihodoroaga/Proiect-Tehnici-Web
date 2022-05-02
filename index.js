const express = require("express");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const { Client } = require("pg");
const res = require("express/lib/response");
const ejs = require("ejs");
const sass = require("sass");
const formidable = require("formidable");
const crypto = require("crypto");
const session = require("express-session");
const { fileURLToPath } = require("url");
const nodemailer = require("nodemailer");

async function trimiteMail(
  email,
  subiect,
  mesajText,
  mesajHtml,
  atasamente = []
) {
  var transp = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      //date login
      user: obGlobal.emailServer,
      pass: "hzfmprhmuyikinzs",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  //genereaza html
  await transp.sendMail({
    from: obGlobal.emailServer,
    to: email,
    subject: subiect, //"Te-ai inregistrat cu succes",
    text: mesajText, //"Username-ul tau este "+username
    html: mesajHtml, // `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
    attachments: atasamente,
  });
  console.log("trimis mail");
}

const obGlobal = {
  obImagini: null,
  obErori: null,
  emailServer: "andreihodoroagaproiect@gmail.com",
  protocol: null,
  numeDomeniu: null,
  port: 8080,
  sirAlphaNum: "",
};

if (process.env.SITE_ONLINE) {
  obGlobal.protocol = "https://";
  obGlobal.numeDomeniu = "floating-earth-91056.herokuapp.com";
  var client = new Client({
    database: "ddl79c5s37vdrg",
    user: "qzqucoccjhgisf",
    password:
      "2ebe44ef014e628f3a672fca87314e00000bda6c24406b9bb093fa97714c5cae",
    host: "ec2-23-20-224-166.compute-1.amazonaws.com",
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  obGlobal.protocol = "http://";
  obGlobal.numeDomeniu = "localhost:" + obGlobal.port;
  var client = new Client({
    database: "ceva",
    user: "andreih",
    password: "andreih",
    host: "localhost",
    port: 5432,
  });
}

client.connect();

app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

app.use(
  session({
    secret: "abcdefg", //folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false,
  })
);

app.use("/*", function (req, res, next) {
  res.locals.utilizator = req.session.utilizator;
  next();
});

app.use(function (req, res, next) {
  client.query(
    "select * from unnest(enum_range(null::branduri_supercar))",
    function (err, rezBranduri) {
      res.locals.optiuniMeniu = rezBranduri.rows;
      next();
    }
  );
});

app.get(["/", "/index", "/home"], function (req, res) {
  //res.sendFile(__dirname+"/index1.html");
  res.render("pagini/index", {
    ip: req.ip,
    imagini: obGlobal.obImagini.imagini,
  });
});

app.get("/produse", function (req, res) {
  client.query(
    "select * from unnest(enum_range(null::categ_supercar))",
    function (err, rezCateg) {
      var cond_where = req.query.brand ? ` brand='${req.query.brand}'` : " 1=1";

      client.query(
        "select * from supercars where " + cond_where,
        function (err, rezQuery) {
          console.log(err);
          res.render("pagini/produse", {
            produse: rezQuery.rows,
            optiuni: rezCateg.rows,
          });
        }
      );
    }
  );
});

app.get("/produs/:id", function (req, res) {
  client.query(
    `select * from supercars where id = ${req.params.id}`,
    function (err, rezQuery) {
      console.log(err);
      res.render("pagini/produs", { prod: rezQuery.rows[0] });
    }
  );
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

// Cod galerie animata
app.get("*/galerie-animata.css", function (req, res) {
  var sirScss = fs
    .readFileSync(__dirname + "/resurse/scss/galerie_animata.scss")
    .toString("utf8");
  var nrPoze = 5 + Math.floor((Math.random() * 8) / 2) * 2;

  rezScss = ejs.render(sirScss, { nrPoze: 7 });

  var caleScss = __dirname + "/temp/galerie_animata.scss";
  fs.writeFileSync(caleScss, rezScss);
  try {
    rezCompilare = sass.compile(caleScss, { sourceMap: true });
    var caleCss = __dirname + "/temp/galerie_animata.css";
    fs.writeFileSync(caleCss, rezCompilare.css);
    res.setHeader("Content-Type", "text/css");
    res.sendFile(caleCss);
  } catch (err) {
    console.log(err);
    res.send("Eroare");
  }
});

app.get("*/galerie-animata.css.map", function (req, res) {
  res.sendFile(path.join(__dirname, "temp/galerie-animata.css.map"));
});

app.get("/ceva", function (req, res, next) {
  res.write("<p style='color:pink'>Salut-1</p>");
  console.log("1");
  next();
  res.end();
});
app.get("/ceva", function (req, res, next) {
  res.write("Salut-2");

  console.log("2");
  next();
});

app.get("/despre", function (req, res) {
  res.render("pagini/despre");
});

function creeazaImagini() {
  var buf = fs
    .readFileSync(__dirname + "/resurse/json/galerie.json")
    .toString("utf8");

  obGlobal.obImagini = JSON.parse(buf); //global

  // console.log(obGlobal.obImagini);
  for (let imag of obGlobal.obImagini.imagini) {
    // generate small and medium images
    let nume_imag, extensie;
    [nume_imag, extensie] = imag.fisier.split("."); // "abc.de".split(".") ---> ["abc","de"]
    let dim_mic = 150;

    imag.mic = `${obGlobal.obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`;
    // console.log(imag.mic);

    imag.mare = `${obGlobal.obImagini.cale_galerie}/${imag.fisier}`;
    // console.log(__dirname + "/" + imag.mare);
    if (!fs.existsSync(imag.mic))
      sharp(__dirname + "/" + imag.mare)
        .resize(dim_mic)
        .toFile(__dirname + "/" + imag.mic);

    let dim_mediu = 300;
    imag.mediu = `${obGlobal.obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.webp`;
    if (!fs.existsSync(imag.mediu))
      sharp(__dirname + "/" + imag.mare)
        .resize(dim_mediu)
        .toFile(__dirname + "/" + imag.mediu);

    // sar imaginile care nu au ora curenta in intervalul de timp (imag.timp)
    let dateObj = new Date();
    let currentHour = dateObj.getHours();
    [imagStartTime, imagEndTime] = imag.timp.split("-");
    [imagStartTime, imagEndTime] = [
      imagStartTime.split(":")[0],
      imagEndTime.split(":")[0],
    ];
    [imagStartTime, imagEndTime] = [
      parseInt(imagStartTime),
      parseInt(imagEndTime),
    ];

    if (!(currentHour >= imagStartTime && currentHour <= imagEndTime)) {
      obGlobal.obImagini.imagini = obGlobal.obImagini.imagini.filter(function (
        imagine
      ) {
        return imagine.titlu != imag.titlu;
      });
    }
  }
}
creeazaImagini();

function creeazaErori() {
  var buf = fs
    .readFileSync(__dirname + "/resurse/json/erori.json")
    .toString("utf8"); // global
  obGlobal.obErori = JSON.parse(buf);
}
creeazaErori();

function randeazaEroare(res, identificator, titlu, text, imagine) {
  var eroare = obGlobal.obErori.erori.find(function (elem) {
    return identificator == elem.identificator;
  });

  titlu = titlu || (eroare && eroare.titlu) || "Eroare - eroare";
  text = text || (eroare && eroare.text) || "Dap, asta e o eroare.";
  imagine =
    imagine ||
    (eroare && obGlobal.obErori.cale_baza + "/" + eroare.imagine) ||
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

// --------- utilizatori ----------

var intervaleAscii = [
  [48, 57],
  [65, 90],
  [97, 122],
];
for (let interval of intervaleAscii) {
  for (let i = interval[0]; i <= interval[1]; i++)
    obGlobal.sirAlphaNum += String.fromCharCode(i);
}

function genereazaToken(n) {
  var token = "";
  for (let i = 0; i < n; i++) {
    token +=
      obGlobal.sirAlphaNum[
        Math.floor(Math.random() * obGlobal.sirAlphaNum.length)
      ];
  }
  return token;
}

parolaServer = "tehniciweb";
app.post("/inreg", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    var eroare = "";
    if (campuriText.username == "") {
      eroare += "Username necompletat. ";
    }
    if (!campuriText.username.match(new RegExp("[A-Za-z0-9]+$"))) {
      eroare += "Username nu corespunde patternului. ";
    }
    if (!eroare) {
      queryUtiliz = `select username from utilizatori where username='${campuriText.username}'`;
      client.query(queryUtiliz, function (err, rezUtiliz) {
        if (err) console.log(err);
        if (rezUtiliz.rows.length != 0) {
          eroare += "Username-ul mai exista. ";
          res.render("pagini/inregistrare", {
            err: "Eroare:" + eroare,
          });
        } else {
          var token = genereazaToken(100);
          var parolaCriptata = crypto
            .scryptSync(campuriText.parola, parolaServer, 64)
            .toString("hex");
          var comandaInserare = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod) values ('${campuriText.username}', '${campuriText.nume}', '${campuriText.prenume}', '${parolaCriptata}', '${campuriText.email}', '${campuriText.culoare_chat}', '${token}')`;
          client.query(comandaInserare, function (err, rezInserare) {
            if (err) {
              console.log(err);
              res.render("pagini/inregistrare", {
                err: "Eroare baza de date",
              });
            } else {
              res.render("pagini/inregistrare", {
                raspuns: "Datele au fost introduse",
              });
              let linkConfirmare = `${obGlobal.protocol}${obGlobal.numeDomeniu}/cod/${campuriText.username}/${token}`;
              trimiteMail(
                campuriText.email,
                "Te-ai inregistrat",
                "mesaj text",
                `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${campuriText.username}.</p><p>Link confirmare: <a href='${linkConfirmare}'>${linkConfirmare}</a></p>`
              );
            }
          });
        }
      });
    } else {
      res.render("pagini/inregistrare", {
        err: "Eroare:" + eroare,
      });
    }
  });
});

app.post("/login", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    console.log(campuriText);
    var parolaCriptata = crypto
      .scryptSync(campuriText.parola, parolaServer, 64)
      .toString("hex");
    var querySelect = `select * from utilizatori where username='${campuriText.username}' and parola='${parolaCriptata}' and confirmat_mail=true`;
    console.log(querySelect);
    client.query(querySelect, function (err, rezSelect) {
      if (err) console.log(err);
      else {
        if (rezSelect.rows.length == 1) {
          //daca am utilizatorul si a dat credentiale corecte
          req.session.utilizator = {
            nume: rezSelect.rows[0].nume,
            prenume: rezSelect.rows[0].prenume,
            username: rezSelect.rows[0].username,
            email: rezSelect.rows[0].email,
            culoare_chat: rezSelect.rows[0].culoare_chat,
            rol: rezSelect.rows[0].rol,
          };
          res.redirect("/index");
        }
      }
    });
  });
});

app.get("/cod/:username/:token", function (req, res) {
  var comandaSelect = `update utilizatori set confirmat_mail=true where username='${req.params.username}' and cod='${req.params.token}'`;
  client.query(comandaSelect, function (err, rezUpdate) {
    if (err) {
      console.log(err);
      randeazaEroare(res, 2);
    } else {
      if (rezUpdate.rowCount == 1) {
        res.render("pagini/confirmare");
      } else {
        randeazaEroare(
          res,
          2,
          "Eroare link confirmare",
          "Nu e userul sau linkul corect"
        );
      }
    }
  });
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.locals.utilizator = null;
  res.render("pagini/logout");
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

var s_port = process.env.PORT || obGlobal.port;
app.listen(s_port);

// app.listen(8080);
console.log("A pornit");
