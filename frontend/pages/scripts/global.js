const baseUrl = window.location.origin;

document.addEventListener('DOMContentLoaded', (event) => {
    function setHref(className, path) {
        const aTags = document.getElementsByClassName(className);
        Array.from(aTags).forEach(aTag => {
            aTag.setAttribute('href', `${baseUrl}/${path}`);
        });
    }

    setHref("landingATag", "landing");
    setHref("homeATag", "home");
    setHref("signupATag", "signup");
    setHref("signinATag", "signin");
    setHref("profileATag", "profile");
    setHref("historyATag", "history");
    setHref("wishListATag", "wishlist");
});