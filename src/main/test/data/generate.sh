#!/bin/bash

echo `dirname $0`
cd `dirname $0`

rm ./mantisCA.p12 ./mantisCA.pem ./params.json ./password

export PW=`pwgen -Bs 10 1`
echo $PW > ./password

ISSUER=mantis-wallet-`pwgen -Bs 10 1`
DOMAIN=mantis-wallet-`pwgen -Bs 10 1`
IP="127.0.0.$((1 + $RANDOM % 255))"

keytool -genkeypair \
  -keystore mantisCA.p12 \
  -storetype PKCS12 \
  -dname "CN=$ISSUER" \
  -ext "san=ip:$IP,dns:$DOMAIN" \
  -keypass:env PW \
  -storepass:env PW \
  -keyalg RSA \
  -keysize 4096 \
  -validity 9999 \
  -ext KeyUsage:critical="keyCertSign" \
  -ext BasicConstraints:critical="ca:true"

openssl pkcs12 -in mantisCA.p12 -passin pass:${PW} -nokeys -out mantisCA.pem

FINGERPRINT=`openssl x509 -in mantisCA.pem -noout -sha256 -fingerprint | cut -d'=' -f2`

SERIAL=`openssl x509 -in mantisCA.pem -noout -serial | cut -d'=' -f2`

PARAMS="{
    \"password\": \"$PW\", \
    \"issuer\": \"$ISSUER\", \
    \"domain\": \"$DOMAIN\", \
    \"ip\": \"$IP\", \
    \"fingerprint\": \"$FINGERPRINT\", \
    \"serialNumber\": \"$SERIAL\" \
}"
echo $PARAMS > ./params.json
echo $PARAMS
