import AWS from 'aws-sdk';

export async function up(ddb: AWS.DynamoDB) {
  // adding an entry in table at does not exist
  const params = {
    TableName: 'CUSTOMER',
    Item: {
      'CUSTOMER_ID': { N: '001' },
      'CUSTOMER_NAME': { S: 'dummy' }
    }
  };

  // Call DynamoDB to add the item to the table
  return new Promise((resolve, reject) => {
    ddb.putItem(params, function callback(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

}

export async function down(ddb: AWS.DynamoDB) {
  const params = {
    TableName: 'CUSTOMER',
    Item: {
      'CUSTOMER_ID': { N: '001' },
      'CUSTOMER_NAME': { S: 'dummy' }
    }
  };
  return new Promise((resolve, reject) => {
    ddb.putItem(params, function callback(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
