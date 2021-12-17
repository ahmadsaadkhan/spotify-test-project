const express = require('express')
const cors = require('cors')
const spotifyWebApi = require('spotify-web-api-node')

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express()
const port = 8000
app.use(cors())
app.use(express.json());

const credentials = {
    clientId: '2adabf750c5b4889a583f7d05164243e',
    clientSecret: '41c9208fe3024dbba8a2fdf7c40b13c0',
    redirectUri: 'http://localhost:3000/',
};

app.get('/', (req, res) => {
    res.send('Welcome to spotify project app api.')
})

app.get('/', (req, res) => {
    console.log('Hello World!')
})



app.post('/login', (req, res) => {
    let spotifyApi = new spotifyWebApi(credentials)
    const code = req.body.code
    spotifyApi.authorizationCodeGrant(code).then((data) => {
            res.json({
                accessToken: data.body.access_token,
            })
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400)
        })

})


app.post('/quotes', async(req, res) => {
    const authorName = req.body.author;
    const quote = {
        quote: req.body.quote
    };

    console.log(req.body.quote)

    if (!authorName || !quote.quote) {
        return res.json({ message: 'Either quote or author is missing' });
    }

    try {
        const message = 'success';
        const author = await prisma.author.findFirst({
            where: { name: authorName }
        });

        if (!author) {
            await prisma.author.create({
                data: {
                    'name': authorName,
                    Quotes: {
                        create: quote
                    }
                }
            });
            console.log('Created author and then the related quote');
            return res.json({ message });
        }

        await prisma.quote.create({
            data: {
                quote: quote.quote,
                author: { connect: { name: authorName } }
            }
        });
        console.log('Created quote for an existing author');
        return res.json({ message });
    } catch (e) {
        console.error(e);
        return res.json({ message: 'failed' });
    }
});


app.get('/quotes', async(req, res) => {
    const currentPage = req.query.page || 1;
    const listPerPage = 15;
    const offset = (currentPage - 1) * listPerPage;

    const allQuotes = await prisma.quote.findMany({
        include: { author: true },
        skip: offset,
        take: listPerPage,
    });

    res.json({
        data: allQuotes,
        meta: { page: currentPage }
    });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})