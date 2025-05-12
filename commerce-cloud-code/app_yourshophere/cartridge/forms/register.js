const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10}$/;
const nameRegex = /^[a-zA-Z\s-']{2,}$/;

module.exports = [
    {
        scope: {
            country: '*',
        },
        fields: {
            firstName: {
                validation: (value) => nameRegex.test(value),
                required: true,
                type: 'text',
                label: 'form.input.firstname.label',
                binding: 'firstName',
            },
            lastName: {
                validation: (value) => nameRegex.test(value),
                required: true,
                type: 'text',
                label: 'form.input.lastname.label',
                binding: 'lastName',
            },
            phone: {
                validation: (value) => phoneRegex.test(value),
                required: true,
                type: 'tel',
                label: 'form.input.phone.label',
                binding: 'phone',
                placeholder: 'Example: 9234567890',
            },
            email: {
                validation: (value) => emailRegex.test(value),
                required: true,
                type: 'email',
                label: 'form.input.email.label',
                binding: 'email',
            },
            password: {
                validation: (value) => value && value.length >= 8,
                required: true,
                type: 'password',
                label: 'form.input.password.label',
                binding: 'password',
            },
            passwordConfirm: {
                required: true,
                type: 'password',
                label: 'form.input.passwordconfirm.label',
                binding: 'passwordConfirm',
            },
        },
    },
];
