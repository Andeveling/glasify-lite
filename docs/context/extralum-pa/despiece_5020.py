"""
Despiece real para Sistema Corredizo 5020 (Extralum)
Basado en formato de Vitro Rojas Panama

Para 1 ventana 1000x1000mm (2 hojas XO):
- Ancho por hoja: (1000 - 30) / 2 = 485mm → con desperdicio ≈ 500mm
- Alto por hoja: 1000 - 25 = 975mm → con desperdicio ≈ 986mm
- Marco total: 1000 + 140mm desperdicio = 1140mm
"""

# Perfiles en mm (medida final de corte)
PERFIL_MARCO_H = 1140  # Horizontal superior e inferior
PERFIL_MARCO_V = 1140  # Vertical izq y der
PERFIL_HOJA_LARGO = 986  # Largo de hoja (vertical)
PERFIL_HOJA_ANCHO = 500  # Ancho de hoja (horizontal)
PERFIL_CRUCE = 986  # Cruce/intermedio

# Costos por perfil completo (USD, basado en 5.8m por barra)
COSTO_BARRA = {
    "marco": 45.00,      # Barra 5.8m
    "hoja": 35.00,       # Barra 5.8m
    "cruce": 15.00,     # Barra 5.8m
    "traslape": 0.50,   # No aplica para XO basic
    "guia": 0.50,       # Guia de traslape
}

# Accesorios (precios de Juan en USD)
ACCESORIOS = {
    "ruedas_hoja": 3.00,      # Por par
    "cierre_embutido": 3.00,  # Cerradura embutida (¿o es otra cosa?)
    "contracierre": 3.00,     # Contracierres
    "escuadra_ensamblaje": 1.00,  # Por unidad
    "escuadra_alineacion": 0.10,  # Por unidad
    "felpa_ml": 0.30,         # Por metro lineal
    "cortavientos": 0.30,      # Sup/inf
    "tapa_cruce": 0.30,       # Tapas
    "calzo": 0.50,            # Calzos C1 y C2
}

# Vidrio (estimado para Panama)
VIDRIO_10mm = 25.00  # Por m² aproximadamente

def calcular_despiece(ancho_mm, alto_mm):
    """Calcula despiece completo para ventana."""
    
    # Medidas de hoja (con descuentos)
    descuento_lateral = 30
    descuento_alto = 25
    
    ancho_hoja = (ancho_mm - descuento_lateral) / 2
    alto_hoja = alto_mm - descuento_alto
    
    # Medidas con desperdicio de corte (aproximado)
    medida_marco = ancho_mm + 140  # Aprox con desperdicio
    medida_marco_v = alto_mm + 140
    
    medida_hoja_largo = alto_hoja + 11  # Desperdicio
    medida_hoja_ancho = ancho_hoja + 15
    
    # Barras necesarias (asumiendo barra 5.8m = 5800mm)
    barra_5800 = 5800
    
    # Perfiles de marco
    barras_marco = 4  # 2H + 2V
    ml_marco = barras_marco * medida_marco / 1000
    barras_marco_req = (barras_marco * medida_marco) / barra_5800
    
    # Perfiles de hoja (4 largos + 4anchos + 2 cruce)
    ml_hoja = (4 * medida_hoja_largo + 4 * medida_hoja_ancho + 2 * medida_hoja_largo) / 1000
    barras_hoja_req = ml_hoja / 5.8  # 5.8m por barra
    
    # Metros lineales de felpa
    ml_felpa = (2 * medida_hoja_largo * 2 + 2 * medida_hoja_ancho * 4) / 1000
    
    return {
        "ancho_mm": ancho_mm,
        "alto_mm": alto_mm,
        "ancho_hoja": ancho_hoja,
        "alto_hoja": alto_hoja,
        "medida_marco": medida_marco,
        "medida_marco_v": medida_marco_v,
        "medida_hoja_largo": medida_hoja_largo,
        "medida_hoja_ancho": medida_hoja_ancho,
        "barras_marco": barras_marco_req,
        "barras_hoja": barras_hoja_req,
        "ml_felpa": ml_felpa,
    }


