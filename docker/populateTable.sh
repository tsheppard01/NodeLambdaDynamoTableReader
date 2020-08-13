#!/bin/bash

for i in {1..10}
  do
    aws dynamodb put-item --profile local_testing_1 \
      --table-name users \
      --item '{
        "UserId": {"N": "'$i'"},
        "Email": {"S": "someone'$i'@email.com"}
      }' \
      --endpoint-url http://localhost:8000
  done