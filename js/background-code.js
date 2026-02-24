(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SNIPPETS = [
    // Swift
    'var isPlaying: Bool {\n  audioClient.isPlaying\n}\n',
    'struct RecordingView: View {\n  @EnvironmentObject var appState: AppState\n  @StateObject private var viewModel: RecordingViewModel\n}\n',
    'func availableInputDevices() -> [AudioDevice] {\n  #if os(macOS)\n  return enumerateMacOSDevices()\n  #else\n  return enumerateIOSDevices()\n  #endif\n}\n',
    'func record() async {\n  try await engine.start()\n}\n',
    'var outputVolume: Float {\n  get {\n    engine.mainMixerNode.outputVolume\n  }\n  set {\n    engine.mainMixerNode.outputVolume = newValue\n  }\n}\n',
    'public func resetEngine() throws {\n  try engine.reset()\n}\n',
    'func configureAudioSession() throws {\n  let session = AVAudioSession.sharedInstance()\n  try session.setCategory(.playAndRecord, mode: .default)\n}\n',
    // Strudel
    'n(pick(pickL, "<0@8 1@8 2@4 3@4>"))\n.delay("<0@16 0.1@2 0.2 0.4 0.6 0.7 0.8 0.9>")',
    'n("<0!7 <-1 -3>>".fast(4).sub(7))\n.scale(scale)\n.m(2)',
    's("bd:4")\n.euclid("3,5",8)',
    's("track-dub:2")\n.scrub("<0@1.5 0.25@0.5 0.75@0.5 ~@0.5 0>")\n.seg(8)\n.clip(0.7)',
    'n("0 5 7 8".add(irand(8)))\n.s("piano")\n.scale(scale).layer(\n  x => x.gain(0.7),\n  x => x.delay(0.3).delayfb(sine.range(0.1, 0.7).slow(2)).gain(0.3),\n  x => x.speed(0.5).room(0.1).gain(0.1).seg(4).clip(.3),\n  x => x.dist(1).dist("diode").gain(.3).seg(8).clip(0.3),\n  x => x.trans(12).room(sine.range(0.3, 0.7)).mask("[0 1] [1 0]").slow(4)\n)',
    '$: s("white")\n.clip(sine.range(0.1, 0.7).slow(2))\n.replicate(2)\n.gain(0.3)\n.room(.6)\n.o(3)',
    '$: n("0 4 7 2").slow(4)\n.s("supersaw")\n.seg(8)\n.clip(.3)\n.scale(scale)\n.trans(-12)\n.o(3)',
  ];

  var CONFIG = {
    FONT_SIZE_MIN: 10,
    FONT_SIZE_MAX: 13,
    OPACITY_MIN: 0.09,
    OPACITY_MAX: 0.18,
    FONT_FAMILY: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace",
    COLOR: '255, 255, 255',
    LINE_HEIGHT: 1.45,
    RADIUS_MIN: 24,   // px — orbit radius around home (kept small)
    RADIUS_MAX: 64,
    SPEED_MIN: 0.0006,
    SPEED_MAX: 0.001,
  };

  // One fixed home per snippet — distributed across the full viewport.
  // shape: 0=circle, 3=triangle, 4=square, 5=pentagon, 6=hexagon
  var HOMES = [
    { fx: 0.06, fy: 0.10, shape: 0 },  //  0  var isPlaying
    { fx: 0.36, fy: 0.08, shape: 3 },  //  1  struct RecordingView
    { fx: 0.64, fy: 0.13, shape: 4 },  //  2  availableInputDevices
    { fx: 0.90, fy: 0.09, shape: 5 },  //  3  func record
    { fx: 0.14, fy: 0.37, shape: 6 },  //  4  outputVolume
    { fx: 0.50, fy: 0.34, shape: 0 },  //  5  resetEngine
    { fx: 0.82, fy: 0.38, shape: 3 },  //  6  configureAudioSession
    { fx: 0.04, fy: 0.62, shape: 4 },  //  7  n(pick…)
    { fx: 0.34, fy: 0.60, shape: 5 },  //  8  n("<0!7…")
    { fx: 0.64, fy: 0.65, shape: 6 },  //  9  s("bd:4")
    { fx: 0.92, fy: 0.61, shape: 0 },  // 10  s("track-dub")
    { fx: 0.18, fy: 0.86, shape: 3 },  // 11  n("0 5 7 8"…)
    { fx: 0.52, fy: 0.88, shape: 4 },  // 12  $: s("white")
    { fx: 0.82, fy: 0.84, shape: 5 },  // 13  $: n("0 4 7 2")
  ];

  // Mobile: 3 left + 3 right edge columns.
  // fx kept ≥ 0.08 on left so the orbit radius never pushes snippets off-screen.
  var HOMES_MOBILE = [
    { fx: 0.08, fy: 0.18, shape: 0 },
    { fx: 0.08, fy: 0.52, shape: 3 },
    { fx: 0.08, fy: 0.82, shape: 4 },
    { fx: 0.67, fy: 0.25, shape: 5 },
    { fx: 0.63, fy: 0.60, shape: 6 },
    { fx: 0.60, fy: 0.88, shape: 0 },
  ];

  // Position on a geometric path around (cx, cy).
  // sides=0 → circle, sides≥3 → regular polygon edge interpolation.
  function orbitPos(sides, phase, cx, cy, r, tilt) {
    var a = phase + tilt;
    if (sides === 0) {
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }
    var twoPi    = 2 * Math.PI;
    var segAngle = twoPi / sides;
    var norm     = ((a % twoPi) + twoPi) % twoPi;
    var seg      = Math.floor(norm / segAngle);
    var t        = (norm % segAngle) / segAngle;
    var a1 = seg * segAngle - Math.PI / 2;
    var a2 = a1 + segAngle;
    return {
      x: cx + r * Math.cos(a1) + (r * Math.cos(a2) - r * Math.cos(a1)) * t,
      y: cy + r * Math.sin(a1) + (r * Math.sin(a2) - r * Math.sin(a1)) * t,
    };
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function init() {
    var isMobile = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
    var homes       = isMobile ? HOMES_MOBILE : HOMES;
    var radiusMin   = isMobile ? 28 : CONFIG.RADIUS_MIN;
    var radiusMax   = isMobile ? 50 : CONFIG.RADIUS_MAX;
    var fontSizeMin = isMobile ? 7  : CONFIG.FONT_SIZE_MIN;
    var fontSizeMax = isMobile ? 9  : CONFIG.FONT_SIZE_MAX;

    var canvas = document.createElement('canvas');
    canvas.id = 'code-bg';
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');

    var scanlines = document.createElement('div');
    scanlines.id = 'scanlines';
    document.body.insertBefore(scanlines, document.body.firstChild);

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    // One particle per home position, cycling through SNIPPETS
    var particles = [];
    for (var i = 0; i < homes.length; i++) {
      var fontSize = Math.round(rnd(fontSizeMin, fontSizeMax));
      var depthT   = (fontSize - fontSizeMin) / (fontSizeMax - fontSizeMin);
      particles.push({
        snippet:    SNIPPETS[i % SNIPPETS.length],
        fontSize:   fontSize,
        opacity:    CONFIG.OPACITY_MIN + depthT * (CONFIG.OPACITY_MAX - CONFIG.OPACITY_MIN),
        textTilt:   rnd(-10, 10),
        homeFx:     homes[i].fx,
        homeFy:     homes[i].fy,
        shape:      homes[i].shape,
        radius:     rnd(radiusMin, radiusMax),
        orbitTilt:  rnd(0, Math.PI),   // rotates the shape itself
        phase:      rnd(0, 2 * Math.PI),
        speed:      rnd(CONFIG.SPEED_MIN, CONFIG.SPEED_MAX) * (Math.random() > 0.5 ? 1 : -1),
        x: 0,
        y: 0,
      });
    }

    function drawParticle(p) {
      var lines = p.snippet.split('\n');
      var lineH = p.fontSize * CONFIG.LINE_HEIGHT;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.textTilt * Math.PI / 180);
      ctx.font         = p.fontSize + 'px ' + CONFIG.FONT_FAMILY;
      ctx.fillStyle    = 'rgba(' + CONFIG.COLOR + ', ' + p.opacity + ')';
      ctx.textBaseline = 'top';
      for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], 0, j * lineH);
      ctx.restore();
    }

    var animFrameId = null;

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        p.phase += p.speed;
        var pos = orbitPos(
          p.shape, p.phase,
          p.homeFx * canvas.width,
          p.homeFy * canvas.height,
          p.radius, p.orbitTilt
        );
        p.x = pos.x;
        p.y = pos.y;
        drawParticle(p);
      }
      animFrameId = requestAnimationFrame(tick);
    }

    function ensureRunning() {
      if (!animFrameId) animFrameId = requestAnimationFrame(tick);
    }

    // Pause when tab is hidden, restart on any return path.
    // pageshow covers iOS Safari bfcache restores where visibilitychange may not fire.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      } else {
        ensureRunning();
      }
    });
    window.addEventListener('pageshow', ensureRunning);
    window.addEventListener('focus',    ensureRunning);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    tick();

    // Hero scroll fade
    var heroGrid = document.querySelector('.hero-image-grid');
    var heroEl   = document.querySelector('.hero');
    if (heroGrid && heroEl) {
      window.addEventListener('scroll', function () {
        var progress = Math.min(1, window.scrollY / heroEl.offsetHeight);
        heroGrid.style.opacity = (1 - progress * 0.45).toFixed(3);
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
