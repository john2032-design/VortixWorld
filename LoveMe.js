const EAS_API_KEY = ".john2032-3253f-3262k-3631f-2626j-9078k";
const EAS_API_URL = "https://api.eas-x.com/v3/bypass";

function easBypass(url) {
    return new Promise((resolve, reject) => {
        if (!url || typeof url !== 'string') {
            reject(new Error('Invalid URL'));
            return;
        }
        
        fetch(EAS_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'eas-api-key': EAS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        });
    });
}

if (typeof window !== 'undefined') {
    window.easBypass = easBypass;
}
