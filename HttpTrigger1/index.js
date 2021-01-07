const appInsights = require("applicationinsights");
appInsights.setup("c31f189e-1e2b-4622-9f86-c8d0ad41f0b7")
    .setAutoCollectPerformance(false)
    .start();

const axios = require("axios");

/**
 * No changes required to your existing Function logic
 */
const httpTrigger = async function (context, req) {
    const response = await axios.get("https://azurenodefa5601.azurewebsites.net/api/HttpTrigger1");

    context.res = {
        status: response.status,
        body: response.statusText,
    };
};

// Default export wrapped with Application Insights FaaS context propagation
module.exports = async function (context, req) {
    // Start an AI Correlation Context using the provided Function context
    const correlationContext = appInsights.startOperation(context, req);

    // Wrap the Function runtime with correlationContext
    return appInsights.wrapWithCorrelationContext(async () => {
        const startTime = Date.now(); // Start trackRequest timer

        // Run the Function
        await httpTrigger(context, req);

        // Track Request on completion
        appInsights.defaultClient.trackRequest({
            name: context.req.method + " " + context.req.url,
            resultCode: context.res.status,
            success: true,
            url: req.url,
            duration: Date.now() - startTime,
            id: correlationContext.operation.parentId,
        });
        appInsights.defaultClient.flush();
    }, correlationContext)();
};

// module.exports = async function (context, req) {
//   context.log('JavaScript HTTP trigger function processed a request.');

//   //const name = (req.query.name || (req.body && req.body.name));
//   // const responseMessage = name
//   //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
//   //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

//   let myData = 'Done';

//   const options = {
//     hostname: 'azurenodefa5601.azurewebsites.net',
//     port: 443,
//     path: '/api/HttpTrigger1',
//     method: 'GET'
//   }

//   const req2 = https.request(options, res => {
//     console.log(`statusCode: ${res.statusCode}`)
  
//     res.on('data', d => {
//       process.stdout.write(d)
//     })
//   })
  
//   req2.on('error', error => {
//     console.error(error)
//   })
  
//   req2.end()

//   // Make a request for a user with a given ID
//   // https.get('https://azurenodefa5601.azurewebsites.net/api/HttpTrigger1', (resp) => {
//   //     let data = '';
    
//   //     // A chunk of data has been received.
//   //     resp.on('data', (chunk) => {
//   //       data += chunk;
//   //     });
    
//   //     // The whole response has been received. Print out the result.
//   //     resp.on('end', () => {
//   //       context.log(JSON.parse(data).explanation);
//   //     });
    
//   //   }).on("error", (err) => {
//   //     context.log("Error: " + err.message);
//   //   });

//   // const response = await axios({
//   //     url: `https://azurenodefa5601.azurewebsites.net/api/HttpTrigger1`,
//   //     method: "get"
//   // });
  
//   context.res = {
//       status: 200,
//       body: myData
//     };

//   // context.res = {
//   //     // status: 200, /* Defaults to 200 */
//   //     body: responseMessage
//   //};
// }