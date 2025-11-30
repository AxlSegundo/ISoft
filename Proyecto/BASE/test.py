from BASE.recomendaciones import MotorRecomendacion

def main():
    ruta_reglas = "Proyecto\\BASE\\Salidas\\reglas_asociacion_completas.csv"


    motor = MotorRecomendacion.desde_csv(
        ruta_csv_reglas=ruta_reglas,
        min_confidence_recom=0.4,
        min_lift_recom=1.0
    )


    carrito_usuario = ["bread", "milk", "diapers", "beers"]

    resultado = motor.analizar_carrito(carrito_usuario)

    print("Carrito original:", resultado["carrito_original"])
    print("\nProductos recomendados (necesarios faltantes):")
    print(resultado["recomendaciones"])

    print("\nProductos prescindibles dentro del carrito:")
    print(resultado["prescindibles"])

    print("\nInformación de los productos del carrito:")
    print(resultado["info_carrito"])

if __name__ == "__main__":
    main()
