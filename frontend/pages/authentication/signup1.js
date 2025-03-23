const username = document.getElementById('username');
const password = document.getElementById('password');
const signupForm1 = document.getElementById('signup1-form');

const urlOrigin = window.location.origin;

const handleSignup1 = async (event) => {
    event.preventDefault();
    try {
        inputCheck(username.value, password.value);
        localStorage.setItem('username', username.value);
        localStorage.setItem('password', password.value);
        window.location.href = `${urlOrigin}/signup2`;
    } catch (err) {
        console.error(err);
    }
}

const inputCheck = (username, password) => {
    if (!username || username.trim() === '') {
        throw new Error('username was not passed');
    }
    if (!password || password.trim() === '') {
        throw new Error('password was not passed');
    }
    
    if (username.length > 20) {
        throw new Error('username should be less than or equal to 20 characters long');
    } else if (username.length < 8) {
        throw new Error('username should be greater than or equal to 8 characters long');
    } 
    
    if (password.length > 100) {
        throw new Error('password should be less than or equal to 100 characters long');
    } else if (password.length < 8) {
        throw new Error('password should be greater than or equal to 8 characters long');
    }

    return true;
};


signupForm1.addEventListener('submit', handleSignup1);