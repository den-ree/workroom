// Renders TIMELINE_EVENTS (js/timeline-data.js) into:
//   - the homepage universe (#timelineStrip / #tlCanvas)
//   - the /music performance log (#performanceLog)
// Node positions on the universe are computed automatically from array order.

(function () {
    var events = window.TIMELINE_EVENTS || [];

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function hasFullDate(ev) {
        return /^\d{4}-\d{2}-\d{2}$/.test(ev.date);
    }

    function hasMonthDate(ev) {
        return /^\d{4}-\d{2}$/.test(ev.date);
    }

    function isUpcoming(ev) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (hasFullDate(ev)) {
            return new Date(ev.date + 'T00:00:00') >= today;
        }
        if (hasMonthDate(ev)) {
            var nowYm = today.getFullYear() * 100 + (today.getMonth() + 1);
            var p = ev.date.split('-');
            var evYm = parseInt(p[0], 10) * 100 + parseInt(p[1], 10);
            return evYm >= nowYm;
        }
        return false;
    }

    // '2026-07-09' → '09.07.2026'; '2026-08' → '08.2026'; '2026' → '2026'
    function universeDate(ev) {
        if (hasFullDate(ev)) {
            var p = ev.date.split('-');
            return p[2] + '.' + p[1] + '.' + p[0];
        }
        if (hasMonthDate(ev)) {
            var m = ev.date.split('-');
            return m[1] + '.' + m[0];
        }
        return ev.date;
    }

    // '2026-07-09' → 'Jul 09, 2026'; '2026-08' → 'Aug 2026'; '2026' → '2026'
    function logDate(ev) {
        if (hasFullDate(ev)) {
            var p = ev.date.split('-');
            return MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[2] + ', ' + p[0];
        }
        if (hasMonthDate(ev)) {
            var m = ev.date.split('-');
            return MONTHS[parseInt(m[1], 10) - 1] + ' ' + m[0];
        }
        return ev.date;
    }

    // Compact date for NEXT list: '18.09' when the day is known, else '09.2026'
    function upnextDate(ev) {
        if (hasFullDate(ev)) {
            var p = ev.date.split('-');
            return p[2] + '.' + p[1];
        }
        if (hasMonthDate(ev)) {
            var m = ev.date.split('-');
            return m[1] + '.' + m[0];
        }
        return ev.date;
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    /* ---------------- Homepage universe ---------------- */

    // Horizontal distance between two neighbours =
    //   the left node's own width (so it can never overlap the next) + GUTTER,
    //   plus a compressed amount based on the time between their dates.
    var GUTTER = 30;            // min clear space after a node before the next marker
    var DATE_K = 22;           // px added per doubling of the weeks between two events
    var DATE_MAX_EXTRA = 120;  // cap, so a multi-year gap never runs off forever
    var CANVAS_TAIL = 90;      // slack after the last node

    // 'major' | 'normal' | 'minor'; journal notes default to minor
    function importanceOf(ev) {
        return ev.importance || (ev.type === 'journal' ? 'minor' : 'normal');
    }

    function imagesOf(ev) {
        if (ev.images && ev.images.length) return ev.images.slice(0, 3);
        return ev.image ? [ev.image] : [];
    }

    // Day number for date diffing; month-precision anchors to the 1st;
    // year-only dates anchor to Jan 1.
    function eventDays(ev) {
        var d = ev.date || '';
        var ms;
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) ms = Date.parse(d + 'T00:00:00Z');
        else if (/^\d{4}-\d{2}$/.test(d)) {
            var p = d.split('-');
            ms = Date.UTC(parseInt(p[0], 10), parseInt(p[1], 10) - 1, 1);
        } else if (/^\d{4}$/.test(d)) ms = Date.UTC(parseInt(d, 10), 0, 1);
        else ms = Date.parse(d);
        return isNaN(ms) ? 0 : ms / 86400000;
    }

    // Extra spacing from the time between two events — compressed (log) and capped,
    // so a year reads as "further" than a week without being 52x as far.
    function dateExtra(a, b) {
        var weeks = Math.abs(eventDays(a) - eventDays(b)) / 7;
        return Math.min(DATE_MAX_EXTRA, Math.round(DATE_K * Math.log2(1 + weeks)));
    }

    function maxYOf(ev) {
        var maxY = 100;
        if (imagesOf(ev).length) maxY = 54;
        if (importanceOf(ev) === 'major') maxY = 44;
        return maxY;
    }

    function buildNode(ev) {
        var isLink = !!ev.link;
        var node = el(isLink ? 'a' : 'div', 'tl-node tl-node--' + (ev._coming ? 'live' : ev.type));
        var imp = importanceOf(ev);
        if (imp !== 'normal') node.classList.add('tl-node--' + imp);
        if (isLink) {
            node.href = ev.link;
            if (/^https?:/.test(ev.link)) {
                node.target = '_blank';
                node.rel = 'noopener noreferrer';
            }
        }
        if (isUpcoming(ev) && !ev._coming) {
            node.classList.add('tl-node--upcoming');
            node.appendChild(el('span', 'tl-node__flag', 'upcoming'));
        }
        if (ev._coming) {
            node.classList.add('tl-node--upcoming', 'tl-node--coming');
        }

        var marker = el('span', 'tl-node__marker');
        marker.setAttribute('aria-hidden', 'true');
        marker.appendChild(el('span', 'tl-node__cross', '+'));
        node.appendChild(marker);

        if (ev._coming) {
            node.appendChild(el('span', 'tl-node__title', 'coming next'));
            if (ev._upnext && ev._upnext.length) {
                var list = el('ul', 'tl-node__upnext');
                ev._upnext.forEach(function (item, i) {
                    var row = el('li', 'tl-node__upnext-item tl-node__upnext-item--n' + i +
                        (item.tentative ? ' tl-node__upnext-item--tentative' : '') +
                        (item.link ? ' tl-node__upnext-item--link' : ''));
                    var coords = el(item.link ? 'a' : 'span', 'tl-node__upnext-coords');
                    if (item.link) {
                        coords.href = item.link;
                        if (/^https?:/.test(item.link)) {
                            coords.target = '_blank';
                            coords.rel = 'noopener noreferrer';
                        }
                    }
                    var line = el('span', 'tl-node__upnext-line', upnextDate(item) + ' - ' + item.title);
                    coords.appendChild(line);
                    if (item.tentative) {
                        line.appendChild(document.createTextNode(' '));
                        line.appendChild(el('span', 'tl-node__upnext-hope', '[tbc]'));
                    }
                    var metaParts = [];
                    if (item.kind) metaParts.push(item.kind);
                    if (item.city) metaParts.push(item.city);
                    if (metaParts.length) {
                        coords.appendChild(el('span', 'tl-node__upnext-meta', metaParts.join(' - ')));
                    }
                    row.appendChild(coords);
                    list.appendChild(row);
                });
                node.appendChild(list);
            }
        } else {
            var label = universeDate(ev) + (ev.city ? ' · ' + ev.city : '');
            node.appendChild(el('span', 'tl-node__label', label));
            node.appendChild(el('span', 'tl-node__title', ev.title));
        }

        var imgs = imagesOf(ev);
        if (imgs.length) {
            var stack = el('span', 'tl-node__mediastack');
            if (ev.imageRatio) {
                stack.classList.add('tl-node__mediastack--ratio');
                // Derive height from --media-w so abspos images still get a sized box
                // (aspect-ratio alone is unreliable when all children are absolute).
                var parts = String(ev.imageRatio).split('/');
                var rw = parseFloat(parts[0], 10);
                var rh = parseFloat(parts[1], 10);
                if (rw > 0 && rh > 0) {
                    stack.style.height = 'calc(var(--media-w) * ' + (rh / rw) + ')';
                }
            }
            imgs.forEach(function (src) {
                var img = el('img', 'tl-node__media' + (ev.imageFit === 'contain' ? ' tl-node__media--contain' : ''));
                img.src = src;
                img.alt = ev.title;
                stack.appendChild(img);
            });
            node.appendChild(stack);
        }
        if (ev.chip) {
            node.appendChild(el('span', 'tl-node__mediachip', ev.chip));
        }
        return node;
    }

    // Soonest-first upcoming events (full-date and month-precision).
    function upcomingSorted() {
        return events.filter(isUpcoming).slice().sort(function (a, b) {
            return eventDays(a) - eventDays(b);
        });
    }

    // Coming-next anchors at a viewport left inset; Y alternates up/down for every node.
    // Upcoming events stay off the strip — they only feed the NEXT list /music.
    var TITLE_TO_COMING = 18; // px gap under the title before the "up" band
    var DOWN_BAND_SHARE = 0.22; // fraction of strip height from up → down band
    var FOCUS_GUTTER = 96; // space between coming-next and the latest past event
    var FOCUS_GUTTER_NARROW = 16;
    var NARROW = 700;
    var HINT_FADE = 40;

    function isTouchUi() {
        return window.matchMedia('(hover: none)').matches;
    }

    var lightboxState = { sources: [], index: 0, alt: '' };
    var lightboxSwipe = { x: 0, y: 0, active: false, moved: false };

    function onLightboxKey(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            return;
        }
        if (lightboxState.sources.length < 2) return;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            showLightboxAt(lightboxState.index + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showLightboxAt(lightboxState.index - 1);
        }
    }

    function showLightboxAt(index) {
        var n = lightboxState.sources.length;
        if (!n) return;
        lightboxState.index = ((index % n) + n) % n;
        var box = ensureLightbox();
        var img = box.querySelector('.tl-lightbox__img');
        img.src = lightboxState.sources[lightboxState.index];
        img.alt = lightboxState.alt || '';
        box.classList.toggle('tl-lightbox--multi', n > 1);
        var counter = box.querySelector('.tl-lightbox__counter');
        if (counter) {
            counter.textContent = (lightboxState.index + 1) + ' / ' + n;
            counter.hidden = n < 2;
        }
        var prev = box.querySelector('.tl-lightbox__nav--prev');
        var next = box.querySelector('.tl-lightbox__nav--next');
        if (prev) prev.hidden = n < 2;
        if (next) next.hidden = n < 2;
    }

    function ensureLightbox() {
        var box = document.getElementById('tlLightbox');
        if (box) return box;
        box = el('div', 'tl-lightbox');
        box.id = 'tlLightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', 'Image preview');

        var prev = el('button', 'tl-lightbox__nav tl-lightbox__nav--prev', '<');
        prev.type = 'button';
        prev.setAttribute('aria-label', 'Previous image');
        prev.hidden = true;

        var next = el('button', 'tl-lightbox__nav tl-lightbox__nav--next', '>');
        next.type = 'button';
        next.setAttribute('aria-label', 'Next image');
        next.hidden = true;

        var img = el('img', 'tl-lightbox__img');
        img.alt = '';

        var counter = el('span', 'tl-lightbox__counter');
        counter.hidden = true;

        box.appendChild(prev);
        box.appendChild(img);
        box.appendChild(next);
        box.appendChild(counter);

        prev.addEventListener('click', function (e) {
            e.stopPropagation();
            showLightboxAt(lightboxState.index - 1);
        });
        next.addEventListener('click', function (e) {
            e.stopPropagation();
            showLightboxAt(lightboxState.index + 1);
        });

        box.addEventListener('click', function (e) {
            if (lightboxSwipe.moved) {
                lightboxSwipe.moved = false;
                return;
            }
            if (e.target === prev || e.target === next || e.target === counter) return;
            closeLightbox();
        });

        box.addEventListener('touchstart', function (e) {
            if (lightboxState.sources.length < 2 || !e.touches.length) return;
            lightboxSwipe.active = true;
            lightboxSwipe.moved = false;
            lightboxSwipe.x = e.touches[0].clientX;
            lightboxSwipe.y = e.touches[0].clientY;
        }, { passive: true });

        box.addEventListener('touchmove', function (e) {
            if (!lightboxSwipe.active || !e.touches.length) return;
            var dx = e.touches[0].clientX - lightboxSwipe.x;
            var dy = e.touches[0].clientY - lightboxSwipe.y;
            if (Math.abs(dx) > 12 || Math.abs(dy) > 12) lightboxSwipe.moved = true;
        }, { passive: true });

        box.addEventListener('touchend', function (e) {
            if (!lightboxSwipe.active) return;
            lightboxSwipe.active = false;
            if (lightboxState.sources.length < 2) return;
            var t = e.changedTouches && e.changedTouches[0];
            if (!t) return;
            var dx = t.clientX - lightboxSwipe.x;
            var dy = t.clientY - lightboxSwipe.y;
            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
            showLightboxAt(lightboxState.index + (dx < 0 ? 1 : -1));
        }, { passive: true });

        box.addEventListener('touchcancel', function () {
            lightboxSwipe.active = false;
        }, { passive: true });

        document.body.appendChild(box);
        return box;
    }

    function openLightbox(sources, index, alt) {
        var list = Array.isArray(sources) ? sources.filter(Boolean) : [sources];
        if (!list.length) return;
        lightboxState.sources = list;
        lightboxState.alt = alt || '';
        lightboxState.index = Math.max(0, Math.min(index || 0, list.length - 1));
        ensureLightbox();
        showLightboxAt(lightboxState.index);
        var box = document.getElementById('tlLightbox');
        box.classList.add('is-visible');
        document.addEventListener('keydown', onLightboxKey);
    }

    function closeLightbox() {
        var box = document.getElementById('tlLightbox');
        if (!box) return;
        box.classList.remove('is-visible');
        lightboxState.sources = [];
        lightboxState.index = 0;
        document.removeEventListener('keydown', onLightboxKey);
    }

    function initUniverse() {
        var strip = document.getElementById('timelineStrip');
        var canvas = document.getElementById('tlCanvas');
        var svg = document.getElementById('tlSvg');
        if (!strip || !canvas || !svg) return;

        var upnext = upcomingSorted().slice(0, 3);
        var head = upnext.length ? {
            type: 'live',
            date: '',
            title: 'coming next',
            importance: 'normal',
            _coming: true,
            _upnext: upnext
        } : null;
        var rest = events.filter(function (ev) { return !isUpcoming(ev); });
        var universeEvents = head ? [head].concat(rest) : rest.slice();
        // First real strip event sits right of coming-next when present.
        var focusIdx = head && rest.length ? 1 : 0;

        var nodes = universeEvents.map(buildNode);
        nodes.forEach(function (n) { canvas.appendChild(n); });

        var homeScroll = 0;
        var titleFadeAt = HINT_FADE;

        function syncChrome() {
            var delta = Math.abs(strip.scrollLeft - homeScroll);
            var hint = document.getElementById('universeHint');
            var title = document.getElementById('universeTitle');
            if (hint) hint.style.opacity = delta > HINT_FADE ? '0' : '';
            if (title) title.classList.toggle('is-hidden', delta > titleFadeAt);
        }

        function layout() {
            var vw = window.innerWidth;
            var widths = nodes.map(function (n) { return n.offsetWidth || 200; });
            var narrow = vw < NARROW;
            var pairGutter = (head && rest.length)
                ? (narrow ? FOCUS_GUTTER_NARROW : FOCUS_GUTTER)
                : FOCUS_GUTTER;
            var leftInset = Math.round(Math.max(16, Math.min(48, vw * 0.04)));

            // Chain nodes left → right; pad so coming-next sits at the left inset.
            var xs = [0];
            for (var i = 1; i < universeEvents.length; i++) {
                var gap;
                if (i === 1 && head) {
                    gap = widths[0] + pairGutter;
                } else {
                    gap = widths[i - 1] + GUTTER + dateExtra(universeEvents[i - 1], universeEvents[i]);
                }
                xs.push(xs[i - 1] + Math.round(gap));
            }

            // Target: coming-next (or sole focus) starts at leftInset → homeScroll stays 0.
            var anchorIdx = head ? 0 : focusIdx;
            var anchorLeft = xs[anchorIdx] || 0;
            var target = leftInset + (widths[anchorIdx] || 0) / 2;
            var focusCenter = anchorLeft + (widths[anchorIdx] || 0) / 2;
            var leftPad = Math.max(0, Math.round(target - focusCenter));
            for (var j = 0; j < xs.length; j++) xs[j] += leftPad;

            if (focusIdx + 1 < xs.length) {
                titleFadeAt = Math.max(HINT_FADE, Math.round((xs[focusIdx + 1] - xs[focusIdx]) * 0.6));
            } else {
                titleFadeAt = HINT_FADE;
            }

            var stripH = strip.clientHeight || 1;
            var titleEl = document.getElementById('universeTitle');
            var upY = 28;
            if (titleEl && stripH) {
                var stripTop = strip.getBoundingClientRect().top;
                var underTitle = titleEl.getBoundingClientRect().bottom - stripTop + TITLE_TO_COMING;
                upY = Math.max(14, Math.min(48, (underTitle / stripH) * 100));
            }
            var downY = Math.min(56, upY + (DOWN_BAND_SHARE * 100));

            nodes.forEach(function (n, i) {
                n.style.setProperty('--x', xs[i] + 'px');
                var band = (i % 2 === 0) ? upY : downY;
                var y = Math.min(band, maxYOf(universeEvents[i]));
                n.style.setProperty('--y', y + '%');
            });
            canvas.style.width = (xs.length
                ? xs[xs.length - 1] + widths[widths.length - 1] + CANVAS_TAIL
                : vw) + 'px';

            // Keep homeScroll at 0 when left-anchored (leftPad already places the start).
            var prevHome = homeScroll;
            homeScroll = 0;
            var delta = strip.scrollLeft - prevHome;
            strip.scrollLeft = Math.max(0, homeScroll + delta);
            drawLines();
            syncChrome();
        }

        function drawLines() {
            var stripRect = strip.getBoundingClientRect();
            svg.setAttribute('width', canvas.scrollWidth);
            svg.setAttribute('height', strip.clientHeight);
            svg.style.width = canvas.scrollWidth + 'px';
            var points = Array.prototype.map.call(strip.querySelectorAll('.tl-node__marker'), function (m) {
                var r = m.getBoundingClientRect();
                var x = r.left + r.width / 2 - stripRect.left + strip.scrollLeft;
                var y = r.top + r.height / 2 - stripRect.top;
                return x + ',' + y;
            });
            svg.innerHTML = '<polyline points="' + points.join(' ') +
                '" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>';
        }

        layout();
        window.addEventListener('resize', layout);
        window.addEventListener('load', layout);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

        // --- shared scroll state: one writer, one animation slot ---
        // Native scrollLeft clamps at [0, max]; iOS-style overscroll is kept as a
        // logical `overshoot` and rendered with resistance via a canvas translate.
        var reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var animRaf = null;
        var overshoot = 0;

        function maxScroll() { return strip.scrollWidth - strip.clientWidth; }

        function cancelAnimation() {
            if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; }
        }

        function renderOvershoot() {
            if (overshoot) {
                var visual = overshoot / (1 + Math.abs(overshoot) / 150);
                canvas.style.transform = 'translateX(' + (-visual) + 'px)';
            } else {
                canvas.style.transform = '';
            }
        }

        function setScroll(pos, allowOverscroll) {
            var clamped = Math.max(0, Math.min(maxScroll(), pos));
            strip.scrollLeft = clamped;
            overshoot = allowOverscroll ? pos - clamped : 0;
            renderOvershoot();
        }

        function springBack() {
            var start = overshoot;
            if (!start) return;
            cancelAnimation();
            var t0 = performance.now();
            var DURATION = 250;
            animRaf = requestAnimationFrame(function frame(now) {
                var t = Math.min(1, (now - t0) / DURATION);
                overshoot = start * Math.pow(1 - t, 3);
                if (t >= 1) { overshoot = 0; animRaf = null; }
                else animRaf = requestAnimationFrame(frame);
                renderOvershoot();
            });
        }

        // Momentum ran into an edge: swell to a resisted peak, then spring home.
        function bounce(peak) {
            cancelAnimation();
            var t0 = performance.now();
            var OUT = 100, BACK = 250;
            animRaf = requestAnimationFrame(function frame(now) {
                var elapsed = now - t0;
                if (elapsed < OUT) {
                    overshoot = peak * (elapsed / OUT);
                } else if (elapsed < OUT + BACK) {
                    overshoot = peak * Math.pow(1 - (elapsed - OUT) / BACK, 3);
                } else {
                    overshoot = 0;
                    renderOvershoot();
                    animRaf = null;
                    return;
                }
                renderOvershoot();
                animRaf = requestAnimationFrame(frame);
            });
        }

        // Free glide after a flick (velocity in scrollLeft px/ms).
        function startGlide(v) {
            cancelAnimation();
            var pos = strip.scrollLeft;
            var last = performance.now();
            animRaf = requestAnimationFrame(function frame(now) {
                var dt = Math.min(50, Math.max(1, now - last));
                last = now;
                pos += v * dt;
                v *= Math.pow(0.95, dt / 16);
                var max = maxScroll();
                if (pos <= 0 && v < 0) {
                    strip.scrollLeft = 0;
                    bounce(Math.max(-120, v * 60));
                    return;
                }
                if (pos >= max && v > 0) {
                    strip.scrollLeft = max;
                    bounce(Math.min(120, v * 60));
                    return;
                }
                strip.scrollLeft = pos;
                if (Math.abs(v) < 0.02) { animRaf = null; return; }
                animRaf = requestAnimationFrame(frame);
            });
        }

        // Fade title and swipe hint once the user starts exploring
        strip.addEventListener('scroll', syncChrome, { passive: true });

        // Vertical wheel/trackpad drives the strip horizontally (down → into timeline).
        // On the viewport-locked homepage, capture on window so header/chrome still work.
        window.addEventListener('wheel', function (e) {
            if (e.ctrlKey) return; // leave pinch-zoom to the browser
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            var max = maxScroll();
            if (max <= 0) return;
            var nextScroll = Math.max(0, Math.min(max, strip.scrollLeft + e.deltaY));
            if (nextScroll === strip.scrollLeft && !overshoot && !animRaf) return;
            cancelAnimation();
            setScroll(nextScroll, false);
            e.preventDefault();
        }, { passive: false });

        // Drag-to-scroll with the mouse
        var dragging = false, dragMoved = false, startX = 0, startScroll = 0;
        strip.addEventListener('mousedown', function (e) {
            cancelAnimation();
            setScroll(strip.scrollLeft, false);
            dragging = true;
            dragMoved = false;
            startX = e.pageX;
            startScroll = strip.scrollLeft;
            strip.classList.add('is-dragging');
        });
        window.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            var dx = e.pageX - startX;
            if (Math.abs(dx) > 5) dragMoved = true;
            strip.scrollLeft = startScroll - dx;
        });
        window.addEventListener('mouseup', function () {
            dragging = false;
            strip.classList.remove('is-dragging');
        });

        // iOS Safari: nested overflow-x often fails when the page is viewport-locked.
        // Drive scrollLeft from touch so swipe works even when native pan does not.
        var touchDragging = false;
        var touchStartX = 0;
        var touchStartY = 0;
        var touchStartScroll = 0;
        var touchAxis = null; // 'x' | 'y' | null until decided
        var touchLastPos = 0;
        var touchLastTime = 0;
        var touchVelocity = 0; // scrollLeft px/ms
        strip.addEventListener('touchstart', function (e) {
            if (e.touches.length !== 1) return;
            cancelAnimation();
            touchDragging = true;
            touchAxis = null;
            dragMoved = false;
            touchStartX = e.touches[0].pageX;
            touchStartY = e.touches[0].pageY;
            // Fold any mid-bounce overshoot into the start so the finger
            // picks the strip up without a jump.
            touchStartScroll = strip.scrollLeft + overshoot;
            touchLastTime = 0;
            touchVelocity = 0;
        }, { passive: true });
        strip.addEventListener('touchmove', function (e) {
            if (!touchDragging || e.touches.length !== 1) return;
            var x = e.touches[0].pageX;
            var y = e.touches[0].pageY;
            var dx = x - touchStartX;
            var dy = y - touchStartY;
            if (!touchAxis) {
                if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
                touchAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
            }
            // Horizontal swipes pan directly; vertical swipes mirror the desktop
            // wheel mapping (swipe up = scroll deeper into the timeline).
            var pos = touchAxis === 'x' ? x : y;
            var now = e.timeStamp || performance.now();
            if (touchLastTime) {
                var dt = now - touchLastTime;
                if (dt > 0) {
                    touchVelocity = 0.8 * ((touchLastPos - pos) / dt) + 0.2 * touchVelocity;
                }
            }
            touchLastPos = pos;
            touchLastTime = now;
            var delta = touchAxis === 'x' ? dx : dy;
            dragMoved = true;
            setScroll(touchStartScroll - delta, true);
            e.preventDefault();
        }, { passive: false });
        function touchRelease(e) {
            if (!touchDragging) return;
            touchDragging = false;
            touchAxis = null;
            // A finger that rested before lifting shouldn't fling.
            var stale = !touchLastTime ||
                ((e.timeStamp || performance.now()) - touchLastTime) > 80;
            if (overshoot) {
                springBack();
            } else if (!stale && !reduceMotion && Math.abs(touchVelocity) > 0.3) {
                startGlide(touchVelocity);
            }
        }
        strip.addEventListener('touchend', touchRelease, { passive: true });
        strip.addEventListener('touchcancel', touchRelease, { passive: true });

        function closeOpenStacks(except) {
            canvas.querySelectorAll('.tl-node.is-open').forEach(function (n) {
                if (n !== except) n.classList.remove('is-open');
            });
        }

        // Suppress drag-as-click; fan photo stacks on touch; lightbox on photo tap/click.
        strip.addEventListener('click', function (e) {
            if (dragMoved) {
                e.preventDefault();
                dragMoved = false;
                return;
            }

            var media = e.target.closest && e.target.closest('.tl-node__media');
            if (!media) {
                closeOpenStacks(null);
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var node = media.closest('.tl-node');
            var stack = media.closest('.tl-node__mediastack');
            var count = stack ? stack.querySelectorAll('.tl-node__media').length : 1;

            // Mobile: first tap on a multi-image stack fans it out (same as desktop hover).
            if (isTouchUi() && count > 1 && node && !node.classList.contains('is-open')) {
                closeOpenStacks(node);
                node.classList.add('is-open');
                return;
            }

            var imgs = [...stack.querySelectorAll('.tl-node__media')];
            openLightbox(
                imgs.map(function (m) { return m.currentSrc || m.src; }),
                imgs.indexOf(media),
                media.alt
            );
        }, true);
    }

    /* ---------------- /music performance log ---------------- */

    function buildRow(ev, upcoming) {
        var item = el('li', 'log-item' + (upcoming ? ' log-item--upcoming' : ''));

        var metaParts = [logDate(ev)];
        if (ev.city) metaParts.push(ev.city);
        item.appendChild(el('p', 'log-meta', metaParts.join(' · ')));

        if (upcoming) item.appendChild(el('p', 'log-status', 'upcoming'));

        var title = el('h3', 'log-title');
        if (ev.link) {
            var a = el('a', null, ev.title);
            a.href = ev.link;
            if (/^https?:/.test(ev.link)) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            title.appendChild(a);
        } else {
            title.textContent = ev.title;
        }
        item.appendChild(title);

        if (ev.description) {
            item.appendChild(el('p', 'log-desc', ev.description));
        } else if (upcoming && (ev.tentative || hasMonthDate(ev))) {
            item.appendChild(el('p', 'log-desc', 'More details soon.'));
        }

        var tagParts = [];
        if (ev.venue) tagParts.push(ev.venue);
        (ev.badges || []).forEach(function (b) { tagParts.push(b); });
        if (tagParts.length) {
            item.appendChild(el('p', 'log-tags', tagParts.join(' · ')));
        }

        return item;
    }

    function initPerformanceLog() {
        var root = document.getElementById('performanceLog');
        if (!root) return;

        var live = events.filter(function (ev) { return ev.type === 'live'; });
        var upcoming = upcomingSorted().filter(function (ev) { return ev.type === 'live'; });
        var past = live.filter(function (ev) { return !isUpcoming(ev); });

        if (upcoming.length) {
            root.appendChild(el('h3', 'performance-group__heading', 'Upcoming'));
            var upList = el('ul', 'log');
            upcoming.forEach(function (ev) { upList.appendChild(buildRow(ev, true)); });
            root.appendChild(upList);
        }

        root.appendChild(el('h3', 'performance-group__heading', 'Past'));
        var pastList = el('ul', 'log');
        past.forEach(function (ev) { pastList.appendChild(buildRow(ev, false)); });
        root.appendChild(pastList);
    }

    initUniverse();
    initPerformanceLog();
})();
