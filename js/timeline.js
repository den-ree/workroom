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

    // '2026-10-21' → 'Wed 21 Oct 2026' (full dates only; others fall back to logDate)
    function longDate(ev) {
        if (!hasFullDate(ev)) return logDate(ev);
        var p = ev.date.split('-');
        var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return DAYS[d.getUTCDay()] + ' ' + p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0] +
            (ev.time ? ' · ' + ev.time + (ev.endTime ? '–' + ev.endTime : '') : '');
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    // Performance, app, session, and release icons by Delapouite, CC BY 3.0.
    // Location mark by Spencer Dub, CC BY 3.0.
    // https://game-icons.net — background square removed, shape kept.
    // Note icon from Lucide, https://lucide.dev (ISC).
    // Copyright (c) Lucide Contributors. Feather portions Copyright (c) Cole Bemis.
    // Permission to use, copy, modify, and/or distribute for any purpose with or
    // without fee, provided this notice appears in all copies.
    var TYPE_INFO = {
        live: {
            label: 'Performance',
            glyph: 'm369.1 24.54-12.6 12.92c-9.2 14.71-9.7 34.33-7.6 53.05-2.9-.39-5.9-.46-8.9-.2-16.1 1.38-28.4 11.59-27.4 22.89 1 11.2 14.8 19.2 30.9 17.8 8.8-.7 17-4.2 22.1-9.5 1.7 10.8 15.2 18.2 30.7 16.9 16.1-1.4 28.4-11.6 27.4-22.9-.2-2.3-.9-4.5-2.1-6.5-3.4-19.63-4.2-38.02 4.8-57.07-18.6-5.91-44-16.31-57.3-27.39zm2.4 24.77c10.1 6.59 21.3 11.42 32 14.24-2.6 11.7-2.6 23.19-1.6 34.32-3-.42-6-.5-9.1-.24-8.8.77-16.9 4.27-22 9.57-.3-2-1.1-3.9-2.2-5.7-3.1-17.98-3.9-34.87 2.9-52.19zM111.4 63.88c-13.92 5.83-36.33 8.22-53.82 3.71l-4.5 17.43c2.08 18.88 10 35.28 19.99 49.68a20.44 29.25 55.36 0 0-8.08 4.4 20.44 29.25 55.36 0 0-12.45 33.4 20.44 29.25 55.36 0 0 35.69.2 20.44 29.25 55.36 0 0 12.47-33.4 20.44 29.25 55.36 0 0-5.4-4.7c-11.6-14-20.7-28.3-23.28-46.69 16.57.96 33.18-1.91 46.38-7.43l-7-16.6zM151 167v48h16v-32h178v32h16v-48H151zM25 233v238h462V233H25zm39 14h64v18H64v-18zm112 0h160v18H176v-18zm208 0h64v18h-64v-18zM48 279h416v18H48v-18zm64 32c40.2 0 73 32.8 73 73s-32.8 73-73 73c-40.21 0-73-32.8-73-73s32.79-73 73-73zm87 0h114v82H199v-82zm201 0c40.2 0 73 32.8 73 73s-32.8 73-73 73-73-32.8-73-73 32.8-73 73-73zm-288 18c-30.48 0-55 24.5-55 55s24.52 55 55 55c30.5 0 55-24.5 55-55s-24.5-55-55-55zm105 0v46h78v-46h-78zm183 0c-30.5 0-55 24.5-55 55s24.5 55 55 55 55-24.5 55-55-24.5-55-55-55zm-288 30c13.7 0 25 11.3 25 25s-11.3 25-25 25-25-11.3-25-25 11.3-25 25-25zm288 0c13.7 0 25 11.3 25 25s-11.3 25-25 25-25-11.3-25-25 11.3-25 25-25zm-288 18c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm288 0c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm-185 39h18v32h-18v-32zm32 0h18v32h-18v-32zm32 0h18v32h-18v-32z'
        },
        public: {
            label: 'Session',
            glyph: 'M120.998 40.998v37.943C136.22 89.471 146 109.278 146 131.001c0 13.71-3.901 26.65-10.598 36.985 3.465 1.35 7.106 2.85 10.15 4.172l122.352-22.783 5.918 54.842-111.748 23.219c-.862 16.261-2.45 32.262-5.289 51.566h336.217V40.998zM96 88.998c-16.595 0-32.002 17.747-32.002 42.004 0 24.257 15.407 42.002 32.002 42.002 16.595 0 32.002-17.745 32.002-42.002S112.595 88.998 96 88.998zm156.096 81.629-108.592 20.22c-14.24-5.602-4.956-3.035-21.469-8.517-7.476 5.469-16.33 8.672-26.035 8.672-8.6 0-16.53-2.523-23.428-6.9-8.59 3.564-17.655 8.09-25.736 12.654-12.992 7.338-23.722 13.211-27.838 16.033v130.213h20.004V232h17.996v263.002h30.004V326h17.996v169.002h26.004v-171.84l.154-.824c9.514-50.64 12.588-77.384 13.461-109.656l109.56-22.766zm-98.153 126.375c-.952 5.682-1.991 11.64-3.146 17.996H478v-17.996zM208 344.998c-16.595 0-32.002 17.747-32.002 42.004 0 18.198 8.67 32.73 20.01 38.855 3.599-1.662 7.482-2.706 11.68-2.851 4.633-.16 8.98.767 13.052 2.42 10.968-6.352 19.262-20.63 19.262-38.424 0-24.257-15.407-42.004-32.002-42.004zm112 0c-16.595 0-32.002 17.747-32.002 42.004 0 18.198 8.67 32.73 20.01 38.855 3.599-1.662 7.482-2.706 11.68-2.851 4.633-.16 8.98.767 13.052 2.42 10.968-6.352 19.262-20.63 19.262-38.424 0-24.257-15.407-42.004-32.002-42.004zm112 0c-16.595 0-32.002 17.747-32.002 42.004 0 18.198 8.67 32.73 20.01 38.855 3.599-1.662 7.482-2.706 11.68-2.851 4.633-.16 8.98.767 13.052 2.42 10.968-6.352 19.262-20.63 19.262-38.424 0-24.257-15.407-42.004-32.002-42.004zm-223.688 95.996c-3.844.133-8.907 2.93-14.3 8.785-5.394 5.855-10.696 14.25-15.125 22.76-4.226 8.12-7.609 16.16-10.06 22.463h85.339c-3.04-6.436-7.138-14.549-12.133-22.711-5.298-8.658-11.511-17.138-17.668-22.957-6.157-5.819-11.8-8.487-16.053-8.34zm112 0c-3.844.133-8.907 2.93-14.3 8.785-5.394 5.855-10.696 14.25-15.125 22.76-4.226 8.12-7.609 16.16-10.06 22.463h85.339c-3.04-6.436-7.138-14.549-12.133-22.711-5.298-8.658-11.511-17.138-17.668-22.957-6.157-5.819-11.8-8.487-16.052-8.34zm112 0c-3.844.133-8.907 2.93-14.3 8.785-5.394 5.855-10.696 14.25-15.125 22.76-4.226 8.12-7.609 16.16-10.06 22.463h85.339c-3.04-6.436-7.138-14.549-12.133-22.711-5.298-8.658-11.511-17.138-17.668-22.957-6.157-5.819-11.8-8.487-16.052-8.34z'
        },
        journal: {
            label: 'Note',
            nodes: [
                { tag: 'path', d: 'M2 6h4' },
                { tag: 'path', d: 'M2 10h4' },
                { tag: 'path', d: 'M2 14h4' },
                { tag: 'path', d: 'M2 18h4' },
                { tag: 'rect', width: '16', height: '20', x: '4', y: '2', rx: '2' },
                { tag: 'path', d: 'M16 2v20' }
            ]
        },
        software: {
            label: 'App',
            glyph: 'M73 25v238h366V25H283v16h140v192H89V41h140V25H73zm174 0v16h18V25h-18zM107 59v156h298V59H107zM71.03 281l-43.5 174H484.5L441 281h-29.9l20 96h-99.6l16 64H163.8l20-64H80.93l19.97-96H71.03zm48.27 0-2.9 14H147l2.3-14h-30zm48.4 0-2.3 14h30.7l1.7-14h-30.1zm48.2 0-1.7 14H247v-14h-31.1zm49.1 0v14h32.8l-1.7-14H265zm49.2 0 1.7 14h30.7l-2.3-14h-30.1zm48.5 0 2.3 14h30.6l-2.9-14h-30zm-250 32-3 14h31.9l2.4-14h-31.3zm49.7 0-2.4 14h32.1l1.7-14h-31.4zm49.5 0-1.7 14H247v-14h-35.1zm53.1 0v14h36.8l-1.7-14H265zm53.2 0 1.7 14H352l-2.4-14h-31.4zm49.8 0 2.4 14h31.9l-3-14H368zm-262 32-2.9 14h33.2l2.3-14H106zm51 0-2.3 14h33.4l1.7-14H157zm50.9 0-1.7 14H247v-14h-39.1zm57.1 0v14h40.8l-1.7-14H265zm57.2 0 1.7 14h33.4l-2.3-14h-32.8zm51.2 0 2.3 14h33.2l-2.9-14h-32.6zm-170.8 32-14.4 46h136.3L313 377H202.6zM28 473v18h456v-18H28z'
        },
        release: {
            label: 'Release',
            glyph: 'M32.033 96S16 96 16 112.22V384c0 16 15.783 16 15.783 16h54.94l.547-2.184L104.973 327h302.054l17.703 70.816.547 2.184h53.01S496 400 496 385.23V112c0-16-16-16-16-16H32.033zM87 135h338v18H87v-18zm0 48h338v114H87V183zm18 18v78h132.795c5.88-11.722 9.205-24.957 9.205-39s-3.326-27.278-9.205-39H105zm152.465 0A104.329 104.329 0 0 1 265 240c0 13.777-2.686 26.934-7.535 39h32.89A72.419 72.419 0 0 1 279 240c0-14.33 4.17-27.708 11.354-39h-32.89zm55.676 0c-9.98 9.945-16.14 23.723-16.14 39 0 15.277 6.16 29.055 16.14 39h77.72c9.98-9.945 16.14-23.723 16.14-39 0-15.277-6.16-29.055-16.14-39h-77.72zm-143.677 8.432a32 32 0 0 1 12.06 6.94l-5.12 2.956c5.044 4.037 8.61 9.857 9.693 16.465l5.06-2.922A32 32 0 0 1 192 240a32 32 0 0 1-.787 6.94l-5.072-2.928c-1.016 6.624-4.525 12.476-9.525 16.56l5.065 2.924a32 32 0 0 1-12.217 7.04v-5.778a26.138 26.138 0 0 1-9.553 1.812c-3.36 0-6.58-.648-9.553-1.812v5.744a32 32 0 0 1-12.11-7.086l4.944-2.853c-4.995-4.088-8.5-9.943-9.512-16.57l-4.903 2.83A32 32 0 0 1 128 240a32 32 0 0 1 .81-7.027l4.91 2.834c1.08-6.608 4.643-12.43 9.684-16.47l-5.013-2.894a32 32 0 0 1 11.967-6.918v5.786a26.142 26.142 0 0 1 9.553-1.812c3.36 0 6.58.648 9.553 1.813v-5.878zm192.11.04a32 32 0 0 1 11.984 6.93l-5.047 2.914c5.044 4.038 8.61 9.857 9.693 16.465l4.963-2.862A32 32 0 0 1 384 240a32 32 0 0 1-.77 6.877l-4.98-2.875c-1.016 6.624-4.526 12.476-9.525 16.56l5.004 2.89a32 32 0 0 1-12.158 7.046v-5.75a26.138 26.138 0 0 1-9.554 1.81c-3.36 0-6.58-.646-9.553-1.81v5.793a32 32 0 0 1-12.184-7.093l5.02-2.896c-4.998-4.087-8.503-9.942-9.515-16.568l-5 2.887A32 32 0 0 1 320 240a32 32 0 0 1 .826-7.092l5.002 2.89c1.08-6.61 4.643-12.43 9.684-16.47l-5.073-2.93a32 32 0 0 1 12.025-6.908v5.81a26.097 26.097 0 0 1 19.107-.002v-5.825zM119.026 345l-13.75 55h301.446l-13.75-55H119.027zM48 352a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm416 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-304 7h48v18h-48v-18zm144 0h48v18h-48v-18z'
        }
    };

    function iconSvg(info) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', 'tl-icon');
        if (info.glyph) {
            svg.setAttribute('viewBox', '0 0 512 512');
            var glyph = document.createElementNS(ns, 'path');
            glyph.setAttribute('fill', 'currentColor');
            glyph.setAttribute('d', info.glyph);
            svg.appendChild(glyph);
            return svg;
        }
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        info.nodes.forEach(function (node) {
            var shape = document.createElementNS(ns, node.tag);
            Object.keys(node).forEach(function (key) {
                if (key !== 'tag') shape.setAttribute(key, node[key]);
            });
            svg.appendChild(shape);
        });
        return svg;
    }

    function typeInfo(type) {
        return TYPE_INFO[type] || TYPE_INFO.live;
    }

    // digital-trace, Spencer Dub — https://game-icons.net/1x1/spencerdub/digital-trace.html
    var PLACE_GLYPH = 'M256 23C127.425 23 23 127.425 23 256s104.425 233 233 233 233-104.425 233-233S384.575 23 256 23zm0 18c26.584 0 52.025 4.824 75.516 13.623l-19.405 51.746a160 160 0 0 1 56.955 36.565l39.002-39.002a215.033 215.033 0 0 1 45.006 65.957l-43.601 40.707 58.69 10.45a215.91 215.91 0 0 1 1.87 14.57l-51.709 4.923-8.851-29.943-9.073-30.688-45.064 42.072C341.166 180.736 301.982 151 256 151c-14.248 0-27.841 2.86-40.242 8.027l1.732-61.66-29.011 13.5-29.012 13.502 48.3 38.393C174.078 180.266 151 215.494 151 256c0 44.296 27.593 82.287 66.488 97.682l-44.047 43.064 30.243 10.461 30.242 10.461-8.024-61.074A104.612 104.612 0 0 0 256 361c57.883 0 105-47.117 105-105a104.8 104.8 0 0 0-3.146-25.523l57.892 10.308-.613.059A160 160 0 0 1 416 256a160 160 0 0 1-96.7 146.744l21.887 50.738C315.072 464.747 286.276 471 256 471a216.252 216.252 0 0 1-44.543-4.623l-7.773-59.17-42.688 41.736a215.464 215.464 0 0 1-63.52-47.63l40.7-37.31A160 160 0 0 1 96 256a160 160 0 0 1 46.934-113.066l-39.002-39.002a215.648 215.648 0 0 1 37.867-30.166l46.68 37.101 1.673-59.603C210.902 44.607 233.024 41 256 41zm0 128c30.33 0 56.962 15.413 72.525 38.854l-41.802 39.027 56.265 10.02C342.507 304.637 303.855 343 256 343c-1.013 0-2.02-.025-3.023-.059l-7.45-56.7-40.93 40.015C182.998 310.447 169 284.903 169 256c0-25.708 11.075-48.755 28.723-64.662l44.76 35.58 1.605-57.107A88.273 88.273 0 0 1 256 169zm0 55a32 32 0 0 0-32 32 32 32 0 0 0 32 32 32 32 0 0 0 32-32 32 32 0 0 0-32-32z';

    function placeIcon() {
        var svg = iconSvg({ glyph: PLACE_GLYPH });
        svg.classList.add('tl-icon--place');
        return svg;
    }

    function kindText(ev) {
        var label = typeInfo(ev.type).label;
        if (!ev.kind) return label;
        if (ev.kind.toLowerCase().indexOf(label.toLowerCase()) !== -1) return ev.kind;
        return label + ' · ' + ev.kind;
    }

    // Kind line under the type name. Skipped when it only repeats that name.
    function specificKind(ev) {
        if (!ev.kind) return '';
        if (ev.kind.toLowerCase() === typeInfo(ev.type).label.toLowerCase()) return '';
        return ev.kind;
    }

    // logo + logoFor: the logo stands in for that word of the title.
    // logo alone: it is appended after the title.
    function appendLogoTitle(parent, ev, logoClass) {
        var logoAt = ev.logo && ev.logoFor ? ev.title.indexOf(ev.logoFor) : -1;
        if (logoAt >= 0) {
            parent.appendChild(document.createTextNode(ev.title.slice(0, logoAt)));
            var inline = el('img', logoClass);
            inline.src = ev.logo;
            inline.alt = ev.logoFor;
            parent.appendChild(inline);
            parent.appendChild(document.createTextNode(ev.title.slice(logoAt + ev.logoFor.length)));
            return;
        }
        parent.appendChild(document.createTextNode(ev.title));
        if (ev.logo) {
            var badge = el('img', logoClass);
            badge.src = ev.logo;
            badge.alt = '';
            parent.appendChild(badge);
        }
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
        if (ev.featured) maxY = 44;
        return maxY;
    }

    function buildNode(ev) {
        var isLink = !!ev.link;
        var node = el(isLink ? 'a' : 'div', 'tl-node tl-node--' + (ev._coming ? 'live' : ev.type));
        var imp = importanceOf(ev);
        if (imp !== 'normal') node.classList.add('tl-node--' + imp);
        if (ev.featured) node.classList.add('tl-node--featured');
        // Same tab, so the browser's back button returns to the timeline.
        if (isLink) node.href = ev.link;
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
        if (ev.featured && ev.logo) {
            var mark = el('img', 'tl-node__mark');
            mark.src = ev.logo;
            mark.alt = ev.logoFor || '';
            marker.appendChild(mark);
            marker.classList.add('tl-node__marker--logo');
        } else if (!ev._coming) {
            var markIcon = iconSvg(typeInfo(ev.type));
            markIcon.classList.add('tl-node__markicon');
            marker.appendChild(markIcon);
            marker.classList.add('tl-node__marker--icon');
        }
        node.appendChild(marker);

        if (ev._coming && ev._upnext && ev._upnext.length) {
            // The [+] (and the title) is the coming-next control; see setupComingTap.
            marker.removeAttribute('aria-hidden');
            marker.setAttribute('role', 'button');
            marker.setAttribute('tabindex', '0');
            marker.setAttribute('aria-label', 'Show upcoming event details');
            marker.setAttribute('aria-expanded', 'false');
        }

        if (ev._coming) {
            node.appendChild(el('span', 'tl-node__title', 'coming next'));
            if (ev._upnext && ev._upnext.length) {
                var list = el('ul', 'tl-node__upnext');
                ev._upnext.forEach(function (item, i) {
                    var row = el('li', 'tl-node__upnext-item tl-node__upnext-item--n' + i +
                        (item.tentative ? ' tl-node__upnext-item--tentative' : '') +
                        (item.featured ? ' tl-node__upnext-item--featured' : '') +
                        (item.link ? ' tl-node__upnext-item--link' : ''));
                    var coords = el(item.link ? 'a' : 'span', 'tl-node__upnext-coords');
                    if (item.link) coords.href = item.link;
                    var preview = imagesOf(item)[0];
                    if (preview) {
                        row.classList.add('tl-node__upnext-item--preview');
                        var thumb = el('img', 'tl-node__upnext-thumb');
                        thumb.src = preview;
                        thumb.alt = '';
                        thumb.loading = 'lazy';
                        coords.appendChild(thumb);
                    }
                    var text = el('span', 'tl-node__upnext-text');
                    var line = el('span', 'tl-node__upnext-line');
                    var logoAt = item.logo && item.logoFor ? item.title.indexOf(item.logoFor) : -1;
                    var badge = null;
                    if (item.logo) {
                        badge = el('img', 'tl-node__upnext-logo');
                        badge.src = item.logo;
                        badge.alt = logoAt >= 0 ? item.logoFor : '';
                    }
                    if (logoAt >= 0) {
                        badge.classList.add('tl-node__upnext-logo--inline');
                        line.appendChild(document.createTextNode(item.title.slice(0, logoAt)));
                        line.appendChild(badge);
                        line.appendChild(document.createTextNode(item.title.slice(logoAt + item.logoFor.length)));
                    } else {
                        line.appendChild(document.createTextNode(item.title));
                        if (badge) line.appendChild(badge);
                    }
                    if (item.tentative) line.appendChild(el('span', 'tl-node__upnext-hope', ' [tbc]'));
                    text.appendChild(line);
                    var meta = el('span', 'tl-node__upnext-meta');
                    meta.appendChild(document.createTextNode(upnextDate(item)));
                    var kind = specificKind(item);
                    if (kind && item.title.toLowerCase().indexOf(kind.toLowerCase()) === -1) {
                        meta.appendChild(document.createTextNode(' · ' + kind));
                    }
                    if (item.city) {
                        meta.appendChild(document.createTextNode(' · '));
                        meta.appendChild(placeIcon());
                        meta.appendChild(document.createTextNode(item.city));
                    }
                    text.appendChild(meta);
                    coords.appendChild(text);
                    row.appendChild(coords);
                    list.appendChild(row);
                });
                node.appendChild(list);
            }
        } else if (ev.featured) {
            node.appendChild(el('span', 'tl-node__label tl-node__label--target', universeDate(ev)));
            if (ev.city) node.appendChild(el('span', 'tl-node__sublabel', ev.city));
            node.appendChild(el('span', 'tl-node__title', ev.title));
        } else {
            node.appendChild(el('span', 'tl-node__label', universeDate(ev) + (ev.city ? ' · ' + ev.city : '')));
            var title = el('span', 'tl-node__title');
            appendLogoTitle(title, ev, 'tl-node__logo');
            node.appendChild(title);
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
    var FOCUS_GUTTER = 160; // space between coming-next and the latest past event
    var FOCUS_GUTTER_NARROW = 16;
    var NARROW = 700;
    var HINT_FADE = 40;
    // Scroll intro: coming-next starts centred under the title; the first stretch of
    // scroll slides it to the left inset while the timeline fades in, then the strip scrolls.
    var INTRO_SHARE = 0.55;    // intro scroll distance as a share of viewport height
    var INTRO_MIN = 260;       // ...but never shorter than this (px of wheel/drag)
    var INTRO_STUB = 70;       // px of line shown from coming-next before the intro plays
    var INTRO_STAGGER = 0.12;  // fade-in delay per timeline node (in intro progress)
    var INTRO_SCALE = 1.6;     // coming-next size while centred (shrinks to 1 as it docks)
    var TITLE_LIFT = 48;       // px the title rises while it fades out
    var TITLE_OUT = 0.6;       // share of the intro over which the title leaves
    // Scroll highlight: the event passing the focus line scales up a little.
    var FOCUS_AT = 0.5;        // focus line as a share of strip width (centre)
    var FOCUS_SCALE = 0.08;    // extra scale at the focus line
    var FOCUS_REACH = 0.3;     // falloff distance as a share of strip width
    // Side fade: strip edges dissolve into the background (CSS mask, --edge-l / --edge-r).
    // Parallax: off-centre events drift by a per-event depth; the line follows.
    var PARALLAX_X = 34;       // max sideways drift (px) at the strip edge
    var PARALLAX_Y = 16;       // max vertical drift (px), alternating up/down
    // Gallery (cover-flow) depth: side events recede, their photos turn toward the centre.
    var SIDE_SHRINK = 0.14;    // scale lost at the strip edge
    var COVER_ANGLE = 26;      // max photo rotateY (deg) at the strip edge
    var EDGE_ALPHA = 0.12;     // opacity at the strip edges
    var EDGE_LEFT_IN = 280;    // px of scroll before the left edge starts fading
                               // (keeps docked coming-next fully visible)

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

    /* Coming-next popover. Tapping the [+] / "coming next", or one of the listed
       events, opens a card for that event anchored under coming-next (the timeline is locked):
       swipe / wheel / arrow keys step between upcoming events; ×, Esc or a tap outside closes.
       Returns { isOpen, wheel } for initUniverse's input handlers. */
    function setupComingTap(node, upnext) {
        var marker = node.querySelector('.tl-node__marker');
        var title = node.querySelector(':scope > .tl-node__title');
        var list = node.querySelector('.tl-node__upnext');
        var universe = document.getElementById('timeline');
        if (!marker || !list || !universe || !upnext.length) return null;
        var n = upnext.length;
        var idx = 0;
        var open = false;
        var wheelAcc = 0;
        var lastStep = 0;

        var focus = el('div', 'tl-focus');
        focus.setAttribute('role', 'dialog');
        focus.setAttribute('aria-modal', 'true');
        focus.setAttribute('aria-label', 'Upcoming event');
        focus.hidden = true;
        var card = el('div', 'tl-focus__card');
        card.setAttribute('aria-live', 'polite');
        var panel = el('div', 'tl-focus__panel');
        panel.setAttribute('tabindex', '-1');
        panel.appendChild(card);
        focus.appendChild(panel);
        universe.appendChild(focus);

        function button(label, extra) {
            var b = el('a', 'nav-link tl-focus__btn' + (extra ? ' ' + extra : ''), label);
            return b;
        }

        function render(dir) {
            var ev = upnext[idx];
            card.innerHTML = '';
            card.classList.remove('is-from-left', 'is-from-right');
            void card.offsetWidth; // restart the slide-in
            if (dir) card.classList.add(dir > 0 ? 'is-from-right' : 'is-from-left');

            var media = ev.logo || imagesOf(ev)[0];
            if (media) {
                var img = el('img', 'tl-focus__media' + (ev.logo ? ' tl-focus__media--logo' : ''));
                img.src = media;
                img.alt = ev.logo ? (ev.logoFor || '') : '';
                card.appendChild(img);
            }
            var kick = el('span', 'tl-focus__kind');
            kick.appendChild(iconSvg(typeInfo(ev.type)));
            kick.appendChild(document.createTextNode(typeInfo(ev.type).label));
            card.appendChild(kick);
            card.appendChild(el('span', 'tl-focus__date', longDate(ev)));
            card.appendChild(el('span', 'tl-focus__title', ev.title));
            // Skip the venue when the city line already names it ('DOKA, Amsterdam' / 'KB, Den Haag').
            var place = ev.city ? ev.city.split(',')[0].trim() : '';
            var venueShown = ev.venue && !(place && (ev.venue.indexOf(place) === 0 || place.indexOf(ev.venue) === 0));
            function namedIn(part) {
                return !!(part && ev.title && ev.title.toLowerCase().indexOf(part.toLowerCase()) !== -1);
            }
            var meta = [namedIn(ev.kind) ? null : ev.kind, venueShown && !namedIn(ev.venue) ? ev.venue : null, ev.city].filter(Boolean).join(' · ');
            if (meta) card.appendChild(el('span', 'tl-focus__meta', meta));
            var desc = ev.tentative ? 'To be confirmed — more details soon.' : ev.description;
            if (desc) card.appendChild(el('span', 'tl-focus__desc', desc));

            var actions = el('div', 'tl-focus__actions');
            if (ev.link) {
                var go = button('Event page ↗', 'nav-link--lit');
                go.href = ev.link;
                actions.appendChild(go);
            }
            // Android → Google Calendar link; everything else → the generated .ics
            // (Safari shows its "Add to Calendar" sheet; desktop opens Calendar / Outlook).
            var C = window.DenCalendar;
            if (C && C.span(ev)) {
                var android = /Android/i.test(navigator.userAgent);
                var add = button('+ Calendar');
                add.href = android ? C.googleHref(ev) : '/calendar/' + C.fileName(ev);
                if (android) { add.target = '_blank'; add.rel = 'noopener noreferrer'; }
                actions.appendChild(add);
            }
            if (n > 1) {
                var nav = el('span', 'tl-focus__nav');
                [['‹', -1, 'Previous event'], ['›', 1, 'Next event']].forEach(function (b) {
                    var btn = el('button', 'nav-link nav-link--icon', b[0]);
                    btn.type = 'button';
                    btn.setAttribute('aria-label', b[2]);
                    btn.addEventListener('click', function () { step(b[1]); });
                    nav.appendChild(btn);
                });
                actions.appendChild(nav);
            }
            card.appendChild(actions);
        }

        // Anchor the card under coming-next, centred on the [+], clamped to the screen
        // edges, and never taller than the space left below it. On phones it always
        // reaches down to the bottom edge, with the buttons at the bottom.
        var GAP = 14, EDGE = 16;
        var phone = window.matchMedia('(max-width: 768px)');
        function place() {
            if (!open) return;
            var u = universe.getBoundingClientRect();
            var m = marker.getBoundingClientRect();
            var below = (title || marker).getBoundingClientRect().bottom;
            var w = panel.offsetWidth;
            var ax = m.left + m.width / 2 - u.left;
            var left = Math.max(EDGE, Math.min(u.width - EDGE - w, ax - w / 2));
            var top = below - u.top + GAP;
            panel.style.left = Math.round(left) + 'px';
            panel.style.top = Math.round(top) + 'px';
            var room = Math.round(u.height - top - EDGE) + 'px';
            panel.style.maxHeight = room;
            panel.style.height = phone.matches ? room : '';
            panel.classList.toggle('tl-focus__panel--fill', phone.matches);
        }
        window.addEventListener('resize', place);

        function step(dir) {
            if (n < 2) return;
            idx = (idx + dir + n) % n;
            lastStep = performance.now();
            render(dir);
        }

        function setOpen(next, at) {
            open = next;
            if (open && typeof at === 'number') idx = at;
            focus.hidden = !open;
            document.body.classList.toggle('is-coming-open', open);
            marker.setAttribute('aria-expanded', String(open));
            if (open) {
                render(0);
                place();
                panel.focus({ preventScroll: true });
            } else {
                marker.focus({ preventScroll: true });
            }
        }

        // [+] and the title open the first event; a listed event opens itself.
        [marker, title].forEach(function (t) {
            if (!t) return;
            t.addEventListener('click', function (e) {
                e.preventDefault();
                setOpen(true, 0);
            });
        });
        Array.prototype.forEach.call(list.children, function (row, i) {
            row.addEventListener('click', function (e) {
                e.preventDefault();
                setOpen(true, i);
            });
        });
        marker.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true, 0);
            }
        });
        document.addEventListener('keydown', function (e) {
            if (!open) return;
            if (e.key === 'Escape') setOpen(false);
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
        });

        // Swipe (touch) or drag (mouse) on the focus view steps between events.
        var sx = 0, sy = 0, tracking = false, swiped = false;
        function startSwipe(x, y) { sx = x; sy = y; tracking = true; swiped = false; }
        function endSwipe(x, y) {
            if (!tracking) return;
            tracking = false;
            var dx = x - sx, dy = y - sy;
            var d = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
            if (Math.abs(d) > 40) { swiped = true; step(d < 0 ? 1 : -1); }
        }
        // A tap on the dimmed backdrop (not the end of a swipe) closes the pop-up.
        focus.addEventListener('click', function (e) {
            if (e.target === focus && !swiped) setOpen(false);
            swiped = false;
        });
        focus.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) startSwipe(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        focus.addEventListener('touchmove', function (e) {
            // Let a long description scroll; otherwise keep the page still.
            if (!e.target.closest('.tl-focus__desc')) e.preventDefault();
        }, { passive: false });
        focus.addEventListener('touchend', function (e) {
            var t = e.changedTouches && e.changedTouches[0];
            if (t) endSwipe(t.clientX, t.clientY);
        }, { passive: true });
        focus.addEventListener('mousedown', function (e) {
            if (!e.target.closest('a, button')) startSwipe(e.clientX, e.clientY);
        });
        window.addEventListener('mouseup', function (e) { endSwipe(e.clientX, e.clientY); });

        return {
            isOpen: function () { return open; },
            // Wheel / trackpad: one event per gesture-sized push, not per pixel.
            wheel: function (e) {
                if (e.target.closest && e.target.closest('.tl-focus__desc')) return;
                e.preventDefault();
                var d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
                wheelAcc += d;
                if (performance.now() - lastStep < 450) { wheelAcc = 0; return; }
                if (Math.abs(wheelAcc) > 60) {
                    step(wheelAcc > 0 ? 1 : -1);
                    wheelAcc = 0;
                }
            }
        };
    }

    function externalLink(node, href) {
        node.href = href;
        if (/^https?:/.test(href)) {
            node.target = '_blank';
            node.rel = 'noopener noreferrer';
        }
    }

    // bannerText: a string, or strings mixed with { text, href } links.
    function appendBannerText(parent, parts) {
        if (!parts) return;
        if (typeof parts === 'string') {
            parent.appendChild(document.createTextNode(parts));
            return;
        }
        parts.forEach(function (part) {
            if (typeof part === 'string') {
                parent.appendChild(document.createTextNode(part));
                return;
            }
            var a = el('a', null, part.text);
            externalLink(a, part.href);
            parent.appendChild(a);
        });
    }

    // Landing highlight. One event with banner: true — a small popup card
    // at the bottom. Stays visible with the font credit (does not fade on scroll).
    function buildBanner(ev) {
        var universe = document.getElementById('timeline');
        if (!universe) return;
        var bannerLabel = ev.bannerTitle || ev.title;
        var shot = ev.type === 'software' ? imagesOf(ev)[0] : null;
        var media = shot || ev.logo || imagesOf(ev)[0];
        var split = !!ev.link && !!(ev.bannerText || ev.bannerCta || ev.bannerCredit || ev.bannerTitle);
        var banner = el(split || !ev.link ? 'aside' : 'a', 'universe-banner');
        banner.id = 'universeBanner';
        banner.setAttribute('aria-label', bannerLabel);
        if (!split && ev.link) externalLink(banner, ev.link);

        var img = null;
        if (media) {
            img = el('img', 'universe-banner__media' + (media === ev.logo ? ' universe-banner__media--logo' : ''));
            img.src = media;
            img.alt = '';
        }

        var title = el('span', 'universe-banner__title', bannerLabel);
        var main = el('div', 'universe-banner__main');
        var body = el('span', 'universe-banner__body');

        if (split) {
            if (img) {
                var logoLink = el('a', 'universe-banner__hit');
                logoLink.setAttribute('aria-label', bannerLabel);
                externalLink(logoLink, ev.link);
                logoLink.appendChild(img);
                main.appendChild(logoLink);
            }
            if (ev.link) {
                var titleLink = el('a', 'universe-banner__event');
                externalLink(titleLink, ev.link);
                titleLink.appendChild(title);
                body.appendChild(titleLink);
            } else {
                body.appendChild(title);
            }
        } else {
            if (img) main.appendChild(img);
            body.appendChild(title);
        }

        var copy = ev.bannerText;
        if (copy == null && !ev.bannerTitle && !ev.bannerCta) copy = ev.description;
        if (copy) {
            var text = el('span', 'universe-banner__text');
            appendBannerText(text, copy);
            body.appendChild(text);
        }

        if (ev.bannerCta && ev.bannerCta.href && ev.bannerCta.text) {
            var cta = el('a', 'universe-banner__cta');
            externalLink(cta, ev.bannerCta.href);
            var ctaIcon = el('img', 'universe-banner__cta-icon');
            ctaIcon.src = '/assets/soundcloud-logo.png';
            ctaIcon.alt = '';
            cta.appendChild(ctaIcon);
            cta.appendChild(document.createTextNode(ev.bannerCta.text));
            body.appendChild(cta);
        }

        main.appendChild(body);
        banner.appendChild(main);

        if (ev.bannerCredit) {
            var credit = el('span', 'universe-banner__credit');
            appendBannerText(credit, ev.bannerCredit);
            banner.appendChild(credit);
        }

        universe.appendChild(banner);
    }

    function initUniverse() {
        var strip = document.getElementById('timelineStrip');
        var canvas = document.getElementById('tlCanvas');
        var svg = document.getElementById('tlSvg');
        if (!strip || !canvas || !svg) return;

        var spotlight = null;
        events.some(function (ev) { if (ev.banner) { spotlight = ev; return true; } });
        if (spotlight) buildBanner(spotlight);

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
        var stacks = nodes.map(function (n) { return n.querySelector('.tl-node__mediastack'); });
        var coming = head ? setupComingTap(nodes[0], upnext) : null;

        var homeScroll = 0;
        var titleFadeAt = HINT_FADE;

        // Intro state. Every input drives one "virtual" position:
        // [0, introDist) plays the intro, beyond that it is strip.scrollLeft + introDist.
        var introDist = 0;
        var introP = head ? 0 : 1;
        var introOffset = 0;   // px the canvas is shifted right so coming-next is centred
        var canvasShift = 0;   // current canvas translateX (intro + overscroll)
        var introScale = 1;    // coming-next scale at the start of the intro
        var titleLift = 0;     // current title rise (px), undone when measuring layout
        var nodeCenters = [];  // node centre x in canvas coordinates (from layout)
        var markerBase = [];   // resting marker centres [x, y] in canvas coordinates
        var nodeOffsets = [];  // current parallax drift [dx, dy] per node
        var overshoot = 0;
        var lineLen = 0;

        function introEase(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function depthOf(i) {
            var f = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
            return 0.35 + 0.65 * (f - Math.floor(f));
        }

        function virtualPos() { return introDist * introP + strip.scrollLeft; }

        function syncChrome() {
            var delta = Math.abs(strip.scrollLeft - homeScroll);
            var hint = document.getElementById('universeHint');
            var title = document.getElementById('universeTitle');
            if (hint) hint.style.opacity = virtualPos() > HINT_FADE ? '0' : '';
            // With an intro the title leaves during it (applyIntro); otherwise fade on scroll.
            // Banner + font credit stay put.
            if (title && !head) title.classList.toggle('is-hidden', delta > titleFadeAt);
        }

        // Position the canvas and fade timeline nodes for the current intro progress.
        function applyIntro() {
            var e = introEase(introP);
            var visual = overshoot ? overshoot / (1 + Math.abs(overshoot) / 150) : 0;
            canvasShift = introOffset * (1 - e) - visual;
            canvas.style.transform = canvasShift ? 'translateX(' + canvasShift + 'px)' : '';
            if (head) {
                // Big while centred, settles to normal size as it docks left. Scales
                // around the marker centre so the line endpoint stays put.
                var scale = introScale + (1 - introScale) * e;
                nodes[0].style.transform = scale !== 1 ? 'scale(' + scale.toFixed(4) + ')' : '';

                // The event list fades out as it docks: only [+] and the title stay,
                // so nothing overlaps the first timeline event.
                var list = nodes[0].querySelector('.tl-node__upnext');
                if (list) {
                    var lo = Math.max(0, 1 - e * 3);
                    list.style.opacity = lo < 1 ? lo.toFixed(3) : '';
                    list.style.visibility = lo <= 0 ? 'hidden' : '';
                }

                // Title drifts up and fades out over the first part of the intro.
                // Banner + font credit stay visible with the ticker.
                var title = document.getElementById('universeTitle');
                if (title) {
                    var t = introEase(Math.min(1, introP / TITLE_OUT));
                    titleLift = TITLE_LIFT * t;
                    title.style.transition = 'none';
                    title.style.transform = t ? 'translate(-50%, calc(-50% - ' + titleLift.toFixed(1) + 'px))' : '';
                    title.style.opacity = t ? (1 - t).toFixed(3) : '';
                    title.style.visibility = t >= 1 ? 'hidden' : '';
                }
            }
            nodes.forEach(function (n, i) {
                if (head && i === 0) return;
                var o = Math.max(0, Math.min(1, e * 1.6 - Math.min(i - 1, 5) * INTRO_STAGGER));
                n.style.opacity = o >= 1 ? '' : o.toFixed(3);
                n.style.pointerEvents = o < 0.5 ? 'none' : '';
            });
            var line = svg.querySelector('polyline');
            if (line && lineLen) {
                line.style.strokeDasharray = e >= 1
                    ? ''
                    : Math.round(INTRO_STUB + e * strip.clientWidth * 1.5) + ' ' + Math.ceil(lineLen);
            }
            strip.classList.toggle('is-intro', introP < 1);
        }

        // Scale up the event nearest the focus line; fades in with the intro.
        function applyFocus() {
            var w = strip.clientWidth || 1;
            var focusX = w * FOCUS_AT;
            var reach = w * FOCUS_REACH;
            var amount = introEase(introP);
            var best = -1, bestK = 0.5;
            nodes.forEach(function (n, i) {
                if (head && i === 0) { nodeOffsets[i] = [0, 0]; return; }
                var x = nodeCenters[i] - strip.scrollLeft + canvasShift;
                var k = Math.max(0, 1 - Math.abs(x - focusX) / reach);
                k = k * k * (3 - 2 * k) * amount; // smoothstep
                // Position across the strip: -1 (left edge) … 0 (centre) … 1 (right edge).
                var side = Math.max(-1.5, Math.min(1.5, (x - focusX) / (w / 2))) * amount;
                // Parallax drift, scaled by a per-event depth.
                var d = side * depthOf(i);
                var dx = -d * PARALLAX_X;
                var dy = d * PARALLAX_Y * (i % 2 ? 1 : -1);
                nodeOffsets[i] = [dx, dy];
                // Gallery: shrink toward the edges, grow at the focus line.
                var sc = 1 - SIDE_SHRINK * Math.min(1, Math.abs(side)) + FOCUS_SCALE * k;
                n.style.transform = 'translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px)' +
                    (Math.abs(sc - 1) > 0.0001 ? ' scale(' + sc.toFixed(4) + ')' : '');
                if (stacks[i]) {
                    var angle = Math.max(-1, Math.min(1, side)) * COVER_ANGLE;
                    stacks[i].style.transform = Math.abs(angle) > 0.05
                        ? 'perspective(600px) rotateY(' + angle.toFixed(2) + 'deg)' : '';
                }
                if (k > bestK) { bestK = k; best = i; }
            });
            writeLine();
            nodes.forEach(function (n, i) { n.classList.toggle('is-focus', i === best); });

            var leftIn = introP < 1 ? 0 : Math.min(1, strip.scrollLeft / EDGE_LEFT_IN);
            strip.style.setProperty('--edge-l', (1 - (1 - EDGE_ALPHA) * leftIn).toFixed(3));
            strip.style.setProperty('--edge-r', EDGE_ALPHA);
        }

        function render() {
            applyIntro();
            applyFocus();
            syncChrome();
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
                var underTitle = titleEl.getBoundingClientRect().bottom + titleLift - stripTop + TITLE_TO_COMING;
                upY = Math.max(14, Math.min(48, (underTitle / stripH) * 100));
            }
            var downY = Math.min(56, upY + (DOWN_BAND_SHARE * 100));

            nodes.forEach(function (n, i) {
                n.style.setProperty('--x', xs[i] + 'px');
                var band = (i % 2 === 0) ? upY : downY;
                var y = Math.min(band, maxYOf(universeEvents[i]));
                n.style.setProperty('--y', y + '%');
            });
            nodeCenters = xs.map(function (x, i) { return x + widths[i] / 2; });
            // Highlight scale pivots on each marker so the timeline line stays attached.
            nodes.forEach(function (n, i) {
                if (head && i === 0) return;
                var m = n.querySelector('.tl-node__marker');
                if (m) {
                    n.style.transformOrigin = (m.offsetLeft + m.offsetWidth / 2) + 'px ' +
                        (m.offsetTop + m.offsetHeight / 2) + 'px';
                }
            });
            // Tail room so the last event can scroll all the way to the focus line.
            var lastI = xs.length - 1;
            canvas.style.width = (xs.length
                ? Math.max(xs[lastI] + widths[lastI] + CANVAS_TAIL,
                    nodeCenters[lastI] + strip.clientWidth * (1 - FOCUS_AT))
                : vw) + 'px';

            // Keep homeScroll at 0 when left-anchored (leftPad already places the start).
            var prevHome = homeScroll;
            homeScroll = 0;
            var delta = strip.scrollLeft - prevHome;
            strip.scrollLeft = Math.max(0, homeScroll + delta);

            // Intro: how far right the canvas starts so coming-next is centred.
            introDist = head ? Math.round(Math.max(INTRO_MIN, window.innerHeight * INTRO_SHARE)) : 0;
            introOffset = head ? Math.round(strip.clientWidth / 2 - (xs[0] + widths[0] / 2)) : 0;
            if (head) {
                // Cap the start size so the scaled block still fits narrow screens.
                introScale = Math.max(1, Math.min(INTRO_SCALE, (strip.clientWidth - 32) / (widths[0] || 1)));
                var marker = nodes[0].querySelector('.tl-node__marker');
                var originY = marker ? marker.offsetTop + marker.offsetHeight / 2 : 0;
                nodes[0].style.transformOrigin = '50% ' + originY + 'px';
            }
            applyIntro();
            drawLines();
            render();
        }

        var lineHoles = [];

        function drawLines() {
            var stripRect = strip.getBoundingClientRect();
            svg.setAttribute('width', canvas.scrollWidth);
            svg.setAttribute('height', strip.clientHeight);
            svg.style.width = canvas.scrollWidth + 'px';
            markerBase = nodes.map(function (n, i) {
                var marker = n.querySelector('.tl-node__marker');
                var r = marker.getBoundingClientRect();
                var off = nodeOffsets[i] || [0, 0];
                // Canvas coordinates: undo the intro/overscroll shift and parallax drift.
                // Fade radius uses the unscaled marker, so the line dissolves before the icon.
                var size = marker.offsetWidth || r.width;
                return [
                    r.left + r.width / 2 - stripRect.left + strip.scrollLeft - canvasShift - off[0],
                    r.top + r.height / 2 - stripRect.top - off[1],
                    Math.max(22, size * 1.2)
                ];
            });
            var holes = markerBase.map(function () {
                return '<circle fill="url(#tlLineHole)"/>';
            }).join('');
            svg.innerHTML =
                '<defs>' +
                    '<radialGradient id="tlLineHole" cx="50%" cy="50%" r="50%">' +
                        '<stop offset="0" stop-color="#000"/>' +
                        '<stop offset="0.34" stop-color="#000"/>' +
                        '<stop offset="1" stop-color="#000" stop-opacity="0"/>' +
                    '</radialGradient>' +
                    '<mask id="tlLineMask" maskUnits="userSpaceOnUse">' +
                        '<rect x="0" y="0" width="' + canvas.scrollWidth + '" height="' + strip.clientHeight + '" fill="#fff"/>' +
                        holes +
                    '</mask>' +
                '</defs>' +
                '<polyline fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1" mask="url(#tlLineMask)"/>';
            lineHoles = svg.querySelectorAll('#tlLineMask circle');
            for (var h = 0; h < lineHoles.length; h++) {
                lineHoles[h].setAttribute('r', markerBase[h][2].toFixed(1));
            }
            writeLine();
            var line = svg.querySelector('polyline');
            lineLen = line && line.getTotalLength ? line.getTotalLength() * 1.2 : 0; // slack for parallax stretch
        }

        // Line through each marker's resting point plus its current parallax drift.
        // Each end fades out in the mask so the stroke never crosses the icon.
        function writeLine() {
            var line = svg.querySelector('polyline');
            if (!line || !markerBase.length) return;
            line.setAttribute('points', markerBase.map(function (p, i) {
                var off = nodeOffsets[i] || [0, 0];
                return (p[0] + off[0]).toFixed(1) + ',' + (p[1] + off[1]).toFixed(1);
            }).join(' '));
            for (var i = 0; i < lineHoles.length; i++) {
                var p = markerBase[i];
                var off = nodeOffsets[i] || [0, 0];
                lineHoles[i].setAttribute('cx', (p[0] + off[0]).toFixed(1));
                lineHoles[i].setAttribute('cy', (p[1] + off[1]).toFixed(1));
            }
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

        function maxScroll() { return strip.scrollWidth - strip.clientWidth; }
        function maxVirtual() { return introDist + maxScroll(); }

        function cancelAnimation() {
            if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; }
        }

        // pos is a virtual position (intro + strip scroll).
        function setScroll(pos, allowOverscroll) {
            var clamped = Math.max(0, Math.min(maxVirtual(), pos));
            introP = introDist ? Math.min(1, clamped / introDist) : 1;
            strip.scrollLeft = Math.max(0, clamped - introDist);
            overshoot = allowOverscroll ? pos - clamped : 0;
            render();
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
                render();
            });
        }

        // Fade title and swipe hint once the user starts exploring
        strip.addEventListener('scroll', function () {
            applyFocus();
            syncChrome();
        }, { passive: true });

        // Vertical wheel/trackpad plays the intro, then drives the strip horizontally
        // (down → into timeline). Horizontal gestures stay native once the intro has
        // played, except a leftward swipe at the start, which rewinds the intro.
        // On the viewport-locked homepage, capture on window so header/chrome still work.
        // Wheel / trackpad is slowed down until the first event is centred, so one
        // full swipe plays the intro and arrives at the first event instead of flying
        // past it. Past it, speed ramps back to normal over WHEEL_RAMP px.
        var WHEEL_SLOW = 0.5;
        var WHEEL_RAMP = 400;

        function firstEventStop() {
            var i = head ? 1 : 0;
            if (i >= nodes.length) return introDist;
            return introDist + Math.max(0, nodeCenters[i] - strip.clientWidth * FOCUS_AT);
        }

        window.addEventListener('wheel', function (e) {
            if (e.ctrlKey) return; // leave pinch-zoom to the browser
            if (coming && coming.isOpen()) { coming.wheel(e); return; }
            var vertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
            var d = vertical ? e.deltaY : e.deltaX;
            var v = virtualPos();
            if (!vertical && introP >= 1 && !(strip.scrollLeft <= 0 && d < 0)) return;
            var max = maxVirtual();
            if (max <= 0) return;
            var past = v - firstEventStop();
            d *= past <= 0 ? WHEEL_SLOW : Math.min(1, WHEEL_SLOW + (1 - WHEEL_SLOW) * past / WHEEL_RAMP);
            var next = Math.max(0, Math.min(max, v + d));
            if (next === v && !overshoot && !animRaf) return;
            cancelAnimation();
            setScroll(next, false);
            e.preventDefault();
        }, { passive: false });

        // Keyboard: arrows / page keys step through the intro and the strip.
        strip.addEventListener('keydown', function (e) {
            if (coming && coming.isOpen()) return;
            var step = { ArrowDown: 80, ArrowRight: 80, ArrowUp: -80, ArrowLeft: -80,
                PageDown: strip.clientWidth * 0.8, PageUp: -strip.clientWidth * 0.8 }[e.key];
            if (!step) return;
            cancelAnimation();
            setScroll(virtualPos() + step, false);
            e.preventDefault();
        });

        // Drag-to-scroll with the mouse
        var dragging = false, dragMoved = false, startX = 0, startScroll = 0;
        strip.addEventListener('mousedown', function (e) {
            cancelAnimation();
            setScroll(virtualPos(), false);
            dragging = true;
            dragMoved = false;
            startX = e.pageX;
            startScroll = virtualPos();
            strip.classList.add('is-dragging');
        });
        window.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            var dx = e.pageX - startX;
            if (Math.abs(dx) > 5) dragMoved = true;
            setScroll(startScroll - dx, false);
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
            touchStartScroll = virtualPos() + overshoot;
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
        // Touch snapping: a swipe moves one stop (next / previous event, centred on the
        // focus line); a short drag settles on the nearest stop. Stop 0 is the intro
        // start (coming-next centred); stop k is event k centred.
        function snapStops() {
            var w = strip.clientWidth;
            var stops = head ? [0] : [];
            for (var i = head ? 1 : 0; i < nodes.length; i++) {
                stops.push(introDist + Math.max(0, nodeCenters[i] - w * FOCUS_AT));
            }
            var max = maxVirtual();
            return stops.map(function (v) { return Math.min(max, v); });
        }

        function nearestStop(stops, v) {
            var best = 0;
            stops.forEach(function (s, i) {
                if (Math.abs(s - v) < Math.abs(stops[best] - v)) best = i;
            });
            return best;
        }

        function animateTo(target) {
            cancelAnimation();
            var from = virtualPos();
            if (reduceMotion || Math.abs(target - from) < 1) { setScroll(target, false); return; }
            var t0 = performance.now();
            var DURATION = Math.min(520, 260 + Math.abs(target - from) * 0.4);
            animRaf = requestAnimationFrame(function frame(now) {
                var t = Math.min(1, (now - t0) / DURATION);
                setScroll(from + (target - from) * (1 - Math.pow(1 - t, 3)), false);
                animRaf = t < 1 ? requestAnimationFrame(frame) : null;
            });
        }

        function touchRelease(e) {
            if (!touchDragging) return;
            touchDragging = false;
            var moved = touchAxis !== null; // a plain tap must not snap
            touchAxis = null;
            if (overshoot) { springBack(); return; }
            if (!moved) return;
            // A finger that rested before lifting shouldn't count as a flick.
            var stale = !touchLastTime ||
                ((e.timeStamp || performance.now()) - touchLastTime) > 80;
            var v = stale ? 0 : touchVelocity;
            var travel = virtualPos() - touchStartScroll;
            var stops = snapStops();
            if (!stops.length) return;
            var from = nearestStop(stops, touchStartScroll);
            var dir = Math.abs(v) > 0.3 ? Math.sign(v) : (Math.abs(travel) > 40 ? Math.sign(travel) : 0);
            var to = dir ? Math.max(0, Math.min(stops.length - 1, from + dir))
                         : nearestStop(stops, virtualPos());
            animateTo(stops[to]);
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
                e.stopPropagation(); // a drag must not also tap the coming-next control
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
        var item = el('li', 'log-item' + (upcoming ? ' log-item--upcoming' : '') +
            (ev.featured ? ' log-item--featured' : ''));

        var metaParts = [logDate(ev)];
        if (ev.city) metaParts.push(ev.city);
        item.appendChild(el('p', 'log-meta', metaParts.join(' · ')));

        if (upcoming) item.appendChild(el('p', 'log-status', 'upcoming'));

        var title = el('h3', 'log-title');
        var holder = title;
        if (ev.link) {
            holder = el('a');
            holder.href = ev.link;
            if (/^https?:/.test(ev.link)) {
                holder.target = '_blank';
                holder.rel = 'noopener noreferrer';
            }
            title.appendChild(holder);
        }
        appendLogoTitle(holder, ev, 'log-title__logo');
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
