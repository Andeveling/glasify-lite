"""
Analisis de Costos - Sistema Corredizo 5020 (Extralum)
Calcula costo real de fabricacion para configuración XO, XX, OXXO

Basado en costos de perfiles y accesorios proveidos por Vitro Rojas Panama
"""

from dataclasses import dataclass
from typing import Optional

# ================================================================
# COSTOS DE PERFILES (USD por metro lineal)
# ================================================================
PERFIL_COSTOS = {
    "marco_perimetral": 45.00,   # Marco 2 vías
    "perfil_hoja":      35.00,   # Hoja ventana
    "traslape":          15.00,   # Perfil de traslape
    "hoja_malla":        22.00,   # Marco de malla/cedazo
    "cuancho":            0.30,   # Metro lineal cuancho
    "felpa":              0.30,   # Metro felpa
    "guia_traslape":      0.50,   # Guia traslape
}

# ================================================================
# COSTOS DE ACCESORIOS (USD por unidad)
# ================================================================
ACCESORIOS_COSTOS = {
    "cerradura":             3.00,  # Por unidad
    "ruedas_hoja":            3.00,  # Por par
    "ruedas_malla":           1.00,  # Por par
    "escuadra_resorte":        1.00,  # Por unidad
    "escuadra_alineamiento":   0.10, # Por unidad
    "escuadra_malla":         0.40,  # Por unidad
    "tope":                   0.30,  # Por unidad
}

# ================================================================
# CONFIGURACIONES: Cantidad de cada componente por tipo de ventana
# ================================================================
@dataclass
class Configuracion:
    nombre: str
    cantidad_fijos: int
    cantidad_moviles: int
    cerraduras: int           # Por ventana
    pares_ruedas_hoja: int   # Por par (2 ruedas por par)
    escuadras_resorte: int
    escuadras_alineamiento: int
    topes: int

CONFIGURACIONES = {
    "XO": Configuracion(
        nombre="XO (1 fija + 1 movil)",
        cantidad_fijos=1,
        cantidad_moviles=1,
        cerraduras=1,
        pares_ruedas_hoja=2,   # 1 par por cada hoja (2 hojas)
        escuadras_resorte=4,
        escuadras_alineamiento=4,
        topes=2
    ),
    "XX": Configuracion(
        nombre="XX (2 moviles)",
        cantidad_fijos=0,
        cantidad_moviles=2,
        cerraduras=2,           # 2 hojas moviles = 2 cerraduras
        pares_ruedas_hoja=2,
        escuadras_resorte=4,
        escuadras_alineamiento=4,
        topes=2
    ),
    "OXXO": Configuracion(
        nombre="OXXO (2 fijas + 2 moviles)",
        cantidad_fijos=2,
        cantidad_moviles=2,
        cerraduras=2,           # 2 hojas moviles
        pares_ruedas_hoja=2,
        escuadras_resorte=4,
        escuadras_alineamiento=4,
        topes=2
    ),
}

# ================================================================
# PARAMETROS DE CORTE (mm) - Descuentos de perfileria
# Basados en fórmulas de despiece
# ================================================================
DESCUENTO_LATERAL_MM = 30    # Descuento total lateral (15mm por lado)
DESCUENTO_ALTURA_MM = 25     # Descuento en altura para holgura


