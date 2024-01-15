const {dbconn, dbstmt} = require('idb-connector');

 function writePaymentDb(setletter, filiaal, ordernr, expiresat, paylink, qrlink, qrheight, qrwidth ) {
	 
  return new Promise(function(resolve)
  {  
    //const sSql = 'insert into dasfp'+ setletter + '.dohpay VALUES ( ' +filiaal + ', ' + ordernr + ', \'' + paylink + '\', now(), \'' + qrlink + '\', \'' + qrheight + '\', \'' + qrwidth + '\') with NONE';
	const sSql = 'insert into dasfp'+ setletter + '.dohpay VALUES ( ' +filiaal + ', ' + ordernr + ', \'' + paylink + '\', \'' + expiresat + '\' , \'' + qrlink + '\', \'' + qrheight + '\', \'' + qrwidth + '\') with NONE';
	console.log("sql insert dohpay: " + sSql);
    const connection = new dbconn();
    connection.conn('*LOCAL');
    const statement = new dbstmt(connection);     
	
    statement.execSync(sSql, (x) => {
    statement.close();
      connection.disconn();
      connection.close();
     
	resolve(x);    
	});
  });
 }

function deletePaymentDb(setletter, filiaal, ordernr) {
	 
  return new Promise(function(resolve)
  {  
    const sSql = 'delete from dasfp'+ setletter + '.dohpay where FILIAAL_NUMMER = ' + filiaal + ' and ORDER_NUMMER = ' + ordernr + ' with NONE';
	
    const connection = new dbconn();
    connection.conn('*LOCAL');
    const statement = new dbstmt(connection);     
	
    statement.execSync(sSql, (x) => {
    statement.close();
      connection.disconn();
      connection.close();
     
	resolve(x);    
	});
  });
 } 
  
 module.exports = {
  writePaymentDb: writePaymentDb,
  deletePaymentDb: deletePaymentDb
  };
 