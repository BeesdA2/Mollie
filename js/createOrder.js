const { getInterfaceDetails } = require("./getInterfaceDetails.js");
const { getInvoiceDetails } = require("./getInvoiceDetails.js");
const { getBrancheDetails } = require("./getBrancheDetails.js");
const { getCustmDetails } = require("./getCustmDetails.js");
const { getDciDetails } = require("./getDciDetails.js");

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
 try{
  // Ophalen gegevens FILMOL 
  const respmol   = await getInterfaceDetails(setletter, filiaal);
  // Ophalen gegevens DOH
  const respinv   = await getInvoiceDetails(setletter, filiaal, ordernr);
  // Ophalen gegevens CONTRL_C
  const respbranche  = await getBrancheDetails(setletter, filiaal);
 

 let resultmol = await respmol;
 let resultinv = await respinv;
 let resultbranche = await respbranche;
 
 let klantnummer = resultinv[0].OHCUST;
  // Ophalen gegevens CUSTM
 const respCustm  = await getCustmDetails(setletter, filiaal, klantnummer);
 let resultCustm = await respCustm;
  // Ophalen gegevens DCI
 const respDci  = await getDciDetails(setletter, filiaal, klantnummer);
 let resultDci = await respDci;
 
 

// Informatie voor bericht createOrder samenstellen 
 

 let mollieUrl = resultmol[0].MOMURL.trim();
  mollieUrl = 'https://api.mollie.com/v2/orders';
 let apiToken  = resultmol[0].MOAPIK.trim();
 let redirectUrl = resultmol[0].MORURL.trim();
 let daysValid = resultmol[0].MODAYS.trim();
 
 let amount   =  resultinv[0].OHSUMT;
 let invoice  = resultinv[0].OHINVN;
 let consumer = resultinv[0].OHCUSN.trim();
 
 let name = resultbranche[0].RLFILN;
 let vatRate = '21.00';
 let vatAmountcalc = amount - (amount/1.21) ;
 let vatAmount = parseFloat(vatAmountcalc).toFixed(2);
 console.log('vatAmount '+ vatAmount);
 
 // klantgegevens ophalen
 let pbxcode = resultCustm[0].CPBX;
 let voorletters = resultCustm[0].CVLET;
 let voorvoegsel = resultCustm[0].CVOEG;
 let naam        = resultCustm[0].CNAAM1;
 let adres       = resultCustm[0].CADRES;
 let huisnummer  = resultCustm[0].CHUISN + resultCustm[0].CHUIST 
 let postcode    = resultCustm[0].CPOCO;
 let plaats      = resultCustm[0].CCITY;
 let land        = resultCustm[0].CLANDK;
 //let klantnummer = resultCustm[0].CCUSNO; 
 
 if ( adres === '')
  {
	adres = 'Onbekend';
 }
 if ( plaats === '')
  {
	plaats = 'Onbekend';
 }
 if ( land === '')
  {
	land = 'NL';
 } 
 
 
 let bedrijfsnaam          = '?';
 let particuliervGivenName = '?';
 let particulierFamilyName = '?'; 
 if ( pbxcode === 'B')
 {
  	 bedrijfsnaam = naam.trim() + ' (' + klantnummer + ')';
 } else {
     particuliervGivenName = voorletters;
     particulierFamilyName = voorvoegsel + ' ' + naam.trim()  + ' (' + klantnummer + ')';	 
 }
 if (particuliervGivenName === '')
 {
	particuliervGivenName = 'Onbekend'; 
 }	 
 if (particulierFamilyName === '')
 {
	particulierFamilyName = 'Onbekend'; 
 }	 
 let email =  resultDci[0].CIMAIL;
 let mobielnr = resultDci[0].CIPTEL;

 if (email === '')
 {
	 email='geen@mail.nl';
 }
 
 
// Uitvoeren webservice createPayment Mollie
 const resp3 = await createOrderRequest(mollieUrl, apiToken, redirectUrl, amount, invoice, klantnummer, vatRate, vatAmount, consumer, name, pbxcode, bedrijfsnaam, particuliervGivenName, particulierFamilyName, adres, huisnummer, postcode, plaats, land, email, mobielnr);
 let result3 = await resp3;

console.log("antwoord webservice:" + JSON.stringify(result3));	
// Benodigde gegevens uit antwoord webservice ophalen  

let expiresat = result3.expiresAt.substr(0,10) + '-' + result3.expiresAt.substr(11,8); 
const regex = /:/gi;
expiresat = expiresat.replace(regex, '.');
let paylink = result3._links.checkout.href;
//let qrlink    = result3.details.qrCode.src;
//let qrheight  = result3.details.qrCode.height;
//let qrwidth   = result3.details.qrCode.width;
console.log("paylink: " + paylink);
console.log("expiresAt: " + expiresat);
//console.log("qrlink: "  + qrlink); 
 
 // oude entry verwijderen DOHPAY 
  const resp4   = await deletePaymentDb(setletter, filiaal, ordernr);
  let result4 = await resp4;
 // Nieuwe entry aanmaken
 let qrlink= '';
 let qrheight= '';
 let qrwidth= '';
 
  const resp5   = await writePaymentDb(setletter, filiaal, ordernr, expiresat, paylink, qrlink, qrheight, qrwidth);
  
  } catch (e) {
        console.error(e);
    } finally {
        console.log('Mollie cleanup');
		return ({ message: 'Mollie succesvol uitgevoerd'});
    }
}

async function createOrderRequest (mollieUrl, apiToken, redirectUrl, amount, invoice, klantnummer, vatRate, vatAmount, consumer, name, pbxcode, bedrijfsnaam, particuliervGivenName, particulierFamilyName, adres, huisnummer, postcode, plaats, land, email, mobielnr) {
   
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
		billingAddress: {
			        
					organizationName: bedrijfsnaam,
					givenName: particuliervGivenName,
					familyName: particulierFamilyName,
                    					
					streetAndNumber: adres + ' ' + huisnummer,
					city: plaats,
					postalCode: postcode,
					country: land,
					email: email,
					 	
	},
	metadata: {
      order_id: invoice,
      description: 'Factuur/Klant ' + invoice + '/ ' + klantnummer,
    },
    locale: 'nl_NL',
    orderNumber: invoice,
    redirectUrl: redirectUrl,
    lines: [
      {
        type: 'physical',
        name: 'Factuur/Klant: ' + invoice + ' / ' + klantnummer,
        quantity: 1,
        vatRate: vatRate,
        unitPrice: {
          currency: 'EUR',
          value: amount,
        },
        totalAmount: {
          currency: 'EUR',
          value: amount,
        },
        vatAmount: {
          currency: 'EUR',
          value: vatAmount,
        }
      }
	]
	 
	};
	//console.log("data: " + data)	
		

        // set the headers
        const config = {
            headers: {
                'Authorization': 'bearer ' + apiToken
            }
        };

        const res = await axios.post(url, qs.stringify(data), config);
        return res.data;
    } catch (err) {
        console.error(err);
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
