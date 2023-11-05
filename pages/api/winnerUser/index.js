import axios from 'axios';

export default async function winnerUser(req, res) {
    const { winnerWallet, winnerTicketNumber } = req.body;
    try {
        const data = JSON.stringify({
            "collection": "winnerUser",
            "database": "numbers",
            "dataSource": "Cluster0",
            "document": {
                "walletAddress": winnerWallet,
                "ticket": winnerTicketNumber,
            }
        });

        const config = {
            method: 'post',
            url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-floku/endpoint/data/v1/action/insertOne',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': 'zjs8v5lmfqUdwsESUIXiMGsni2bzLVYifMOIsqYoF19FupRC47xaNd5GDJodqjtA',
                'X-Requested-With': 'XMLHttpRequest',
            },
            data: data,
        };

        const response = await axios(config);
        if (response.data.document !== null) {
            return res.status(200).json({ winner: true });
        } else {
            return res.status(200).json({ winner: false });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

