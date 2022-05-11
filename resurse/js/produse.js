window.onload = function () {
  // slider value handler
  document.getElementById("inp-pret").onchange = function () {
    document.getElementById("infoRange").innerHTML =
      "(" + this.value / 1000 + "k $)";
  };

  document.getElementById("filtrare").onclick = function () {
    // input nume
    var valNume = document.getElementById("inp-nume").value.toLowerCase();

    // input cai putere
    var butoaneRadio = document.getElementsByName("gr_rad");
    for (let rad of butoaneRadio) {
      if (rad.checked) {
        var caiPutere = rad.value;
        break;
      }
    }

    var minCaiPutere, maxCaiPutere;
    if (caiPutere != "toate") {
      [minCaiPutere, maxCaiPutere] = caiPutere.split(":");
      minCaiPutere = parseInt(minCaiPutere);
      maxCaiPutere = parseInt(maxCaiPutere);
    } else {
      minCaiPutere = 0;
      maxCaiPutere = 4000;
    }

    // input pret
    var valPret = parseInt(document.getElementById("inp-pret").value);

    // select simplu
    var valCategorie = document.getElementById("inp-categorie").value;

    // checkbox noutati
    var valCheckbox = document.getElementById("inp-noutati").checked;

    // cuvinte cheie
    var valCuvCheie = document.getElementById("inp-cuv-cheie").value;

    // valoare input-datalist
    var valCapCilind = document.getElementById("inp-cap-cilind").value;

    // valoare select multiplu
    var valOptTuning = document.getElementById("optiuni-tuning");
    var optiuniTuning = [...valOptTuning.options]
      .filter((option) => option.selected)
      .map((option) => option.value);
    if (optiuniTuning.includes("niciuna")) optiuniTuning.shift(); // scot 'niciuna'

    // start filtrare
    var articole = document.getElementsByClassName("produs");
    for (let art of articole) {
      art.style.display = "none";
      //filtru nume
      let numeArt = art
        .getElementsByClassName("val-nume")[0]
        .innerHTML.toLowerCase();
      let cond1 = numeArt.startsWith(valNume);

      // filtru cai putere
      let caiPutereArt = parseInt(
        art.getElementsByClassName("val-cai-putere")[0].innerHTML
      );
      let cond2 = minCaiPutere <= caiPutereArt && caiPutereArt < maxCaiPutere;

      //filtru pret minim
      let pretArt = parseInt(
        art.getElementsByClassName("val-pret")[0].innerHTML.slice(0, -1)
      );
      let cond3 = pretArt >= valPret;

      //filtru categorie
      let categorieArt =
        art.getElementsByClassName("val-categorie")[0].innerHTML;
      let cond4 = valCategorie == "toate" || valCategorie == categorieArt;

      // filtru checkbox
      let dataAdaugare = new Date(
        art.getElementsByClassName("data-adaugare")[0].innerHTML
      );
      let cond5 = !valCheckbox || (valCheckbox && dataAdaugare.getMonth() >= 3); // doar articolele adaugate dupa 1 aprilie

      // filtru cuvinte cheie
      let descriereArt =
        art.getElementsByClassName("val-descriere")[0].innerHTML;
      let cond6 = descriereArt
        .toLowerCase()
        .includes(valCuvCheie.toLowerCase());

      // filtru capacitate cilindrica
      let artCapCilind = parseInt(
        art.getElementsByClassName("val-capacitate-cilindrica")[0].textContent
      );
      var minCapCilind, maxCapCilind;
      [minCapCilind, maxCapCilind] = valCapCilind.split("-");
      if (!maxCapCilind)
        // cazul 0(electric)
        maxCapCilind = 1;
      [minCapCilind, maxCapCilind] = [
        parseInt(minCapCilind),
        parseInt(maxCapCilind),
      ];
      let cond7 =
        valCapCilind == ""
          ? true
          : minCapCilind <= artCapCilind && artCapCilind < maxCapCilind;

      // filtru optiuni tuning
      let optiuniTuningArt = art
        .getElementsByClassName("val-optiuni-tuning")[0]
        .innerHTML.split(", ");
      if (optiuniTuningArt.includes("nu are") && optiuniTuningArt.length == 1)
        optiuniTuningArt = [];
      let cond8 = optiuniTuning.every((opt) => optiuniTuningArt.includes(opt));
      // conditie finala
      let conditieFinala =
        cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8;
      if (conditieFinala) {
        art.style.display = "block";
      }
    }
  };

  document.getElementById("resetare").onclick = function () {
    var articole = document.getElementsByClassName("produs");
    for (let art of articole) {
      art.style.display = "block";
      document.getElementById("inp-nume").value = "";
      document.getElementById("i_rad4").checked = true;
      document.getElementById("inp-pret").value = 100000;
      document.getElementById("infoRange").innerHTML = "(100k $)";
      document.getElementById("sel-toate").selected = true;
      document.getElementById("inp-noutati").checked = false;
      document.getElementById("inp-cuv-cheie").value = "";
      document.getElementById("inp-cap-cilind").value = "";
      Array.from(document.getElementById("optiuni-tuning").options).forEach(
        (opt) => {
          opt.selected = false;
          if (opt.value == "niciuna") opt.selected = true;
        }
      );
    }
  };

  function sortare(semn) {
    var articole = document.getElementsByClassName("produs");
    var v_articole = Array.from(articole);
    v_articole.sort(function (a, b) {
      let cai_putere_a = parseInt(
        a.getElementsByClassName("val-cai-putere")[0].innerHTML
      );
      let cai_putere_b = parseInt(
        b.getElementsByClassName("val-cai-putere")[0].innerHTML
      );
      if (cai_putere_a != cai_putere_b) {
        return semn * (cai_putere_a - cai_putere_b);
      } else {
        let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
        let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
        return semn * nume_a.localeCompare(nume_b);
      }
    });
    for (let art of v_articole) {
      art.parentElement.appendChild(art);
    }
  }

  document.getElementById("sortCresc").onclick = function () {
    sortare(1);
  };

  document.getElementById("sortDescresc").onclick = function () {
    sortare(-1);
  };

  window.onkeydown = function (e) {
    if (e.key == "c" && e.altKey) {
      let p_vechi = document.getElementById("afis-suma");
      if (!p_vechi) {
        let p = document.createElement("p");
        p.id = "afis-suma";
        let suma = 0;
        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {
          if (art.style.display != "none")
            suma += parseInt(
              art.getElementsByClassName("val-pret")[0].innerHTML
            );
        }
        p.innerHTML = "<b>Suma: </b>" + suma + "$";
        var sectiune = document.getElementById("produse");
        sectiune.parentNode.insertBefore(p, sectiune);
        setTimeout(function () {
          let p_vechi = document.getElementById("afis-suma");
          if (p_vechi) {
            p_vechi.remove();
          }
        }, 5000);
      }
    }
  };

  var checkboxuri = document.getElementsByClassName("selecteaza-cos");
  for (let ch of checkboxuri) {
    ch.onchange = function () {
      if (this.checked) {
        let iduriCos = localStorage.getItem("produse-cos");
        if (iduriCos) {
          iduriCos = iduriCos.split(",");
        } else {
          iduriCos = [];
        }
        iduriCos.push();
      }
      iduriCos.push(this.value);
      localStorage.setItem("cos_virtual", iduriCos.join(","));
    };
  }
};
