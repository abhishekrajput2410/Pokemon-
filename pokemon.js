const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("type-filter");
const loadMoreBtn = document.getElementById("load-more");

let allPokemon = [];
let displayedPokemon = [];
let offset = 0;
const limit = 10;

const getPokemonList = async (offset, limit) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
  const data = await response.json();
  return data.results;
};

const getPokemonData = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const displayPokemon = (pokemonList, append = false) => {
  const cards = pokemonList.map(pokemon => {
    const types = pokemon.types.map(t => t.type.name).join(', ');
    return `
      <div class="card">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        <h3>${pokemon.name}</h3>
        <p>Type : ${types}</p>
      </div>
    `;
  }).join("");

  if (append) {
    container.insertAdjacentHTML("beforeend", cards);
  } else {
    container.innerHTML = cards;
  }
};

const populateTypeFilter = (pokemonList) => {
  const typeSet = new Set();
  pokemonList.forEach(p => p.types.forEach(t => typeSet.add(t.type.name)));
  typeFilter.innerHTML = `<option value="all">Filter By Type</option>`;
  typeSet.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeFilter.appendChild(option);
  });
};

const loadMorePokemon = async () => {
  const basicList = await getPokemonList(offset, limit);
  const detailedList = await Promise.all(basicList.map(p => getPokemonData(p.url)));
  allPokemon = allPokemon.concat(detailedList);
  displayedPokemon = displayedPokemon.concat(detailedList);
  displayPokemon(detailedList, true);
  offset += limit;

  if (offset === limit) populateTypeFilter(allPokemon);
};

const filterAndRender = () => {
  const name = searchInput.value.toLowerCase();
  const type = typeFilter.value;

  const filtered = allPokemon.filter(p =>
    p.name.toLowerCase().includes(name) &&
    (type === "all" || p.types.some(t => t.type.name === type))
  );

  container.innerHTML = "";
  displayPokemon(filtered);
};

searchInput.addEventListener("input", filterAndRender);
typeFilter.addEventListener("change", filterAndRender);
loadMoreBtn.addEventListener("click", loadMorePokemon);


loadMorePokemon();
