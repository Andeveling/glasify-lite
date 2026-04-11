-- ================================================================
-- BASE DE DATOS: Modelos de Ventanas Corredizas - Extralum
-- Schema Bun:SQL
-- ================================================================

-- Las tablas principales
CREATE TABLE modelos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo      TEXT NOT NULL UNIQUE,
    nombre      TEXT NOT NULL,
    serie       TEXT NOT NULL,
    tipo        TEXT NOT NULL DEFAULT 'corrediza',
    rieles      INTEGER NOT NULL DEFAULT 2,
    descripcion TEXT,
    peso_hoja_max_kg REAL
);

-- Rangos POR PANNEL (hoja individual), no de la ventana completa
CREATE TABLE rangos_panel (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_id       INTEGER NOT NULL REFERENCES modelos(id),
    tipo_panel      TEXT NOT NULL,       -- 'movil' o 'fijo'
    ancho_min_mm    REAL NOT NULL,
    ancho_max_mm    REAL NOT NULL,
    alto_min_mm     REAL NOT NULL,
    alto_max_mm     REAL NOT NULL
);

-- CONFIGURACIONES POSIBLES (modelos de ventana completa)
-- Cada configuracion define cuántos fijos y móviles tiene
CREATE TABLE configuraciones (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_id       INTEGER NOT NULL REFERENCES modelos(id),
    nombre          TEXT NOT NULL,       -- 'XO', 'XX', 'OXXO'
    cantidad_fijos  INTEGER NOT NULL,
    cantidad_moviles INTEGER NOT NULL,
    rieles          INTEGER NOT NULL DEFAULT 2
);

-- Dimensiones de ventana completa CALCULADAS según reglas de cada sistema
-- Ancho total = suma de todos los paños
-- Alto total = min(alto de todos los paños involucrados)
CREATE TABLE dimensiones_ventana (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    configuracion_id INTEGER NOT NULL REFERENCES configuraciones(id),
    ancho_min_mm    REAL NOT NULL,
    ancho_max_mm    REAL NOT NULL,
    alto_min_mm     REAL NOT NULL,
    alto_max_mm     REAL NOT NULL,
    formula_ancho   TEXT,
    formula_alto    TEXT
);

-- Vidrios disponibles
CREATE TABLE vidrios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_id   INTEGER NOT NULL REFERENCES modelos(id),
    tipo_vidrio TEXT NOT NULL,
    espesor_mm  TEXT NOT NULL,
    observaciones TEXT
);

-- Acabados
CREATE TABLE acabados (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_id   INTEGER NOT NULL REFERENCES modelos(id),
    codigo_acabado TEXT NOT NULL,
    nombre_acabado TEXT NOT NULL
);

-- ================================================================
-- DATOS: Sistema 5020 (FT-033)
-- ================================================================

INSERT INTO modelos (codigo, nombre, serie, tipo, rieles, descripcion, peso_hoja_max_kg)
VALUES (
    '5020',
    'Sistema de Ventana Corrediza 5020',
    '5020',
    'corrediza',
    2,
    'Sistema con cortes a 90°. Espesores de perfiles 1.10 a 1.27mm. Opción de cedazo corredizo interno/externo.',
    32.0
);

-- Rangos por painel (X=móvil, O=fijo)
INSERT INTO rangos_panel (modelo_id, tipo_panel, ancho_min_mm, ancho_max_mm, alto_min_mm, alto_max_mm)
VALUES 
    (1, 'movil',   250, 1850, 250, 1250),  -- X
    (1, 'fijo',    250, 1850, 250, 1600);  -- O

-- Configuraciones posibles en 2 rieles
INSERT INTO configuraciones (modelo_id, nombre, cantidad_fijos, cantidad_moviles, rieles)
VALUES 
    (1, 'XO',   1, 1, 2),   -- 1 fijo + 1 móvel
    (1, 'XX',   0, 2, 2),   -- 2 móveis
    (1, 'OXXO', 2, 2, 2);   -- 2 fijos + 2 móveis

-- Dimensiones ventana completa (calculadas):
-- XO: Ancho = O+X, Alto = min(alto_O, alto_X) = alto_X (limitado por móvel)
-- XX: Ancho = X+X, Alto = alto_X
-- OXXO: Ancho = O+O+X+X, Alto = alto_X
INSERT INTO dimensiones_ventana (configuracion_id, ancho_min_mm, ancho_max_mm, alto_min_mm, alto_max_mm, formula_ancho, formula_alto)
VALUES 
    (1, 500,  3700, 250, 1250, 'O_ancho + X_ancho', 'min(alto_O, alto_X) = alto_X'),
    (2, 500,  3700, 250, 1250, 'X_ancho + X_ancho', 'alto_X'),
    (3, 1000, 7400, 250, 1250, 'O_ancho*2 + X_ancho*2', 'alto_X');

