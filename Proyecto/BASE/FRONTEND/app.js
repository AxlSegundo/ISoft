// URL de tu API FastAPI
const API_URL = "http://127.0.0.1:8000/analizar_carrito";

// 1) Catálogo completo (ID interno en inglés, nombre en español)
const CATALOG = [
  // BASICOS
  { id: "whole milk", name: "Leche", category: "Básicos", emoji: "🥛" },
  { id: "bread", name: "Pan", category: "Básicos", emoji: "🍞" },
  { id: "eggs", name: "Huevos", category: "Básicos", emoji: "🥚" },
  { id: "rice", name: "Arroz", category: "Básicos", emoji: "🍚" },
  { id: "beans", name: "Frijoles", category: "Básicos", emoji: "🫘" },
  { id: "cooking oil", name: "Aceite", category: "Básicos", emoji: "🧴" },
  { id: "sugar", name: "Azúcar", category: "Básicos", emoji: "🧂" },
  { id: "salt", name: "Sal", category: "Básicos", emoji: "🧂" },
  { id: "chicken", name: "Pollo", category: "Básicos", emoji: "🍗" },
  { id: "tortillas", name: "Tortillas", category: "Básicos", emoji: "🫓" },

  // FRESCOS
  { id: "tomato", name: "Jitomate", category: "Frescos", emoji: "🍅" },
  { id: "onion", name: "Cebolla", category: "Frescos", emoji: "🧅" },
  { id: "lettuce", name: "Lechuga", category: "Frescos", emoji: "🥬" },
  { id: "banana", name: "Plátano", category: "Frescos", emoji: "🍌" },
  { id: "apple", name: "Manzana", category: "Frescos", emoji: "🍎" },
  { id: "carrot", name: "Zanahoria", category: "Frescos", emoji: "🥕" },
  { id: "potato", name: "Papa", category: "Frescos", emoji: "🥔" },
  { id: "orange", name: "Naranja", category: "Frescos", emoji: "🍊" },
  { id: "cucumber", name: "Pepino", category: "Frescos", emoji: "🥒" },

  // LIMPIEZA
  { id: "laundry detergent", name: "Detergente", category: "Limpieza", emoji: "🧺" },
  { id: "dish soap", name: "Jabón de trastes", category: "Limpieza", emoji: "🧼" },
  { id: "shampoo", name: "Shampoo", category: "Limpieza", emoji: "🧴" },
  { id: "toothpaste", name: "Pasta dental", category: "Limpieza", emoji: "🪥" },
  { id: "toilet paper", name: "Papel higiénico", category: "Limpieza", emoji: "🧻" },
  { id: "bleach", name: "Cloro", category: "Limpieza", emoji: "🧴" },

  // SNACKS
  { id: "chips", name: "Papas fritas", category: "Snacks", emoji: "🍟" },
  { id: "soda", name: "Refresco", category: "Snacks", emoji: "🥤" },
  { id: "cookies", name: "Galletas", category: "Snacks", emoji: "🍪" },
  { id: "chocolate", name: "Chocolate", category: "Snacks", emoji: "🍫" },
  { id: "ice cream", name: "Helado", category: "Snacks", emoji: "🍨" },
  { id: "beer", name: "Cerveza", category: "Snacks", emoji: "🍺" },

  // OTROS
  { id: "yogurt", name: "Yogurt", category: "Otros", emoji: "🥛" },
  { id: "cheese", name: "Queso", category: "Otros", emoji: "🧀" },
  { id: "ham", name: "Jamón", category: "Otros", emoji: "🥓" },
  { id: "cereal", name: "Cereal", category: "Otros", emoji: "🥣" },
  { id: "pasta", name: "Pasta", category: "Otros", emoji: "🍝" },
  { id: "tomato sauce", name: "Salsa de tomate", category: "Otros", emoji: "🍅" },
  { id: "coffee", name: "Café", category: "Otros", emoji: "☕" },
  { id: "tea", name: "Té", category: "Otros", emoji: "🍵" }
];

