document.addEventListener("DOMContentLoaded", function () {

    function animateCount(el) {

        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 900;
        const start = performance.now();

        function step(now) {

            const progress = Math.min((now - start) / duration, 1);
            const value = Math.floor(progress * target);

            el.textContent = value + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    document.querySelectorAll(".stats-row h3[data-count]").forEach(function (el, i) {
        setTimeout(function () {
            animateCount(el);
        }, 300 + i * 150);
    });

});