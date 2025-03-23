const firstName = document.getElementById('first-name');
const lastName = document.getElementById('last-name');
const mobile = document.getElementById('mobile');
const email = document.getElementById('email');
const signupForm2 = document.getElementById('signup2-form');

const urlOrigin = window.location.origin;

const handleSignup2 = async (event) => {
    event.preventDefault();
    try {
        inputCheck(mobile.value);
        localStorage.setItem('firstName', firstName.value);
        localStorage.setItem('lastName', lastName.value);
        localStorage.setItem('mobile', mobile.value);
        localStorage.setItem('email', email.value);
        window.location.href = `${urlOrigin}/signup3`;
    } catch (err) {
        console.error(err);
    }
};

const inputCheck = (mobile) => {
    if (mobile.length !== 10) {
        throw new Error('invalid mobile number');
    }

    return true;
};

signupForm2.addEventListener('submit', handleSignup2);