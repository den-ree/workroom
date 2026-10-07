// Calendar invites for timeline events, shared by the homepage card (js/timeline.js)
// and the deploy step (scripts/build-calendar.js), which writes one file per dated
// event to /calendar/<fileName(ev)>. iOS Safari only adds an invite from a real
// .ics URL (not a data: URL), hence the generated files.
(function (root) {
    'use strict';

    function hasFullDate(ev) {
        return /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '');
    }

    // Calendar timing for an upcoming event (full dates only). With ev.time ('21:00')
    // it is a timed event in ev.tz (default Europe/Amsterdam), ending at ev.endTime
    // (next day if earlier than the start) or 2 h later; without it, an all-day event.
    function span(ev) {
        if (!hasFullDate(ev)) return null;
        var p = ev.date.split('-').map(Number);
        if (!/^\d{1,2}:\d{2}$/.test(ev.time || '')) {
            var next = new Date(Date.UTC(p[0], p[1] - 1, p[2] + 1));
            return { allDay: true, start: ev.date.replace(/-/g, ''), end: next.toISOString().slice(0, 10).replace(/-/g, '') };
        }
        var tz = ev.tz || 'Europe/Amsterdam';
        // Wall-clock time in tz → UTC (offset taken for that very date, so DST is right).
        function toUtc(y, mo, d, hhmm) {
            var t = hhmm.split(':').map(Number);
            var guess = Date.UTC(y, mo, d, t[0], t[1]);
            var parts = {};
            new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit',
                day: '2-digit', hour: '2-digit', minute: '2-digit'
            }).formatToParts(new Date(guess)).forEach(function (x) { parts[x.type] = +x.value; });
            var asLocal = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
            return new Date(guess - (asLocal - guess));
        }
        var start = toUtc(p[0], p[1] - 1, p[2], ev.time);
        var end;
        if (/^\d{1,2}:\d{2}$/.test(ev.endTime || '')) {
            end = toUtc(p[0], p[1] - 1, p[2], ev.endTime);
            if (end <= start) end = toUtc(p[0], p[1] - 1, p[2] + 1, ev.endTime);
        } else {
            end = new Date(start.getTime() + 2 * 3600000);
        }
        var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
        return { allDay: false, start: fmt(start), end: fmt(end) };
    }

    // 'Venue, address' — the venue is skipped when the place already starts with it
    // (city: 'DOKA, Amsterdam, NL' with venue 'DOKA').
    function place(ev) {
        var where = ev.address || ev.city || '';
        var first = where.split(',')[0].trim();
        var named = ev.venue && first && (ev.venue.indexOf(first) === 0 || first.indexOf(ev.venue) === 0);
        return [named ? null : ev.venue, where].filter(Boolean).join(', ');
    }

    // .ics file contents — Apple Calendar (iOS / macOS), Outlook, most desktop apps.
    function ics(ev) {
        var when = span(ev);
        if (!when) return null;
        var esc = function (t) { return String(t || '').replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n'); };
        var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
        var lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//denree.nl//timeline//EN',
            'BEGIN:VEVENT',
            'UID:' + ev.date + '-' + ev.title.replace(/\W+/g, '-').toLowerCase() + '@denree.nl',
            'DTSTAMP:' + stamp,
            when.allDay ? 'DTSTART;VALUE=DATE:' + when.start : 'DTSTART:' + when.start,
            when.allDay ? 'DTEND;VALUE=DATE:' + when.end : 'DTEND:' + when.end,
            'SUMMARY:' + esc('Den Ree — ' + ev.title),
            'LOCATION:' + esc(place(ev)),
            ev.link ? 'URL:' + ev.link : '',
            ev.description ? 'DESCRIPTION:' + esc(ev.description + (ev.link ? '\n' + ev.link : '')) : '',
            'END:VEVENT', 'END:VCALENDAR'
        ].filter(Boolean);
        return lines.join('\r\n') + '\r\n';
    }

    // Google Calendar "add event" link — used on Android, where .ics files don't open
    // straight into a calendar.
    function googleHref(ev) {
        var when = span(ev);
        if (!when) return null;
        var q = [
            'action=TEMPLATE',
            'text=' + encodeURIComponent('Den Ree — ' + ev.title),
            'dates=' + when.start + '/' + when.end,
            'location=' + encodeURIComponent(place(ev)),
            'details=' + encodeURIComponent([ev.description, ev.link].filter(Boolean).join('\n'))
        ];
        return 'https://calendar.google.com/calendar/render?' + q.join('&');
    }

    // '2026-10-21-ade-live-coding-sessions.ics'
    function fileName(ev) {
        var slug = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return ev.date + '-' + slug + '.ics';
    }

    var api = { span: span, ics: ics, googleHref: googleHref, fileName: fileName };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.DenCalendar = api;
})(this);
