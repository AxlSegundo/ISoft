# Proyecto/BASE/api.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any, Dict

from BASE.recomendaciones import MotorRecomendacion  # tu clase

# ---------- RUTA DEL CSV DE REGLAS (relativa a este archivo) ----------
BASE_DIR = os.path.dirname(__file__)
RUTA_REGLAS = os.path.join(BASE_DIR, "Salidas", "reglas_asociacion_completas.csv")

# Cargar motor una sola vez al iniciar la API
motor = MotorRecomendacion.desde_csv(
    ruta_csv_reglas=RUTA_REGLAS,
    min_confidence_recom=0.4,
    min_lift_recom=1.0
)

# ---------- Crear app FastAPI ----------
app = FastAPI(title="API Asistente de Compras")

# CORS para que el frontend en JS pueda llamar a la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # en producción pones el dominio específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Modelos ----------
class CarritoRequest(BaseModel):
    items: List[str]

class AnalisisResponse(BaseModel):
    carrito_original: List[str]
    recomendaciones: List[str]
    prescindibles: List[str]
    info_carrito: List[Dict[str, Any]]


# ---------- Endpoints ----------
@app.get("/")
def root():
    return {"mensaje": "API del Asistente de Compras funcionando"}

@app.post("/analizar_carrito", response_model=AnalisisResponse)
def analizar_carrito(req: CarritoRequest):
    resultado = motor.analizar_carrito(req.items)
    info_carrito_reg = resultado["info_carrito"].to_dict(orient="records")

    return AnalisisResponse(
        carrito_original=resultado["carrito_original"],
        recomendaciones=resultado["recomendaciones"],
        prescindibles=resultado["prescindibles"],
        info_carrito=info_carrito_reg
    )
