#!/bin/bash

function usage()
{
    echo "Usage: picsum  WIDTH HEIGHT"
    echo "picsum is a client of the picsum.photos API (http://picsum.photos/)"
    echo "Get a random image from picsum and save it as WIDTHxHEIGHTxID.jpg"
    echo
    echo "    WIDTH - positive integer that represents the width of the image"
    echo "    HEIGHT - positive integer that represents the height of the image"

}

BASE_URL="https://picsum.photos"

if [ $# -ne 2 ]
then
    usage
    exit 1
fi

WIDTH=$1
HEIGHT=$2

URL=$(curl -i --silent $BASE_URL/$WIDTH/$HEIGHT?random  | grep -e "^location: " | sed 's/^location: //g' | LC_ALL=C cat -vt | tr -d '^M')
ID=$(echo $URL | grep -oe "id/[0-9]*" | sed 's/id\///g')
FILENAME="${ID}_${WIDTH}_${HEIGHT}.jpg"

echo "[${URL}]"
curl "$URL" --output $FILENAME
echo $FILENAME

# curl "https://fastly.picsum.photos/id/534/800/600.jpg?hmac=Y1tfrqoUorsaytGK-alxu5DwWYG9wRbsXuaejW3RIOU"
