#!/bin/bash
set -x
PASS_FILE="magen_keystore.pass"
KEYSTORE_FILE="magen.pfx"
IMAGE_TAG_FILE="image.tag"
ALIAS="magen"

GUES_PATH=/magen/hamagen-react-native


if [ -f $IMAGE_TAG_FILE ]; then
    IMAGETAG=$(cat $IMAGE_TAG_FILE);
else
    IMAGETAG=$(head -c 12 /dev/urandom | sha256sum | head -c 12);
    docker build . -t $IMAGETAG
    echo $IMAGETAG > $IMAGE_TAG_FILE;
fi

# Check we have the password.
if [ -f $PASS_FILE ]; then
    KEYSTORE_PASS=$(cat magen_keystore.pass);
else
    KEYSTORE_PASS=$(head -c 32 /dev/urandom | sha256sum | head -c 64);
    echo $KEYSTORE_PASS > $PASS_FILE;
fi

# Check we have the keystore.

if [ ! -f $KEYSTORE_FILE ]; then
    keytool -genkey -alias $ALIAS -keystore $KEYSTORE_FILE -storetype PKCS12 -keyalg RSA -keysize 4096 -storepass $KEYSTORE_PASS -keypass $KEYSTORE_PASS -validity 10000 -dname CN=IL;
fi

HAMAGEN_KEY_PASSWORD=$HAMAGEN_STORE_PASSWORD

KEYSTORE_FILE="$GUES_PATH/$KEYSTORE_FILE"
docker run -v `pwd`:$GUES_PATH $IMAGETAG bash -c \
    "cd ./android && \
    HAMAGEN_KEYSTORE_PATH=$KEYSTORE_FILE \
    HAMAGEN_KEY_PASSWORD=$KEYSTORE_PASS \
    HAMAGEN_STORE_PASSWORD=$KEYSTORE_PASS \
    HAMAGEN_KEY_ALIAS=$ALIAS \
    HAMAGEN_DEBUG_KEYSTORE_PATH=dummy \
    HAMAGEN_DEBUG_STORE_PASSWORD=dummy \
    HAMAGEN_DEBUG_KEY_ALIAS=dummy \
    HAMAGEN_DEBUG_KEY_PASSWORD=dummy \
    ./gradlew assembleRelease && \
    cp ./app/build/outputs/apk/release/app-release.apk ../";
