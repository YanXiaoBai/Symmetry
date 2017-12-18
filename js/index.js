$(document).ready(function() {
    $(".st_btn").click(function() {
        window.location = "main.html"
    });
    $(".st_btn").hover(function() {
            $(this).animate({ "opacity": "1" }, 100);
        },
        function() {
            $(this).animate({ "opacity": "0.4" }, 100);
        });
});