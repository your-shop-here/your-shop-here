# B2C Commerce Trial Signup Application

This is a Heroku application that provides a simple interface for creating B2C Commerce trial environments.

## Setup Instructions

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Set the following environment variables in Heroku:
```bash
heroku config:set CLIENT_ID=your_client_id
heroku config:set CLIENT_SECRET=your_client_secret
heroku config:set REALM=your_realm
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASSWORD=your_email_app_password
heroku config:set SESSION_SECRET=git
```

3. Deploy to Heroku:
```bash
git add .
git commit -m "Initial commit"
git push heroku main
```

## Environment Variables

- `CLIENT_ID`: Your B2C Commerce API client ID
- `CLIENT_SECRET`: Your B2C Commerce API client secret
- `REALM`: Your B2C Commerce realm
- `EMAIL_USER`: Gmail address for sending notifications
- `EMAIL_PASSWORD`: Gmail app password for sending notifications
- `SESSION_SECRET`: Secret key for session management

## Features

- Password-protected access
- Email-based trial environment creation
- Automatic sandbox creation using sfcc-ci
- Email notifications with environment URLs
- Salesforce Lightning Design System UI

## Requirements

- Node.js 18.x
- sfcc-ci CLI tool installed on the Heroku dyno
- Valid B2C Commerce API credentials 