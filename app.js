/* Fluxa Circuit Studio — self-contained interactive SVG circuit workbench.
   The part catalog contains local Fritzing-compatible SVG mappings in assets/fritzing.
*/
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const svgNS = 'http://www.w3.org/2000/svg';

  const dom = {
    canvas: $('#circuitCanvas'),
    canvasWrap: $('#canvasWrap'),
    background: $('#canvasBackground'),
    breadboardBackground: $('#breadboardBackground'),
    wireLayer: $('#wireLayer'),
    componentLayer: $('#componentLayer'),
    annotationLayer: $('#annotationLayer'),
    interactionLayer: $('#interactionLayer'),
    componentList: $('#componentList'),
    partSearch: $('#partSearch'),
    projectName: $('#projectName'),
    saveStatus: $('#saveStatus'),
    undoBtn: $('#undoBtn'),
    redoBtn: $('#redoBtn'),
    simulateBtn: $('#simulateBtn'),
    simulateLabel: $('#simulateLabel'),
    circuitStateChip: $('#circuitStateChip'),
    canvasHelp: $('#canvasHelp'),
    selectionQuickActions: $('#selectionQuickActions'),
    quickMeasurePanel: $('#quickMeasurePanel'),
    quickMeasureToggle: $('#quickMeasureToggle'),
    wiringToggle: $('#wiringToggle'),
    inspectorContent: $('#inspectorContent'),
    labContent: $('#labContent'),
    labDrawer: $('#labDrawer'),
    labResizeHandle: $('#labResizeHandle'),
    modalBackdrop: $('#modalBackdrop'),
    modal: $('#modal'),
    toastRegion: $('#toastRegion'),
    exportMenu: $('#exportMenu'),
    jsonImportInput: $('#jsonImportInput'),
    newProjectBtn: $('#newProjectBtn'),
    learnBtn: $('#learnBtn'),
    lessonDock: $('#lessonDock'),
    themeToggleBtn: $('#themeToggleBtn'),
    themeLabel: $('#themeLabel'),
    aboutBtn: $('#aboutBtn'),
    zoomLabel: $('#zoomLabel'),
    thermalBtn: $('#thermalBtn'),
    snapBtn: $('#snapBtn'),
    boardTextureToggle: $('#boardTextureToggle'),
    boardTextureToggleWrap: $('#boardTextureToggleWrap'),
    konvaMinimap: $('#konvaMinimap'),
    minimapViewport: $('.minimap-viewport')
  };

  const FRITZING_PARTS = {
    resistor: 'assets/fritzing/resistor.svg',
    capacitor: 'assets/fritzing/capacitor.svg',
    diode: 'assets/fritzing/diode.svg',
    led: 'assets/fritzing/led.svg'
  };

  const PARTS = {
    source: {
      title: 'DC Supply', subtitle: 'Bench source · adjustable', group: 'Sources & references', category: 'core', iconClass: 'part-source', prefix: 'V',
      defaults: { value: '9 V', voltage: 9, waveform: 'DC', frequency: 1000 }, models: ['Bench DC supply']
    },
    acsource: {
      title: 'AC Source', subtitle: 'Sine / square generator', group: 'Sources & references', category: 'core', iconClass: 'part-source', prefix: 'AC',
      defaults: { value: '5 V', voltage: 5, waveform: 'Sine', frequency: 1000 }, models: ['Function generator']
    },
    ground: {
      title: 'Ground', subtitle: 'Circuit reference node', group: 'Sources & references', category: 'core', iconClass: 'part-source', prefix: 'GND',
      defaults: { value: '0 V' }, models: ['Signal ground']
    },
    resistor: {
      title: 'Resistor', subtitle: 'Fixed / series resistor', group: 'Passive components', category: 'core', iconClass: '', prefix: 'R',
      defaults: { value: '470 Ω', resistance: 470, rating: 0.25, tolerance: '5%' }, models: ['Generic resistor', 'Yageo CFR-25', 'Vishay MBB0207']
    },
    capacitor: {
      title: 'Capacitor', subtitle: 'Ceramic / electrolytic', group: 'Passive components', category: 'core', iconClass: '', prefix: 'C',
      defaults: { value: '100 nF', capacitance: '100 nF', voltageRating: '50 V', dielectric: 'X7R' }, models: ['Generic capacitor', 'Murata GRM series', 'Nichicon electrolytic']
    },
    inductor: {
      title: 'Inductor', subtitle: 'Coil / choke', group: 'Passive components', category: 'core', iconClass: '', prefix: 'L',
      defaults: { value: '10 mH', inductance: '10 mH', dcr: '1.2 Ω' }, models: ['Generic inductor', 'Bourns RLB series']
    },
    transformer: {
      title: 'Transformer', subtitle: 'Coupled coils', group: 'Passive components', category: 'core', iconClass: '', prefix: 'T',
      defaults: { value: '10:1', ratio: '10:1', powerRating: '3 VA' }, models: ['Generic transformer', 'Triad VPT series']
    },
    potentiometer: {
      title: 'Potentiometer', subtitle: 'Adjustable resistor', group: 'Passive components', category: 'core', iconClass: '', prefix: 'RV',
      defaults: { value: '10 kΩ', resistance: '10 kΩ', position: 50 }, models: ['Generic potentiometer', 'Bourns 3296']
    },
    switch: {
      title: 'SPST Switch', subtitle: 'Manual control', group: 'Passive components', category: 'core', iconClass: '', prefix: 'SW',
      defaults: { value: 'Open', position: 'Open' }, models: ['Generic SPST switch']
    },
    diode: {
      title: 'Diode', subtitle: 'Rectifier / signal diode', group: 'Semiconductors', category: 'semi', iconClass: 'part-semi', prefix: 'D',
      defaults: { value: '1N4007', forwardVoltage: 0.7, maxCurrent: 1, reverseVoltage: 1000 }, models: ['Generic diode', '1N4007', '1N4148']
    },
    bridge: {
      title: 'Bridge Rectifier', subtitle: 'Full-wave diode bridge', group: 'Semiconductors', category: 'semi', iconClass: 'part-semi', prefix: 'BR',
      defaults: { value: 'KBP206', forwardVoltage: 1.4, maxCurrent: 2, reverseVoltage: 600 }, models: ['Generic bridge rectifier', 'KBP206', 'W04']
    },
    zener: {
      title: 'Zener Diode', subtitle: 'Voltage reference', group: 'Semiconductors', category: 'semi', iconClass: 'part-semi', prefix: 'DZ',
      defaults: { value: '5.1 V', zenerVoltage: 5.1, powerRating: 1 }, models: ['Generic Zener', '1N4733A · 5.1 V', 'BZX55C12 · 12 V']
    },
    led: {
      title: 'LED', subtitle: 'Indicator · green', group: 'Semiconductors', category: 'semi', iconClass: 'part-semi', prefix: 'D',
      defaults: { value: 'Green LED', forwardVoltage: 2.1, maxCurrent: 0.02, color: 'Green' }, models: ['Generic LED', 'Kingbright WP7113SGD', 'Cree C503B-GAN']
    },
    bjt: {
      title: 'BJT Transistor', subtitle: 'NPN / PNP', group: 'Semiconductors', category: 'semi', iconClass: 'part-semi', prefix: 'Q',
      defaults: { value: '2N2222', polarity: 'NPN', hfe: 100, maxCurrent: 0.6, vceo: 40 }, models: ['Generic NPN', '2N2222', 'BC547']
    },
    mosfet: {
      title: 'MOSFET', subtitle: 'N-channel / P-channel', group: 'Semiconductors', category: 'semi', iconClass: 'part-semi', prefix: 'Q',
      defaults: { value: 'IRFZ44N', channel: 'N-channel', rds: 0.0175, maxCurrent: 49 }, models: ['Generic N-MOSFET', 'IRFZ44N', '2N7000']
    },
    timer555: {
      title: '555 Timer', subtitle: 'NE555 · timing IC', group: 'Integrated circuits', category: 'ic', iconClass: 'part-ic', prefix: 'U',
      defaults: { value: 'NE555P', supply: '4.5–16 V', mode: 'Astable', frequency: '1 kHz' }, models: ['Generic 555', 'NE555P', 'LMC555 CMOS']
    },
    opamp: {
      title: 'Op-Amp 741', subtitle: 'LM741 · amplifier', group: 'Integrated circuits', category: 'ic', iconClass: 'part-ic', prefix: 'U',
      defaults: { value: 'LM741', supply: '±15 V', gain: 100000, bandwidth: '1 MHz' }, models: ['Generic op-amp', 'LM741CN', 'TL081']
    }
  };

  const MODEL_DATA = {
    'Bench DC supply': { detail: '0–30 V regulated laboratory model', params: { voltage: 9 } },
    'Function generator': { detail: 'Low-distortion source with sine and square modes', params: { waveform: 'Sine', frequency: 1000 } },
    'Signal ground': { detail: 'Zero-volt simulation reference', params: {} },
    'Generic resistor': { detail: 'IEC schematic model · 0.25 W', params: { resistance: 470, rating: 0.25, tolerance: '5%' } },
    'Yageo CFR-25': { detail: 'Carbon film · 0.25 W · ±5%', params: { rating: 0.25, tolerance: '5%' } },
    'Vishay MBB0207': { detail: 'Metal film · 0.6 W · ±1%', params: { rating: 0.6, tolerance: '1%' } },
    'Generic capacitor': { detail: 'Ideal capacitive model', params: { capacitance: '100 nF', voltageRating: '50 V' } },
    'Murata GRM series': { detail: 'MLCC model · X7R dielectric', params: { capacitance: '100 nF', voltageRating: '50 V', dielectric: 'X7R' } },
    'Nichicon electrolytic': { detail: 'Polarized aluminum capacitor model', params: { capacitance: '10 µF', voltageRating: '25 V', dielectric: 'Electrolytic' } },
    'Generic inductor': { detail: 'Ideal coil with series DCR', params: { inductance: '10 mH', dcr: '1.2 Ω' } },
    'Bourns RLB series': { detail: 'Radial power inductor model', params: { inductance: '10 mH', dcr: '0.82 Ω' } },
    'Generic transformer': { detail: 'Ideal coupled-winding model', params: { ratio: '10:1', powerRating: '3 VA' } },
    'Triad VPT series': { detail: 'Encapsulated PCB transformer model', params: { ratio: '10:1', powerRating: '2.5 VA' } },
    'Generic potentiometer': { detail: 'Three-terminal adjustable resistance', params: { resistance: '10 kΩ', position: 50 } },
    'Bourns 3296': { detail: 'Multi-turn trimmer · 0.5 W', params: { resistance: '10 kΩ', position: 50 } },
    'Generic SPST switch': { detail: 'Ideal open / closed contact', params: { position: 'Open' } },
    'Generic diode': { detail: 'Constant 0.7 V forward model', params: { forwardVoltage: 0.7, maxCurrent: 1, reverseVoltage: 100 } },
    '1N4007': { detail: '1 A rectifier · 1000 V repetitive reverse voltage', params: { value: '1N4007', forwardVoltage: 0.7, maxCurrent: 1, reverseVoltage: 1000 } },
    '1N4148': { detail: '100 mA fast switching diode · 100 V', params: { value: '1N4148', forwardVoltage: 0.72, maxCurrent: 0.1, reverseVoltage: 100 } },
    'Generic bridge rectifier': { detail: 'Full-wave bridge model with two diode drops in the conducting path', params: { value: 'Bridge rectifier', forwardVoltage: 1.4, maxCurrent: 1, reverseVoltage: 400 } },
    'KBP206': { detail: 'Single-phase bridge rectifier · 2 A · 600 V', params: { value: 'KBP206', forwardVoltage: 1.4, maxCurrent: 2, reverseVoltage: 600 } },
    'W04': { detail: 'Single-phase bridge rectifier · 1.5 A · 400 V', params: { value: 'W04', forwardVoltage: 1.4, maxCurrent: 1.5, reverseVoltage: 400 } },
    'Generic Zener': { detail: 'Ideal shunt voltage reference', params: { zenerVoltage: 5.1, powerRating: 1 } },
    '1N4733A · 5.1 V': { detail: '5.1 V Zener · 1 W axial package', params: { value: '1N4733A', zenerVoltage: 5.1, powerRating: 1 } },
    'BZX55C12 · 12 V': { detail: '12 V Zener · 0.5 W axial package', params: { value: 'BZX55C12', zenerVoltage: 12, powerRating: 0.5 } },
    'Generic LED': { detail: 'Constant-forward-voltage LED model', params: { forwardVoltage: 2.1, maxCurrent: 0.02, color: 'Green' } },
    'Kingbright WP7113SGD': { detail: 'Green 5 mm indicator · 20 mA nominal', params: { value: 'WP7113SGD', forwardVoltage: 2.1, maxCurrent: 0.03, color: 'Green' } },
    'Cree C503B-GAN': { detail: 'High-efficiency green LED · 30 mA max', params: { value: 'C503B-GAN', forwardVoltage: 3.2, maxCurrent: 0.03, color: 'Green' } },
    'Generic NPN': { detail: 'Ebers–Moll NPN simulation model', params: { polarity: 'NPN', hfe: 100, maxCurrent: 0.2, vceo: 30 } },
    '2N2222': { detail: 'NPN switching transistor · 600 mA · 40 V', params: { value: '2N2222', polarity: 'NPN', hfe: 100, maxCurrent: 0.6, vceo: 40 } },
    'BC547': { detail: 'Low-noise NPN transistor · 100 mA · 45 V', params: { value: 'BC547', polarity: 'NPN', hfe: 200, maxCurrent: 0.1, vceo: 45 } },
    'Generic N-MOSFET': { detail: 'Level-1 N-channel MOSFET model', params: { channel: 'N-channel', rds: 0.1, maxCurrent: 1 } },
    'IRFZ44N': { detail: 'N-channel power MOSFET · 49 A · 55 V', params: { value: 'IRFZ44N', channel: 'N-channel', rds: 0.0175, maxCurrent: 49 } },
    '2N7000': { detail: 'Small-signal N-channel MOSFET · 200 mA', params: { value: '2N7000', channel: 'N-channel', rds: 5, maxCurrent: 0.2 } },
    'Generic 555': { detail: 'Functional 555 timer macromodel', params: { supply: '4.5–16 V', mode: 'Astable' } },
    'NE555P': { detail: 'Bipolar timer · 4.5–16 V operating range', params: { value: 'NE555P', supply: '4.5–16 V', mode: 'Astable' } },
    'LMC555 CMOS': { detail: 'CMOS timer · low supply current', params: { value: 'LMC555', supply: '1.5–15 V', mode: 'Astable' } },
    'Generic op-amp': { detail: 'Ideal differential amplifier model', params: { gain: 100000, bandwidth: '1 MHz' } },
    'LM741CN': { detail: 'General-purpose op-amp · ±10 to ±18 V', params: { value: 'LM741CN', supply: '±15 V', gain: 200000, bandwidth: '1 MHz' } },
    'TL081': { detail: 'JFET-input op-amp · 3 MHz GBW', params: { value: 'TL081', supply: '±15 V', gain: 200000, bandwidth: '3 MHz' } }
  };

  const LESSONS = [
    {
      id: 'led-resistor', icon: '◉', title: 'LED + Resistor', level: 'Starter', duration: '5 min',
      summary: 'Build a safe LED indicator and learn why a resistor matters.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a DC supply.', hint: 'Drag DC Supply from Sources & references onto the canvas.' },
        { kind: 'place', type: 'resistor', text: 'Add a resistor to limit current.', hint: 'A resistor protects the LED from too much current.' },
        { kind: 'place', type: 'led', text: 'Add a green LED.', hint: 'Place the LED to the right of the resistor.' },
        { kind: 'place', type: 'ground', text: 'Add a ground reference.', hint: 'Every simple DC circuit needs a return path to GND.' },
        { kind: 'wire', types: ['source', 'resistor'], text: 'Wire the supply to the resistor.', hint: 'Click or drag from the positive source terminal to one resistor terminal.' },
        { kind: 'wire', types: ['resistor', 'led'], text: 'Wire the resistor to the LED.', hint: 'Connect the free resistor terminal to the LED input.' },
        { kind: 'wire', types: ['led', 'ground'], text: 'Wire the LED to ground.', hint: 'Connect the LED output terminal to GND.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Complete the return path.', hint: 'Connect the negative source terminal to GND.' },
        { kind: 'simulate', text: 'Run the circuit.', hint: 'Press Simulate to see current flow and LED brightness.' }
      ]
    },
    {
      id: 'voltage-divider', icon: '÷', title: 'Voltage Divider', level: 'Starter', duration: '6 min',
      summary: 'Use two resistors to create a lower voltage at a midpoint.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a DC supply.', hint: 'Start with a DC Supply.' },
        { kind: 'place', type: 'resistor', count: 2, text: 'Add two resistors.', hint: 'The two resistors form the divider.' },
        { kind: 'place', type: 'ground', text: 'Add ground.', hint: 'Ground defines the reference voltage.' },
        { kind: 'wire', types: ['source', 'resistor'], text: 'Connect the source to the first resistor.', hint: 'Start from the positive source terminal.' },
        { kind: 'wire', types: ['resistor', 'resistor'], text: 'Connect the two resistors together.', hint: 'Their shared point is the divider output.' },
        { kind: 'wire', types: ['resistor', 'ground'], text: 'Connect the lower resistor to ground.', hint: 'This completes the divider path.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Connect source negative to ground.', hint: 'Close the DC return path.' },
        { kind: 'simulate', text: 'Run the divider.', hint: 'Use the Probe tool later to inspect the midpoint.' }
      ]
    },
    {
      id: 'rc-filter', icon: '∿', title: 'RC Low-pass Filter', level: 'Starter', duration: '7 min',
      summary: 'Combine a resistor and capacitor to smooth a changing signal.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a source.', hint: 'Use a DC Supply or replace it with an AC Source after the lesson.' },
        { kind: 'place', type: 'resistor', text: 'Add a series resistor.', hint: 'The resistor controls how quickly the capacitor charges.' },
        { kind: 'place', type: 'capacitor', text: 'Add a capacitor.', hint: 'The capacitor stores charge and smooths the output.' },
        { kind: 'place', type: 'ground', text: 'Add ground.', hint: 'Use GND for the return path.' },
        { kind: 'wire', types: ['source', 'resistor'], text: 'Connect source to resistor.', hint: 'Wire from the source output to the resistor.' },
        { kind: 'wire', types: ['resistor', 'capacitor'], text: 'Connect resistor to capacitor.', hint: 'Their shared point is the filtered output.' },
        { kind: 'wire', types: ['capacitor', 'ground'], text: 'Connect capacitor to ground.', hint: 'This lets the capacitor charge and discharge.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Complete the return path.', hint: 'Connect source negative to GND.' },
        { kind: 'simulate', text: 'Run the filter.', hint: 'Open Signal Lab to observe the source and output.' }
      ]
    },
    {
      id: 'button-led', icon: '⏻', title: 'Push-button LED', level: 'Starter', duration: '6 min',
      summary: 'Put a switch in series with an LED indicator.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a DC supply.', hint: 'Use the DC Supply component.' },
        { kind: 'place', type: 'switch', text: 'Add an SPST switch.', hint: 'The switch controls whether current can flow.' },
        { kind: 'place', type: 'resistor', text: 'Add a current-limiting resistor.', hint: 'Keep the LED protected.' },
        { kind: 'place', type: 'led', text: 'Add an LED.', hint: 'Place it after the resistor.' },
        { kind: 'place', type: 'ground', text: 'Add ground.', hint: 'Finish with a ground reference.' },
        { kind: 'wire', types: ['source', 'switch'], text: 'Wire source to switch.', hint: 'Use the positive terminal of the source.' },
        { kind: 'wire', types: ['switch', 'resistor'], text: 'Wire switch to resistor.', hint: 'The switch should sit before the resistor.' },
        { kind: 'wire', types: ['resistor', 'led'], text: 'Wire resistor to LED.', hint: 'Connect the resistor output to the LED input.' },
        { kind: 'wire', types: ['led', 'ground'], text: 'Wire LED to ground.', hint: 'Connect the LED output to GND.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Close the return path.', hint: 'Connect source negative to GND.' },
        { kind: 'simulate', text: 'Run the circuit.', hint: 'Try changing the switch position in Properties.' }
      ]
    },
    {
      id: 'npn-switch', icon: 'Q', title: 'NPN Transistor Switch', level: 'Intermediate', duration: '10 min',
      summary: 'Explore how an NPN transistor can control an LED load.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a DC supply.', hint: 'This supplies the load and control path.' },
        { kind: 'place', type: 'resistor', count: 2, text: 'Add two resistors.', hint: 'One is for the LED load and one helps limit base current.' },
        { kind: 'place', type: 'led', text: 'Add an LED load.', hint: 'Place the LED after the load resistor.' },
        { kind: 'place', type: 'bjt', text: 'Add an NPN transistor.', hint: 'Select the 2N2222 model if you want a real example part.' },
        { kind: 'place', type: 'ground', text: 'Add ground.', hint: 'The emitter return connects to ground.' },
        { kind: 'wire', types: ['source', 'resistor'], text: 'Connect supply to a resistor.', hint: 'One resistor can feed the LED load.' },
        { kind: 'wire', types: ['resistor', 'led'], text: 'Connect resistor to LED.', hint: 'This is the load path.' },
        { kind: 'wire', types: ['led', 'bjt'], text: 'Connect LED to the transistor.', hint: 'Use the collector-side terminal of the transistor.' },
        { kind: 'wire', types: ['bjt', 'ground'], text: 'Connect transistor to ground.', hint: 'Use the emitter-side terminal as the return path.' },
        { kind: 'wire', types: ['resistor', 'bjt'], text: 'Add a base-control connection.', hint: 'Use the second resistor between a control point and the base.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Complete the source return.', hint: 'Connect source negative to GND.' },
        { kind: 'simulate', text: 'Run the switch example.', hint: 'Use the Inspector to review the estimated operating point.' }
      ]
    },
    {
      id: 'timer-blinker', icon: '555', title: '555 Timer Blinker', level: 'Intermediate', duration: '12 min',
      summary: 'Arrange a 555 timer with RC timing parts for a blinking concept.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a DC supply.', hint: 'The 555 needs a supply and ground reference.' },
        { kind: 'place', type: 'timer555', text: 'Add a 555 timer.', hint: 'Use the NE555P model for a familiar part.' },
        { kind: 'place', type: 'resistor', count: 2, text: 'Add two timing resistors.', hint: 'Together they help set the charge and discharge timing.' },
        { kind: 'place', type: 'capacitor', text: 'Add a timing capacitor.', hint: 'The capacitor creates the timing interval.' },
        { kind: 'place', type: 'ground', text: 'Add ground.', hint: 'Use GND for the timer return.' },
        { kind: 'wire', types: ['source', 'timer555'], text: 'Connect power to the 555.', hint: 'Wire source positive to the timer supply terminal.' },
        { kind: 'wire', types: ['timer555', 'ground'], text: 'Ground the timer.', hint: 'Wire the timer ground terminal to GND.' },
        { kind: 'wire', types: ['resistor', 'timer555'], text: 'Connect a timing resistor to the timer.', hint: 'Use the timing-related pins on the 555 symbol.' },
        { kind: 'wire', types: ['capacitor', 'timer555'], text: 'Connect the capacitor to the timer.', hint: 'The capacitor shares the timing node.' },
        { kind: 'wire', types: ['capacitor', 'ground'], text: 'Ground the timing capacitor.', hint: 'This completes the RC branch.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Complete the power return.', hint: 'Connect source negative to GND.' },
        { kind: 'simulate', text: 'Run the timing example.', hint: 'Use Signal Lab to explore the generated signal concept.' }
      ]
    },
    {
      id: 'opamp-amplifier', icon: '△', title: 'Basic Op-Amp Amplifier', level: 'Intermediate', duration: '12 min',
      summary: 'Arrange a simple feedback concept around an op-amp.',
      steps: [
        { kind: 'place', type: 'source', text: 'Place a DC supply.', hint: 'Use a source as a simple input/reference for this lesson.' },
        { kind: 'place', type: 'opamp', text: 'Add an Op-Amp 741.', hint: 'The op-amp symbol has +, − and OUT terminals.' },
        { kind: 'place', type: 'resistor', count: 2, text: 'Add two resistors.', hint: 'One can represent an input resistor and one feedback resistor.' },
        { kind: 'place', type: 'ground', text: 'Add ground.', hint: 'Ground provides the common reference.' },
        { kind: 'wire', types: ['source', 'opamp'], text: 'Connect a source to the op-amp.', hint: 'Use one of the input terminals.' },
        { kind: 'wire', types: ['resistor', 'opamp'], text: 'Connect a resistor to an input.', hint: 'This creates the input/feedback concept.' },
        { kind: 'wire', types: ['opamp', 'resistor'], text: 'Connect output through a resistor.', hint: 'Use the OUT terminal and the second resistor.' },
        { kind: 'wire', types: ['resistor', 'ground'], text: 'Connect a resistor to ground.', hint: 'This gives the feedback path a reference.' },
        { kind: 'wire', types: ['source', 'ground'], text: 'Connect source negative to ground.', hint: 'Complete the source reference.' },
        { kind: 'simulate', text: 'Run the amplifier concept.', hint: 'Inspect the model and discuss feedback with the glossary card.' }
      ]
    }
  ];

  const typeOrder = ['source', 'acsource', 'ground', 'resistor', 'capacitor', 'inductor', 'transformer', 'potentiometer', 'switch', 'diode', 'bridge', 'zener', 'led', 'bjt', 'mosfet', 'timer555', 'opamp'];
  const DEFAULT_COMPONENTS = [
    { id: 'c-v1', type: 'source', label: 'V1', x: 170, y: 365, rotation: 0, model: 'Bench DC supply', props: { value: '9 V', voltage: 9, waveform: 'DC', frequency: 1000 } },
    { id: 'c-r1', type: 'resistor', label: 'R1', x: 345, y: 319, rotation: 0, model: 'Generic resistor', props: { value: '470 Ω', resistance: 470, rating: 0.25, tolerance: '5%' } },
    { id: 'c-d1', type: 'led', label: 'D1', x: 518, y: 319, rotation: 0, model: 'Kingbright WP7113SGD', props: { value: 'WP7113SGD', forwardVoltage: 2.1, maxCurrent: 0.03, color: 'Green' } },
    { id: 'c-gnd', type: 'ground', label: 'GND', x: 635, y: 415, rotation: 0, model: 'Signal ground', props: { value: '0 V' } }
  ];
  const DEFAULT_WIRES = [
    { id: 'w-1', from: { compId: 'c-v1', pin: 0 }, to: { compId: 'c-r1', pin: 0 } },
    { id: 'w-2', from: { compId: 'c-r1', pin: 1 }, to: { compId: 'c-d1', pin: 0 } },
    { id: 'w-3', from: { compId: 'c-d1', pin: 1 }, to: { compId: 'c-gnd', pin: 0 } },
    { id: 'w-4', from: { compId: 'c-v1', pin: 1 }, to: { compId: 'c-gnd', pin: 0 } }
  ];

  function clone(data) { return JSON.parse(JSON.stringify(data)); }
  function initialState() {
    return {
      projectName: 'LED Signal Lab',
      components: clone(DEFAULT_COMPONENTS),
      wires: clone(DEFAULT_WIRES),
      view: 'schematic', tool: 'select', selectedId: null, selectedWireId: null,
      heatmap: false, snap: true, breadboardTexture: false, theme: 'dark', quickMeasureVisible: true, wiringEnabled: true, running: false, labTab: 'scope', rightTab: 'properties',
      meterMode: 'voltage', probeTerminals: []
    };
  }

  let state = initialState();
  let simulation = null;
  let history = [];
  let historyIndex = -1;
  let selectedCategory = 'all';
  let viewBox = { x: 0, y: 0, w: 1200, h: 690 };
  let dragState = null;
  let panState = null;
  let panFrame = null;
  let wireStart = null;
  let wirePointer = null;
  let liveTimer = null;
  let lastSaved = 0;
  let labResize = null;
  let miniMapStage = null;
  let miniMapLayer = null;
  let activeLessonId = null;
  let lessonStepIndex = 0;
  let beginnerMode = true;
  let lessonHintVisible = false;
  let lessonCompletionAnnounced = false;
  let quickMeasureTarget = null;
  let autoConnectPreview = [];
  let pendingPropertyChange = false;

  function applyTheme(persist = false) {
    const light = state.theme === 'light';
    document.body.classList.toggle('light-theme', light);
    document.documentElement.style.colorScheme = light ? 'light' : 'dark';
    if (dom.themeLabel) dom.themeLabel.textContent = light ? 'Dark' : 'Light';
    if (dom.themeToggleBtn) dom.themeToggleBtn.title = light ? 'Switch to dark theme' : 'Switch to light theme';
    if (persist) {
      try { localStorage.setItem('fluxa-theme-v1', state.theme); } catch (_) {}
    }
  }
  function restoreTheme() {
    try {
      const stored = localStorage.getItem('fluxa-theme-v1');
      if (stored === 'light' || stored === 'dark') state.theme = stored;
    } catch (_) {}
    applyTheme();
  }
  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(true);
    renderAll();
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }
  function trimNumber(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return Number(n.toFixed(digits)).toString();
  }
  function parseNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const text = String(value ?? '').trim().replace(',', '.');
    const match = text.match(/([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*([pnumkMµ]?)/i);
    if (!match) return fallback;
    const n = Number(match[1]);
    const prefix = match[2];
    const multipliers = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, M: 1e6 };
    return n * (multipliers[prefix] || 1);
  }
  function formatResistance(value) {
    const v = Math.abs(Number(value) || 0);
    if (v >= 1e6) return `${trimNumber(v / 1e6, 3)} MΩ`;
    if (v >= 1e3) return `${trimNumber(v / 1e3, 3)} kΩ`;
    return `${trimNumber(v, 3)} Ω`;
  }
  function formatVoltage(value) { return `${trimNumber(value, Math.abs(value) < 1 ? 3 : 2)} V`; }
  function formatCurrent(value) {
    const a = Math.abs(value);
    if (a < 1e-6) return `${trimNumber(value * 1e9, 2)} nA`;
    if (a < 1e-3) return `${trimNumber(value * 1e6, 2)} µA`;
    if (a < 1) return `${trimNumber(value * 1e3, 2)} mA`;
    return `${trimNumber(value, 2)} A`;
  }
  function formatPower(value) {
    const p = Math.abs(value);
    if (p < 1e-3) return `${trimNumber(value * 1e6, 1)} µW`;
    if (p < 1) return `${trimNumber(value * 1e3, 1)} mW`;
    return `${trimNumber(value, 2)} W`;
  }
  const GREEN_LED_IV_CURVE = [
    [0, 0], [0.01, 1.36], [0.1, 1.52], [1, 1.69], [5, 1.90], [20, 2.10], [50, 2.14], [100, 2.17], [150, 2.20], [300, 2.25]
  ];
  function interpolateLedCurve(currentMilliamp, curve = GREEN_LED_IV_CURVE) {
    const current = Math.max(0, currentMilliamp);
    for (let index = 1; index < curve.length; index++) {
      const [upperCurrent, upperVoltage] = curve[index];
      if (current <= upperCurrent) {
        const [lowerCurrent, lowerVoltage] = curve[index - 1];
        const ratio = upperCurrent === lowerCurrent ? 0 : (current - lowerCurrent) / (upperCurrent - lowerCurrent);
        return lowerVoltage + (upperVoltage - lowerVoltage) * ratio;
      }
    }
    const [lastCurrent, lastVoltage] = curve[curve.length - 1];
    const [previousCurrent, previousVoltage] = curve[curve.length - 2];
    return lastVoltage + ((current - lastCurrent) * (lastVoltage - previousVoltage)) / (lastCurrent - previousCurrent);
  }
  function ledForwardVoltageAtCurrent(component, currentAmp) {
    const nominal = Number(component.props?.forwardVoltage || 2.1);
    const nominalCurveVoltage = 2.1;
    const modelOffset = nominal - nominalCurveVoltage;
    return Math.max(0, interpolateLedCurve(currentAmp * 1000) + modelOffset);
  }
  function solveSeriesLedCurrent(sourceVoltage, totalResistance, fixedDrop, leds) {
    if (sourceVoltage <= fixedDrop || totalResistance <= 0) return 0;
    let low = 0;
    let high = Math.max(0, (sourceVoltage - fixedDrop) / totalResistance);
    for (let iteration = 0; iteration < 42; iteration++) {
      const current = (low + high) / 2;
      const ledDrop = leds.reduce((sum, component) => sum + ledForwardVoltageAtCurrent(component, current), 0);
      const balance = current * totalResistance + fixedDrop + ledDrop - sourceVoltage;
      if (balance > 0) high = current;
      else low = current;
    }
    return low;
  }
  function getComponent(id) { return state.components.find(component => component.id === id); }
  function getWire(id) { return state.wires.find(wire => wire.id === id); }
  function componentMetric(id) { return simulation?.metrics?.[id] || { voltage: 0, current: 0, power: 0, temp: 25 }; }
  function getLesson(id = activeLessonId) { return LESSONS.find(lesson => lesson.id === id) || null; }
  function getCurrentLessonStep() {
    const lesson = getLesson();
    return lesson?.steps[lessonStepIndex] || null;
  }
  function countLessonComponents(type) { return state.components.filter(component => component.type === type).length; }
  function hasWireBetweenTypes(firstType, secondType) {
    return state.wires.some(wire => {
      const first = getComponent(wire.from.compId);
      const second = getComponent(wire.to.compId);
      if (!first || !second) return false;
      return (first.type === firstType && second.type === secondType) || (first.type === secondType && second.type === firstType);
    });
  }
  function isLessonStepComplete(step) {
    if (!step) return false;
    if (step.kind === 'place') return countLessonComponents(step.type) >= (step.count || 1);
    if (step.kind === 'wire') return hasWireBetweenTypes(step.types[0], step.types[1]);
    if (step.kind === 'simulate') return state.running;
    return false;
  }
  function updateLessonProgress() {
    const lesson = getLesson();
    if (!lesson) { lessonStepIndex = 0; return; }
    let index = 0;
    while (index < lesson.steps.length && isLessonStepComplete(lesson.steps[index])) index++;
    lessonStepIndex = index;
    if (index === lesson.steps.length && !lessonCompletionAnnounced) {
      lessonCompletionAnnounced = true;
      showToast(`Lesson complete: ${lesson.title}. Great work!`);
    }
    if (index < lesson.steps.length) lessonCompletionAnnounced = false;
  }
  function getLessonTargetTypes() {
    const step = getCurrentLessonStep();
    if (!step || !beginnerMode) return [];
    if (step.kind === 'place') return [step.type];
    if (step.kind === 'wire') return step.types;
    return [];
  }
  function isLessonComponentTarget(component) {
    return Boolean(activeLessonId && beginnerMode && getLessonTargetTypes().includes(component.type));
  }
  function primaryValue(component) { 
    if (!component) return '';
    const p = component.props || {};
    if (component.type === 'resistor') return p.value || formatResistance(p.resistance);
    if (component.type === 'source' || component.type === 'acsource') return p.value || formatVoltage(p.voltage);
    if (component.type === 'capacitor') return p.capacitance || p.value;
    if (component.type === 'inductor') return p.inductance || p.value;
    if (component.type === 'transformer') return p.ratio || p.value;
    if (component.type === 'potentiometer') return p.resistance || p.value;
    if (component.type === 'zener') return `${p.zenerVoltage || 5.1} V`;
    return p.value || PARTS[component.type]?.title || '';
  }

  function getPins(component) {
    switch (component.type) {
      case 'source': case 'acsource': return [{ dx: 0, dy: -47, label: '+' }, { dx: 0, dy: 47, label: '−' }];
      case 'ground': return [{ dx: 0, dy: -25, label: 'GND' }];
      case 'bjt': return [{ dx: -41, dy: 0, label: 'B' }, { dx: 33, dy: -27, label: 'C' }, { dx: 33, dy: 27, label: 'E' }];
      case 'mosfet': return [{ dx: -45, dy: 0, label: 'G' }, { dx: 35, dy: -27, label: 'D' }, { dx: 35, dy: 27, label: 'S' }];
      case 'timer555': return [{ dx: -59, dy: -23, label: 'TR' }, { dx: -59, dy: 5, label: 'TH' }, { dx: -59, dy: 26, label: 'RS' }, { dx: 59, dy: -23, label: 'V+' }, { dx: 59, dy: 3, label: 'OUT' }, { dx: 59, dy: 25, label: 'GND' }];
      case 'opamp': return [{ dx: -52, dy: -19, label: '−' }, { dx: -52, dy: 19, label: '+' }, { dx: 50, dy: 0, label: 'OUT' }, { dx: 0, dy: -43, label: 'V+' }, { dx: 0, dy: 43, label: 'V−' }];
      case 'potentiometer': return [{ dx: -58, dy: 0, label: '1' }, { dx: 58, dy: 0, label: '3' }, { dx: 0, dy: -42, label: 'W' }];
      case 'transformer': return [{ dx: -55, dy: -22, label: 'P1' }, { dx: -55, dy: 22, label: 'P2' }, { dx: 55, dy: -22, label: 'S1' }, { dx: 55, dy: 22, label: 'S2' }];
      case 'bridge': return [{ dx: -48, dy: 0, label: '~1' }, { dx: 48, dy: 0, label: '~2' }, { dx: 0, dy: -48, label: '+' }, { dx: 0, dy: 48, label: '−' }];
      default: return [{ dx: -62, dy: 0, label: '1' }, { dx: 62, dy: 0, label: '2' }];
    }
  }
  function rotatePoint(x, y, degrees = 0) {
    const rad = degrees * Math.PI / 180;
    return { x: x * Math.cos(rad) - y * Math.sin(rad), y: x * Math.sin(rad) + y * Math.cos(rad) };
  }
  function getTerminalPosition(component, pin) {
    const descriptor = getPins(component)[pin];
    if (!descriptor) return { x: component.x, y: component.y };
    const rotated = rotatePoint(descriptor.dx, descriptor.dy, component.rotation || 0);
    return { x: component.x + rotated.x, y: component.y + rotated.y };
  }
  function getTerminalFromPoint(point) {
    const component = getComponent(point.compId);
    return component ? getTerminalPosition(component, point.pin) : null;
  }
  function pinKey(point) { return `${point.compId}:${point.pin}`; }
  function terminalPointFromElement(element) {
    const terminal = element?.closest?.('[data-terminal-comp]');
    if (!terminal) return null;
    return { compId: terminal.dataset.terminalComp, pin: Number(terminal.dataset.terminalPin) };
  }
  function terminalPointAtClient(clientX, clientY) {
    return terminalPointFromElement(document.elementFromPoint(clientX, clientY));
  }
  function getBounds(component) {
    if (component.type === 'source' || component.type === 'acsource') return { x: -37, y: -52, w: 74, h: 104 };
    if (component.type === 'ground') return { x: -39, y: -30, w: 78, h: 55 };
    if (component.type === 'bjt' || component.type === 'mosfet') return { x: -51, y: -46, w: 102, h: 92 };
    if (component.type === 'timer555') return { x: -61, y: -42, w: 122, h: 84 };
    if (component.type === 'opamp') return { x: -56, y: -47, w: 112, h: 94 };
    if (component.type === 'transformer') return { x: -58, y: -43, w: 116, h: 86 };
    if (component.type === 'bridge') return { x: -55, y: -55, w: 110, h: 110 };
    if (component.type === 'potentiometer') return { x: -67, y: -48, w: 134, h: 96 };
    return { x: -67, y: -37, w: 134, h: 74 };
  }

  function partIconSvg(type) {
    const commonStart = '<svg viewBox="0 0 44 30" aria-hidden="true">';
    const commonEnd = '</svg>';
    const shapes = {
      source: '<circle cx="22" cy="15" r="9"/><path d="M22 2v5m0 16v5M19 12h6m-3-3v6"/>',
      acsource: '<circle cx="22" cy="15" r="9"/><path d="M10 15h5m14 0h5m-16 0c2-5 4-5 6 0s4 5 6 0"/>',
      ground: '<path d="M22 4v10m-8 0h16m-13 4h10m-7 4h4"/>',
      resistor: '<path d="M2 15h7l3-7 5 14 5-14 5 14 5-14 3 7h7"/>',
      capacitor: '<path d="M2 15h15m0-8v16m8-16v16m0 8h17"/>',
      inductor: '<path d="M2 15h6c0-10 8-10 8 0 0-10 8-10 8 0 0-10 8-10 8 0h10"/>',
      transformer: '<path d="M2 7h7c5 0 5 6 0 6 5 0 5 6 0 6H2M42 7h-7c-5 0-5 6 0 6-5 0-5 6 0 6h7M21 4v22m3-22v22"/>',
      potentiometer: '<path d="M2 16h8l3-7 5 14 5-14 5 14 3-7h8M22 3v12m0-12-4 4m4-4 4 4"/>',
      switch: '<path d="M4 20h8m20 0h8M12 20 30 9"/><circle cx="12" cy="20" r="1.5"/><circle cx="32" cy="20" r="1.5"/>',
      diode: '<path d="M2 15h12l10-8v16L14 15h-12m22-8v16m0-8h18"/>',
      bridge: '<path d="M22 3 37 15 22 27 7 15Z"/><path d="M2 15h5m30 0h5M22 3v5m0 11v8M16 12h12M22 8v8"/>',
      zener: '<path d="M2 15h12l10-8v16L14 15h-12m22-8v4m0 4v4m0-4h18"/>',
      led: '<path d="M2 17h12l10-8v16l-10-8H2m22-8v16m0-8h18M28 7l5-4m-1 7 5-4"/>',
      bjt: '<circle cx="23" cy="15" r="8"/><path d="M3 15h12m8-5 10-6m-10 11 10 6m-4-4 4 0-2-3"/>',
      mosfet: '<path d="M3 15h12m5-9v18m0-10h12m-12 6h12m-2-13v16m-5-8h16"/>',
      timer555: '<rect x="8" y="4" width="28" height="22" rx="2"/><path d="M4 9h4m-4 6h4m-4 6h4m28-12h4m-4 6h4m-4 6h4"/><text x="22" y="18" text-anchor="middle" stroke="none" fill="currentColor" font-size="9">555</text>',
      opamp: '<path d="M7 5 7 25 34 15 7 5Zm8 7h6m-3-3v6m0 0h6"/><path d="M34 15h7"/> '
    };
    return `${commonStart}${shapes[type] || shapes.resistor}${commonEnd}`;
  }

  function breadboardSymbol(component) {
    const type = component.type;
    if (type === 'source' || type === 'acsource') return '<path class="part-pin" d="M0 -47V-28M0 28V47"/><rect class="bread-source" x="-24" y="-28" width="48" height="56" rx="7"/><rect class="bread-screen" x="-14" y="-16" width="28" height="14" rx="2"/><path class="bread-screen-line" d="M-8 13h16M0 7v12"/>';
    if (type === 'ground') return '<path class="part-pin" d="M0 -25V-4"/><path class="part-stroke" d="M-21 -4H21M-14 2H14M-7 8H7"/>';
    if (type === 'resistor') return '<path class="part-pin" d="M-62 0H-36M36 0H62"/><rect class="bread-resistor" x="-37" y="-11" width="74" height="22" rx="11"/><rect class="bread-band dark" x="-22" y="-11" width="5" height="22"/><rect class="bread-band red" x="-7" y="-11" width="5" height="22"/><rect class="bread-band gold" x="16" y="-11" width="5" height="22"/>';
    if (type === 'capacitor') return '<path class="part-pin" d="M-62 0H-22M22 0H62"/><rect class="bread-cap" x="-22" y="-17" width="44" height="34" rx="5"/><ellipse class="bread-cap-top" cx="0" cy="-17" rx="22" ry="5"/><path class="bread-mark" d="M8 -9v9m-4-4h8"/>';
    if (type === 'inductor') return '<path class="part-pin" d="M-62 0H-35M35 0H62"/><path class="bread-coil" d="M-35 0c0-21 12-21 12 0 0-21 12-21 12 0 0-21 12-21 12 0 0-21 12-21 12 0 0-21 12-21 12 0 0-21 12-21 12 0"/>';
    if (type === 'transformer') return '<path class="part-pin" d="M-55 -22H-38M-55 22H-38M38 -22H55M38 22H55"/><rect class="bread-transformer" x="-38" y="-31" width="76" height="62" rx="7"/><path class="bread-transformer-line" d="M-28 -16h16m-16 11h16m24-11h16m-16 11h16"/>';
    if (type === 'potentiometer') return '<path class="part-pin" d="M-58 0H-25M25 0H58M0 -42V-25"/><circle class="bread-pot" cx="0" cy="0" r="25"/><circle class="bread-pot-shaft" cx="0" cy="0" r="9"/><path class="bread-screen-line" d="M0 -42V-5"/>';
    if (type === 'switch') return '<path class="part-pin" d="M-62 0H-34M34 0H62"/><rect class="bread-switch" x="-34" y="-16" width="68" height="32" rx="6"/><rect class="bread-switch-lever" x="-6" y="-20" width="12" height="21" rx="4"/>';
    if (type === 'bridge') return '<path class="part-pin" d="M-48 0H-27M27 0H48M0 -48V-27M0 27V48"/><rect class="bread-bridge" x="-29" y="-29" width="58" height="58" rx="8"/><path class="bread-bridge-mark" d="M0 -20v12m-6-6h12M-20 0h9m22 0h9M0 8v12"/><text class="bread-bridge-text" x="-14" y="4">~</text><text class="bread-bridge-text" x="14" y="4">~</text>';
    if (type === 'diode' || type === 'zener') return '<path class="part-pin" d="M-62 0H-32M32 0H62"/><rect class="bread-diode" x="-32" y="-9" width="64" height="18" rx="9"/><rect class="bread-band silver" x="16" y="-9" width="4" height="18"/>';
    if (type === 'led') return '<path class="part-pin" d="M-62 0H-19M19 0H62"/><path class="bread-led" d="M-19 8v-11a19 19 0 0 1 38 0V8Z"/><rect class="bread-led-base" x="-20" y="7" width="40" height="8" rx="2"/><path class="bread-led-glint" d="M-7 -11c5-4 9-3 12 0"/>';
    if (type === 'bjt' || type === 'mosfet') return `<path class="part-pin" d="M${type === 'bjt' ? '-41 0H-18M16 -17 33 -27M16 17 33 27' : '-45 0H-17M17 -17 35 -27M17 17 35 27'}"/><path class="bread-transistor" d="M-18 20V-2a18 18 0 0 1 36 0v22Z"/><path class="bread-transistor-line" d="M-9 -9h18M-9 -3h18"/>`;
    if (type === 'timer555' || type === 'opamp') {
      const timer = type === 'timer555';
      return `<rect class="bread-chip" x="${timer ? -49 : -45}" y="-32" width="${timer ? 98 : 90}" height="64" rx="5"/><path class="bread-chip-notch" d="M-10 -32a10 7 0 0 0 20 0"/><path class="part-pin" d="${timer ? 'M-59 -23H-49M-59 5H-49M-59 26H-49M49 -23H59M49 3H59M49 25H59' : 'M-52 -19H-45M-52 19H-45M45 0H50M0 -43V-32M0 32V43'}"/><text class="bread-chip-text" x="0" y="5">${timer ? 'NE555' : 'LM741'}</text>`;
    }
    return '<path class="part-pin" d="M-62 0H62"/>';
  }
  function componentSymbol(component) {
    const type = component.type;
    const p = component.props || {};
    if (state.view === 'breadboard') return breadboardSymbol(component);
    if (type === 'source' || type === 'acsource') {
      const sine = type === 'acsource' || p.waveform === 'Sine';
      const square = p.waveform === 'Square';
      const inner = sine ? '<path class="part-accent" d="M-12 1c4-12 8-12 12 0s8 12 12 0"/>' : square ? '<path class="part-accent" d="M-13 8V-8H0V8H13V-8"/>' : '<path class="part-stroke" d="M-7 -7h14M0-14v14"/><path class="part-stroke" d="M-7 12h14"/>';
      return `<path class="part-pin" d="M0 -47V-25M0 25V47"/><circle class="part-fill" cx="0" cy="0" r="25" fill="url(#sourceFace)"/>${inner}`;
    }
    if (type === 'ground') return '<path class="part-pin" d="M0 -25V-5"/><path class="part-stroke" d="M-21 -4H21M-14 2H14M-7 8H7"/>';
    if (type === 'resistor') return '<path class="part-pin" d="M-62 0H-40M40 0H62"/><polyline class="part-stroke" points="-40,0 -34,-16 -25,16 -16,-16 -7,16 2,-16 11,16 20,-16 29,16 38,-16 40,0"/>';
    if (type === 'capacitor') return '<path class="part-pin" d="M-62 0H-13M13 0H62"/><path class="part-stroke" d="M-13 -22V22M13 -22V22"/>';
    if (type === 'inductor') return '<path class="part-pin" d="M-62 0H-41M41 0H62"/><path class="part-stroke" d="M-41 0c0-21 13-21 13 0 0-21 13-21 13 0 0-21 13-21 13 0 0-21 13-21 13 0 0-21 13-21 13 0 0-21 13-21 13 0"/>';
    if (type === 'transformer') return '<path class="part-pin" d="M-55 -22H-37M-55 22H-37M37 -22H55M37 22H55"/><path class="part-stroke" d="M-37 -22c22 0 22 11 0 11 22 0 22 11 0 11M37 -22c-22 0-22 11 0 11-22 0-22 11 0 11M-5 -31V31M5 -31V31"/>';
    if (type === 'potentiometer') return '<path class="part-pin" d="M-62 0H-40M40 0H62M0 -42V-17"/><polyline class="part-stroke" points="-40,0 -33,-14 -23,14 -13,-14 -3,14 7,-14 17,14 27,-14 37,14 40,0"/><path class="part-accent" d="M0 -35V-6m0-29-7 8m7-8 7 8"/>';
    if (type === 'switch') return '<path class="part-pin" d="M-62 0H-29M29 0H62"/><circle class="part-fill" cx="-27" cy="0" r="3"/><circle class="part-fill" cx="28" cy="0" r="3"/><path class="part-stroke" d="M-25 -2 20 -23"/>';
    if (type === 'bridge') return '<path class="part-pin" d="M-48 0H-30M30 0H48M0 -48V-30M0 30V48"/><path class="part-fill" d="M0 -30 30 0 0 30 -30 0Z"/><path class="part-stroke" d="M0 -21v14m-7-7h14M-21 0h10m22 0h10M0 7v14"/><text class="bridge-ac" x="-15" y="4">~</text><text class="bridge-ac" x="15" y="4">~</text>';
    if (type === 'diode' || type === 'zener' || type === 'led') {
      const zener = type === 'zener' ? '<path class="part-stroke" d="M17 -20v8M17 12v8"/>' : '';
      const arrows = type === 'led' ? '<path class="part-accent" d="M2 -29 10 -37M8 -22l8 -8"/><path class="part-accent" d="m8 -37 2 7m0-7-7 2M14 -30l2 7m0-7-7 2"/>' : '';
      const ledFill = type === 'led' ? ' fill="url(#ledBody)"' : '';
      return `<path class="part-pin" d="M-62 0H-25M22 0H62"/><path class="part-fill"${ledFill} d="M-25 -21 13 0 -25 21Z"/><path class="part-stroke" d="M17 -22V22"/>${zener}${arrows}`;
    }
    if (type === 'bjt') return '<path class="part-pin" d="M-41 0H-17M17 -17 33 -27M17 17 33 27"/><circle class="part-stroke" cx="0" cy="0" r="22"/><path class="part-stroke" d="M-17 0H5M5 -16V16M5 -10 18 -18M5 10 18 18"/><path class="part-accent" d="m12 15 7 3-5-5"/>';
    if (type === 'mosfet') return '<path class="part-pin" d="M-45 0H-15M15 -15 35 -27M15 15 35 27"/><path class="part-stroke" d="M-12 -23V23M0 -23V23M0 0H16M15 -15H0M15 15H0"/><path class="part-accent" d="M5 0h10m-4-4 4 4-4 4"/>';
    if (type === 'timer555') return '<rect class="part-ic" x="-48" y="-34" width="96" height="68" rx="5" filter="url(#chipShadow)"/><path class="part-pin" d="M-59 -23H-48M-59 5H-48M-59 26H-48M48 -23H59M48 3H59M48 25H59"/><path class="part-stroke" d="M-8 -34v8M8 -34v8"/><text class="ic-name" x="0" y="4">555</text><text class="ic-sub" x="0" y="18">TIMER</text>';
    if (type === 'opamp') return '<path class="part-pin" d="M-52 -19H-31M-52 19H-31M26 0H50M0 -43V-25M0 25V43"/><path class="part-ic" d="M-31 -32 -31 32 27 0Z" filter="url(#chipShadow)"/><path class="part-stroke" d="M-20 -18h9m-4-4v8M-20 19h9"/><text class="ic-name" x="-6" y="5">741</text>';
    return '<path class="part-pin" d="M-62 0H62"/>';
  }

  function autoConnectRole(compId, pin) {
    const pointKey = `${compId}:${pin}`;
    if (autoConnectPreview.some(pair => pinKey(pair.from) === pointKey)) return 'auto-connect-source';
    if (autoConnectPreview.some(pair => pinKey(pair.to) === pointKey)) return 'auto-connect-target';
    return '';
  }
  function terminalMarkup(component) {
    const visibleRadius = wireStart ? 6.1 : 4.2;
    return getPins(component).map((pin, index) => `<g class="terminal-group ${autoConnectRole(component.id, index)}" data-terminal-comp="${component.id}" data-terminal-pin="${index}"><circle class="terminal-hit" cx="${pin.dx}" cy="${pin.dy}" r="11"/><circle class="terminal" cx="${pin.dx}" cy="${pin.dy}" r="${visibleRadius}"/><text class="pin-label" x="${pin.dx}" y="${pin.dy - (pin.dy < 0 ? 8 : pin.dy > 0 ? -8 : 10)}">${escapeHTML(pin.label)}</text></g>`).join('');
  }
  function heatForComponent(component) {
    const metric = componentMetric(component.id);
    const normalized = Math.min(1, Math.max(0, metric.power / Math.max(0.05, Number(component.props?.rating) || 0.25)));
    return normalized > 0.55 ? { fill: 'url(#thermalHot)', opacity: Math.max(.3, normalized) } : { fill: 'url(#thermalGreen)', opacity: Math.max(.2, normalized + .25) };
  }
  function renderComponent(component) {
    const bounds = getBounds(component);
    const selected = state.selectedId === component.id;
    const metric = componentMetric(component.id);
    const heat = heatForComponent(component);
    const lessonTarget = isLessonComponentTarget(component);
    const ledLimit = Math.max(.001, Number(component.props.maxCurrent || .02));
    const ledIntensity = component.type === 'led' && state.running ? Math.max(0, Math.min(1, metric.current / ledLimit)) : 0;
    const ledOvercurrent = component.type === 'led' && state.running && metric.current > ledLimit;
    const ledGlow = 4 + ledIntensity * 17;
    const labelY = bounds.y - 10;
    const valueY = bounds.y + bounds.h + 14;
    const thermalSize = Math.max(bounds.w, bounds.h) * 0.88;
    return `<g class="component ${selected ? 'selected' : ''} ${lessonTarget ? 'lesson-target' : ''} ${ledIntensity > .02 ? 'led-lit' : ''} ${ledOvercurrent ? 'led-overcurrent' : ''}" style="--led-intensity:${ledIntensity.toFixed(3)};--led-glow:${ledGlow.toFixed(1)}px" data-comp-id="${component.id}" data-fritzing-asset="${FRITZING_PARTS[component.type] || ''}" transform="translate(${component.x} ${component.y}) rotate(${component.rotation || 0})">
      <circle class="thermal-halo" cx="0" cy="0" r="${thermalSize}" fill="${heat.fill}" opacity="${heat.opacity}"/>
      <rect class="component-hitbox" x="${bounds.x - 9}" y="${bounds.y - 9}" width="${bounds.w + 18}" height="${bounds.h + 18}" rx="10"/>
      <rect class="selection-box" x="${bounds.x - 6}" y="${bounds.y - 6}" width="${bounds.w + 12}" height="${bounds.h + 12}" rx="8"/>
      ${componentSymbol(component)}
      ${terminalMarkup(component)}
      <text class="part-label" x="0" y="${labelY}">${escapeHTML(component.label)}</text>
      <text class="part-value" x="0" y="${valueY}">${escapeHTML(primaryValue(component))}${state.heatmap && metric.power > 0.001 ? ` · ${formatPower(metric.power)}` : ''}</text>
    </g>`;
  }

  function laneValue(index) {
    if (index === 0) return 0;
    const magnitude = Math.ceil(index / 2);
    return index % 2 ? magnitude : -magnitude;
  }
  function getWireRouteLanes() {
    const groups = new Map();
    state.wires.forEach(wire => {
      const from = getTerminalFromPoint(wire.from);
      const to = getTerminalFromPoint(wire.to);
      if (!from || !to) return;
      const middleX = (from.x + to.x) / 2;
      const middleY = (from.y + to.y) / 2;
      const key = `${Math.round(middleX / 170)}:${Math.round(middleY / 170)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(wire);
    });
    const lanes = new Map();
    groups.forEach(group => {
      group.sort((a, b) => a.id.localeCompare(b.id));
      group.forEach((wire, index) => lanes.set(wire.id, group.length > 1 ? laneValue(index) : 0));
    });
    return lanes;
  }
  function routedWirePath(from, to, lane = 0) {
    if (!from || !to) return '';
    const dx = Math.abs(to.x - from.x), dy = Math.abs(to.y - from.y);
    const laneOffset = lane * 20;
    if (dy < 20) {
      if (!lane) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      // Use the average endpoint position so the route is identical when the flow path is reversed.
      const routeY = Math.round((((from.y + to.y) / 2 + laneOffset) / 10)) * 10;
      return `M ${from.x} ${from.y} V ${routeY} H ${to.x} V ${to.y}`;
    }
    if (dx < 25) {
      if (!lane) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      // Same symmetry rule for near-vertical connections.
      const routeX = Math.round((((from.x + to.x) / 2 + laneOffset) / 10)) * 10;
      return `M ${from.x} ${from.y} H ${routeX} V ${to.y} H ${to.x}`;
    }
    const middle = Math.round(((from.x + to.x) / 2 + laneOffset) / 20) * 20;
    return `M ${from.x} ${from.y} H ${middle} V ${to.y} H ${to.x}`;
  }
  function wirePath(wire, reverse = false, lane = 0) {
    const from = getTerminalFromPoint(reverse ? wire.to : wire.from);
    const to = getTerminalFromPoint(reverse ? wire.from : wire.to);
    return routedWirePath(from, to, lane);
  }
  function wireClass(wire) {
    const classes = ['wire'];
    const isActive = state.running && simulation?.activeWireIds?.has(wire.id);
    const isPartial = state.running && simulation?.partialWireIds?.has(wire.id);
    if (isActive && simulation?.shortCircuit) classes.push('warn');
    else if (isActive) classes.push('active');
    else if (isPartial) classes.push('partial');
    if (state.selectedWireId === wire.id) classes.push('selected');
    return classes.join(' ');
  }
  function renderWires() {
    const endpointCounts = new Map();
    const lanes = getWireRouteLanes();
    state.wires.forEach(wire => [wire.from, wire.to].forEach(point => endpointCounts.set(pinKey(point), (endpointCounts.get(pinKey(point)) || 0) + 1)));
    const paths = state.wires.map(wire => {
      const lane = lanes.get(wire.id) || 0;
      const path = wirePath(wire, false, lane);
      const isActive = state.running && simulation?.activeWireIds?.has(wire.id);
      const isPartial = state.running && simulation?.partialWireIds?.has(wire.id);
      const direction = isActive ? simulation?.wireDirections?.[wire.id] : simulation?.partialWireDirections?.[wire.id];
      const flow = isActive || isPartial ? `<path class="wire-flow ${isPartial ? 'partial' : ''}" marker-end="url(#flowArrow)" d="${wirePath(wire, direction === 'reverse', lane)}"/>` : '';
      return `<path class="wire-hit" data-wire-id="${wire.id}" d="${path}"/><path class="${wireClass(wire)}" data-wire-id="${wire.id}" d="${path}"/>${flow}`;
    }).join('');
    const junctions = [...endpointCounts.entries()].filter(([, count]) => count > 1).map(([key]) => {
      const [compId, pin] = key.split(':');
      const point = getTerminalFromPoint({ compId, pin: Number(pin) });
      return point ? `<circle class="junction" cx="${point.x}" cy="${point.y}" r="4"/>` : '';
    }).join('');
    return paths + junctions;
  }
  function activeWireEndpoints(wire, sim) {
    const reverse = sim.wireDirections?.[wire.id] === 'reverse';
    return { from: reverse ? wire.to : wire.from, to: reverse ? wire.from : wire.to };
  }
  function voltageLabelPosition(wire, sim, lane = 0) {
    const { from, to } = activeWireEndpoints(wire, sim);
    const start = getTerminalFromPoint(from);
    const end = getTerminalFromPoint(to);
    if (!start || !end) return null;
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const laneOffset = lane * 20;
    let x;
    let y;
    let vertical = false;
    if (dy < 20) {
      x = (start.x + end.x) / 2;
      y = lane ? Math.round((((start.y + end.y) / 2 + laneOffset) / 10)) * 10 : (start.y + end.y) / 2;
    } else if (dx < 25) {
      x = lane ? Math.round((((start.x + end.x) / 2 + laneOffset) / 10)) * 10 : (start.x + end.x) / 2;
      y = (start.y + end.y) / 2;
      vertical = true;
    } else {
      const middle = Math.round(((start.x + end.x) / 2 + laneOffset) / 20) * 20;
      if (Math.abs(middle - start.x) > 18) {
        x = (start.x + middle) / 2;
        y = start.y;
      } else {
        x = middle;
        y = (start.y + end.y) / 2;
        vertical = true;
      }
    }
    return vertical ? { x: x + 12, y: y + 3, anchor: 'start' } : { x, y: y - 11, anchor: 'middle' };
  }
  function renderVoltageLabels() {
    const sim = simulation;
    if (!state.running || !sim?.hasActivePath) return '';
    const lanes = getWireRouteLanes();
    const labels = [];
    state.components.forEach(component => {
      if (component.type === 'ground' || !sim.activeComponentIds?.has(component.id)) return;
      const wire = state.wires.find(candidate => {
        if (!sim.activeWireIds?.has(candidate.id)) return false;
        const flow = activeWireEndpoints(candidate, sim);
        return flow.from.compId === component.id;
      });
      if (!wire) return;
      const flow = activeWireEndpoints(wire, sim);
      const voltage = sim.nodeVoltages?.get(`${flow.from.compId}:${flow.from.pin}`);
      const position = voltageLabelPosition(wire, sim, lanes.get(wire.id) || 0);
      if (!Number.isFinite(voltage) || !position) return;
      labels.push(`<text class="wire-voltage-label" x="${position.x}" y="${position.y}" text-anchor="${position.anchor}">${escapeHTML(formatVoltage(voltage))}</text>`);
    });
    return labels.join('');
  }
  function renderOpenPathMarkers() {
    const sim = simulation;
    if (!state.running || !sim?.partialOpenNodeIds?.size) return '';
    let labeled = false;
    return [...sim.partialOpenNodeIds].map(nodeId => {
      const [compId, pin] = nodeId.split(':');
      const point = getTerminalFromPoint({ compId, pin: Number(pin) });
      if (!point) return '';
      const label = !labeled ? `<text class="open-path-label" x="${point.x + 11}" y="${point.y - 12}">Open path</text>` : '';
      labeled = true;
      return `<circle class="open-path-marker" cx="${point.x}" cy="${point.y}" r="8"/>${label}`;
    }).join('');
  }
  function renderAnnotations() {
    const voltageLabels = renderVoltageLabels();
    const openPathMarkers = renderOpenPathMarkers();
    const autoConnectLines = autoConnectPreview.map(pair => {
      const from = getTerminalFromPoint(pair.from);
      const to = getTerminalFromPoint(pair.to);
      return from && to ? `<path class="auto-connect-preview" d="M ${from.x} ${from.y} L ${to.x} ${to.y}"/>` : '';
    }).join('');
    const markers = state.probeTerminals.map((point, index) => {
      const pos = getTerminalFromPoint(point);
      return pos ? `<circle class="probe-marker" cx="${pos.x}" cy="${pos.y}" r="10" fill="none" stroke="${index === 0 ? '#62e4d0' : '#a897ff'}" stroke-width="1.7"/><text x="${pos.x + 11}" y="${pos.y - 10}" fill="${index === 0 ? '#72ead7' : '#b5a9ff'}" font-size="9" font-weight="700">${index === 0 ? 'A' : 'B'}</text>` : '';
    }).join('');
    let preview = '';
    if (wireStart && wirePointer) {
      const origin = getTerminalFromPoint(wireStart);
      if (origin) preview = `<path class="wire-preview" d="M ${origin.x} ${origin.y} L ${wirePointer.x} ${wirePointer.y}"/>`;
    }
    let statusTag = '';
    if (state.running && simulation?.source) {
      const src = simulation.source;
      statusTag = `<g transform="translate(${src.x + 43} ${src.y - 22})"><rect width="73" height="19" rx="4" fill="#153448" stroke="#357e78"/><text x="8" y="13" fill="#a6f7e9" font-size="9" font-weight="700">${formatCurrent(simulation.sourceCurrents?.[src.id] ?? simulation.current)}</text></g>`;
    }
    return voltageLabels + openPathMarkers + autoConnectLines + preview + markers + statusTag;
  }
  function quickActionIcon(action) {
    const icons = {
      rotate: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.2-5.5M4 4v5h5"/></svg>',
      duplicate: '<svg viewBox="0 0 24 24"><rect x="8" y="4" width="11" height="12" rx="2"/><path d="M5 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"/></svg>',
      rewire: '<svg viewBox="0 0 24 24"><circle cx="5" cy="7" r="1.8"/><circle cx="19" cy="17" r="1.8"/><path d="M6.5 8.2c4 0 4.3 7.6 10.7 7.6M11 6l3-3m0 0 3 3m-3-3v7"/></svg>',
      delete: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M9 4h6l1 3H8zM6.5 7l.8 13h9.4l.8-13"/></svg>'
    };
    return icons[action] || '';
  }
  function quickActionButton(action, label, danger = false) {
    return `<button class="selection-action-button ${danger ? 'danger' : ''}" data-quick-action="${action}" title="${label}" aria-label="${label}">${quickActionIcon(action)}</button>`;
  }
  function selectedItemAnchor() {
    const component = getComponent(state.selectedId);
    if (component) {
      const bounds = getBounds(component);
      return { x: component.x, y: component.y + bounds.y - 8 };
    }
    const wire = getWire(state.selectedWireId);
    if (wire) {
      const from = getTerminalFromPoint(wire.from);
      const to = getTerminalFromPoint(wire.to);
      if (from && to) return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    }
    return null;
  }
  function componentOverlayBounds(component) {
    const bounds = getBounds(component);
    const corners = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.w, y: bounds.y },
      { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
      { x: bounds.x, y: bounds.y + bounds.h }
    ].map(corner => {
      const rotated = rotatePoint(corner.x, corner.y, component.rotation || 0);
      return svgPointToCanvasOverlay({ x: component.x + rotated.x, y: component.y + rotated.y });
    });
    if (corners.some(point => !point)) return null;
    return {
      left: Math.min(...corners.map(point => point.x)),
      right: Math.max(...corners.map(point => point.x)),
      top: Math.min(...corners.map(point => point.y)),
      bottom: Math.max(...corners.map(point => point.y))
    };
  }
  function svgPointToCanvasOverlay(point) {
    try {
      const ctm = dom.canvas.getScreenCTM?.();
      if (!ctm) return null;
      const svgPoint = dom.canvas.createSVGPoint();
      svgPoint.x = point.x;
      svgPoint.y = point.y;
      const screen = svgPoint.matrixTransform(ctm);
      const wrap = dom.canvasWrap.getBoundingClientRect();
      return { x: screen.x - wrap.left, y: screen.y - wrap.top };
    } catch (_) { return null; }
  }
  function renderSelectionQuickActions() {
    const toolbar = dom.selectionQuickActions;
    if (!toolbar) return;
    const component = getComponent(state.selectedId);
    const wire = getWire(state.selectedWireId);
    if (!component && !wire) {
      toolbar.classList.add('hidden');
      toolbar.innerHTML = '';
      return;
    }
    const label = component ? component.label : 'Wire';
    const actions = component
      ? `${quickActionButton('rotate', 'Rotate 90 degrees')}${quickActionButton('duplicate', 'Duplicate part')}${quickActionButton('delete', 'Delete part', true)}`
      : `${quickActionButton('rewire', 'Reconnect wire')}${quickActionButton('delete', 'Remove wire', true)}`;
    toolbar.innerHTML = `<span class="selection-action-label">${escapeHTML(label)}</span>${actions}`;
    toolbar.classList.remove('hidden');
    const wrap = dom.canvasWrap.getBoundingClientRect();
    const toolbarHeight = Math.max(36, toolbar.offsetHeight);
    const halfWidth = Math.max(75, toolbar.offsetWidth / 2);
    let anchorX = 0;
    let top = 0;
    let below = false;
    if (component) {
      const bounds = componentOverlayBounds(component);
      if (!bounds) { toolbar.classList.add('hidden'); return; }
      anchorX = (bounds.left + bounds.right) / 2;
      const aboveAnchor = bounds.top - 25;
      const belowAnchor = bounds.bottom + 27;
      const fitsAbove = aboveAnchor - toolbarHeight >= 8;
      const fitsBelow = belowAnchor + toolbarHeight <= wrap.height - 8;
      below = !fitsAbove && fitsBelow;
      top = below ? belowAnchor : Math.max(toolbarHeight + 8, aboveAnchor);
    } else {
      const anchor = selectedItemAnchor();
      const point = anchor && svgPointToCanvasOverlay(anchor);
      if (!point) { toolbar.classList.add('hidden'); return; }
      anchorX = point.x;
      const fitsAbove = point.y - 14 - toolbarHeight >= 8;
      const fitsBelow = point.y + 14 + toolbarHeight <= wrap.height - 8;
      below = !fitsAbove && fitsBelow;
      top = below ? point.y + 14 : Math.max(toolbarHeight + 8, point.y - 14);
    }
    const x = Math.max(halfWidth + 8, Math.min(wrap.width - halfWidth - 8, anchorX));
    toolbar.classList.toggle('below', below);
    toolbar.style.left = `${x}px`;
    toolbar.style.top = `${top}px`;
  }
  function quickMeasureNodeVoltage(target, sim) {
    const component = getComponent(target.compId);
    if (!component) return null;
    if (component.type === 'ground') return 0;
    if (component.id === sim.source?.id) return target.pin === 0 ? sim.sourceVoltage : 0;
    const value = sim.nodeVoltages?.get(`${target.compId}:${target.pin}`);
    return Number.isFinite(value) ? value : null;
  }
  function quickMeasureRow(label, value, subtle = '') {
    return `<div class="quick-measure-row"><span>${escapeHTML(label)}</span><b>${escapeHTML(value)}</b>${subtle ? `<small>${escapeHTML(subtle)}</small>` : ''}</div>`;
  }
  function renderQuickMeasurePanel() {
    const panel = dom.quickMeasurePanel;
    if (!panel) return;
    if (!state.quickMeasureVisible) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');
    const sim = simulation || calculateSimulation();
    let content = '';
    let hasTarget = false;
    if (quickMeasureTarget?.kind === 'terminal') {
      const component = getComponent(quickMeasureTarget.compId);
      const pin = component && getPins(component)[quickMeasureTarget.pin];
      if (component && pin) {
        hasTarget = true;
        const voltage = quickMeasureNodeVoltage(quickMeasureTarget, sim);
        const connected = sim.hasActivePath && sim.topology.reachableFromPositive.has(`${component.id}:${quickMeasureTarget.pin}`);
        content = `<div class="quick-measure-kicker">Node readout</div><h4>${escapeHTML(component.label)} · ${escapeHTML(pin.label)}</h4><div class="quick-measure-value">${voltage === null ? '—' : formatVoltage(voltage)}</div><p>${voltage === null ? 'No estimated voltage is available because this node is outside a complete conducting path.' : connected ? 'Estimated relative to GND on the active path.' : 'Reference measurement relative to GND.'}</p>${quickMeasureRow('Reference', 'GND')}`;
      }
    } else if (quickMeasureTarget?.kind === 'wire') {
      const wire = getWire(quickMeasureTarget.wireId);
      if (wire) {
        hasTarget = true;
        const active = sim.activeWireIds?.has(wire.id);
        const reversed = sim.wireDirections?.[wire.id] === 'reverse';
        const start = reversed ? wire.to : wire.from;
        const end = reversed ? wire.from : wire.to;
        content = `<div class="quick-measure-kicker">Branch readout</div><h4>Wire current</h4><div class="quick-measure-value">${active ? formatCurrent(sim.wireCurrents?.[wire.id] ?? sim.current) : '0 A'}</div><p>${active ? `${escapeHTML(terminalDescription(start))} → ${escapeHTML(terminalDescription(end))}` : 'This wire is not on a complete conducting path.'}</p>${quickMeasureRow('Direction', active ? 'Active path' : 'No current')}`;
      }
    } else if (quickMeasureTarget?.kind === 'component') {
      const component = getComponent(quickMeasureTarget.compId);
      if (component) {
        hasTarget = true;
        const metric = sim.metrics?.[component.id] || { voltage: 0, current: 0, power: 0 };
        const active = sim.activeComponentIds?.has(component.id);
        content = `<div class="quick-measure-kicker">Component readout</div><h4>${escapeHTML(component.label)} · ${escapeHTML(partData(component.type).title)}</h4><div class="quick-measure-grid">${quickMeasureRow('Voltage drop', active ? formatVoltage(metric.voltage) : '—')}${quickMeasureRow('Current', active ? formatCurrent(metric.current) : '0 A')}${quickMeasureRow('Power', active ? formatPower(metric.power) : '0 W')}</div><p>${active ? 'Estimated values for this component on the active path.' : 'This component is outside the current conducting path.'}</p>`;
      }
    }
    if (!hasTarget) {
      content = `<div class="quick-measure-kicker">Circuit overview</div><h4>Quick Measure</h4><div class="quick-measure-grid">${quickMeasureRow('Parts', String(state.components.length))}${quickMeasureRow('Wires', String(state.wires.length))}${quickMeasureRow('Input', sim.source ? formatVoltage(sim.sourceVoltage) : '—')}${quickMeasureRow('Active current', sim.hasActivePath ? formatCurrent(sim.totalCurrent ?? sim.current) : '—')}</div><p>${sim.hasActivePath ? 'Click a node, wire or component to inspect it.' : sim.partialWireIds?.size ? 'An amber path preview shows where the circuit reaches an open connection.' : 'Run or complete a circuit, then click a node, wire or component to inspect it.'}</p>`;
    }
    panel.innerHTML = `<div class="quick-measure-head"><span><i>⌁</i>Quick Measure</span>${hasTarget ? '<button data-quick-measure-action="clear" title="Clear readout" aria-label="Clear readout">×</button>' : ''}</div>${content}`;
  }
  function setQuickMeasureTarget(target) {
    quickMeasureTarget = target;
    renderQuickMeasurePanel();
  }
  function renderBreadboardBackground() {
    if (state.view !== 'breadboard' || !state.breadboardTexture) return '';
    return `<rect x="-2000" y="-2000" width="6000" height="6000" fill="#d8d1bd"/>
      <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#boardLines)" opacity=".82"/>
      <rect x="-2000" y="74" width="6000" height="8" rx="4" fill="#cf635e" opacity=".85"/><rect x="-2000" y="94" width="6000" height="5" rx="2" fill="#527fae" opacity=".85"/>
      <rect x="-2000" y="596" width="6000" height="8" rx="4" fill="#cf635e" opacity=".85"/><rect x="-2000" y="616" width="6000" height="5" rx="2" fill="#527fae" opacity=".85"/>
      <rect x="-2000" y="330" width="6000" height="20" fill="#b9b19e" opacity=".75"/>`;
  }

  function conductiveTopology(source) {
    const edges = new Map();
    const wireById = new Map(state.wires.map(wire => [wire.id, wire]));
    const key = (compId, pin) => `${compId}:${pin}`;
    const addEdge = (from, to, meta) => {
      if (!edges.has(from)) edges.set(from, []);
      edges.get(from).push({ from, to, ...meta });
    };
    const addBidirectional = (from, to, meta) => {
      addEdge(from, to, meta);
      addEdge(to, from, meta);
    };
    const node = (component, pin) => key(component.id, pin);
    const addComponentEdge = (component, fromPin, toPin, bidirectional = false, extraMeta = {}) => {
      const meta = { kind: 'component', componentId: component.id, fromPin, toPin, ...extraMeta };
      addEdge(node(component, fromPin), node(component, toPin), meta);
      if (bidirectional) addEdge(node(component, toPin), node(component, fromPin), { kind: 'component', componentId: component.id, fromPin: toPin, toPin: fromPin, ...extraMeta });
    };

    state.wires.forEach(wire => {
      const from = key(wire.from.compId, wire.from.pin);
      const to = key(wire.to.compId, wire.to.pin);
      addBidirectional(from, to, { kind: 'wire', wireId: wire.id });
    });
    const hasExternalPin = (component, pinIndex) => state.wires.some(wire => (wire.from.compId === component.id && wire.from.pin === pinIndex) || (wire.to.compId === component.id && wire.to.pin === pinIndex));
    state.components.forEach(component => {
      const pins = getPins(component);
      if (pins.length < 2 || component.id === source?.id) return;
      if (['resistor', 'inductor'].includes(component.type)) addComponentEdge(component, 0, 1, true);
      // Capacitors are not treated as a continuous DC conduction path. Their transient AC/charging behavior needs a dedicated solver.
      else if (component.type === 'potentiometer') {
        // Wiper position (0-100%, terminal "1" side) splits the track into two resistive segments.
        // Both the current solve (totalResistance) and the displayed drop (pathDrop) must agree on
        // these segment values, so the ratio is computed once here and carried on the edge itself.
        const fullResistance = Math.max(0, parseNumber(component.props?.resistance ?? component.props?.value, 0));
        const wiperRatio = Math.min(1, Math.max(0, parseNumber(component.props?.position ?? 50, 50) / 100));
        addComponentEdge(component, 0, 2, true, { segmentResistance: fullResistance * wiperRatio });
        addComponentEdge(component, 2, 1, true, { segmentResistance: fullResistance * (1 - wiperRatio) });
      }
      else if (component.type === 'switch' && component.props?.position === 'Closed') addComponentEdge(component, 0, 1, true);
      else if (['diode', 'led'].includes(component.type)) addComponentEdge(component, 0, 1);
      // Zener diodes are normally used reverse-biased (cathode toward the positive rail) so that the
      // breakdown voltage regulates the node. Model both the rare forward direction (0->1, like a normal
      // diode) and the standard reverse-breakdown direction (1->0) so typical regulator wiring is detected.
      else if (component.type === 'zener') { addComponentEdge(component, 0, 1, false, { zenerConduction: 'forward' }); addComponentEdge(component, 1, 0, false, { zenerConduction: 'reverse' }); }
      else if (component.type === 'bridge') {
        addComponentEdge(component, 0, 2);
        addComponentEdge(component, 1, 2);
        addComponentEdge(component, 3, 0);
        addComponentEdge(component, 3, 1);
      } else if (component.type === 'bjt' && hasExternalPin(component, 0)) {
        // NPN conducts collector->emitter (pin1->pin2); PNP conducts the opposite way, emitter->collector.
        if ((component.props?.polarity || 'NPN') === 'PNP') addComponentEdge(component, 2, 1);
        else addComponentEdge(component, 1, 2);
      } else if (component.type === 'mosfet' && hasExternalPin(component, 0)) {
        // N-channel conducts drain->source (pin1->pin2); P-channel conducts source->drain.
        if ((component.props?.channel || 'N-channel') === 'P-channel') addComponentEdge(component, 2, 1);
        else addComponentEdge(component, 1, 2);
      }
    });

    const grounds = state.components.filter(component => component.type === 'ground');
    for (let index = 1; index < grounds.length; index++) addBidirectional(node(grounds[0], 0), node(grounds[index], 0), { kind: 'ground' });
    if (!source) return { hasActivePath: false, pathEdges: [], activeWireIds: new Set(), wireDirections: {}, activeComponentIds: new Set(), nodePath: [], partialWireIds: new Set(), partialWireDirections: {}, partialComponentIds: new Set(), openNodeIds: new Set() };

    const start = node(source, 0);
    const target = node(source, 1);
    const queue = [start];
    const visited = new Set([start]);
    const parents = new Map();
    while (queue.length && !visited.has(target)) {
      const current = queue.shift();
      (edges.get(current) || []).forEach(edge => {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          parents.set(edge.to, { previous: current, edge });
          queue.push(edge.to);
        }
      });
    }
    if (!visited.has(target)) {
      const partialWireIds = new Set();
      const partialWireDirections = {};
      const partialComponentIds = new Set([source.id]);
      const childCounts = new Map();
      parents.forEach(({ previous, edge }) => {
        childCounts.set(previous, (childCounts.get(previous) || 0) + 1);
        const [fromComp] = edge.from.split(':');
        const [toComp] = edge.to.split(':');
        partialComponentIds.add(fromComp);
        partialComponentIds.add(toComp);
        if (edge.kind === 'component') partialComponentIds.add(edge.componentId);
        if (edge.kind === 'wire') {
          const wire = wireById.get(edge.wireId);
          if (!wire) return;
          partialWireIds.add(edge.wireId);
          partialWireDirections[edge.wireId] = edge.from === key(wire.from.compId, wire.from.pin) ? 'forward' : 'reverse';
        }
      });
      const openNodeIds = new Set([...visited].filter(nodeId => nodeId !== start && !childCounts.has(nodeId)));
      return { hasActivePath: false, pathEdges: [], activeWireIds: new Set(), wireDirections: {}, activeComponentIds: new Set(), nodePath: [], partialWireIds, partialWireDirections, partialComponentIds, openNodeIds };
    }

    const pathEdges = [];
    const nodePath = [target];
    let current = target;
    while (current !== start) {
      const parent = parents.get(current);
      if (!parent) break;
      pathEdges.unshift(parent.edge);
      current = parent.previous;
      nodePath.unshift(current);
    }
    const activeWireIds = new Set();
    const wireDirections = {};
    const activeComponentIds = new Set([source.id]);
    pathEdges.forEach(edge => {
      const [fromComp] = edge.from.split(':');
      const [toComp] = edge.to.split(':');
      activeComponentIds.add(fromComp);
      activeComponentIds.add(toComp);
      if (edge.kind === 'wire') {
        const wire = wireById.get(edge.wireId);
        if (!wire) return;
        activeWireIds.add(edge.wireId);
        wireDirections[edge.wireId] = edge.from === key(wire.from.compId, wire.from.pin) ? 'forward' : 'reverse';
      }
      if (edge.kind === 'component') activeComponentIds.add(edge.componentId);
    });
    return { hasActivePath: true, pathEdges, activeWireIds, wireDirections, activeComponentIds, nodePath, partialWireIds: new Set(), partialWireDirections: {}, partialComponentIds: new Set(), openNodeIds: new Set() };
  }
  function calculateSimulation() {
    const components = state.components;
    const componentsById = new Map(components.map(component => [component.id, component]));
    const sources = components.filter(component => component.type === 'source' || component.type === 'acsource');
    const metrics = Object.fromEntries(components.map(component => [component.id, { voltage: 0, current: 0, power: 0, temp: 25 }]));
    const activeWireIds = new Set();
    const wireDirections = {};
    const wireCurrents = {};
    const partialWireIds = new Set();
    const partialWireDirections = {};
    const partialOpenNodeIds = new Set();
    const activeComponentIds = new Set();
    const ledVoltages = new Map();
    const nodeVoltages = new Map();
    const sourceCurrents = {};
    const pathResults = [];

    const addMetric = (componentId, voltage, current, power) => {
      const metric = metrics[componentId];
      if (!metric) return;
      metric.voltage = Math.max(metric.voltage, Math.abs(voltage));
      metric.current += Math.abs(current);
      metric.power += Math.abs(power);
    };
    // Resistance contributed by a single path edge. Defined per-edge (not per-component) so a
    // potentiometer that only conducts through one wiper segment contributes just that segment's
    // resistance — the same value used both to solve for current and to display the voltage drop.
    const edgeResistance = (edge) => {
      const component = componentsById.get(edge.componentId);
      if (!component) return 0;
      if (component.type === 'resistor') return Math.max(0, parseNumber(component.props?.resistance ?? component.props?.value, 0));
      if (component.type === 'potentiometer') {
        if (Number.isFinite(edge.segmentResistance)) return Math.max(0, edge.segmentResistance);
        return Math.max(0, parseNumber(component.props?.resistance ?? component.props?.value, 0)) / 2;
      }
      return 0;
    };
    const pathDrop = (edge, path) => {
      if (edge.kind !== 'component') return 0;
      const component = componentsById.get(edge.componentId);
      if (!component) return 0;
      if (component.type === 'resistor' || component.type === 'potentiometer') return path.current * edgeResistance(edge);
      if (component.type === 'diode') return Number(component.props?.forwardVoltage || .7);
      if (component.type === 'led') return path.ledVoltages.get(component.id) || 0;
      if (component.type === 'zener') return Number(component.props?.zenerVoltage || 5.1);
      if (component.type === 'bridge') return edge.toPin === 2 ? Number(component.props?.forwardVoltage || 1.4) : 0;
      if (component.type === 'bjt' || component.type === 'mosfet') return .2;
      return 0;
    };

    sources.forEach(source => {
      const topology = conductiveTopology(source);
      const sourceVoltage = parseNumber(source.props?.voltage ?? source.props?.value, 0);
      if (!topology.hasActivePath) {
        metrics[source.id].voltage = sourceVoltage;
        topology.partialWireIds.forEach(id => partialWireIds.add(id));
        Object.assign(partialWireDirections, topology.partialWireDirections);
        topology.openNodeIds.forEach(id => partialOpenNodeIds.add(id));
        return;
      }
      const pathComponentIds = new Set(topology.pathEdges.filter(edge => edge.kind === 'component').map(edge => edge.componentId));
      const pathComponents = [...pathComponentIds].map(id => componentsById.get(id)).filter(Boolean);
      const resistiveEdges = topology.pathEdges.filter(edge => edge.kind === 'component' && ['resistor', 'potentiometer'].includes(componentsById.get(edge.componentId)?.type));
      const totalResistance = resistiveEdges.reduce((sum, edge) => sum + edgeResistance(edge), 0);
      const leds = pathComponents.filter(component => component.type === 'led');
      const fixedDropComponents = pathComponents.filter(component => ['diode', 'bridge', 'zener'].includes(component.type));
      const fixedDrop = fixedDropComponents.reduce((sum, component) => {
        if (component.type === 'zener') return sum + Number(component.props?.zenerVoltage || 5.1);
        if (component.type === 'bridge') return sum + Number(component.props?.forwardVoltage || 1.4);
        return sum + Number(component.props?.forwardVoltage || .7);
      }, 0);
      const noResistance = totalResistance < .5;
      let current = 0;
      if (totalResistance > 0) current = solveSeriesLedCurrent(sourceVoltage, totalResistance, fixedDrop, leds);
      if (noResistance) current = Math.min(2, sourceVoltage * 2.5);
      const pathLedVoltages = new Map(leds.map(component => [component.id, ledForwardVoltageAtCurrent(component, current)]));
      const forwardDrop = fixedDrop + [...pathLedVoltages.values()].reduce((sum, voltage) => sum + voltage, 0);
      const path = { source, topology, current, sourceVoltage, totalResistance, fixedDrop, forwardDrop, ledVoltages: pathLedVoltages, noResistance };
      pathResults.push(path);
      sourceCurrents[source.id] = current;
      pathLedVoltages.forEach((voltage, id) => ledVoltages.set(id, voltage));
      topology.activeComponentIds.forEach(id => activeComponentIds.add(id));
      topology.pathEdges.forEach(edge => {
        if (edge.kind === 'wire') {
          activeWireIds.add(edge.wireId);
          wireDirections[edge.wireId] = edge.from === `${state.wires.find(wire => wire.id === edge.wireId).from.compId}:${state.wires.find(wire => wire.id === edge.wireId).from.pin}` ? 'forward' : 'reverse';
          wireCurrents[edge.wireId] = (wireCurrents[edge.wireId] || 0) + current;
        }
      });

      let voltageAtNode = sourceVoltage;
      nodeVoltages.set(`${source.id}:0`, sourceVoltage);
      addMetric(source.id, sourceVoltage, current, sourceVoltage * current);
      const groundSeen = new Set();
      topology.pathEdges.forEach(edge => {
        const drop = pathDrop(edge, path);
        voltageAtNode -= drop;
        nodeVoltages.set(edge.to, voltageAtNode);
        if (edge.kind === 'component') addMetric(edge.componentId, drop, current, drop * current);
        const [fromComponentId] = edge.from.split(':');
        const [toComponentId] = edge.to.split(':');
        [fromComponentId, toComponentId].forEach(componentId => {
          const component = componentsById.get(componentId);
          if (component?.type === 'ground' && !groundSeen.has(componentId)) {
            addMetric(componentId, 0, current, 0);
            groundSeen.add(componentId);
          }
        });
      });
      nodeVoltages.set(`${source.id}:1`, 0);
    });

    components.filter(component => component.type === 'ground').forEach(component => nodeVoltages.set(`${component.id}:0`, 0));
    Object.values(metrics).forEach(metric => { metric.temp = 25 + Math.min(65, metric.power * 245); });
    const primary = pathResults[0] || null;
    const source = sources[0] || null;
    const sourceVoltage = primary?.sourceVoltage ?? (source ? parseNumber(source.props?.voltage ?? source.props?.value, 0) : 0);
    const hasGround = components.some(component => component.type === 'ground');
    const totalCurrent = pathResults.reduce((sum, path) => sum + path.current, 0);
    return {
      source,
      sources,
      sourceVoltage,
      totalResistance: primary?.totalResistance || 0,
      forwardDrop: primary?.forwardDrop || 0,
      current: primary?.current || 0,
      totalCurrent,
      sourceCurrents,
      metrics,
      outputVoltage: primary?.forwardDrop || 0,
      hasGround,
      enoughWiring: pathResults.length > 0,
      shortCircuit: pathResults.some(path => path.noResistance),
      hasActivePath: pathResults.length > 0,
      activeWireIds,
      wireDirections,
      wireCurrents,
      partialWireIds,
      partialWireDirections,
      partialOpenNodeIds,
      activeComponentIds,
      ledVoltages,
      nodeVoltages,
      topology: primary?.topology || null,
      paths: pathResults
    };
  }
  function analyzeCircuit() {
    const sim = simulation || calculateSimulation();
    const issues = [];
    let health = 100;
    if (!sim.source) { issues.push({ type: 'error', title: 'Your circuit needs power', text: 'Add a DC or AC source so the circuit has something to drive it.' }); health -= 50; }
    if (!sim.hasGround) { issues.push({ type: 'error', title: 'Add a ground reference', text: 'Place GND and connect it to the return side of your circuit so voltages have a shared reference.' }); health -= 30; }
    if (state.wires.length < Math.max(2, state.components.length - 1)) { issues.push({ type: 'info', title: 'Keep wiring the circuit', text: 'Connect the remaining terminals to complete a path from the source through the load and back to ground.' }); health -= 8; }
    if (sim.source && sim.hasGround && state.wires.length >= Math.max(2, state.components.length - 1) && !sim.hasActivePath) { issues.push({ type: 'warn', title: 'No complete conducting path yet', text: 'Fluxa cannot find a path from source positive back to source negative. Check open switches, diode direction and disconnected wires.' }); health -= 18; }
    const inactiveSources = (sim.sources || []).filter(sourceItem => !(sim.paths || []).some(path => path.source.id === sourceItem.id));
    if (inactiveSources.length) { issues.push({ type: 'warn', title: 'One or more sources have no complete path', text: `${inactiveSources.map(sourceItem => sourceItem.label).join(', ')} is not connected through a complete conducting loop yet.` }); health -= 12; }
    if (sim.shortCircuit) { issues.push({ type: 'error', title: 'This may be a short circuit', text: 'Power is reaching the loop without enough resistance. Add a resistor before running the circuit again.' }); health -= 55; }
    state.components.filter(c => c.type === 'resistor').forEach(component => {
      const metric = componentMetric(component.id);
      const rating = Number(component.props.rating || .25);
      if (metric.power > rating) { issues.push({ type: 'warn', title: `${component.label} may get too hot`, text: `Too much current is passing through it: about ${formatPower(metric.power)} for a ${rating} W part. Try increasing the resistance or using a higher-wattage resistor.` }); health -= 22; }
    });
    state.components.filter(c => c.type === 'led').forEach(component => {
      const metric = componentMetric(component.id);
      const max = Number(component.props.maxCurrent || .02);
      if (metric.current > max) { issues.push({ type: 'warn', title: `${component.label} needs more current limiting`, text: `The estimated current is ${formatCurrent(metric.current)}, above this LED model's ${formatCurrent(max)} limit. Increase the series resistor value.` }); health -= 16; }
    });
    if (!issues.some(issue => issue.type === 'error' || issue.type === 'warn') && sim.source && sim.hasGround && sim.enoughWiring) {
      issues.unshift({ type: 'success', title: 'Nice work — this path looks safe', text: `${formatCurrent(sim.current)} is estimated through the active path, and the connected part models are within their basic limits.` });
      issues.push({ type: 'info', title: 'Learning note', text: 'These values are educational estimates based on the selected parts and the simple circuit path.' });
    }
    return { issues: issues.slice(0, 4), health: Math.max(0, Math.min(100, health)) };
  }

  function partData(type) { return PARTS[type] || PARTS.resistor; }
  function nextLabel(type) {
    const prefix = partData(type).prefix;
    if (prefix === 'GND') return state.components.some(c => c.label === 'GND') ? `GND${state.components.filter(c => c.label.startsWith('GND')).length + 1}` : 'GND';
    const matches = state.components.map(c => c.label).map(label => {
      const match = label.match(new RegExp(`^${prefix.replace('+', '\\+')}(\\d+)$`));
      return match ? Number(match[1]) : 0;
    });
    return `${prefix}${Math.max(0, ...matches) + 1}`;
  }
  function makeComponent(type, x = 510, y = 350) {
    const definition = partData(type);
    return {
      id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      type, label: nextLabel(type), x: Math.round(x), y: Math.round(y), rotation: 0,
      model: definition.models[0], props: clone(definition.defaults)
    };
  }
  function addComponent(type, x, y) {
    const component = makeComponent(type, x, y);
    state.components.push(component);
    state.selectedId = component.id;
    state.rightTab = 'properties';
    recordHistory();
    renderAll();
    showToast(`${partData(type).title} added to the canvas.`);
  }
  function rotateSelectedComponent() {
    const component = getComponent(state.selectedId);
    if (!component) return;
    component.rotation = ((component.rotation || 0) + 90) % 360;
    recordHistory();
    renderAll();
  }
  function duplicateSelectedComponent() {
    const source = getComponent(state.selectedId);
    if (!source) return;
    const duplicate = clone(source);
    duplicate.id = `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    duplicate.label = nextLabel(source.type);
    duplicate.x = snapCoordinate(source.x + 40);
    duplicate.y = snapCoordinate(source.y + 40);
    state.components.push(duplicate);
    state.selectedId = duplicate.id;
    state.selectedWireId = null;
    state.rightTab = 'properties';
    recordHistory();
    renderAll();
    showToast(`${source.label} duplicated as ${duplicate.label}.`);
  }
  function deleteSelected() {
    if (state.selectedWireId) {
      const wire = getWire(state.selectedWireId);
      state.wires = state.wires.filter(item => item.id !== state.selectedWireId);
      state.selectedWireId = null;
      recordHistory();
      renderAll();
      showToast(wire ? 'Wire removed. You can now reconnect either terminal.' : 'Wire removed.', 'warn');
      return;
    }
    if (!state.selectedId) { showToast('Select a part or a wire first.', 'warn'); return; }
    const component = getComponent(state.selectedId);
    if (!component) return;
    state.wires = state.wires.filter(wire => wire.from.compId !== component.id && wire.to.compId !== component.id);
    state.components = state.components.filter(item => item.id !== component.id);
    state.selectedId = null;
    state.probeTerminals = state.probeTerminals.filter(point => point.compId !== component.id);
    recordHistory();
    renderAll();
    showToast(`${component.label} and its attached wires were removed.`, 'warn');
  }

  function statePayload() {
    return { version: 1, projectName: state.projectName, components: state.components, wires: state.wires, view: state.view, heatmap: state.heatmap, snap: state.snap, breadboardTexture: state.breadboardTexture };
  }
  function recordHistory() {
    const serialized = JSON.stringify(statePayload());
    if (history[historyIndex] === serialized) return;
    history = history.slice(0, historyIndex + 1);
    history.push(serialized);
    if (history.length > 60) history.shift();
    historyIndex = history.length - 1;
    persistCircuit();
    updateHistoryControls();
  }
  function applyPayload(payload) {
    state.projectName = payload.projectName || 'Untitled Fluxa circuit';
    state.components = Array.isArray(payload.components) ? payload.components : clone(DEFAULT_COMPONENTS);
    state.wires = Array.isArray(payload.wires) ? payload.wires : clone(DEFAULT_WIRES);
    state.view = payload.view === 'breadboard' ? 'breadboard' : 'schematic';
    state.heatmap = Boolean(payload.heatmap);
    state.snap = payload.snap !== false;
    state.breadboardTexture = payload.breadboardTexture === true;
    state.selectedId = null;
    state.selectedWireId = null;
    state.probeTerminals = [];
    quickMeasureTarget = null;
    wireStart = null;
    wirePointer = null;
  }
  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    applyPayload(JSON.parse(history[historyIndex]));
    updateHistoryControls();
    persistCircuit();
    renderAll();
    showToast('Undid the last edit.');
  }
  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    applyPayload(JSON.parse(history[historyIndex]));
    updateHistoryControls();
    persistCircuit();
    renderAll();
    showToast('Reapplied the edit.');
  }
  function updateHistoryControls() {
    dom.undoBtn.disabled = historyIndex <= 0;
    dom.redoBtn.disabled = historyIndex >= history.length - 1;
  }
  function persistCircuit() {
    try {
      localStorage.setItem('fluxa-circuit-v1', JSON.stringify(statePayload()));
      lastSaved = Date.now();
      dom.saveStatus.innerHTML = '<i></i>Saved locally';
    } catch (error) {
      dom.saveStatus.textContent = 'Local save unavailable';
    }
  }
  function loadSharedCircuit() {
    try {
      const match = location.hash.match(/(?:^#|&)circuit=([^&]+)/);
      if (!match) return false;
      const payload = JSON.parse(decodeURIComponent(escape(atob(match[1]))));
      if (payload && Array.isArray(payload.components)) { applyPayload(payload); return true; }
    } catch (error) { console.warn('Could not open shared circuit', error); }
    return false;
  }
  function encodePayload(payload) { return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); }

  function renderLibrary() {
    const query = dom.partSearch.value.trim().toLowerCase();
    const types = typeOrder.filter(type => {
      const item = partData(type);
      const searchText = `${item.title} ${item.subtitle} ${item.group} ${item.models.join(' ')}`.toLowerCase();
      return (selectedCategory === 'all' || item.category === selectedCategory) && (!query || searchText.includes(query));
    });
    const groups = new Map();
    types.forEach(type => {
      const group = partData(type).group;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(type);
    });
    dom.componentList.innerHTML = types.length ? [...groups.entries()].map(([group, groupTypes]) => `<section class="component-group"><div class="component-group-title">${escapeHTML(group)} <span>${groupTypes.length}</span></div>${groupTypes.map(type => {
      const item = partData(type);
      const lessonSuggested = Boolean(activeLessonId && beginnerMode && getLessonTargetTypes().includes(type));
      return `<div class="component-item ${lessonSuggested ? 'lesson-suggested' : ''}" draggable="true" data-part-type="${type}" title="${lessonSuggested ? `Lesson hint: add ${escapeHTML(item.title)}` : `Drag ${escapeHTML(item.title)} onto the canvas`}">
        <div class="part-icon ${item.iconClass}">${partIconSvg(type)}</div><div class="part-info"><b>${escapeHTML(item.title)}</b><span>${escapeHTML(item.subtitle)}</span></div><button class="part-add" data-add-type="${type}" aria-label="Add ${escapeHTML(item.title)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button></div>`;
    }).join('')}</section>`).join('') : '<div class="empty-library">No parts match that search.<br><br>Try a model name such as <b>2N2222</b>.</div>';
  }

  function updateLabCollapseControl() {
    const button = $('#collapseLabBtn');
    if (!button) return;
    const collapsed = dom.labDrawer.classList.contains('collapsed');
    button.classList.toggle('collapsed', collapsed);
    button.title = collapsed ? 'Expand lab' : 'Collapse lab';
    button.setAttribute('aria-label', collapsed ? 'Expand Signal Lab' : 'Collapse Signal Lab');
    button.setAttribute('aria-expanded', String(!collapsed));
  }
  function renderToolbar() {
    applyTheme();
    updateLabCollapseControl();
    dom.projectName.textContent = state.projectName;
    dom.learnBtn.classList.toggle('active', Boolean(activeLessonId));
    $$('.tool-button[data-tool]').forEach(button => button.classList.toggle('active', button.dataset.tool === state.tool));
    $$('.view-switch button').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
    dom.boardTextureToggleWrap.classList.toggle('hidden', state.view !== 'breadboard');
    dom.boardTextureToggle.checked = state.breadboardTexture;
    dom.quickMeasureToggle.checked = state.quickMeasureVisible;
    dom.wiringToggle.checked = state.wiringEnabled;
    $$('.inspector-tabs button').forEach(button => button.classList.toggle('active', button.dataset.righttab === state.rightTab));
    $$('.lab-tabs button').forEach(button => button.classList.toggle('active', button.dataset.labtab === state.labTab));
    dom.thermalBtn.classList.toggle('active', state.heatmap);
    dom.snapBtn.classList.toggle('active', state.snap);
    dom.snapBtn.innerHTML = `<span class="snap-dot"></span>Snap <b>${state.snap ? '20' : 'off'}</b>`;
    dom.simulateBtn.classList.toggle('running', state.running);
    dom.simulateLabel.textContent = state.running ? 'Stop' : 'Simulate';
    dom.circuitStateChip.classList.toggle('running', state.running);
    const analysis = analyzeCircuit();
    dom.circuitStateChip.querySelector('span').textContent = state.running ? simulation.hasActivePath ? `Live simulation · ${formatCurrent(simulation.totalCurrent ?? simulation.current)}` : simulation.partialWireIds?.size ? 'Open path preview · 0 A' : 'No conducting path' : analysis.health > 75 ? 'Ready to simulate' : 'Review circuit alerts';
    const helper = wireStart ? 'Drag to a glowing terminal, or click one to finish the wire' : state.tool === 'probe' ? 'Click two terminals to measure between them' : state.wiringEnabled ? 'Drag parts to move · drag empty space to pan · drag from a terminal to wire' : 'Wiring is paused · click a node, wire or component to update Quick Measure';
    dom.canvasHelp.innerHTML = helper.replace(/(W)/, '<kbd>$1</kbd>');
  }
  // Konva maintains the miniature spatial overview while the SVG layer renders the detailed Fritzing-compatible parts.
  function initKonvaMinimap() {
    if (!window.Konva || !dom.konvaMinimap || miniMapStage) return;
    miniMapStage = new window.Konva.Stage({ container: dom.konvaMinimap, width: 119, height: 68, listening: false });
    miniMapLayer = new window.Konva.Layer({ listening: false });
    miniMapStage.add(miniMapLayer);
  }
  function renderKonvaMinimap() {
    if (!miniMapLayer || !window.Konva) return;
    const sx = 119 / 1200, sy = 68 / 690;
    miniMapLayer.destroyChildren();
    state.wires.forEach(wire => {
      const from = getTerminalFromPoint(wire.from), to = getTerminalFromPoint(wire.to);
      if (!from || !to) return;
      miniMapLayer.add(new window.Konva.Line({ points: [from.x * sx, from.y * sy, to.x * sx, to.y * sy], stroke: state.running ? '#64d9c6' : '#607e9e', strokeWidth: 1, opacity: .83 }));
    });
    state.components.forEach(component => {
      const isSemiconductor = ['led', 'diode', 'zener', 'bjt', 'mosfet'].includes(component.type);
      miniMapLayer.add(new window.Konva.Rect({ x: component.x * sx - 2.3, y: component.y * sy - 1.9, width: 4.6, height: 3.8, cornerRadius: 1, fill: isSemiconductor ? '#63d9bf' : component.type.includes('timer') || component.type === 'opamp' ? '#ad9dff' : '#9eb6d2', opacity: .98 }));
    });
    miniMapLayer.draw();
    if (dom.minimapViewport) {
      const width = Math.min(99, Math.max(16, viewBox.w * sx));
      const height = Math.min(56, Math.max(14, viewBox.h * sy));
      const left = Math.max(1, Math.min(118 - width, viewBox.x * sx));
      const top = Math.max(1, Math.min(67 - height, viewBox.y * sy));
      Object.assign(dom.minimapViewport.style, { inset: 'auto', width: `${width}px`, height: `${height}px`, left: `${left}px`, top: `${top}px` });
    }
  }
  function renderCanvas() {
    simulation = calculateSimulation();
    dom.canvas.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    dom.canvas.classList.toggle('wire-mode', Boolean(wireStart));
    dom.canvas.classList.toggle('simulating', state.running);
    dom.canvas.classList.toggle('heatmap-on', state.running && state.heatmap);
    dom.canvas.classList.toggle('lesson-active', Boolean(activeLessonId && beginnerMode));
    dom.canvas.classList.toggle('breadboard-view', state.view === 'breadboard');
    dom.canvasWrap.classList.toggle('breadboard-canvas', state.view === 'breadboard');
    dom.background.setAttribute('fill', state.view === 'breadboard' ? '#d8d1bd' : state.theme === 'light' ? 'url(#lightGridPattern)' : 'url(#gridPattern)');
    dom.breadboardBackground.classList.toggle('hidden', state.view !== 'breadboard' || !state.breadboardTexture);
    dom.breadboardBackground.innerHTML = renderBreadboardBackground();
    dom.wireLayer.innerHTML = renderWires();
    dom.componentLayer.innerHTML = state.components.map(renderComponent).join('');
    dom.annotationLayer.innerHTML = renderAnnotations();
    renderKonvaMinimap();
    renderSelectionQuickActions();
    const zoom = Math.round(1200 / viewBox.w * 100);
    dom.zoomLabel.textContent = `${zoom}%`;
  }

  function overviewProperties() {
    const sim = simulation;
    const parts = state.components.length;
    const models = new Set(state.components.map(c => c.model)).size;
    return `<div class="selection-intro"><div class="selection-orb"><svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="m7.7 8.2 3 7m5.6-7-3 7M8 7h8"/></svg></div><h3>Nothing selected</h3><p>Select a part on the canvas to edit its values, model, and pins.</p></div>
      <div class="inspector-section"><div class="section-label">Circuit overview</div><div class="overview-grid"><div class="overview-stat"><b>${parts}</b><span>Parts</span></div><div class="overview-stat"><b>${state.wires.length}</b><span>Wires</span></div><div class="overview-stat"><b>${models}</b><span>Models</span></div></div></div>
      <div class="inspector-section"><div class="section-label">Smart actions</div><button class="quick-action" data-action="autotune"><span class="action-icon">✦</span>Auto-tune a target output</button><button class="quick-action" data-action="fit"><span class="action-icon">⌗</span>Fit circuit to workspace</button><button class="quick-action" data-action="reset"><span class="action-icon">↺</span>Restore LED example</button></div>
      <div class="inspector-section"><div class="section-label">DC estimate</div><div class="overview-grid"><div class="overview-stat"><b>${formatVoltage(sim.sourceVoltage)}</b><span>Input</span></div><div class="overview-stat"><b>${formatCurrent(sim.current)}</b><span>Path current</span></div><div class="overview-stat"><b>${formatPower(Object.values(sim.metrics).reduce((sum, m) => sum + m.power, 0) / 2)}</b><span>Load</span></div></div></div>`;
  }
  function propertyFields(component) {
    const p = component.props || {};
    const input = (label, key, value, full = false, type = 'text') => `<div class="field ${full ? 'full' : ''}"><label>${label}</label><input data-component-field="${key}" type="${type}" value="${escapeHTML(value ?? '')}" /></div>`;
    const select = (label, key, value, options, full = false) => `<div class="field ${full ? 'full' : ''}"><label>${label}</label><select data-component-field="${key}">${options.map(option => `<option ${String(option) === String(value) ? 'selected' : ''}>${escapeHTML(option)}</option>`).join('')}</select></div>`;
    let fields = input('Reference', 'label', component.label) + input('Display value', 'value', p.value || primaryValue(component));
    if (component.type === 'source' || component.type === 'acsource') fields += input('Voltage', 'voltage', p.voltage) + select('Waveform', 'waveform', p.waveform, ['DC', 'Sine', 'Square']) + input('Frequency', 'frequency', p.frequency ? `${p.frequency} Hz` : '1 kHz', true);
    else if (component.type === 'resistor') fields += input('Resistance', 'resistance', p.resistance || p.value) + input('Power rating', 'rating', `${p.rating || .25} W`) + input('Tolerance', 'tolerance', p.tolerance || '5%', true);
    else if (component.type === 'capacitor') fields += input('Capacitance', 'capacitance', p.capacitance || p.value) + input('Voltage rating', 'voltageRating', p.voltageRating || '50 V') + select('Dielectric', 'dielectric', p.dielectric || 'X7R', ['X7R', 'C0G / NP0', 'Electrolytic'], true);
    else if (component.type === 'inductor') fields += input('Inductance', 'inductance', p.inductance || p.value) + input('DCR', 'dcr', p.dcr || '1 Ω');
    else if (component.type === 'transformer') fields += input('Turns ratio', 'ratio', p.ratio || p.value) + input('Power rating', 'powerRating', p.powerRating || '3 VA');
    else if (component.type === 'potentiometer') fields += input('Total resistance', 'resistance', p.resistance || p.value) + input('Wiper position', 'position', `${p.position || 50}%`);
    else if (component.type === 'switch') fields += select('Position', 'position', p.position || 'Open', ['Open', 'Closed'], true);
    else if (component.type === 'diode') fields += input('Forward voltage', 'forwardVoltage', `${p.forwardVoltage || .7} V`) + input('Max current', 'maxCurrent', `${p.maxCurrent || 1} A`) + input('Reverse voltage', 'reverseVoltage', `${p.reverseVoltage || 100} V`, true);
    else if (component.type === 'bridge') fields += input('Bridge voltage drop', 'forwardVoltage', `${p.forwardVoltage || 1.4} V`) + input('Max current', 'maxCurrent', `${p.maxCurrent || 2} A`) + input('Reverse voltage', 'reverseVoltage', `${p.reverseVoltage || 600} V`, true);
    else if (component.type === 'zener') fields += input('Zener voltage', 'zenerVoltage', `${p.zenerVoltage || 5.1} V`) + input('Power rating', 'powerRating', `${p.powerRating || 1} W`);
    else if (component.type === 'led') fields += input('Forward voltage', 'forwardVoltage', `${p.forwardVoltage || 2.1} V`) + input('Max current', 'maxCurrent', `${(p.maxCurrent || .02) * 1000} mA`) + select('Lens colour', 'color', p.color || 'Green', ['Green', 'Red', 'Blue', 'Amber'], true);
    else if (component.type === 'bjt') fields += select('Polarity', 'polarity', p.polarity || 'NPN', ['NPN', 'PNP']) + input('DC gain hFE', 'hfe', p.hfe || 100) + input('Collector current', 'maxCurrent', `${p.maxCurrent || .6} A`, true);
    else if (component.type === 'mosfet') fields += select('Channel', 'channel', p.channel || 'N-channel', ['N-channel', 'P-channel']) + input('RDS(on)', 'rds', `${p.rds || .1} Ω`) + input('Drain current', 'maxCurrent', `${p.maxCurrent || 1} A`, true);
    else if (component.type === 'timer555') fields += select('Mode', 'mode', p.mode || 'Astable', ['Astable', 'Monostable', 'Bistable']) + input('Supply range', 'supply', p.supply || '4.5–16 V') + input('Target frequency', 'frequency', p.frequency || '1 kHz', true);
    else if (component.type === 'opamp') fields += input('Supply range', 'supply', p.supply || '±15 V') + input('Open-loop gain', 'gain', p.gain || 100000) + input('Bandwidth', 'bandwidth', p.bandwidth || '1 MHz', true);
    return `<div class="field-grid">${fields}</div>`;
  }
  function glossaryEntry(type) {
    const entries = {
      source: ['DC supply', 'Volt (V)', 'Provides electrical energy to a circuit.'],
      acsource: ['AC source', 'Volt (V)', 'Produces a changing signal such as a sine or square wave.'],
      ground: ['Ground', '0 V reference', 'Defines the reference point used to compare circuit voltages.'],
      resistor: ['Resistor', 'Ohm (Ω)', 'Limits current and can divide voltage in a circuit.'],
      capacitor: ['Capacitor', 'Farad (F)', 'Stores charge temporarily and can smooth or delay signals.'],
      inductor: ['Inductor', 'Henry (H)', 'Stores energy in a magnetic field and resists rapid current changes.'],
      transformer: ['Transformer', 'Turns ratio', 'Transfers energy between coils and can change voltage levels.'],
      potentiometer: ['Potentiometer', 'Ohm (Ω)', 'An adjustable resistor often used as a control or voltage divider.'],
      switch: ['Switch', 'Open / closed', 'Lets you intentionally allow or stop current flow.'],
      diode: ['Diode', 'Forward voltage', 'Allows current mainly in one direction.'],
      bridge: ['Bridge rectifier', 'Volt / Ampere', 'Uses four diodes to turn AC input into a single positive and negative DC output.'],
      zener: ['Zener diode', 'Volt (V)', 'Uses reverse breakdown to provide a reference voltage.'],
      led: ['LED', 'Forward current', 'A diode that emits light when current flows in the correct direction.'],
      bjt: ['BJT transistor', 'Current gain hFE', 'A small base current can control a larger collector current.'],
      mosfet: ['MOSFET', 'RDS(on)', 'A voltage at the gate controls current between drain and source.'],
      timer555: ['555 timer', 'Time / frequency', 'A common IC used for delays, pulses and oscillators.'],
      opamp: ['Operational amplifier', 'Voltage gain', 'An IC that compares two input voltages and drives an output.' ]
    };
    const [term, unit, description] = entries[type] || ['Electronic part', '—', 'A component used in an electronic circuit.'];
    return { term, unit, description };
  }
  function renderSelectedProperties(component) { 
    const data = partData(component.type);
    const modelData = MODEL_DATA[component.model] || { detail: 'Generic simulation model', params: {} };
    const artworkNote = FRITZING_PARTS[component.type] ? ' · Fritzing SVG mapping ready' : '';
    const glossary = glossaryEntry(component.type);
    const pins = getPins(component);
    return `<div class="inspector-section"><div class="selected-component-head"><div class="selected-icon">${partIconSvg(component.type)}</div><div><h3>${escapeHTML(data.title)}</h3><p>${escapeHTML(data.subtitle)}</p></div><span class="component-id-badge">${escapeHTML(component.label)}</span></div></div>
      <div class="inspector-section"><div class="section-label">Market model</div><div class="model-select-wrap"><label>Datasheet-linked part</label><select id="componentModel">${data.models.map(model => `<option ${model === component.model ? 'selected' : ''}>${escapeHTML(model)}</option>`).join('')}</select><div class="model-note">Technical parameters applied</div></div></div>
      <div class="inspector-section"><div class="section-label">Electrical properties</div>${propertyFields(component)}</div>
      <div class="inspector-section"><div class="section-label">Quick glossary</div><div class="glossary-card"><div class="glossary-card-head"><b>${escapeHTML(glossary.term)}</b><span>${escapeHTML(glossary.unit)}</span></div><p>${escapeHTML(glossary.description)}</p></div></div>
      <div class="inspector-section"><div class="section-label">Terminals</div><div class="pin-list">${pins.map((pin, index) => `<div class="pin-item"><b>${index + 1}</b>${escapeHTML(pin.label)}</div>`).join('')}</div></div>
      <div class="inspector-section"><div class="datasheet-card"><div><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/></svg>Datasheet parameters active</div><p>${escapeHTML(modelData.detail)}${escapeHTML(artworkNote)}</p></div></div>
      <div class="inspector-section"><div class="property-actions"><button data-action="rotate">↻ Rotate 90°</button><button class="danger" data-action="delete">Delete part</button></div></div>`;
  }
  function terminalDescription(point) {
    const component = getComponent(point?.compId);
    if (!component) return 'Disconnected terminal';
    const pin = getPins(component)[point.pin];
    return `${component.label} · ${pin?.label || `Pin ${Number(point.pin) + 1}`}`;
  }
  function renderSelectedWire(wire) {
    return `<div class="inspector-section"><div class="selected-component-head"><div class="selected-icon wire-selected-icon"><svg viewBox="0 0 32 28"><circle cx="5" cy="7" r="2.5"/><circle cx="27" cy="21" r="2.5"/><path d="M7.5 8.6c7.2 0 8.1 11 17 11"/></svg></div><div><h3>Wire connection</h3><p>Selectable, removable and rewireable</p></div><span class="component-id-badge">NET</span></div></div>
      <div class="inspector-section"><div class="section-label">Connected terminals</div><div class="wire-endpoint"><span class="endpoint-dot endpoint-a"></span><div><b>Endpoint A</b><small>${escapeHTML(terminalDescription(wire.from))}</small></div></div><div class="wire-endpoint"><span class="endpoint-dot endpoint-b"></span><div><b>Endpoint B</b><small>${escapeHTML(terminalDescription(wire.to))}</small></div></div></div>
      <div class="inspector-section"><div class="section-label">Wire controls</div><button class="quick-action" data-action="rewire"><span class="action-icon">⌁</span>Reconnect endpoint B</button><button class="quick-action danger-action" data-action="delete-wire"><span class="action-icon">×</span>Remove this wire</button><div class="wire-hint">Tip: press <kbd>W</kbd>, then drag between any two glowing terminals to create a new branch.</div></div>`;
  }
  function renderProperties() {
    const wire = getWire(state.selectedWireId);
    const component = getComponent(state.selectedId);
    dom.inspectorContent.innerHTML = wire ? renderSelectedWire(wire) : component ? renderSelectedProperties(component) : overviewProperties();
  }

  function probeReadout() {
    const sim = simulation;
    if (state.meterMode === 'current') return { value: formatCurrent(sim.current), label: state.probeTerminals.length === 2 ? 'Calculated current through selection' : 'Estimated active-path current' };
    if (state.meterMode === 'resistance') return { value: formatResistance(sim.totalResistance), label: state.probeTerminals.length === 2 ? 'Equivalent selected path' : 'Total modeled series resistance' };
    const measured = state.probeTerminals.length === 2 ? Math.max(0, sim.sourceVoltage - sim.forwardDrop) : sim.sourceVoltage;
    return { value: formatVoltage(measured), label: state.probeTerminals.length === 2 ? 'Voltage between probe A and B' : 'Reference-to-node measurement' };
  }
  function renderMeasurements() {
    const sim = simulation;
    const readout = probeReadout();
    const points = state.probeTerminals;
    const pointName = point => { const c = getComponent(point.compId); return c ? `${c.label} · ${getPins(c)[point.pin]?.label || point.pin + 1}` : '—'; };
    dom.inspectorContent.innerHTML = `<div class="inspector-section"><div class="section-label">Interactive multimeter</div><div class="measurement-card"><div class="measurement-head"><b>Virtual DMM</b><span>CONNECTED</span></div><div class="meter-mode"><button data-meter="voltage" class="${state.meterMode === 'voltage' ? 'active' : ''}">Voltage</button><button data-meter="current" class="${state.meterMode === 'current' ? 'active' : ''}">Current</button><button data-meter="resistance" class="${state.meterMode === 'resistance' ? 'active' : ''}">Resistance</button></div><div class="measure-value">${readout.value}</div><div class="measure-sub">${readout.label}</div></div></div>
      <div class="inspector-section"><div class="section-label">Probe points</div><div class="probe-instruction">Choose the <b>Probe</b> tool, then click two terminals on the canvas. Fluxa updates this reading instantly.</div><div class="probe-points"><div class="probe-point ${points[0] ? 'set' : ''}">A · ${points[0] ? escapeHTML(pointName(points[0])) : 'Select point A'}</div><div class="probe-point ${points[1] ? 'set' : ''}">B · ${points[1] ? escapeHTML(pointName(points[1])) : 'Select point B'}</div></div><button class="quick-action" data-action="activate-probe"><span class="action-icon">⌁</span>${state.tool === 'probe' ? 'Probe tool is active' : 'Activate probe tool'}</button></div>
      <div class="inspector-section"><div class="section-label">Scope channels</div><div class="measurement-card"><div class="measurement-head"><b>CH1 · Source</b><span style="color:#63e4d0">ON</span></div><div class="measure-sub" style="margin-top:7px">${state.running ? `${formatVoltage(sim.sourceVoltage)} · ${getSourceFrequencyText()}` : 'Run simulation to sample waveform'}</div></div><button class="quick-action" data-action="scope"><span class="action-icon">⌇</span>Open multichannel scope</button></div>`;
  }
  function renderAssistant() {
    const result = analyzeCircuit();
    const icon = { success: '✓', info: 'i', warn: '!', error: '×' };
    dom.inspectorContent.innerHTML = `<div class="ai-hero"><div class="ai-hero-top"><div class="ai-avatar">✦</div><div><h3>Smart Circuit Inspector</h3><p>Friendly topology, current and thermal checks</p></div></div><div class="health-meter"><i style="width:${result.health}%"></i></div><div class="health-row"><span>Circuit health</span><b>${result.health}/100</b></div></div><div class="issue-list">${result.issues.map(issue => `<div class="issue ${issue.type}"><div class="issue-icon">${icon[issue.type]}</div><div><b>${escapeHTML(issue.title)}</b><p>${escapeHTML(issue.text)}</p></div></div>`).join('')}</div><button class="ai-action" data-action="autotune">✦ Auto-tune this circuit</button><div class="inspector-section"><div class="section-label">How Fluxa checked it</div><div class="datasheet-card"><div><svg viewBox="0 0 24 24"><path d="M5 12h4l2-6 4 12 2-6h2"/></svg>Educational circuit estimate</div><p>Fluxa checked basic connectivity, selected part limits and estimated DC power so you can learn what to adjust next.</p></div></div>`;
  }
  function renderInspector() {
    if (state.rightTab === 'measurements') renderMeasurements();
    else if (state.rightTab === 'assistant') renderAssistant();
    else renderProperties();
  }

  function getSourceFrequencyText() {
    const source = simulation?.source;
    if (!source) return '—';
    const frequency = parseNumber(source.props.frequency || 1000, 1000);
    return frequency >= 1000 ? `${trimNumber(frequency / 1000, 2)} kHz` : `${trimNumber(frequency, 0)} Hz`;
  }
  function sinePath(width, height, amplitude, phase, kind = 'sine') {
    const mid = height / 2;
    const segments = 130;
    let path = '';
    for (let i = 0; i <= segments; i++) {
      const x = i / segments * width;
      const t = (i / segments * Math.PI * 6) + phase;
      let val;
      if (kind === 'square') val = Math.sin(t) >= 0 ? -amplitude : amplitude;
      else if (kind === 'dc') val = -amplitude * .35;
      else val = Math.sin(t) * amplitude;
      const y = mid + val;
      path += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return path;
  }
  function renderScope() {
    const source = simulation?.source;
    const waveform = source?.props?.waveform || 'DC';
    const kind = waveform.toLowerCase() === 'square' ? 'square' : waveform.toLowerCase() === 'dc' ? 'dc' : 'sine';
    const phase = state.running ? Date.now() / 470 : 0;
    const signalA = sinePath(575, 122, 34, phase, kind);
    const signalB = sinePath(575, 122, 16, phase + 1.4, kind === 'dc' ? 'sine' : 'sine');
    return `<div class="scope-layout"><div class="scope-sidebar"><div class="scope-control-title">Channels</div><div class="channel-row selected"><i class="channel-color"></i><span>CH1 · V1</span><small>1 V/div</small></div><div class="channel-row"><i class="channel-color"></i><span>CH2 · OUT</span><small>1 V/div</small></div></div><div class="scope-graph-wrap"><svg class="scope-graph" viewBox="0 0 575 142" preserveAspectRatio="none"><g>${Array.from({ length: 9 }, (_, i) => `<line class="scope-grid" x1="${i * 72}" y1="0" x2="${i * 72}" y2="122"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<line class="scope-grid" x1="0" y1="${i * 24}" x2="575" y2="${i * 24}"/>`).join('')}</g><path class="scope-signal-a" d="${signalA}"/><path class="scope-signal-b" d="${signalB}"/><line class="scope-marker" x1="427" y1="0" x2="427" y2="122"/><text class="scope-axis-label" x="3" y="136">0 ms</text><text class="scope-axis-label" x="265" y="136">${getSourceFrequencyText()}</text><text class="scope-axis-label" x="535" y="136">2.0 ms</text></svg></div><div class="scope-readout"><div class="readout"><span>CH1 Pk–Pk</span><b>${formatVoltage((simulation?.sourceVoltage || 0) * 2)}</b></div><div class="readout"><span>CH2 RMS</span><b>${formatVoltage((simulation?.outputVoltage || 0) / Math.sqrt(2))}</b></div><div class="readout"><span>Frequency</span><b>${getSourceFrequencyText()}</b></div></div></div>`;
  }
  function renderSpectrum() {
    const heights = [16, 24, 36, 94, 46, 30, 18, 13, 10, 7, 6, 5, 4, 4, 3, 3, 2];
    return `<div class="spectrum-layout"><div class="spectrum-chart"><svg viewBox="0 0 660 130" preserveAspectRatio="none"><defs><linearGradient id="barGradient" x1="0" x2="0" y1="1" y2="0"><stop stop-color="#2bc7b1"/><stop offset="1" stop-color="#8cebd8"/></linearGradient></defs>${[0, 30, 60, 90, 120].map(y => `<line x1="20" y1="${y}" x2="650" y2="${y}" stroke="#26384f"/>`).join('')}<g class="spectrum-bars">${heights.map((height, index) => `<rect x="${28 + index * 33}" y="${120 - height}" width="17" height="${height}" rx="2"/>`).join('')}</g><text x="18" y="129" fill="#62748e" font-size="8">0</text><text x="270" y="129" fill="#62748e" font-size="8">${getSourceFrequencyText()}</text><text x="605" y="129" fill="#62748e" font-size="8">10 kHz</text></svg></div><div class="spectrum-info"><h4>Frequency profile</h4><p>Fundamental peak follows the active source model. Harmonics and leakage are estimated from the current waveform.</p><span class="frequency-tag">Peak · ${getSourceFrequencyText()}</span></div></div>`;
  }
  function renderThermal() {
    const warmest = [...state.components].sort((a, b) => componentMetric(b.id).temp - componentMetric(a.id).temp).slice(0, 3);
    return `<div class="thermal-layout"><div class="thermal-visual"><div class="thermal-scale"></div><div class="thermal-bars">${warmest.map((component, index) => { const temp = componentMetric(component.id).temp; const h = Math.max(22, Math.min(90, (temp - 20) * 1.6)); return `<div class="thermal-column ${temp > 45 ? 'warn' : ''}"><i style="height:${h}px"></i><span>${escapeHTML(component.label)} · ${trimNumber(temp, 0)}°</span></div>`; }).join('')}</div></div><div class="thermal-insight"><h4>Thermal heatmap</h4><p><b>${warmest[0] ? escapeHTML(warmest[0].label) : 'No part'}</b> has the highest estimated dissipation at <b>${warmest[0] ? trimNumber(componentMetric(warmest[0].id).temp, 1) : '25'}°C</b>. Enable the canvas overlay for a component-level heat view.</p><div class="thermal-toggle-line"><span class="heat-dot"></span><button data-action="heatmap" style="color:#9debdc;background:none;padding:0;text-decoration:underline">${state.heatmap ? 'Heat map enabled' : 'Enable heat map'}</button></div></div></div>`;
  }
  function updateLabDensity() {
    if (!dom.labDrawer) return;
    const height = dom.labDrawer.getBoundingClientRect().height;
    const active = !dom.labDrawer.classList.contains('collapsed') && height > 0;
    const dense = active && height < 205;
    const compact = active && height < 162;
    const micro = active && height < 124;
    dom.labDrawer.classList.toggle('dense', dense);
    dom.labDrawer.classList.toggle('compact', compact);
    dom.labDrawer.classList.toggle('micro', micro);
  }
  function renderLab() {
    updateLabDensity();
    if (dom.labDrawer.classList.contains('collapsed')) return;
    dom.labContent.innerHTML = state.labTab === 'spectrum' ? renderSpectrum() : state.labTab === 'thermal' ? renderThermal() : renderScope();
  }
  function renderLessonDock() {
    const dock = dom.lessonDock;
    const lesson = getLesson();
    if (!dock || !lesson) {
      dock?.classList.add('hidden');
      if (dock) dock.innerHTML = '';
      return;
    }
    const complete = lessonStepIndex >= lesson.steps.length;
    const step = getCurrentLessonStep();
    const progress = Math.round((Math.min(lessonStepIndex, lesson.steps.length) / lesson.steps.length) * 100);
    dock.innerHTML = `<div class="lesson-dock-head"><div class="lesson-dock-icon">${escapeHTML(lesson.icon)}</div><div><b>${escapeHTML(lesson.title)}</b><small>${escapeHTML(lesson.level)} · ${escapeHTML(lesson.duration)}</small></div><button class="lesson-close" data-lesson-dock-action="exit" title="Exit lesson" aria-label="Exit lesson">×</button></div><div class="lesson-progress-label"><span>${complete ? 'Lesson complete' : `Step ${lessonStepIndex + 1} of ${lesson.steps.length}`}</span><b>${progress}%</b></div><div class="lesson-progress"><i style="width:${progress}%"></i></div><div class="lesson-step ${complete ? 'complete' : ''}"><span class="lesson-step-dot">${complete ? '✓' : lessonStepIndex + 1}</span><div><b>${complete ? 'Nice work!' : escapeHTML(step.text)}</b><p>${complete ? 'You completed every guided step. Explore the circuit or start another lesson.' : escapeHTML(lesson.summary)}</p></div></div>${!complete && lessonHintVisible ? `<div class="lesson-hint">${escapeHTML(step.hint)}</div>` : ''}<div class="lesson-dock-actions">${!complete ? `<button class="lesson-hint-button" data-lesson-dock-action="hint">${lessonHintVisible ? 'Hide hint' : 'Show hint'}</button>` : `<button class="lesson-hint-button" data-lesson-dock-action="lessons">More lessons</button>`}<label class="beginner-mode-toggle"><input type="checkbox" data-lesson-dock-action="beginner" ${beginnerMode ? 'checked' : ''}/><span></span>Beginner hints</label></div>`;
    dock.classList.remove('hidden');
  }
  function renderAll() {
    simulation = calculateSimulation();
    updateLessonProgress();
    renderLibrary();
    renderToolbar();
    renderCanvas();
    renderQuickMeasurePanel();
    renderInspector();
    renderLab();
    renderLessonDock();
    updateHistoryControls();
  }

  function toSvgPoint(event) {
    const point = dom.canvas.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    const transformed = point.matrixTransform(dom.canvas.getScreenCTM().inverse());
    return { x: transformed.x, y: transformed.y };
  }
  function snapCoordinate(value) { return state.snap ? Math.round(value / 20) * 20 : Math.round(value); }
  function schedulePanRender() {
    if (panFrame !== null) return;
    panFrame = requestAnimationFrame(() => {
      panFrame = null;
      dom.canvas.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    });
  }
  function selectComponent(id) {
    state.selectedId = id;
    state.selectedWireId = null;
    state.rightTab = 'properties';
    quickMeasureTarget = { kind: 'component', compId: id };
    renderAll();
  }
  function selectWire(id) {
    state.selectedWireId = id;
    state.selectedId = null;
    state.rightTab = 'properties';
    quickMeasureTarget = { kind: 'wire', wireId: id };
    renderAll();
  }
  function setTool(tool) {
    const nextTool = tool === 'wire' ? 'select' : tool;
    state.tool = nextTool;
    if (wireStart) { wireStart = null; wirePointer = null; }
    renderAll();
  }
  function connectionExists(a, b) {
    return state.wires.some(wire => (pinKey(wire.from) === pinKey(a) && pinKey(wire.to) === pinKey(b)) || (pinKey(wire.from) === pinKey(b) && pinKey(wire.to) === pinKey(a)));
  }
  function terminalHasWire(point) {
    return state.wires.some(wire => pinKey(wire.from) === pinKey(point) || pinKey(wire.to) === pinKey(point));
  }
  function findNearbyPinPairs(component) {
    if (!state.wiringEnabled) return [];
    const threshold = state.snap ? 28 : 20;
    const usedTargets = new Set();
    const pairs = [];
    getPins(component).forEach((_, pinIndex) => {
      const sourcePoint = { compId: component.id, pin: pinIndex };
      if (terminalHasWire(sourcePoint)) return;
      const sourcePosition = getTerminalPosition(component, pinIndex);
      const candidates = [];
      state.components.forEach(other => {
        if (other.id === component.id) return;
        getPins(other).forEach((__, otherPin) => {
          const targetPoint = { compId: other.id, pin: otherPin };
          if (terminalHasWire(targetPoint) || usedTargets.has(pinKey(targetPoint)) || connectionExists(sourcePoint, targetPoint)) return;
          const targetPosition = getTerminalPosition(other, otherPin);
          const distance = Math.hypot(sourcePosition.x - targetPosition.x, sourcePosition.y - targetPosition.y);
          if (distance <= threshold) candidates.push({ point: targetPoint, distance });
        });
      });
      candidates.sort((a, b) => a.distance - b.distance);
      const nearest = candidates[0];
      if (!nearest) return;
      usedTargets.add(pinKey(nearest.point));
      pairs.push({ from: sourcePoint, to: nearest.point, distance: nearest.distance });
    });
    return pairs;
  }
  function autoConnectNearbyPins(component, pairs = findNearbyPinPairs(component)) {
    if (!state.wiringEnabled) return 0;
    pairs.forEach(pair => {
      if (!terminalHasWire(pair.from) && !terminalHasWire(pair.to) && !connectionExists(pair.from, pair.to)) {
        state.wires.push({ id: `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`, from: pair.from, to: pair.to, auto: true });
      }
    });
    return pairs.length;
  }
  function beginWire(point, announce = true) {
    wireStart = point;
    wirePointer = getTerminalFromPoint(point);
    state.selectedId = null;
    state.selectedWireId = null;
    renderCanvas();
    renderToolbar();
    if (announce) showToast('Wire started. Drag to a glowing terminal, or click another terminal to finish.');
  }
  function completeWire(point, announce = true) {
    if (!wireStart) return false;
    if (pinKey(wireStart) === pinKey(point)) return false;
    if (connectionExists(wireStart, point)) {
      if (announce) showToast('Those terminals are already connected.', 'warn');
      return false;
    }
    state.wires.push({ id: `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`, from: wireStart, to: point });
    wireStart = null;
    wirePointer = null;
    recordHistory();
    renderAll();
    if (announce) showToast('Wire connected.');
    return true;
  }
  function rewireSelectedWire() {
    const wire = getWire(state.selectedWireId);
    if (!wire) return;
    state.wires = state.wires.filter(item => item.id !== wire.id);
    state.selectedWireId = null;
    state.selectedId = null;
    state.tool = 'select';
    wireStart = wire.from;
    wirePointer = getTerminalFromPoint(wire.from);
    recordHistory();
    renderAll();
    showToast(`Endpoint B released from ${terminalDescription(wire.to)}. Choose a new terminal.`);
  }
  function handleTerminalClick(point) {
    if (state.tool === 'probe') {
      const key = pinKey(point);
      const existing = state.probeTerminals.findIndex(item => pinKey(item) === key);
      if (existing !== -1) state.probeTerminals.splice(existing, 1);
      else if (state.probeTerminals.length >= 2) state.probeTerminals = [point];
      else state.probeTerminals.push(point);
      state.rightTab = 'measurements';
      renderAll();
      showToast(state.probeTerminals.length === 2 ? 'Both probe points are set.' : 'Probe point A is set. Choose point B.');
      return;
    }
    if (!state.wiringEnabled) {
      setQuickMeasureTarget({ kind: 'terminal', compId: point.compId, pin: point.pin });
      return;
    }
    if (!wireStart) beginWire(point);
    else if (pinKey(wireStart) === pinKey(point)) {
      // Keep the active endpoint so a click followed by a drag remains natural.
      renderCanvas();
    } else completeWire(point);
  }

  function setViewBox(next) {
    const minW = 550, maxW = 1800;
    const ratio = 690 / 1200;
    const width = Math.max(minW, Math.min(maxW, next.w));
    const height = width * ratio;
    viewBox = { x: next.x, y: next.y, w: width, h: height };
    renderCanvas();
  }
  function zoomBy(factor) {
    const cx = viewBox.x + viewBox.w / 2;
    const cy = viewBox.y + viewBox.h / 2;
    const width = Math.max(550, Math.min(1800, viewBox.w * factor));
    const height = width * 690 / 1200;
    setViewBox({ x: cx - width / 2, y: cy - height / 2, w: width, h: height });
  }
  function fitView() { viewBox = { x: 0, y: 0, w: 1200, h: 690 }; renderCanvas(); showToast('Circuit fitted to the workspace.'); }
  function centerCircuitView() {
    if (!state.components.length) { fitView(); return; }
    const points = [];
    state.components.forEach(component => {
      const bounds = getBounds(component);
      [[bounds.x, bounds.y], [bounds.x + bounds.w, bounds.y], [bounds.x + bounds.w, bounds.y + bounds.h], [bounds.x, bounds.y + bounds.h]].forEach(([x, y]) => {
        const rotated = rotatePoint(x, y, component.rotation || 0);
        points.push({ x: component.x + rotated.x, y: component.y + rotated.y });
      });
    });
    const centerX = (Math.min(...points.map(point => point.x)) + Math.max(...points.map(point => point.x))) / 2;
    const centerY = (Math.min(...points.map(point => point.y)) + Math.max(...points.map(point => point.y))) / 2;
    viewBox.x = centerX - viewBox.w / 2;
    viewBox.y = centerY - viewBox.h / 2;
    renderCanvas();
    showToast('Circuit centered in the workspace.');
  }

  function getLabResizeBounds() {
    const studio = $('.studio');
    const toolbar = $('.editor-toolbar');
    const studioHeight = studio?.getBoundingClientRect().height || Math.max(420, window.innerHeight - 68);
    const toolbarHeight = toolbar?.getBoundingClientRect().height || 51;
    const minimum = 112;
    const reservedCanvas = 126;
    const maximum = Math.max(minimum, Math.min(420, studioHeight - toolbarHeight - reservedCanvas));
    return { minimum, maximum };
  }
  function applyLabHeight(height, save = false) {
    if (!dom.labDrawer) return 0;
    const { minimum, maximum } = getLabResizeBounds();
    const next = Math.round(Math.max(minimum, Math.min(maximum, Number(height) || minimum)));
    dom.labDrawer.style.setProperty('--lab-height', `${next}px`);
    dom.labDrawer.classList.add('user-sized');
    dom.labResizeHandle?.setAttribute('aria-valuenow', String(next));
    updateLabDensity();
    if (save) {
      try { localStorage.setItem('fluxa-lab-height-v1', String(next)); } catch (_) {}
    }
    return next;
  }
  function restoreLabHeight() {
    try {
      const saved = Number(localStorage.getItem('fluxa-lab-height-v1'));
      if (Number.isFinite(saved) && saved > 0) applyLabHeight(saved);
    } catch (_) {}
  }
  function resetLabHeight() {
    dom.labDrawer.style.removeProperty('--lab-height');
    dom.labDrawer.classList.remove('user-sized');
    dom.labResizeHandle?.removeAttribute('aria-valuenow');
    try { localStorage.removeItem('fluxa-lab-height-v1'); } catch (_) {}
    updateLabDensity();
    renderCanvas();
  }
  function beginLabResize(event) {
    if (dom.labDrawer.classList.contains('collapsed')) return;
    event.preventDefault();
    const { minimum, maximum } = getLabResizeBounds();
    const height = dom.labDrawer.getBoundingClientRect().height;
    labResize = { pointerId: event.pointerId, startY: event.clientY, startHeight: height, height, minimum, maximum };
    dom.labDrawer.classList.add('is-resizing');
    document.body.classList.add('resizing-lab');
    try { dom.labResizeHandle.setPointerCapture(event.pointerId); } catch (_) {}
  }
  function moveLabResize(event) {
    if (!labResize || event.pointerId !== labResize.pointerId) return;
    const desired = labResize.startHeight + (labResize.startY - event.clientY);
    labResize.height = applyLabHeight(desired);
    renderCanvas();
  }
  function endLabResize(event) {
    if (!labResize || (event.pointerId != null && event.pointerId !== labResize.pointerId)) return;
    const height = labResize.height;
    try { dom.labResizeHandle.releasePointerCapture(labResize.pointerId); } catch (_) {}
    labResize = null;
    dom.labDrawer.classList.remove('is-resizing');
    document.body.classList.remove('resizing-lab');
    applyLabHeight(height, true);
    renderCanvas();
  }

  function runSimulation() {
    state.running = !state.running;
    if (state.running) {
      state.heatmap = true;
      if (liveTimer) clearInterval(liveTimer);
      liveTimer = setInterval(() => { if (state.running && state.labTab === 'scope') renderLab(); }, 260);
      showToast('Live simulation is running.');
    } else {
      clearInterval(liveTimer); liveTimer = null; showToast('Simulation paused.');
    }
    renderAll();
  }

  function openModal(content, onOpen) {
    dom.modal.className = 'modal';
    dom.modal.innerHTML = content;
    dom.modalBackdrop.classList.remove('hidden');
    if (typeof onOpen === 'function') onOpen(dom.modal);
  }
  function closeModal() { dom.modalBackdrop.classList.add('hidden'); dom.modal.className = 'modal'; dom.modal.innerHTML = ''; }
  function nearestE24(value) {
    if (!value || value <= 0) return value;
    const decade = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / decade;
    const e24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
    return e24.reduce((best, candidate) => Math.abs(candidate - normalized) < Math.abs(best - normalized) ? candidate : best, e24[0]) * decade;
  }
  function autoTuneCalculation(mode, target) {
    const source = simulation?.sourceVoltage || 9;
    const led = state.components.find(c => c.type === 'led');
    const vf = led ? Number(led.props.forwardVoltage || 2.1) : .7;
    if (mode === 'current') {
      const desiredA = target / 1000;
      const exact = Math.max(1, (source - vf) / desiredA);
      const preferred = nearestE24(exact);
      return { exact, preferred, title: `Set ${state.components.find(c => c.type === 'resistor')?.label || 'R1'} to ${formatResistance(preferred)}`, detail: `Exact DC calculation: ${formatResistance(exact)} for ${trimNumber(target, 2)} mA through a ${trimNumber(vf, 2)} V diode drop.` };
    }
    const loadCurrent = .01;
    const exact = Math.max(1, (source - target) / loadCurrent);
    const preferred = nearestE24(exact);
    return { exact, preferred, title: `Set series resistor to ${formatResistance(preferred)}`, detail: `Targets ${formatVoltage(target)} at an assumed ${formatCurrent(loadCurrent)} load from a ${formatVoltage(source)} source.` };
  }
  function openAutoTune() {
    const resistor = state.components.find(c => c.type === 'resistor');
    const hasResistor = Boolean(resistor);
    openModal(`<div class="modal-head"><div class="modal-head-icon">✦</div><div><h2>Auto-tune circuit</h2><p>Choose a target and Fluxa will calculate a practical E24 part value.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="modal-grid"><div class="modal-field"><label>Optimise for</label><select id="tuneMode"><option value="current">LED current</option><option value="voltage">Output voltage</option></select></div><div class="modal-field"><label id="tuneTargetLabel">Target current (mA)</label><input id="tuneTarget" type="number" min="0.1" step="0.1" value="15" /></div></div><div class="modal-note">Input detected: <b>${formatVoltage(simulation.sourceVoltage || 0)}</b> source${state.components.some(c => c.type === 'led') ? ` · LED forward model <b>${formatVoltage(state.components.find(c => c.type === 'led').props.forwardVoltage || 2.1)}</b>` : ''}. ${hasResistor ? `Fluxa will update <b>${escapeHTML(resistor.label)}</b>.` : 'Add a resistor to apply the result.'}</div><div class="tune-result" id="tuneResult"></div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Cancel</button><button class="button-primary" id="applyTune" ${hasResistor ? '' : 'disabled'}>Apply to circuit</button></div>`, modal => {
      const mode = $('#tuneMode', modal), target = $('#tuneTarget', modal), output = $('#tuneResult', modal), label = $('#tuneTargetLabel', modal);
      const refresh = () => { const calc = autoTuneCalculation(mode.value, Number(target.value || 0)); label.textContent = mode.value === 'current' ? 'Target current (mA)' : 'Target voltage (V)'; target.step = mode.value === 'current' ? '.1' : '.1'; output.innerHTML = `<div class="result-label">Recommended E24 value</div><b>${escapeHTML(calc.title)}</b><span>${escapeHTML(calc.detail)}</span>`; modal.dataset.tune = JSON.stringify(calc); };
      mode.addEventListener('change', () => { target.value = mode.value === 'current' ? '15' : '5'; refresh(); });
      target.addEventListener('input', refresh); refresh();
      $('#applyTune', modal)?.addEventListener('click', () => {
        const data = JSON.parse(modal.dataset.tune || '{}');
        const currentResistor = state.components.find(c => c.type === 'resistor');
        if (!currentResistor) return;
        currentResistor.props.resistance = data.preferred;
        currentResistor.props.value = formatResistance(data.preferred);
        recordHistory(); closeModal(); renderAll(); showToast(`${currentResistor.label} tuned to ${formatResistance(data.preferred)}.`);
      });
    });
  }
  function openShareModal() {
    const encoded = encodePayload(statePayload());
    const url = `${location.origin}${location.pathname}#circuit=${encoded}`;
    openModal(`<div class="modal-head"><div class="modal-head-icon">↗</div><div><h2>Share this circuit</h2><p>Anyone with this link can open an editable Fluxa copy.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="modal-field"><label>Private circuit link</label><div class="share-url"><input id="shareUrl" readonly value="${escapeHTML(url)}"/><button class="copy-button" id="copyShare">Copy</button></div></div><div class="share-preview"><div class="share-preview-icon">⌘</div><div><b>${escapeHTML(state.projectName)}</b><span>${state.components.length} parts · ${state.wires.length} wires · Datasheet models included</span></div></div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Done</button></div>`, modal => {
      $('#copyShare', modal).addEventListener('click', async () => { const input = $('#shareUrl', modal); try { await navigator.clipboard.writeText(input.value); } catch (_) { input.select(); document.execCommand('copy'); } showToast('Share link copied to your clipboard.'); $('#copyShare', modal).textContent = 'Copied'; });
    });
  }
  function openRenameModal() {
    openModal(`<div class="modal-head"><div class="modal-head-icon">✎</div><div><h2>Rename project</h2><p>Give this Fluxa circuit a memorable name.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="modal-field"><label>Project name</label><input id="renameInput" maxlength="48" value="${escapeHTML(state.projectName)}" /></div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Cancel</button><button class="button-primary" id="renameSave">Save name</button></div>`, modal => { const input = $('#renameInput', modal); setTimeout(() => { input.focus(); input.select(); }, 30); const save = () => { const value = input.value.trim(); if (value) { state.projectName = value; recordHistory(); renderAll(); } closeModal(); }; $('#renameSave', modal).addEventListener('click', save); input.addEventListener('keydown', event => { if (event.key === 'Enter') save(); }); });
  }
  function openAboutModal() {
    openModal(`<div class="about-hero"><div class="about-mark">F</div><div><div class="about-kicker">Circuit Studio</div><h2>Fluxa <span>v1.2</span></h2></div><button class="modal-close" data-modal-close aria-label="Close about dialog">×</button></div><div class="about-body"><p>Fluxa is a browser-based workspace for assembling and exploring electronic circuits.</p><a class="about-github" href="https://github.com/Arvanta/Fluxa" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.6-.2.6-.5v-1.8c-2.4.5-2.9-1-2.9-1-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.9.1 1.4 1 1.4 1 .8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-1.9-.2-3.9-.9-3.9-4.1 0-.9.3-1.6.9-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.5 1.1.2 1.9.1 2.1.6.6.9 1.3.9 2.2 0 3.2-2 3.9-3.9 4.1.3.3.6.8.6 1.6v2.4c0 .3.2.6.6.5A9.2 9.2 0 0 0 12 2.8Z"/></svg><span><b>github.com/Arvanta/Fluxa</b><small>Open the project repository</small></span><span class="about-external">↗</span></a></div><div class="modal-foot about-foot"><button class="button-secondary" data-modal-close>Close</button></div>`, modal => modal.classList.add('about-modal'));
  }
  function openLearnModal() {
    const cards = LESSONS.map(lesson => `<article class="lesson-card"><div class="lesson-card-top"><span class="lesson-card-icon">${escapeHTML(lesson.icon)}</span><span class="lesson-level">${escapeHTML(lesson.level)}</span></div><h3>${escapeHTML(lesson.title)}</h3><p>${escapeHTML(lesson.summary)}</p><div class="lesson-card-meta"><span>${lesson.steps.length} steps</span><span>${escapeHTML(lesson.duration)}</span></div><button data-lesson-action="start" data-lesson-id="${lesson.id}">Start guided build <span>→</span></button></article>`).join('');
    openModal(`<div class="modal-head"><div class="modal-head-icon">▣</div><div><h2>Learn circuits</h2><p>Choose a short guided build. Beginner hints will highlight the next useful part or connection.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="learn-modal-body"><div class="learn-intro"><b>Build at your pace.</b> Each lesson starts with an empty workspace and checks your progress as you add parts, wire them and run the circuit.</div><div class="lesson-card-grid">${cards}</div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Close</button></div>`, modal => {
      modal.classList.add('learn-modal');
      modal.addEventListener('click', event => {
        const button = event.target.closest('[data-lesson-action="start"]');
        if (!button) return;
        const lesson = getLesson(button.dataset.lessonId);
        if (!lesson) return;
        closeModal();
        openLessonConfirmation(lesson);
      });
    });
  }
  function openLessonConfirmation(lesson) {
    openModal(`<div class="modal-head"><div class="modal-head-icon">${escapeHTML(lesson.icon)}</div><div><h2>Start ${escapeHTML(lesson.title)}?</h2><p>This guided build starts with an empty workspace and replaces the current circuit.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="modal-note"><b>What you will learn:</b><br>${escapeHTML(lesson.summary)}<br><br>${lesson.steps.length} guided steps · ${escapeHTML(lesson.duration)} · ${escapeHTML(lesson.level)}</div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Cancel</button><button class="button-primary" id="confirmLessonStart">Start lesson</button></div>`, modal => {
      $('#confirmLessonStart', modal).addEventListener('click', () => { closeModal(); startGuidedLesson(lesson); });
    });
  }
  function startGuidedLesson(lesson) {
    if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
    const theme = state.theme;
    state = initialState();
    state.theme = theme;
    state.projectName = lesson.title;
    state.components = [];
    state.wires = [];
    state.running = false;
    state.view = 'schematic';
    state.rightTab = 'properties';
    state.tool = 'select';
    activeLessonId = lesson.id;
    lessonStepIndex = 0;
    beginnerMode = true;
    lessonHintVisible = false;
    lessonCompletionAnnounced = false;
    selectedCategory = 'all';
    dom.partSearch.value = '';
    $$('#libraryTabs [data-category]').forEach(tab => tab.classList.toggle('active', tab.dataset.category === 'all'));
    wireStart = null;
    wirePointer = null;
    viewBox = { x: 0, y: 0, w: 1200, h: 690 };
    try { window.history.replaceState(null, '', `${location.pathname}${location.search}`); } catch (_) {}
    history = []; historyIndex = -1;
    recordHistory();
    renderAll();
    showToast(`Lesson started: ${lesson.title}.`);
  }
  function exitGuidedLesson() {
    activeLessonId = null;
    lessonStepIndex = 0;
    lessonHintVisible = false;
    lessonCompletionAnnounced = false;
    renderAll();
    showToast('Guided lesson closed. Your circuit remains on the canvas.');
  }
  function openShortcutsModal() {
    openModal(`<div class="modal-head"><div class="modal-head-icon">⌘</div><div><h2>Keyboard shortcuts</h2><p>Stay in the flow while building your circuit.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="shortcut-list"><span>Select, move and wire</span><kbd>V / W</kbd><span>Start a wire</span><kbd>Drag a terminal</kbd><span>Toggle Quick Measure panel</span><kbd>Q</kbd><span>Measurement probe</span><kbd>M</kbd><span>Undo / redo</span><kbd>⌘ Z / ⇧⌘ Z</kbd><span>Delete selected part</span><kbd>Delete</kbd><span>Search library</span><kbd>⌘ K</kbd><span>Cancel active wire</span><kbd>Esc</kbd></div></div><div class="modal-foot"><button class="button-primary" data-modal-close>Got it</button></div>`);
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i>${type === 'success' ? '✓' : type === 'warn' ? '!' : '×'}</i><span>${escapeHTML(message)}</span>`;
    dom.toastRegion.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(4px)'; toast.style.transition = 'opacity .2s, transform .2s'; setTimeout(() => toast.remove(), 220); }, 2800);
  }

  const EXPORT_FALLBACK_CSS = `
    svg{display:block}.circuit-canvas{background:#091422}.wire{fill:none;stroke:#7190ae;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.wire.active{stroke:#67d8c4}.wire.warn{stroke:#e5aa60}.junction{fill:#90d8ce;stroke:#0d2630;stroke-width:2}.part-stroke{fill:none;stroke:#b9cadf;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}.part-pin{fill:none;stroke:#6e819b;stroke-width:2.2;stroke-linecap:round}.part-fill{fill:#17243b;stroke:#b9cadf;stroke-width:2}.part-accent{fill:none;stroke:#73dfc6;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.part-gold{fill:#d6a758;stroke:#e3c079;stroke-width:1.3}.part-ic{fill:#1b273c;stroke:#af9eff;stroke-width:1.8}.part-label{fill:#dce7f5;font:700 11px sans-serif;text-anchor:middle;paint-order:stroke;stroke:#0b1422;stroke-width:3.3px}.part-value{fill:#7e91ad;font:9px sans-serif;text-anchor:middle;paint-order:stroke;stroke:#0b1422;stroke-width:3px}.pin-label{fill:#6f859f;font:7.5px sans-serif;text-anchor:middle}.terminal{fill:#15253b;stroke:#869bb8;stroke-width:1.45}.terminal-hit,.component-hitbox,.selection-box,.probe-marker,.wire-hit,.thermal-halo{display:none}.ic-name{fill:#e6e0ff;font:700 14px sans-serif;text-anchor:middle}.ic-sub{fill:#a59cb8;font:7px sans-serif;text-anchor:middle}.breadboard-view .part-stroke{stroke:#495d70}.breadboard-view .part-pin{stroke:#a26c43}.breadboard-view .part-label{fill:#1b2e45;stroke:none;paint-order:normal}.breadboard-view .part-value{fill:#384b62;stroke:none;paint-order:normal}.breadboard-view .wire{stroke-width:4.2;stroke:#e36559}.breadboard-view .wire:nth-child(3n+2){stroke:#459bd8}.breadboard-view .junction{fill:#6f2dbd;stroke:#fff9ee;stroke-width:2.4}.bread-source{fill:#4c5a68;stroke:#222c35;stroke-width:2}.bread-screen{fill:#8de8cf;stroke:#273842;stroke-width:1.5}.bread-screen-line{fill:none;stroke:#334b51;stroke-width:2}.bread-resistor{fill:#c79a63;stroke:#694a31;stroke-width:1.6}.bread-band{fill:#354353}.bread-band.red{fill:#d55f50}.bread-band.gold{fill:#e2c168}.bread-cap{fill:#486a80;stroke:#213442;stroke-width:1.4}.bread-cap-top{fill:#7595a7;stroke:#213442;stroke-width:1.2}.bread-mark{fill:none;stroke:#eef4f7;stroke-width:1.4}.bread-coil{fill:none;stroke:#d0a76c;stroke-width:7}.bread-transformer{fill:#303a44;stroke:#141b23;stroke-width:2}.bread-transformer-line{fill:none;stroke:#c5a16e;stroke-width:3}.bread-pot{fill:#b5b9b8;stroke:#414b51;stroke-width:2}.bread-pot-shaft{fill:#535f68;stroke:#1e2930;stroke-width:1.4}.bread-switch{fill:#303c49;stroke:#17212a;stroke-width:1.8}.bread-switch-lever{fill:#c7d3d7;stroke:#4a5961;stroke-width:1.5}.bread-diode{fill:#242c35;stroke:#10161c;stroke-width:1.5}.bread-band.silver{fill:#d8d9d5}.bread-led{fill:#42d98b;stroke:#0b6044;stroke-width:1.4}.bread-led-base{fill:#255943;stroke:#102a21;stroke-width:1.2}.bread-led-glint{fill:none;stroke:#b7ffe6;stroke-width:2}.bread-transistor{fill:#252e38;stroke:#10161c;stroke-width:1.7}.bread-transistor-line{fill:none;stroke:#687584;stroke-width:1.5}.bread-chip{fill:#242d38;stroke:#111820;stroke-width:2}.bread-chip-notch{fill:#111820;stroke:#111820}.bread-chip-text{fill:#cdd8d8;font:700 9px sans-serif;text-anchor:middle}
  `;
  function collectExportStyles() {
    const rules = [];
    for (const sheet of [...document.styleSheets]) {
      try { rules.push([...sheet.cssRules].map(rule => rule.cssText).join('\n')); } catch (_) { /* Cross-origin styles are optional for export. */ }
    }
    const css = rules.join('\n');
    // In a standalone SVG, there is no HTML body. Duplicate the light-theme
    // selectors with an SVG-friendly wrapper selector when needed.
    const svgLightCss = state.theme === 'light' ? css.replace(/body\.light-theme/g, '.light-theme') : '';
    return `${css}\n${svgLightCss}\n${EXPORT_FALLBACK_CSS}`;
  }
  function prepareExportSvg() {
    const cloneSvg = dom.canvas.cloneNode(true);
    cloneSvg.setAttribute('xmlns', svgNS);
    cloneSvg.setAttribute('width', '1200');
    cloneSvg.setAttribute('height', '690');
    cloneSvg.classList.remove('wire-mode');
    cloneSvg.querySelector('#interactionLayer')?.remove();
    cloneSvg.querySelector('#annotationLayer')?.remove();
    cloneSvg.querySelectorAll('.component.selected').forEach(element => element.classList.remove('selected'));
    cloneSvg.querySelectorAll('.wire.selected').forEach(element => element.classList.remove('selected'));
    cloneSvg.querySelectorAll('.wire-hit, .component-hitbox, .terminal-hit, .selection-box, .probe-marker').forEach(element => element.remove());
    if (state.theme === 'light') {
      const canvasClasses = cloneSvg.getAttribute('class') || 'circuit-canvas';
      const themeWrapper = document.createElementNS(svgNS, 'g');
      themeWrapper.setAttribute('class', 'light-theme');
      const canvasWrapper = document.createElementNS(svgNS, 'g');
      canvasWrapper.setAttribute('class', canvasClasses);
      [...cloneSvg.childNodes].filter(node => node.nodeType === 1 && node.tagName.toLowerCase() !== 'defs' && node.tagName.toLowerCase() !== 'style').forEach(node => canvasWrapper.appendChild(node));
      themeWrapper.appendChild(canvasWrapper);
      cloneSvg.appendChild(themeWrapper);
    }
    const style = document.createElementNS(svgNS, 'style');
    style.textContent = collectExportStyles();
    cloneSvg.insertBefore(style, cloneSvg.firstChild);
    return cloneSvg;
  }
  function exportSVG() {
    const cloneSvg = prepareExportSvg();
    const markup = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(cloneSvg)}`;
    downloadBlob(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), `${fileName()}.svg`);
    showToast(`${state.view === 'breadboard' ? 'Breadboard' : 'Schematic'} SVG exported.`);
  }
  function exportPNG() {
    const cloneSvg = prepareExportSvg();
    const markup = new XMLSerializer().serializeToString(cloneSvg);
    const image = new Image();
    const objectUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1380;
      const context = canvas.getContext('2d');
      context.scale(2, 2);
      context.drawImage(image, 0, 0, 1200, 690);
      canvas.toBlob(blob => {
        if (blob) downloadBlob(blob, `${fileName()}.png`);
        URL.revokeObjectURL(objectUrl);
        showToast(`${state.view === 'breadboard' ? 'Breadboard' : 'Schematic'} PNG exported at 2×.`);
      }, 'image/png');
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); showToast('PNG export could not be created.', 'error'); };
    image.src = objectUrl;
  }
  function exportJSON() {
    downloadBlob(new Blob([JSON.stringify(statePayload(), null, 2)], { type: 'application/json' }), `${fileName()}.fluxa.json`);
    showToast('Fluxa circuit file downloaded.');
  }
  function validateImportedCircuit(payload) {
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.components) || !Array.isArray(payload.wires)) return false;
    return payload.components.every(component => component && typeof component.id === 'string' && typeof component.type === 'string' && Number.isFinite(Number(component.x)) && Number.isFinite(Number(component.y)));
  }
  function importCircuitPayload(payload, fileNameLabel = 'circuit') {
    if (!validateImportedCircuit(payload)) { showToast('That file is not a valid Fluxa circuit JSON file.', 'error'); return; }
    openModal(`<div class="modal-head"><div class="modal-head-icon">⇩</div><div><h2>Import circuit?</h2><p>Importing <b>${escapeHTML(fileNameLabel)}</b> replaces the current workspace. Export your current circuit first if you need a copy.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="modal-note">The imported file contains <b>${payload.components.length}</b> parts and <b>${payload.wires.length}</b> wires.</div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Cancel</button><button class="button-primary" id="confirmImport">Import circuit</button></div>`, modal => {
      $('#confirmImport', modal).addEventListener('click', () => {
        if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
        applyPayload(payload);
        state.running = false;
        state.tool = 'select';
        state.rightTab = 'properties';
        activeLessonId = null;
        lessonStepIndex = 0;
        lessonHintVisible = false;
        viewBox = { x: 0, y: 0, w: 1200, h: 690 };
        try { window.history.replaceState(null, '', `${location.pathname}${location.search}`); } catch (_) {}
        history = []; historyIndex = -1;
        recordHistory();
        closeModal();
        renderAll();
        showToast('Circuit imported successfully.');
      });
    });
  }
  async function readImportFile(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      importCircuitPayload(payload, file.name);
    } catch (_) { showToast('The selected file could not be read as JSON.', 'error'); }
  }

  function fileName() { return state.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'fluxa-circuit'; }
  function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  function resetCircuit() {
    const theme = state.theme;
    state = initialState();
    state.theme = theme;
    activeLessonId = null;
    lessonStepIndex = 0;
    lessonHintVisible = false;
    viewBox = { x: 0, y: 0, w: 1200, h: 690 };
    history = []; historyIndex = -1; recordHistory(); renderAll(); showToast('LED example restored.');
  }
  function createNewProject() {
    if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
    const theme = state.theme;
    state = initialState();
    state.theme = theme;
    activeLessonId = null;
    lessonStepIndex = 0;
    lessonHintVisible = false;
    state.projectName = 'Untitled circuit';
    state.components = [];
    state.wires = [];
    state.running = false;
    state.tool = 'select';
    state.selectedId = null;
    state.selectedWireId = null;
    state.probeTerminals = [];
    state.rightTab = 'properties';
    selectedCategory = 'all';
    dom.partSearch.value = '';
    $$('#libraryTabs [data-category]').forEach(tab => tab.classList.toggle('active', tab.dataset.category === 'all'));
    wireStart = null;
    wirePointer = null;
    viewBox = { x: 0, y: 0, w: 1200, h: 690 };
    try { window.history.replaceState(null, '', `${location.pathname}${location.search}`); } catch (_) {}
    try { localStorage.removeItem('fluxa-circuit-v1'); } catch (_) {}
    history = []; historyIndex = -1;
    recordHistory();
    renderAll();
    showToast('New empty project created.');
  }
  function openNewProjectModal() {
    openModal(`<div class="modal-head"><div class="modal-head-icon">＋</div><div><h2>Create a new project?</h2><p>This replaces <b>${escapeHTML(state.projectName)}</b> in the current workspace and starts with an empty circuit.</p></div><button class="modal-close" data-modal-close>×</button></div><div class="modal-body"><div class="modal-note">Your current circuit is saved only in this browser. Export a Fluxa JSON file first if you want to keep a separate copy.</div></div><div class="modal-foot"><button class="button-secondary" data-modal-close>Cancel</button><button class="button-danger" id="confirmNewProject">Delete and create new</button></div>`, modal => {
      $('#confirmNewProject', modal).addEventListener('click', () => { closeModal(); createNewProject(); });
    });
  }

  function updateSelectedPropertyField(element) {
    const selected = getComponent(state.selectedId);
    const field = element?.dataset?.componentField;
    if (!selected || !field) return null;
    const value = element.value;
    if (field === 'label') selected.label = value || selected.label;
    else {
      const numericFields = ['voltage', 'frequency', 'resistance', 'rating', 'forwardVoltage', 'maxCurrent', 'reverseVoltage', 'zenerVoltage', 'powerRating', 'hfe', 'vceo', 'rds', 'gain'];
      selected.props[field] = numericFields.includes(field) ? parseNumber(value, selected.props[field]) : value;
      if (field === 'value') selected.props.value = value;
      if (field === 'resistance') selected.props.value = formatResistance(selected.props[field]);
    }
    return selected;
  }
  function commitPendingPropertyChange() {
    if (!pendingPropertyChange) return false;
    pendingPropertyChange = false;
    recordHistory();
    return true;
  }

  // --- Event bindings ------------------------------------------------------
  function bindEvents() {
    $('#libraryTabs').addEventListener('click', event => {
      const button = event.target.closest('[data-category]'); if (!button) return;
      selectedCategory = button.dataset.category;
      $$('#libraryTabs [data-category]').forEach(tab => tab.classList.toggle('active', tab === button));
      renderLibrary();
    });
    dom.partSearch.addEventListener('input', renderLibrary);
    dom.componentList.addEventListener('click', event => {
      const add = event.target.closest('[data-add-type]');
      const item = event.target.closest('[data-part-type]');
      const type = add?.dataset.addType || item?.dataset.partType;
      if (!type) return;
      const centerX = snapCoordinate(viewBox.x + viewBox.w / 2);
      const centerY = snapCoordinate(viewBox.y + viewBox.h / 2);
      addComponent(type, centerX, centerY);
    });
    dom.componentList.addEventListener('dragstart', event => {
      const item = event.target.closest('[data-part-type]'); if (!item) return;
      event.dataTransfer.setData('text/fluxa-part', item.dataset.partType); event.dataTransfer.effectAllowed = 'copy';
    });
    dom.canvasWrap.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; });
    dom.canvasWrap.addEventListener('drop', event => { event.preventDefault(); const type = event.dataTransfer.getData('text/fluxa-part'); if (!type) return; const point = toSvgPoint(event); addComponent(type, snapCoordinate(point.x), snapCoordinate(point.y)); });

    $$('.tool-button[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
    $$('.view-switch button').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; recordHistory(); renderAll(); showToast(`${state.view === 'breadboard' ? 'Breadboard' : 'Schematic'} view enabled.`); }));
    dom.boardTextureToggle.addEventListener('change', event => { state.breadboardTexture = event.target.checked; recordHistory(); renderAll(); });
    dom.quickMeasureToggle.addEventListener('change', event => { state.quickMeasureVisible = event.target.checked; renderAll(); });
    dom.wiringToggle.addEventListener('change', event => {
      state.wiringEnabled = event.target.checked;
      if (!state.wiringEnabled) { wireStart = null; wirePointer = null; autoConnectPreview = []; }
      renderAll();
    });
    $('#deleteToolBtn').addEventListener('click', deleteSelected);
    $('#centerViewBtn').addEventListener('click', centerCircuitView);
    $('#zoomInBtn').addEventListener('click', () => zoomBy(.82));
    $('#zoomOutBtn').addEventListener('click', () => zoomBy(1.22));
    dom.thermalBtn.addEventListener('click', () => { state.heatmap = !state.heatmap; recordHistory(); renderAll(); showToast(state.heatmap ? 'Thermal heatmap enabled.' : 'Thermal heatmap hidden.'); });
    dom.snapBtn.addEventListener('click', () => { state.snap = !state.snap; recordHistory(); renderAll(); });
    $('#collapseLabBtn').addEventListener('click', () => { dom.labDrawer.classList.toggle('collapsed'); updateLabCollapseControl(); renderLab(); renderCanvas(); });
    dom.labResizeHandle.addEventListener('pointerdown', beginLabResize);
    dom.labResizeHandle.addEventListener('pointermove', moveLabResize);
    dom.labResizeHandle.addEventListener('pointerup', endLabResize);
    dom.labResizeHandle.addEventListener('pointercancel', endLabResize);
    dom.labResizeHandle.addEventListener('dblclick', () => { resetLabHeight(); });
    dom.labResizeHandle.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') { resetLabHeight(); return; }
      const change = event.key === 'ArrowUp' ? 16 : -16;
      applyLabHeight(dom.labDrawer.getBoundingClientRect().height + change, true);
      renderCanvas();
    });
    window.addEventListener('resize', () => {
      if (dom.labDrawer.classList.contains('user-sized') && !dom.labDrawer.classList.contains('collapsed')) applyLabHeight(dom.labDrawer.getBoundingClientRect().height);
      updateLabDensity();
      renderCanvas();
    });
    $('#addChannelBtn').addEventListener('click', () => { state.rightTab = 'measurements'; renderAll(); showToast('CH3 is ready to attach from the Measurements panel.'); });
    $$('.lab-tabs button').forEach(button => button.addEventListener('click', () => { state.labTab = button.dataset.labtab; renderAll(); }));
    $$('.inspector-tabs button').forEach(button => button.addEventListener('click', () => { state.rightTab = button.dataset.righttab; renderAll(); }));
    dom.undoBtn.addEventListener('click', undo); dom.redoBtn.addEventListener('click', redo);
    dom.simulateBtn.addEventListener('click', runSimulation);
    $('#aiTopBtn').addEventListener('click', () => { state.rightTab = 'assistant'; renderAll(); });
    $('#shareBtn').addEventListener('click', openShareModal);
    dom.newProjectBtn.addEventListener('click', openNewProjectModal);
    dom.learnBtn.addEventListener('click', openLearnModal);
    dom.lessonDock.addEventListener('click', event => {
      const action = event.target.closest('[data-lesson-dock-action]')?.dataset.lessonDockAction;
      if (!action) return;
      if (action === 'exit') exitGuidedLesson();
      else if (action === 'hint') { lessonHintVisible = !lessonHintVisible; renderLessonDock(); }
      else if (action === 'lessons') openLearnModal();
    });
    dom.lessonDock.addEventListener('change', event => {
      if (event.target.matches('[data-lesson-dock-action="beginner"]')) { beginnerMode = event.target.checked; renderAll(); }
    });
    dom.themeToggleBtn.addEventListener('click', toggleTheme);
    dom.aboutBtn.addEventListener('click', openAboutModal);
    $('#projectTitleBtn').addEventListener('click', openRenameModal);
    $('#showShortcutsBtn').addEventListener('click', openShortcutsModal);
    $('#libraryMoreBtn').addEventListener('click', () => showToast('All catalog models are available in this local library.'));

    $('#exportBtn').addEventListener('click', event => { const rect = event.currentTarget.getBoundingClientRect(); dom.exportMenu.style.top = `${rect.bottom + 7}px`; dom.exportMenu.style.right = `${window.innerWidth - rect.right}px`; dom.exportMenu.classList.toggle('hidden'); });
    dom.exportMenu.addEventListener('click', event => {
      const button = event.target.closest('[data-export]');
      if (!button) return;
      dom.exportMenu.classList.add('hidden');
      if (button.dataset.export === 'png') exportPNG();
      else if (button.dataset.export === 'svg') exportSVG();
      else if (button.dataset.export === 'json') exportJSON();
      else if (button.dataset.export === 'import') dom.jsonImportInput.click();
    });
    dom.jsonImportInput.addEventListener('change', event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      readImportFile(file);
    });
    dom.selectionQuickActions.addEventListener('click', event => {
      const action = event.target.closest('[data-quick-action]')?.dataset.quickAction;
      if (!action) return;
      event.stopPropagation();
      if (action === 'rotate') rotateSelectedComponent();
      else if (action === 'duplicate') duplicateSelectedComponent();
      else if (action === 'rewire') rewireSelectedWire();
      else if (action === 'delete') deleteSelected();
    });
    dom.quickMeasurePanel.addEventListener('click', event => {
      if (event.target.closest('[data-quick-measure-action="clear"]')) {
        quickMeasureTarget = null;
        renderQuickMeasurePanel();
      }
    });

    dom.canvas.addEventListener('pointerdown', event => {
      commitPendingPropertyChange();
      const terminalPoint = terminalPointFromElement(event.target);
      if (terminalPoint) {
        event.preventDefault();
        event.stopPropagation();
        handleTerminalClick(terminalPoint);
        return;
      }
      const wireElement = event.target.closest?.('[data-wire-id]');
      if (wireElement) {
        event.preventDefault();
        if (state.tool === 'select') {
          selectWire(wireElement.dataset.wireId);
          showToast('Wire selected. Press Delete to remove it, or use Reconnect in Properties.');
        } else {
          setQuickMeasureTarget({ kind: 'wire', wireId: wireElement.dataset.wireId });
        }
        return;
      }
      const componentElement = event.target.closest?.('[data-comp-id]');
      if (componentElement) {
        const id = componentElement.dataset.compId;
        if (state.tool === 'select') {
          if (wireStart) {
            wireStart = null;
            wirePointer = null;
            renderAll();
            showToast('Wire cancelled. Start again from a terminal.', 'warn');
            return;
          }
          const component = getComponent(id); const point = toSvgPoint(event);
          state.selectedId = id; state.selectedWireId = null; state.rightTab = 'properties';
          quickMeasureTarget = { kind: 'component', compId: id };
          dragState = { id, pointerId: event.pointerId, offsetX: point.x - component.x, offsetY: point.y - component.y, moved: false };
          dom.canvas.setPointerCapture?.(event.pointerId);
          renderAll();
        } else if (state.tool === 'probe') selectComponent(id);
        return;
      }
      if (state.tool === 'select') {
        if (wireStart) {
          wireStart = null;
          wirePointer = null;
          renderAll();
          showToast('Wire cancelled.', 'warn');
          return;
        }
        const ctm = dom.canvas.getScreenCTM?.();
        const rect = dom.canvas.getBoundingClientRect();
        const scaleX = ctm?.a ? 1 / ctm.a : viewBox.w / Math.max(1, rect.width);
        const scaleY = ctm?.d ? 1 / ctm.d : viewBox.h / Math.max(1, rect.height);
        state.selectedId = null;
        state.selectedWireId = null;
        quickMeasureTarget = null;
        panState = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, viewX: viewBox.x, viewY: viewBox.y, scaleX, scaleY, moved: false };
        dom.canvas.setPointerCapture?.(event.pointerId);
        renderAll();
      } else if (state.quickMeasureVisible) {
        quickMeasureTarget = null;
        renderQuickMeasurePanel();
      }
    });
    dom.canvas.addEventListener('pointermove', event => {
      if (dragState) {
        const component = getComponent(dragState.id); if (!component) return;
        const point = toSvgPoint(event);
        component.x = snapCoordinate(point.x - dragState.offsetX); component.y = snapCoordinate(point.y - dragState.offsetY);
        autoConnectPreview = findNearbyPinPairs(component);
        dragState.moved = true; renderCanvas();
      } else if (panState) {
        const deltaX = (event.clientX - panState.clientX) * panState.scaleX;
        const deltaY = (event.clientY - panState.clientY) * panState.scaleY;
        viewBox.x = panState.viewX - deltaX;
        viewBox.y = panState.viewY - deltaY;
        panState.moved = Math.abs(deltaX) > .25 || Math.abs(deltaY) > .25;
        dom.canvas.classList.add('panning');
        schedulePanRender();
      } else if (wireStart) { wirePointer = toSvgPoint(event); renderCanvas(); }
    });
    const endPointer = event => {
      if (dragState) {
        const moved = dragState.moved;
        const component = getComponent(dragState.id);
        dragState = null;
        try { dom.canvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
        if (moved) {
          const autoConnections = component ? autoConnectNearbyPins(component, autoConnectPreview) : 0;
          autoConnectPreview = [];
          recordHistory();
          renderAll();
          if (autoConnections) showToast(`${autoConnections} nearby terminal${autoConnections === 1 ? '' : 's'} auto-connected.`);
        } else {
          autoConnectPreview = [];
        }
        return;
      }
      if (panState) {
        panState = null;
        if (panFrame !== null) { cancelAnimationFrame(panFrame); panFrame = null; }
        dom.canvas.classList.remove('panning');
        try { dom.canvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
        renderCanvas();
        return;
      }
      // Supports natural drag-to-wire in addition to the existing click-two-terminals workflow.
      if (event.type === 'pointerup' && state.tool === 'select' && wireStart) {
        const target = terminalPointAtClient(event.clientX, event.clientY);
        if (target && pinKey(target) !== pinKey(wireStart)) completeWire(target);
      }
    };
    dom.canvas.addEventListener('pointerup', endPointer); dom.canvas.addEventListener('pointercancel', endPointer);
    dom.canvas.addEventListener('wheel', event => { event.preventDefault(); const factor = event.deltaY < 0 ? .9 : 1.11; const point = toSvgPoint(event); const newW = Math.max(550, Math.min(1800, viewBox.w * factor)); const newH = newW * 690 / 1200; const rx = (point.x - viewBox.x) / viewBox.w; const ry = (point.y - viewBox.y) / viewBox.h; setViewBox({ x: point.x - rx * newW, y: point.y - ry * newH, w: newW, h: newH }); }, { passive: false });

    dom.inspectorContent.addEventListener('input', event => {
      const selected = updateSelectedPropertyField(event.target);
      if (selected) pendingPropertyChange = true;
    });
    dom.inspectorContent.addEventListener('change', event => {
      const selected = getComponent(state.selectedId);
      if (!selected) return;
      if (event.target.id === 'componentModel') {
        const model = event.target.value;
        selected.model = model;
        const data = MODEL_DATA[model];
        if (data) { Object.assign(selected.props, clone(data.params)); if (data.params.value) selected.props.value = data.params.value; }
        pendingPropertyChange = false;
        recordHistory();
        renderAll();
        showToast(`${model} parameters applied.`);
        return;
      }
      const updated = updateSelectedPropertyField(event.target);
      if (updated) {
        pendingPropertyChange = false;
        recordHistory();
        renderAll();
        showToast(`${updated.label} updated.`);
      }
    });
    dom.inspectorContent.addEventListener('click', event => {
      const meter = event.target.closest('[data-meter]'); if (meter) { state.meterMode = meter.dataset.meter; renderInspector(); return; }
      const action = event.target.closest('[data-action]')?.dataset.action; if (!action) return;
      if (action === 'delete' || action === 'delete-wire') deleteSelected();
      else if (action === 'rewire') rewireSelectedWire();
      else if (action === 'rotate') rotateSelectedComponent();
      else if (action === 'autotune') openAutoTune();
      else if (action === 'fit') fitView();
      else if (action === 'reset') resetCircuit();
      else if (action === 'activate-probe') setTool('probe');
      else if (action === 'scope') { state.labTab = 'scope'; dom.labDrawer.classList.remove('collapsed'); renderAll(); }
      else if (action === 'heatmap') { state.heatmap = !state.heatmap; recordHistory(); renderAll(); }
    });

    dom.modalBackdrop.addEventListener('click', event => { if (event.target === dom.modalBackdrop || event.target.closest('[data-modal-close]')) closeModal(); });
    document.addEventListener('pointerdown', event => {
      if (pendingPropertyChange && !dom.inspectorContent.contains(event.target)) commitPendingPropertyChange();
      if (!dom.exportMenu.contains(event.target) && !event.target.closest('#exportBtn')) dom.exportMenu.classList.add('hidden');
    });
    document.addEventListener('keydown', event => {
      const tag = document.activeElement?.tagName;
      const editing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); dom.partSearch.focus(); return; }
      if (editing) return;
      if (event.key.toLowerCase() === 'w') { event.preventDefault(); setTool('select'); }
      else if (event.key.toLowerCase() === 'v') setTool('select');
      else if (event.key.toLowerCase() === 'q') { state.quickMeasureVisible = !state.quickMeasureVisible; renderAll(); }
      else if (event.key.toLowerCase() === 'm') setTool('probe');
      else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); }
      else if (event.key === 'Escape') { wireStart = null; wirePointer = null; panState = null; if (panFrame !== null) { cancelAnimationFrame(panFrame); panFrame = null; } dom.canvas.classList.remove('panning'); state.tool = 'select'; closeModal(); renderAll(); }
      else if (event.key === '+') zoomBy(.82);
      else if (event.key === '-') zoomBy(1.22);
    });
  }

  function init() {
    restoreTheme();
    const loaded = loadSharedCircuit();
    if (!loaded) {
      try {
        const raw = localStorage.getItem('fluxa-circuit-v1');
        if (raw) { const payload = JSON.parse(raw); if (payload?.components?.length) applyPayload(payload); }
      } catch (_) {}
    }
    recordHistory();
    initKonvaMinimap();
    bindEvents();
    restoreLabHeight();
    renderAll();
  }

  init();
})();
