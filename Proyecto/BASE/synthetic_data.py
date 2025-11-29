import random
import pandas as pd
from datetime import date, timedelta

# ------------------------------
# 1. Catálogo de productos
# ------------------------------
BASICOS = [
    "whole milk", "bread", "eggs", "rice", "beans",
    "cooking oil", "sugar", "salt", "chicken", "tortillas"
]

FRESCOS = [
    "tomato", "onion", "lettuce", "banana", "apple",
    "carrot", "potato", "orange", "cucumber"
]

LIMPIEZA = [
    "laundry detergent", "dish soap", "shampoo",
    "toothpaste", "toilet paper", "bleach"
]

SNACKS = [
    "chips", "soda", "cookies", "chocolate",
    "ice cream", "beer"
]

OTROS = [
    "yogurt", "cheese", "ham", "cereal",
    "pasta", "tomato sauce", "coffee", "tea"
]

CATALOGO = BASICOS + FRESCOS + LIMPIEZA + SNACKS + OTROS

# ------------------------------
# 2. Fechas aleatorias en 2015
# ------------------------------
def random_date_2015():
    start = date(2015, 1, 1)
    end = date(2015, 12, 31)
    delta = end - start
    # días aleatorios
    d = start + timedelta(days=random.randint(0, delta.days))
    # Formato dd-mm-2015 para parecerse al tuyo
    return d.strftime("%d-%m-%Y")

# ------------------------------
# 3. Generar una transacción
# ------------------------------
def generar_transaccion():
    """
    Regresa una lista de productos (sin repetir) para una transacción.
    """
    # Tamaño del carrito: entre 5 y 15 productos
    tam = random.randint(5, 15)
    items = set()

    # Siempre incluir algunos básicos (2–4)
    n_basicos = random.randint(2, 4)
    items.update(random.sample(BASICOS, k=n_basicos))

    # Resto de productos de otras categorías
    while len(items) < tam:
        categoria = random.choices(
            population=["BASICOS", "FRESCOS", "LIMPIEZA", "SNACKS", "OTROS"],
            weights=[0.3, 0.25, 0.15, 0.2, 0.1]
        )[0]

        if categoria == "BASICOS":
            items.add(random.choice(BASICOS))
        elif categoria == "FRESCOS":
            items.add(random.choice(FRESCOS))
        elif categoria == "LIMPIEZA":
            items.add(random.choice(LIMPIEZA))
        elif categoria == "SNACKS":
            items.add(random.choice(SNACKS))
        elif categoria == "OTROS":
            items.add(random.choice(OTROS))

    # --------------------------
    #  Reglas "implícitas"
    # --------------------------
    # Si hay cereal, alta probabilidad de leche
    if "cereal" in items and "whole milk" not in items:
        if random.random() < 0.7:
            items.add("whole milk")

    # Si hay pasta, probabilidad de salsa de tomate
    if "pasta" in items and "tomato sauce" not in items:
        if random.random() < 0.7:
            items.add("tomato sauce")

    # Si hay chips, probabilidad de soda
    if "chips" in items and "soda" not in items:
        if random.random() < 0.6:
            items.add("soda")

    # Si hay beer, probabilidad de chips o snacks
    if "beer" in items:
        if random.random() < 0.5:
            items.add("chips")
        if random.random() < 0.3:
            items.add("cookies")

    return list(items)

# ------------------------------
# 4. Generar dataset completo
# ------------------------------
def generar_dataset_sintetico(
    n_transacciones=30000,
    min_member=1000,
    max_member=4000,
    ruta_salida="Proyecto\\BASE\\ventas.csv"
):
    filas = []

    for _ in range(n_transacciones):
        member = random.randint(min_member, max_member)
        fecha = random_date_2015()
        items = generar_transaccion()

        for item in items:
            filas.append({
                "Member_number": member,
                "Date": fecha,
                "itemDescription": item
            })

    df = pd.DataFrame(filas)
    df.to_csv(ruta_salida, index=False)
    print(f"Dataset generado: {ruta_salida}")
    print("Filas totales:", len(df))
    print("Transacciones aproximadas:", n_transacciones)
    print("Productos distintos:", df['itemDescription'].nunique())
    return df

if __name__ == "__main__":
    df = generar_dataset_sintetico()
