const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

module.exports = [
    {
        scope: {
            country: '*',
        },
        fields: {
            loginEmail: {
                validation: (value) => emailRegex.test(value),
                required: true,
                type: 'email',
                binding: 'email',
            },
            loginPassword: {
                validation: (value) => value && value.length >= 8,
                required: true,
                type: 'password',
                binding: 'password',
            },
            rememberMe: {
                type: 'checkbox',
                binding: 'rememberMe',
                default: false,
            },
        },
    },
];
