require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Routes
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, 'public/signup.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public/login.html'));
    }
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === 'HikeNotCode') {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid password' });
    }
});

app.post('/signup', async (req, res) => {
    const { email } = req.body;

    try {
        // Authenticate with sfcc-ci
        await executeCommand(`sfcc-ci client:auth --client-id ${process.env.CLIENT_ID} --client-secret ${process.env.CLIENT_SECRET}`);

        // Create sandbox
        const sandboxResult = await executeCommand(`sfcc-ci sandbox:create --realm ${process.env.REALM}`);
        const sandboxData = JSON.parse(sandboxResult);

        // Run npm install and build
        await executeCommand('npm install');
        await executeCommand('npm run all');

        // Send email
        await sendEmail(email, sandboxData);

        res.json({
            success: true,
            businessManager: `https://${sandboxData.hostname}/on/demandware.store/Sites-Site/default/ViewApplication-BM`,
            storefront: `https://${sandboxData.hostname}/s/YourShopHere`,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper functions
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}

async function sendEmail(email, sandboxData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your B2C Commerce Trial Environment is Ready!',
        html: `
            <h1>Welcome to B2C Commerce!</h1>
            <p>Your trial environment has been created successfully.</p>
            <p>Business Manager URL: <a href="https://${sandboxData.hostname}/on/demandware.store/Sites-Site/default/ViewApplication-BM">https://${sandboxData.hostname}/on/demandware.store/Sites-Site/default/ViewApplication-BM</a></p>
            <p>Storefront URL: <a href="https://${sandboxData.hostname}/s/YourShopHere">https://${sandboxData.hostname}/s/YourShopHere</a></p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
