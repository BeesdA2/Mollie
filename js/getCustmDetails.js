const {dbconn, dbstmt} = require('idb-connector');

 function getCustmDetails (setletter, filiaal, klantnummer) {
	 
  return new Promise(function(resolve)
  {  
    const sSql = 'SELECT * from dasfp'+ setletter + '.custm where ccusno = '+ klantnummer + ' with NONE';
	
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
  getCustmDetails: getCustmDetails  };
