## install mongo db server
brew install mongodb-community@8.0
## start the service
mongod
## enable repica set on mongodb
mongo
rs.initiate()

