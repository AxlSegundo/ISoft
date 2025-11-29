import pandas as pd
import os
# 1 Carga y creación para los ID de transacción
def cargar_groceries(ruta_csv: str) -> pd.DataFrame:
    df = pd.read_csv(ruta_csv)

    df.columns = ['Member_number', 'Date', 'itemDescription']
    

    df['TransactionID'] = df['Member_number'].astype(str) + '_' + df['Date'].astype(str)
    
    return df

# 2 Para facilitar el trabajo, se crea iuna matriz de transacciones
def construir_matriz_transacciones(df: pd.DataFrame) -> pd.DataFrame:

    df['value'] = 1
    
    basket = df.pivot_table(
        index='TransactionID',
        columns='itemDescription',
        values='value',
        aggfunc='max',   
        fill_value=0
    )
    

    basket = basket.astype(bool)
    return basket

# 3 Apriori
from mlxtend.frequent_patterns import apriori, association_rules

def obtener_reglas(basket: pd.DataFrame,
                   min_support: float = 0.01,
                   min_confidence: float = 0.3,
                   min_lift: float = 1.0) -> pd.DataFrame:

    frequent_itemsets = apriori(
        basket,
        min_support=min_support,
        use_colnames=True
    )
    

    rules = association_rules(
        frequent_itemsets,
        metric="confidence",
        min_threshold=min_confidence
    )
    

    rules = rules[rules['lift'] >= min_lift].reset_index(drop=True)
    
    return rules

# 4 Execución completa
def main():
    ruta = "Proyecto\\BASE\\ventas.csv"  

    df = cargar_groceries(ruta)
    print("Filas originales:", len(df))
    
    basket = construir_matriz_transacciones(df)
    print("Número de transacciones:", basket.shape[0])
    print("Número de productos distintos:", basket.shape[1])
    
    rules = obtener_reglas(
        basket,
        min_support=0.01,      
        min_confidence=0.4,    
        min_lift=1.0
    )
    

    print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].head(10))
    print("Total de reglas generadas:", len(rules))


    ruta_salida = "Proyecto\\BASE\\Salidas"
    os.makedirs(ruta_salida, exist_ok=True)


    ruta_reglas_completas = os.path.join(ruta_salida, "reglas_asociacion_completas.csv")
    rules.to_csv(ruta_reglas_completas, index=False)
    

    reglas_reporte = rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']]
    ruta_reglas_reporte = os.path.join(ruta_salida, "reglas_asociacion_reporte.csv")
    reglas_reporte.to_csv(ruta_reglas_reporte, index=False)

    print("Archivos guardados en:", ruta_salida)
    print(" - reglas_asociacion_completas.csv")
    print(" - reglas_asociacion_reporte.csv")

if __name__ == "__main__":
    main()
