import axios from 'axios';

export default async function reset(req, res) {
    try {
        const data = JSON.stringify({
            "collection": "winnerTicket",
            "database": "numbers",
            "dataSource": "Cluster0",
            "filter": {},
        });

        const config = {
            method: 'post',
            url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-floku/endpoint/data/v1/action/deleteMany',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': 'zjs8v5lmfqUdwsESUIXiMGsni2bzLVYifMOIsqYoF19FupRC47xaNd5GDJodqjtA',
                'X-Requested-With': 'XMLHttpRequest',
            },
            data: data,
        };

        const response = await axios(config);
        if (response.data !== null) {
            return res.status(200).json({ reset: true });
        } else {
            return res.status(200).json({ reset: true });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

