-- ================================================================
-- ANALISIS DE COSTOS - Sistema Corredizo 5020
-- Basado en costos reales de Vitro Rojas Panama (proveidos por Juan)
-- Moneda: USD
-- ================================================================

-- Tabla: Profilers disponibles con costo por metro lineal
CREATE TABLE perfiles (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo          TEXT NOT NULL UNIQUE,
    descripcion     TEXT NOT NULL,
    costo_metro_usd REAL NOT NULL,
    ancho_corte_mm  REAL NOT NULL,  -- Ancho del perfil en mm (para cálculo de vidrio)
    observaciones   TEXT
);

-- Tabla: Accesorios con costo unitario y fórmula de cantidad
CREATE TABLE accesorios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo          TEXT NOT NULL UNIQUE,
    descripcion     TEXT NOT NULL,
    costo_unit_usd  REAL NOT NULL,
    unidad          TEXT NOT NULL,  -- 'unidad', 'metro', 'par'
    formula_tipo    TEXT NOT NULL,  -- 'fija', 'por_hoja', 'por_ancho', 'por_alto', 'por_area'
    formula_param   REAL DEFAULT 0  -- Parámetro adicional si aplica
);

-- ================================================================
-- PERFILES - Sistema Corredizo 5020
-- ================================================================
INSERT INTO perfiles (codigo, descripcion, costo_metro_usd, ancho_corte_mm, observaciones) VALUES
    ('HOJA',      'Hoja ventana',          35.00, 0,    'Perfil de hoja corrediza'),
    ('MARCO_2V',  'Marco 2 vías',          45.00, 0,    'Contramarco para 2 vías'),
    ('TRASLAPE',  'Traslape',              15.00, 0,    'Perfil de traslape entre hojas'),
    ('HOJA_MALLA','Hoja malla',            22.00, 0,    'Marco de cedazo/malla'),
    ('CUANCHO',   'Metro lineal cuancho',   0.30,  0,   'Sellado perimetral'),
    ('FELPA',     'Metro felpa',            0.30,  0,   'Felpa de sellado'),
    ('GUIA_TRASLAPE','Guia traslape',       0.50,  0,   'Guía de traslape');
    
-- ================================================================
-- ACCESORIOS - Sistema Corredizo 5020
-- ================================================================
INSERT INTO accesorios (codigo, descripcion, costo_unit_usd, unidad, formula_tipo, formula_param) VALUES
    ('CERRADURA', 'Cerradura',              3.00,  'unidad', 'por_hoja',      1),
    ('RUEDAS_HOJA','Ruedas hoja',            3.00,  'par',    'por_hoja',      1),
    ('RUEDAS_MALLA','Ruedas malla',         1.00,  'par',    'por_malla',     1),
    ('ESCUADRA_RESORTE','Escuadras resorte', 1.00,  'unidad', 'fija',          4),  -- 4 por ventana
    ('ESCUADRA_ALINEAM','Escuadras alineamiento', 0.10, 'unidad','fija',       4),  -- 4 por ventana
    ('ESCUADRA_MALLA','Escuadras malla',     0.40,  'unidad', 'por_malla',     1),
    ('TOPE',      'Tope',                    0.30,  'unidad', 'fija',          2);  -- 2 por ventana

-- ================================================================
-- CALCULOS DE DESPECHE para Configuración XO (1 fija + 1 móvil)
-- Ventana ejemplo: 2000mm ancho x 1000mm alto
-- ================================================================

-- Datos de la ventana
-- W = 2000 mm (ancho total)
-- H = 1000 mm (alto total)
-- Descuentos: 30mm lateral total, 25mm entre hojas

-- PASO 1: Medidas de hoja
-- Ancho hoja = (W - 30) / 2 = (2000 - 30) / 2 = 985 mm
-- Alto hoja = H - 25 = 1000 - 25 = 975 mm

-- PASO 2: Perfiles necesarios (en metros lineales)