def calcular_despicho(ancho_mm: int, alto_mm: int, config: str) -> dict:
    """
    Calcula el despiece completo para una ventana.
    
    Args:
        ancho_mm: Ancho total de la ventana en mm
        alto_mm: Alto total de la ventana en mm
        config: Configuracion ('XO', 'XX', 'OXXO')
    
    Returns:
        Dict con todos los cálculos de costo
    """
    config_data = CONFIGURACIONES[config]
    
    # Calcular medidas de hoja (descontando perfileria)
    # Todas las hojas tienen las mismas dimensiones
    ancho_hoja = (ancho_mm - DESCUENTO_LATERAL_MM) / 2
    alto_hoja = alto_mm - DESCUENTO_ALTURA_MM
    
    # Metros lineales de cada perfil
    marco_perimetral_ml = 2 * (ancho_mm + alto_mm) / 1000
    perfil_hoja_ml = (2 * alto_hoja * 2) / 1000  # 2 hojas x 2 lados
    traslape_ml = alto_hoja / 1000
    guia_traslape_ml = ancho_mm / 1000
    cuancho_ml = 2 * (ancho_mm + alto_mm) / 1000
    felpa_ml = 2 * alto_hoja * 2 / 1000
    
    # Costos de perfiles
    costo_marco = marco_perimetral_ml * PERFIL_COSTOS["marco_perimetral"]
    costo_perfil_hoja = perfil_hoja_ml * PERFIL_COSTOS["perfil_hoja"]
    costo_traslape = traslape_ml * PERFIL_COSTOS["traslape"]
    costo_guia = guia_traslape_ml * PERFIL_COSTOS["guia_traslape"]
    costo_cuancho = cuancho_ml * PERFIL_COSTOS["cuancho"]
    costo_felpa = felpa_ml * PERFIL_COSTOS["felpa"]
    
    costo_perfiles = (
        costo_marco + costo_perfil_hoja + costo_traslape +
        costo_guia + costo_cuancho + costo_felpa
    )
    
    # Costos de accesorios
    costo_cerraduras = config_data.cerraduras * ACCESORIOS_COSTOS["cerradura"]
    costo_ruedas = config_data.pares_ruedas_hoja * ACCESORIOS_COSTOS["ruedas_hoja"]
    costo_escuadras = (
        config_data.escuadras_resorte * ACCESORIOS_COSTOS["escuadra_resorte"] +
        config_data.escuadras_alineamiento * ACCESORIOS_COSTOS["escuadra_alineamiento"]
    )
    costo_topas = config_data.topes * ACCESORIOS_COSTOS["tope"]
    
    costo_accesorios = costo_cerraduras + costo_ruedas + costo_escuadras + costo_topas
    
    # Costo total de perfileria + accesorios
    costo_total = costo_perfiles + costo_accesorios
    
    # Area y costo por m²
    area_m2 = (ancho_mm * alto_mm) / 1_000_000
    costo_por_m2 = costo_total / area_m2 if area_m2 > 0 else 0
    
    return {
        "configuracion": config,
        "dimensiones_mm": f"{ancho_mm} x {alto_mm}",
        "area_m2": round(area_m2, 3),
        "medidas_hoja_mm": f"{ancho_hoja:.0f} x {alto_hoja:.0f}",
        
        "perfiles_ml": {
            "Marco perimetral": round(marco_perimetral_ml, 3),
            "Perfil hoja": round(perfil_hoja_ml, 3),
            "Traslape": round(traslape_ml, 3),
            "Guia traslape": round(guia_traslape_ml, 3),
            "Cuancho": round(cuancho_ml, 3),
            "Felpa": round(felpa_ml, 3),
        },
        
        "costos_perfiles_usd": {
            "Marco perimetral": round(costo_marco, 2),
            "Perfil hoja": round(costo_perfil_hoja, 2),
            "Traslape": round(costo_traslape, 2),
            "Guia traslape": round(costo_guia, 2),
            "Cuancho": round(costo_cuancho, 2),
            "Felpa": round(costo_felpa, 2),
        },
        
        "subtotal_perfiles_usd": round(costo_perfiles, 2),
        
        "accesorios": {
            "Cerraduras": config_data.cerraduras,
            "Pares ruedas hoja": config_data.pares_ruedas_hoja,
            "Escuadras resorte": config_data.escuadras_resorte,
            "Escuadras alineamiento": config_data.escuadras_alineamiento,
            "Topes": config_data.topes,
        },
        
        "costos_accesorios_usd": {
            "Cerraduras": round(costo_cerraduras, 2),
            "Ruedas": round(costo_ruedas, 2),
            "Escuadras": round(costo_escuadras, 2),
            "Topes": round(costo_topas, 2),
        },
        
        "subtotal_accesorios_usd": round(costo_accesorios, 2),
        "costo_total_usd": round(costo_total, 2),
        "costo_por_m2_usd": round(costo_por_m2, 2),
    }


