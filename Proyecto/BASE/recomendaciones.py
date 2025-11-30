import ast
import pandas as pd
from typing import List, Set, Dict, Any


class MotorRecomendacion:
    def __init__(
        self,
        reglas: pd.DataFrame,
        min_confidence_recom: float = 0.4,
        min_lift_recom: float = 1.0
    ):
        self.reglas = reglas.copy()
        self.min_confidence_recom = min_confidence_recom
        self.min_lift_recom = min_lift_recom


        self._parsear_conjuntos()

        # Construir ranking de productos (índice de necesidad)
        self.ranking_productos = self._calcular_indice_necesidad()
        self.ranking_productos_clasif = self._clasificar_productos(self.ranking_productos)


    @classmethod
    def desde_csv(
        cls,
        ruta_csv_reglas: str,
        min_confidence_recom: float = 0.4,
        min_lift_recom: float = 1.0
    ):
        reglas = pd.read_csv(ruta_csv_reglas)
        return cls(reglas, min_confidence_recom, min_lift_recom)


    def _parsear_conjuntos(self):

        def to_set(x):

            if isinstance(x, (set, frozenset, list, tuple)):
                return set(x)


            if x is None or (isinstance(x, float) and pd.isna(x)):
                return set()

            if isinstance(x, str):
                s = x.strip()

                if s.startswith("frozenset"):

                    inner = s[len("frozenset("):-1]

                    try:
                        return set(ast.literal_eval(inner))
                    except Exception:

                        return set()
                else:

                    try:
                        return set(ast.literal_eval(s))
                    except Exception:
                        return set()


            return set()

        self.reglas['antecedents_set'] = self.reglas['antecedents'].apply(to_set)
        self.reglas['consequents_set'] = self.reglas['consequents'].apply(to_set)
    def _calcular_indice_necesidad(self) -> pd.DataFrame:

        registros = []

        for _, row in self.reglas.iterrows():

            for prod in row['consequents_set']:
                registros.append({
                    'producto': prod,
                    'support_conseq': row.get('consequent support', row.get('support', 0)),
                    'confidence': row['confidence'],
                    'lift': row['lift']
                })

        df_score = pd.DataFrame(registros)

        if df_score.empty:
            return pd.DataFrame(columns=[
                'producto', 'soporte_prom', 'confianza_prom',
                'lift_prom', 'apariciones', 'indice_necesidad'
            ])

        resumen = df_score.groupby('producto').agg(
            soporte_prom=('support_conseq', 'mean'),
            confianza_prom=('confidence', 'mean'),
            lift_prom=('lift', 'mean'),
            apariciones=('producto', 'count')
        ).reset_index()

        resumen['apariciones_norm'] = resumen['apariciones'] / resumen['apariciones'].max()


        resumen['indice_necesidad'] = (
            0.4 * resumen['soporte_prom'] +
            0.3 * resumen['confianza_prom'] +
            0.2 * resumen['lift_prom'] +
            0.1 * resumen['apariciones_norm']
        )

        return resumen.sort_values(by='indice_necesidad', ascending=False)

    def _clasificar_productos(self, ranking: pd.DataFrame) -> pd.DataFrame:

        if ranking.empty:
            ranking['clasificacion'] = []
            return ranking

        q1 = ranking['indice_necesidad'].quantile(0.33)
        q2 = ranking['indice_necesidad'].quantile(0.66)

        def clase(x):
            if x >= q2:
                return "NECESARIO"
            elif x <= q1:
                return "PRESCINDIBLE"
            else:
                return "INTERMEDIO"

        ranking['clasificacion'] = ranking['indice_necesidad'].apply(clase)
        return ranking


    def recomendar_productos(self, carrito_usuario: List[str]) -> Set[str]:

        carrito_set = set(carrito_usuario)
        recomendaciones = set()

        for _, row in self.reglas.iterrows():
            antecedente = row['antecedents_set']
            consecuente = row['consequents_set']


            if antecedente.issubset(carrito_set):

                if row['confidence'] >= self.min_confidence_recom and row['lift'] >= self.min_lift_recom:
                    for prod in consecuente:
                        if prod not in carrito_set:
                            recomendaciones.add(prod)

        return recomendaciones

    def detectar_prescindibles(self, carrito_usuario: List[str]) -> List[str]:

        carrito_set = set(carrito_usuario)
        ranking = self.ranking_productos_clasif

        prescindibles = ranking[
            (ranking['producto'].isin(carrito_set)) &
            (ranking['clasificacion'] == 'PRESCINDIBLE')
        ]['producto'].tolist()

        return prescindibles

    def info_productos_carrito(self, carrito_usuario: List[str]) -> pd.DataFrame:

        carrito_set = set(carrito_usuario)
        ranking = self.ranking_productos_clasif

        info = ranking[ranking['producto'].isin(carrito_set)].copy()
        return info.sort_values(by='indice_necesidad', ascending=False)

    def analizar_carrito(self, carrito_usuario: List[str]) -> Dict[str, Any]:
        recomendaciones = self.recomendar_productos(carrito_usuario)
        prescindibles = self.detectar_prescindibles(carrito_usuario)
        info_carrito = self.info_productos_carrito(carrito_usuario)

        return {
            "carrito_original": list(carrito_usuario),
            "recomendaciones": list(recomendaciones),
            "prescindibles": prescindibles,
            "info_carrito": info_carrito
        }
