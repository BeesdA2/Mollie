const {dbconn, dbstmt} = require('idb-connector');

 function getInvoiceDetails (setletter, filiaal, ordernr) {
	 
  return new Promise(function(resolve)
  {  
    //const sSql = 'SELECT ohsumt, ohinvn, ohcusn, ohcust, digits(ohincc) ohincc, digits(ohinyy) ohinyy, digits(ohinmm) ohinmm, digits(ohindd) ohindd from dasfp'+ setletter + '.doh where ohbran = '+ filiaal + ' and ohordn = ' + ordernr + ' with NONE';
    const sSql = 'SELECT ohsumt, ohinvn, ohcusn, ohcust, ohincc, ohinyy, ohinmm, ohindd from dasfp'+ setletter + '.doh where ohbran = '+ filiaal + ' and ohordn = ' + ordernr + ' with NONE';
	
    const connection = new dbconn();
    connection.conn('*LOCAL');
    const statement = new dbstmt(connection);     
	
    statement.exec(sSql, (sqlresult) => {
    statement.close();
      connection.disconn();
      connection.close();
     
	resolve(sqlresult);    
	});
  });
 }
  
 module.exports = {
  getInvoiceDetails: getInvoiceDetails
  };
