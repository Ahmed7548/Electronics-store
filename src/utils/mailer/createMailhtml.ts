export default (href:string):string=>{


    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>verify your email </title>
    </head>
    <body>
        <h1>VERIFY YOUR EMAIL</h1>
        <p>
            click <a href=${href}>here</a> to verify your email
        </p>
    </body>
    </html>`
}