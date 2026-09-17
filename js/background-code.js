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
    // From live Strudel set
    '$: s("hd-3:6")\n  .scrub("<0 0.5 0.25 ~>")\n  .speed(140/160)\n  .gain(0.3)\n  .oLow(0.6)\n  .oEB(2)\n  .euclid(3,8)\n  .dist(1.65)\n  .dec(0.25)',
  ];

  // Strudel-REPL-like palette (drawn faint on the light page)
  var COLORS = {
    default: '90, 100, 130',
    comment: '120, 140, 170',
    string:  '82, 208, 250',   // cyan
    number:  '255, 130, 210',  // pink
    keyword: '255, 130, 210',  // pink ($:, keywords)
    method:  '71, 133, 244',   // blue
    ident:   '100, 160, 220',  // soft blue
  };

  var KEYWORDS = {
    var: 1, let: 1, func: 1, struct: 1, return: 1, try: 1, await: 1,
    throws: 1, public: 1, private: 1, get: 1, set: 1, if: 1, else: 1,
    async: 1, true: 1, false: 1, nil: 1, self: 1, some: 1, any: 1,
  };

  var CONFIG = {
    FONT_SIZE_MIN: 6,
    FONT_SIZE_MAX: 10,
    OPACITY_MIN: 0.10,
    OPACITY_MAX: 0.18,
    FONT_FAMILY: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace",
    LINE_HEIGHT: 1.45,
    RADIUS_MIN: 4,
    RADIUS_MAX: 10,
    SPEED_MIN: 0.00015,
    SPEED_MAX: 0.0003,
    GAP_PX: 36,          // min gap between snippet bounding boxes
    MARGIN_X: 0.04,
    MARGIN_Y: 0.05,
    PLACE_TRIES: 100,
  };

  var SHAPES = [0, 3, 4, 5, 6];

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

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function estimateSize(snippet, fontSize) {
    var lines = snippet.split('\n');
    var maxLen = 0;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > maxLen) maxLen = lines[i].length;
    }
    return {
      w: Math.max(40, maxLen * fontSize * 0.62),
      h: Math.max(fontSize, lines.length * fontSize * CONFIG.LINE_HEIGHT),
    };
  }

  // Rejection-sample homes so bounding boxes (+ gap) don't overlap.
  // fx/fy are the top-left of each snippet (matches how we draw).
  function placeHomes(candidates, canvasW, canvasH) {
    var placed = [];
    var mx = CONFIG.MARGIN_X;
    var my = CONFIG.MARGIN_Y;
    var gap = CONFIG.GAP_PX;

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var maxFx = 1 - mx - c.w / canvasW;
      var maxFy = 1 - my - c.h / canvasH;
      if (mx >= maxFx || my >= maxFy) continue;

      var found = false;
      for (var attempt = 0; attempt < CONFIG.PLACE_TRIES; attempt++) {
        var fx = rnd(mx, maxFx);
        var fy = rnd(my, maxFy);
        var ax1 = fx * canvasW;
        var ay1 = fy * canvasH;
        var ax2 = ax1 + c.w + gap;
        var ay2 = ay1 + c.h + gap;
        var overlaps = false;

        for (var j = 0; j < placed.length; j++) {
          var p = placed[j];
          var bx1 = p.fx * canvasW - gap;
          var by1 = p.fy * canvasH - gap;
          var bx2 = bx1 + p.w + gap * 2;
          var by2 = by1 + p.h + gap * 2;
          if (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          placed.push({
            fx: fx,
            fy: fy,
            w: c.w,
            h: c.h,
            snippet: c.snippet,
            fontSize: c.fontSize,
            opacity: c.opacity,
            shape: SHAPES[i % SHAPES.length],
          });
          found = true;
          break;
        }
      }
      // Skip if nowhere to put it — fewer pieces beats collisions.
      if (!found) continue;
    }

    return placed;
  }

  // Lightweight highlighter: comments, strings, numbers, keywords, .methods
  function tokenize(line) {
    var tokens = [];
    var i = 0;
    var n = line.length;
    var afterDot = false;

    while (i < n) {
      var ch = line[i];

      if (ch === '/' && line[i + 1] === '/') {
        tokens.push({ text: line.slice(i), kind: 'comment' });
        break;
      }

      if (ch === '"' || ch === "'") {
        var q = ch;
        var j = i + 1;
        while (j < n && line[j] !== q) {
          if (line[j] === '\\') j++;
          j++;
        }
        tokens.push({ text: line.slice(i, Math.min(j + 1, n)), kind: 'string' });
        i = Math.min(j + 1, n);
        afterDot = false;
        continue;
      }

      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(line[i + 1] || ''))) {
        var k = i;
        if (ch === '.') k++;
        while (k < n && /[0-9.]/.test(line[k])) k++;
        tokens.push({ text: line.slice(i, k), kind: 'number' });
        i = k;
        afterDot = false;
        continue;
      }

      if (/[A-Za-z_$@#]/.test(ch)) {
        var m = i + 1;
        while (m < n && /[A-Za-z0-9_$@]/.test(line[m])) m++;
        // include trailing : for $: / labels
        if (line[m] === ':' && /[$@A-Za-z_]/.test(ch)) m++;
        var word = line.slice(i, m);
        var kind = 'ident';
        if (afterDot) kind = 'method';
        else if (KEYWORDS[word] || word === '$:' || word === '_$:' || word.charAt(0) === '$') kind = 'keyword';
        else if (word.charAt(0) === '@' || word.charAt(0) === '#') kind = 'keyword';
        tokens.push({ text: word, kind: kind });
        i = m;
        afterDot = false;
        continue;
      }

      tokens.push({ text: ch, kind: 'default' });
      afterDot = ch === '.';
      i++;
    }

    return tokens;
  }

  function init() {
    var isMobile = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
    var radiusMin   = isMobile ? 3  : CONFIG.RADIUS_MIN;
    var radiusMax   = isMobile ? 8  : CONFIG.RADIUS_MAX;
    var fontSizeMin = isMobile ? 6  : CONFIG.FONT_SIZE_MIN;
    var fontSizeMax = isMobile ? 8  : CONFIG.FONT_SIZE_MAX;
    var targetCount = isMobile ? 6 : SNIPPETS.length;

    var canvas = document.createElement('canvas');
    canvas.id = 'code-bg';
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    function buildParticles() {
      var pool = shuffle(SNIPPETS).slice(0, targetCount);
      var candidates = [];
      for (var i = 0; i < pool.length; i++) {
        var fontSize = Math.round(rnd(fontSizeMin, fontSizeMax));
        var depthT = (fontSize - fontSizeMin) / (fontSizeMax - fontSizeMin || 1);
        var size = estimateSize(pool[i], fontSize);
        // Soften very tall blocks so they don't claim huge exclusive zones
        if (size.h > canvas.height * 0.28) {
          fontSize = Math.max(fontSizeMin, fontSize - 2);
          size = estimateSize(pool[i], fontSize);
        }
        candidates.push({
          snippet: pool[i],
          fontSize: fontSize,
          opacity: isMobile
            ? rnd(0.10, 0.16)
            : CONFIG.OPACITY_MIN + depthT * (CONFIG.OPACITY_MAX - CONFIG.OPACITY_MIN),
          w: size.w,
          h: size.h,
        });
      }
      // Place shorter blocks first — packs better, fewer forced skips
      candidates.sort(function (a, b) { return (a.w * a.h) - (b.w * b.h); });

      var homes = placeHomes(candidates, canvas.width, canvas.height);
      var next = [];
      for (var h = 0; h < homes.length; h++) {
        var home = homes[h];
        next.push({
          snippet:    home.snippet,
          fontSize:   home.fontSize,
          opacity:    home.opacity,
          pulseAmp:   rnd(0.015, 0.03),
          pulsePhase: rnd(0, 2 * Math.PI),
          pulseSpeed: rnd(0.001, 0.002),
          textTilt:   rnd(-8, 8),
          homeFx:     home.fx,
          homeFy:     home.fy,
          shape:      home.shape,
          radius:     rnd(radiusMin, radiusMax),
          orbitTilt:  rnd(0, Math.PI),
          phase:      rnd(0, 2 * Math.PI),
          speed:      rnd(CONFIG.SPEED_MIN, CONFIG.SPEED_MAX) * (Math.random() > 0.5 ? 1 : -1),
          x: 0,
          y: 0,
        });
      }
      return next;
    }

    var particles = buildParticles();

    function drawParticle(p) {
      var lines   = p.snippet.split('\n');
      var lineH   = p.fontSize * CONFIG.LINE_HEIGHT;
      var opacity = Math.max(0, p.opacity + Math.sin(p.pulsePhase) * p.pulseAmp);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.textTilt * Math.PI / 180);
      ctx.font         = p.fontSize + 'px ' + CONFIG.FONT_FAMILY;
      ctx.textBaseline = 'top';

      for (var j = 0; j < lines.length; j++) {
        var tokens = tokenize(lines[j]);
        var x = 0;
        for (var t = 0; t < tokens.length; t++) {
          var tok = tokens[t];
          var rgb = COLORS[tok.kind] || COLORS.default;
          ctx.fillStyle = 'rgba(' + rgb + ', ' + opacity + ')';
          ctx.fillText(tok.text, x, j * lineH);
          x += ctx.measureText(tok.text).width;
        }
      }
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
        p.pulsePhase += p.pulseSpeed;
        drawParticle(p);
      }
      animFrameId = requestAnimationFrame(tick);
    }

    function ensureRunning() {
      if (!animFrameId) animFrameId = requestAnimationFrame(tick);
    }

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
      resizeTimer = setTimeout(function () {
        resize();
        particles = buildParticles();
      }, 150);
    });

    tick();

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
