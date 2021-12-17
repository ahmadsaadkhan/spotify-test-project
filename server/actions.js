export const createQuote = async(req, res) => {
    const authorName = req.body.author;
    const quote = {
        quote: req.body.quote
    };

    console.log(req.body.quote)

    if (!authorName || !quote.quote) {
        return res.status(400).json({ message: 'Either quote or author is missing' });
    }

    try {
        const message = 'quote created successfully';
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
        return res.status(500).json({ message: 'something went wrong' });
    }
}