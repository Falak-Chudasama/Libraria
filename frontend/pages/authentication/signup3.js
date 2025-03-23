const house = document.getElementById('house');
const street = document.getElementById('street');
const landmark = document.getElementById('landmark');
const city = document.getElementById('city');
const state = document.getElementById('state');
const zipcode = document.getElementById('zipcode');
const signupForm3 = document.getElementById('signup3-form');

const handleSignup3 = async (event) => {
    event.preventDefault();
    try {
        inputCheck(zipcode.value);
    } catch (err) {
        console.error(err);
    }
};

const inputCheck = (zipcode) => {
    if (zipcode.length !== 5) {
        throw new Error('Invalid zipcode');
    }

    return true;
};

const registerUser = async (userObject) => {
    
}

signupForm3.addEventListener('submit', handleSignup3);