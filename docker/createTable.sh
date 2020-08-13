#!/bin/bash

aws dynamodb create-table --profile local_testing_1 \
    --table-name users \
    --attribute-definitions  AttributeName=UserId,AttributeType=N \
    --key-schema AttributeName=UserId,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url http://localhost:8000 --region local


