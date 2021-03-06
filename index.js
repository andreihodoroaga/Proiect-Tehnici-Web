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
const { query } = require("express");

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

function getIp(req) {
  //pentru Heroku
  var ip = req.headers["x-forwarded-for"]; //ip-ul userului pentru care este forwardat mesajul
  if (ip) {
    let vect = ip.split(",");
    return vect[vect.length - 1];
  } else if (req.ip) {
    return req.ip;
  } else {
    return req.connection.remoteAddress;
  }
}

client.connect();

foldere = ["temp", "poze_uploadate"];
for (let folder of foldere) {
  let caleFolder = path.join(__dirname, folder);
  if (!fs.existsSync(caleFolder)) fs.mkdirSync(caleFolder);
}

app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate"));

app.use(
  session({
    secret: "abcdefg", //folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false,
  })
);

app.use("/*", function (req, res, next) {
  res.locals.utilizator = req.session.utilizator;
  res.locals.mesajLogin = req.session.mesajLogin;
  req.session.mesajLogin = null;
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

app.get("/*", function (req, res, next) {
  let id_utiliz = req.session.utilizator ? req.session.utilizator.id : null;
  if (id_utiliz) {
    let queryInsert = `insert into accesari(ip, user_id, pagina) values ('${getIp(
      req
    )}', '${id_utiliz}', '${req.url}')`;

    client.query(queryInsert, function (err, rezQuery) {
      if (err) console.log(err);
    });
  }
  next();
});

function stergeAccesariVechi() {
  let queryDelete = `delete from accesari where now() - data_accesare > interval '10 minutes'`;
  client.query(queryDelete, function (err, rezQuery) {
    if (err) console.log(err);
  });
}
stergeAccesariVechi();
setInterval(stergeAccesariVechi, 60 * 60 * 1000);

app.get(["/", "/index", "/home"], function (req, res) {
  //res.sendFile(__dirname+"/index1.html");
  querySelect =
    "select username, nume, data_adaugare from utilizatori where utilizatori.id in (select distinct user_id from accesari where now() - data_accesare <= interval '7 minutes')";

  client.query(querySelect, function (err, rezQuery) {
    let utiliz_online = [];
    if (err) console.log(err);
    else {
      utiliz_online = rezQuery.rows;
    }
    res.render("pagini/index", {
      ip: getIp(req),
      imagini: obGlobal.obImagini.imagini,
      utiliz_online: utiliz_online,
    });
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
          if (err) {
            console.log(err);
          }
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
  // select * from supercars where id = ${req.params.id}
  var queryProdus = {
    name: "produs-query",
    text: "select * from supercars where id = $1::integer",
    values: [req.params.id],
  };
  client.query(queryProdus, function (err, rezQuery) {
    console.log(err);
    res.render("pagini/produs", { prod: rezQuery.rows[0] });
  });
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

  rezScss = ejs.render(sirScss, { nrPoze: nrPoze });

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
  client.query("select * from supercars", function (err, rezQuery) {
    if (err) {
      console.log(err);
    }
    res.render("pagini/despre", { produse: rezQuery.rows });
  });
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
  [97, 102],
  [114, 122],
];
for (let interval of intervaleAscii) {
  for (let i = interval[0]; i <= interval[1]; i++)
    obGlobal.sirAlphaNum += String.fromCharCode(i);
}

function genereazaToken(n) {
  var d = Math.floor(new Date().getTime() / 1000);

  var token = d;
  for (let i = 0; i < n; i++) {
    token +=
      obGlobal.sirAlphaNum[
        Math.floor(Math.random() * obGlobal.sirAlphaNum.length)
      ];
  }
  return token;
}

function generateString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

parolaServer = "tehniciweb";
app.post("/inreg", function (req, res) {
  var username;
  var formular = new formidable.IncomingForm({
    uploadDir: path.join(__dirname, "user_pics"),
    keepExtensions: true,
  });
  formular.parse(req, function (err, campuriText, campuriFisier) {
    var eroare = "";
    if (campuriText.username == "") {
      eroare += "Username necompletat. ";
    }
    if (
      !campuriText.username.match(
        new RegExp("[A-Za-z][A-Za-z0-9]{0,5}[0-9][0-9][0-9][0-9]$")
      )
    ) {
      eroare += "Username nu corespunde patternului. ";
    }
    if (campuriText.nume == "") {
      eroare += "Nume necompletat. ";
    }
    if (campuriText.prenume == "") {
      eroare += "Prenume necompletat. ";
    }
    if (campuriText.parola == "") {
      eroare += "Parola necompletata. ";
    }
    if (campuriText.rparola == "") {
      eroare += "Campul de reintrocere parola necompletat. ";
    }
    if (campuriText.email == "") {
      eroare += "Email necompletat. ";
    }
    // 2 alte validari
    if (!campuriText.email.includes("@"))
      eroare += "Introduceti un email valid. ";
    if (campuriText.nume.length >= 100 || campuriText.prenume.length >= 100)
      eroare += "Numele si prenumele pot avea maxim 100 de caractere. ";
    if (!eroare) {
      // queryUtiliz = `select username from utilizatori where username='${campuriText.username}'`;
      queryUtiliz = {
        name: "query-check-username",
        text: "select username from utilizatori where username=$1::text",
        values: [campuriText.username],
      };
      client.query(queryUtiliz, function (err, rezUtiliz) {
        if (err) console.log(err);
        if (rezUtiliz.rows.length != 0) {
          eroare += "Username-ul mai exista. ";
          res.render("pagini/inregistrare", {
            err: "Eroare: " + eroare,
          });
        } else {
          var nrRandomIntre40si50 = Math.floor(Math.random() * 10 + 40);
          var token = genereazaToken(nrRandomIntre40si50);
          var parolaCriptata = crypto
            .scryptSync(campuriText.parola, parolaServer, 64)
            .toString("hex");
          var tema_site = campuriText.tema_site
            ? campuriText.tema_site
            : "dark";
          var comandaInserare = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod, tema_site, imagine) values ('${campuriText.username}', '${campuriText.nume}', '${campuriText.prenume}', '${parolaCriptata}', '${campuriText.email}', '${campuriText.culoare_chat}', '${token}', '${tema_site}', '${campuriFisier.poza.newFilename}')`;
          var comandaInserare = {
            name: "query-insert-user",
            text: "insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod, tema_site, imagine) values ($1::text, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text, $9::text)",
            values: [
              campuriText.username,
              campuriText.nume,
              campuriText.prenume,
              parolaCriptata,
              campuriText.email,
              campuriText.culoare_chat,
              token,
              tema_site,
              campuriFisier.poza.newFilename,
            ],
          };

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
                `<h2>Salut ${campuriText.nume} ${campuriText.prenume}!</h2><p>Te-ai inregistrat pe site-ul <a href="http://${obGlobal.numeDomeniu}">Supercars</a> cu username-ul <i>${campuriText.username}</i>.</p>
                  <p>Link confirmare: <a href='${linkConfirmare}'>${linkConfirmare}</a></p>`
              );
            }
          });
        }
      });
    } else {
      res.render("pagini/inregistrare", {
        err: "Eroare: " + eroare,
      });
    }
  });

  // formular.on("field", function (nume, val) {
  //   if (nume == "username") username = val;
  // });
  // formular.on("fileBegin", function (nume, fisier) {
  //   caleUtiliz = path.join(__dirname, "poze_uploadate");
  //   if (!fs.existsSync(caleUtiliz)) {
  //     fs.mkdirSync(caleUtiliz);
  //   }
  //   fisier.filepath = path.join(caleUtiliz, fisier.originalFilename);
  // });
  // formular.on("file", function (nume, fisier) {
  //3
  // });
});

app.post("/login", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    var parolaCriptata = crypto
      .scryptSync(campuriText.parola, parolaServer, 64)
      .toString("hex");
    // var querySelect = `select * from utilizatori where username='${campuriText.username}' and parola='${parolaCriptata}' and confirmat_mail=true`;
    var querySelect = {
      name: "login-query",
      text: "select * from utilizatori where username=$1::text and parola=$2::text and confirmat_mail=true",
      values: [campuriText.username, parolaCriptata],
    };
    console.log(querySelect);
    client.query(querySelect, function (err, rezSelect) {
      if (err) console.log(err);
      else {
        if (rezSelect.rows.length == 1) {
          //daca am utilizatorul si a dat credentiale corecte
          req.session.utilizator = {
            id: rezSelect.rows[0].id,
            nume: rezSelect.rows[0].nume,
            prenume: rezSelect.rows[0].prenume,
            username: rezSelect.rows[0].username,
            email: rezSelect.rows[0].email,
            culoare_chat: rezSelect.rows[0].culoare_chat,
            rol: rezSelect.rows[0].rol,
            tema_site: rezSelect.rows[0].tema_site,
          };
          res.redirect("/index");
        } else {
          req.session.mesajLogin = "Login esuat";
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

app.get("/useri", function (req, res) {
  if (req.session.utilizator && req.session.utilizator.rol == "admin") {
    client.query(
      "select * from utilizatori where rol='comun'",
      function (err, rezQuery) {
        if (err) {
          console.log(err);
        }
        res.render("pagini/useri", { useri: rezQuery.rows });
      }
    );
  } else {
    randeazaEroare(res, 403);
  }
});

app.post("/schimba_parola/:user_id", function (req, res) {
  // seteaza o parola random
  var parolaNouaUser = generateString(7);
  var parolaNouaUserCriptata = crypto
    .scryptSync(parolaNouaUser, parolaServer, 64)
    .toString("hex");
  console.log(parolaNouaUser.length, parolaNouaUserCriptata);

  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    if (err) {
      console.log(err);
    }
    let queryUpdatePass = {
      name: "admin-update-pass",
      text: "update utilizatori set parola=$1::text where id=$2::integer",
      values: [parolaNouaUserCriptata, campuriText.id_utiliz],
    };

    client.query(queryUpdatePass, function (err, rezQuery) {
      if (err) console.log(err);
      // mail catre user cu parola noua
      trimiteMail(
        campuriText.email_utiliz,
        "Ti-am schimbat parola ;)",
        "Acum ai o parola noua.",
        `<h3>Parola ta noua este ${parolaNouaUser}.</h3>`
      );
      res.redirect("/useri");
    });
  });
});

app.post("/sterge_utiliz", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    // let queryDel = `delete from utilizatori where id=${campuriText.id_utiliz}`;
    let queryDel = {
      name: "delete-user",
      text: "delete from utilizatori where id=$1::integer",
      values: [campuriText.id_utiliz],
    };

    client.query(queryDel, function (err, rezQuery) {
      if (err) console.log(err);
      // TO DO afisare a unui mesaj friendly pentru cazurile de succes si esec
      var mesajStergereUtiliz = "";
      if (err) {
        mesajStergereUtiliz = "Nu s-a putut sterge userul.";
      } else {
        mesajStergereUtiliz = `Utilizatorul cu id-ul ${campuriText.id_utiliz} a fost sters cu succes.`;
      }
      req.session.mesajStergereUtiliz = mesajStergereUtiliz;
      res.redirect("/useri");
    });
  });
});

// ---------------- Update profil -----------------------------
app.post("/profil", function (req, res) {
  if (!req.session.utilizator) {
    res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
    return;
  }
  var formular = new formidable.IncomingForm({
    uploadDir: path.join(__dirname, "user_pics"),
    keepExtensions: true,
  });

  formular.parse(req, function (err, campuriText, campuriFile) {
    var criptareParola = crypto
      .scryptSync(campuriText.parola, parolaServer, 64)
      .toString("hex");

    var parolaCriptataNoua = crypto
      .scryptSync(campuriText.rparola, parolaServer, 64)
      .toString("hex");
    // var queryUpdate = `update utilizatori set nume='${campuriText.nume}', prenume='${campuriText.prenume}', email='${campuriText.email}', culoare_chat='${campuriText.culoare_chat}' where parola='${criptareParola}'`;
    var queryUpdate = {
      name: "update-query",
      text: "update utilizatori set nume=$1::text, prenume=$2::text, parola=$9::text, email=$3::text, culoare_chat=$4::text, tema_site=$7::text, imagine=$8::text where username=$6::text and parola=$5::text",
      values: [
        campuriText.nume,
        campuriText.prenume,
        campuriText.email,
        campuriText.culoare_chat,
        criptareParola,
        campuriText.username,
        campuriText.tema_site,
        campuriFile.poza.newFilename,
        parolaCriptataNoua,
      ],
    };

    client.query(queryUpdate, function (err, rez) {
      if (err) {
        console.log(err);
        res.render("pagini/eroare_generala", {
          text: "Eroare baza date. Incercati mai tarziu.",
        });
        return;
      }

      if (rez.rowCount == 0) {
        res.render("pagini/profil", {
          mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa.",
        });
        return;
      } else {
        //actualizare sesiune
        req.session.utilizator.nume = campuriText.nume;
        req.session.utilizator.prenume = campuriText.prenume;
        req.session.utilizator.email = campuriText.email;
        req.session.utilizator.culoare_chat = campuriText.culoare_chat;
        req.session.utilizator.tema_site = campuriText.tema_site;

        // trimitere mail cu actualizarea
        trimiteMail(
          req.session.utilizator.email,
          "Update profil",
          "mesaj text",
          `<h2>Salut ${campuriText.nume} ${campuriText.prenume}!</h2><p>Ti-ai updatat datele pe site-ul 
            <a href="http://${obGlobal.numeDomeniu}">Supercars</a> cu username-ul <i>${campuriText.username}</i>.</p>`
        );
      }

      res.render("pagini/profil", {
        mesaj: "Update-ul s-a realizat cu succes.",
      });
    });
  });
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.locals.utilizator = null;
  res.render("pagini/logout");
});

// ------------- administrare -------------
app.get("/administrare", function (req, res) {
  if (req.session.utilizator && req.session.utilizator.rol == "admin") {
    client.query("select * from supercars", function (err, rezQuery) {
      if (err) {
        console.log(err);
      }
      res.render("pagini/administrare", {
        produse: rezQuery.rows,
      });
    });
  } else {
    randeazaEroare(res, 403);
  }
});

app.post("/sterge_produs/:prod_id", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    let queryDel = {
      name: "delete-product",
      text: "delete from supercars where id=$1::integer",
      values: [campuriText.id_produs],
    };

    client.query(queryDel, function (err, rezQuery) {
      if (err) console.log(err);
      res.redirect("/administrare");
    });
  });
});

app.get("/privacy_policy", function (req, res) {
  res.render("pagini/privacy_policy");
});

app.get("/terms", function (req, res) {
  res.render("pagini/terms");
});

app.get("/sterge_cont", function (req, res) {
  if (req.session.utilizator) {
    res.render("pagini/sterge_cont");
  } else {
    randeazaEroare(res, 403);
  }
});

app.post("/stergere_cont", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    parolaCriptata = crypto
      .scryptSync(campuriText.parola_stergere, parolaServer, 64)
      .toString("hex");
    let queryDel = {
      name: "delete-account",
      text: "delete from utilizatori where id=$1::integer and parola=$2::text",
      values: [req.session.utilizator.id, parolaCriptata],
    };

    client.query(queryDel, function (err, rezQuery) {
      if (err) console.log(err);
      res.redirect("/logout");
    });
  });
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
