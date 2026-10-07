// Timeline data - the single source of truth for:
//   - the homepage universe (/)          → all events
//   - the performance log (/music)      → events with type 'live'
//
// HOW TO ADD AN EVENT: prepend an object to the array below (keep newest first).
// Full field reference and workflow: .claude/skills/add-timeline-event/SKILL.md
//
// Fields:
//   type         'live' | 'public' | 'journal' | 'software' | 'release'
//                (sets node color; only 'live' appears on /music)
//   date         'YYYY-MM-DD', 'YYYY-MM' (month known, day TBD), or 'YYYY'
//                when only the year is known. Full-date and month-precision
//                events in the future are shown as "upcoming" automatically —
//                no flag to flip after the show. Year-only is never upcoming.
//                Upcoming items feed the homepage NEXT list (and /music
//                Upcoming) only - they are not strip nodes.
//   tentative    Optional. true = unconfirmed ("more details soon"); shown with
//                a [tbc] marker in the NEXT list.
//   title        Event name (plain text)
//   kind         Optional. Performance type on the NEXT list second line,
//                e.g. 'Algorave', 'Performance / Installation'.
//   city         Optional. Shown as 'City, Country' (e.g. 'Rotterdam, NL').
//   venue        Optional. Shown as a plain badge on /music.
//   link         Optional. Event page / tickets / recap / app / post URL.
//   description  Optional. One sentence, shown on /music only.
//   badges       Optional. Type badges on /music, e.g. ['livecoding', 'a/v'].
//                Colored keys: livecoding, ai, newmedia. Anything else renders plain.
//   importance   'major' | 'normal' | 'minor'. Controls node size on the homepage:
//                major = main performances (big marker), minor = small notes.
//                Defaults: journal → 'minor', everything else → 'normal'.
//   images       Optional. 1-3 image paths pinned to the homepage node as a photo
//                stack, e.g. ['/images/a.jpg', '/images/b.jpg']. First image on top.
//   imageFit     Optional. 'contain' for screenshots/logos (dark padding, no crop).
//   imageRatio   Optional. CSS aspect-ratio for the media frame, e.g. '16/10',
//                '1/1', or exact pixels '2276/1898'. Width stays from node size;
//                height follows the ratio. Use with imageFit:'contain' when the
//                asset isn't ~3:2.
//   chip         Optional. Small media hint on the homepage node, e.g. '▶ listen'.
//                Upcoming events: images[0] is shown as a small preview thumbnail
//                next to the event in the homepage "coming next" list.
//   logo         Optional. Organiser/festival logo (square image) shown as a small
//                badge after the event line in the homepage "coming next" list,
//                e.g. '/images/logos/ade.png'.
//   logoFor      Optional, with logo. Word in the title the logo replaces on the
//                homepage (e.g. 'ADE' → "21.10 - [logo] - Live Coding Sessions").
//                /music keeps the plain-text title.
//   time         Optional. Start time 'HH:MM' (local to the venue). Makes the
//                "+ Calendar" invite a timed event instead of all-day.
//   endTime      Optional. End time 'HH:MM'; earlier than time = next day.
//                Without it, the invite lasts 2 hours.
//   tz           Optional. IANA time zone, default 'Europe/Amsterdam'
//                (covers NL, FR, DE, BE…; set e.g. 'Europe/London' for the UK).
//   address      Optional. Street address for the invite / map pin, e.g.
//                'Ketelmakerij 4, Amsterdam'. Falls back to city.

