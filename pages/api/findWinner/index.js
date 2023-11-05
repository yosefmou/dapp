import axios from 'axios';

export default async function findWinner(req, res) {
    const { ticket } = req.body;
    try {
        const data = JSON.stringify({
            "collection": "numberAddress",
            "database": "numbers",
            "dataSource": "Cluster0",
            "filter": {
                "number": {
                    "$elemMatch": { "number": ticket }
                  }
            }
        });

        const config = {
            method: 'post',
            url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-floku/endpoint/data/v1/action/findOne',
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
            return res.status(200).json({ winner: response.data.document.walletAddress });
        } else {
            return res.status(200).json({ winner: false });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

