const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '_env')})
const async = require('async')
const fs = require('fs')
const rp = require('request-promise')
const moment = require('moment')

const projects = JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.CONFIG_FILE), 'utf8'))

var resultObject = {}

const fromDate = moment().day(-7).format('YYYY-MM-DD')
const toDate = moment().day(0).format('YYYY-MM-DD')
const dates = `%3E%3C${fromDate}|${toDate}`
const requestOptions = {
  'headers': {
    'X-Redmine-API-Key': process.env.REDMINE_API_KEY
  },
  'json': true,
  'url': ''
}

const getStockTickets = function getTickets (project) {
  return new Promise(
    (resolve, reject) => {
      const name = project.name
      const trackerIds = project.stock_ticket_types.join('|')
      const url = `${process.env.REDMINE_URL}?project_id=${project.id}&status_id=open&tracker_id=${trackerIds}`
      requestOptions.url = url
      rp(requestOptions)
        .then((res) => {
          if (resultObject[name]) {
            resolve(resultObject[name].open_issues = res.total_count)
          } else {
            resolve(resultObject[name] = {'open_issues': res.total_count})
          }
        })
        .catch((err) => reject(
          Error(err.message)
        )
      )
      // reject(Error('error'))
    }
  )
}

const getNewTickets = function getNewTickets (project) {
  return new Promise(
    (resolve, reject) => {
      const name = project.name
      const trackerIds = project.stock_ticket_types.join('|')
      const url = `${process.env.REDMINE_URL}?project_id=${project.id}&status_id=open&tracker_id=${trackerIds}`
      requestOptions.url = url
      resolve(
        rp(requestOptions)
        .then((res) => {
          if (resultObject[name]) {
            resultObject[name].open_issues = res.total_count
          } else {
            resultObject[name] = {'open_issues': res.total_count}
          }
          console.log(`Counting ${res.total_count} for ${name}.`)
        })
        .catch((err) => {
          console.log(err.message)
        })
      )
      reject(Error('error'))
    }
  )
}

async function getAll () {
  const stockItems = await Promise.all(
    getStockTickets
  )
  console.log(stockItems)
}

getAll()
