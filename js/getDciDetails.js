const {dbconn, dbstmt} = require('idb-connector');

 function getDciDetails (setletter, filiaal, klantnummer) {
	 
  return new Promise(function(resolve)
  {  
    const sSql = 'SELECT cimail, ciptel from dasfp'+ setletter + '.dci where cicust = '+ klantnummer + ' with NONE';
	
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
  getDciDetails: getDciDetails  };