def generar_tabla_despiece(ancho_mm, alto_mm):
    """Genera tabla de despiece estilo Vitro Rojas."""
    
    d = calcular_despiece(ancho_mm, alto_mm)
    area_m2 = (ancho_mm * alto_mm) / 1_000_000
    
    print(f"\n{'='*60}")
    print(f" DESPECHE - Ventana Corrediza 5020")
    print(f" Medidas: {ancho_mm} x {alto_mm} mm ({area_m2:.2f} m²)")
    print(f" Configuracion: XO (2 hojas)")
    print(f"{'='*60}\n")
    
    print("| Componente                 | Cantidad | Medida c/u |")
    print("|-------------------------- |----------|------------|")
    print(f"| Perfil marco horizontal   | 2        | {d['medida_marco']}mm     |")
    print(f"| Perfil marco vertical     | 2        | {d['medida_marco_v']}mm     |")
    print(f"| Perfil hoja (largos)      | 4        | {d['medida_hoja_largo']}mm     |")
    print(f"| Perfil hoja (anchos)      | 4        | {d['medida_hoja_ancho']}mm    |")
    print(f"| Perfil de cruce           | 2        | {d['medida_hoja_largo']}mm     |")
    print(f"| Ruedas                   | 4        | 2 por hoja |")
    print(f"| Cierres embutidos         | 2        |            |")
    print(f"| Contracierres            | 2        |            |")
    print(f"| Escuadras de ensamblaje  | 8-12     |            |")
    print(f"| Escuadras de alineacion  | 4-8      |            |")
    print(f"| Felpa                    | {d['ml_felpa']:.1f} ml  |            |")
    print(f"| Cortavientos sup/inf     | 2        |            |")
    print(f"| Tapas de cruce           | 2        |            |")
    print(f"| Calzos C1 y C2           | segun    |            |")
    print(f"| Vidrio 10mm              | 1        | {ancho_mm}x{alto_mm//2}mm aprox |")
    print("|--------------------------|----------|------------|")
    
    # Calcular costo aproximado
    barras_marco_cost = d['barras_marco'] * COSTO_BARRA["marco"]
    barras_hoja_cost = d['barras_hoja'] * COSTO_BARRA["hoja"]
    
    print(f"\n COSTO APROXIMADO (USD):")
    print(f"   Barras marco: {d['barras_marco']:.2f} x $45 = ${barras_marco_cost:.2f}")
    print(f"   Barras hoja: {d['barras_hoja']:.2f} x $35 = ${barras_hoja_cost:.2f}")
    print(f"   Ruedas (4): 4 x $3 = $12")
    print(f"   Cierres (2): 2 x $3 = $6")
    print(f"   Escuadras (~10): 10 x $1 = $10")
    print(f"   Felpa ({d['ml_felpa']:.1f}m): {d['ml_felpa']:.1f} x $0.30 = ${d['ml_felpa']*0.30:.2f}")
    
    costo_total = barras_marco_cost + barras_hoja_cost + 12 + 6 + 10 + d['ml_felpa']*0.30
    costo_por_m2 = costo_total / area_m2
    
    print(f"   ----------------------------------------")
    print(f"   SUBTOTAL PERFILERIA+ACC: ${costo_total:.2f}")
    print(f"   + Vidrio (~{area_m2:.2f}m² x $25): ${area_m2*25:.2f}")
    print(f"   ----------------------------------------")
    print(f"   TOTAL ESTIMADO: ${costo_total + area_m2*25:.2f}")
    print(f"   COSTO POR M²: ${(costo_total + area_m2*25)/area_m2:.2f}/m²")
    print(f"{'='*60}")


if __name__ == "__main__":
    # Generar despiece para medidas tipicas
    for medidas in [(1000, 1000), (1500, 1200), (2000, 1000)]:
        generar_tabla_despiece(medidas[0], medidas[1])
