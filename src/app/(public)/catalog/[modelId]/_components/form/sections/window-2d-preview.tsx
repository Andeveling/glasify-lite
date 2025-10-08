/** biome-ignore-all lint/style/noMagicNumbers: Este archivo es un preview visual 2D, los valores "mágicos" están justificados por UX y proporciones visuales, no por lógica de negocio ni cálculos reutilizables. No se requiere refactorizar a constantes globales ni reutilizables aquí. */
import { Maximize2, Minimize2, Ruler } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Window2DPreviewProps = {
  width: number;
  height: number;
  className?: string;
  showControls?: boolean;
  showMeasurements?: boolean;
};

export function Window2DPreview({
  width,
  height,
  className = '',
  showControls = true,
  showMeasurements = true,
}: Window2DPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ isExpanded, setIsExpanded ] = useState(false);
  const animationRef = useRef<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Las dependencias están bien definidas, no es necesario agregar canvasRef ni animationRef
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!(canvas && width && height)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get CSS variables
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary').trim();
    const mutedColor = style.getPropertyValue('--muted').trim();
    const backgroundColor = style.getPropertyValue('--background').trim();
    const foregroundColor = style.getPropertyValue('--foreground').trim();

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate scale to fit window in canvas with padding
    const padding = 80;
    const availableWidth = rect.width - padding * 2;
    const availableHeight = rect.height - padding * 2;

    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const scale = Math.min(scaleX, scaleY, 0.5); // Max scale 0.5 to keep it reasonable

    const windowWidth = width * scale;
    const windowHeight = height * scale;

    // Center position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = centerX - windowWidth / 2;
    const y = centerY - windowHeight / 2;

    // Animation state
    let animationTime = 0;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Background gradient using CSS variables
      const bgGradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      bgGradient.addColorStop(0, `oklch(from ${backgroundColor} l c h / 0.95)`);
      bgGradient.addColorStop(0.5, `oklch(from ${backgroundColor} calc(l * 1.1) c h / 1)`);
      bgGradient.addColorStop(1, `oklch(from ${backgroundColor} l c h / 0.95)`);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Animate glow
      animationTime += 0.02;
      const glowIntensity = (Math.sin(animationTime) + 1) / 2;

      // Draw shadow/glow using primary color
      ctx.shadowColor = `oklch(from ${primaryColor} l c h / ${0.2 + glowIntensity * 0.15})`;
      ctx.shadowBlur = 20;

      // Window frame constants
      const frameWidth = 12;
      const mullionWidth = 6;

      // Outer frame using muted color
      ctx.fillStyle = `oklch(from ${mutedColor} calc(l * 0.8) c h)`;
      ctx.fillRect(x, y, windowWidth, windowHeight);

      // Inner glass area gradient using primary color
      const glassGradient = ctx.createLinearGradient(
        x + frameWidth,
        y + frameWidth,
        x + windowWidth - frameWidth,
        y + windowHeight - frameWidth
      );
      glassGradient.addColorStop(0, `oklch(from ${primaryColor} l c h / 0.2)`);
      glassGradient.addColorStop(0.5, `oklch(from ${primaryColor} l c h / 0.3)`);
      glassGradient.addColorStop(1, `oklch(from ${primaryColor} l c h / 0.1)`);

      ctx.fillStyle = glassGradient;
      ctx.fillRect(x + frameWidth, y + frameWidth, windowWidth - frameWidth * 2, windowHeight - frameWidth * 2);

      // Center mullion (vertical divider)
      ctx.fillStyle = `oklch(from ${mutedColor} calc(l * 0.7) c h)`;
      ctx.fillRect(centerX - mullionWidth / 2, y + frameWidth, mullionWidth, windowHeight - frameWidth * 2);

      // Glass pane highlights
      ctx.shadowBlur = 0;

      // Left pane highlight
      const leftHighlight = ctx.createLinearGradient(
        x + frameWidth,
        y + frameWidth,
        x + frameWidth + 40,
        y + frameWidth + 40
      );
      leftHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      leftHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = leftHighlight;
      ctx.fillRect(
        x + frameWidth,
        y + frameWidth,
        (windowWidth - frameWidth * 2 - mullionWidth) / 2,
        windowHeight - frameWidth * 2
      );

      // Right pane highlight
      const rightHighlight = ctx.createLinearGradient(
        centerX + mullionWidth / 2,
        y + frameWidth,
        centerX + mullionWidth / 2 + 40,
        y + frameWidth + 40
      );
      rightHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      rightHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = rightHighlight;
      ctx.fillRect(
        centerX + mullionWidth / 2,
        y + frameWidth,
        (windowWidth - frameWidth * 2 - mullionWidth) / 2,
        windowHeight - frameWidth * 2
      );

      // Grid pattern on glass using primary color
      ctx.strokeStyle = `oklch(from ${primaryColor} l c h / 0.15)`;
      ctx.lineWidth = 1;

      const gridSpacing = 20;

      // Left pane grid
      for (let i = 0; i < (windowWidth - frameWidth * 2 - mullionWidth) / 2; i += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + frameWidth + i, y + frameWidth);
        ctx.lineTo(x + frameWidth + i, y + windowHeight - frameWidth);
        ctx.stroke();
      }

      // Right pane grid
      for (let i = 0; i < (windowWidth - frameWidth * 2 - mullionWidth) / 2; i += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(centerX + mullionWidth / 2 + i, y + frameWidth);
        ctx.lineTo(centerX + mullionWidth / 2 + i, y + windowHeight - frameWidth);
        ctx.stroke();
      }

      // Frame bevels for 3D effect
      const bevelGradient = ctx.createLinearGradient(x, y, x + frameWidth, y + frameWidth);
      bevelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      bevelGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

      // Top bevel
      ctx.fillStyle = bevelGradient;
      ctx.fillRect(x, y, windowWidth, frameWidth);

      // Left bevel
      ctx.fillRect(x, y, frameWidth, windowHeight);

      // Measurements using primary color
      if (showMeasurements) {
        ctx.shadowBlur = 0;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = `oklch(from ${primaryColor} l c h)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Width measurement
        const widthY = y + windowHeight + 35;

        // Line
        ctx.strokeStyle = `oklch(from ${primaryColor} l c h)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, widthY);
        ctx.lineTo(x + windowWidth, widthY);
        ctx.stroke();

        // Arrows
        const arrowSize = 6;
        ctx.beginPath();
        ctx.moveTo(x, widthY);
        ctx.lineTo(x + arrowSize, widthY - arrowSize);
        ctx.lineTo(x + arrowSize, widthY + arrowSize);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + windowWidth, widthY);
        ctx.lineTo(x + windowWidth - arrowSize, widthY - arrowSize);
        ctx.lineTo(x + windowWidth - arrowSize, widthY + arrowSize);
        ctx.closePath();
        ctx.fill();

        // Text with background
        const widthText = `${width}mm`;
        const textWidth = ctx.measureText(widthText).width;
        ctx.fillStyle = `oklch(from ${backgroundColor} l c h / 0.95)`;
        ctx.fillRect(centerX - textWidth / 2 - 6, widthY - 10, textWidth + 12, 20);
        ctx.fillStyle = `oklch(from ${primaryColor} l c h)`;
        ctx.fillText(widthText, centerX, widthY);

        // Height measurement
        const heightX = x + windowWidth + 35;

        // Line
        ctx.beginPath();
        ctx.moveTo(heightX, y);
        ctx.lineTo(heightX, y + windowHeight);
        ctx.stroke();

        // Arrows
        ctx.beginPath();
        ctx.moveTo(heightX, y);
        ctx.lineTo(heightX - arrowSize, y + arrowSize);
        ctx.lineTo(heightX + arrowSize, y + arrowSize);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(heightX, y + windowHeight);
        ctx.lineTo(heightX - arrowSize, y + windowHeight - arrowSize);
        ctx.lineTo(heightX + arrowSize, y + windowHeight - arrowSize);
        ctx.closePath();
        ctx.fill();

        // Text with background (rotated)
        ctx.save();
        ctx.translate(heightX, centerY);
        ctx.rotate(-Math.PI / 2);
        const heightText = `${height}mm`;
        const heightTextWidth = ctx.measureText(heightText).width;
        ctx.fillStyle = `oklch(from ${backgroundColor} l c h / 0.95)`;
        ctx.fillRect(-heightTextWidth / 2 - 6, -10, heightTextWidth + 12, 20);
        ctx.fillStyle = `oklch(from ${primaryColor} l c h)`;
        ctx.textAlign = 'center';
        ctx.fillText(heightText, 0, 0);
        ctx.restore();
      }

      // Scale reference using foreground color
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = `oklch(from ${foregroundColor} l c h / 0.5)`;
      ctx.textAlign = 'left';
      ctx.fillText(`Escala: 1:${Math.round(1 / scale)}`, 12, rect.height - 12);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ width, height, showMeasurements, isExpanded ]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        className={`w-full rounded-lg bg-gradient-to-br from-background via-card to-background shadow-md transition-all duration-300 ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}
        ref={canvasRef}
      />

      {showControls && (
        <>
          {/* Info overlay */}
          <div className='absolute top-4 left-4 rounded-lg border border-border bg-card/95 px-3 py-2 text-sm shadow-sm backdrop-blur-sm'>
            <div className='mb-2 flex items-center gap-2 font-medium text-card-foreground'>
              <Ruler className="h-4 w-4 text-primary" />
              <span>Dimensiones</span>
            </div>
            <div className='space-y-1 text-xs'>
              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground">Ancho:</span>
                <span className="font-mono text-foreground">{width}mm</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground">Alto:</span>
                <span className="font-mono text-foreground">{height}mm</span>
              </div>
              <div className='flex justify-between gap-6 border-border border-t pt-1'>
                <span className="text-muted-foreground">Área:</span>
                <span className="font-mono text-foreground">{((width * height) / 1_000_000).toFixed(2)}m²</span>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="absolute top-4 right-4">
            <button
              className='group rounded-lg border border-border bg-card/95 p-2 shadow-sm backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground'
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Contraer' : 'Expandir'}
              type="button"
            >
              {isExpanded ? (
                <Minimize2 className='h-4 w-4 transition-colors' />
              ) : (
                <Maximize2 className='h-4 w-4 transition-colors' />
              )}
            </button>
          </div>

          {/* Material legend */}
          <div className='absolute bottom-4 left-4 rounded-lg border border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm'>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className='h-3 w-3 rounded-sm border border-primary/50 bg-gradient-to-br from-primary/40 to-primary/20 shadow-xs' />
                <span className="text-muted-foreground">Vidrio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className='h-3 w-3 rounded-sm border border-muted bg-muted shadow-xs' />
                <span className="text-muted-foreground">Marco</span>
              </div>
            </div>
          </div>

          {/* Aspect ratio info */}
          <div className='absolute right-4 bottom-4 rounded-lg border border-border bg-card/95 px-3 py-2 text-muted-foreground text-xs shadow-sm backdrop-blur-sm'>
            Proporción: {(width / height).toFixed(2)}:1
          </div>
        </>
      )}
    </div>
  );
}
