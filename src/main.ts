const appElement = document.querySelector<HTMLDivElement>('#app');

if (!appElement) {
    throw new Error('Could not find #app in index.html');
}

const app: HTMLDivElement = appElement;

const style = document.createElement('style');
style.textContent = `
  .resonance-sim {
    --ink: #172033;
    --muted: #5f6b7a;
    --panel: #ffffff;
    --line: #d9e0e8;
    --periodic: #2563eb;
    --forced: #7c3aed;
    --natural: #059669;
    --amplitude: #d97706;
    --phase: #0891b2;
    --resonance: #dc2626;
    width: min(920px, 100%);
    margin: 0 auto;
    color: var(--ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .resonance-sim * {
    box-sizing: border-box;
  }

  .resonance-values {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }

  .resonance-value {
    min-width: 0;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-top-width: 4px;
    border-radius: 12px;
    background: var(--panel);
  }

  .resonance-value.periodic { border-top-color: var(--periodic); }
  .resonance-value.forced { border-top-color: var(--forced); }
  .resonance-value.natural { border-top-color: var(--natural); }
  .resonance-value.amplitude { border-top-color: var(--amplitude); }
  .resonance-value.phase {
    border-top-color: var(--phase);
    grid-column: 1 / -1;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 18px;
  }

  .resonance-value.phase .resonance-value-label {
    margin-bottom: 0;
  }

  .resonance-value.phase .resonance-value-number {
    font-size: clamp(1.15rem, 2.4vw, 1.65rem);
  }

  .resonance-value-label {
    display: block;
    color: var(--muted);
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .resonance-value-number {
    display: block;
    font-size: clamp(1.3rem, 3vw, 2rem);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .resonance-stage {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 14px;
    background:
      linear-gradient(to bottom, rgba(37, 99, 235, 0.035), transparent 34%),
      var(--panel);
  }

  .resonance-canvas {
    display: block;
    width: 100%;
    height: 430px;
  }

  .resonance-badge {
    position: absolute;
    left: 50%;
    top: 14px;
    transform: translateX(-50%);
    padding: 7px 13px;
    border-radius: 999px;
    background: var(--resonance);
    color: white;
    font-weight: 900;
    font-size: 0.88rem;
    letter-spacing: 0.08em;
    box-shadow: 0 4px 14px rgba(220, 38, 38, 0.18);
    opacity: 0;
    transition: opacity 140ms ease;
    pointer-events: none;
  }

  .resonance-badge.visible {
    opacity: 1;
  }

  .resonance-control {
    margin-top: 14px;
    padding: 14px 16px 16px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--panel);
  }

  .resonance-control-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .resonance-control-title {
    font-weight: 800;
  }

  .resonance-control-current {
    color: var(--periodic);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .resonance-slider {
    width: 100%;
    accent-color: var(--periodic);
    cursor: pointer;
  }

  .resonance-slider-scale {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    color: var(--muted);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }

  .resonance-hint {
    margin: 9px 0 0;
    color: var(--muted);
    font-size: 0.82rem;
    line-height: 1.35;
    text-align: center;
  }

  @media (max-width: 680px) {
    .resonance-values {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .resonance-value.phase {
      display: block;
    }

    .resonance-value.phase .resonance-value-label {
      margin-bottom: 6px;
    }

    .resonance-canvas {
      height: 370px;
    }
  }
`;
document.head.appendChild(style);

app.innerHTML = `
  <section class="resonance-sim" aria-label="Driven pendulum resonance simulation">
    <div class="resonance-values" aria-live="polite">
      <div class="resonance-value periodic">
        <span class="resonance-value-label">Periodic force frequency</span>
        <span class="resonance-value-number" id="periodic-frequency">0.40 Hz</span>
      </div>
      <div class="resonance-value forced">
        <span class="resonance-value-label">Forced vibration frequency</span>
        <span class="resonance-value-number" id="forced-frequency">0.40 Hz</span>
      </div>
      <div class="resonance-value natural">
        <span class="resonance-value-label">Natural frequency</span>
        <span class="resonance-value-number" id="natural-frequency">0.70 Hz</span>
      </div>
      <div class="resonance-value amplitude">
        <span class="resonance-value-label">Oscillation amplitude</span>
        <span class="resonance-value-number" id="amplitude">0.0°</span>
      </div>
      <div class="resonance-value phase">
        <span class="resonance-value-label">Phase difference: periodic force → forced vibration</span>
        <span class="resonance-value-number" id="phase-difference">0.0° = 0.00π rad</span>
      </div>
    </div>

    <div class="resonance-stage">
      <canvas class="resonance-canvas" id="resonance-canvas" aria-label="A pendulum whose pivot is driven from side to side by a periodic force"></canvas>
      <div class="resonance-badge" id="resonance-badge">RESONANCE</div>
    </div>

    <div class="resonance-control">
      <div class="resonance-control-header">
        <label class="resonance-control-title" for="frequency-slider">Periodic force frequency</label>
        <span class="resonance-control-current" id="slider-frequency">0.40 Hz</span>
      </div>
      <input
        class="resonance-slider"
        id="frequency-slider"
        type="range"
        min="0.10"
        max="1.30"
        step="0.01"
        value="0.40"
        aria-label="Periodic force frequency"
      >
      <div class="resonance-slider-scale" aria-hidden="true">
        <span>0.10 Hz</span>
        <span>1.30 Hz</span>
      </div>
      <p class="resonance-hint">Move the slider, then hold it steady and watch what happens as the driving frequency approaches the natural frequency.</p>
    </div>
  </section>
`;

