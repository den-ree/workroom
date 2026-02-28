/**
 * Preview link tooltip: compact hover preview for internal journal links.
 * Links need class="preview-link" and data-preview-title, data-preview-desc; data-preview-image optional.
 */
(function () {
    var SHOW_DELAY_MS = 300;
    var DESC_MAX_LENGTH = 75;

    function truncate(str, maxLen) {
        if (!str || str.length <= maxLen) return str || '';
        return str.slice(0, maxLen).trim() + '\u2026';
    }

    function buildTooltip(link) {
        var title = link.getAttribute('data-preview-title') || '';
        var desc = link.getAttribute('data-preview-desc') || '';
        var imgSrc = link.getAttribute('data-preview-image');

        var wrap = document.createElement('div');
        wrap.className = 'preview-tooltip';
        wrap.setAttribute('role', 'tooltip');

        var inner = document.createElement('div');
        inner.className = 'preview-tooltip__inner';

        if (imgSrc) {
            var img = document.createElement('img');
            img.className = 'preview-tooltip__img';
            img.src = imgSrc;
            img.alt = '';
            img.loading = 'lazy';
            inner.appendChild(img);
        }

        var text = document.createElement('div');
        text.className = 'preview-tooltip__text';
        var titleEl = document.createElement('span');
        titleEl.className = 'preview-tooltip__title';
        titleEl.textContent = title;
        var descEl = document.createElement('span');
        descEl.className = 'preview-tooltip__desc';
        descEl.textContent = truncate(desc, DESC_MAX_LENGTH);
        text.appendChild(titleEl);
        text.appendChild(descEl);
        inner.appendChild(text);

        wrap.appendChild(inner);
        return wrap;
    }

    function positionTooltip(tooltip, link) {
        var rect = link.getBoundingClientRect();
        var tw = tooltip.offsetWidth;
        var th = tooltip.offsetHeight;
        var padding = 8;
        var spaceBelow = window.innerHeight - rect.bottom;
        var spaceAbove = rect.top;
        var showAbove = spaceBelow < th + padding && spaceAbove >= th + padding;

        var left = rect.left + (rect.width / 2) - (tw / 2);
        left = Math.max(padding, Math.min(left, window.innerWidth - tw - padding));

        var top;
        if (showAbove) {
            top = rect.top - th - padding;
        } else {
            top = rect.bottom + padding;
        }
        top = Math.max(padding, Math.min(top, window.innerHeight - th - padding));

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function init() {
        var links = document.querySelectorAll('.preview-link');
        if (!links.length) return;

        var tooltip = null;
        var showTimer = null;
        var hideTimer = null;

        function clearShowTimer() {
            if (showTimer) {
                clearTimeout(showTimer);
                showTimer = null;
            }
        }
        function clearHideTimer() {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
        }

        function hide() {
            clearShowTimer();
            clearHideTimer();
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
        }

        function show(link) {
            clearShowTimer();
            hide();
            tooltip = buildTooltip(link);
            document.body.appendChild(tooltip);
            positionTooltip(tooltip, link);

            tooltip.addEventListener('mouseenter', clearHideTimer);
            tooltip.addEventListener('mouseleave', function () {
                hide();
            });
        }

        links.forEach(function (link) {
            link.addEventListener('mouseenter', function () {
                clearHideTimer();
                clearShowTimer();
                showTimer = setTimeout(function () {
                    showTimer = null;
                    show(link);
                }, SHOW_DELAY_MS);
            });
            link.addEventListener('mouseleave', function () {
                clearShowTimer();
                if (tooltip) {
                    hideTimer = setTimeout(hide, 150);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
