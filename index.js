const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let currentPokemon = 0;
let totalPokemon = 0;

// Updates the number of Pokemon shown and the total number of pokemon
function updateNum(current, total) {
  var current = currentPokemon;
  var total = totalPokemon;
  var h1NumPokemon = document.getElementById("updateNum");
  h1NumPokemon.textContent = "Showing " + current + " of " + total + " Pokemon";
}


const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  const maxDisplayedPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
  let endPage = Math.min(numPages, startPage + maxDisplayedPages - 1);

  // Adjust startPage if the endPage is at the maximum limit
  if (endPage === numPages) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }

  // Previous button
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Previous</button>
    `);
  }

  for (let i = startPage; i <= endPage; i++) {
    const buttonClass = i === currentPage ? "btn btn-primary page ml-1 numberedButtons active" : "btn btn-primary page ml-1 numberedButtons";
    $('#pagination').append(`
      <button class="${buttonClass}" value="${i}">${i}</button>
    `);
  }

  // Next button
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
    `);
  }

  
};



const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  currentPokemon = selected_pokemons.length;
  updateNum();

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}

const setup = async () => {
  // Fetch Pokémon types from the API
  let typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
  let types = typesResponse.data.results;

  // Display Pokémon types in a checkbox group
  const typeGroup = $('#typeGroup');
  const checkboxContainer = $('<div class="checkbox-container"></div>');
  types.forEach((type) => {
    const checkbox = $(`
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" value="${type.name}" id="${type.name}">
        <label class="form-check-label" for="${type.name}">
          ${type.name}
        </label>
      </div>
    `);
    checkboxContainer.append(checkbox);
  });
  typeGroup.append(checkboxContainer);



  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');

  pokemons = response.data.results;
  
  totalPokemon = pokemons.length;
  updateNum();


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)




  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

}


$(document).ready(setup)