-- Vidrios
INSERT INTO vidrios (modelo_id, tipo_vidrio, espesor_mm, observaciones)
VALUES 
    (1, 'monolitico', '4, 5, 6', 'Vidrios monolíticos'),
    (1, 'fuerex', '4, 5, 6', 'Vidrio de seguridad FUERTEX'),
    (1, 'vilax', '33.1', 'Vidrio Vilax combinación');

-- Acabados
INSERT INTO acabados (modelo_id, codigo_acabado, nombre_acabado)
VALUES 
    (1, '10', 'Anodizado natural'),
    (1, '35', 'Anodizado bronce'),
    (1, '51', 'Pintura blanco'),
    (1, '90', 'Anodizado negro');

-- ================================================================
-- DATOS: Sistema EUROPA_CLASSIC (FT-126)
-- Rangos por painel: Width X(mov)=402-1800, Height X(mov)=470-3650
--                    Width O(fix)=402-1800, Height O(fix)=470-3650
-- ================================================================

INSERT INTO modelos (codigo, nombre, serie, tipo, rieles, descripcion, peso_hoja_max_kg)
VALUES (
    'EUROPA_CLASSIC',
    'Europa Classic Sliding Windows and Doors',
    'Europa Classic',
    'corrediza',
    2,
    'Cortes a 45° con refuerzo interior metálico. Perfiles 1.10-1.70mm. Alta hermeticidad EPDM. Opción de cedazo interno/externo.',
    250.0
);

INSERT INTO rangos_panel (modelo_id, tipo_panel, ancho_min_mm, ancho_max_mm, alto_min_mm, alto_max_mm)
VALUES 
    (2, 'movil',   402, 1800, 470, 3650),  -- X
    (2, 'fijo',    402, 1800, 470, 3650);  -- O

INSERT INTO configuraciones (modelo_id, nombre, cantidad_fijos, cantidad_moviles, rieles)
VALUES 
    (2, 'XO',   1, 1, 2),
    (2, 'XX',   0, 2, 2),
    (2, 'OXXO', 2, 2, 2);

INSERT INTO dimensiones_ventana (configuracion_id, ancho_min_mm, ancho_max_mm, alto_min_mm, alto_max_mm, formula_ancho, formula_alto)
VALUES 
    (4, 804,  3600, 470, 3650, 'O_ancho + X_ancho', 'min(alto_O, alto_X) = alto_X'),
    (5, 804,  3600, 470, 3650, 'X_ancho + X_ancho', 'alto_X'),
    (6, 1608, 7200, 470, 3650, 'O_ancho*2 + X_ancho*2', 'alto_X');

INSERT INTO vidrios (modelo_id, tipo_vidrio, espesor_mm, observaciones)
VALUES 
    (2, 'monolitico', '6, 8, 10, 12', 'Vidrio monolítico'),
    (2, 'fuerex', '6, 8, 10, 12', 'Vidrio de seguridad FUERTEX'),
    (2, 'igu', '16 - 18.5', 'Vidrio aislante (IGU)'),
    (2, 'vilax', '6 - 12', 'Vidrio laminado Vilax');

INSERT INTO acabados (modelo_id, codigo_acabado, nombre_acabado)
VALUES 
    (2, '10', 'Natural Anodized'),
    (2, '12', 'Stainless Steel brushed'),
    (2, '35', 'Bronze Anodized'),
    (2, '51', 'White paint'),
    (2, '74', 'Textured walnut (wood-like)'),
    (2, '81', 'Black textured Paint'),
    (2, '90', 'Black anodized');

-- ================================================================
-- VISTA: Resumen por configuración
-- ================================================================
CREATE VIEW v_configuraciones AS
SELECT 
    m.codigo,
    c.nombre AS configuracion,
    c.cantidad_fijos,
    c.cantidad_moviles,
    c.rieles,
    dv.ancho_min_mm,
    dv.ancho_max_mm,
    dv.alto_min_mm,
    dv.alto_max_mm,
    dv.formula_ancho,
    dv.formula_alto,
    GROUP_CONCAT(DISTINCT v.tipo_vidrio || ': ' || v.espesor_mm || 'mm') AS vidrios
FROM modelos m
JOIN configuraciones c ON m.id = c.modelo_id
JOIN dimensiones_ventana dv ON c.id = dv.configuracion_id
JOIN vidrios v ON m.id = v.modelo_id
GROUP BY m.id, c.id;
