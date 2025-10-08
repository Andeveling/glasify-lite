/**
 * Utilities for dimension calculations and validations
 */

/**
 * Genera valores sugeridos dinámicamente basados en el rango permitido
 * @param min - Valor mínimo del rango
 * @param max - Valor máximo del rango
 * @param count - Cantidad de valores a generar (default: 5)
 * @returns Array de valores sugeridos redondeados a múltiplos de 10
 */
export const generateSuggestedValues = (min: number, max: number, count = 5): number[] => {
  const range = max - min;
  const step = range / (count - 1);

  return Array.from({ length: count }, (_, i) => {
    const value = min + step * i;
    // Redondear a múltiplos de 10 para valores más "amigables"
    const roundingFactor = 10;
    return Math.round(value / roundingFactor) * roundingFactor;
  }).filter((value, index, arr) => arr.indexOf(value) === index); // Eliminar duplicados
};

/**
 * Valida si un valor está dentro de un rango permitido
 * @param value - Valor a validar
 * @param min - Valor mínimo del rango
 * @param max - Valor máximo del rango
 * @returns true si el valor está dentro del rango, false en caso contrario
 */
export const isValidDimension = (value: number, min: number, max: number): boolean => value >= min && value <= max;

/**
 * Drawing configuration for window preview canvas
 */
export const CANVAS_CONFIG = {
  armPositionRatio: 0.3,
  bodyRatio: 0.6,
  canvasDimensions: {
    height: 300,
    width: 600,
  },
  headRatio: 0.08,
  humanHeightMm: 1700,
  humanSpacing: 30,
  humanWidthRatio: 0.35,
  labelOffset: {
    heightX: -15,
    humanY: 15,
    widthY: -10,
  },
  legLeftRatio: 0.3,
  legRightRatio: 0.7,
  padding: 40,
} as const;

/**
 * Drawing configuration for window preview canvas
 */
export const CANVAS_CONFIG = {
  ARM_POSITION_RATIO: 0.3,
  BODY_RATIO: 0.6,
  CANVAS_DIMENSIONS: {
    HEIGHT: 300,
    WIDTH: 600,
  },
  HEAD_RATIO: 0.08,
  HUMAN_HEIGHT_MM: 1700,
  HUMAN_SPACING: 30,
  HUMAN_WIDTH_RATIO: 0.35,
  LABEL_OFFSET: {
    HEIGHT_X: -15,
    HUMAN_Y: 15,
    WIDTH_Y: -10,
  },
  LEG_LEFT_RATIO: 0.3,
  LEG_RIGHT_RATIO: 0.7,
  PADDING: 40,
} as const;

type DrawWindowParams = {
  windowWidth: number;
  windowHeight: number;
  maxWidth: number;
  maxHeight: number;
};

/**
 * Dibuja una ventana en el canvas con una figura humana de referencia
 * @param canvas - Elemento canvas del DOM
 * @param params - Parámetros de dimensiones de la ventana
 */
export const drawWindowPreview = (canvas: HTMLCanvasElement, params: DrawWindowParams): void => {
  const { windowWidth, windowHeight, maxWidth, maxHeight } = params;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const config = CANVAS_CONFIG;

  // Limpiar canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calcular escala para que todo quepa en el canvas
  const scale = Math.min(
    (canvasWidth - config.PADDING * 2) / (maxWidth + config.HUMAN_HEIGHT_MM / 2),
    (canvasHeight - config.PADDING * 2) / Math.max(maxHeight, config.HUMAN_HEIGHT_MM)
  );

  // Dimensiones escaladas
  const scaledWindowWidth = windowWidth * scale;
  const scaledWindowHeight = windowHeight * scale;
  const scaledHumanHeight = config.HUMAN_HEIGHT_MM * scale;
  const scaledHumanWidth = scaledHumanHeight * config.HUMAN_WIDTH_RATIO;

  // Posición de la ventana (centrada verticalmente)
  const windowX = config.PADDING;
  const windowY = (canvasHeight - scaledWindowHeight) / 2;

  // Posición del humano (a la derecha de la ventana)
  const humanX = windowX + scaledWindowWidth + config.HUMAN_SPACING;
  const humanY = canvasHeight - config.PADDING - scaledHumanHeight;

  // Dibujar ventana
  ctx.fillStyle = 'hsl(var(--primary) / 0.1)';
  ctx.fillRect(windowX, windowY, scaledWindowWidth, scaledWindowHeight);

  ctx.strokeStyle = 'hsl(var(--primary))';
  ctx.lineWidth = 2;
  ctx.strokeRect(windowX, windowY, scaledWindowWidth, scaledWindowHeight);

  // Dibujar marco de ventana (cruz central)
  ctx.strokeStyle = 'hsl(var(--primary) / 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(windowX + scaledWindowWidth / 2, windowY);
  ctx.lineTo(windowX + scaledWindowWidth / 2, windowY + scaledWindowHeight);
  ctx.moveTo(windowX, windowY + scaledWindowHeight / 2);
  ctx.lineTo(windowX + scaledWindowWidth, windowY + scaledWindowHeight / 2);
  ctx.stroke();

  // Dibujar figura humana estilizada
  ctx.strokeStyle = 'hsl(var(--muted-foreground))';
  ctx.fillStyle = 'hsl(var(--muted-foreground))';
  ctx.lineWidth = 2;

  // Cabeza
  const headRadius = scaledHumanHeight * config.HEAD_RATIO;
  ctx.beginPath();
  ctx.arc(humanX + scaledHumanWidth / 2, humanY + headRadius, headRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Cuerpo
  const bodyTop = humanY + headRadius * 2;
  const bodyBottom = humanY + scaledHumanHeight * config.BODY_RATIO;
  ctx.beginPath();
  ctx.moveTo(humanX + scaledHumanWidth / 2, bodyTop);
  ctx.lineTo(humanX + scaledHumanWidth / 2, bodyBottom);
  ctx.stroke();

  // Brazos
  const armY = bodyTop + (bodyBottom - bodyTop) * config.ARM_POSITION_RATIO;
  ctx.beginPath();
  ctx.moveTo(humanX, armY);
  ctx.lineTo(humanX + scaledHumanWidth, armY);
  ctx.stroke();

  // Piernas
  const legSplit = humanX + scaledHumanWidth / 2;
  ctx.beginPath();
  ctx.moveTo(legSplit, bodyBottom);
  ctx.lineTo(humanX + scaledHumanWidth * config.LEG_LEFT_RATIO, humanY + scaledHumanHeight);
  ctx.moveTo(legSplit, bodyBottom);
  ctx.lineTo(humanX + scaledHumanWidth * config.LEG_RIGHT_RATIO, humanY + scaledHumanHeight);
  ctx.stroke();

  // Etiquetas de medidas
  ctx.fillStyle = 'hsl(var(--foreground))';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  // Medida de ancho
  ctx.fillText(`${windowWidth}mm`, windowX + scaledWindowWidth / 2, windowY + config.LABEL_OFFSET.WIDTH_Y);

  // Medida de alto
  ctx.save();
  ctx.translate(windowX + config.LABEL_OFFSET.HEIGHT_X, windowY + scaledWindowHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${windowHeight}mm`, 0, 0);
  ctx.restore();

  // Etiqueta de referencia humana
  ctx.fillStyle = 'hsl(var(--muted-foreground))';
  ctx.font = '10px sans-serif';
  ctx.fillText('1.7m', humanX + scaledHumanWidth / 2, humanY + scaledHumanHeight + config.LABEL_OFFSET.HUMAN_Y);
};
