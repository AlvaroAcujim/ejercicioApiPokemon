const div = document.getElementById("content");
const form = document.getElementById("form");
const inputN = document.getElementById("nameInp");
const save = document.getElementById("save");
const errorMess = document.getElementById("errorMessage");
const url = "https://pokeapi.co/api/v2/pokemon/";
const dataList = document.getElementById("pokemons");
let abilityUrl = "";
let pokemonObj = {};
let pokemonAbilities = [];
let pokemonAbilityStat = {};

window.onload = () => {
  createDataListOptions();
};

save.addEventListener("click", (ev) => {
  ev.preventDefault();
  if (!document.getElementsByClassName("table")) {
    tableData();
  } else {
    if (document.getElementById("ul")) {
      document.getElementById("ul").remove();
    }
    document.querySelectorAll("table").forEach((el) => {
      el.remove();
    });
    tableData();
  }
});

const createDataListOptions = async () => {
  const pokemons = await getAllPokemonsNames();
  pokemons.forEach((el) => {
    const option = document.createElement("option");
    option.setAttribute("value", el.name);
    dataList.append(option);
  });
};

const getAllPokemonsNames = async () => {
  try {
    const response = await fetch(`${url}?limit=1400`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (e) {
    console.log(e);
  } finally {
    console.log("Se ha ejecutado la promesa");
  }
};

const consumeAbilities = async (ability) => {
  try {
    const response = await fetch(`${ability}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const data = await response.json();
    const spanishDescrip = data.flavor_text_entries.find(
      (el) => el.language.name === "es"
    );
    const englishDescrip = data.flavor_text_entries.find(
      (el) => el.language.name === "en"
    );
    pokemonAbilityStat = {
      precision: data.accuracy || 0,
      poder: data.power || 0,
      pp: data.pp,
      descripcion: spanishDescrip.flavor_text || englishDescrip.flavor_text,
    };
    console.log(data.flavor_text_entries);
    return pokemonAbilityStat;
  } catch (e) {
    console.log(e);
  } finally {
    console.log("Se ha ejecutado la promesa");
  }
};
const getDataPokemon = async (input) => {
  try {
    input = input.toLowerCase();
    const response = await fetch(`${url}${input}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const data = await response.json();
    pokemonAbilities ? (pokemonAbilities = []) : pokemonAbilities;
    data.moves.forEach((el) => pokemonAbilities.push(el.move));
    //data.abilities[1].ability.name ? data.abilities[0].ability.name + '/' + data.abilities[1].ability.name : data.abilities[0].ability.name
    pokemonObj = {
      Nombre: data.name,
      Habilidades:
        data.abilities.length > 1
          ? data.abilities[0].ability.name +
            "/" +
            data.abilities[1].ability.name
          : data.abilities[0].ability.name,
      Altura: data.height / 10,
      Peso: data.weight / 10,
      Tipo:
        data.types.length > 1
          ? data.types[0].type.name + "/" + data.types[1].type.name
          : data.types[0].type.name,
      Sprite: data.sprites.front_shiny,
    };

    errorMess.style.display = "none";

    return [pokemonObj, pokemonAbilities];
  } catch (e) {
    errorMess.textContent = "Escriba un Pokemon Real";
    errorMess.style.display = "block";
    console.log(e);
  } finally {
    console.log("Se ha ejecutado la promesa");
  }
};

const createElements = (el) => {
  return document.createElement(el);
};
const createOriginalListAbilities = async (pokemonAbilities) => {
  const input = createElements("input");
  input.setAttribute("type", "text");
  const ul = await createListAndTableAbilitiesFilter(pokemonAbilities, input);
  div.append(ul);
};
const createListAndTableAbilitiesFilter = (pokemonAbilities, input) => {
  const ul = createElements("ul");
  ul.setAttribute("id", "ul");
  const li = createElements("li");
  li.append(input);
  ul.append(li);
  let inputValue = "";
  input.addEventListener("input", (ev) => {
    inputValue = ev.target.value;
    document.querySelectorAll("#ability").forEach((el) => {
      el.remove();
    });
    showAbilities(pokemonAbilities, inputValue, ul);
  });
  showAbilities(pokemonAbilities, inputValue, ul);
  return ul;
};
const showAbilities = (pokemonAbilities, inputValue, ul) => {
  let pokemonFilter = pokemonAbilities.filter((el) =>
    el.name.includes(inputValue)
  );
  if (pokemonFilter.length === 0) {
    const li = createElements("li");
    const txt = document.createTextNode(
      `El pokemon no puede aprender ninguna habilidad con ese nombre`
    );
    li.setAttribute("id", "ability");
    li.append(txt);
    ul.append(li);
  }
  pokemonFilter.forEach((el) => {
    const li = createElements("li");
    const txt = document.createTextNode(`${el.name}`);
    li.setAttribute("id", "ability");
    li.append(txt);
    li.addEventListener("click", async (ev) => {
      abilityUrl = el.name;
      ul.remove();
      const urlAbility = pokemonAbilities.find(
        (el) => el.name === abilityUrl
      ).url;
      const abilityData = await consumeAbilities(urlAbility);
      const { table, tHead, tBody, trB } = createTable();
      table.setAttribute("id", "tableAbility");
      const valuesAbility = Object.values(abilityData);
      const keysAbility = Object.keys(abilityData);
      createTh(keysAbility, tHead, table, tBody);
      table.addEventListener("click", () => {
        table.remove();
        createOriginalListAbilities(pokemonAbilities);
      });
      valuesAbility.forEach((el) => {
        const td = createElements("td");
        const txt = document.createTextNode(el);
        td.append(txt);
        tBody.append(td);
        tBody.append(trB);
      });
      div.append(table);
    });
    ul.append(li);
  });
};

const createTable = () => {
  const table = createElements("table");
  table.setAttribute("class", "table");
  const tHead = createElements("thead");
  const tBody = createElements("tbody");
  const trH = createElements("tr");
  const trB = createElements("tr");
  table.append(tHead);
  tHead.append(trH);
  return { table, tHead, tBody, trH, trB };
};

const createTh = (keys, tHead, table, tBody) => {
  keys.forEach((el) => {
    const th = createElements("th");
    const txt = document.createTextNode(el);
    th.append(txt);
    tHead.append(th);
  });
  table.append(tBody);
};

const tableData = async () => {
  if (inputN.value && isNaN(inputN.value)) {
    const { table, tHead, tBody, trB } = createTable();
    const pokemonObj = await getDataPokemon(inputN.value);
    console.log(pokemonObj);
    const pokemonAbilities = pokemonObj[1];
    const valuesPokemon = Object.values(pokemonObj[0]);
    const keysPokemon = Object.keys(pokemonObj[0]);
    createTh(keysPokemon, tHead, table, tBody);
    valuesPokemon.forEach((el) => {
      if (isNaN(el) && el.includes("https")) {
        const td = createElements("td");
        const image = createElements("img");
        image.setAttribute("src", el);
        image.setAttribute("class", "images");
        td.append(image);
        tBody.append(td);
      } else {
        const td = createElements("td");
        const txt = document.createTextNode(el);
        td.append(txt);
        tBody.append(td);
      }
    });
    tBody.append(trB);
    div.append(table);
    createOriginalListAbilities(pokemonAbilities);
  } else {
    errorMess.textContent = "Escriba un pokemon";
    errorMess.style.display = "block";
  }
};
