import axios from 'axios';

export default async function checkIfWalletExists(req, res) {
    const { walletAddress } = req.body;
    try {
        console.log(walletAddress);
        const data = JSON.stringify({
            "collection": "numberAddress",
            "database": "numbers",
            "dataSource": "Cluster0",
            "filter": {
                "walletAddress": walletAddress,
            }
        });

        // https://cors-anywhere.herokuapp.com/
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
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

