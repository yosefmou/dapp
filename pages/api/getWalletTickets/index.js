import axios from 'axios';

export default async function getWalletTickets(req, res) {
    const { walletAddress } = req.body;
    try {
        const data = JSON.stringify({
            "collection": "numberAddress",
            "database": "numbers",
            "dataSource": "Cluster0",
            "filter": {
                "walletAddress": walletAddress,
            }
        });

        const config = {
            method: 'post',
            url: 'https://cors-anywhere.herokuapp.com/https://eu-central-1.aws.data.mongodb-api.com/app/data-floku/endpoint/data/v1/action/findOne',
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
            return res.status(200).json({ tickets: response.data.document.number });
        } else {
            return res.status(200).json({ tickets: false });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

