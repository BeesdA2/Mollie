const { getInterfaceDetails } = require("./getInterfaceDetails.js");
const { getInvoiceDetails } = require("./getInvoiceDetails.js");
const { getBrancheDetails } = require("./getBrancheDetails.js");

const { writePaymentDb } = require("./handlePaymentDb.js");
const { deletePaymentDb } = require("./handlePaymentDb.js");

const axios = require('axios');
const qs = require('qs');


 
// Ophalen parameters	
var setletter  = process.argv[2];
var filiaal    = process.argv[3];
var ordernr    = process.argv[4];
 
	   
// Wegschrijven naar log 	
//console.log('setletter: '  + setletter ); 
//console.log('filiaal: '    + filiaal   ); 
//console.log('ordernummer: '     + ordernr   ); 

async function handlePaymentMollie(setletter, filiaal, ordernr) {
 try {
  // Ophalen gegevens FILMOL 
  const respmol   = await getInterfaceDetails(setletter, filiaal);
  // Ophalen gegevens DOH
  const respinv   = await getInvoiceDetails(setletter, filiaal, ordernr);
  // Ophalen gegevens CONTRL_C
  const respbranche  = await getBrancheDetails(setletter, filiaal);

 let resultmol = await respmol;
 let resultinv = await respinv;
 let resultbranche = await respbranche;

// Informatie voor bericht createPayment samenstellen 
 let mollieUrl = resultmol ? resultmol[0].MOMURL.trim() : [];
 mollieUrl = 'https://api.mollie.com/v2/payment-links';
 let apiToken  = resultmol ? resultmol[0].MOAPIK.trim() : [];
 let redirectUrl = resultmol ? resultmol[0].MORURL.trim() : [];
 let daysValid = resultmol ? resultmol[0].MODAYS.trim() : [];
 
 let amount   = resultinv ? resultinv[0].OHSUMT : [];
 let invoice  = resultinv ? resultinv[0].OHINVN : [];
 let klnr     = resultinv ? resultinv[0].OHCUST : [];
 
const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

const invoice_date = dd + '.' + mm + '.' + yyyy;

 let consumer = resultinv ? resultinv[0].OHCUSN.trim() : [];
 
 let name = resultbranche[0].RLFILN  ;
  
 //console.log('name: '+ name);
  
// Uitvoeren webservice createPayment Mollie
 const resp3 = await createRequest(mollieUrl, apiToken, redirectUrl, amount, invoice, klnr, invoice_date, daysValid, consumer, name);
 let result3 = await resp3;
 
//console.log("antwoord webservice:" + JSON.stringify(resp3));
 	
// Benodigde gegevens uit antwoord webservice ophalen  

//let expiresat = result3.expiresAt.substr(0,10) + '-' + result3.expiresAt.substr(11,8); 
//const regex = /:/gi;
//expiresat = expiresat.replace(regex, '.');
 
//console.log('test3 :' +result3._links.paymentLink.type);

let expiresat = '2021-01-01-12.00.20.000000';
let paylink = result3._links.paymentLink.href;
let qrlink= '';
let qrheight = '';
let qrwidth = '';
//let qrlink    = result3.details.qrCode.src;
//let qrheight  = result3.details.qrCode.height;
//let qrwidth   = result3.details.qrCode.width;
//console.log("paylink: " + paylink);
//console.log("expiresAt: " + expiresat);
//console.log("qrlink: "  + qrlink); 
 
 // oude entry verwijderen DOHPAY 
  const resp4   = await deletePaymentDb(setletter, filiaal, ordernr);
  let result4 = await resp4;
 // Nieuwe entry aanmaken
  const resp5   = await writePaymentDb(setletter, filiaal, ordernr, expiresat, paylink, qrlink, qrheight, qrwidth);
  
  } catch (e) {
        console.error('handlePaymentMollie error: ' +e);
    } finally {
        console.log('Mollie cleanup');
		return ({ message: 'Mollie succesvol uitgevoerd'});
    }
}

async function createRequest (mollieUrl, apiToken, redirectUrl, amount, invoice, klnr, invoice_date,  daysValid, consumer, name) {
   
	try {
        // set the url
        const url = mollieUrl;

        // request data object
        const data = 
		{
       amount: {
       currency : "EUR",
       value : amount 
    },
    description: 'Factuur/Klant/F.datum: ' + invoice + '/' + klnr  + '/' + invoice_date ,
	
	 redirectUrl: redirectUrl,
	};
	//nsole.log("data: " + data)	
		

        // set the headers
		//	testmode: true kan in headers gezet worden.
        const config = {
            headers: {
                'Authorization': 'bearer ' + apiToken,
			
            }
        };
        //nsole.log('data: ' + qs.stringify(data));
        const res = await axios.post(url, qs.stringify(data), config);
		
        return res.data;
    } catch (err) {
        console.log('createRequet mollie error: '+ err);
    }
	
};

handlePaymentMollie(setletter, filiaal, ordernr);

async function molliePayments (setletter, filiaal, ordernr)
{
	var resolve =await handlePaymentMollie(setletter, filiaal, ordernr);
    return resolve;
}

module.exports = {
  molliePayments: molliePayments
  };