-- MARCO PERIMETRAL (alrededor de toda la ventana):
-- = 2 × (ancho + alto) = 2 × (2000 + 1000) / 1000 = 6.00 ml

-- PERFIL DE HOJA (por hoja, 2 hojas = 4 lados verticales):
-- = 2 × alto × 2 hojas = 2 × 975 × 2 / 1000 = 3.90 ml

-- TRASLAPE (unión entre hojas, solo 1):
-- = alto = 975 / 1000 = 0.975 ml

-- GUIA TRASLAPE (en la mitad del alto):
-- = ancho = 2000 / 1000 = 2.00 ml

-- CUANCHO (perimetral):
-- = 2 × (ancho + alto) = 6.00 ml

-- FELPA (en marcos de hoja):
-- = 2 × alto × 2 hojas = 3.90 ml

-- PASO 3: Accesorios
-- Cerraduras: 1 (por hoja móvil, 1 unidad)
-- Ruedas hoja: 1 par por hoja = 2 pares
-- Escuadras: 4 fijas + 4 fijas = 8 unidades
-- Topes: 2 unidades

-- ================================================================
-- RESUMEN DE COSTO para XO de 2000x1000mm
-- ================================================================

-- | Concepto          | Cantidad | Costo Unit | Subtotal |
-- |-------------------|----------|------------|----------|
-- | Marco perimetral  | 6.00 ml  | $45.00/ml  | $270.00  |
-- | Perfil hoja (x2)  | 3.90 ml  | $35.00/ml  | $136.50  |
-- | Traslape          | 0.975 ml | $15.00/ml  | $14.63   |
-- | Guía traslape     | 2.00 ml  | $0.50/ml   | $1.00    |
-- | Cuancho           | 6.00 ml  | $0.30/ml   | $1.80    |
-- | Felpa             | 3.90 ml  | $0.30/ml   | $1.17    |
-- |-------------------|----------|------------|----------|
-- | SUBTOTAL PERFILES |          |            | $425.10  |
-- |-------------------|----------|------------|----------|
-- | Cerradura (x1)    | 1        | $3.00      | $3.00    |
-- | Ruedas hoja (x2)  | 2 pares  | $3.00/par  | $6.00    |
-- | Escuadras (x8)    | 8        | $1.00      | $8.00    |
-- | Escuadras alineam | 8        | $0.10      | $0.80    |
-- | Topes (x2)        | 2        | $0.30      | $0.60    |
-- |-------------------|----------|------------|----------|
-- | SUBTOTAL ACCESORIOS          |            | $18.40   |
-- |-------------------|----------|------------|----------|
-- | COSTO PERFILERIA+ACCESORIOS  |            | $443.50  |
-- ================================================================

-- AREA DE LA VENTANA: 2.00m × 1.00m = 2.00 m²
-- COSTO POR M²: $443.50 / 2.00 = $221.75/m² (solo perfiles + accesorios, sin vidrio ni MO)

-- ================================================================
-- FORMULAS DE DESPECHE (para cálculo dinámico)
-- ================================================================

-- Configuración XO (1 fija + 1 móvil):
-- Ancho_hoja = (W - 30) / 2
-- Alto_hoja = H - 25

-- Metros lineales de perfil:
-- marco_perimetral_ml = 2 * (W + H) / 1000
-- perfil_hoja_ml = 2 * Alto_hoja * 2 / 1000  (2 hojas × 2 lados)
-- traslape_ml = Alto_hoja / 1000
-- guia_traslape_ml = W / 1000
-- cuancho_ml = 2 * (W + H) / 1000
-- felpa_ml = 2 * Alto_hoja * 2 / 1000

-- Accesorios:
-- cerraduras = 1 (una cerradura por ventana XO)
-- ruedas_hoja = 2 pares (1 par por hoja)
-- escuadras_resorte = 4
-- escuadras_alineamiento = 4
-- topes = 2
