const baseOrigin = window.location.origin;

const dashboard = document.getElementById('dashboard');
const homeBtn = document.getElementById('home-button');

document.addEventListener('DOMContentLoaded', () => {
    let url = "http://localhost:3000/uploads/users/dashboard/arthurMorganDashboard.jpg";
    dashboard.style.background = `url(${url}) lightgray 50% / cover no-repeat`;
});

homeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = `${baseOrigin}/home`;
});