// Subconjunto destacado para el carrusel (7 productos)
const FEATURED_IDS = [
  "whole milk",
  "bread",
  "eggs",
  "chips",
  "beer",
  "pasta",
  "tomato sauce"
];

const FEATURED = CATALOG.filter(p => FEATURED_IDS.includes(p.id));

const selectedItems = new Set();
let carouselIndex = 0; // índice del primer producto mostrado en el carrusel
const CAROUSEL_VISIBLE = 4;

document.addEventListener("DOMContentLoaded", () => {
  renderCarousel();
  updateCarritoUI();

  document.getElementById("btn-prev").addEventListener("click", () => {
    carouselIndex = (carouselIndex - 1 + FEATURED.length) % FEATURED.length;
    renderCarousel();
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    carouselIndex = (carouselIndex + 1) % FEATURED.length;
    renderCarousel();
  });

  document.getElementById("btn-add-search").addEventListener("click", addFromSearch);
  document.getElementById("btn-analizar").addEventListener("click", analizarCarrito);

  // Escuchar lo que se escribe para mostrar sugerencias
  document.getElementById("search-input").addEventListener("input", onSearchInput);
});


function renderCarousel() {
  const track = document.getElementById("carousel-track");
  track.innerHTML = "";

  for (let i = 0; i < CAROUSEL_VISIBLE; i++) {
    const idx = (carouselIndex + i) % FEATURED.length;
    const prod = FEATURED[idx];

    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = prod.id;

    if (selectedItems.has(prod.id)) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="product-icon">${prod.emoji}</div>
      <div class="product-name">${prod.name}</div>
      <div class="product-category">${prod.category}</div>
      <div class="product-foot">
        <span class="pill">${prod.id}</span>
        <span class="small-text">click para seleccionar</span>
      </div>
    `;

    card.addEventListener("click", () => toggleProduct(prod.id));
    track.appendChild(card);
  }
}

function toggleProduct(productId) {
  if (selectedItems.has(productId)) {
    selectedItems.delete(productId);
  } else {
    selectedItems.add(productId);
  }
  renderCarousel();
  updateCarritoUI();
}


function onSearchInput(e) {
  const term = e.target.value.trim().toLowerCase();
  const box = document.getElementById("search-suggestions");
  box.innerHTML = "";

  if (!term) {
    return; 
  }

  // Buscar coincidencias por nombre en español o id en inglés
  const matches = CATALOG.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.id.toLowerCase().includes(term)
  ).slice(0, 8); // máximo 8 sugerencias

  if (matches.length === 0) return;

  const list = document.createElement("div");
  list.className = "suggestion-list";

  matches.forEach(prod => {
    const item = document.createElement("div");
    item.className = "suggestion-item";

    item.innerHTML = `
      <div>
        <span class="suggestion-name">${prod.emoji} ${prod.name}</span><br>
        <span class="suggestion-extra">${prod.category} · ID: ${prod.id}</span>
      </div>
      <div class="suggestion-extra">Click para agregar</div>
    `;

    item.addEventListener("click", () => {
      selectedItems.add(prod.id);
      document.getElementById("search-input").value = "";
      box.innerHTML = "";
      renderCarousel();
      updateCarritoUI();
    });

    list.appendChild(item);
  });

  box.appendChild(list);
}

function addFromSearch() {
  const input = document.getElementById("search-input");
  const term = input.value.trim();
  if (!term) return;

  const lowerTerm = term.toLowerCase();

  const prod = CATALOG.find(
    p =>
      p.name.toLowerCase() === lowerTerm ||
      p.id.toLowerCase() === lowerTerm
  );

  if (!prod) {
    alert("No se encontró un producto con ese nombre. Intenta escribirlo como aparece en las sugerencias.");
    return;
  }

  selectedItems.add(prod.id);
  input.value = "";
  document.getElementById("search-suggestions").innerHTML = "";
  renderCarousel();
  updateCarritoUI();
}


function updateCarritoUI() {
  const cont = document.getElementById("carrito-chips");
  cont.innerHTML = "";

  const btn = document.getElementById("btn-analizar");
  const estado = document.getElementById("estado-carrito");

  if (selectedItems.size === 0) {
    btn.disabled = true;
    estado.textContent = "Selecciona o busca al menos un producto para poder analizar el carrito.";
    return;
  }

  btn.disabled = false;
  estado.textContent = `Productos en el carrito: ${selectedItems.size}`;

  selectedItems.forEach(id => {
    const prod = CATALOG.find(p => p.id === id);
    const chip = document.createElement("div");
    chip.className = "chip";

    const name = prod ? prod.name : id;

    chip.innerHTML = `
      <span>${name}</span>
      <span class="remove" title="Quitar del carrito">✕</span>
    `;

    chip.querySelector(".remove").addEventListener("click", () => {
      selectedItems.delete(id);
      renderCarousel();
      updateCarritoUI();
    });

    cont.appendChild(chip);
  });
}


async function analizarCarrito() {
  const items = Array.from(selectedItems);

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    if (!resp.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await resp.json();
    mostrarResultados(data);
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al conectar con la API. Verifica que esté ejecutándose con uvicorn.");
  }
}

// Helper: obtener nombre en español desde el ID
function getProductNameById(id) {
  const p = CATALOG.find(p => p.id === id);
  return p ? p.name : id;
}


function mostrarResultados(data) {
  // Recomendaciones
  const ulRec = document.getElementById("lista-recomendaciones");
  ulRec.innerHTML = "";
  if (!data.recomendaciones || data.recomendaciones.length === 0) {
    ulRec.innerHTML = "<li>Sin recomendaciones para este carrito.</li>";
  } else {
    data.recomendaciones.forEach(id => {
      const li = document.createElement("li");

      const spanNombre = document.createElement("span");
      spanNombre.textContent = getProductNameById(id);

      const btnAdd = document.createElement("button");
      btnAdd.className = "btn-mini add";
      btnAdd.textContent = "Agregar al carrito";
      btnAdd.addEventListener("click", () => {
        selectedItems.add(id);
        renderCarousel();
        updateCarritoUI();
      });

      li.appendChild(spanNombre);
      li.appendChild(btnAdd);
      ulRec.appendChild(li);
    });
  }

  // Prescindibles
  const ulPre = document.getElementById("lista-prescindibles");
  ulPre.innerHTML = "";
  if (!data.prescindibles || data.prescindibles.length === 0) {
    ulPre.innerHTML = "<li>No se detectaron productos prescindibles en este carrito.</li>";
  } else {
    data.prescindibles.forEach(id => {
      const li = document.createElement("li");

      const spanNombre = document.createElement("span");
      spanNombre.textContent = getProductNameById(id);

      const btnRemove = document.createElement("button");
      btnRemove.className = "btn-mini remove";
      btnRemove.textContent = "Quitar del carrito";
      btnRemove.addEventListener("click", () => {
        selectedItems.delete(id);
        renderCarousel();
        updateCarritoUI();
      });

      li.appendChild(spanNombre);
      li.appendChild(btnRemove);
      ulPre.appendChild(li);
    });
  }

  // Tabla info carrito
  const tbody = document.getElementById("tabla-info-carrito");
  tbody.innerHTML = "";

  if (data.info_carrito && data.info_carrito.length > 0) {
    data.info_carrito.forEach(row => {
      const tr = document.createElement("tr");

      const tdProd = document.createElement("td");
      tdProd.textContent = getProductNameById(row.producto ?? row.id ?? "");

      const tdIndice = document.createElement("td");
      const indice = row.indice_necesidad ?? 0;
      tdIndice.textContent = indice.toFixed ? indice.toFixed(3) : indice;

      const tdClas = document.createElement("td");
      const clas = row.clasificacion || "SIN_CLASIFICAR";
      const span = document.createElement("span");
      span.textContent = clas;
      span.classList.add("tag");
      if (["NECESARIO", "INTERMEDIO", "PRESCINDIBLE"].includes(clas)) {
        span.classList.add(clas);
      }
      tdClas.appendChild(span);

      tr.appendChild(tdProd);
      tr.appendChild(tdIndice);
      tr.appendChild(tdClas);
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = "No hay información disponible para los productos del carrito.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}
