// URL de tu API FastAPI
const API_URL = "http://127.0.0.1:8000/analizar_carrito";

document.getElementById("btn-analizar").addEventListener("click", async () => {
  const input = document.getElementById("carrito-input").value;

  // Convertir "bread, milk, diapers, beers" -> ["bread","milk","diapers","beers"]
  const items = input
    .split(",")
    .map(x => x.trim())
    .filter(x => x.length > 0);

  if (items.length === 0) {
    alert("Por favor escribe al menos un producto.");
    return;
  }

  // Mostrar carrito interpretado
  document.getElementById("carrito-original").textContent = items.join(", ");

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
    alert("Ocurrió un error al conectar con la API (revisa que uvicorn esté corriendo).");
  }
});

function mostrarResultados(data) {
  // Recomendaciones
  const ulRec = document.getElementById("lista-recomendaciones");
  ulRec.innerHTML = "";
  if (!data.recomendaciones || data.recomendaciones.length === 0) {
    ulRec.innerHTML = "<li>Sin recomendaciones.</li>";
  } else {
    data.recomendaciones.forEach(prod => {
      const li = document.createElement("li");
      li.textContent = prod;
      ulRec.appendChild(li);
    });
  }

  // Prescindibles
  const ulPre = document.getElementById("lista-prescindibles");
  ulPre.innerHTML = "";
  if (!data.prescindibles || data.prescindibles.length === 0) {
    ulPre.innerHTML = "<li>No se detectaron productos prescindibles.</li>";
  } else {
    data.prescindibles.forEach(prod => {
      const li = document.createElement("li");
      li.textContent = prod;
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
      tdProd.textContent = row.producto ?? "(sin nombre)";

      const tdIndice = document.createElement("td");
      const indice = row.indice_necesidad ?? 0;
      tdIndice.textContent = indice.toFixed ? indice.toFixed(3) : indice;

      const tdClas = document.createElement("td");
      const clas = row.clasificacion || "SIN_CLASIFICAR";
      tdClas.textContent = clas;
      tdClas.classList.add("tag");
      if (["NECESARIO", "INTERMEDIO", "PRESCINDIBLE"].includes(clas)) {
        tdClas.classList.add(clas);
      }

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
