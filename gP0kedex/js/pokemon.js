/* =========================
   CONFIGURATION
========================= */

const API_URL = "https://api.tcgdex.net/v2/fr/cards";

const CARDS_PER_PAGE = 24;

let currentPage = 1;
let currentSearch = "";

let searchTimeout = null;
let currentController = null;

/* =========================
   ELEMENTS HTML
========================= */

const pokemonContainer =
    document.getElementById("pokemon");

const searchInput =
    document.getElementById("searchPokemon");

const loading =
    document.getElementById("loading");

const previousButton =
    document.getElementById("previousPage");

const nextButton =
    document.getElementById("nextPage");

const pageNumber =
    document.getElementById("pageNumber");

/* =========================
   RECUPERATION DES CARTES
========================= */

async function loadPokemonCards() {

    if (currentController) {
        currentController.abort();
    }

    currentController = new AbortController();

    const signal = currentController.signal;

    loading.style.display = "block";
    loading.classList.remove("error");
    loading.textContent = "Chargement des cartes Pokémon...";

    pokemonContainer.innerHTML = "";

    previousButton.disabled = true;
    nextButton.disabled = true;

    try {

        const params = new URLSearchParams();

        params.set("pagination:page", currentPage);
        params.set("pagination:itemsPerPage", CARDS_PER_PAGE);

        if (currentSearch.trim() !== "") {
            params.set("name", currentSearch.trim());
        }

        const response = await fetch(
            `${API_URL}?${params.toString()}`, { signal }
        );

        if (!response.ok) {
            throw new Error("Erreur lors du chargement de l'API");
        }

        const cards = await response.json();

        if (!Array.isArray(cards)) {
            throw new Error("Réponse API invalide");
        }

        loading.style.display = "none";

        if (cards.length === 0) {

            loading.style.display = "block";
            loading.textContent = "Aucune carte trouvée.";

            return;
        }

        cards.forEach((card, index) => {

            createPokemonCard(card, index);

        });

        previousButton.disabled = currentPage <= 1;

        nextButton.disabled =
            cards.length < CARDS_PER_PAGE;

        pageNumber.textContent = `Page ${currentPage}`;

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error(error);

        loading.style.display = "block";
        loading.classList.add("error");

        loading.textContent =
            "Impossible de charger les cartes. Vérifie ta connexion et réessaie.";

    }

}

/* =========================
   CREATION D'UNE CARTE
========================= */

function createPokemonCard(card, index) {

    const wrapper = document.createElement("div");

    wrapper.className = "pokemon-item";

    const cardElement = document.createElement("div");

    cardElement.className = "tcg-card";

    const image = document.createElement("img");

    image.alt = card.name || "Carte Pokémon";

    image.loading = "lazy";

    image.decoding = "async";

    if (card.image) {

        image.src = `${card.image}/low.webp`;

    } else {

        image.alt = "Image indisponible";

    }

    const foil = document.createElement("div");

    foil.className = "foil";

    cardElement.appendChild(image);
    cardElement.appendChild(foil);

    /* Informations sous la carte */

    const info = document.createElement("div");

    const name = document.createElement("h2");

    const number = document.createElement("span");

    info.appendChild(name);
    info.appendChild(number);

    wrapper.appendChild(cardElement);
    wrapper.appendChild(info);

    pokemonContainer.appendChild(wrapper);

    /* Effet holographique 3D */

    addHolographicEffect(cardElement);

}

/* =========================
   EFFET 3D ET REFLET
========================= */

function addHolographicEffect(card) {

    card.addEventListener("pointermove", (event) => {

        if (event.pointerType !== "mouse") return;

        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY =
            ((x - centerX) / centerX) * 14;

        const rotateX =
            ((centerY - y) / centerY) * 14;

        const pointerX =
            (x / rect.width) * 100;

        const pointerY =
            (y / rect.height) * 100;

        card.style.setProperty(
            "--pointer-x",
            `${pointerX}%`
        );

        card.style.setProperty(
            "--pointer-y",
            `${pointerY}%`
        );

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(1.04, 1.04, 1.04)
        `;

    });

    card.addEventListener("pointerleave", () => {

        card.style.transform = "";

        card.style.setProperty(
            "--pointer-x",
            "50%"
        );

        card.style.setProperty(
            "--pointer-y",
            "50%"
        );

    });

}

/* =========================
   RECHERCHE
========================= */

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        currentSearch = searchInput.value.trim();

        currentPage = 1;

        loadPokemonCards();

    }, 450);

});

/* =========================
   PAGINATION
========================= */

previousButton.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        loadPokemonCards();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

});

nextButton.addEventListener("click", () => {

    currentPage++;

    loadPokemonCards();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

/* =========================
   INITIALISATION
========================= */

loadPokemonCards();