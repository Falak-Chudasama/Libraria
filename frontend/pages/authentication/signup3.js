const house = document.getElementById('house');
const street = document.getElementById('street');
const landmark = document.getElementById('landmark');
const city = document.getElementById('city');
const state = document.getElementById('state');
const zipCode = document.getElementById('zipcode');
const signupForm3 = document.getElementById('signup3-form');

const urlOrigin = window.location.origin;

const handleSignup3 = async (event) => {
    event.preventDefault();
    try {
        inputCheck(zipCode.value);
        registerUser({
            "username": localStorage.getItem('username'),
            "password": localStorage.getItem('password'),
            "firstName": localStorage.getItem('firstName'),
            "lastName": localStorage.getItem('lastName'),
            "email": localStorage.getItem('email'),
            "mobileNo": localStorage.getItem('mobile'),
            "address": {
                "house": house.value,
                "street": street.value,
                "landmark": landmark.value,
                "city": city.value,
                "state": state.value,
                "zipCode": zipCode.value,
            }
        })
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
    try {
        const response = await fetch(`${urlOrigin}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userObject)
        })
        .then((data) => data.json())
        .then((data) => data)
        .catch((err) => {
            throw new Error(err);
        });

        console.log(response);

        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('user', JSON.stringify(response.user));
        sessionStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        window.location.href = `${urlOrigin}/home`;
    
        return response?.message;
    } catch (err) {
        console.error(err);
        console.error(err.message);
    }
};

signupForm3.addEventListener('submit', handleSignup3);