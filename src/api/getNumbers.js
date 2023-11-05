import axios from 'axios';

async function getNumbers() {
  try {
    const data = JSON.stringify({
      "collection": "numbers",
      "database": "numbers",
      "dataSource": "Cluster0",
    });

    const config = {
      method: 'post',
      url: 'https://cors-anywhere.herokuapp.com/https://eu-central-1.aws.data.mongodb-api.com/app/data-floku/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': 'zjs8v5lmfqUdwsESUIXiMGsni2bzLVYifMOIsqYoF19FupRC47xaNd5GDJodqjtA',
      },
      data: data,
    };

    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default getNumbers;
