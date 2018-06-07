#! /bin/sh

HOOK_NAME=sails-hook-redbox-omero
PORTAL_DIR=/opt/hooks/${HOOK_NAME}
PORTAL_IMAGE=qcifengineering/redbox-portal:latest

chmod +x *.sh
source ./buildFns.sh

#linkNodeLib "lodash" "lodash-lib"
cleanUpAllJs
docker run -it --rm -v $PWD:$PORTAL_DIR $PORTAL_IMAGE /bin/bash -c "cd $PORTAL_DIR; npm link && npm link ${HOOK_NAME} yarn global add typings && yarn install"
