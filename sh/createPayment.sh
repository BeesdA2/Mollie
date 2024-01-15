echo "parameter 1" $1
echo "parameter 2" $2
echo "parameter 3" $3
echo "parameter 4" $4
echo "parameter 5" $5

export PATH=/QOpenSys/pkgs/lib/nodejs10/bin:$PATH;  
export LIBPATH=/QOpenSys/pkgs/lib/nodejs10/bin:$LIBPATH;
export NODE_PATH=/QOpenSys/pkgs/lib/nodejs10/node_modules:$NODE_PATH;
node -v;

node /Beesda2/NodeJS/Productie/Mollie/js/createPayment.js $1 $2 $3 $4 $5;
