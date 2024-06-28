const dotenv = require("dotenv").config();
const { MongoClient } = require("mongodb");
const mysql = require("mysql2");

let mongodb;
let mysqldb;

const setup = async () => {
  // 이미 db 접속 정보가 존재하는 경우 해당 객체를 바로 반환
  if (mongodb && mysqldb) {
    return { mongodb, mysqldb };
  }

  try {
    const mongoDbUrl = process.env.MONGODB_URL;
    const mongoConn = await MongoClient.connect(mongoDbUrl);
    mongodb = mongoConn.db(process.env.MONGODB_DB);

    mysqldb = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    });
    mysqldb.connect();

    return { mongodb, mysqldb };
  } catch (err) {
    console.log("db 접속 실패");
    throw err;
  }
};

module.exports = setup;