window.TIMELINE_EVENTS = [
    {
        type: 'live',
        date: '2026-11-06',
        title: 'ZONE XP',
        kind: 'Algorave',
        city: 'Lyon, FR',
        venue: 'Le Sucre',
        link: 'https://www.grame.fr/',
        description: 'Algorave evening at Le Sucre for the first edition of Grame Festival ZONE XP.',
        badges: ['livecoding', 'algorave'],
    },
    {
        type: 'live',
        date: '2026-10-29',
        title: 'KB - Festival Broncode',
        kind: 'A/V Performance',
        city: 'KB, Den Haag, NL',
        venue: 'KB nationale bibliotheek',
        link: 'https://www.kb.nl/agenda/broncode-taal-het-ai-tijdperk',
        description: 'NDA/ (Niki Scheijen & Den Ree) play a Machine Music live VJ set at Festival Broncode, the opening night of the KB exhibition “Broncode: boeken in het AI-tijdperk”.',
        badges: ['livecoding', 'ai', 'a/v'],
    },
    {
        type: 'live',
        date: '2026-10-21',
        title: 'ADE - Live Coding Sessions',
        kind: 'Algorave',
        city: 'DOKA, Amsterdam, NL',
        venue: 'DOKA',
        link: 'https://www.amsterdam-dance-event.nl/en/artists-speakers/den-ree/2861432/',
        logo: '/images/logos/ade.png',
        logoFor: 'ADE',
        description: 'Season-closing Algorave at Doka during ADE, with first-time guests including Den Ree.',
        badges: ['livecoding', 'algorave'],
    },
    {
        type: 'live',
        date: '2026-09-18',
        title: 'GRAW: BOIS with Rik Mertens',
        kind: 'Performance / Installation',
        city: 'Rotterdam, NL',
        venue: 'De Achtertuin',
        link: 'https://soundcloud.com/den-ree/bois',
        description: 'Premiere of BOIS, a new live set with Rik Mertens, at De Achtertuin during Groot Rotterdams Atelier Weekend — group show and COUNTERBODIES 6th edition.',
        badges: ['livecoding', 'a/v'],
        chip: '▶ listen',
    },
    {
        type: 'software',
        date: '2026-08-18',
        title: 'Tapelet: Multitrack Recorder',
        link: 'https://apps.apple.com/app/tapelet-multitrack-recorder/id6762547842?mt=12',
        chip: '↗ try',
        images: ['/images/app-2.png'],
        imageFit: 'contain',
        imageRatio: '2496/2122',
    },
    {
        type: 'public',
        date: '2026-06-24',
        title: 'Beeld & Geluid: Open Culture Tech Residency',
        importance: 'minor',
        city: 'Hilversum',
        venue: 'Beeld & Geluid',
        link: 'https://publications.beeldengeluid.nl/pub/2575/Open-Culture-Tech-publication-Opening-the-Code-Expanding-the-Stage.pdf',
        description: 'Open Culture Tech is a residency program that helps artists get hands-on with AI and immersive tech, built on public values and open source from the start.',
        badges: ['livecoding', 'a/v'],
        images: ['/images/beeldengeluid-1.jpeg', '/images/beeldengeluid-2.jpeg'],
    },
    {
        type: 'live',
        date: '2026-05-28',
        importance: 'major',
        title: 'EXPORT × Boijmans: Night Pioneers',
        city: 'Rotterdam',
        venue: 'Export',
        link: 'https://www.boijmans.nl/activiteiten/pixel-pioneers-drie-avonden-over-digitale-kunst-en-technologie',
        description: 'An evening on digital art in nightlife culture - DJs, VJs, and live coders at the intersection of technology and subculture, part of the Pixel Pioneers exhibition programme of Museum Boijmans Van Beuningen.',
        badges: ['livecoding', 'a/v'],
        images: ['/images/export-0.jpg', '/images/export-1.jpg', '/images/export-2.jpg'],
    },
    {
        type: 'software',
        date: '2026-04-09',
        importance: 'minor',
        title: 'Tapelet Beta Release',
        link: 'https://tapelet.com/',
        chip: '↗ try',
    },
    {
        type: 'journal',
        date: '2026-03-06',
        title: 'Finding Algoraves',
        city: 'Rotterdam',
        link: '/journal/finding-algoraves',
    },
    {
        type: 'journal',
        date: '2026-02-28',
        title: 'Wearing the Suit',
        city: 'Rotterdam',
        link: '/journal/wearing-the-suit',
    },
    {
        type: 'live',
        date: '2026-02-20',
        importance: 'major',
        title: 'Algorave: Vondelbunker',
        city: 'Amsterdam',
        venue: 'Vondelbunker',
        link: 'https://radar.squat.net/nl/node/565714',
        description: 'Machine Music at the iconic Vondelbunker.',
        badges: ['livecoding', 'algorave'],
        images: ['/images/vondelbunker-1.jpeg', '/images/vondelbunker-2.jpeg'],
    },
    {
        type: 'live',
        date: '2026-02-14',
        importance: 'minor',
        title: 'Cars 2 Carnaval',
        city: 'Eindhoven',
        badges: ['livecoding'],
        images: ['/images/cars2-1.jpeg'],
    },
    {
        type: 'public',
        date: '2025-12-08',
        importance: 'minor',
        title: 'TOPLAP 48h Stream: From Scratch',
        city: 'Den Haag',
        venue: 'RNDR',
        badges: ['livecoding', 'from scratch'],
    },
    {
        type: 'release',
        date: '2025-12-01',
        title: 'Machine Music Live',
        city: 'SoundCloud',
        link: 'https://soundcloud.com/den-ree/machine-music-by-den-ree-x-nikilia',
        chip: '▶ listen',
    },
    {
        type: 'public',
        date: '2025-11-28',
        title: 'ITERATIONS: From Scratch',
        city: 'Den Haag',
        badges: ['livecoding', 'from scratch'],
    },
    {
        type: 'journal',
        date: '2025-09-11',
        title: 'Why blanche?',
        city: 'Amsterdam',
        link: '/journal/why-blanche',
    },
    {
        type: 'live',
        date: '2025',
        importance: 'major',
        title: 'V2_ Live: “Mirage”',
        city: 'Rotterdam',
        venue: 'V2_',
        link: 'https://v2.nl/pages/v2_live-residencies',
        description: 'Machine Music premiere, developed during a residency at V2_ Lab for the Unstable Media.',
        badges: ['livecoding', 'a/v'],
        images: ['/images/v2-1.jpg', '/images/v2-2.jpg', '/images/v2-3.jpg'],
    },
];
