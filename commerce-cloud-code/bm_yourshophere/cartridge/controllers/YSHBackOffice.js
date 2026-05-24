const start = function start() {
    response.writer.print(`
    <html>
        <head><title>Placeholder</title></head>
        <body>
            <h1>Placeholder</h1>
            <p>Sorry Nothing the see here</p>    
            <a href="#" onclick="history.go(-1)" role="button">Go Back</a>
        </body>
    </html>
    `);
};
start.public = true;

exports.Start = start;
