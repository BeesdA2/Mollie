const {dbconn, dbstmt} = require('idb-connector');

 function getInterfaceDetails (setletter, filiaal) {
	 
  return new Promise(function(resolve)
  {  
    const sSql = 'SELECT * 	from dasfp'+ setletter + '.filmol where mobrno = '+ filiaal + ' with NONE';
	
    const connection = new dbconn();
    connection.conn('*LOCAL');
    const statement = new dbstmt(connection);     
	
    statement.exec(sSql, (x) => {
    statement.close();
      connection.disconn();
      connection.close();
     
	resolve(x);    
	});
  });
 }
  
 module.exports = {
  getInterfaceDetails: getInterfaceDetails
  };