def analizar_ventana(ancho_mm: int, alto_mm: int):
    """Analiza una ventana en las 3 configuraciones."""
    
    print("=" * 70)
    print(f"ANALISIS DE COSTOS - Ventana {ancho_mm} x {alto_mm} mm")
    print("=" * 70)
    print()
    
    for config in ["XO", "XX", "OXXO"]:
        resultado = calcular_despicho(ancho_mm, alto_mm, config)
        
        print(f"--- {resultado['configuracion']} ({CONFIGURACIONES[config].nombre}) ---")
        print(f"  Area: {resultado['area_m2']} m²")
        print(f"  Medidas de hoja: {resultado['medidas_hoja_mm']} mm")
        print()
        print(f"  PERFILES:")
        for perfil, ml in resultado['perfiles_ml'].items():
            costo = resultado['costos_perfiles_usd'][perfil]
            perfil_key = perfil.lower().replace(' ', '_')
            # Mapear nombres legibles a claves del diccionario
            key_map = {
                'marco_perimetral': 'marco_perimetral',
                'perfil_hoja': 'perfil_hoja',
                'traslape': 'traslape',
                'guia_traslape': 'guia_traslape',
                'cuancho': 'cuancho',
                'felpa': 'felpa',
            }
            key = key_map.get(perfil_key, perfil_key)
            unit_cost = PERFIL_COSTOS.get(key, 0)
            print(f"    {perfil}: {ml} ml x ${unit_cost:.2f}/ml = ${costo}")
        print(f"    SUBTOTAL PERFILES: ${resultado['subtotal_perfiles_usd']}")
        print()
        print(f"  ACCESORIOS:")
        for acc, qty in resultado['accesorios'].items():
            costo_key = acc if acc in resultado['costos_accesorios_usd'] else acc
            print(f"    {acc} ({qty} unid): ${resultado['costos_accesorios_usd'].get(costo_key, 0)}")
        print(f"    SUBTOTAL ACCESORIOS: ${resultado['subtotal_accesorios_usd']}")
        print()
        print(f"  COSTO TOTAL (perfileria + accesorios): ${resultado['costo_total_usd']}")
        print(f"  COSTO POR M²: ${resultado['costo_por_m2_usd']}/m²")
        print()
    
    print("=" * 70)


def analisis_sensibilidad():
    """Analiza cómo varia el costo por m² con diferentes dimensiones."""
    
    print("\n" + "=" * 70)
    print("ANALISIS DE SENSIBILIDAD - Costo por m² vs Dimensiones")
    print("=" * 70)
    print()
    print(f"{'Dimensiones':<15} {'Config':<8} {'Area m²':<10} {'Costo Total':<12} {'Costo/m²':<10}")
    print("-" * 70)
    
    dimensiones = [
        # Minimo
        (500, 250),
        # Estandares
        (1000, 1000),
        (1500, 1200),
        (2000, 1000),
        # Maximo
        (3700, 1250),
    ]
    
    for ancho, alto in dimensiones:
        for config in ["XO", "XX", "OXXO"]:
            r = calcular_despicho(ancho, alto, config)
            print(f"{r['dimensiones_mm']:<15} {config:<8} {r['area_m2']:<10.2f} ${r['costo_total_usd']:<11.2f} ${r['costo_por_m2_usd']:<9.2f}")
        print()


if __name__ == "__main__":
    # Analizar ventana ejemplo
    analizar_ventana(2000, 1000)
    
    # Analisis de sensibilidad
    analisis_sensibilidad()
    
    # Comparar con precios del preset existente de Vitro Rojas
    print("\n" + "=" * 70)
    print("COMPARACION CON PRECIOS VITRO ROJAS (USD)")
    print("=" * 70)
    print()
    print("Vitro Rojas Panama usa como BASE de su sistema de cotización:")
    print("  - 2 paños: $130/m² (precio de VENTA, no costo)")
    print("  - 3 paños: $150/m²")
    print("  - 4 paños: $165/m²")
    print()
    print("Nuestro costo calculado para XO 2000x1000 = $221.75/m² (solo perfileria+accesorios)")
    print("  -> FALTAN: vidrio + mano de obra + instalacion + utilidad")
    print()
    print("Si el precio de VENTA es $130/m² y el costo es $221.75/m², HAY UN PROBLEMA.")
    print("Los $130 son el PRECIO DE COSTO del fabricante, no el precio de venta.")
    print("O los costos de Juan están en COP, no USD.")