function requireElement<T extends Element>(selector: string): T {
    const element = app.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Missing element: ${selector}`);
    }
    return element;
}

const canvas = requireElement<HTMLCanvasElement>('#resonance-canvas');
const context = canvas.getContext('2d');
if (!context) {
    throw new Error('Canvas 2D context is not available');
}

const ctx: CanvasRenderingContext2D = context;

const periodicFrequencyEl = requireElement<HTMLSpanElement>('#periodic-frequency');
const forcedFrequencyEl = requireElement<HTMLSpanElement>('#forced-frequency');
const naturalFrequencyEl = requireElement<HTMLSpanElement>('#natural-frequency');
const amplitudeEl = requireElement<HTMLSpanElement>('#amplitude');
const phaseDifferenceEl = requireElement<HTMLSpanElement>('#phase-difference');
const sliderFrequencyEl = requireElement<HTMLSpanElement>('#slider-frequency');
const resonanceBadge = requireElement<HTMLDivElement>('#resonance-badge');
const frequencySlider = requireElement<HTMLInputElement>('#frequency-slider');

// -----------------------------------------------------------------------------
// Physics
// -----------------------------------------------------------------------------

const G = 9.81;                         // m s^-2
const NATURAL_FREQUENCY = 0.70;         // Hz
const OMEGA_0 = 2 * Math.PI * NATURAL_FREQUENCY;
const PENDULUM_LENGTH = G / (OMEGA_0 * OMEGA_0); // ~0.507 m
const PIVOT_AMPLITUDE = 0.05;           // m, horizontal motion of the support
const DAMPING = 0.1;                    // s^-1, viscous angular damping
const PHYSICS_STEP = 1 / 240;           // fixed integration step
const HISTORY_SAMPLE_STEP = 1 / 60;
const RESONANCE_BAND = 0.035;           // Hz either side of f0 for the label

let drivingFrequency = Number(frequencySlider.value);
let theta = 0;                          // rad, measured from downward vertical
let angularVelocity = 0;                // rad s^-1
let simulationTime = 0;
let accumulator = 0;
let historySampleAccumulator = 0;

interface MotionSample {
    time: number;
    theta: number;
}

const motionHistory: MotionSample[] = [];
let measuredAmplitude = 0;

function derivatives(time: number, angle: number, omega: number): [number, number] {
    const driveOmega = 2 * Math.PI * drivingFrequency;
    const pivotAcceleration = -PIVOT_AMPLITUDE * driveOmega * driveOmega * Math.sin(driveOmega * time);

    // Exact equation for a pendulum with a horizontally accelerating pivot:
    // theta'' + 2 beta theta' + (g/L) sin(theta)
    //   = -(x_p''/L) cos(theta)
    const angularAcceleration =
        -(G / PENDULUM_LENGTH) * Math.sin(angle)
        - 2 * DAMPING * omega
        - (pivotAcceleration / PENDULUM_LENGTH) * Math.cos(angle);

    return [omega, angularAcceleration];
}

function integrateRK4(dt: number): void {
    const [k1Theta, k1Omega] = derivatives(simulationTime, theta, angularVelocity);
    const [k2Theta, k2Omega] = derivatives(
        simulationTime + dt / 2,
        theta + k1Theta * dt / 2,
        angularVelocity + k1Omega * dt / 2
    );
    const [k3Theta, k3Omega] = derivatives(
        simulationTime + dt / 2,
        theta + k2Theta * dt / 2,
        angularVelocity + k2Omega * dt / 2
    );
    const [k4Theta, k4Omega] = derivatives(
        simulationTime + dt,
        theta + k3Theta * dt,
        angularVelocity + k3Omega * dt
    );

    theta += (dt / 6) * (k1Theta + 2 * k2Theta + 2 * k3Theta + k4Theta);
    angularVelocity += (dt / 6) * (k1Omega + 2 * k2Omega + 2 * k3Omega + k4Omega);
    simulationTime += dt;

    historySampleAccumulator += dt;
    if (historySampleAccumulator >= HISTORY_SAMPLE_STEP) {
        historySampleAccumulator %= HISTORY_SAMPLE_STEP;
        motionHistory.push({ time: simulationTime, theta });
        updateMeasuredAmplitude();
    }
}

function updateMeasuredAmplitude(): void {
    // Keep enough history for several cycles, but do not let very low frequencies
    // create an enormous buffer.
    const windowSeconds = Math.min(12, Math.max(4, 2.5 / drivingFrequency));
    const cutoff = simulationTime - windowSeconds;

    while (motionHistory.length > 0 && motionHistory[0].time < cutoff) {
        motionHistory.shift();
    }

    if (motionHistory.length < 12) {
        measuredAmplitude = 0;
        return;
    }

    let minTheta = Infinity;
    let maxTheta = -Infinity;

    for (const sample of motionHistory) {
        minTheta = Math.min(minTheta, sample.theta);
        maxTheta = Math.max(maxTheta, sample.theta);
    }

    measuredAmplitude = (maxTheta - minTheta) / 2;
}

function clearAmplitudeHistory(): void {
    motionHistory.length = 0;
    measuredAmplitude = 0;
    historySampleAccumulator = 0;
}

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------

naturalFrequencyEl.textContent = `${NATURAL_FREQUENCY.toFixed(2)} Hz`;

function steadyStatePhaseDifference(): number {
    // For the linear damped driven oscillator:
    // tan(phi) = (2 beta omega) / (omega_0^2 - omega^2)
    // atan2 keeps the result in the physically useful range 0 <= phi <= pi.
    const driveOmega = 2 * Math.PI * drivingFrequency;
    return Math.atan2(
        2 * DAMPING * driveOmega,
        OMEGA_0 * OMEGA_0 - driveOmega * driveOmega
    );
}

function formatPhaseRadians(phaseRadians: number): string {
    const piMultiple = phaseRadians / Math.PI;

    // Make the three key A-level cases especially obvious.
    if (Math.abs(piMultiple) < 0.005) return '0π rad';
    if (Math.abs(piMultiple - 0.5) < 0.005) return '0.50π rad';
    if (Math.abs(piMultiple - 1) < 0.005) return '1.00π rad';

    return `${piMultiple.toFixed(2)}π rad`;
}

function updateReadouts(): void {
    const frequencyText = `${drivingFrequency.toFixed(2)} Hz`;
    periodicFrequencyEl.textContent = frequencyText;
    forcedFrequencyEl.textContent = frequencyText;
    sliderFrequencyEl.textContent = frequencyText;
    amplitudeEl.textContent = `${(measuredAmplitude * 180 / Math.PI).toFixed(1)}°`;

    const phaseRadians = steadyStatePhaseDifference();
    const phaseDegrees = phaseRadians * 180 / Math.PI;
    phaseDifferenceEl.textContent = `${phaseDegrees.toFixed(1)}° = ${formatPhaseRadians(phaseRadians)}`;

    const atResonance = Math.abs(drivingFrequency - NATURAL_FREQUENCY) <= RESONANCE_BAND;
    resonanceBadge.classList.toggle('visible', atResonance);
}

frequencySlider.addEventListener('input', () => {
    drivingFrequency = Number(frequencySlider.value);
    clearAmplitudeHistory();
    updateReadouts();
});

// -----------------------------------------------------------------------------
// Drawing
// -----------------------------------------------------------------------------

let canvasWidth = 0;
let canvasHeight = 0;

function resizeCanvas(): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawArrow(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    colour: string,
    lineWidth = 3,
    headSize = 8
): void {
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headSize * Math.cos(angle - Math.PI / 6),
        toY - headSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headSize * Math.cos(angle + Math.PI / 6),
        toY - headSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawDoubleArrow(
    x1: number,
    y: number,
    x2: number,
    colour: string
): void {
    const mid = (x1 + x2) / 2;
    drawArrow(mid, y, x1, y, colour, 2.5, 7);
    drawArrow(mid, y, x2, y, colour, 2.5, 7);
}

function drawLabel(
    text: string,
    x: number,
    y: number,
    colour: string,
    align: CanvasTextAlign = 'center',
    size = 14,
    weight = 800
): void {
    ctx.save();
    ctx.fillStyle = colour;
    ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawMotionArc(
    pivotX: number,
    pivotY: number,
    radius: number,
    colour: string
): void {
    const spread = Math.max(10 * Math.PI / 180, Math.min(measuredAmplitude, 30 * Math.PI / 180));
    const start = Math.PI / 2 - spread;
    const end = Math.PI / 2 + spread;

    ctx.save();
    ctx.strokeStyle = colour;
    ctx.globalAlpha = 0.30;
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, radius, start, end);
    ctx.stroke();
    ctx.restore();
}

function draw(): void {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const periodicColour = '#2563eb';
    const forcedColour = '#7c3aed';
    const mutedColour = '#8793a3';
    const inkColour = '#172033';

    const centreX = canvasWidth / 2;
    const pivotY = Math.max(105, canvasHeight * 0.24);
    const visualLength = Math.min(canvasHeight * 0.54, canvasWidth * 0.33, 245);
    const pixelsPerMetre = visualLength / PENDULUM_LENGTH;
    const driveOmega = 2 * Math.PI * drivingFrequency;
    const pivotDisplacement = PIVOT_AMPLITUDE * Math.sin(driveOmega * simulationTime);
    const pivotX = centreX + pivotDisplacement * pixelsPerMetre;

    const bobX = pivotX + visualLength * Math.sin(theta);
    const bobY = pivotY + visualLength * Math.cos(theta);

    // Guide showing the equilibrium position.
    ctx.save();
    ctx.strokeStyle = '#d8dee7';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(centreX, pivotY + 12);
    ctx.lineTo(centreX, Math.min(canvasHeight - 18, pivotY + visualLength + 28));
    ctx.stroke();
    ctx.restore();

    // Support rail.
    const railHalfWidth = Math.min(105, canvasWidth * 0.22);
    ctx.save();
    ctx.strokeStyle = mutedColour;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centreX - railHalfWidth, pivotY - 34);
    ctx.lineTo(centreX + railHalfWidth, pivotY - 34);
    ctx.stroke();

    // Small ticks make the support's movement visually obvious.
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i += 1) {
        const tickX = centreX + i * railHalfWidth / 4;
        ctx.beginPath();
        ctx.moveTo(tickX, pivotY - 40);
        ctx.lineTo(tickX, pivotY - 28);
        ctx.stroke();
    }
    ctx.restore();

    // Periodic-force label and direction indicator.
    drawLabel('PERIODIC FORCE', centreX, 26, periodicColour, 'center', 14, 900);
    drawDoubleArrow(centreX - Math.min(72, canvasWidth * 0.18), 51, centreX + Math.min(72, canvasWidth * 0.18), periodicColour);

    // Slider carriage / moving pivot.
    ctx.save();
    ctx.fillStyle = periodicColour;
    ctx.fillRect(pivotX - 19, pivotY - 43, 38, 18);
    ctx.strokeStyle = periodicColour;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY - 25);
    ctx.lineTo(pivotX, pivotY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Visual motion range for the bob.
    drawMotionArc(pivotX, pivotY, visualLength, forcedColour);

    // Pendulum rod.
    ctx.save();
    ctx.strokeStyle = inkColour;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    ctx.restore();

    // Bob.
    const bobRadius = Math.max(15, Math.min(22, canvasWidth * 0.026));
    ctx.save();
    ctx.fillStyle = forcedColour;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Forced-vibration label. Place it on whichever side has more room.
    const labelOnRight = bobX < canvasWidth * 0.62;
    const labelX = labelOnRight
        ? Math.min(canvasWidth - 16, centreX + Math.min(185, canvasWidth * 0.30))
        : Math.max(16, centreX - Math.min(185, canvasWidth * 0.30));
    const labelY = Math.min(canvasHeight - 34, pivotY + visualLength * 0.58);
    const textAlign: CanvasTextAlign = labelOnRight ? 'right' : 'left';

    drawLabel('FORCED VIBRATIONS', labelX, labelY, forcedColour, textAlign, 14, 900);

    const arrowStartX = labelOnRight ? labelX - 8 : labelX + 8;
    const arrowEndX = bobX + (labelOnRight ? bobRadius + 5 : -bobRadius - 5);
    const arrowStartY = labelY + 16;
    const arrowEndY = bobY - 4;
    drawArrow(arrowStartX, arrowStartY, arrowEndX, arrowEndY, forcedColour, 2.2, 7);

    // Small natural-frequency annotation near the equilibrium line.
    drawLabel(
        `Natural frequency = ${NATURAL_FREQUENCY.toFixed(2)} Hz`,
        14,
        canvasHeight - 19,
        '#059669',
        'left',
        12,
        800
    );
}

// -----------------------------------------------------------------------------
// Animation loop
// -----------------------------------------------------------------------------

let previousFrameTime = performance.now();

function animate(now: number): void {
    const frameSeconds = Math.min((now - previousFrameTime) / 1000, 0.05);
    previousFrameTime = now;
    accumulator += frameSeconds;

    while (accumulator >= PHYSICS_STEP) {
        integrateRK4(PHYSICS_STEP);
        accumulator -= PHYSICS_STEP;
    }

    updateReadouts();
    draw();
    requestAnimationFrame(animate);
}

const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(canvas);
resizeCanvas();
updateReadouts();
requestAnimationFrame(animate);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        previousFrameTime = performance.now();
        accumulator = 0;
    }
});
